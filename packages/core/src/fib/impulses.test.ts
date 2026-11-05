import { describe, expect, it } from 'vitest';
import { FIB_ALGO_VERSION } from '../version';
import { fibCandles, indexAtIso, type FibSeriesId } from '../testing/fib';
import { findImpulses } from './impulses';
import { UNCLOSED } from './test-helpers';

// Golden FG-1..FG-8: значения FIBONACCI.md §12.2 (вручную по реальным свечам), nExt = 5.
const T = (s: string) => Date.parse(s + 'Z');

interface Expect {
  series: FibSeriesId;
  breakAt: string;
  kind: 'bos' | 'choch';
  dir: 'bull' | 'bear';
  a: [string, number];
  b: [string, number];
  candles: number;
  rangeAtr: number;
  atrA?: number;
}
const ACCEPTED: Expect[] = [
  { series: 'FG-1', breakAt: '2026-09-21T08:00:00', kind: 'bos', dir: 'bull', a: ['2026-09-20T00:00:00', 80095.9], b: ['2026-09-21T20:00:00', 87385.1], candles: 11, rangeAtr: 7.994, atrA: 911.85 },
  { series: 'FG-1', breakAt: '2026-09-18T12:00:00', kind: 'choch', dir: 'bull', a: ['2026-09-15T16:00:00', 74909.4], b: ['2026-09-19T12:00:00', 81933.9], candles: 23, rangeAtr: 6.907 },
  { series: 'FG-1', breakAt: '2026-09-08T04:00:00', kind: 'choch', dir: 'bear', a: ['2026-09-06T20:00:00', 80536.1], b: ['2026-09-08T12:00:00', 77600.1], candles: 10, rangeAtr: 6.873 },
  { series: 'FG-1', breakAt: '2026-09-15T20:00:00', kind: 'bos', dir: 'bear', a: ['2026-09-14T20:00:00', 79570.9], b: ['2026-09-15T16:00:00', 74909.4], candles: 5, rangeAtr: 6.512 },
  { series: 'FG-3', breakAt: '2026-10-02T18:00:00', kind: 'choch', dir: 'bear', a: ['2026-10-02T08:00:00', 2779.0], b: ['2026-10-02T18:00:00', 2647.9], candles: 10, rangeAtr: 7.162, atrA: 18.3057 },
  { series: 'FG-4', breakAt: '2026-09-11T12:00:00', kind: 'choch', dir: 'bull', a: ['2026-09-10T12:00:00', 2403.33], b: ['2026-09-11T12:00:00', 2666.0], candles: 6, rangeAtr: 7.704 },
  { series: 'FG-4', breakAt: '2026-09-10T12:00:00', kind: 'bos', dir: 'bear', a: ['2026-09-09T08:00:00', 2522.75], b: ['2026-09-10T12:00:00', 2403.33], candles: 7, rangeAtr: 3.836 },
  { series: 'FG-4', breakAt: '2026-09-15T20:00:00', kind: 'choch', dir: 'bear', a: ['2026-09-11T12:00:00', 2666.0], b: ['2026-09-15T16:00:00', 2357.0], candles: 25, rangeAtr: 6.308 },
  { series: 'FG-6', breakAt: '2026-07-20T00:00:00', kind: 'choch', dir: 'bull', a: ['2026-07-19T18:00:00', 75.31], b: ['2026-07-20T01:00:00', 77.39], candles: 28, rangeAtr: 7.724, atrA: 0.2693 },
  { series: 'FG-7', breakAt: '2026-07-16T17:45:00', kind: 'bos', dir: 'bear', a: ['2026-07-16T15:15:00', 76.85], b: ['2026-07-16T17:45:00', 75.34], candles: 10, rangeAtr: 3.768 },
  { series: 'FG-8', breakAt: '2026-08-11T07:15:00', kind: 'bos', dir: 'bear', a: ['2026-08-10T20:30:00', 76.47], b: ['2026-08-11T07:15:00', 75.36], candles: 43, rangeAtr: 6.816 },
];

