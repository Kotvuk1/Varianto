// @vitest-environment node
// API курса по ступеням (CURRICULUM_STAGES.md §11) на реальных фикстурах BTCUSDT (1h май-сентябрь, 4h июль-октябрь), без сети:
// next/grade для stage-swings, levels, limit-entry, stop-take, combo-level-trade, combo-smc-entry × easy/medium/hard.
import { describe, expect, it } from 'vitest';
import type { Candle, Mark } from '@tl/core';
import { FixtureLoader } from './fixture-loader';
import { handleGrade, handleNext, type HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';

const SECRET = 'integration-secret-0123456789abcdef';
const NOW = Date.UTC(2026, 10, 3, 3);
const H = 3_600_000;
const loader = new FixtureLoader();
const deps = (tf: '1h' | '4h', over: Partial<HandlerDeps> = {}): HandlerDeps => ({
  loader,
  now: () => NOW,
  newSeed: () => 1,
  secret: SECRET,
  range: tf === '1h' ? { from: Date.UTC(2026, 5, 1), to: Date.UTC(2026, 9, 1) } : { from: Date.UTC(2026, 6, 1), to: Date.UTC(2026, 9, 25) },
  gridStepMs: tf === '1h' ? H : 4 * H,
  maxAttempts: 120,
  limiter: new RateLimiter({ capacity: 100000, now: () => NOW }),
  ...over,
});
const post = (path: string, body: unknown) =>
  new Request(`http://localhost${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const next = async (module: string, body: Json, d: HandlerDeps) => {
  const res = await handleNext(post(`/api/tasks/${module}/next`, { module, symbol: 'BTCUSDT', ...body }), module, d);
  return { res, json: (await res.json()) as Json };
};
const grade = async (module: string, body: Json, d: HandlerDeps) => {
  const res = await handleGrade(post(`/api/tasks/${module}/grade`, body), module, d);
  return { res, json: (await res.json()) as Json };
};
/** Первое успешное задание для набора seed. */
const find = async (module: string, body: Json, tf: '1h' | '4h', from = 1): Promise<{ json: Json; deps: HandlerDeps }> => {
  for (let s = from; s < from + 40; s++) {
    const d = deps(tf, { newSeed: () => s });
    const r = await next(module, body, d);
    if (r.res.status === 200) return { json: r.json, deps: d };
  }
  throw new Error(`нет задания ${module} ${JSON.stringify(body)}`);
};
/** Все числа-времена (мс UTC) в объекте. */
function times(x: unknown, out: number[] = []): number[] {
  if (typeof x === 'number') {
    if (x > 1e12) out.push(x);
  } else if (Array.isArray(x)) x.forEach((v) => times(v, out));
  else if (x && typeof x === 'object') Object.entries(x).forEach(([k, v]) => k !== 'reveal' && times(v, out)); // reveal - раскрытие после grade
  return out;
}
const userZone = (a: number, b: number): Mark => ({ id: 'u-zone', kind: 'zone', anchors: [{ time: 0, price: a }, { time: 0, price: b }], scope: null, direction: null, author: 'user' });
const DIFFS = ['easy', 'medium', 'hard'] as const;

/** Общие инварианты next: ряд закрыт, нет будущего; relative - нет реальных дат. */
function checkNext(t: Json, tf: string, relative: boolean): void {
  expect(t.algoVersion).toBe('2.0.0');
  expect(typeof t.taskToken).toBe('string');
  expect(t.timeline.mode).toBe(relative ? 'relative' : 'absolute');
  const s: Candle[] = t.series[tf];
  expect(Object.keys(t.series)).toEqual([tf]);
  expect(s.length).toBeGreaterThanOrEqual(400);
  expect(s.every((c) => c.closed)).toBe(true);
  const last = s[s.length - 1]!;
  expect(last.closeTime + 1).toBeLessThanOrEqual(t.decisionTime);
  for (const x of times(t.payload)) expect(x).toBeLessThanOrEqual(last.openTime); // в payload нет времён позже последней видимой свечи
  if (relative) {
    expect(s[0]!.openTime).toBeLessThan(Date.UTC(2024, 0, 1));
    for (const x of times({ ...t, expiresAt: 0 })) expect(x).toBeLessThan(Date.UTC(2024, 0, 1)); // expiresAt - срок токена, не время шкалы
    expect(JSON.stringify(t)).not.toMatch(/2026-/);
  }
  expect(JSON.stringify(t.payload)).not.toMatch(/"correct|reference/);
  if (relative) expect(JSON.stringify(t.payload)).not.toMatch(/algo:/); // id подсказок на relative-шкале без реального времени
}

describe('stage-swings', () => {
  for (const difficulty of DIFFS) {
    it(`sw-mark ${difficulty}: absolute, окно и инструменты; копия эталона даёт 1`, async () => {
      const { json: t, deps: d } = await find('stage-swings', { difficulty, taskType: 'sw-mark', tf: '1h' }, '1h');
      checkNext(t, '1h', false);
      expect(t.payload).toMatchObject({ kind: 'sw-mark', tf: '1h', toleranceCandles: 2 });
      expect(t.payload.concepts).toContain('swing');
      expect(t.payload.concepts.includes('structure-labels')).toBe(difficulty !== 'easy');
      expect(t.payload.n).toBe(difficulty === 'hard' ? 5 : 7);
      expect(t.payload.requiredCount).toBeGreaterThanOrEqual(4);
      expect(t.payload.requiredCount).toBeLessThanOrEqual(12);
      const bad = await grade('stage-swings', { taskToken: t.taskToken, answer: { kind: 'sw-mark', marks: [] } }, d);
      expect(bad.res.status).toBe(200);
      expect(bad.json.errors.map((e: Json) => e.code)).toContain('SWING_MISSED');
      expect(bad.json.task.reveal.shiftMs).toBe(0);
      const marks = bad.json.reference.map((m: Mark, i: number) => ({ ...m, id: `u${i}`, author: 'user' }));
      const good = await grade('stage-swings', { taskToken: t.taskToken, answer: { kind: 'sw-mark', marks } }, d);
      expect(good.json).toMatchObject({ score: 1, verdict: 'correct', errors: [] });
    });

    it(`sw-trend ${difficulty}: варианты up/down/range, подсказки только на easy; верный ответ находится перебором`, async () => {
      const { json: t, deps: d } = await find('stage-swings', { difficulty, taskType: 'sw-trend', tf: '1h' }, '1h');
      checkNext(t, '1h', false);
      expect(t.payload).toMatchObject({ kind: 'sw-trend', options: ['up', 'down', 'range'], n: difficulty === 'hard' ? 5 : 7 });
      expect(Boolean(t.payload.hints)).toBe(difficulty === 'easy');
      expect(JSON.stringify(t)).not.toMatch(/"trend"|"label"/);
      const results = [];
      for (const optionId of ['up', 'down', 'range']) {
        results.push((await grade('stage-swings', { taskToken: t.taskToken, answer: { kind: 'sw-trend', questionId: t.payload.questionId, optionId } }, d)).json);
      }
      expect(results.filter((r) => r.verdict === 'correct')).toHaveLength(1);
      const wrong = results.find((r) => r.verdict === 'incorrect');
      expect(wrong.errors[0].code).toBe('SWING_TREND_WRONG');
      expect(wrong.feedback.verdict.templateKey).toBe('feedback.verdict.plain.incorrect');
      expect(wrong.detail).toMatchObject({ kind: 'sw-trend' });
      const x = await grade('stage-swings', { taskToken: t.taskToken, answer: { kind: 'sw-trend', questionId: 'sw-trend:999999', optionId: 'up' } }, d);
      expect(x.res.status).toBe(400);
    });
  }
});

describe('levels', () => {
  for (const difficulty of DIFFS) {
    it(`lv-strongest ${difficulty}: absolute; эталонная цена из reference даёт correct`, async () => {
      const { json: t, deps: d } = await find('levels', { difficulty, taskType: 'lv-strongest', tf: '1h' }, '1h');
      checkNext(t, '1h', false);
      expect(t.payload).toMatchObject({ kind: 'lv-strongest', tolerancePct: 0.3, maxDistanceAtr: 5 });
      expect(t.payload.role === null).toBe(difficulty === 'hard');
      expect(t.payload.atr).toBeGreaterThan(0);
      expect(Boolean(t.payload.hints)).toBe(difficulty === 'easy');
      const far = await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-strongest', price: t.series['1h'].at(-1).close * 3 } }, d);
      expect(far.res.status).toBe(200);
      expect(far.json.errors[0].code).toBe('LEVEL_OFF_TOLERANCE');
      const ref = far.json.reference.find((m: Mark) => m.meta?.['role'] === 'reference');
      const price = (ref.anchors[0].price + ref.anchors[1].price) / 2;
      const good = await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-strongest', price } }, d);
      expect(good.json).toMatchObject({ verdict: 'correct', score: 1 });
      expect(good.json.detail).toMatchObject({ kind: 'lv-strongest', tolerancePct: 0.3 });
      expect(good.json.skillOutcomes).toEqual([{ skill: 'pa-level', correct: 1, total: 1 }]);
    });

    it(`lv-zone ${difficulty}: метка zone; эталонные края дают correct; невалидная метка -> 400`, async () => {
      const { json: t, deps: d } = await find('levels', { difficulty, taskType: 'lv-zone', tf: '1h' }, '1h');
      checkNext(t, '1h', false);
      expect(t.payload).toMatchObject({ kind: 'lv-zone', tools: ['zone'], edgeToleranceAtr: 0.1, maxExtraHeightAtr: 1 });
      const t0 = t.series['1h'].at(-1).openTime as number;
      const zoneAt = (a: number, b: number): Mark => ({ ...userZone(a, b), anchors: [{ time: t0, price: a }, { time: t0, price: b }] });
      const probe = await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-zone', zone: zoneAt(1, 2) } }, d);
      expect(probe.res.status).toBe(200);
      expect(probe.json.errors[0].code).toMatch(/ZONE_OFF|LEVEL_/);
      const ref = probe.json.reference.find((m: Mark) => m.meta?.['role'] === 'reference');
      const [a, b] = ref.anchors.map((x: { price: number }) => x.price);
      const good = await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-zone', zone: zoneAt(a, b) } }, d);
      expect(good.json).toMatchObject({ verdict: 'correct', score: 1 });
      expect(good.json.detail.kind).toBe('lv-zone');
      for (const [zone, code] of [
        [{ ...zoneAt(a, b), kind: 'level' }, 'INVALID_TYPE'],
        [{ ...zoneAt(a, b), anchors: [{ time: t0, price: a }] }, 'ZONE_MARK_INVALID'],
        [{ ...zoneAt(a, a) }, 'ZONE_MARK_INVALID'],
        [{ ...zoneAt(a, b), anchors: [{ time: 5, price: a }, { time: 5, price: b }] }, 'ZONE_MARK_INVALID'],
      ] as const) {
        const r = await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-zone', zone } }, d);
        expect(r.res.status).toBe(400);
        expect(r.json.error.details.issues[0].code === code || code === 'INVALID_TYPE').toBe(true);
      }
    });

    it(`lv-reaction ${difficulty}: relative; перебор вариантов находит верный, replay с индексом выхода`, async () => {
      const { json: t, deps: d } = await find('levels', { difficulty, taskType: 'lv-reaction', tf: '1h' }, '1h');
      checkNext(t, '1h', true);
      expect(t.payload.kind).toBe('lv-reaction');
      expect(t.payload.allowNone).toBe(difficulty === 'hard');
      expect(t.payload.limitCandles).toBe(72);
      const ids: string[] = [...t.payload.options.map((o: Json) => o.id), ...(t.payload.allowNone ? ['none'] : [])];
      expect(Boolean(t.payload.options[0].touches)).toBe(difficulty === 'easy');
      const res = [];
      for (const optionId of ids) res.push((await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-reaction', optionId } }, d)).json);
      expect(res.filter((r) => r.verdict === 'correct')).toHaveLength(1);
      const any = res[0];
      expect(any.replay.tf).toBe('1h');
      expect(any.replay.exitIndex).toBeGreaterThanOrEqual(0);
      expect(any.replay.candles.length).toBeGreaterThan(any.replay.exitIndex);
      expect(any.replay.candles[0].openTime).toBe(t.decisionTime);
      for (const x of times(any)) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
      expect((await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-reaction', optionId: 'z9' } }, d)).res.status).toBe(400);
      if (!t.payload.allowNone) expect((await grade('levels', { taskToken: t.taskToken, answer: { kind: 'lv-reaction', optionId: 'none' } }, d)).res.status).toBe(400);
    });
  }
});

describe('limit-entry', () => {
  for (const difficulty of DIFFS) {
    it(`${difficulty}: relative; лимитка у ближнего края; replay с fillIndex; ошибки 400`, async () => {
      const { json: t, deps: d } = await find('limit-entry', { difficulty, tf: '1h' }, '1h');
      checkNext(t, '1h', true);
      const p = t.payload;
      expect(p).toMatchObject({ kind: 'limit-entry', tf: '1h', frontK: { min: 0.05, max: 0.5 }, limitCandles: 72 });
      expect(Boolean(p.hints)).toBe(difficulty === 'easy');
      const near = p.side === 'LONG' ? p.zone.top : p.zone.bottom;
      const g = await grade('limit-entry', { taskToken: t.taskToken, answer: { kind: 'limit-entry', limit: { price: near, type: 'near-edge', frontK: null } } }, d);
      expect(g.res.status).toBe(200);
      expect(g.json.detail).toMatchObject({ kind: 'limit-entry' });
      expect(g.json.detail.parts.map((x: Json) => x.key)).toEqual(['placement', 'type', 'fill', 'price']);
      expect(g.json.replay.exitIndex).toBeGreaterThanOrEqual(0);
      expect('fillIndex' in g.json.replay).toBe(true);
      expect(g.json.feedback.verdict.templateKey).toMatch(/^feedback\.verdict\.limit\./);
      expect(g.json.feedback.verdict.params).toMatchObject({ outcomeText: expect.any(String) });
      expect(g.json.skillOutcomes.map((o: Json) => o.skill)).toEqual(['limit-placement', 'limit-fill']);
      expect(g.json.reference.map((m: Mark) => m.kind)).toEqual(['zone', 'hline']);
      for (const x of times(g.json)) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
      const front = await grade('limit-entry', { taskToken: t.taskToken, answer: { kind: 'limit-entry', limit: { price: p.side === 'LONG' ? near + p.atr * 0.2 : near - p.atr * 0.2, type: 'front-run', frontK: 0.2 } } }, d);
      expect(front.json.errors.map((e: Json) => e.code)).not.toContain('LIMIT_TYPE_MISMATCH');
      const close = t.series['1h'].at(-1).close as number;
      const wrongSide = await grade('limit-entry', { taskToken: t.taskToken, answer: { kind: 'limit-entry', limit: { price: p.side === 'LONG' ? close * 1.01 : close * 0.99, type: 'near-edge', frontK: null } } }, d);
      expect(wrongSide.res.status).toBe(400);
      expect(wrongSide.json.error.details.issues[0].code).toBe('LIMIT_WRONG_SIDE');
      const badFront = await grade('limit-entry', { taskToken: t.taskToken, answer: { kind: 'limit-entry', limit: { price: near, type: 'front-run', frontK: null } } }, d);
      expect(badFront.res.status).toBe(400);
      expect(badFront.json.error.details.issues[0].code).toBe('LIMIT_TYPE_INVALID');
    });
  }
});

describe('stop-take', () => {
  for (const difficulty of DIFFS) {
    it(`${difficulty}: relative; вход исполнен; эталонный план даёт correct и resolution; SL/TP с неверной стороны -> 400`, async () => {
      const { json: t, deps: d } = await find('stop-take', { difficulty, tf: '1h' }, '1h');
      checkNext(t, '1h', true);
      const p = t.payload;
      expect(p).toMatchObject({ kind: 'stop-take', tf: '1h', limitCandles: 72 });
      expect(p.entry.fillTime).toBe(t.series['1h'].at(-1).openTime); // ряд заканчивается свечой исполнения
      expect(t.decisionTime).toBe(t.series['1h'].at(-1).closeTime + 1);
      expect(Boolean(p.hints)).toBe(difficulty === 'easy');
      if (difficulty === 'easy') {
        expect(p.hints.some((m: Mark) => m.meta?.['role'] === 'structure')).toBe(true);
        expect(p.hints.some((m: Mark) => m.meta?.['role'] === 'target-candidate')).toBe(true);
        expect(JSON.stringify(p.hints)).not.toMatch(/allowed/);
      }
      const long = p.side === 'LONG';
      const probe = await grade('stop-take', { taskToken: t.taskToken, answer: { kind: 'stop-take', sl: long ? p.entry.price - p.atr * 3 : p.entry.price + p.atr * 3, tp: long ? p.entry.price + p.atr * 40 : p.entry.price - p.atr * 40 } }, d);
      expect(probe.res.status).toBe(200);
      const plan = probe.json.reference.find((m: Mark) => m.meta?.['role'] === 'reference-plan');
      expect(plan.kind).toBe('position');
      const [, sl, tp] = plan.anchors.map((x: { price: number }) => x.price);
      const good = await grade('stop-take', { taskToken: t.taskToken, answer: { kind: 'stop-take', sl, tp } }, d);
      expect(good.json).toMatchObject({ verdict: 'correct' });
      expect(good.json.detail).toMatchObject({ kind: 'stop-take', stopHunted: expect.any(Boolean) });
      expect(good.json.detail.outcome.result).toMatch(/tp|sl|timeout/);
      expect(good.json.resolution).toMatchObject({ method: expect.any(String) });
      expect(good.json.feedback.verdict.templateKey).toMatch(/^feedback\.verdict\.trade\./);
      expect(good.json.feedback.verdict.params).toHaveProperty('r');
      expect(good.json.skillOutcomes.map((o: Json) => o.skill)).toEqual(['stop-placement', 'take-profit', 'risk-reward']);
      expect(good.json.replay.candles.length).toBeGreaterThan(0);
      expect(good.json.replay.candles[0].openTime).toBe(t.decisionTime);
      for (const x of times(good.json)) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
      const wrongSl = await grade('stop-take', { taskToken: t.taskToken, answer: { kind: 'stop-take', sl: long ? p.entry.price + 5 : p.entry.price - 5, tp } }, d);
      expect(wrongSl.res.status).toBe(400);
      expect(wrongSl.json.error.details.issues[0].code).toBe('SL_WRONG_SIDE');
      const wrongTp = await grade('stop-take', { taskToken: t.taskToken, answer: { kind: 'stop-take', sl, tp: long ? p.entry.price - 5 : p.entry.price + 5 } }, d);
      expect(wrongTp.json.error.details.issues[0].code).toBe('TP_WRONG_SIDE');
    });
  }
});

describe('combo-level-trade', () => {
  for (const difficulty of DIFFS) {
    it(`${difficulty}: relative; side скрыт на hard; ответ по эталону оценивается, исход показывается`, async () => {
      const { json: t, deps: d } = await find('combo-level-trade', { difficulty, tf: '1h' }, '1h');
      checkNext(t, '1h', true);
      const p = t.payload;
      expect(p).toMatchObject({ kind: 'combo-level-trade', tools: ['zone', 'hline'], limitCandles: 72 });
      expect(p.side === null).toBe(difficulty === 'hard');
      // эталонная зона: пробный ответ выдаёт reference; сторону на hard выбираем по зоне
      const close = t.series['1h'].at(-1).close as number;
      const t0 = t.series['1h'].at(-1).openTime as number;
      const probeZone = (a: number, b: number): Mark => ({ ...userZone(a, b), anchors: [{ time: t0, price: a }, { time: t0, price: b }] });
      const trySides = p.side ? [p.side] : ['LONG', 'SHORT'];
      let graded: Json = null;
      for (const side of trySides) {
        const a = side === 'LONG' ? close - 2 * p.atr : close + p.atr;
        const b = a + p.atr * 0.5;
        const long = side === 'LONG';
        const answer = { kind: 'combo-level-trade', zone: probeZone(a, b), limit: { price: long ? b : a, type: 'near-edge', frontK: null }, sl: long ? a - p.atr : b + p.atr, tp: long ? b + 3 * p.atr : a - 3 * p.atr };
        const r = await grade('combo-level-trade', { taskToken: t.taskToken, answer }, d);
        expect(r.res.status).toBe(200);
        graded = r.json;
      }
      expect(graded.detail).toMatchObject({ kind: 'combo-level-trade' });
      expect(graded.detail.parts.map((x: Json) => x.key)).toEqual(['zone', 'placement', 'type', 'sl', 'tp', 'rr']);
      expect(graded.skillOutcomes.map((o: Json) => o.skill)).toEqual(['level-zone', 'limit-placement', 'stop-placement', 'take-profit', 'risk-reward']);
      expect(graded.feedback.verdict.templateKey).toMatch(/^feedback\.verdict\.trade\./);
      expect(graded.replay.tf).toBe('1h');
      expect(graded.detail.outcome.kind).toMatch(/tp|sl|timeout|cancelled-reaction|cancelled-target|not-filled/);
      for (const x of times(graded)) expect(x).toBeLessThan(Date.UTC(2024, 0, 1));
      // ZONE_SIDE_MISMATCH: на easy/medium зона с другой стороны цены
      if (p.side) {
        const wrongZone = p.side === 'LONG' ? [close + p.atr, close + 2 * p.atr] : [close - 2 * p.atr, close - p.atr];
        const long = p.side === 'LONG';
        const r = await grade('combo-level-trade', { taskToken: t.taskToken, answer: { kind: 'combo-level-trade', zone: probeZone(wrongZone[0]!, wrongZone[1]!), limit: { price: long ? close - 1 : close + 1, type: 'near-edge', frontK: null }, sl: long ? close - 100 : close + 100, tp: long ? close + 100 : close - 100 } }, d);
        expect(r.res.status).toBe(400);
        expect(r.json.error.details.issues[0].code).toBe('ZONE_SIDE_MISMATCH');
      }
    });
  }
});

describe('combo-smc-entry', () => {
  for (const difficulty of DIFFS) {
    it(`${difficulty} (4h): relative; side задан; эталонный POI из reference; хинты структуры на easy`, async () => {
      const { json: t, deps: d } = await find('combo-smc-entry', { difficulty, tf: '4h' }, '4h');
      checkNext(t, '4h', true);
      const p = t.payload;
      expect(p).toMatchObject({ kind: 'combo-smc-entry', tools: ['zone', 'hline'], limitCandles: 60 });
      expect(['LONG', 'SHORT']).toContain(p.side);
      expect(Boolean(p.hints)).toBe(difficulty === 'easy');
      const close = t.series['4h'].at(-1).close as number;
      const t0 = t.series['4h'].at(-1).openTime as number;
      const long = p.side === 'LONG';
      const zone = (a: number, b: number): Mark => ({ ...userZone(a, b), anchors: [{ time: t0, price: a }, { time: t0, price: b }] });
      const a0 = long ? close - 3 * p.atr : close + 2 * p.atr;
      const answer = (zn: Mark) => ({ kind: 'combo-smc-entry', zone: zn, limit: { price: long ? a0 + p.atr : a0, type: 'near-edge', frontK: null }, sl: long ? a0 - p.atr : a0 + p.atr * 2, tp: long ? a0 + 4 * p.atr : a0 - 4 * p.atr });
      const probe = await grade('combo-smc-entry', { taskToken: t.taskToken, answer: answer(zone(a0, a0 + p.atr)) }, d);
      expect(probe.res.status).toBe(200);
      const refZone = probe.json.reference.find((m: Mark) => m.meta?.['role'] === 'reference');
      expect(refZone.kind).toBe('zone');
      const [x, y] = refZone.anchors.map((q: { price: number }) => q.price);
      const exact = await grade('combo-smc-entry', { taskToken: t.taskToken, answer: { ...answer(zone(x, y)), limit: { price: long ? Math.max(x, y) : Math.min(x, y), type: 'near-edge', frontK: null } } }, d);
      expect(exact.res.status).toBe(200);
      expect(exact.json.detail.parts[0]).toMatchObject({ key: 'zone', score: 20 });
      expect(exact.json.detail.matchedZone).toMatchObject({ kind: expect.stringMatching(/order-block|fvg/) });
      expect(exact.json.skillOutcomes[0].skill).toMatch(/order-block|fvg/);
      for (const q of times(exact.json)) expect(q).toBeLessThan(Date.UTC(2024, 0, 1));
    });
  }
});

describe('границы API курса', () => {
  it('UNKNOWN_TIMEFRAME: 1d недоступен в ступенях 3, 4, lv-reaction и комбо; 15m - на easy; неизвестный модуль 404', async () => {
    const d = deps('1h');
    for (const [module, body] of [
      ['limit-entry', { difficulty: 'easy', tf: '1d' }],
      ['stop-take', { difficulty: 'medium', tf: '1d' }],
      ['combo-level-trade', { difficulty: 'hard', tf: '1d' }],
      ['combo-smc-entry', { difficulty: 'hard', tf: '1d' }],
      ['levels', { difficulty: 'medium', taskType: 'lv-reaction', tf: '1d' }],
      ['levels', { difficulty: 'easy', taskType: 'lv-strongest', tf: '15m' }],
      ['stage-swings', { difficulty: 'easy', taskType: 'sw-mark', tf: '15m' }],
      ['stage-swings', { difficulty: 'easy', taskType: 'sw-trend', tf: '1d' }],
    ] as const) {
      const r = await next(module, body, d);
      expect(r.res.status, `${module} ${JSON.stringify(body)}`).toBe(400);
      expect(r.json.error.details.issues[0].code).toBe('UNKNOWN_TIMEFRAME');
    }
    expect((await next('no-such-module', { difficulty: 'easy' }, d)).res.status).toBe(404);
    // лишние поля и чужой taskType запрещены (strict)
    expect((await next('limit-entry', { difficulty: 'easy', tf: '1h', taskType: 'x' }, d)).res.status).toBe(400);
    expect((await next('levels', { difficulty: 'easy', taskType: 'draw-level', tf: '1h' }, d)).res.status).toBe(400);
  });

  it('токен чужого модуля и несовпадение kind ответа -> 400; ответ комбо без zone -> 400', async () => {
    const { json: t, deps: d } = await find('limit-entry', { difficulty: 'easy', tf: '1h' }, '1h');
    const other = await grade('stop-take', { taskToken: t.taskToken, answer: { kind: 'stop-take', sl: 1, tp: 2 } }, d);
    expect(other.res.status).toBe(400);
    const kind = await grade('limit-entry', { taskToken: t.taskToken, answer: { kind: 'lv-strongest', price: 5 } }, d);
    expect(kind.res.status).toBe(400);
    const noZone = await grade('combo-level-trade', { taskToken: t.taskToken, answer: { kind: 'combo-level-trade', limit: { price: 1, type: 'near-edge', frontK: null }, sl: 1, tp: 2 } }, d);
    expect(noZone.res.status).toBe(400);
  });

  it('повторный next с exclude не отдаёт то же задание (taskId)', async () => {
    const a = await find('limit-entry', { difficulty: 'medium', tf: '1h' }, '1h');
    const b = await next('limit-entry', { difficulty: 'medium', tf: '1h', exclude: [a.json.taskId] }, a.deps);
    if (b.res.status === 200) expect(b.json.taskId).not.toBe(a.json.taskId);
  });
});
