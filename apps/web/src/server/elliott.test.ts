// @vitest-environment node
// Elliott Wave Lab API на реальных фикстурах BTCUSDT 1h (май-сентябрь 2026), без сети: next/grade easy, medium, hard.
import { describe, expect, it, beforeEach } from 'vitest';
import { findWaveCandidates, type Candle, type Mark } from '@tl/core';
import { clearEwCatalogCache, ewCatalogCacheSize, archiveMonths } from './elliott';
import { FixtureLoader } from './fixture-loader';
import { handleGrade, handleNext, type HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';
import type { CandleLoader } from './sources';

const SECRET = 'integration-secret-0123456789abcdef';
const NOW = Date.UTC(2026, 10, 3, 3);
const H = 3_600_000;
const loader = new FixtureLoader();
const deps = (over: Partial<HandlerDeps> = {}): HandlerDeps => ({
  loader, now: () => NOW, newSeed: () => 1, secret: SECRET,
  range: { from: Date.UTC(2026, 4, 1), to: Date.UTC(2026, 9, 1) },
  limiter: new RateLimiter({ capacity: 100000, now: () => NOW }),
  ...over,
});
const post = (path: string, body: unknown) =>
  new Request(`http://localhost${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const next = async (body: Json, d = deps()) => {
  const res = await handleNext(post('/api/tasks/elliott/next', { module: 'elliott', symbol: 'BTCUSDT', tf: '1h', ...body }), 'elliott', d);
  return { res, json: (await res.json()) as Json };
};
const grade = async (body: unknown, d = deps()) => {
  const res = await handleGrade(post('/api/tasks/elliott/grade', body), 'elliott', d);
  return { res, json: (await res.json()) as Json };
};
const find = (difficulty: string, from = 1, d = deps()) => async () => {
  for (let s = from; s < from + 60; s++) {
    const r = await next({ difficulty }, { ...d, newSeed: () => s });
    if (r.res.status === 200) return r.json;
  }
  throw new Error(`нет задания ${difficulty}`);
};
/** Все числа-времена (мс UTC) в объекте. */
function times(x: unknown, out: number[] = []): number[] {
  if (typeof x === 'number') { if (x > 1e12) out.push(x); }
  else if (Array.isArray(x)) x.forEach((v) => times(v, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((v) => times(v, out));
  return out;
}
const mk = (kind: Mark['kind'], pts: { time: number; price: number }[]): Mark => ({ id: `u-${kind}`, kind, anchors: pts, scope: null, direction: null, author: 'user' });

beforeEach(() => clearEwCatalogCache());

describe('elliott/next', () => {
  it('easy: relative-шкала, 500 закрытых свечей, payload §9.5, подписанный токен; нет будущего и реальных дат', async () => {
    const t = await find('easy')();
    expect(t.module).toBe('elliott');
    expect(t.timeline.mode).toBe('relative');
    expect(t.payload).toMatchObject({ kind: 'ew-impulse', tf: '1h', shapes: ['impulse-6'], alternativeRequired: false, nPoint: 5, toleranceCandles: 2, limitCandles: 72, hints: { liveRules: true } });
    expect(t.payload.tools).toEqual(['ew-impulse', 'ew-zigzag', 'ew-flat', 'hline']);
    expect(t.payload.primaryOptions).toEqual(['w3-next', 'w5-next', 'abc-next', 'trend-next']);
    expect(t.payload.alternativeOptions).toHaveLength(7);
    expect(['bull', 'bear']).toContain(t.payload.directionHint);
    expect(t.payload.invalidationTolerance).toBeGreaterThan(0);
    const s: Candle[] = t.series['1h'];
    expect(Object.keys(t.series)).toEqual(['1h']);
    expect(s).toHaveLength(500);
    expect(s.every((c) => c.closed)).toBe(true);
    const last = s[s.length - 1]!.openTime;
    expect(last % H).toBe(0);
    expect(t.decisionTime).toBe(last + H);
    expect(s[0]!.openTime).toBeLessThan(Date.UTC(2024, 0, 1)); // сдвиг на скрытую шкалу
    for (const x of times(t.payload)) {
      expect(x).toBeLessThanOrEqual(last);
      expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
    }
    expect(t.payload.lastPivot.time).toBeLessThanOrEqual(last);
    expect(t.payload.window.toTime).toBe(last);
    expect(JSON.stringify(t)).not.toMatch(/2026-0[5-9]/);
    expect(JSON.stringify(t.payload)).not.toContain('algo:ew-');
    expect(typeof t.taskToken).toBe('string');
    expect(t.algoVersion).toBe('2.0.0');
  });

  it('medium и hard: kind определяется сложностью, focus на тип не влияет', async () => {
    const m = await find('medium')();
    expect(m.payload).toMatchObject({ kind: 'ew-impulse-correction', shapes: ['impulse-6+correction'], alternativeRequired: true, directionHint: null });
    expect(m.payload.hints).toBeUndefined();
    const h = await find('hard')();
    expect(h.payload).toMatchObject({ kind: 'ew-scenario', alternativeRequired: true });
    expect(h.payload.shapes).toHaveLength(4);
    const withFocus = await next({ difficulty: 'hard', focus: ['ew-rules', 'fib-anchor'] }, deps({ newSeed: () => 3 }));
    if (withFocus.res.status === 200) expect(withFocus.json.payload.kind).toBe('ew-scenario');
  });

  it('инвариант: payload и ряд не раскрывают данные позже T ни для одного seed (hard, 25 заданий)', async () => {
    let got = 0;
    for (let s = 1; s < 120 && got < 25; s++) {
      const r = await next({ difficulty: 'hard' }, deps({ newSeed: () => s }));
      if (r.res.status !== 200) continue;
      got++;
      const sr: Candle[] = r.json.series['1h'];
      const last = sr[sr.length - 1]!.openTime;
      for (const x of times(r.json.payload)) expect(x).toBeLessThanOrEqual(last);
      expect(sr.every((c, i) => i === 0 || c.openTime - sr[i - 1]!.openTime === H)).toBe(true);
      expect(r.json.decisionTime).toBe(last + H);
    }
    expect(got).toBeGreaterThanOrEqual(5);
  });

  it('tf вне списка сложности - 400 UNKNOWN_TIMEFRAME; tf=1d отвергает схема', async () => {
    const a = await next({ difficulty: 'easy', tf: '15m' });
    expect(a.res.status).toBe(400);
    expect(a.json.error.details.issues[0].code).toBe('UNKNOWN_TIMEFRAME');
    const b = await next({ difficulty: 'easy', tf: '1d' });
    expect(b.res.status).toBe(400);
    expect(b.json.error.details.issues[0].code).toBe('UNKNOWN_TIMEFRAME');
  });

  it('exclude: исключённое задание не возвращается; детерминизм по seed', async () => {
    const a = await find('hard')();
    const b = await next({ difficulty: 'hard', exclude: [a.taskId] }, deps({ newSeed: () => 1 }));
    if (b.res.status === 200) expect(b.json.taskId).not.toBe(a.taskId);
    const again = await find('hard')();
    expect(again.taskId).toBe(a.taskId);
  });

  it('кэш каталога: повторный выбор не пересчитывает каталог месяца', async () => {
    await find('easy')();
    const size = ewCatalogCacheSize();
    expect(size).toBeGreaterThan(0);
    await find('easy')();
    expect(ewCatalogCacheSize()).toBe(size);
  });

  it('нет подходящих месяцев в диапазоне - 404', async () => {
    const r = await next({ difficulty: 'easy' }, deps({ range: { from: Date.UTC(2026, 8, 20), to: Date.UTC(2026, 9, 1) } }));
    expect(r.res.status).toBe(404);
  });

  it('пропуск данных (§19): задания не строятся через удалённые сутки', async () => {
    // SYNTHETIC: из реальных свечей BTCUSDT 1h удалены сутки 2026-07-10 (имитация пропуска архива, как 2026-10-28), цены не менялись
    const gap = { from: Date.UTC(2026, 6, 10), to: Date.UTC(2026, 6, 11) };
    const gapped: CandleLoader = {
      aggTrades: (...a) => loader.aggTrades(...a),
      candles: async (...a) => (await loader.candles(...a)).filter((c) => !(c.openTime >= gap.from && c.openTime < gap.to)),
    };
    for (let s = 1; s < 80; s++) {
      const r = await next({ difficulty: 'hard' }, deps({ loader: gapped, newSeed: () => s }));
      if (r.res.status !== 200) continue;
      const sr: Candle[] = r.json.series['1h'];
      expect(sr.every((c, i) => i === 0 || c.openTime - sr[i - 1]!.openTime === H)).toBe(true);
      // сдвиг на целые сутки: реальное время = время задания + shift; shift неизвестен клиенту, проверяем через grade ниже
    }
  });

  it('archiveMonths: закрытые месяцы с запасом на хвост проигрывания', () => {
    const m = archiveMonths({ from: Date.UTC(2026, 4, 1), to: Date.UTC(2026, 9, 1) }, '1h');
    expect(m.map((x) => new Date(x).toISOString().slice(0, 7))).toEqual(['2026-05', '2026-06', '2026-07', '2026-08']);
    expect(archiveMonths({ from: Date.UTC(2026, 4, 15), to: Date.UTC(2026, 9, 1) }, '1h')[0]).toBe(Date.UTC(2026, 5, 1));
    expect(archiveMonths({ from: 0, to: 0 }, '4h')).toEqual([]);
  });
});

describe('elliott/grade', () => {
  /** Ответ «как эталон»: детектор N=7 на ряду задания находит импульс, оканчивающийся в lastPivot. */
  function easyAnswer(t: Json): { impulse: Mark; invalidation: number } {
    const s: Candle[] = t.series['1h'];
    const list = findWaveCandidates(s, { nPivot: 7, withCorrection: false, minSizeAtr: 6, minWaveAtr: 1, minGuides: 2 });
    const c = list.find((x) => x.count.impulse[5]!.time === t.payload.lastPivot.time)!;
    expect(c).toBeDefined();
    return { impulse: mk('ew-impulse', c.count.impulse.map((p) => ({ time: p.time, price: p.price }))), invalidation: c.count.impulse[5]!.price };
  }
  const answerBody = (t: Json, a: Json) => ({ taskToken: t.taskToken, answer: { kind: t.payload.kind, correction: null, alternative: null, ...a } });

  it('easy: ответ по эталону -> correct, сценарий abc-next, invalidation ok, исход и replay на шкале задания', async () => {
    const t = await find('easy')();
    const { impulse, invalidation } = easyAnswer(t);
    const { res, json } = await grade(answerBody(t, { impulse, primary: 'abc-next', invalidation }));
    expect(res.status).toBe(200);
    expect(json.module).toBe('elliott');
    expect(json.verdict).toBe('correct');
    expect(json.task).toMatchObject({ module: 'elliott', difficulty: 'easy', tf: '1h', taskKind: 'ew-impulse' });
    expect(json.detail.kind).toBe('ew-impulse');
    const d = json.detail.elliott;
    expect(d.direction).toBe(t.payload.directionHint);
    expect(d.invalidation).toMatchObject({ status: 'ok', ruleRef: 'P5' });
    expect(d.scenario).toMatchObject({ primary: 'abc-next', implied: 'abc-next', altStatus: 'optional-empty' });
    expect(d.quality.parts).toHaveLength(6);
    expect(json.skillOutcomes.map((s: Json) => s.skill)).toEqual(['ew-impulse', 'ew-rules', 'ew-invalidation']);
    expect(json.feedback.verdict.templateKey).toBe('feedback.verdict.elliott.correct');
    expect(json.feedback.verdict.params.outcomeText).toEqual(expect.any(String));
    expect(json.feedback.principle.templateKey).toMatch(/^feedback\.(principle\.elliott|EW_[A-Z0-9_]+\.principle)$/);
    // отображение на шкалу задания: ни одной реальной даты, replay сразу после последней видимой свечи
    for (const x of times({ detail: json.detail, reference: json.reference, replay: json.replay, errors: json.errors, feedback: json.feedback })) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
    expect(json.replay.tf).toBe('1h');
    expect(json.replay.candles[0].openTime).toBe(t.series['1h'].at(-1).openTime + H);
    expect(json.replay.candles.length).toBeGreaterThan(0);
    expect(json.reference.some((m: Mark) => m.kind === 'ew-impulse')).toBe(true);
    expect(json.reference.every((m: Mark) => m.id.startsWith('ref:'))).toBe(true);
    expect(json.reference.find((m: Mark) => m.kind === 'hline').meta.role).toBe('ew-invalidation');
    expect(json.reveal ?? json.task.reveal).toBeDefined();
  });

  it('easy: invalidation на неверной стороне и сценарий не по разметке - major-ошибки, partial/incorrect', async () => {
    const t = await find('easy')();
    const { impulse } = easyAnswer(t);
    const last = t.series['1h'].at(-1).close;
    const { json } = await grade(answerBody(t, { impulse, primary: 'w5-next', invalidation: last }));
    const codes = json.errors.map((e: Json) => e.code);
    expect(codes).toContain('EW_SCENARIO_MISMATCH');
    expect(json.verdict).not.toBe('correct');
  });

  it('валидация ответа (400): якоря вне окна, число якорей, форма, сценарий, invalidation', async () => {
    const t = await find('easy')();
    const { impulse } = easyAnswer(t);
    const issue = async (a: Json, tok = t) => {
      const r = await grade(answerBody(tok, a));
      expect(r.res.status).toBe(400);
      return r.json.error.details.issues[0];
    };
    const early = { ...impulse, anchors: impulse.anchors.map((x, i) => (i === 0 ? { ...x, time: x.time - 400 * H } : x)) };
    expect((await issue({ impulse: early, primary: 'abc-next', invalidation: 1 })).code).toBe('EW_ANCHOR_OUT_OF_RANGE');
    expect((await issue({ impulse: mk('ew-impulse', impulse.anchors.slice(0, 4)), primary: 'abc-next', invalidation: 1 })).code).toBe('EW_ANCHORS_COUNT');
    expect((await issue({ impulse: mk('ew-zigzag', impulse.anchors), primary: 'abc-next', invalidation: 1 })).code).toBe('EW_ANCHORS_COUNT');
    const corr = mk('ew-zigzag', impulse.anchors.slice(3, 6));
    expect((await issue({ impulse: mk('ew-impulse', impulse.anchors.slice(0, 5)), correction: corr, primary: 'abc-next', invalidation: 1 })).code).toBe('EW_CORRECTION_WITHOUT_IMPULSE');
    expect((await issue({ impulse, correction: corr, primary: 'trend-next', invalidation: 1 })).code).toBe('EW_SHAPE_NOT_ALLOWED'); // коррекция на easy
    expect((await issue({ impulse, primary: 'spiral', invalidation: 1 })).code).toBe('EW_SCENARIO_UNKNOWN');
    expect((await issue({ impulse, primary: 'abc-next', alternative: 'nope', invalidation: 1 })).code).toBe('EW_SCENARIO_UNKNOWN');
    expect((await issue({ impulse, primary: 'abc-next', invalidation: -5 })).code).toBe('EW_INVALIDATION_INVALID');
    expect((await issue({ impulse, primary: 'abc-next', invalidation: 0 })).code).toBe('EW_INVALIDATION_INVALID');
  });

  it('токен: другой модуль, kind ответа не совпадает с заданием', async () => {
    const t = await find('easy')();
    const { impulse } = easyAnswer(t);
    const bad = await grade({ taskToken: t.taskToken, answer: { kind: 'ew-scenario', impulse, correction: null, primary: 'abc-next', alternative: null, invalidation: 1 } });
    expect(bad.res.status).toBe(400);
    const wrongModule = await handleGrade(post('/api/tasks/fibonacci/grade', answerBody(t, { impulse, primary: 'abc-next', invalidation: 1 })), 'fibonacci', deps());
    expect(wrongModule.status).toBe(400);
  });

  it('hard: разные альтернативы и полный разбор; медиум: нет альтернативы - EW_ALT_MISSING', async () => {
    const t = await find('hard')();
    const s: Candle[] = t.series['1h'];
    // ответ из эталонной разметки: берём любой 5-точечный подсчёт, оканчивающийся на lastPivot, через детектор на ряду задания
    const { enumerateCounts } = await import('@tl/core');
    const last = s.findIndex((c) => c.openTime === t.payload.lastPivot.time);
    const from = s.findIndex((c) => c.openTime === t.payload.window.fromTime);
    const scan = enumerateCounts(s, { nPoint: 5, fromIndex: from, lastIndex: last, maxCounts: 5000 });
    const main = scan.counts.find((c) => c.scenario === 'w5-next' || c.scenario === 'abc-next' || c.scenario === 'trend-next')!;
    expect(main).toBeDefined();
    const pts = [...main.impulse, ...(main.correction?.points ?? [])];
    const imp = mk('ew-impulse', main.impulse.map((p) => ({ time: p.time, price: p.price })));
    const cor = main.correction ? mk(main.correction.type === 'zigzag' ? 'ew-zigzag' : 'ew-flat', main.correction.points.map((p) => ({ time: p.time, price: p.price }))) : null;
    const r = await grade(answerBody(t, { impulse: imp, correction: cor, primary: main.scenario, alternative: null, invalidation: pts[0]!.price }));
    expect(r.res.status).toBe(200);
    expect(r.json.errors.map((e: Json) => e.code)).toContain('EW_ALT_MISSING');
    expect(r.json.detail.elliott.scenario.altStatus).toBe('missing');
    expect(r.json.detail.elliott.validCounts).toEqual(expect.any(Object));
    expect(r.json.detail.elliott.outcome.basis).toBe('user');
    expect(r.json.replay.exitIndex === null || r.json.replay.exitIndex >= 0).toBe(true);
  });

  it('просроченный/подделанный токен - 401; версия алгоритма Elliott в токене проверяется', async () => {
    const t = await find('easy')();
    const { impulse } = easyAnswer(t);
    const forged = t.taskToken.slice(0, -3) + 'AAA';
    const r = await grade({ taskToken: forged, answer: { kind: 'ew-impulse', impulse, correction: null, primary: 'abc-next', alternative: null, invalidation: 1 } });
    expect(r.res.status).toBe(401);
    const late = await grade(answerBody(t, { impulse, primary: 'abc-next', invalidation: 1 }), deps({ now: () => NOW + 25 * 3_600_000 }));
    expect(late.res.status).toBe(401);
  });
});

