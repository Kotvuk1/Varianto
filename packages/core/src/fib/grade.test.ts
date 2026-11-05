import { describe, expect, it } from 'vitest';
import { fibCandles, indexAtIso, type FibSeriesId } from '../testing/fib';
import type { Candle, Mark } from '../types';
import { gradeFibExtension, gradeFibGrid, gradeFibReaction } from './grade';
import { buildExtensionRef, buildGridRef, buildReactionRef } from './ref';
import type { FibConfluenceKey, FibDirection, FibReactionOption, FibTarget } from './types';

// Golden FIBONACCI.md §5.3, §12.2: оценка ответов на реальных свечах Binance.
const at = (c: Candle[], iso: string) => indexAtIso(c, iso + ':00Z');
const user = (kind: Mark['kind'], pts: { t: number; p: number }[]): Mark => ({
  id: 'u1', kind, anchors: pts.map((x) => ({ time: x.t, price: x.p })), scope: null, direction: null, author: 'user',
});
/** Якорь пользователя на свече: цена - экстремум стороны (магнит клиента). */
const pt = (c: Candle[], iso: string, side: 'low' | 'high') => {
  const k = c[at(c, iso)]!;
  return { t: k.openTime, p: k[side] };
};

function grid(series: FibSeriesId, tf: '15m' | '1h' | '4h', a: string, b: string, u = 0) {
  const c = fibCandles(series);
  const bi = at(c, b);
  const ref = buildGridRef(c.slice(0, bi + 5 + u + 1), { nExt: 5, aTime: c[at(c, a)]!.openTime, bTime: c[bi]!.openTime })!;
  expect(ref).not.toBeNull();
  const snap = { candles: c.slice(0, bi + 5 + u + 1), tf };
  return { c, ref, snap };
}

