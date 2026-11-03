// Правила формы SMC-разметки: чистые функции над реальными свечами. Тип метки определяет, куда она может
// встать (swing - на high/low локального экстремума, FVG - только на трёхсвечный разрыв и т.д.),
// поэтому учебный продукт не даёт «рисовать что угодно».
import type { Anchor, Candle } from '@tl/core';

export type Side = 'high' | 'low';
export type Direction = 'bull' | 'bear';

/** Радиус поиска локального экстремума вокруг точки касания (в свечах). */
export const SWING_RADIUS = 3;
/** Глубина поиска swing назад для sweep (в свечах). */
export const SWEEP_LOOKBACK = 80;

const clampIdx = (candles: readonly Candle[], i: number) => Math.min(candles.length - 1, Math.max(0, i));
const extreme = (c: Candle, side: Side) => (side === 'high' ? c.high : c.low);
const better = (a: number, b: number, side: Side) => (side === 'high' ? a > b : a < b);

/** Индекс свечи с максимальным high (low - минимальным) в окне ±radius; при равенстве - ближайшая к i. */
export function localExtremeIndex(candles: readonly Candle[], i: number, side: Side, radius = SWING_RADIUS): number {
  if (candles.length === 0) return 0;
  const c0 = clampIdx(candles, i);
  let best = c0;
  for (let d = 1; d <= radius; d++) {
    for (const k of [c0 - d, c0 + d]) {
      if (k < 0 || k >= candles.length) continue;
      if (better(extreme(candles[k]!, side), extreme(candles[best]!, side), side)) best = k;
    }
  }
  return best;
}

/** Swing: время - openTime свечи экстремума, цена - её high/low. */
export function resolveSwing(candles: readonly Candle[], i: number, side: Side): Anchor {
  const k = localExtremeIndex(candles, i, side);
  const c = candles[k]!;
  return { time: c.openTime, price: extreme(c, side) };
}

/** Какой стороной свечи считать касание: выше середины диапазона - high, иначе low. */
export function sideByPrice(c: Candle, price: number): Side {
  return price >= (c.high + c.low) / 2 ? 'high' : 'low';
}

export type Rejection<R extends string> = { ok: false; reason: R };

export type FvgResult =
  | { ok: true; anchors: [Anchor, Anchor]; direction: Direction; middleTime: number; filledIndex: number | null }
  | Rejection<'edge' | 'no-gap' | 'unclosed'>;

/**
 * FVG по средней свече i: бычий - зона [high[i-1], low[i+1]], медвежий - [high[i+1], low[i-1]].
 * Время: от свечи i-1 до свечи, заполнившей разрыв, либо до правого края (последняя свеча).
 */
export function resolveFvg(candles: readonly Candle[], i: number): FvgResult {
  if (i < 1 || i + 1 >= candles.length) return { ok: false, reason: 'edge' };
  const a = candles[i - 1]!;
  const b = candles[i + 1]!;
  if (!b.closed) return { ok: false, reason: 'unclosed' };
  let direction: Direction;
  let top: number;
  let bottom: number;
  if (b.low > a.high) {
    direction = 'bull';
    top = b.low;
    bottom = a.high;
  } else if (b.high < a.low) {
    direction = 'bear';
    top = a.low;
    bottom = b.high;
  } else return { ok: false, reason: 'no-gap' };
  let filled: number | null = null;
  for (let k = i + 2; k < candles.length; k++) {
    const c = candles[k]!;
    if (direction === 'bull' ? c.low <= bottom : c.high >= top) {
      filled = k;
      break;
    }
  }
  const endTime = candles[filled ?? candles.length - 1]!.openTime;
  return {
    ok: true,
    anchors: [
      { time: a.openTime, price: top },
      { time: endTime, price: bottom },
    ],
    direction,
    middleTime: candles[i]!.openTime,
    filledIndex: filled,
  };
}

/** Order Block: зона high-low свечи вправо до правого края. Бычий OB - медвежья свеча (close < open). */
export function resolveOb(candles: readonly Candle[], i: number): { anchors: [Anchor, Anchor]; direction: Direction } {
  const c = candles[clampIdx(candles, i)]!;
  const last = candles[candles.length - 1]!;
  return {
    anchors: [
      { time: c.openTime, price: c.high },
      { time: last.openTime, price: c.low },
    ],
    direction: c.close < c.open ? 'bull' : 'bear',
  };
}

