// Типы Fibonacci Playground (FIBONACCI.md §3, §6-§9). Контракты API: payload next, answer grade, detail.
import type { Anchor, Mark, StructureEvent, TaskTimeframe, UtcMs } from '../types';
import type { FibDirection } from './levels';

export type { FibDirection };

export interface ImpulsePoint {
  index: number;
  time: UtcMs;
  price: number;
}

export interface Impulse {
  direction: FibDirection;
  /** Внешний BOS/CHoCH, сломавший структуру. */
  event: StructureEvent;
  /** Начало, уровень 1. */
  a: ImpulsePoint;
  /** Конец, уровень 0. */
  b: ImpulsePoint;
  /** b.index + nExt. */
  confirmedIndex: number;
  /** b.index - a.index. */
  candles: number;
  atrA: number;
  rangeAtr: number;
}

export type ImpulseRejectReason = 'A_NOT_SWING' | 'A_NOT_EXTREME' | 'NO_B' | 'B_NOT_EXTREME' | 'BREAK_AFTER_B' | 'ATR_NULL';

export interface ImpulseScan {
  algoVersion: string;
  impulses: Impulse[];
  rejected: { event: StructureEvent; reason: ImpulseRejectReason }[];
  /** B - кандидат pendingSwings у правого края; только для терминала. */
  pending: Omit<Impulse, 'confirmedIndex'>[];
}

export type FibReactionOption = '0.382' | '0.5' | '0.618' | '0.705' | '0.786' | 'ote' | 'deep';
export type FibConfluenceKey = 'order-block' | 'fvg' | 'level';
export type FibTarget = '1' | '1.272' | '1.618' | 'none';
export type PdSide = 'premium' | 'discount';

// ---- payload next (API_CONTRACTS §3.3, FIBONACCI.md §9.2) ----
export interface FibGridTask {
  kind: 'fib-grid';
  tf: TaskTimeframe;
  window: { fromTime: UtcMs; toTime: UtcMs };
  directionHint: FibDirection | null;
  toleranceCandles: number;
  tools: ['fib-retracement'];
}
export interface FibReactionTask {
  kind: 'fib-reaction';
  tf: TaskTimeframe;
  /** Эталонная сетка (author 'algo', kind 'fib-retracement'). */
  grid: Mark;
  options: FibReactionOption[];
  confluenceOptions: FibConfluenceKey[];
  pdQuestion: { price: number } | null;
  limitCandles: number;
  hints?: Mark[];
}
export interface FibExtensionTask {
  kind: 'fib-extension';
  tf: TaskTimeframe;
  window: { fromTime: UtcMs; toTime: UtcMs };
  directionHint: FibDirection | null;
  targetOptions: FibTarget[];
  limitCandles: number;
  tools: ['fib-extension'];
}

// ---- answer grade (FIBONACCI.md §9.3) ----
export interface FibGridAnswer {
  kind: 'fib-grid';
  mark: Mark;
}
export interface FibReactionAnswer {
  kind: 'fib-reaction';
  option: FibReactionOption;
  confluence: FibConfluenceKey[];
  pd: PdSide | null;
}
export interface FibExtensionAnswer {
  kind: 'fib-extension';
  mark: Mark;
  target: FibTarget;
}

// ---- detail ----
export interface FibAnchorCheck {
  point: 'A' | 'B' | 'C';
  userTime: UtcMs;
  snappedPrice: number;
  /** Со знаком: user - ref. */
  offsetCandles: number;
  refTime: UtcMs;
  refPrice: number;
  ok: boolean;
  equalExtreme: boolean;
}
export interface FibDetail {
  direction: { user: FibDirection | null; ref: FibDirection };
  anchors: FibAnchorCheck[];
  gridShift: number | null;
  reaction?: {
    option: FibReactionOption;
    correctOptions: FibReactionOption[];
    levelScore: number;
    outcome: { kind: 'reaction' | 'fail'; time: UtcMs; extremeTime: UtcMs; extremePrice: number; depth: number; threshold: number };
    pd: { asked: boolean; given: PdSide | null; expected: PdSide | null; price: number | null; eq: number };
    confluence: {
      claimed: FibConfluenceKey[];
      atChosen: Record<FibConfluenceKey, boolean>;
      atReference: Record<FibConfluenceKey, boolean>;
    };
  };
  extension?: {
    target: FibTarget;
    reached: FibTarget;
    xMax: number;
    extremePrice: number;
    extremeTime: UtcMs;
    invalidationTime: UtcMs | null;
    endTime: UtcMs;
  };
}

export type { Anchor };