describe('findImpulses: принятые импульсы (golden FG-1..FG-8)', () => {
  for (const e of ACCEPTED) {
    it(`${e.series}: ${e.kind} ${e.dir} ${e.breakAt}`, () => {
      const c = fibCandles(e.series);
      const scan = findImpulses(c, { nExt: 5 });
      expect(scan.algoVersion).toBe(FIB_ALGO_VERSION);
      const imp = scan.impulses.find((i) => i.event.breakTime === T(e.breakAt) && i.direction === e.dir);
      expect(imp, 'импульс найден').toBeDefined();
      expect(imp!.event.kind).toBe(e.kind);
      expect(imp!.a.index).toBe(indexAtIso(c, e.a[0] + 'Z'));
      expect(imp!.a.price).toBe(e.a[1]);
      expect(imp!.b.index).toBe(indexAtIso(c, e.b[0] + 'Z'));
      expect(imp!.b.price).toBe(e.b[1]);
      expect(imp!.candles).toBe(e.candles);
      expect(imp!.confirmedIndex).toBe(imp!.b.index + 5);
      expect(imp!.rangeAtr).toBeCloseTo(e.rangeAtr, 3);
      if (e.atrA) expect(imp!.atrA).toBeCloseTo(e.atrA, 4);
    });
  }
});

describe('findImpulses: отказы (§3.4)', () => {
  const rej = (series: FibSeriesId, at: string) =>
    findImpulses(fibCandles(series), { nExt: 5 }).rejected.find((r) => r.event.breakTime === T(at))?.reason;
  it('A_NOT_SWING: BOS bull 09-06 20:00 (минимум - внутренний swing)', () => {
    expect(rej('FG-1', '2026-09-06T20:00:00')).toBe('A_NOT_SWING');
  });
  it('A_NOT_EXTREME: BOS bear 09-10 12:00 (свеча B перекрывает A)', () => {
    expect(rej('FG-1', '2026-09-10T12:00:00')).toBe('A_NOT_EXTREME');
  });
  it('BREAK_AFTER_B: CHoCH bear 10-24 12:00 (BTC 4h) и CHoCH bear 07-15 19:45 (SOL 15m)', () => {
    expect(rej('FG-1', '2026-10-24T12:00:00')).toBe('BREAK_AFTER_B');
    expect(rej('FG-7', '2026-07-15T19:45:00')).toBe('BREAK_AFTER_B');
  });
  it('принятый и отклонённый не пересекаются', () => {
    const scan = findImpulses(fibCandles('FG-1'), { nExt: 5 });
    const acc = new Set(scan.impulses.map((i) => i.event.breakIndex));
    for (const r of scan.rejected) expect(acc.has(r.event.breakIndex)).toBe(false);
  });
});

describe('findImpulses: инварианты', () => {
  it('инвариант префикса: импульс, найденный на candles[0..T], равен найденному на полном ряду (FG-1)', () => {
    const c = fibCandles('FG-1');
    const full = findImpulses(c, { nExt: 5 });
    for (const imp of full.impulses) {
      const prefix = findImpulses(c.slice(0, imp.confirmedIndex + 1), { nExt: 5 });
      const same = prefix.impulses.find((p) => p.event.breakIndex === imp.event.breakIndex && p.direction === imp.direction);
      expect(same, `импульс ${imp.event.breakIndex}`).toBeDefined();
      expect(same!.a.index).toBe(imp.a.index);
      expect(same!.b.index).toBe(imp.b.index);
    }
  });

  it('детерминизм: два вызова дают одно и то же', () => {
    const c = fibCandles('FG-3');
    expect(findImpulses(c, { nExt: 5 })).toEqual(findImpulses(c, { nExt: 5 }));
  });

  it('незакрытая свеча не участвует (не может быть A/B)', () => {
    const c = fibCandles('FG-3');
    const withOpen = [...c.slice(0, 300), UNCLOSED(c[299]!, 1e9)];
    const a = findImpulses(c.slice(0, 300), { nExt: 5 });
    const b = findImpulses(withOpen, { nExt: 5 });
    expect(b.impulses).toEqual(a.impulses);
    expect(b.pending).toEqual(a.pending);
  });

  it('pending: B у правого края - кандидат, не принятый импульс (FG-1, срез до B + 2 свечи)', () => {
    const c = fibCandles('FG-1');
    const b = indexAtIso(c, '2026-09-21T20:00:00Z');
    const scan = findImpulses(c.slice(0, b + 3), { nExt: 5 });
    expect(scan.impulses.find((i) => i.b.index === b)).toBeUndefined();
    const p = scan.pending.find((x) => x.b.index === b);
    expect(p).toBeDefined();
    expect(p!.a.price).toBe(80095.9);
    expect(p!.b.price).toBe(87385.1);
  });
});
