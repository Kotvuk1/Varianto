// Общие помощники сервиса заданий (next): сид, диапазон архива, выбор сегмента, сверка рядов. Без побочных эффектов.
import { TIMEFRAME_MS, mulberry32, randInt, sliceAt, type Candle, type TaskSymbol, type TaskTimeframe, type UtcMs } from '@tl/core';
import { ARCHIVE_START, cutoffOf, floorTo, loadMinutes } from './sources';
import type { ServerDeps } from './tasks';

/** Шаг цены символа: правило исполнения лимитки (CURRICULUM_STAGES.md §20). */
export const TICK: Record<TaskSymbol, number> = { BTCUSDT: 0.1, ETHUSDT: 0.01, SOLUSDT: 0.01 };
export const SEGMENT_EXTRA = 300;

export const toSeed = (n: number) => n >>> 0;
export const rngOf = (seed: number, salt: number) => mulberry32((seed ^ salt) | 0);

export function rangeOf(deps: ServerDeps): { from: UtcMs; to: UtcMs } {
  const cutoff = cutoffOf(deps.now());
  const r = deps.range ?? { from: ARCHIVE_START, to: cutoff };
  return { from: r.from, to: Math.min(r.to, cutoff) };
}

/** Детерминированный по seed отрезок [from, to) из `len` свечей tf внутри доступного диапазона. */
export function pickSegment(deps: ServerDeps, seed: number, tf: TaskTimeframe, len: number, minLen: number): { from: UtcMs; to: UtcMs } | null {
  const step = TIMEFRAME_MS[tf];
  const r = rangeOf(deps);
  const from = Math.ceil(r.from / step) * step;
  const to = Math.floor(r.to / step) * step;
  const available = Math.floor((to - from) / step);
  const n = Math.min(len, available);
  if (n < minLen) return null;
  const start = randInt(rngOf(seed, 0x5eed), available - n + 1);
  return { from: from + start * step, to: from + (start + n) * step };
}

const isoOf = (c: Candle) => c.openTime;

/** Совпадают ли ряды, увиденные генератором и восстановленные при grade. */
export function sameSeries(a: readonly Candle[], b: readonly Candle[]): boolean {
  return a.length === b.length && a.length > 0 && isoOf(a[0]!) === isoOf(b[0]!) && isoOf(a[a.length - 1]!) === isoOf(b[b.length - 1]!);
}

export async function withPartial(
  deps: ServerDeps,
  symbol: string,
  tf: TaskTimeframe,
  visible: Candle[],
  T: UtcMs,
): Promise<Candle[] | null> {
  const bucket = floorTo(T, TIMEFRAME_MS[tf]);
  if (bucket === T) return visible;
  const minutes = await loadMinutes(deps.loader, symbol, bucket, T);
  if (!minutes) return null; // пропуск 1m: сценарий отбраковывается (ADR-0006 п.5)
  return sliceAt({ [tf]: visible, '1m': minutes }, T)[tf] ?? visible;
}

