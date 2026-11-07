// resolveLimitTrade: отложенный ордер с SL/TP, снятие по реакции и цели (CURRICULUM_STAGES.md §7, §20).
// Сеть не используется: будущее приходит через инъецируемый FutureProvider (как resolveTrade).
import { resolveTrade, type AggTrade, type FutureProvider, type ResolvedTrade } from '../challenge/resolve';
import { TIMEFRAME_MS, type Candle, type TaskTimeframe, type UtcMs } from '../types';
import { BAND_K, THR_K } from './reaction';
import { limitFilled, limitFilledByPrice } from './rubric';
import type { Side } from './zone';

export interface PendingOrder {
  side: Side;
  limit: number;
  sl: number;
  tp: number;
  T: UtcMs;
  tf: TaskTimeframe;
  limitCandles: number;
  zone: { near: number; far: number };
  A: number;
  P: number;
  /** Шаг цены символа: исполнение - проход цены на >= 1 тик (§20). */
  tick: number;
}

export type FillMethod = 'candle' | 'drill-1m' | 'drill-aggtrades' | 'conservative';

export type LimitOutcome =
  | { kind: 'cancelled-reaction' | 'cancelled-target' | 'not-filled'; time: UtcMs; rMultiple: 0 }
  | (ResolvedTrade & { kind: 'tp' | 'sl' | 'timeout'; fillTime: UtcMs; fillMethod: FillMethod });

type Filled = Extract<LimitOutcome, { kind: 'tp' | 'sl' | 'timeout' }>;

const long = (o: PendingOrder) => o.side === 'LONG';
const slTouch = (o: PendingOrder, c: Pick<Candle, 'high' | 'low'>) => (long(o) ? c.low <= o.sl : c.high >= o.sl);
const tpTouch = (o: PendingOrder, c: Pick<Candle, 'high' | 'low'>) => (long(o) ? c.high >= o.tp : c.low <= o.tp);
/** Цель за текущей ценой: снятие по цели возможно только если tp ещё не достигнута. */
const targetAhead = (o: PendingOrder) => (long(o) ? o.tp > o.P : o.tp < o.P);
const priceSl = (o: PendingOrder, p: number) => (long(o) ? p <= o.sl : p >= o.sl);
const priceTp = (o: PendingOrder, p: number) => (long(o) ? p >= o.tp : p <= o.tp);

function trade(o: PendingOrder, result: 'tp' | 'sl', exitTime: UtcMs, fillTime: UtcMs, method: ResolvedTrade['method'], triggerTf: ResolvedTrade['triggerTf'], fillMethod: FillMethod): Filled {
  const risk = Math.abs(o.limit - o.sl);
  return {
    kind: result,
    side: o.side,
    entry: o.limit,
    sl: o.sl,
    tp: o.tp,
    result,
    exitTime,
    exitPrice: result === 'sl' ? o.sl : o.tp,
    rMultiple: result === 'sl' ? -1 : Math.abs(o.tp - o.limit) / risk,
    method,
    triggerTime: exitTime,
    triggerTf,
    fillTime,
    fillMethod,
  };
}

async function trades(f: FutureProvider, minuteOpen: UtcMs): Promise<AggTrade[] | null> {
  try {
    const t = await f.aggTrades(minuteOpen);
    if (!t || t.length === 0) return null;
    return [...t].sort((a, b) => a.transactTime - b.transactTime || a.aggTradeId - b.aggTradeId);
  } catch {
    return null;
  }
}

/** Консервативное разрешение неоднозначной минуты/свечи (§7 п.3): касается sl - «исполнение, затем SL», иначе «цель до входа». */
function conservative(o: PendingOrder, c: Pick<Candle, 'high' | 'low' | 'openTime'>, time: UtcMs): LimitOutcome {
  if (slTouch(o, c)) return trade(o, 'sl', time, time, 'conservative-sl', '1m', 'conservative');
  return { kind: 'cancelled-target', time, rMultiple: 0 };
}

