import { describe, expect, it } from 'vitest';
import { fibCandles, indexAtIso, type FibSeriesId } from '../testing/fib';
import { resolveExtension } from './extension';
import { fibExtensionPrice } from './levels';
import type { FibDirection, FibTarget } from './types';

// Golden FG-1..FG-8 (FIBONACCI.md §12.2): resolveExtension от Te.
interface Case {
  name: string;
  series: FibSeriesId;
  limit: number;
  dir: FibDirection;
  a: string;
  b: string;
  c: string;
  te: string;
  reached: FibTarget;
  xMax: number;
  extreme: number;
  extremeAt: string;
  inval?: string;
  end?: string;
}
const CASES: Case[] = [
  { name: 'FG-1 none без инвалидации', series: 'FG-1', limit: 60, dir: 'bull', a: '2026-09-20T00:00', b: '2026-09-21T20:00', c: '2026-09-24T08:00', te: '2026-09-27T04:00', reached: 'none', xMax: 0.606, extreme: 87249.6, extremeAt: '2026-10-02T12:00', end: '2026-10-07T04:00' },
  { name: 'FG-2 1.618 затем инвалидация', series: 'FG-1', limit: 60, dir: 'bear', a: '2026-09-06T20:00', b: '2026-09-08T12:00', c: '2026-09-09T08:00', te: '2026-09-09T16:00', reached: '1.618', xMax: 1.6444, extreme: 74909.4, extremeAt: '2026-09-15T16:00', inval: '2026-09-18T12:00' },
  { name: 'FG-3 1.272', series: 'FG-3', limit: 72, dir: 'bear', a: '2026-10-02T08:00', b: '2026-10-02T18:00', c: '2026-10-04T23:00', te: '2026-10-05T04:00', reached: '1.272', xMax: 1.5522, extreme: 2535.19, extremeAt: '2026-10-07T17:00', end: '2026-10-08T04:00' },
  { name: 'FG-4 none, инвалидация', series: 'FG-4', limit: 60, dir: 'bull', a: '2026-09-10T12:00', b: '2026-09-11T12:00', c: '2026-09-13T12:00', te: '2026-09-14T16:00', reached: 'none', xMax: 0.5889, extreme: 2614.99, extremeAt: '2026-09-14T20:00', inval: '2026-09-15T12:00' },
  { name: 'FG-6 1.618 с запасом', series: 'FG-6', limit: 96, dir: 'bull', a: '2026-07-19T18:00', b: '2026-07-20T01:00', c: '2026-07-20T06:30', te: '2026-07-20T08:00', reached: '1.618', xMax: 1.6442, extreme: 78.87, extremeAt: '2026-07-21T06:30', end: '2026-07-21T08:00' },
  { name: 'FG-7 1.618', series: 'FG-7', limit: 96, dir: 'bear', a: '2026-07-16T15:15', b: '2026-07-16T17:45', c: '2026-07-16T21:30', te: '2026-07-16T22:45', reached: '1.618', xMax: 1.8013, extreme: 73.32, extremeAt: '2026-07-17T13:30', end: '2026-07-17T22:45' },
  { name: 'FG-8 1.272 (1.618 не достигнут на 0.016)', series: 'FG-8', limit: 96, dir: 'bear', a: '2026-08-10T20:30', b: '2026-08-11T07:15', c: '2026-08-11T11:00', te: '2026-08-11T12:15', reached: '1.272', xMax: 1.6036, extreme: 74.57, extremeAt: '2026-08-11T15:30', inval: '2026-08-11T21:45' },
];

describe('resolveExtension (golden)', () => {
  for (const k of CASES) {
    it(k.name, () => {
      const c = fibCandles(k.series);
      const [a, b, ci, te] = [k.a, k.b, k.c, k.te].map((s) => indexAtIso(c, s + ':00Z')) as [number, number, number, number];
      const bull = k.dir === 'bull';
      const A = bull ? c[a]!.low : c[a]!.high;
      const B = bull ? c[b]!.high : c[b]!.low;
      const C = bull ? c[ci]!.low : c[ci]!.high;
      const o = resolveExtension({ candles: c, direction: k.dir, A, B, C, Te: te, limit: k.limit });
      expect(o.reached).toBe(k.reached);
      expect(o.xMax).toBeCloseTo(k.xMax, 3);
      expect(o.extremePrice).toBe(k.extreme);
      expect(o.extremeIndex).toBe(indexAtIso(c, k.extremeAt + ':00Z'));
      expect(o.invalidationIndex).toBe(k.inval ? indexAtIso(c, k.inval + ':00Z') : null);
      if (k.end) expect(o.endIndex).toBe(indexAtIso(c, k.end + ':00Z'));
      if (k.inval) expect(o.endIndex).toBe(o.invalidationIndex);
      expect(o.incomplete).toBe(false);
    });
  }

  it('FG-8: 1.618 не достигнут (74.57 > 74.554), 1.272 достигнут (74.57 <= 74.9381)', () => {
    expect(fibExtensionPrice(76.47, 75.36, 76.35, 1.618)).toBeCloseTo(74.554, 4);
    expect(fibExtensionPrice(76.47, 75.36, 76.35, 1.272)).toBeCloseTo(74.9381, 4);
  });

  it('экстремум свечи инвалидации засчитывается (high до закрытия)', () => {
    const c = fibCandles('FG-1');
    const [a, b, ci, te] = ['2026-09-20T00:00', '2026-09-21T20:00', '2026-09-24T08:00', '2026-09-27T04:00'].map((s) => indexAtIso(c, s + ':00Z')) as [number, number, number, number];
    const A = c[a]!.low;
    const B = c[b]!.high;
    const C = c[ci]!.low;
    const q = te + 1;
    // SYNTHETIC: первая свеча после Te закрывается за C, но её high достигает цели 1.0
    const mod = c.map((x, i) => (i === q ? { ...x, close: C - 1, high: fibExtensionPrice(A, B, C, 1) + 1 } : x));
    const o = resolveExtension({ candles: mod, direction: 'bull', A, B, C, Te: te, limit: 60 });
    expect(o.invalidationIndex).toBe(q);
    expect(o.reached).toBe('1');
  });

  it('incomplete: ряд короче Te + limit', () => {
    const c = fibCandles('FG-1');
    const [a, b, ci, te] = ['2026-09-20T00:00', '2026-09-21T20:00', '2026-09-24T08:00', '2026-09-27T04:00'].map((s) => indexAtIso(c, s + ':00Z')) as [number, number, number, number];
    const o = resolveExtension({ candles: c.slice(0, te + 10), direction: 'bull', A: c[a]!.low, B: c[b]!.high, C: c[ci]!.low, Te: te, limit: 60 });
    expect(o.incomplete).toBe(true);
    expect(o.endIndex).toBe(te + 9);
  });
});
