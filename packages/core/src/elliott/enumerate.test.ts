import { describe, expect, it } from 'vitest';
import { EW_ALGO_VERSION } from '../version';
import { ewCandles, ewIndexAt } from '../testing/elliott';
import { enumerateCounts } from './enumerate';

const scan = (id: 'EW-1' | 'EW-3' | 'EW-4', last: string, n: number, from: number, max = 5000) => {
  const c = ewCandles(id);
  const l = ewIndexAt(c, last);
  return { c, s: enumerateCounts(c.slice(0, l + n + 1), { nPoint: n, fromIndex: from, lastIndex: l, maxCounts: max }) };
};

describe('enumerateCounts (§7.1)', () => {
  it('EW-4: w3-next 5, w5-next 2, bc-next 2 (hard-критерий: два сценария с >= 5 точками)', () => {
    const { s } = scan('EW-4', '2026-08-26T12:00', 5, 180);
    expect(s.byScenario).toEqual({ 'w3-next': 5, 'w5-next': 2, 'bc-next': 2 });
    expect(s.algoVersion).toBe(EW_ALGO_VERSION);
    expect(s.truncated).toBe(false);
  });
  it('порядок вывода: amplitude убыв., затем время точки 0; bc-next хранит A единственной точкой коррекции', () => {
    const { s } = scan('EW-4', '2026-08-26T12:00', 5, 180);
    for (let i = 1; i < s.counts.length; i++) {
      const a = s.counts[i - 1]!;
      const b = s.counts[i]!;
      expect(a.amplitude > b.amplitude || (a.amplitude === b.amplitude && a.impulse[0]!.time <= b.impulse[0]!.time)).toBe(true);
    }
    for (const c of s.counts.filter((x) => x.scenario === 'bc-next')) {
      expect(c.impulse).toHaveLength(6);
      expect(c.correction!.points).toHaveLength(1);
      expect(c.correction!.points[0]!.label).toBe('A');
      expect(c.correction!.points[0]!.time).toBe(Date.parse('2026-08-26T12:00:00Z'));
    }
  });
  it('все разметки заканчиваются на lastIndex, bull и bear встречаются', () => {
    const { c, s } = scan('EW-4', '2026-08-26T12:00', 5, 180);
    const l = ewIndexAt(c, '2026-08-26T12:00');
    for (const x of s.counts) {
      const pts = [...x.impulse, ...(x.correction?.points ?? [])];
      expect(pts[pts.length - 1]!.index).toBe(l);
    }
    const bear = scan('EW-3', '2026-06-11T11:00', 5, 100);
    expect(bear.s.byScenario['trend-next']).toBeGreaterThanOrEqual(1);
    expect(bear.s.counts.some((x) => x.direction === 'bear')).toBe(true);
  });
  it('maxCounts: при превышении truncated = true и список обрезан', () => {
    const { s } = scan('EW-4', '2026-08-26T12:00', 5, 180, 3);
    expect(s.truncated).toBe(true);
    expect(s.counts.length).toBeLessThanOrEqual(3);
  });
  it('EW-6: допустимых разметок, оканчивающихся на 07-27 06:00, нет', () => {
    const c = ewCandles('EW-6');
    const l = ewIndexAt(c, '2026-07-27T06:00');
    expect(enumerateCounts(c.slice(0, l + 6), { nPoint: 5, fromIndex: 570, lastIndex: l, maxCounts: 5000 }).counts).toEqual([]);
  });
  it('fromIndex ограничивает точку 0', () => {
    const c = ewCandles('EW-1');
    const l = ewIndexAt(c, '2026-08-09T22:00');
    const late = enumerateCounts(c.slice(0, l + 6), { nPoint: 5, fromIndex: ewIndexAt(c, '2026-08-07T00:00'), lastIndex: l, maxCounts: 5000 });
    expect(late.counts.filter((x) => x.scenario === 'abc-next').map((x) => x.impulse[0]!.time)).toEqual([Date.parse('2026-08-07T05:00:00Z')]);
  });
});
