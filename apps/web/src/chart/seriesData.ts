import type { UTCTimestamp, CandlestickData, HistogramData } from 'lightweight-charts';
import type { Candle } from '@tl/core';
import { withAlpha, type ChartTokens } from './theme/chartTokens';

/** Единая точка «сейчас» (Challenge): график не получает свечи, открывшиеся в момент now или позже. */
export function limitCandles(candles: readonly Candle[], now?: number): readonly Candle[] {
  if (now === undefined) return candles;
  return candles.filter((c) => c.openTime < now);
}

export const OPEN_CANDLE_ALPHA = 0.45;

export function toCandleData(c: Candle, t: ChartTokens): CandlestickData {
  const up = c.close >= c.open;
  const fill = up ? t.candleBullFill : t.candleBearFill;
  const border = up ? t.candleBull : t.candleBear;
  const wick = up ? t.wickBull : t.wickBear;
  const base: CandlestickData = {
    time: (c.openTime / 1000) as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
  if (c.closed) return { ...base, color: fill, borderColor: border, wickColor: wick };
  // Незакрытая свеча: полупрозрачная (плюс пунктирный контур и бейдж «Идёт» рисует DrawingPrimitive).
  return {
    ...base,
    color: withAlpha(fill, OPEN_CANDLE_ALPHA),
    borderColor: withAlpha(border, 0.7),
    wickColor: withAlpha(wick, 0.7),
  };
}

export function toVolumeData(c: Candle, t: ChartTokens): HistogramData {
  return {
    time: (c.openTime / 1000) as UTCTimestamp,
    value: c.volume,
    color: c.close >= c.open ? t.volumeBull : t.volumeBear,
  };
}

export function pricePrecision(price: number): number {
  if (price >= 10000) return 1;
  if (price >= 100) return 2;
  if (price >= 1) return 4;
  return 6;
}