describe('gradeFibGrid: FG-1 (§5.3)', () => {
  const g = () => grid('FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', 10);
  it('начало Δ+1, конец точно -> correct, 2 точки, OK_FIB_ANCHOR', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-20T04:00', 'low'), pt(c, '2026-09-21T20:00', 'high')]) });
    expect(r.verdict).toBe('correct');
    expect(r.score).toBe(1);
    expect(r.errors).toEqual([]);
    expect(r.ok.map((x) => x.code)).toEqual(['OK_FIB_ANCHOR']);
    expect(r.skillOutcomes).toEqual([{ skill: 'fib-anchor', correct: 2, total: 2 }]);
    expect(r.detail.anchors).toHaveLength(2);
    expect(r.detail.anchors[0]).toMatchObject({ point: 'A', offsetCandles: 1, ok: true, equalExtreme: false });
    expect(r.detail.gridShift).toBeCloseTo((81295 - 80095.9 > 0 ? Math.abs(c[at(c, '2026-09-20T04:00')]!.low - 80095.9) : 0) / (87385.1 - 80095.9), 9);
    expect(r.reference[0]!.kind).toBe('fib-retracement');
  });
  it('начало на предыдущей ноге (74909.4) -> partial, FIB_WRONG_ANCHOR_START, previous-leg', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-15T16:00', 'low'), pt(c, '2026-09-21T20:00', 'high')]) });
    expect(r.verdict).toBe('partial');
    expect(r.score).toBe(0.5);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatchObject({ code: 'FIB_WRONG_ANCHOR_START', skill: 'fib-anchor', severity: 'major' });
    expect(String(r.errors[0]!.params!.reasonText)).toContain('предыдущей ноги');
    expect(r.errors[0]!.params!.userPrice).toBe(74909.4);
    expect(r.skillOutcomes[0]).toEqual({ skill: 'fib-anchor', correct: 1, total: 2 });
  });
  it('от конца к началу -> FIB_WRONG_DIRECTION, 0 очков', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-21T20:00', 'high'), pt(c, '2026-09-20T00:00', 'low')]) });
    expect(r.verdict).toBe('incorrect');
    expect(r.errors.map((e) => e.code)).toEqual(['FIB_WRONG_DIRECTION']);
    expect(r.detail.anchors.every((a) => !a.ok)).toBe(true);
    expect(r.detail.direction).toEqual({ user: 'bear', ref: 'bull' });
  });
  it('от конца вниз к 09-24 08:00 -> FIB_NOT_IMPULSE (correction)', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-21T20:00', 'high'), pt(c, '2026-09-24T08:00', 'low')]) });
    expect(r.errors.map((e) => e.code)).toEqual(['FIB_NOT_IMPULSE']);
    expect(String(r.errors[0]!.params!.legText)).toContain('коррекции');
    expect(r.verdict).toBe('incorrect');
  });
  it('горизонтальная сетка (одна цена) и i0 >= i1 -> FIB_NOT_IMPULSE (other), 0 очков', () => {
    const { c, ref, snap } = g();
    const k = c[at(c, '2026-09-20T00:00')]!;
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [{ t: k.openTime, p: 100 }, { t: k.openTime + 4 * 3600_000, p: 100 }]) });
    expect(r.errors[0]).toMatchObject({ code: 'FIB_NOT_IMPULSE' });
    expect(r.detail.direction.user).toBeNull();
    expect(r.detail.gridShift).toBeNull();
    expect(Number.isFinite(r.detail.anchors[0]!.snappedPrice)).toBe(true);
    // направление по цене - вверх, но по времени сетка перевёрнута (i0 > i1)
    const kb = c[at(c, '2026-09-21T20:00')]!;
    const ka = c[at(c, '2026-09-20T00:00')]!;
    const r2 = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [{ t: kb.openTime, p: 1 }, { t: ka.openTime, p: 2 }]) });
    expect(r2.errors[0]!.code).toBe('FIB_NOT_IMPULSE');
    expect(r2.errors[0]!.code).toBe('FIB_NOT_IMPULSE'); // i0 > i1, направление пользователя совпадает по цене? bear/bull зависит от цен
  });
  it('обе точки мимо, на предыдущей ноге -> FIB_NOT_IMPULSE previous-leg', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-02T08:00', 'low'), pt(c, '2026-09-03T20:00', 'high')]) });
    expect(r.errors[0]!.code).toBe('FIB_NOT_IMPULSE');
    expect(String(r.errors[0]!.params!.legText)).toContain('предыдущей');
  });
  it('конец не дотянут внутри ноги -> FIB_WRONG_ANCHOR_END (short)', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-20T00:00', 'low'), pt(c, '2026-09-21T00:00', 'high')]) });
    expect(r.errors[0]).toMatchObject({ code: 'FIB_WRONG_ANCHOR_END' });
    expect(String(r.errors[0]!.params!.reasonText)).toContain('не дотянута');
    expect(r.verdict).toBe('partial');
  });
  it('якорь вне видимого ряда -> ошибка FIB_ANCHOR_OUT_OF_RANGE', () => {
    const { c, ref, snap } = g();
    const far = c[c.length - 1]!;
    expect(() => gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-09-20T00:00', 'low'), { t: far.openTime, p: 99999 }]) })).toThrow('FIB_ANCHOR_OUT_OF_RANGE');
  });
});

describe('gradeFibGrid: FG-8 равные экстремумы (SOL 15m)', () => {
  const g = () => grid('FG-8', '15m', '2026-08-10T20:30', '2026-08-11T07:15', 10);
  it('начало 21:30 (Δ+4, H == A, внутри ноги) -> ok + OK_FIB_EQUAL_EXTREME, correct', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-08-10T21:30', 'high'), pt(c, '2026-08-11T07:15', 'low')]) });
    expect(r.verdict).toBe('correct');
    expect(r.detail.anchors[0]).toMatchObject({ ok: true, equalExtreme: true, offsetCandles: 4 });
    expect(r.ok.map((x) => x.code)).toEqual(['OK_FIB_ANCHOR', 'OK_FIB_EQUAL_EXTREME']);
    expect(r.detail.gridShift).toBe(0);
  });
  it('начало 22:00 (Δ+6, H 76.32) -> FIB_WRONG_ANCHOR_START internal', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-08-10T22:00', 'high'), pt(c, '2026-08-11T07:15', 'low')]) });
    expect(r.errors[0]).toMatchObject({ code: 'FIB_WRONG_ANCHOR_START' });
    expect(String(r.errors[0]!.params!.reasonText)).toContain('внутреннем откате');
    expect(r.verdict).toBe('partial');
  });
  it('начало 20:00 (Δ-2, H 76.35) -> ok по допуску, не равный экстремум', () => {
    const { c, ref, snap } = g();
    const r = gradeFibGrid(ref, snap, { kind: 'fib-grid', mark: user('fib-retracement', [pt(c, '2026-08-10T20:00', 'high'), pt(c, '2026-08-11T07:15', 'low')]) });
    expect(r.detail.anchors[0]).toMatchObject({ ok: true, equalExtreme: false, offsetCandles: -2 });
    expect(r.verdict).toBe('correct');
  });
});

