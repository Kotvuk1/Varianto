// POST /api/ai/explain: валидация, лимиты, вызов MiniMax, проверка подлинности модели, учёт стоимости.
import { randomUUID } from 'node:crypto';
import { RateLimiter, clientKey } from '../rate-limit';
import { buildMessages } from './prompt';
import { DEFAULT_BASE_URL, DEFAULT_MODEL, MiniMaxError, callMiniMax } from './minimax';
import { MAX_BODY_BYTES, explainSchema } from './schemas';

export const COOKIE = 'tl_ai';
const DEFAULT_DAILY_LIMIT = 100;

export type AiErrorCode =
  | 'feature_disabled'
  | 'validation_failed'
  | 'payload_too_large'
  | 'rate_limited'
  | 'daily_limit'
  | 'ai_unavailable'
  | 'ai_timeout';

export interface AiDeps {
  env: () => NodeJS.ProcessEnv;
  fetch: typeof fetch;
  now: () => number;
  minute: RateLimiter;
  day: DailyCounter;
  cost: CostLedger;
}

/** Счётчик вопросов за UTC-сутки (в памяти инстанса; на serverless лимит приблизительный). */
export class DailyCounter {
  private day = '';
  private counts = new Map<string, number>();
  constructor(private readonly maxKeys = 5000) {}
  /** true, если вопрос засчитан; false, если лимит исчерпан. */
  take(key: string, limit: number, nowMs: number): boolean {
    const d = new Date(nowMs).toISOString().slice(0, 10);
    if (d !== this.day) {
      this.day = d;
      this.counts.clear();
    }
    const n = this.counts.get(key) ?? 0;
    if (n >= limit) return false;
    if (this.counts.size >= this.maxKeys && !this.counts.has(key)) this.counts.delete(this.counts.keys().next().value as string);
    this.counts.set(key, n + 1);
    return true;
  }
}

/** Суммарные токены и стоимость за UTC-сутки для лога. */
export class CostLedger {
  private day = '';
  total = { requests: 0, promptTokens: 0, completionTokens: 0, usd: 0 };
  add(nowMs: number, promptTokens: number, completionTokens: number, priceIn: number, priceOut: number) {
    const d = new Date(nowMs).toISOString().slice(0, 10);
    if (d !== this.day) {
      this.day = d;
      this.total = { requests: 0, promptTokens: 0, completionTokens: 0, usd: 0 };
    }
    const usd = (promptTokens * priceIn + completionTokens * priceOut) / 1_000_000;
    this.total.requests += 1;
    this.total.promptTokens += promptTokens;
    this.total.completionTokens += completionTokens;
    this.total.usd += usd;
    return { usd, day: d, total: { ...this.total } };
  }
}

const positive = (v: string | undefined, def: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};

export const aiEnabled = (env: NodeJS.ProcessEnv): boolean => Boolean(env.MINIMAX_API_KEY?.trim());

function err(status: number, code: AiErrorCode, message: string, headers: Record<string, string> = {}): Response {
  return Response.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function readCookieId(req: Request): string | null {
  const m = /(?:^|;\s*)tl_ai=([0-9a-f-]{36})(?:;|$)/.exec(req.headers.get('cookie') ?? '');
  return m ? m[1]! : null;
}

export async function handleExplain(req: Request, deps: AiDeps): Promise<Response> {
  const env = deps.env();
  if (!aiEnabled(env)) return err(404, 'feature_disabled', 'AI is not enabled');

  const cookieId = readCookieId(req);
  const id = cookieId ?? randomUUID();
  const setCookie: Record<string, string> = cookieId
    ? {}
    : { 'Set-Cookie': `${COOKIE}=${id}; Path=/api/ai; Max-Age=31536000; HttpOnly; SameSite=Lax${env.NODE_ENV === 'production' ? '; Secure' : ''}` };
  const key = `${clientKey(req.headers)}|${id}`;

  const min = deps.minute.take(key);
  if (!min.ok) return err(429, 'rate_limited', 'Too many questions', { ...setCookie, 'Retry-After': String(min.retryAfterSec) });

  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return err(413, 'payload_too_large', 'Body too large', setCookie);
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return err(413, 'payload_too_large', 'Body too large', setCookie);
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return err(400, 'validation_failed', 'Invalid JSON', setCookie);
  }
  const parsed = explainSchema.safeParse(json);
  if (!parsed.success) return err(400, 'validation_failed', 'Invalid request', setCookie);

  const limit = Math.floor(positive(env.AI_DAILY_LIMIT, DEFAULT_DAILY_LIMIT));
  if (!deps.day.take(key, limit, deps.now())) return err(429, 'daily_limit', 'Daily AI limit reached', setCookie);

  const requested = env.MINIMAX_MODEL?.trim() || DEFAULT_MODEL;
  try {
    const r = await callMiniMax(
      { apiKey: env.MINIMAX_API_KEY!.trim(), model: requested, baseUrl: env.MINIMAX_BASE_URL?.trim() || DEFAULT_BASE_URL, messages: buildMessages(parsed.data) },
      deps.fetch,
    );
    const modelMismatch = r.model !== requested;
    const c = deps.cost.add(deps.now(), r.usage.promptTokens, r.usage.completionTokens, positive(env.MINIMAX_PRICE_IN, 0.15), positive(env.MINIMAX_PRICE_OUT, 0.6));
    // Без текста вопроса/ответа и без ключа.
    console.info('[ai] ok', JSON.stringify({ requested, model: r.model, requestId: r.id, usage: r.usage, costUsd: +c.usd.toFixed(6) }));
    console.info('[ai] day-total', JSON.stringify({ day: c.day, ...c.total, usd: +c.total.usd.toFixed(6) }));
    if (modelMismatch) console.warn('[ai] model mismatch', JSON.stringify({ requested, model: r.model, requestId: r.id }));
    return Response.json(
      { answer: r.answer, model: r.model, usage: r.usage, ...(modelMismatch ? { modelMismatch: true } : {}) },
      { headers: { 'Cache-Control': 'no-store', ...setCookie } },
    );
  } catch (e) {
    const kind = e instanceof MiniMaxError ? e.kind : 'unknown';
    console.error('[ai] upstream error', kind, e instanceof MiniMaxError ? e.detail : '');
    return kind === 'timeout'
      ? err(504, 'ai_timeout', 'AI timed out', setCookie)
      : err(502, 'ai_unavailable', 'AI is unavailable', setCookie);
  }
}

let singleton: AiDeps | undefined;
export function getAiDeps(): AiDeps {
  singleton ??= {
    env: () => process.env,
    fetch: (...a) => fetch(...a),
    now: () => Date.now(),
    minute: new RateLimiter({ capacity: 10, refillPerMin: 10 }),
    day: new DailyCounter(),
    cost: new CostLedger(),
  };
  return singleton;
}
