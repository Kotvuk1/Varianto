import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import { snapZoneEdge, zoneEdgeCandidates } from './snap';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: минимальный ряд с одним swing high (индекс 5) и одним swing low (индекс 10), не рыночные данные
const synthetic_candles: Candle[] = Array.from({ length: 16 }, (_, i) => {
  const base = i === 5 ? 120 : i === 10 ? 80 : 100;
  const high = i === 5 ? 130 : base + 4;
  const low = i === 10 ? 70 : base - 4;
  return { openTime: T0 + i * H, closeTime: T0 + (i + 1) * H - 1, open: base - 1, high, low, close: base + 1, volume: 1, quoteVolume: 1, trades: 1, closed: true };
});

describe('zoneEdgeCandidates', () => {
  it('swing high даёт фитиль и верх тела, swing low - фитиль и низ тела', () => {
    const c = zoneEdgeCandidates(synthetic_candles, 7, 8).sort((a, b) => a - b);
    expect(c).toContain(130);
    expect(c).toContain(121); // верх тела swing high: max(open 119, close 121)
    expect(c).toContain(70);
    expect(c).toContain(79); // низ тела swing low: min(open 79, close 81)
  });
  it('не берёт свинги вне окна', () => {
    expect(zoneEdgeCandidates(synthetic_candles, 15, 2)).toEqual([]);
  });
});

describe('snapZoneEdge', () => {
  it('прилипает к ближайшей цене свинга в радиусе (фитиль приоритетнее при равенстве нет - берётся ближайшая)', () => {
    expect(snapZoneEdge(synthetic_candles, 6, 128, 5)).toBe(130);
    expect(snapZoneEdge(synthetic_candles, 6, 122, 3)).toBe(121);
  });
  it('вне радиуса возвращает сырую цену', () => {
    expect(snapZoneEdge(synthetic_candles, 6, 150, 5)).toBe(150);
  });
});
