// Снап края зоны уровня к фитилям и телам ближайших свингов (CURRICULUM_STAGES §3.1: зона - разброс экстремумов кластера).
import type { Candle } from '@tl/core';

const PIVOT = 2;

/** Цены краёв свингов (фитиль и ближний к нему край тела) в окне +-window свечей вокруг индекса i. */
export function zoneEdgeCandidates(candles: readonly Candle[], i: number, window = 12): number[] {
  const out: number[] = [];
  const from = Math.max(PIVOT, i - window);
  const to = Math.min(candles.length - 1 - PIVOT, i + window);
  for (let k = from; k <= to; k++) {
    const c = candles[k]!;
    let isHigh = true;
    let isLow = true;
    for (let j = k - PIVOT; j <= k + PIVOT; j++) {
      if (j === k) continue;
      if (candles[j]!.high >= c.high) isHigh = false;
      if (candles[j]!.low <= c.low) isLow = false;
    }
    if (isHigh) out.push(c.high, Math.max(c.open, c.close));
    if (isLow) out.push(c.low, Math.min(c.open, c.close));
  }
  return out;
}

/** Ближайшая к price цена края свинга в радиусе (единицы цены) либо исходная цена. */
export function snapZoneEdge(candles: readonly Candle[], i: number, price: number, radius: number, window = 12): number {
  let best = price;
  let bestD = radius;
  for (const p of zoneEdgeCandidates(candles, i, window)) {
    const d = Math.abs(p - price);
    // при равном удалении побеждает первый кандидат (фитиль раньше тела)
    if (d < bestD || (best === price && d <= radius)) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
