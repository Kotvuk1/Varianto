// Общие операции над рядом свечей (ALGORITHMS §1): только закрытые, непрерывность, ATR14.
import { TIMEFRAME_MS, type Candle, type Timeframe, type UtcMs } from '../types';

export class CoreInputError extends Error {
  constructor(
    public readonly code: 'UNCLOSED_IN_SERIES',
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'CoreInputError';
  }
}

/**
 * Отбрасывает хвост незакрытых свечей; незакрытая свеча не в хвосте -> CoreInputError (ALGORITHMS §1.1).
 */
export function closedOnly(candles: readonly Candle[]): Candle[] {
  let end = candles.length;
  while (end > 0 && !candles[end - 1]!.closed) end--;
  for (let i = 0; i < end; i++) {
    if (!candles[i]!.closed) throw new CoreInputError('UNCLOSED_IN_SERIES');
  }
  return candles.slice(0, end);
}

/** Шаг ряда по длительности первой свечи (closeTime - openTime + 1); null, если не соответствует известному ТФ. */
export function inferTimeframe(candles: readonly Candle[]): Timeframe | null {
  const first = candles[0];
  if (!first) return null;
  const d = first.closeTime - first.openTime + 1;
  for (const tf of Object.keys(TIMEFRAME_MS) as Timeframe[]) if (TIMEFRAME_MS[tf] === d) return tf;
  return null;
}

/** Пропуски: fromTime = openTime первой отсутствующей свечи, toTime = openTime следующей имеющейся (исключительно). */
export function gaps(candles: readonly Candle[], tf: Timeframe): { fromTime: UtcMs; toTime: UtcMs }[] {
  const step = TIMEFRAME_MS[tf];
  const out: { fromTime: UtcMs; toTime: UtcMs }[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1]!;
    const cur = candles[i]!;
    if (cur.openTime - prev.openTime !== step) out.push({ fromTime: prev.openTime + step, toTime: cur.openTime });
  }
  return out;
}

/** Индекс первой свечи последнего непрерывного сегмента. */
export function lastSegmentStart(candles: readonly Candle[], tf: Timeframe): number {
  const step = TIMEFRAME_MS[tf];
  for (let i = candles.length - 1; i >= 1; i--) {
    if (candles[i]!.openTime - candles[i - 1]!.openTime !== step) return i;
  }
  return 0;
}

/**
 * ATR14 (ALGORITHMS §1.3): простое среднее 14 TR, суммирование слева направо; определён при i >= 14.
 */
export function atr14(candles: readonly Candle[]): (number | null)[] {
  const n = candles.length;
  const tr: number[] = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) {
    const c = candles[i]!;
    const pc = candles[i - 1]!.close;
    tr[i] = Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc));
  }
  const out: (number | null)[] = new Array<number | null>(n).fill(null);
  for (let i = 14; i < n; i++) {
    let s = 0;
    for (let j = i - 13; j <= i; j++) s += tr[j]!;
    out[i] = s / 14;
  }
  return out;
}

/** Индекс свечи, содержащей момент t (openTime <= t < openTime + step), иначе -1. Бинарный поиск по openTime. */
export function candleIndexAt(candles: readonly Candle[], t: UtcMs, step: number): number {
  let lo = 0;
  let hi = candles.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = candles[mid]!;
    if (t < c.openTime) hi = mid - 1;
    else if (t >= c.openTime + step) lo = mid + 1;
    else return mid;
  }
  return -1;
}