export interface SwingRef {
  index: number;
  side: Side;
}

export type BreakResult =
  | { ok: true; anchors: [Anchor, Anchor]; direction: Direction; bodyClosed: boolean }
  | Rejection<'not-after'>;

/**
 * BOS/CHoCH: линия горизонтальна на цене свинга от свинга до свечи пробоя j (строго позже свинга).
 * Пробой high вверх - bull, low вниз - bear. bodyClosed=false: закрытие не за уровнем (проверка покажет BOS_WICK_ONLY).
 */
export function resolveBreak(candles: readonly Candle[], swing: SwingRef, j: number): BreakResult {
  if (j <= swing.index || j >= candles.length) return { ok: false, reason: 'not-after' };
  const s = candles[swing.index]!;
  const level = extreme(s, swing.side);
  const c = candles[j]!;
  const bull = swing.side === 'high';
  return {
    ok: true,
    anchors: [
      { time: s.openTime, price: level },
      { time: c.openTime, price: level },
    ],
    direction: bull ? 'bull' : 'bear',
    bodyClosed: bull ? c.close > level : c.close < level,
  };
}

/** Подтверждённый swing-экстремум p: окно ±SWING_RADIUS целиком левее конца `until` (включительно). */
function isPivot(candles: readonly Candle[], p: number, side: Side, until: number): boolean {
  if (p + SWING_RADIUS > until) return false;
  const v = extreme(candles[p]!, side);
  for (let k = Math.max(0, p - SWING_RADIUS); k <= p + SWING_RADIUS; k++) {
    if (k !== p && better(extreme(candles[k]!, side), v, side)) return false;
  }
  return true;
}

export type SweepResult =
  | { ok: true; anchors: [Anchor, Anchor]; direction: Direction }
  | Rejection<'no-swing' | 'is-break'>;

/**
 * Sweep: фитиль свечи j пробивает ближайший (последний) подтверждённый swing той же стороны,
 * а закрытие остаётся по эту сторону уровня. Закрытие за уровнем - это пробой.
 */
export function resolveSweep(candles: readonly Candle[], j: number, side: Side): SweepResult {
  const c = candles[j];
  if (!c) return { ok: false, reason: 'no-swing' };
  const until = j - 1;
  for (let p = until - SWING_RADIUS; p >= Math.max(0, j - SWEEP_LOOKBACK); p--) {
    if (!isPivot(candles, p, side, until)) continue;
    const level = extreme(candles[p]!, side);
    if (!better(extreme(c, side), level, side)) continue;
    const closedBeyond = side === 'high' ? c.close > level : c.close < level;
    if (closedBeyond) return { ok: false, reason: 'is-break' };
    return {
      ok: true,
      anchors: [
        { time: candles[p]!.openTime, price: level },
        { time: c.openTime, price: extreme(c, side) },
      ],
      direction: side === 'high' ? 'bear' : 'bull',
    };
  }
  return { ok: false, reason: 'no-swing' };
}

/**
 * Линии: цена снапится к ближайшему high/low свечей i-1..i+1, если ближе maxDistance; иначе остаётся как есть.
 * Время - openTime свечи, чей фитиль выбран (или касаемой свечи i).
 */
export function resolveWick(candles: readonly Candle[], i: number, price: number, maxDistance: number): Anchor {
  const c0 = clampIdx(candles, i);
  let best: Anchor | null = null;
  let bestD = Infinity;
  for (let k = Math.max(0, c0 - 1); k <= Math.min(candles.length - 1, c0 + 1); k++) {
    const c = candles[k]!;
    for (const p of [c.high, c.low]) {
      const d = Math.abs(p - price);
      if (d < bestD || (d === bestD && k === c0)) {
        bestD = d;
        best = { time: c.openTime, price: p };
      }
    }
  }
  if (best && bestD <= maxDistance) return best;
  return { time: candles[c0]!.openTime, price };
}
