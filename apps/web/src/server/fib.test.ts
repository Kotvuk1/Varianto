// @vitest-environment node
// Fibonacci API на реальных фикстурах BTCUSDT 1h (август-сентябрь 2026), без сети: next/grade для grid, reaction, extension.
import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { FixtureLoader } from './fixture-loader';
import { handleGrade, handleNext, type HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';

const SECRET = 'integration-secret-0123456789abcdef';
const NOW = Date.UTC(2026, 10, 3, 3);
const H = 3_600_000;
const loader = new FixtureLoader();
const deps = (over: Partial<HandlerDeps> = {}): HandlerDeps => ({
  loader, now: () => NOW, newSeed: () => 1, secret: SECRET,
  range: { from: Date.UTC(2026, 7, 1), to: Date.UTC(2026, 9, 1) },
  limiter: new RateLimiter({ capacity: 1000, now: () => NOW }),
  ...over,
});
const post = (path: string, body: unknown) =>
  new Request(`http://localhost${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const next = async (body: Json, d = deps()) => {
  const res = await handleNext(post('/api/tasks/fibonacci/next', { module: 'fibonacci', symbol: 'BTCUSDT', tf: '1h', ...body }), 'fibonacci', d);
  return { res, json: (await res.json()) as Json };
};
const grade = async (body: unknown, d = deps()) => {
  const res = await handleGrade(post('/api/tasks/fibonacci/grade', body), 'fibonacci', d);
  return { res, json: (await res.json()) as Json };
};
const seeds = (taskType: string, difficulty: string, from = 1) => {
  // перебираем seed, пока next не вернёт 200
  return async () => {
    for (let s = from; s < from + 40; s++) {
      const r = await next({ taskType, difficulty }, deps({ newSeed: () => s }));
      if (r.res.status === 200) return r.json;
    }
    throw new Error(`нет задания ${taskType}/${difficulty}`);
  };
};
const userMark = (kind: Mark['kind'], pts: { time: number; price: number }[]): Mark => ({ id: 'u1', kind, anchors: pts, scope: null, direction: null, author: 'user' });

/** Все числа-времена (мс UTC) в объекте. */
function times(x: unknown, out: number[] = []): number[] {
  if (typeof x === 'number') { if (x > 1e12) out.push(x); }
  else if (Array.isArray(x)) x.forEach((v) => times(v, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((v) => times(v, out));
  return out;
}

describe('fibonacci/next', () => {
  it('grid: абсолютная шкала, только закрытые свечи до T, подписанный токен', async () => {
    const t = await seeds('grid', 'medium')();
    expect(t.module).toBe('fibonacci');
    expect(t.timeline.mode).toBe('absolute');
    expect(t.payload.kind).toBe('fib-grid');
    expect(t.payload.tools).toEqual(['fib-retracement']);
    const s: Candle[] = t.series['1h'];
    expect(s).toHaveLength(500);
    expect(s.every((c) => c.closed)).toBe(true);
    expect(s[s.length - 1]!.closeTime).toBeLessThan(t.decisionTime);
    expect(t.payload.window.toTime).toBe(s[s.length - 1]!.openTime);
    expect(typeof t.taskToken).toBe('string');
  });

  for (const taskType of ['reaction', 'extension'] as const) {
    it(`${taskType}: relative-шкала, нет будущего и реальных дат (инвариант)`, async () => {
      const t = await seeds(taskType, 'hard')();
      expect(t.timeline.mode).toBe('relative');
      expect(t.payload.kind).toBe(`fib-${taskType}`);
      const s: Candle[] = t.series['1h'];
      expect(s).toHaveLength(500);
      // шкала сдвинута на целое число суток: сетка 1h сохранена, дата далеко от реальной (2026)
      expect(s[0]!.openTime).toBeLessThan(Date.UTC(2024, 0, 1));
      expect(s[s.length - 1]!.openTime % H).toBe(0);
      const last = s[s.length - 1]!.openTime;
      for (const x of times(t.payload)) expect(x).toBeLessThanOrEqual(last);
      expect(JSON.stringify(t)).not.toMatch(/2026-0[789]/);
      for (const x of times(t.payload)) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
      expect(JSON.stringify(t.payload)).not.toContain('algo:fib-'); // id метки не раскрывают реальное время
    });
  }

  it('валидация: неизвестный taskType и лишние поля -> 400', async () => {
    expect((await next({ taskType: 'x', difficulty: 'easy' })).res.status).toBe(400);
    expect((await next({ taskType: 'grid', difficulty: 'easy', extra: 1 })).res.status).toBe(400);
  });
});

describe('fibonacci/grade: цикл next -> grade', () => {
  it('grid: сетка по эталону из payload.window (магнит на экстремумы) оценивается; неверный ответ - 0', async () => {
    const t = await seeds('grid', 'easy')();
    const s: Candle[] = t.series['1h'];
    const hint = t.payload.directionHint as 'bull' | 'bear';
    // ищем импульс по подсказке направления: экстремумы окна
    const from = s.findIndex((c) => c.openTime === t.payload.window.fromTime);
    const win = s.slice(from);
    const bull = hint === 'bull';
    const iA = win.reduce((m, c, i) => ((bull ? c.low < win[m]!.low : c.high > win[m]!.high) ? i : m), 0);
    const iB = win.reduce((m, c, i) => ((bull ? c.high > win[m]!.high : c.low < win[m]!.low) ? i : m), 0);
    const mark = userMark('fib-retracement', [
      { time: win[iA]!.openTime, price: bull ? win[iA]!.low : win[iA]!.high },
      { time: win[iB]!.openTime, price: bull ? win[iB]!.high : win[iB]!.low },
    ]);
    const r = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-grid', mark } });
    expect(r.res.status).toBe(200);
    expect(r.json.module).toBe('fibonacci');
    expect(r.json.detail.kind).toBe('fib-grid');
    expect(r.json.detail.fib.anchors).toHaveLength(2);
    expect(r.json.verdict).toBe('correct');
    expect(r.json.reference[0].kind).toBe('fib-retracement');
    expect(r.json.skillOutcomes).toEqual([{ skill: 'fib-anchor', correct: 2, total: 2 }]);
    expect(r.json.replay).toBeUndefined();

    const bad = userMark('fib-retracement', [
      { time: win[iB]!.openTime, price: 2 },
      { time: win[iA]!.openTime, price: 1 },
    ]);
    const r2 = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-grid', mark: bad } });
    expect(r2.json.verdict).toBe('incorrect');
  });

  it('grid: якорь вне ряда -> 400 FIB_ANCHOR_OUT_OF_RANGE; неверное число якорей -> 400 FIB_ANCHORS_COUNT; ответ другого вида -> 400', async () => {
    const t = await seeds('grid', 'medium')();
    const s: Candle[] = t.series['1h'];
    const k = s[s.length - 3]!;
    const out = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-grid', mark: userMark('fib-retracement', [{ time: k.openTime, price: 1 }, { time: Date.UTC(2000, 0, 1), price: 2 }]) } });
    expect(out.res.status).toBe(400);
    expect(out.json.error.details.issues[0].code).toBe('FIB_ANCHOR_OUT_OF_RANGE');
    const cnt = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-grid', mark: userMark('fib-retracement', [{ time: k.openTime, price: 1 }]) } });
    expect(cnt.json.error.details.issues[0].code).toBe('FIB_ANCHORS_COUNT');
    const wrong = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-reaction', option: '0.5', confluence: [], pd: null } });
    expect(wrong.res.status).toBe(400);
  });

  it('reaction: оценка, replay на шкале задания, reference и feedback без чужих дат', async () => {
    const t = await seeds('reaction', 'hard')();
    const opts: string[] = t.payload.options;
    const asked = t.payload.pdQuestion !== null;
    const r = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-reaction', option: opts[0], confluence: [], pd: asked ? 'premium' : null } });
    expect(r.res.status).toBe(200);
    expect(r.json.detail.kind).toBe('fib-reaction');
    expect(r.json.detail.fib.reaction.correctOptions.length).toBeGreaterThan(0);
    const s: Candle[] = t.series['1h'];
    const last = s[s.length - 1]!.openTime;
    expect(r.json.replay.tf).toBe('1h');
    expect(r.json.replay.candles[0].openTime).toBe(last + H); // проигрывание продолжает видимый ряд на шкале задания
    for (const x of times({ reference: r.json.reference, replay: r.json.replay, detail: r.json.detail, errors: r.json.errors })) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
    // раскрытие реальной даты - только reveal
    expect(r.json.task.reveal.shiftMs).not.toBe(0);
    // недоступный вариант -> 400
    const bad = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-reaction', option: opts.includes('0.382') ? 'ote' : '0.382', confluence: [], pd: asked ? 'premium' : null } });
    if (!opts.includes(opts.includes('0.382') ? 'ote' : '0.382')) {
      expect(bad.json.error.details.issues[0].code).toBe('FIB_OPTION_UNAVAILABLE');
    }
    // несоответствие PD: задан ответ при pdQuestion = null либо пропущен при заданном
    const pd = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-reaction', option: opts[0], confluence: [], pd: asked ? null : 'discount' } });
    expect(pd.json.error.details.issues[0].code).toBe('FIB_PD_MISMATCH');
    // конфлюэнс: дубликаты -> 400
    const dup = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-reaction', option: opts[0], confluence: ['fvg', 'fvg'], pd: asked ? 'premium' : null } });
    expect(dup.json.error.details.issues[0].code).toBe('FIB_CONFLUENCE_INVALID');
  });

  it('extension: точки на сдвинутой шкале пересчитываются, replay и detail на шкале задания', async () => {
    const t = await seeds('extension', 'hard')();
    const s: Candle[] = t.series['1h'];
    const w = t.payload.window;
    const from = s.findIndex((c) => c.openTime === w.fromTime);
    const mark = userMark('fib-extension', [0, 1, 2].map((i) => ({ time: s[from + 3 * i]!.openTime, price: 100 + i })));
    const r = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-extension', mark, target: t.payload.targetOptions[0] } });
    expect(r.res.status).toBe(200);
    expect(r.json.detail.fib.anchors).toHaveLength(3);
    expect(r.json.detail.fib.extension.reached).toMatch(/^(none|1|1\.272|1\.618)$/);
    expect(r.json.reference[0].kind).toBe('fib-extension');
    const last = s[s.length - 1]!.openTime;
    expect(r.json.replay.candles[0].openTime).toBe(last + H);
    const badTarget = await grade({ taskToken: t.taskToken, answer: { kind: 'fib-extension', mark, target: t.payload.targetOptions.includes('none') ? '2' : 'none' } });
    expect(badTarget.res.status).toBe(400);
  });

  it('токен другого модуля и подделка -> ошибка; токен fibonacci не принимается challenge-обработчиком', async () => {
    const t = await seeds('grid', 'medium')();
    const res = await handleGrade(post('/api/tasks/challenge/grade', { taskToken: t.taskToken, answer: { kind: 'fib-grid', mark: userMark('fib-retracement', [{ time: 1, price: 1 }, { time: 2, price: 2 }]) } }), 'challenge', deps());
    expect(res.status).toBe(400);
    const forged = await grade({ taskToken: t.taskToken.slice(0, -3) + 'AAA', answer: { kind: 'fib-reaction', option: '0.5', confluence: [], pd: null } });
    expect(forged.res.status).toBe(401);
  });
});
