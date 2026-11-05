// Ряды golden-участков Elliott (ELLIOTT.md §15): реальные свечи data.binance.vision. Только для тестов.
import type { Candle } from '../types';
import { readKlines } from './klines';

export const EW_SERIES = {
  'EW-1': { files: ['klines/SOLUSDT/1h/SOLUSDT-1h-2026-08.csv'], tf: '1h' },
  'EW-2': { files: ['klines/ETHUSDT/4h/ETHUSDT-4h-2026-09.csv', 'klines/ETHUSDT/4h/ETHUSDT-4h-2026-10.csv'], tf: '4h' },
  'EW-3': { files: ['klines/BTCUSDT/1h/BTCUSDT-1h-2026-06.csv'], tf: '1h' },
  'EW-4': { files: ['klines/BTCUSDT/4h/BTCUSDT-4h-2026-07.csv', 'klines/BTCUSDT/4h/BTCUSDT-4h-2026-08.csv', 'klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv'], tf: '4h' },
  'EW-6': { files: ['klines/BTCUSDT/1h/BTCUSDT-1h-2026-07.csv'], tf: '1h' },
} as const;
export type EwSeriesId = keyof typeof EW_SERIES;

const cache = new Map<string, Candle[]>();
/** Сырой набор файлов участка (в monthly-архивах 2026-10 нет суток 10-28: пропуск сохранён как есть). */
export function ewCandles(id: EwSeriesId): Candle[] {
  let c = cache.get(id);
  if (!c) {
    c = EW_SERIES[id].files.flatMap((f) => readKlines(f)).sort((a, b) => a.openTime - b.openTime);
    cache.set(id, c);
  }
  return c;
}

/** Индекс свечи по openTime (ISO UTC, например '2026-08-06T23:00:00Z'). */
export function ewIndexAt(candles: readonly Candle[], iso: string): number {
  const t = Date.parse(iso.endsWith('Z') ? iso : `${iso}:00Z`.replace('::', ':'));
  const i = candles.findIndex((c) => c.openTime === t);
  if (i < 0) throw new Error(`no candle at ${iso}`);
  return i;
}
