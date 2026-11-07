// Ряды golden-участков Fibonacci (FIBONACCI.md §12): реальные свечи data.binance.vision. Только для тестов.
import type { Candle } from '../types';
import { readKlines } from './klines';

const SOL = (days: string[]) => days.map((d) => `klines/SOLUSDT/15m/SOLUSDT-15m-2026-${d}.csv`);

export const FIB_SERIES = {
  'FG-1': { files: ['klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv', 'klines/BTCUSDT/4h/BTCUSDT-4h-2026-10.csv'], tf: '4h', nExt: 5 },
  'FG-3': { files: ['klines/ETHUSDT/1h/ETHUSDT-1h-2026-10.csv'], tf: '1h', nExt: 5 },
  'FG-4': { files: ['klines/ETHUSDT/4h/ETHUSDT-4h-2026-09.csv'], tf: '4h', nExt: 5 },
  'FG-6': { files: SOL(['07-19', '07-20', '07-21']), tf: '15m', nExt: 5 },
  'FG-7': { files: SOL(['07-15', '07-16', '07-17']), tf: '15m', nExt: 5 },
  'FG-8': { files: SOL(['08-09', '08-10', '08-11', '08-12']), tf: '15m', nExt: 5 },
} as const;
export type FibSeriesId = keyof typeof FIB_SERIES;
// FG-2 - те же файлы, что FG-1; FG-5 - те же, что FG-4.
export const FIB_SERIES_ALIAS: Record<string, FibSeriesId> = { 'FG-2': 'FG-1', 'FG-5': 'FG-4' };

const STEP = { '15m': 900_000, '1h': 3_600_000, '4h': 14_400_000 } as const;

/** Сырой набор файлов (в реальных октябрьских месячных архивах BTC/ETH нет суток 2026-10-28: пропуск). */
export function fibCandlesRaw(id: FibSeriesId): Candle[] {
  return FIB_SERIES[id].files.flatMap((f) => readKlines(f)).sort((a, b) => a.openTime - b.openTime);
}

const cache = new Map<string, Candle[]>();
/**
 * Непрерывный ряд golden-участка: набор файлов, обрезанный перед первым пропуском (спецификация считает ряд без пропусков;
 * все golden-участки лежат до пропуска, структура причинна - обрезка хвоста не меняет события до него).
 */
export function fibCandles(id: FibSeriesId): Candle[] {
  let c = cache.get(id);
  if (!c) {
    const raw = fibCandlesRaw(id);
    const step = STEP[FIB_SERIES[id].tf];
    let end = raw.length;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i]!.openTime - raw[i - 1]!.openTime !== step) {
        end = i;
        break;
      }
    }
    c = raw.slice(0, end);
    cache.set(id, c);
  }
  return c;
}

/** Индекс свечи по openTime (ISO UTC, например '2026-09-21T20:00:00Z'). */
export function indexAtIso(candles: readonly Candle[], iso: string): number {
  const t = Date.parse(iso);
  const i = candles.findIndex((c) => c.openTime === t);
  if (i < 0) throw new Error(`no candle at ${iso}`);
  return i;
}
