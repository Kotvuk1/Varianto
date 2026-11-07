import { describe, expect, it } from 'vitest';
import { ewCandles, ewIndexAt } from '../testing/elliott';
import { findWaveCandidates, zigzagPivots } from './candidates';

const EASY = { nPivot: 7, withCorrection: false, minSizeAtr: 6, minWaveAtr: 1, minGuides: 2 };
const MEDIUM = { nPivot: 5, withCorrection: true, minSizeAtr: 6, minWaveAtr: 1, minGuides: 0 };
const iso = (t: number) => new Date(t).toISOString().slice(0, 16);

describe('findWaveCandidates (§7.2)', () => {
  it('EW-1 easy (N=7): единственный чистый импульс, 5/5 рекомендаций, confirmedIndex = точка 5 + N', () => {
    const c = ewCandles('EW-1');
    const T = ewIndexAt(c, '2026-08-10T05:00');
    const list = findWaveCandidates(c.slice(0, T + 1), EASY);
    expect(list).toHaveLength(1);
    const x = list[0]!;
    expect(iso(x.count.impulse[0]!.time)).toBe('2026-08-06T23:00');
    expect(x.count.scenario).toBe('abc-next');
    expect(x.guides).toBe(5);
    expect(x.size).toBeCloseTo(14.7105, 3);
    expect(x.confirmedIndex).toBe(ewIndexAt(c, '2026-08-09T22:00') + 7);
    expect(x.corrRetr).toBeNull();
  });
  it('EW-3 medium (N=5): 9 подряд pivot, corrRetr 0.7294, zigzag', () => {
    const c = ewCandles('EW-3');
    const T = ewIndexAt(c, '2026-06-11T16:00');
    const list = findWaveCandidates(c.slice(0, T + 1), MEDIUM);
    expect(list).toHaveLength(1);
    expect(list[0]!.corrRetr).toBeCloseTo(0.7294, 4);
    expect(list[0]!.count.correction!.type).toBe('zigzag');
    expect(list[0]!.count.scenario).toBe('trend-next');
    expect(list[0]!.confirmedIndex).toBe(ewIndexAt(c, '2026-06-11T11:00') + 5);
  });
  it('минимум рекомендаций отсекает кандидатов (EW-3 имеет 2 из 5: minGuides 3 - пусто)', () => {
    const c = ewCandles('EW-3');
    const T = ewIndexAt(c, '2026-06-11T16:00');
    expect(findWaveCandidates(c.slice(0, T + 1), { ...MEDIUM, minGuides: 3 })).toEqual([]);
  });
  it('EW-5: corrRetr 0.2320 < 0.236 - не годится для medium; EW-2: 4h с N=5 не чистый импульс', () => {
    const c4 = ewCandles('EW-4');
    expect(findWaveCandidates(c4.slice(0, ewIndexAt(c4, '2026-08-29T12:00') + 1), MEDIUM)).toEqual([]);
    const e = ewCandles('EW-2');
    expect(findWaveCandidates(e.slice(0, ewIndexAt(e, '2026-10-22T12:00') + 1), MEDIUM)).toEqual([]);
    expect(findWaveCandidates(e.slice(0, ewIndexAt(e, '2026-10-22T12:00') + 1), EASY)).toEqual([]); // не проходит minGuides = 2
  });
  it('EW-6 (самая короткая 3-я) не кандидат', () => {
    const c = ewCandles('EW-6');
    const T = ewIndexAt(c, '2026-07-27T12:00');
    const list = findWaveCandidates(c.slice(0, T + 1), { ...EASY, minGuides: 0, minSizeAtr: 0, minWaveAtr: 0 });
    expect(list.every((x) => x.count.impulse[0]!.time !== Date.parse('2026-07-25T08:00:00Z'))).toBe(true);
  });
  it('инвариант префикса: детектор на candles[0..T] находит тот же кандидат, что и на полном ряду', () => {
    const c = ewCandles('EW-1');
    const T = ewIndexAt(c, '2026-08-10T05:00');
    const full = findWaveCandidates(c, EASY).find((x) => iso(x.count.impulse[0]!.time) === '2026-08-06T23:00')!;
    const pre = findWaveCandidates(c.slice(0, T + 1), EASY)[0]!;
    expect(pre.count.impulse.map((p) => p.time)).toEqual(full.count.impulse.map((p) => p.time));
    expect(pre.size).toBe(full.size);
  });
  it('zigzagPivots: типы чередуются, одноимённые сжимаются в более экстремальный', () => {
    const c = ewCandles('EW-1');
    const piv = zigzagPivots(c, 5);
    for (let i = 1; i < piv.length; i++) expect(piv[i]!.type).not.toBe(piv[i - 1]!.type);
  });
});
