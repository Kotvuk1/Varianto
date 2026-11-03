import { describe, expect, it } from 'vitest';
import type { Candle, Timeframe } from '../index';
import { loadAggTrades, loadKlines } from '../testing/fixtures-pa-challenge';
import { resolveTrade, type AggTrade, type FutureProvider, type Position } from './resolve';

const M = 60_000;
const STEP: Record<string, number> = { '1m': M, '15m': 15 * M, '1h': 60 * M, '4h': 240 * M, '1d': 1440 * M };

const c15 = [
  ...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv'),
  ...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-21.csv'),
];
const c1 = [
  ...loadKlines('klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-20.csv'),
  ...loadKlines('klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-21.csv'),
];
const agg = loadAggTrades('aggTrades/BTCUSDT-aggTrades-2026-10-20.csv');
const T0 = Date.UTC(2026, 9, 20, 0, 0);
const T1 = Date.UTC(2026, 9, 20, 0, 15);

function provider(over: Partial<FutureProvider> = {}): FutureProvider {
  return {
    candles: async (tf: Timeframe, from, count) =>
      (tf === '1m' ? c1 : c15).filter((c) => c.openTime >= from).slice(0, count),
    minute1: async (from, to) => c1.filter((c) => c.openTime >= from && c.openTime < to),
    aggTrades: async (minuteOpen) => {
      const last = agg[agg.length - 1]!.transactTime;
      if (minuteOpen + M > last) return null; // фикстура покрывает только начало суток
      return agg.filter((t) => t.transactTime >= minuteOpen && t.transactTime < minuteOpen + M);
    },
    ...over,
  };
}

const pos = (p: Partial<Position> & Pick<Position, 'side' | 'entry' | 'sl' | 'tp' | 'T'>): Position => ({
  tf: '15m',
  limitCandles: 96,
  ...p,
});

describe('resolveTrade: реальные случаи GS-10', () => {
  it('R1: LONG, обе цены в 15m и 1m -> aggTrades, TP по сделке 3490482886', async () => {
    const r = await resolveTrade(pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 }), provider());
    expect(r.result).toBe('tp');
    expect(r.method).toBe('drill-aggtrades');
    expect(r.exitPrice).toBe(81950.0);
    expect(r.exitTime).toBe(1792454413607);
    expect(r.triggerTime).toBe(1792454413607);
    expect(r.triggerTf).toBe('aggTrades');
    expect(r.rMultiple).toBeCloseTo(46.7 / 8.3, 9);
    const t = agg.find((x) => x.aggTradeId === 3490482886)!;
    expect(t.price).toBe(81950.0);
    expect(t.transactTime).toBe(1792454413607);
  });

  it('R1s: SHORT на тех же уровнях -> та же сделка даёт SL, R = -1', async () => {
    const r = await resolveTrade(pos({ side: 'SHORT', entry: 81903.3, sl: 81950.0, tp: 81895.0, T: T0 }), provider());
    expect(r.result).toBe('sl');
    expect(r.method).toBe('drill-aggtrades');
    expect(r.rMultiple).toBe(-1);
    expect(r.exitTime).toBe(1792454413607);
  });

  it('R2: SHORT, 15m задевает оба, 1m 00:15 только SL -> drill-1m', async () => {
    const r = await resolveTrade(pos({ side: 'SHORT', entry: 81752.9, sl: 81770.0, tp: 81500.0, T: T1 }), provider());
    expect(r.result).toBe('sl');
    expect(r.method).toBe('drill-1m');
    expect(r.triggerTf).toBe('1m');
    expect(r.triggerTime).toBe(T1);
    expect(r.rMultiple).toBe(-1);
    expect(r.exitPrice).toBe(81770.0);
  });

  it('R3: LONG, первое касание SL на 15m 01:00, один уровень -> candle', async () => {
    const r = await resolveTrade(pos({ side: 'LONG', entry: 81752.9, sl: 81300.0, tp: 82000.0, T: T1 }), provider());
    expect(r.result).toBe('sl');
    expect(r.method).toBe('candle');
    expect(r.triggerTf).toBe('15m');
    expect(r.triggerTime).toBe(Date.UTC(2026, 9, 20, 1, 0));
  });

  it('R4: LONG без касаний за 96 свечей -> timeout по close 10-21 00:00', async () => {
    const r = await resolveTrade(pos({ side: 'LONG', entry: 81752.9, sl: 80500.0, tp: 86000.0, T: T1 }), provider());
    expect(r.result).toBe('timeout');
    expect(r.method).toBe('timeout');
    expect(r.exitPrice).toBe(83047.0);
    expect(r.rMultiple).toBeCloseTo(1294.1 / 1252.9, 9);
    expect(r.exitTime).toBe(Date.UTC(2026, 9, 21, 0, 15) - 1);
  });

  it('инвариант 15.7: R2-R4 при обходе по 1m дают тот же результат', async () => {
    const cases = [
      pos({ side: 'SHORT', entry: 81752.9, sl: 81770.0, tp: 81500.0, T: T1 }),
      pos({ side: 'LONG', entry: 81752.9, sl: 81300.0, tp: 82000.0, T: T1 }),
      pos({ side: 'LONG', entry: 81752.9, sl: 80500.0, tp: 86000.0, T: T1 }),
    ];
    for (const p of cases) {
      const a = await resolveTrade(p, provider());
      const b = await resolveTrade({ ...p, tf: '1m', limitCandles: p.limitCandles * 15 }, provider());
      expect(b.result).toBe(a.result);
      expect(b.exitPrice).toBe(a.exitPrice);
      expect(b.rMultiple).toBeCloseTo(a.rMultiple, 12);
    }
  });

  it('инвариант для R1: по 1m сразу aggTrades, тот же исход', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const b = await resolveTrade({ ...p, tf: '1m', limitCandles: 1440 }, provider());
    expect(b.result).toBe('tp');
    expect(b.method).toBe('drill-aggtrades');
    expect(b.exitTime).toBe(1792454413607);
  });
});