function reaction(series: FibSeriesId, tf: '15m' | '1h' | '4h', a: string, b: string, d: 'easy' | 'medium' | 'hard') {
  const c = fibCandles(series);
  const bi = at(c, b);
  const T = bi + 5;
  const ref = buildReactionRef(c.slice(0, T + 1), c.slice(T + 1), { nExt: 5, tf, evalDifficulty: d, aTime: c[at(c, a)]!.openTime, bTime: c[bi]!.openTime })!;
  expect(ref).not.toBeNull();
  return { c, ref, snap: { candles: c.slice(0, T + 1), tf } };
}
const ans = (option: FibReactionOption, confluence: FibConfluenceKey[] = [], pd: 'premium' | 'discount' | null = null) => ({ kind: 'fib-reaction' as const, option, confluence, pd });

describe('gradeFibReaction (golden)', () => {
  it('FG-1 medium: 0.618 + FVG + premium -> correct, score 1, навыки', () => {
    const { ref, snap } = reaction('FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', 'medium');
    expect(ref.pd.asked).toBe(true);
    expect(ref.pd.expected).toBe('premium');
    expect(ref.options).toEqual(['0.382', '0.5', '0.618', '0.705', '0.786', 'ote']);
    const r = gradeFibReaction(ref, snap, ans('0.618', ['fvg'], 'premium'));
    expect(r.verdict).toBe('correct');
    expect(r.score).toBe(1);
    expect(r.errors).toEqual([]);
    expect(r.skillOutcomes).toEqual([
      { skill: 'fib-reaction', correct: 2, total: 2 },
      { skill: 'premium-discount', correct: 1, total: 1 },
    ]);
    expect(r.ok.map((x) => x.code)).toEqual(['OK_FIB_REACTION', 'OK_PD', 'OK_FIB_CONFLUENCE']);
    expect(r.detail.reaction!.correctOptions).toEqual(['0.618', 'ote']);
    expect(r.detail.reaction!.outcome.kind).toBe('reaction');
    expect(r.detail.reaction!.outcome.depth).toBeCloseTo(0.6246, 4);
    expect(r.replay!.candles.length).toBeGreaterThan(0);
    expect(r.replay!.candles[0]!.openTime).toBeGreaterThan(snap.candles[snap.candles.length - 1]!.openTime);
    expect(r.replay!.exitIndex).toBe(ref.outcome.index - ref.T - 1);
  });
  it('FG-1: ote тоже верно (наравне с точным уровнем)', () => {
    const { ref, snap } = reaction('FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', 'medium');
    expect(gradeFibReaction(ref, snap, ans('ote', [], 'premium')).verdict).toBe('correct');
  });
  it('FG-1: неверный PD и ложный конфлюэнс (order-block) -> FIB_PD_WRONG + FIB_CONFLUENCE_WRONG, partial', () => {
    const { ref, snap } = reaction('FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', 'medium');
    const r = gradeFibReaction(ref, snap, ans('0.618', ['order-block', 'fvg'], 'discount'));
    expect(r.errors.map((e) => e.code).sort()).toEqual(['FIB_CONFLUENCE_WRONG', 'FIB_PD_WRONG']);
    expect(r.verdict).toBe('partial');
    // 0.6*1 + 0.2*0 + 0.2*0.5 = 0.7
    expect(r.score).toBeCloseTo(0.7, 9);
    expect(r.skillOutcomes).toEqual([
      { skill: 'fib-reaction', correct: 2, total: 3 },
      { skill: 'premium-discount', correct: 0, total: 1 },
    ]);
  });
  it('FG-4: PD не задаётся (|0.4979-0.5| < 0.02); 0.705 при эталоне 0.786 -> FIB_LEVEL_MISS minor, levelScore 0.5', () => {
    const { ref, snap } = reaction('FG-4', '4h', '2026-09-10T12:00', '2026-09-11T12:00', 'medium');
    expect(ref.pd.asked).toBe(false);
    expect(ref.options).toEqual(['0.705', '0.786', 'ote']);
    const r = gradeFibReaction(ref, snap, ans('0.705'));
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatchObject({ code: 'FIB_LEVEL_MISS', severity: 'minor' });
    expect(r.detail.reaction!.levelScore).toBe(0.5);
    expect(r.detail.reaction!.pd.asked).toBe(false);
    expect(r.score).toBe(0.5);
    expect(r.verdict).toBe('partial');
    expect(r.skillOutcomes).toEqual([{ skill: 'fib-reaction', correct: 0, total: 1 }]);
    const wrongFar = gradeFibReaction(ref, snap, ans('deep'));
    expect(wrongFar.errors[0]).toMatchObject({ code: 'FIB_LEVEL_MISS' });
  });
  it('FG-5 hard: слом импульса, ответ 0.786 -> FIB_DEEP_MISSED (fail); deep верен', () => {
    const { ref, snap } = reaction('FG-4', '4h', '2026-09-09T08:00', '2026-09-10T12:00', 'hard');
    expect(ref.options).toEqual(['0.786', 'deep']);
    const r = gradeFibReaction(ref, snap, ans('0.786', [], 'discount'));
    expect(r.errors.map((e) => e.code)).toContain('FIB_DEEP_MISSED');
    expect(String(r.errors.find((e) => e.code === 'FIB_DEEP_MISSED')!.params!.endText)).toContain('сломан');
    expect(r.detail.reaction!.outcome.kind).toBe('fail');
    const good = gradeFibReaction(ref, snap, ans('deep', [], 'discount'));
    expect(good.verdict).toBe('correct');
  });
  it('FG-6 hard: ложный конфлюэнс на 0.618 (OB и swing есть, но эталон deep) -> FIB_DEEP_MISSED; confluence на выбранной зоне верен', () => {
    const { ref, snap } = reaction('FG-6', '15m', '2026-07-19T18:00', '2026-07-20T01:00', 'hard');
    expect(ref.referenceOption).toBe('deep');
    const r = gradeFibReaction(ref, snap, ans('0.618', ['order-block', 'level'], 'premium'));
    expect(r.errors.map((e) => e.code)).toEqual(['FIB_DEEP_MISSED']);
    expect(r.detail.reaction!.confluence.atChosen['order-block']).toBe(true);
    expect(r.detail.reaction!.confluence.atReference).toEqual({ 'order-block': false, fvg: false, level: false });
    // 0.6*0 + 0.2*1 + 0.2*1
    expect(r.score).toBeCloseTo(0.4, 9);
    expect(r.verdict).toBe('incorrect');
  });
  it('FG-7 medium: 0.5 у границы допуска верно', () => {
    const { ref, snap } = reaction('FG-7', '15m', '2026-07-16T15:15', '2026-07-16T17:45', 'medium');
    expect(ref.correct).toEqual(['0.5']);
    expect(gradeFibReaction(ref, snap, ans('0.5', [], 'discount')).verdict).toBe('correct');
  });
  it('payload-инвариант: FibDetail.anchors пуст для reaction, reference содержит сетку и level (meta.role)', () => {
    const { ref, snap } = reaction('FG-3', '1h', '2026-10-02T08:00', '2026-10-02T18:00', 'medium');
    const r = gradeFibReaction(ref, snap, ans('0.705', ['order-block', 'fvg'], 'discount'));
    expect(r.verdict).toBe('correct');
    expect(r.reference.map((m) => m.kind)).toContain('fib-retracement');
    expect(r.reference.find((m) => m.meta?.role === 'fib-reaction')!.anchors[0]!.price).toBe(2738.68);
    expect(r.reference.some((m) => m.kind === 'order-block')).toBe(true);
  });
});

