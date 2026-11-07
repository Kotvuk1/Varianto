// Fair Value Gap (ALGORITHMS §8).
import type { Candle, Fvg } from '../types';
import { atr14 } from './series';

export function detectFvgs(candles: readonly Candle[], minAtr: number): { fvgs: Fvg[]; small: Fvg[] } {
  const atr = atr14(candles);
  const fvgs: Fvg[] = [];
  const small: Fvg[] = [];
  const n = candles.length;
  for (let i = 1; i <= n - 2; i++) {
    const a = candles[i - 1]!;
    const m = candles[i]!;
    const b = candles[i + 1]!;
    let direction: 'bull' | 'bear';
    let top: number;
    let bottom: number;
    if (b.low > a.high) {
      direction = 'bull';
      bottom = a.high;
      top = b.low;
    } else if (b.high < a.low) {
      direction = 'bear';
      bottom = b.high;
      top = a.low;
    } else continue;
    const A = atr[i + 1]!;
    if (A === null || A === undefined) continue;
    const size = top - bottom;
    let status: Fvg['status'] = 'open';
    let statusIndex: number | null = null;
    for (let t = i + 2; t < n; t++) {
      const c = candles[t]!;
      if (direction === 'bull') {
        if (c.low <= bottom) {
          status = 'filled';
          statusIndex = t;
          break;
        }
        if (c.low < top && status === 'open') {
          status = 'partial';
          statusIndex = t;
        }
      } else {
        if (c.high >= top) {
          status = 'filled';
          statusIndex = t;
          break;
        }
        if (c.high > bottom && status === 'open') {
          status = 'partial';
          statusIndex = t;
        }
      }
    }
    const f: Fvg = { direction, middleIndex: i, firstTime: a.openTime, middleTime: m.openTime, top, bottom, size, status, statusIndex };
    if (size >= minAtr * A) fvgs.push(f);
    else small.push(f);
  }
  return { fvgs, small };
}
