import type { Anchor, Candle } from '@tl/core';
import type { TimeIndex } from './timeIndex';

/** Ближайшая к price цена из O/H/L/C свечи; если maxDistance задан и дальше - цена не меняется. */
export function snapPriceToCandle(candle: Candle, price: number, maxDistance = Infinity): number {
  let best = price;
  let bestD = Infinity;
  for (const p of [candle.open, candle.high, candle.low, candle.close]) {
    const d = Math.abs(p - price);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return bestD <= maxDistance ? best : price;
}

export interface SnapOptions {
  /** Снапить цену к OHLC свечи. Время снапится к openTime всегда. */
  price: boolean;
  /** Макс. расстояние снапа по цене (в единицах цены). */
  maxPriceDistance?: number;
}

export function snapAnchor(
  candles: readonly Candle[],
  index: TimeIndex,
  raw: Anchor,
  opts: SnapOptions,
): Anchor {
  if (candles.length === 0) return raw;
  const i = index.snapIndex(index.timeToLogical(raw.time));
  const candle = candles[i]!;
  return {
    time: candle.openTime,
    price: opts.price ? snapPriceToCandle(candle, raw.price, opts.maxPriceDistance) : raw.price,
  };
}
