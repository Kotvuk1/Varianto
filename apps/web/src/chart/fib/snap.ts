import type { Anchor, Candle } from '@tl/core';
import { localExtremeIndex, sideByPrice } from '../smc/rules';

/**
 * Снап якоря сетки к экстремуму: сторона (high/low) - по касанию внутри свечи, свеча - локальный экстремум
 * этой стороны в радиусе SWING_RADIUS (как swing-снап). Время - openTime свечи экстремума.
 */
export function snapFibAnchor(candles: readonly Candle[], i: number, price: number): Anchor {
  const c0 = candles[Math.min(candles.length - 1, Math.max(0, i))]!;
  const side = sideByPrice(c0, price);
  const k = localExtremeIndex(candles, i, side);
  const c = candles[k]!;
  return { time: c.openTime, price: side === 'high' ? c.high : c.low };
}
