import { describe, expect, it } from 'vitest';
import { fibCandles, indexAtIso } from '../testing/fib';
import type { Candle, Mark } from '../types';
import { checkFibMarks } from './check';

// Терминал (§8): «сетка по реальному импульсу?» на реальных свечах FG-1 (BTCUSDT 4h).
const C = fibCandles('FG-1');
const upTo = (iso: string) => C.slice(0, indexAtIso(C, iso + ':00Z') + 1);
const pt = (iso: string, side: 'low' | 'high') => {
  const k = C[indexAtIso(C, iso + ':00Z')]!;
  return { time: k.openTime, price: k[side] };
};
const mark = (kind: 'fib-retracement' | 'fib-extension', ...anchors: { time: number; price: number }[]): Mark => ({
  id: `u-${kind}`, kind, anchors, scope: null, direction: null, author: 'user',
});
const series = (end: string): Candle[] => upTo(end);

describe('checkFibMarks', () => {
  it('сетка по реальному импульсу: нет ошибок, эталон найден', () => {
    const r = checkFibMarks(series('2026-09-27T04:00'), '4h', [mark('fib-retracement', pt('2026-09-20T00:00', 'low'), pt('2026-09-21T20:00', 'high'))]);
    expect(r.results).toHaveLength(1);
    expect(r.results[0]!.errors).toEqual([]);
    expect(r.results[0]!.impulse!.a.price).toBe(80095.9);
    expect(r.results[0]!.detail.anchors.every((a) => a.ok)).toBe(true);
    expect(r.feedback.mistakes).toEqual([]);
    expect(r.feedback.understood.some((b) => b.code === 'OK_FIB_ANCHOR')).toBe(true);
    expect(r.feedback.principle.templateKey).toBe('feedback.principle.fibonacci');
  });

  it('начало смещено на предыдущую ногу (в пределах 10 свечей от эталона) -> FIB_WRONG_ANCHOR_START', () => {
    const r = checkFibMarks(series('2026-09-27T04:00'), '4h', [mark('fib-retracement', pt('2026-09-19T00:00', 'low'), pt('2026-09-21T20:00', 'high'))]);
    expect(r.results[0]!.errors.map((e) => e.code)).toEqual(['FIB_WRONG_ANCHOR_START']);
  });

  it('далеко от любого импульса -> FIB_NOT_IMPULSE, impulse = null', () => {
    const r = checkFibMarks(series('2026-09-27T04:00'), '4h', [mark('fib-retracement', pt('2026-09-02T08:00', 'low'), pt('2026-09-03T20:00', 'high'))]);
    expect(r.results[0]!.impulse).toBeNull();
    expect(r.results[0]!.errors.map((e) => e.code)).toEqual(['FIB_NOT_IMPULSE']);
    expect(r.feedback.mistakes.length).toBe(1);
  });

  it('B ещё не подтверждён (справа < 5 свечей) -> FIB_IMPULSE_UNCONFIRMED (minor), эталон - pending', () => {
    const r = checkFibMarks(series('2026-09-21T20:00').concat(C.slice(indexAtIso(C, '2026-09-22T00:00:00Z'), indexAtIso(C, '2026-09-22T00:00:00Z') + 2)), '4h', [
      mark('fib-retracement', pt('2026-09-20T00:00', 'low'), pt('2026-09-21T20:00', 'high')),
    ]);
    expect(r.results[0]!.impulse).not.toBeNull();
    expect(r.results[0]!.errors.map((e) => [e.code, e.severity])).toEqual([['FIB_IMPULSE_UNCONFIRMED', 'minor']]);
  });

  it('extension A-B-C: верные точки без ошибок; C сильно мимо -> EXT_WRONG_POINTS (C)', () => {
    const good = checkFibMarks(series('2026-09-27T04:00'), '4h', [
      mark('fib-extension', pt('2026-09-20T00:00', 'low'), pt('2026-09-21T20:00', 'high'), pt('2026-09-24T08:00', 'low')),
    ]);
    expect(good.results[0]!.errors).toEqual([]);
    expect(good.results[0]!.detail.anchors).toHaveLength(3);
    const bad = checkFibMarks(series('2026-09-27T04:00'), '4h', [
      mark('fib-extension', pt('2026-09-20T00:00', 'low'), pt('2026-09-21T20:00', 'high'), pt('2026-09-22T16:00', 'low')),
    ]);
    expect(bad.results[0]!.errors.map((e) => [e.code, e.params!.point])).toEqual([['EXT_WRONG_POINTS', 'C']]);
  });

  it('метки других типов и якоря вне ряда игнорируются; будущее не используется', () => {
    const other: Mark = { id: 'x', kind: 'hline', anchors: [{ time: C[10]!.openTime, price: 80000 }], scope: null, direction: null, author: 'user' };
    const out: Mark = mark('fib-retracement', { time: 1, price: 1 }, { time: 2, price: 2 });
    const r = checkFibMarks(series('2026-09-27T04:00'), '4h', [other, out]);
    expect(r.results).toEqual([]);
    expect(r.feedback.mistakes).toEqual([]);
  });
});
