import { afterEach, describe, expect, it, vi } from 'vitest';
import { RateLimiter } from '../rate-limit';
import { buildMessages, redactDates } from './prompt';
import { explainSchema } from './schemas';
import { CostLedger, DailyCounter, aiEnabled, handleExplain, type AiDeps } from './service';

const ctx = {
  module: 'fib',
  grade: { errors: ['FIB_WRONG_ANCHOR'], okCodes: ['FIB_DIR'] },
  feedback: 'Якорь выбран неверно. Свинг 2024-03-14T12:00:00Z, 14 мар., 12:00; ts 1710417600000.',
};
const body = (over: object = {}) => JSON.stringify({ attemptContext: ctx, question: 'Почему ошибка?', history: [], ...over });
// Формат ответа по документации MiniMax (OpenAI Chat Completions): platform.minimax.io/docs/api-reference/text-chat
const mmOk = (model = 'MiniMax-M3.1-Flash') => ({
  id: 'req-1',
  choices: [{ finish_reason: 'stop', index: 0, message: { content: '<think>x</think>Ответ.', role: 'assistant' } }],
  model,
  object: 'chat.completion',
  usage: { total_tokens: 484, prompt_tokens: 172, completion_tokens: 312 },
  base_resp: { status_code: 0, status_msg: '' },
});

function mk(env: Record<string, string>, fetchImpl: typeof fetch, now = () => Date.UTC(2026, 10, 7)): AiDeps {
  return {
    env: () => env as unknown as NodeJS.ProcessEnv,
    fetch: fetchImpl,
    now,
    minute: new RateLimiter({ capacity: 10, refillPerMin: 10, now }),
    day: new DailyCounter(),
    cost: new CostLedger(),
  };
}
const post = (b: string, headers: Record<string, string> = {}) =>
  new Request('http://x/api/ai/explain', { method: 'POST', body: b, headers: { 'x-real-ip': '1.1.1.1', ...headers } });
const okFetch = (m?: string) => vi.fn(async () => Response.json(mmOk(m))) as unknown as typeof fetch;

afterEach(() => vi.restoreAllMocks());

describe('схемы', () => {
  it('принимает валидный вход и отклоняет длинный вопрос, 7 реплик и лишние поля', () => {
    expect(explainSchema.safeParse(JSON.parse(body())).success).toBe(true);
    expect(explainSchema.safeParse(JSON.parse(body({ question: 'a'.repeat(501) }))).success).toBe(false);
    const h = Array.from({ length: 7 }, () => ({ role: 'user', content: 'q' }));
    expect(explainSchema.safeParse(JSON.parse(body({ history: h }))).success).toBe(false);
    expect(explainSchema.safeParse(JSON.parse(body({ extra: 1 }))).success).toBe(false);
  });
});

describe('промпт', () => {
  it('не содержит абсолютных дат (скрытые модули)', () => {
    const msgs = buildMessages(explainSchema.parse(JSON.parse(body({ question: 'Что было 14 мар. в 12:00?' }))));
    const all = msgs.map((m) => m.content).join('\n');
    expect(all).not.toMatch(/2024|1710417600000|14 мар|12:00/);
    expect(msgs[0]!.content).toMatch(/ТОЛЬКО на основе/);
    expect(redactDates('2026-01-02 и 03.04.2025')).not.toMatch(/\d{4}/);
  });
});

describe('handleExplain', () => {
  it('выключено без ключа: 404 feature_disabled, fetch не вызывается', async () => {
    const f = okFetch();
    const res = await handleExplain(post(body()), mk({}, f));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('feature_disabled');
    expect(f).not.toHaveBeenCalled();
    expect(aiEnabled({ MINIMAX_API_KEY: ' ' } as unknown as NodeJS.ProcessEnv)).toBe(false);
  });

  it('успех: ответ, модель, usage; think вырезан; ключ только в заголовке запроса', async () => {
    const f = okFetch();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const res = await handleExplain(post(body()), mk({ MINIMAX_API_KEY: 'sk-secret' }, f));
    const j = await res.json();
    expect(j).toEqual({ answer: 'Ответ.', model: 'MiniMax-M3.1-Flash', usage: { promptTokens: 172, completionTokens: 312, totalTokens: 484 } });
    expect(JSON.stringify(j)).not.toContain('sk-secret');
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.minimax.io/v1/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-secret');
    expect(JSON.parse(init.body as string).model).toBe('MiniMax-M3.1-Flash');
    expect(res.headers.get('set-cookie')).toMatch(/^tl_ai=.*HttpOnly/);
  });

  it('modelMismatch: другая модель в ответе помечается и логируется warning, ключ не в логах', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await handleExplain(post(body()), mk({ MINIMAX_API_KEY: 'sk-secret' }, okFetch('Other-Model')));
    expect((await res.json()).modelMismatch).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    const logs = JSON.stringify([...info.mock.calls, ...warn.mock.calls]);
    expect(logs).not.toContain('sk-secret');
    expect(logs).not.toContain('Почему ошибка');
  });

  it('стоимость суммируется за сутки по ценам из env', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const d = mk({ MINIMAX_API_KEY: 'k', MINIMAX_PRICE_IN: '1', MINIMAX_PRICE_OUT: '2' }, okFetch());
    await handleExplain(post(body()), d);
    await handleExplain(post(body()), d);
    expect(d.cost.total.requests).toBe(2);
    expect(d.cost.total.usd).toBeCloseTo(2 * (172 * 1 + 312 * 2) / 1e6, 9);
  });

  it('суточный лимит на IP+cookie и 10/мин', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const id = '11111111-1111-1111-1111-111111111111';
    const d = mk({ MINIMAX_API_KEY: 'k', AI_DAILY_LIMIT: '2' }, okFetch());
    const h = { cookie: `tl_ai=${id}` };
    expect((await handleExplain(post(body(), h), d)).status).toBe(200);
    expect((await handleExplain(post(body(), h), d)).status).toBe(200);
    const third = await handleExplain(post(body(), h), d);
    expect(third.status).toBe(429);
    expect((await third.json()).error.code).toBe('daily_limit');
    const d2 = mk({ MINIMAX_API_KEY: 'k', AI_DAILY_LIMIT: '1000' }, okFetch());
    let last = 200;
    for (let i = 0; i < 11; i++) last = (await handleExplain(post(body(), h), d2)).status;
    expect(last).toBe(429);
  });

  it('валидация 400, большое тело 413, таймаут 504, ошибка API 502', async () => {
    const env = { MINIMAX_API_KEY: 'k' };
    expect((await handleExplain(post('{bad'), mk(env, okFetch()))).status).toBe(400);
    expect((await handleExplain(post(body({ question: '' })), mk(env, okFetch()))).status).toBe(400);
    expect((await handleExplain(post('x'.repeat(30_000)), mk(env, okFetch()))).status).toBe(413);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const to = vi.fn(async () => {
      throw Object.assign(new Error('t'), { name: 'TimeoutError' });
    }) as unknown as typeof fetch;
    expect((await handleExplain(post(body()), mk(env, to))).status).toBe(504);
    const bad = vi.fn(async () => Response.json({ ...mmOk(), base_resp: { status_code: 1008, status_msg: 'insufficient balance' } })) as unknown as typeof fetch;
    const r = await handleExplain(post(body()), mk(env, bad));
    expect(r.status).toBe(502);
    expect(JSON.stringify(await r.json())).not.toContain('balance');
  });
});
