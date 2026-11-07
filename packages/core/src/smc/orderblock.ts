// Order Block (ALGORITHMS §7) — для внешних BOS/CHoCH.
import type { Candle, Fvg, OrderBlock, StructureEvent, Swing } from '../types';
import { atr14 } from './series';
import { detectSwings } from './swings';

export function detectOrderBlocks(
  candles: readonly Candle[],
  events: readonly StructureEvent[],
  fvgs: readonly Fvg[],
  obDisplacementAtr: number,
): OrderBlock[] {
  const atr = atr14(candles);
  const frac: Swing[] = detectSwings(candles, { left: 2, right: 2 });
  const out: OrderBlock[] = [];

  for (const ev of events) {
    if (ev.scope !== 'external') continue;
    const bull = ev.direction === 'bull';
    const k = ev.breakIndex;
    const h = ev.brokenSwing.index;

    // 1. начало импульса
    let o = -1;
    for (const s of frac) {
      if (s.type === (bull ? 'low' : 'high') && s.index > h && s.index + 2 <= k && s.index > o) o = s.index;
    }
    if (o < 0) {
      for (let i = h + 1; i <= k; i++) {
        const c = candles[i]!;
        const b = o < 0 ? null : candles[o]!;
        if (b === null || (bull ? c.low <= b.low : c.high >= b.high)) o = i; // при равенстве — поздняя
      }
    }
    if (o < 0) continue;

    // 2. свеча OB
    const isOpp = (c: Candle) => (bull ? c.close < c.open : c.close > c.open);
    let j = -1;
    for (let i = Math.max(o - 1, h + 1); i <= k - 1; i++) {
      const c = candles[i]!;
      if (!isOpp(c)) continue;
      const b = j < 0 ? null : candles[j]!;
      if (b === null || (bull ? c.low <= b.low : c.high >= b.high)) j = i;
    }
    if (j < 0) j = o - 1 > h && isOpp(candles[o - 1]!) ? o - 1 : o;

    const ob = candles[j]!;
    const top = ob.high;
    const bottom = ob.low;

    // 4. displacement
    let valid = fvgs.some((f) => f.direction === ev.direction && f.middleIndex > j && f.middleIndex <= k);
    if (!valid) {
      for (let i = j + 1; i <= k && !valid; i++) {
        const A = atr[i];
        const c = candles[i]!;
        if (A !== null && A !== undefined && Math.abs(c.close - c.open) >= obDisplacementAtr * A) valid = true;
      }
    }

    // статус
    let status: OrderBlock['status'] = 'fresh';
    let statusIndex: number | null = null;
    for (let t = k + 1; t < candles.length; t++) {
      const c = candles[t]!;
      if (bull ? c.close < bottom : c.close > top) {
        status = 'invalidated';
        statusIndex = t;
        break;
      }
      if (status === 'fresh' && (bull ? c.low <= top : c.high >= bottom)) {
        status = 'mitigated';
        statusIndex = t;
      }
    }
    out.push({
      direction: ev.direction,
      index: j,
      time: ob.openTime,
      top,
      bottom,
      event: ev,
      originIndex: o,
      valid,
      status,
      statusIndex,
    });
  }
  return out;
}
