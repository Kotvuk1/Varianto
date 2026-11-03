// resolveTrade (ALGORITHMS §15, ADR-0007): исход сделки Challenge с drill-down candle -> 1m -> aggTrades -> conservative-sl.
// Сеть не используется: будущее приходит через инъецируемый FutureProvider.
import { TIMEFRAME_MS, type Candle, type Timeframe, type UtcMs } from '../types';

export interface AggTrade {
  aggTradeId: number;
  price: number;
  transactTime: UtcMs;
}

export interface Position {
  side: 'LONG' | 'SHORT';
  entry: number;
  sl: number;
  tp: number;
  T: UtcMs;
  tf: Timeframe;
  limitCandles: number;
}

export interface FutureProvider {
  /** Закрытые свечи tf с openTime >= from, не более count (по возрастанию). */
  candles(tf: Timeframe, from: UtcMs, count: number): Promise<Candle[]>;
  /** 1m-свечи с openTime в [from, to). */
  minute1(from: UtcMs, to: UtcMs): Promise<Candle[]>;
  /** Сделки минуты или null, если недоступны. */
  aggTrades(minuteOpen: UtcMs): Promise<AggTrade[] | null>;
}

export type ResolutionMethod = 'candle' | 'drill-1m' | 'drill-aggtrades' | 'conservative-sl' | 'timeout';

export interface ChallengeOutcome {
  side: 'LONG' | 'SHORT';
  entry: number;
  sl: number;
  tp: number;
  result: 'tp' | 'sl' | 'timeout';
  exitTime: UtcMs;
  exitPrice: number;
  rMultiple: number;
  method: ResolutionMethod;
}

export type ResolvedTrade = ChallengeOutcome & { triggerTime: UtcMs; triggerTf: '1m' | 'aggTrades' | Timeframe };

interface Hit {
  sl: boolean;
  tp: boolean;
}

function touches(p: Position, c: Candle): Hit {
  return p.side === 'LONG'
    ? { sl: c.low <= p.sl, tp: c.high >= p.tp }
    : { sl: c.high >= p.sl, tp: c.low <= p.tp };
}

function priceHits(p: Position, price: number): Hit {
  return p.side === 'LONG'
    ? { sl: price <= p.sl, tp: price >= p.tp }
    : { sl: price >= p.sl, tp: price <= p.tp };
}

function rOf(p: Position, result: 'tp' | 'sl'): number {
  return result === 'sl' ? -1 : Math.abs(p.tp - p.entry) / Math.abs(p.entry - p.sl);
}

function done(
  p: Position,
  result: 'tp' | 'sl',
  method: ResolutionMethod,
  exitTime: UtcMs,
  triggerTf: ResolvedTrade['triggerTf'],
): ResolvedTrade {
  return {
    side: p.side,
    entry: p.entry,
    sl: p.sl,
    tp: p.tp,
    result,
    exitTime,
    exitPrice: result === 'sl' ? p.sl : p.tp,
    rMultiple: rOf(p, result),
    method,
    triggerTime: exitTime,
    triggerTf,
  };
}

/** Порядок внутри минуты по aggTrades; null = недоступно/не определено -> консервативный SL. */
async function viaAggTrades(p: Position, f: FutureProvider, minuteOpen: UtcMs): Promise<ResolvedTrade | null> {
  let trades: AggTrade[] | null;
  try {
    trades = await f.aggTrades(minuteOpen);
  } catch {
    return null;
  }
  if (!trades || trades.length === 0) return null;
  const sorted = [...trades].sort((a, b) => a.transactTime - b.transactTime || a.aggTradeId - b.aggTradeId);
  for (const t of sorted) {
    const h = priceHits(p, t.price);
    if (h.sl || h.tp) return done(p, h.sl ? 'sl' : 'tp', 'drill-aggtrades', t.transactTime, 'aggTrades');
  }
  return null;
}

export async function resolveTrade(p: Position, f: FutureProvider): Promise<ResolvedTrade> {
  const validSide = p.side === 'LONG' ? p.sl < p.entry && p.tp > p.entry : p.sl > p.entry && p.tp < p.entry;
  if (!validSide || !(p.limitCandles > 0)) throw new Error('INVALID_POSITION');
  const step = TIMEFRAME_MS[p.tf];
  const window = (await f.candles(p.tf, p.T, p.limitCandles)).filter((c) => c.closed && c.openTime >= p.T).slice(0, p.limitCandles);
  if (window.length === 0) throw new Error('NO_FUTURE_CANDLES');

  for (const c of window) {
    const h = touches(p, c);
    if (!h.sl && !h.tp) continue;
    if (h.sl !== h.tp) return done(p, h.sl ? 'sl' : 'tp', 'candle', c.openTime, p.tf);

    // Обе цены в одной свече.
    const conservative = (time: UtcMs): ResolvedTrade => done(p, 'sl', 'conservative-sl', time, '1m');
    if (p.tf === '1m') {
      return (await viaAggTrades(p, f, c.openTime)) ?? conservative(c.openTime);
    }
    const minutes = (await f.minute1(c.openTime, c.openTime + step))
      .filter((m) => m.openTime >= c.openTime && m.openTime < c.openTime + step)
      .sort((a, b) => a.openTime - b.openTime);
    if (minutes.length !== step / TIMEFRAME_MS['1m']) return conservative(c.openTime);
    for (const m of minutes) {
      const mh = touches(p, m);
      if (!mh.sl && !mh.tp) continue;
      if (mh.sl !== mh.tp) return done(p, mh.sl ? 'sl' : 'tp', 'drill-1m', m.openTime, '1m');
      return (await viaAggTrades(p, f, m.openTime)) ?? conservative(m.openTime);
    }
    return conservative(c.openTime); // 1m не подтвердили касание свечи старшего ТФ — аварийный случай
  }

  const last = window[window.length - 1]!;
  const exit = last.close;
  const r = (p.side === 'LONG' ? exit - p.entry : p.entry - exit) / Math.abs(p.entry - p.sl);
  return {
    side: p.side,
    entry: p.entry,
    sl: p.sl,
    tp: p.tp,
    result: 'timeout',
    exitTime: last.closeTime,
    exitPrice: exit,
    rMultiple: r,
    method: 'timeout',
    triggerTime: last.closeTime,
    triggerTf: p.tf,
  };
}