describe('resolveTrade: граничные случаи', () => {
  // SYNTHETIC: разрушение фикстуры (нет aggTrades / пропуск 1m / равенство цен) нельзя взять из реальных данных
  it('synthetic_ aggTrades недоступны -> conservative-sl', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const r = await resolveTrade(p, provider({ aggTrades: async () => null }));
    expect(r.result).toBe('sl');
    expect(r.method).toBe('conservative-sl');
    expect(r.rMultiple).toBe(-1);
    expect(r.triggerTf).toBe('1m');
  });

  it('synthetic_ aggTrades бросает ошибку (бюджет времени) -> conservative-sl', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const r = await resolveTrade(p, provider({ aggTrades: async () => { throw new Error('timeout'); } }));
    expect(r.method).toBe('conservative-sl');
  });

  it('synthetic_ aggTrades без сделки за уровнем -> conservative-sl', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const quiet: AggTrade[] = [{ aggTradeId: 1, price: 81920, transactTime: T0 + 5 }];
    const r = await resolveTrade(p, provider({ aggTrades: async () => quiet }));
    expect(r.method).toBe('conservative-sl');
  });

  it('synthetic_ aggTrades: порядок по (transactTime, aggTradeId), SL раньше TP', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const trades: AggTrade[] = [
      { aggTradeId: 5, price: 81950, transactTime: T0 + 10 },
      { aggTradeId: 4, price: 81895, transactTime: T0 + 10 },
    ];
    const r = await resolveTrade(p, provider({ aggTrades: async () => trades }));
    expect(r.result).toBe('sl');
    expect(r.method).toBe('drill-aggtrades');
  });

  it('synthetic_ пропуск в 1m -> conservative-sl', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const r = await resolveTrade(p, provider({ minute1: async () => c1.slice(0, 5) }));
    expect(r.method).toBe('conservative-sl');
  });

  it('synthetic_ 1m не подтверждает касание 15m -> conservative-sl', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    const calm: Candle[] = c1.slice(0, 15).map((c) => ({ ...c, high: 81910, low: 81900 }));
    const r = await resolveTrade(p, provider({ minute1: async () => calm }));
    expect(r.method).toBe('conservative-sl');
  });

  it('synthetic_ касание с равенством: TP ровно по high', async () => {
    const hi = c15[0]!.high;
    const r = await resolveTrade(pos({ side: 'LONG', entry: 81000, sl: 80000, tp: hi, T: T0 }), provider());
    expect(r.result).toBe('tp');
    expect(r.method).toBe('candle');
    expect(r.exitPrice).toBe(hi);
  });

  it('synthetic_ SHORT: TP по low с равенством и SHORT timeout', async () => {
    const lo = c15[0]!.low;
    const a = await resolveTrade(pos({ side: 'SHORT', entry: 82000, sl: 90000, tp: lo, T: T0 }), provider());
    expect(a.result).toBe('tp');
    const b = await resolveTrade(pos({ side: 'SHORT', entry: 81752.9, sl: 90000, tp: 70000, T: T1, limitCandles: 2 }), provider());
    expect(b.result).toBe('timeout');
    expect(b.rMultiple).toBeCloseTo((81752.9 - c15[2]!.close) / (90000 - 81752.9), 12);
  });

  it('synthetic_ нет будущих свечей -> ошибка', async () => {
    await expect(
      resolveTrade(pos({ side: 'LONG', entry: 1, sl: 0.5, tp: 2, T: T0 }), provider({ candles: async () => [] })),
    ).rejects.toThrow('NO_FUTURE_CANDLES');
  });

  it('synthetic_ sl == entry недопустим', async () => {
    await expect(resolveTrade(pos({ side: 'LONG', entry: 10, sl: 10, tp: 20, T: T0 }), provider())).rejects.toThrow('INVALID_POSITION');
  });

  it('synthetic_ детерминизм: двойной запуск идентичен', async () => {
    const p = pos({ side: 'LONG', entry: 81903.3, sl: 81895.0, tp: 81950.0, T: T0 });
    expect(await resolveTrade(p, provider())).toEqual(await resolveTrade(p, provider()));
  });
});

void STEP;