export async function resolveLimitTrade(o: PendingOrder, f: FutureProvider): Promise<LimitOutcome> {
  const lg = long(o);
  const valid = lg ? o.sl < o.limit && o.tp > o.limit : o.sl > o.limit && o.tp < o.limit;
  if (!valid || !(o.limitCandles > 0) || !(o.A > 0) || !(o.tick > 0)) throw new Error('INVALID_ORDER');
  const step = TIMEFRAME_MS[o.tf];
  const window = (await f.candles(o.tf, o.T, o.limitCandles)).filter((c) => c.closed && c.openTime >= o.T).slice(0, o.limitCandles);
  if (window.length === 0) throw new Error('NO_FUTURE_CANDLES');

  const band = lg ? o.zone.near + BAND_K * o.A : o.zone.near - BAND_K * o.A;
  const thr = THR_K * o.A;
  let entered = false;
  let m = lg ? Infinity : -Infinity;

  /** Позиция открыта к закрытию свечи i без касаний sl/tp: дальше обычный resolveTrade. */
  const afterFill = async (i: number, fillTime: UtcMs, fillMethod: FillMethod): Promise<LimitOutcome> => {
    const c = window[i]!;
    const rest = o.limitCandles - (i + 1);
    const next = window[i + 1];
    if (rest <= 0 || !next) {
      const exit = c.close;
      const r = (lg ? exit - o.limit : o.limit - exit) / Math.abs(o.limit - o.sl);
      return {
        kind: 'timeout', side: o.side, entry: o.limit, sl: o.sl, tp: o.tp, result: 'timeout', exitTime: c.closeTime, exitPrice: exit,
        rMultiple: r, method: 'timeout', triggerTime: c.closeTime, triggerTf: o.tf, fillTime, fillMethod,
      };
    }
    const r = await resolveTrade({ side: o.side, entry: o.limit, sl: o.sl, tp: o.tp, T: next.openTime, tf: o.tf, limitCandles: rest }, f);
    return { ...r, kind: r.result, fillTime, fillMethod };
  };

  for (let i = 0; i < window.length; i++) {
    const c = window[i]!;
    if (!limitFilled(c, o.side, o.limit, o.tick)) {
      if (targetAhead(o) && tpTouch(o, c)) return { kind: 'cancelled-target', time: c.openTime, rMultiple: 0 };
      if (!entered && (lg ? c.low <= band : c.high >= band)) {
        entered = true;
        m = lg ? c.low : c.high;
      } else if (entered && (lg ? c.low < m : c.high > m)) m = lg ? c.low : c.high;
      if (entered && (lg ? c.close >= m + thr : c.close <= m - thr)) return { kind: 'cancelled-reaction', time: c.openTime, rMultiple: 0 };
      continue;
    }
    // свеча исполнения
    if (!slTouch(o, c) && !tpTouch(o, c)) return afterFill(i, c.openTime, 'candle');

    const minutes = (await f.minute1(c.openTime, c.openTime + step))
      .filter((x) => x.openTime >= c.openTime && x.openTime < c.openTime + step)
      .sort((a, b) => a.openTime - b.openTime);
    if (minutes.length !== step / TIMEFRAME_MS['1m']) return conservative(o, c, c.openTime);

    let filled = false;
    let fillTime = c.openTime;
    for (const mi of minutes) {
      if (!filled) {
        const fm = limitFilled(mi, o.side, o.limit, o.tick);
        if (!fm) {
          if (targetAhead(o) && tpTouch(o, mi)) return { kind: 'cancelled-target', time: mi.openTime, rMultiple: 0 };
          continue;
        }
        if (!slTouch(o, mi) && !tpTouch(o, mi)) {
          filled = true;
          fillTime = mi.openTime;
          continue;
        }
        // неоднозначная минута: исполнение и sl/tp
        const tr = await trades(f, mi.openTime);
        if (!tr) return conservative(o, mi, mi.openTime);
        let inPos = false;
        let ft = mi.openTime;
        for (const t of tr) {
          if (!inPos) {
            if (limitFilledByPrice(t.price, o.side, o.limit, o.tick)) {
              inPos = true;
              ft = t.transactTime;
            } else if (targetAhead(o) && priceTp(o, t.price)) return { kind: 'cancelled-target', time: t.transactTime, rMultiple: 0 };
            else continue;
          }
          if (priceSl(o, t.price) || priceTp(o, t.price)) {
            return trade(o, priceSl(o, t.price) ? 'sl' : 'tp', t.transactTime, ft, 'drill-aggtrades', 'aggTrades', 'drill-aggtrades');
          }
        }
        return conservative(o, mi, mi.openTime);
      }
      // позиция открыта
      const hs = slTouch(o, mi);
      const ht = tpTouch(o, mi);
      if (!hs && !ht) continue;
      if (hs !== ht) return trade(o, hs ? 'sl' : 'tp', mi.openTime, fillTime, 'drill-1m', '1m', 'drill-1m');
      const tr = await trades(f, mi.openTime);
      if (tr) {
        for (const t of tr) {
          if (priceSl(o, t.price) || priceTp(o, t.price)) {
            return trade(o, priceSl(o, t.price) ? 'sl' : 'tp', t.transactTime, fillTime, 'drill-aggtrades', 'aggTrades', 'drill-1m');
          }
        }
      }
      return trade(o, 'sl', mi.openTime, fillTime, 'conservative-sl', '1m', 'drill-1m');
    }
    if (filled) return afterFill(i, fillTime, 'drill-1m');
    return conservative(o, c, c.openTime); // 1m не подтвердили исполнение свечи - аварийный случай
  }
  return { kind: 'not-filled', time: window[window.length - 1]!.closeTime, rMultiple: 0 };
}
