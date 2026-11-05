// Реакция на уровень коррекции (FIBONACCI.md §6.1, §6.3, §6.6): resolveReaction, класс исхода, варианты, оценка уровня.
import { atr14 } from '../smc/series';
import type { Candle, Difficulty } from '../types';
import { FIB_OTE, fibDepth } from './levels';
import type { FibDirection, FibReactionOption } from './types';

/** Допуск зоны уровня в долях импульса. */
export const FIB_LEVEL_TOL = 0.04;
/** Порог слома по глубине для класса deep (0.786 + допуск). */
export const FIB_DEEP_FROM = 0.826;
/** Вопрос Premium/Discount не задаётся при |depth - 0.5| < 0.02. */
export const FIB_PD_MIN_DISTANCE = 0.02;
/** Реакция должна быть не меньше 1.5 ATR14[T] и не меньше 0.236 размаха импульса. */
export const FIB_REACTION_ATR = 1.5;
export const FIB_REACTION_RANGE = 0.236;

export const REACTION_LEVELS = [0.382, 0.5, 0.618, 0.705, 0.786] as const;
type LevelOption = '0.382' | '0.5' | '0.618' | '0.705' | '0.786';
const LEVEL_OPTIONS: readonly LevelOption[] = ['0.382', '0.5', '0.618', '0.705', '0.786'];
/** Упорядоченный ряд классов для оценки «соседний уровень». */
const ORDER: readonly FibReactionOption[] = ['0.382', '0.5', '0.618', '0.705', '0.786', 'deep'];
const EPS = 1e-12;

export type ReactionKind = 'reaction' | 'fail' | 'continuation' | 'timeout';

export interface ReactionOutcome {
  kind: ReactionKind;
  /** Индекс свечи исхода (для timeout - T + limit, но не дальше конца ряда). */
  index: number;
  /** Экстремум коррекции на (b, index]. */
  extremeIndex: number;
  extremePrice: number;
  depth: number;
  threshold: number;
  /** Что больше в max(): 'atr' - 1.5*ATR14[T], 'range' - 0.236 размаха. */
  thresholdBy: 'atr' | 'range';
  /** Ряд короче T + limit и исход не наступил (генерация такой отбраковывает). */
  incomplete: boolean;
}

export interface ReactionInput {
  candles: readonly Candle[];
  direction: FibDirection;
  A: number;
  B: number;
  /** Индекс B. */
  b: number;
  /** Индекс последней видимой свечи. */
  T: number;
  limit: number;
}

/** Экстремум коррекции на (b, to]: bull - минимальный low, bear - максимальный high; при равенстве - ранняя свеча. */
export function correctionExtreme(
  candles: readonly Candle[],
  direction: FibDirection,
  b: number,
  to: number,
): { index: number; price: number } | null {
  let idx = -1;
  let price = 0;
  for (let j = b + 1; j <= to && j < candles.length; j++) {
    const v = direction === 'bull' ? candles[j]!.low : candles[j]!.high;
    if (idx < 0 || (direction === 'bull' ? v < price : v > price)) {
      idx = j;
      price = v;
    }
  }
  return idx < 0 ? null : { index: idx, price };
}

export function reactionThreshold(atrT: number, A: number, B: number): { value: number; by: 'atr' | 'range' } {
  const byAtr = FIB_REACTION_ATR * atrT;
  const byRange = FIB_REACTION_RANGE * Math.abs(B - A);
  return byAtr >= byRange ? { value: byAtr, by: 'atr' } : { value: byRange, by: 'range' };
}

