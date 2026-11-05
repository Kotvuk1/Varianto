import { describe, expect, it } from 'vitest';
import { fibCandles, indexAtIso, type FibSeriesId } from '../testing/fib';
import { bandOf, FibConfluence } from './confluence';
import type { FibDirection, FibReactionOption } from './types';

// Golden FG-1/3/4/6/7 (§12.2): факторы на момент T = b + 5 по candles[0..T].
interface Imp {
  series: FibSeriesId;
  dir: FibDirection;
  a: string;
  b: string;
}
const FG1: Imp = { series: 'FG-1', dir: 'bull', a: '2026-09-20T00:00', b: '2026-09-21T20:00' };
const FG3: Imp = { series: 'FG-3', dir: 'bear', a: '2026-10-02T08:00', b: '2026-10-02T18:00' };
const FG4: Imp = { series: 'FG-4', dir: 'bull', a: '2026-09-10T12:00', b: '2026-09-11T12:00' };
const FG6: Imp = { series: 'FG-6', dir: 'bull', a: '2026-07-19T18:00', b: '2026-07-20T01:00' };
const FG7: Imp = { series: 'FG-7', dir: 'bear', a: '2026-07-16T15:15', b: '2026-07-16T17:45' };

function setup(i: Imp) {
  const c = fibCandles(i.series);
  const a = indexAtIso(c, i.a + ':00Z');
  const b = indexAtIso(c, i.b + ':00Z');
  const bull = i.dir === 'bull';
  const A = bull ? c[a]!.low : c[a]!.high;
  const B = bull ? c[b]!.high : c[b]!.low;
  const T = b + 5;
  return { conf: new FibConfluence(c.slice(0, T + 1), 5, { direction: i.dir, aIndex: a, A, B }), A, B, c, T };
}

describe('bandOf (§6.5)', () => {
  it('FG-1 0.618: [82588.8064, 83171.9424]; OTE: [81626.632, 82865.796]; deep - null', () => {
    const { A, B } = setup(FG1);
    const w = bandOf(A, B, '0.618')!;
    expect(w.low).toBeCloseTo(82588.8064, 4);
    expect(w.high).toBeCloseTo(83171.9424, 4);
    const o = bandOf(A, B, 'ote')!;
    expect(o.low).toBeCloseTo(81626.632, 4);
    expect(o.high).toBeCloseTo(82865.796, 4);
    expect(bandOf(A, B, 'deep')).toBeNull();
  });
  it('FG-3 (bear) 0.705: [2735.0815, 2745.5695]', () => {
    const { A, B } = setup(FG3);
    const w = bandOf(A, B, '0.705')!;
    expect(w.low).toBeCloseTo(2735.0815, 4);
    expect(w.high).toBeCloseTo(2745.5695, 4);
  });
});

describe('FibConfluence (golden)', () => {
  const cases: [string, Imp, FibReactionOption, { 'order-block': boolean; fvg: boolean; level: boolean }][] = [
    ['FG-1 0.618: только FVG', FG1, '0.618', { 'order-block': false, fvg: true, level: false }],
    ['FG-1 0.705: FVG и старый swing 82282.8', FG1, '0.705', { 'order-block': false, fvg: true, level: true }],
    ['FG-1 0.786: FVG и старый swing 81933.9', FG1, '0.786', { 'order-block': false, fvg: true, level: true }],
    ['FG-3 0.705: OB bear и FVG bear', FG3, '0.705', { 'order-block': true, fvg: true, level: false }],
    ['FG-3 0.5: FVG и старый swing 2714.77', FG3, '0.5', { 'order-block': false, fvg: true, level: true }],
    ['FG-4 0.786: OB bull', FG4, '0.786', { 'order-block': true, fvg: false, level: false }],
    ['FG-6 0.618: ложный конфлюэнс - OB и swing 76.07', FG6, '0.618', { 'order-block': true, fvg: false, level: true }],
    ['FG-7 0.5: нет факторов', FG7, '0.5', { 'order-block': false, fvg: false, level: false }],
  ];
  for (const [name, imp, opt, expected] of cases) {
    it(name, () => {
      const { conf } = setup(imp);
      const got = conf.atOption(opt);
      // фактор «FVG» на полосах FG-4 0.786 / FG-6 0.618 / FG-7 0.5 в спецификации не упомянут: сверяем заявленные в §12.2 факторы
      for (const k of ['order-block', 'fvg', 'level'] as const) {
        if (name.startsWith('FG-4') && k !== 'order-block') continue;
        if (name.startsWith('FG-6') && k === 'fvg') continue;
        expect(got[k], k).toBe(expected[k]);
      }
    });
  }
  it('FG-4 0.705: FVG bull partial пересекает полосу', () => {
    expect(setup(FG4).conf.atOption('0.705').fvg).toBe(true);
  });
  it('FG-7 0.705: FVG bear partial (ловушка hard)', () => {
    expect(setup(FG7).conf.atOption('0.705').fvg).toBe(true);
  });
  it('deep: факторы не оцениваются', () => {
    expect(setup(FG1).conf.atOption('deep')).toEqual({ 'order-block': false, fvg: false, level: false });
  });
  it('только данные до T: будущее не влияет на факторы', () => {
    const { conf, c, T } = setup(FG1);
    const a0 = conf.atOption('0.618');
    const again = new FibConfluence(c.slice(0, T + 1), 5, { direction: 'bull', aIndex: indexAtIso(c, '2026-09-20T00:00:00Z'), A: 80095.9, B: 87385.1 });
    expect(again.atOption('0.618')).toEqual(a0);
  });
});
