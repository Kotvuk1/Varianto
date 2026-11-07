// FutureProvider поверх массива реальных свечей (data.binance.vision) для тестов resolveTrade/resolveLimitTrade без сети.
// 1m и aggTrades недоступны (minute1 -> [], aggTrades -> null): неоднозначные свечи разрешаются консервативно.
import type { FutureProvider } from '../challenge/resolve';
import type { Candle } from '../types';
import { TIMEFRAME_MS } from '../types';

export function candleProvider(series: Partial<Record<string, readonly Candle[]>>, minutes: readonly Candle[] = []): FutureProvider {
  return {
    async candles(tf, from, count) {
      return (series[tf] ?? []).filter((c) => c.closed && c.openTime >= from).slice(0, count) as Candle[];
    },
    async minute1(from, to) {
      return minutes.filter((c) => c.openTime >= from && c.openTime < to) as Candle[];
    },
    async aggTrades() {
      return null;
    },
  };
}

export const stepOf = (tf: keyof typeof TIMEFRAME_MS) => TIMEFRAME_MS[tf];
