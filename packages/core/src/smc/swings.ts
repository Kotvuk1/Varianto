// detectSwings / pendingSwings / метки HH-HL-LH-LL (ALGORITHMS §2, §4).
import type { Candle, Scope, Swing, SwingLabel, SwingParams, SwingType } from '../types';

function mk(c: Candle, i: number, type: SwingType, right: number, scope: Scope): Swing {
  return {
    index: i,
    time: c.openTime,
    type,
    price: type === 'high' ? c.high : c.low,
    confirmedIndex: i + right,
    scope,
    label: null,
  };
}

/** Фрактальные swing (§2.2): слева строго, справа нестрого; порядок — по index, high раньше low. */
export function detectSwings(candles: readonly Candle[], p: SwingParams, scope: Scope = 'external'): Swing[] {
  const { left, right } = p;
  const out: Swing[] = [];
  for (let i = left; i <= candles.length - 1 - right; i++) {
    const c = candles[i]!;
    let isH = true;
    let isL = true;
    for (let j = i - left; j < i; j++) {
      if (!(candles[j]!.high < c.high)) isH = false;
      if (!(candles[j]!.low > c.low)) isL = false;
    }
    for (let j = i + 1; j <= i + right; j++) {
      if (!(candles[j]!.high <= c.high)) isH = false;
      if (!(candles[j]!.low >= c.low)) isL = false;
    }
    if (isH) out.push(mk(c, i, 'high', right, scope));
    if (isL) out.push(mk(c, i, 'low', right, scope));
  }
  return out;
}

/** Кандидаты у правого края (§2.4): справа меньше `right` закрытых свечей. */
export function pendingSwings(candles: readonly Candle[], p: SwingParams, scope: Scope = 'external'): Swing[] {
  const { left, right } = p;
  const n = candles.length;
  const out: Swing[] = [];
  for (let i = Math.max(left, n - right); i <= n - 1; i++) {
    const c = candles[i]!;
    let isH = true;
    let isL = true;
    for (let j = i - left; j < i; j++) {
      if (!(candles[j]!.high < c.high)) isH = false;
      if (!(candles[j]!.low > c.low)) isL = false;
    }
    for (let j = i + 1; j < n; j++) {
      if (!(candles[j]!.high <= c.high)) isH = false;
      if (!(candles[j]!.low >= c.low)) isL = false;
    }
    if (isH) out.push(mk(c, i, 'high', right, scope));
    if (isL) out.push(mk(c, i, 'low', right, scope));
  }
  return out;
}

/** Метки HH/HL/LH/LL (§4): сравнение с предыдущим swing того же типа; возвращает метки по порядку swings (не мутирует). */
export function labelSwings(swings: readonly Swing[]): (SwingLabel | null)[] {
  let prevHigh: number | null = null;
  let prevLow: number | null = null;
  return swings.map((s) => {
    if (s.type === 'high') {
      const label: SwingLabel | null = prevHigh === null ? null : s.price > prevHigh ? 'HH' : 'LH';
      prevHigh = s.price;
      return label;
    }
    const label: SwingLabel | null = prevLow === null ? null : s.price < prevLow ? 'LL' : 'HL';
    prevLow = s.price;
    return label;
  });
}
