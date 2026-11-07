import { describe, expect, it } from 'vitest';
import { btc1h, btc4h, visibleAt } from '../testing/cur';
import { candidateZones, computeZones, levelZone, pickZoneReference, rankStrength, zoneShare } from './zone';
import { htfClosedBefore } from './generate';

const h1 = btc1h();
const h4 = btc4h();
const setAt = (iso: string) => {
  const { visible, T } = visibleAt(h1, iso);
  return computeZones(visible, htfClosedBefore(h4, T, 500))!;
};

describe('levelZone (§3.1)', () => {
  it('зона = разброс экстремумов кластера; минимум высоты 0.2*A вокруг центра', () => {
    expect(levelZone({ low: 100, high: 105, center: 102 }, 10)).toEqual({ bottom: 100, top: 105 });
    // высота 1 < 0.2*10 = 2: расширение до центра +-1, но не уже исходных краёв
    expect(levelZone({ low: 101.5, high: 102.5, center: 102 }, 10)).toEqual({ bottom: 101, top: 103 });
    expect(levelZone({ low: 100, high: 100, center: 100 }, 10)).toEqual({ bottom: 99, top: 101 });
    expect(levelZone({ low: 100, high: 101, center: 100.5 }, 10)).toEqual({ bottom: 99.5, top: 101.5 });
  });
});

describe('сила уровня и ранжирование (§3.2, LV-1, LV-2)', () => {
  it('LV-1: сильнейшее сопротивление [79384.4-79737.3], strength 18.5; второй 77588 - 14.5', () => {
    const s = setAt('2026-09-12T00:00:00Z');
    expect(s.P).toBe(77251.8);
    expect(s.A).toBeCloseTo(777.7429, 4);
    const res = candidateZones(s, 'resistance', 5);
    const ref = res[0]!;
    expect([ref.bottom, ref.top, ref.touches, ref.reactions, ref.recency, ref.htf, ref.strength, ref.flip]).toEqual([79384.4, 79737.3, 12, 10, 0.5, 1, 18.5, true]);
    expect(ref.dist).toBeCloseTo(2.742, 3);
    expect(ref.lastTouchIndex).toBe(s.last - 59); // age 59 -> recency 0.5
    const second = res[1]!;
    expect([second.bottom, second.top, second.touches, second.reactions, second.recency, second.htf, second.strength]).toEqual([77422.8, 77767.8, 9, 7, 1, 1, 14.5]);
    expect(pickZoneReference(res, 3)).not.toBeNull();
    expect(pickZoneReference(res, 3)!.ref).toBe(ref);
  });

  it('LV-2: эталон [77291.2-77469.3] strength 16.5 (10 касаний, 9 реакций); второй 7.5', () => {
    const s = setAt('2026-09-16T12:00:00Z');
    const res = candidateZones(s, 'resistance', 5);
    const ref = res[0]!;
    expect([ref.bottom, ref.top, ref.touches, ref.reactions, ref.strength]).toEqual([77291.2, 77469.3, 10, 9, 16.5]);
    expect(res[1]!.strength).toBe(7.5);
    expect(s.A).toBeCloseTo(370.2071, 4);
  });

  it('rankStrength: сила, затем касания, свежесть, близость; кандидаты других ролей и вне дистанции отсекаются', () => {
    const s = setAt('2026-09-12T00:00:00Z');
    const ranked = rankStrength(s.zones, s.P);
    for (let i = 1; i < ranked.length; i++) expect(ranked[i - 1]!.strength).toBeGreaterThanOrEqual(ranked[i]!.strength);
    for (const z of candidateZones(s, 'support', 5)) expect(z.role).toBe('support');
    for (const z of candidateZones(s, null, 1)) expect(z.dist).toBeLessThanOrEqual(1);
  });

  it('отрыв силы от второго кандидата < 1 -> эталона нет; касаний меньше порога -> нет', () => {
    const s = setAt('2026-09-12T00:00:00Z');
    const res = candidateZones(s, 'resistance', 5);
    expect(pickZoneReference([{ ...res[0]!, strength: res[1]!.strength + 0.5 }, res[1]!], 3)).toBeNull();
    expect(pickZoneReference(res, 13)).toBeNull();
    expect(pickZoneReference([], 2)).toBeNull();
    expect(pickZoneReference([res[0]!], 2)!.second).toBeNull();
  });

  it('zoneShare: доля перекрытия зоны', () => {
    expect(zoneShare(0, 10, { bottom: 5, top: 15 })).toBe(0.5);
    expect(zoneShare(20, 30, { bottom: 5, top: 15 })).toBe(0);
    expect(zoneShare(0, 10, { bottom: 5, top: 5 })).toBe(0);
  });

  it('детерминизм и отсутствие ATR: нет зон при коротком ряде', () => {
    const { visible, T } = visibleAt(h1, '2026-09-12T00:00:00Z');
    const a = computeZones(visible, htfClosedBefore(h4, T, 500))!;
    const b = computeZones(visible, htfClosedBefore(h4, T, 500))!;
    expect(a.zones.map((z) => z.strength)).toEqual(b.zones.map((z) => z.strength));
    expect(computeZones(visible.slice(0, 10), null)).toBeNull();
    expect(computeZones([], null)).toBeNull();
    // без старшего ТФ htf = 0
    expect(computeZones(visible, null)!.zones.every((z) => z.htf === 0)).toBe(true);
  });
});
