import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import { snapAnchor, snapPriceToCandle } from './snap';
import { TimeIndex } from './timeIndex';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
const c = (i: number, o: number, h: number, l: number, cl: number): Candle => ({
  openTime: T0 + i * H,
  closeTime: T0 + (i + 1) * H - 1,
  open: o,
  high: h,
  low: l,
  close: cl,
  volume: 1,
  quoteVolume: 1,
  trades: 1,
  closed: true,
});
// SYNTHETIC: минимальные числа для проверки арифметики снапа, не рыночные данные
const synthetic_candles = [c(0, 100, 110, 95, 105), c(1, 105, 120, 104, 118)];

describe('snapPriceToCandle', () => {
  it('выбирает ближайшее из O/H/L/C', () => {
    expect(snapPriceToCandle(synthetic_candles[0]!, 109)).toBe(110);
    expect(snapPriceToCandle(synthetic_candles[0]!, 96)).toBe(95);
    expect(snapPriceToCandle(synthetic_candles[0]!, 102.4)).toBe(100);
    expect(snapPriceToCandle(synthetic_candles[0]!, 103)).toBe(105);
  });
  it('не снапит дальше maxDistance', () => {
    expect(snapPriceToCandle(synthetic_candles[0]!, 140, 5)).toBe(140);
    expect(snapPriceToCandle(synthetic_candles[0]!, 108, 5)).toBe(110);
  });
});

describe('snapAnchor', () => {
  const idx = new TimeIndex(
    synthetic_candles.map((x) => x.openTime),
    H,
  );
  it('время - к openTime ближайшей свечи, цена - к OHLC', () => {
    const a = snapAnchor(synthetic_candles, idx, { time: T0 + H + 0.3 * H, price: 118.5 }, { price: true });
    expect(a).toEqual({ time: T0 + H, price: 118 });
  });
  it('без снапа цены цена не меняется, время снапится', () => {
    const a = snapAnchor(synthetic_candles, idx, { time: T0 + 0.2 * H, price: 107.7 }, { price: false });
    expect(a).toEqual({ time: T0, price: 107.7 });
  });
});
