// findImpulses (FIBONACCI.md §3): импульс = нога внешней структуры, сломавшая структуру закрытием тела.
import { FIB_ALGO_VERSION } from '../version';
import { analyzeStructure } from '../smc/analyze';
import { atr14, closedOnly } from '../smc/series';
import type { Candle, Swing } from '../types';
import type { ImpulseRejectReason, ImpulseScan } from './types';

export interface ImpulseParams {
  nExt: number;
}

/** Индекс экстремума на [from, to]: минимум low (bull) / максимум high (bear); при равенстве - ранняя свеча. */
function argExtreme(c: readonly Candle[], from: number, to: number, bull: boolean): number {
  let best = from;
  for (let i = from + 1; i <= to; i++) {
    if (bull ? c[i]!.low < c[best]!.low : c[i]!.high > c[best]!.high) best = i;
  }
  return best;
}

function minLow(c: readonly Candle[], from: number, to: number): number {
  let m = Infinity;
  for (let i = from; i <= to; i++) m = Math.min(m, c[i]!.low);
  return m;
}
function maxHigh(c: readonly Candle[], from: number, to: number): number {
  let m = -Infinity;
  for (let i = from; i <= to; i++) m = Math.max(m, c[i]!.high);
  return m;
}

export function findImpulses(candles: readonly Candle[], p: ImpulseParams): ImpulseScan {
  const closed = closedOnly(candles);
  const r = analyzeStructure(closed, { nExt: p.nExt, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
  const base = r.baseIndex;
  const c = closed;
  const ext = r.swings.filter((s) => s.scope === 'external');
  const pendingExt = r.pendingSwings.filter((s) => s.scope === 'external');
  const atrSeg = atr14(base === 0 ? c : c.slice(base));
  const atrAt = (i: number): number | null => atrSeg[i - base] ?? null;

  const out: ImpulseScan = { algoVersion: FIB_ALGO_VERSION, impulses: [], rejected: [], pending: [] };

  for (const e of r.events) {
    if (e.scope !== 'external') continue;
    const bull = e.direction === 'bull';
    const k = e.breakIndex;
    const h = e.brokenSwing.index;
    const reject = (reason: ImpulseRejectReason) => out.rejected.push({ event: e, reason });

    const a = argExtreme(c, h + 1, k, bull);
    const aType = bull ? 'low' : 'high';
    if (!ext.some((s) => s.index === a && s.type === aType)) {
      reject('A_NOT_SWING');
      continue;
    }
    const beyond = (s: Swing) => s.index > a && (bull ? s.price > e.level : s.price < e.level);
    const bType = bull ? 'high' : 'low';
    const S = ext.find((s) => s.type === bType && beyond(s));
    const A = bull ? c[a]!.low : c[a]!.high;
    const atr = atrAt(a);

    if (!S) {
      const cand = pendingExt.find((s) => s.type === bType && beyond(s));
      if (!cand) {
        reject('NO_B');
        continue;
      }
      const b = cand.index;
      const B = cand.price;
      if (bull ? minLow(c, a, b) < A : maxHigh(c, a, b) > A) {
        reject('A_NOT_EXTREME');
        continue;
      }
      if (bull ? maxHigh(c, a, b) !== B : minLow(c, a, b) !== B) {
        reject('B_NOT_EXTREME');
        continue;
      }
      if (atr === null || atr <= 0) {
        reject('ATR_NULL');
        continue;
      }
      out.pending.push({
        direction: e.direction,
        event: e,
        a: { index: a, time: c[a]!.openTime, price: A },
        b: { index: b, time: c[b]!.openTime, price: B },
        candles: b - a,
        atrA: atr,
        rangeAtr: Math.abs(B - A) / atr,
      });
      continue;
    }

    const b = S.index;
    if (k > b + p.nExt) {
      reject('BREAK_AFTER_B');
      continue;
    }
    const B = S.price;
    if (bull ? minLow(c, a, b) < A : maxHigh(c, a, b) > A) {
      reject('A_NOT_EXTREME');
      continue;
    }
    if (bull ? maxHigh(c, a, b) !== B : minLow(c, a, b) !== B) {
      reject('B_NOT_EXTREME');
      continue;
    }
    if (atr === null || atr <= 0) {
      reject('ATR_NULL');
      continue;
    }
    out.impulses.push({
      direction: e.direction,
      event: e,
      a: { index: a, time: c[a]!.openTime, price: A },
      b: { index: b, time: c[b]!.openTime, price: B },
      confirmedIndex: b + p.nExt,
      candles: b - a,
      atrA: atr,
      rangeAtr: Math.abs(B - A) / atr,
    });
  }
  return out;
}