/** Порядок на одной свече: слом (закрытие за A) -> реакция (разворот >= thr по закрытию) -> продолжение (выход за B). */
export function resolveReaction(inp: ReactionInput): ReactionOutcome {
  const { candles, direction, A, B, b, T, limit } = inp;
  const bull = direction === 'bull';
  const atrT = atr14(candles.slice(0, T + 1))[T];
  if (atrT === null || atrT === undefined) throw new Error('FIB_ATR_NULL');
  const thr = reactionThreshold(atrT, A, B);
  const last = Math.min(T + limit, candles.length - 1);
  let mIdx = -1;
  let m = 0;
  const done = (kind: ReactionKind, index: number, incomplete = false): ReactionOutcome => ({
    kind,
    index,
    extremeIndex: mIdx,
    extremePrice: m,
    depth: mIdx < 0 ? 0 : fibDepth(A, B, m),
    threshold: thr.value,
    thresholdBy: thr.by,
    incomplete,
  });
  for (let j = b + 1; j <= last; j++) {
    const c = candles[j]!;
    const v = bull ? c.low : c.high;
    if (mIdx < 0 || (bull ? v < m : v > m)) {
      mIdx = j;
      m = v;
    }
    if (bull ? c.close < A : c.close > A) return done('fail', j);
    if (bull ? c.close >= m + thr.value : c.close <= m - thr.value) return done('reaction', j);
    if (bull ? c.high > B : c.low < B) return done('continuation', j);
  }
  return done('timeout', last, T + limit > candles.length - 1);
}

export type ReactionClass =
  | { kind: 'level'; level: LevelOption }
  | { kind: 'deep' }
  | { kind: 'between' }
  | { kind: 'shallow' }
  | { kind: 'continuation' }
  | { kind: 'timeout' };

/** Класс исхода (§6.3): уровень (|r - L| <= 0.04), deep (r > 0.826 или слом), between, shallow, continuation, timeout. */
export function classifyReaction(o: Pick<ReactionOutcome, 'kind' | 'depth'>): ReactionClass {
  if (o.kind === 'fail') return { kind: 'deep' };
  if (o.kind === 'continuation') return { kind: 'continuation' };
  if (o.kind === 'timeout') return { kind: 'timeout' };
  const r = o.depth;
  for (let i = 0; i < REACTION_LEVELS.length; i++) {
    if (Math.abs(r - REACTION_LEVELS[i]!) <= FIB_LEVEL_TOL + EPS) return { kind: 'level', level: LEVEL_OPTIONS[i]! };
  }
  if (r > FIB_DEEP_FROM) return { kind: 'deep' };
  if (r < REACTION_LEVELS[0] - FIB_LEVEL_TOL) return { kind: 'shallow' };
  return { kind: 'between' };
}

const inOte = (r: number): boolean => r >= FIB_OTE.from - EPS && r <= FIB_OTE.to + EPS;

/** Верные варианты: уровень L; плюс `ote`, если 0.62 <= r <= 0.79; deep - только deep. Для остальных классов - []. */
export function correctOptions(cls: ReactionClass, depth: number): FibReactionOption[] {
  if (cls.kind === 'deep') return ['deep'];
  if (cls.kind !== 'level') return [];
  return inOte(depth) ? [cls.level, 'ote'] : [cls.level];
}

/** Оценка уровня (§6.6): 1 - верный вариант; 0.5 - соседний в ряду 0.382…0.786, deep или ote у границ зоны; иначе 0. */
export function levelScore(option: FibReactionOption, cls: ReactionClass, outcome: Pick<ReactionOutcome, 'kind' | 'depth'>): number {
  const ok = correctOptions(cls, outcome.depth);
  if (ok.includes(option)) return 1;
  if (cls.kind !== 'level' && cls.kind !== 'deep') return 0;
  const r = outcome.depth;
  if (option === 'ote') {
    if (outcome.kind === 'reaction' && ((r >= 0.578 && r < FIB_OTE.from) || (r > FIB_OTE.to && r <= FIB_DEEP_FROM))) return 0.5;
    return 0;
  }
  const refPos = ORDER.indexOf(cls.kind === 'deep' ? 'deep' : cls.level);
  const optPos = ORDER.indexOf(option);
  return Math.abs(refPos - optPos) === 1 ? 0.5 : 0;
}

/**
 * Доступные варианты на момент T (§6.1): уровень L, если dT < L - tol; ote, если dT < 0.62; deep - только hard.
 * dT - глубина экстремума коррекции на (b, T] (0, если свечей нет).
 */
export function availableOptions(dT: number, difficulty: Difficulty): FibReactionOption[] {
  const out: FibReactionOption[] = [];
  for (let i = 0; i < REACTION_LEVELS.length; i++) {
    if (dT < REACTION_LEVELS[i]! - FIB_LEVEL_TOL) out.push(LEVEL_OPTIONS[i]!);
  }
  if (dT < FIB_OTE.from) out.push('ote');
  if (difficulty === 'hard') out.push('deep');
  return out;
}