function extension(series: FibSeriesId, tf: '15m' | '1h' | '4h', a: string, b: string, te: string, d: 'easy' | 'medium' | 'hard') {
  const c = fibCandles(series);
  const T = at(c, te);
  const ref = buildExtensionRef(c.slice(0, T + 1), c.slice(T + 1), { nExt: 5, tf, evalDifficulty: d, aTime: c[at(c, a)]!.openTime, bTime: c[at(c, b)]!.openTime });
  expect(ref).not.toBeNull();
  return { c, ref: ref!, snap: { candles: c.slice(0, T + 1), tf } };
}
const extAns = (c: Candle[], dir: FibDirection, a: string, b: string, cc: string, target: FibTarget) => {
  const [s1, s2] = dir === 'bull' ? (['low', 'high'] as const) : (['high', 'low'] as const);
  return { kind: 'fib-extension' as const, target, mark: user('fib-extension', [pt(c, a, s1), pt(c, b, s2), pt(c, cc, s1)]) };
};

describe('gradeFibExtension (golden)', () => {
  const FG2 = ['2026-09-06T20:00', '2026-09-08T12:00', '2026-09-09T08:00'] as const;
  it('FG-2 (reached 1.618): верные точки и цель -> correct, score 1', () => {
    const { c, ref, snap } = extension('FG-1', '4h', FG2[0], FG2[1], '2026-09-09T16:00', 'medium');
    expect(ref.outcome.reached).toBe('1.618');
    const r = gradeFibExtension(ref, snap, extAns(c, 'bear', ...FG2, '1.618'));
    expect(r.verdict).toBe('correct');
    expect(r.score).toBe(1);
    expect(r.ok.map((x) => x.code)).toEqual(['OK_EXT_POINTS', 'OK_EXT_TARGET']);
    expect(r.skillOutcomes).toEqual([
      { skill: 'fib-anchor', correct: 2, total: 2 },
      { skill: 'fib-extension', correct: 2, total: 2 },
    ]);
    expect(r.detail.anchors).toHaveLength(3);
    expect(r.detail.extension).toMatchObject({ reached: '1.618', target: '1.618' });
    expect(r.detail.extension!.xMax).toBeCloseTo(1.6444, 4);
    expect(r.replay!.exitIndex).not.toBeNull(); // инвалидация 09-18 12:00
  });
  it('FG-2: цель 1.272 - консервативная (0.5), 1.0 - 0.25, none - 0.25', () => {
    const { c, ref, snap } = extension('FG-1', '4h', FG2[0], FG2[1], '2026-09-09T16:00', 'medium');
    const r1 = gradeFibExtension(ref, snap, extAns(c, 'bear', ...FG2, '1.272'));
    expect(r1.errors.map((e) => e.code)).toEqual(['EXT_TARGET_CONSERVATIVE']);
    expect(r1.score).toBeCloseTo(0.5 + 0.25, 9);
    expect(r1.verdict).toBe('partial');
    const r2 = gradeFibExtension(ref, snap, extAns(c, 'bear', ...FG2, '1'));
    expect(r2.score).toBeCloseTo(0.5 + 0.125, 9);
    const r3 = gradeFibExtension(ref, snap, extAns(c, 'bear', ...FG2, 'none'));
    expect(r3.errors[0]!.code).toBe('EXT_TARGET_CONSERVATIVE');
    expect(r3.score).toBeCloseTo(0.625, 9);
  });
  it('FG-2: неверное направление -> EXT_WRONG_DIRECTION, точки не ok', () => {
    const { c, ref, snap } = extension('FG-1', '4h', FG2[0], FG2[1], '2026-09-09T16:00', 'medium');
    const flipped = extAns(c, 'bear', ...FG2, '1.618');
    flipped.mark.anchors[0]!.price = 1; // A ниже B: пользователь протянул вверх
    flipped.mark.anchors[1]!.price = 2;
    const r = gradeFibExtension(ref, snap, flipped);
    expect(r.errors[0]!.code).toBe('EXT_WRONG_DIRECTION');
    expect(r.detail.anchors.every((a) => !a.ok)).toBe(true);
    expect(r.verdict).not.toBe('correct');
  });
  it('FG-2: точка C на 2 свечи раньше - допуск; на 5 - EXT_WRONG_POINTS (навык fib-extension)', () => {
    const { c, ref, snap } = extension('FG-1', '4h', FG2[0], FG2[1], '2026-09-09T16:00', 'medium');
    const near = gradeFibExtension(ref, snap, extAns(c, 'bear', FG2[0], FG2[1], '2026-09-09T00:00', '1.618'));
    expect(near.detail.anchors[2]).toMatchObject({ ok: true, offsetCandles: -2 });
    const far = gradeFibExtension(ref, snap, extAns(c, 'bear', FG2[0], FG2[1], '2026-09-08T12:00', '1.618'));
    expect(far.errors.find((e) => e.code === 'EXT_WRONG_POINTS')).toMatchObject({ skill: 'fib-extension', params: { point: 'C' } });
    expect(far.skillOutcomes).toEqual([
      { skill: 'fib-anchor', correct: 2, total: 2 },
      { skill: 'fib-extension', correct: 1, total: 2 },
    ]);
  });
  it('FG-8 hard (reached 1.272): цель 1.618 -> EXT_TARGET_MISS; 1.272 -> correct; none допустим на hard', () => {
    const P = ['2026-08-10T20:30', '2026-08-11T07:15', '2026-08-11T11:00'] as const;
    const { c, ref, snap } = extension('FG-8', '15m', P[0], P[1], '2026-08-11T12:15', 'hard');
    expect(ref.outcome.reached).toBe('1.272');
    expect(ref.targetOptions).toEqual(['1', '1.272', '1.618', 'none']);
    const miss = gradeFibExtension(ref, snap, extAns(c, 'bear', ...P, '1.618'));
    expect(miss.errors.map((e) => e.code)).toEqual(['EXT_TARGET_MISS']);
    expect(miss.errors[0]!.severity).toBe('major');
    expect(String(miss.errors[0]!.params!.endText)).toContain('закрытием за точкой C');
    expect(miss.score).toBe(0.5);
    const good = gradeFibExtension(ref, snap, extAns(c, 'bear', ...P, '1.272'));
    expect(good.verdict).toBe('correct');
  });
  it('FG-1 (none): ответ none верен; ответ 1.0 - промах', () => {
    const P = ['2026-09-20T00:00', '2026-09-21T20:00', '2026-09-24T08:00'] as const;
    const { c, ref, snap } = extension('FG-1', '4h', P[0], P[1], '2026-09-27T04:00', 'hard');
    expect(ref.outcome.reached).toBe('none');
    expect(gradeFibExtension(ref, snap, extAns(c, 'bull', ...P, 'none')).verdict).toBe('correct');
    expect(gradeFibExtension(ref, snap, extAns(c, 'bull', ...P, '1')).errors[0]!.code).toBe('EXT_TARGET_MISS');
  });
});

describe('ref: отбраковка недопустимых конфигураций', () => {
  it('FG-5: фитиль за A без слома (depth 1.0097) - extension не строится (depth(C) >= 1)', () => {
    const c = fibCandles('FG-4');
    const a = at(c, '2026-09-11T12:00');
    const b = at(c, '2026-09-15T16:00');
    const te = at(c, '2026-09-20T00:00');
    expect(buildExtensionRef(c.slice(0, te + 1), c.slice(te + 1), { nExt: 5, tf: '4h', evalDifficulty: 'hard', aTime: c[a]!.openTime, bTime: c[b]!.openTime })).toBeNull();
  });
  it('FG-1 continuation (shallow): reaction-ref не строится', () => {
    const c = fibCandles('FG-1');
    const a = at(c, '2026-09-15T16:00');
    const b = at(c, '2026-09-19T12:00');
    expect(buildReactionRef(c.slice(0, b + 6), c.slice(b + 6), { nExt: 5, tf: '4h', evalDifficulty: 'hard', aTime: c[a]!.openTime, bTime: c[b]!.openTime })).toBeNull();
  });
  it('FG-2: 0.705 пройден до T - класс эталона недоступен как вариант (options без 0.705)', () => {
    const c = fibCandles('FG-1');
    const a = at(c, '2026-09-06T20:00');
    const b = at(c, '2026-09-08T12:00');
    const T = b + 5;
    const ref = buildReactionRef(c.slice(0, T + 1), c.slice(T + 1), { nExt: 5, tf: '4h', evalDifficulty: 'medium', aTime: c[a]!.openTime, bTime: c[b]!.openTime })!;
    expect(ref.dT).toBeCloseTo(0.7279, 4);
    expect(ref.options).toEqual(['0.786']);
    expect(ref.correct).toContain('0.705');
  });
});
