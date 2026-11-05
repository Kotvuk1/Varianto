// Эталоны заданий Fibonacci: восстановление из видимого ряда и будущего (FIBONACCI.md §5-§7). Одни и те же функции
// используются при генерации (next) и при проверке (grade): эталон не зависит от того, кто его строит.
import { TIME_LIMIT_CANDLES } from '../challenge/facts';
import { gaps } from '../smc/series';
import type { Candle, Difficulty, TaskTimeframe, UtcMs } from '../types';
import { FibConfluence, bandOf } from './confluence';
import { resolveExtension, type ExtensionOutcome } from './extension';
import { findImpulses } from './impulses';
import { fibDepth, fibLevelPrice, pdZone } from './levels';
import {
  FIB_PD_MIN_DISTANCE,
  availableOptions,
  classifyReaction,
  correctOptions,
  correctionExtreme,
  resolveReaction,
  type ReactionClass,
  type ReactionOutcome,
} from './reaction';
import type { FibConfluenceKey, FibReactionOption, FibTarget, Impulse, PdSide } from './types';

/** Свеч после выбранного момента, нужных для проигрывания (ALGORITHMS §14.4). */
export const fibLimit = (tf: TaskTimeframe): number => TIME_LIMIT_CANDLES[tf];
/** Хвост после подтверждения реакции в проигрывании «Где реакция?». */
export const REPLAY_TAIL = 10;
/** Допуск по времени для точек A, B, C. */
export const FIB_TOLERANCE_CANDLES = 2;

export interface ImpulseKey {
  aTime: UtcMs;
  bTime: UtcMs;
}

function findOne(visible: readonly Candle[], nExt: number, k: ImpulseKey): Impulse | null {
  const scan = findImpulses(visible, { nExt });
  return scan.impulses.find((i) => i.a.time === k.aTime && i.b.time === k.bTime) ?? null;
}

// ------------------------------------------------------------------ grid

export interface GridRef {
  impulse: Impulse;
  /** B - кандидат у правого края (терминал): конец сетки ещё не подтверждён (FIB_IMPULSE_UNCONFIRMED). */
  pending?: boolean;
  /** Индекс последней видимой свечи. */
  T: number;
  nExt: number;
}

/** Эталон «Построй сетку»: импульс известен к T (confirmedIndex <= T). */
export function buildGridRef(visible: readonly Candle[], p: { nExt: number } & ImpulseKey): GridRef | null {
  const impulse = findOne(visible, p.nExt, p);
  const T = visible.length - 1;
  if (!impulse || impulse.confirmedIndex > T) return null;
  return { impulse, T, nExt: p.nExt };
}

// ------------------------------------------------------------------ reaction

export interface ReactionRef {
  impulse: Impulse;
  T: number;
  nExt: number;
  /** Уровень сложности, по которому отобраны варианты (после ослабления). */
  evalDifficulty: Difficulty;
  outcome: ReactionOutcome;
  cls: ReactionClass;
  correct: FibReactionOption[];
  /** Вариант-уровень эталона (для deep - 'deep'). */
  referenceOption: FibReactionOption;
  /** Глубина экстремума коррекции на (b, T]. */
  dT: number;
  options: FibReactionOption[];
  pd: { price: number; expected: PdSide; eq: number; asked: boolean };
  confluence: FibConfluence;
  atReference: Record<FibConfluenceKey, boolean>;
  limit: number;
  /** visible + future: ряд, по которому определён исход. */
  series: readonly Candle[];
}

export interface ReactionParams extends ImpulseKey {
  nExt: number;
  tf: TaskTimeframe;
  evalDifficulty: Difficulty;
}

/** Эталон «Где реакция?»: visible = закрытые свечи до T включительно (T = confirmedIndex), future - свечи после T. */
export function buildReactionRef(visible: readonly Candle[], future: readonly Candle[], p: ReactionParams): ReactionRef | null {
  const impulse = findOne(visible, p.nExt, p);
  const T = visible.length - 1;
  if (!impulse || impulse.confirmedIndex !== T) return null;
  const limit = fibLimit(p.tf);
  const series = future.length ? [...visible, ...future] : visible;
  const [A, B] = [impulse.a.price, impulse.b.price];
  const outcome = resolveReaction({ candles: series, direction: impulse.direction, A, B, b: impulse.b.index, T, limit });
  if (outcome.incomplete) return null;
  const cls = classifyReaction(outcome);
  const correct = correctOptions(cls, outcome.depth);
  if (correct.length === 0) return null;
  const ext = correctionExtreme(visible, impulse.direction, impulse.b.index, T);
  const dT = ext ? fibDepth(A, B, ext.price) : 0;
  const options = availableOptions(dT, p.evalDifficulty);
  const referenceOption = correct[0]!;
  const confluence = new FibConfluence(visible, p.nExt, { direction: impulse.direction, aIndex: impulse.a.index, A, B });
  const price = visible[T]!.close;
  const d = fibDepth(A, B, price);
  const zone = pdZone(A, B, price);
  return {
    impulse,
    T,
    nExt: p.nExt,
    evalDifficulty: p.evalDifficulty,
    outcome,
    cls,
    correct,
    referenceOption,
    dT,
    options,
    pd: {
      price,
      expected: zone === 'equilibrium' ? 'discount' : zone,
      eq: fibLevelPrice(A, B, 0.5),
      asked: zone !== 'equilibrium' && Math.abs(d - 0.5) >= FIB_PD_MIN_DISTANCE,
    },
    confluence,
    atReference: confluence.at(bandOf(A, B, referenceOption)),
    limit,
    series,
  };
}

/** Проигрывание «Где реакция?»: свечи (T, min(исход + 10, T + limit)], индекс свечи исхода внутри. */
export function reactionReplayRange(ref: Pick<ReactionRef, 'T' | 'outcome' | 'limit'>): { from: number; to: number; exit: number } {
  const to = Math.min(ref.outcome.index + REPLAY_TAIL, ref.T + ref.limit);
  return { from: ref.T + 1, to, exit: ref.outcome.index - (ref.T + 1) };
}

// ------------------------------------------------------------------ extension

export interface ExtensionRef {
  impulse: Impulse;
  /** Te: индекс последней видимой свечи. */
  T: number;
  nExt: number;
  evalDifficulty: Difficulty;
  c: { index: number; time: UtcMs; price: number };
  /** Индекс свечи подтверждения реакции. */
  j: number;
  outcome: ExtensionOutcome;
  targetOptions: FibTarget[];
  limit: number;
  series: readonly Candle[];
}

export interface ExtensionParams extends ImpulseKey {
  nExt: number;
  tf: TaskTimeframe;
  evalDifficulty: Difficulty;
}

/** Диапазон глубины C по сложности (§4). */
export const EXT_C_DEPTH: Record<Difficulty, { min: number; max: number; maxExclusive: boolean }> = {
  easy: { min: 0.5, max: 0.79, maxExclusive: false },
  medium: { min: 0.342, max: 0.826, maxExclusive: false },
  hard: { min: 0.342, max: 1, maxExclusive: true },
};

/**
 * Эталон «Цель по Extension»: visible заканчивается на Te. T0 = b + nExt; исход resolveReaction от T0 обязан быть
 * `reaction` после T0; C = экстремум коррекции; Te = max(j, c + 2).
 */
export function buildExtensionRef(visible: readonly Candle[], future: readonly Candle[], p: ExtensionParams): ExtensionRef | null {
  const impulse = findOne(visible, p.nExt, p);
  const Te = visible.length - 1;
  if (!impulse) return null;
  const limit = fibLimit(p.tf);
  const series = future.length ? [...visible, ...future] : visible;
  const bull = impulse.direction === 'bull';
  const [A, B] = [impulse.a.price, impulse.b.price];
  const b = impulse.b.index;
  const T0 = impulse.confirmedIndex;
  if (T0 >= Te) return null;
  const o = resolveReaction({ candles: series, direction: impulse.direction, A, B, b, T: T0, limit });
  if (o.kind !== 'reaction' || o.index <= T0 || o.incomplete) return null;
  const c = o.extremeIndex;
  const C = o.extremePrice;
  if (Te !== Math.max(o.index, c + 2)) return null;
  // на (c, Te] нет нового экстремума за C; на (b, Te) нет выхода за B (свеча Te может выйти)
  for (let k = c + 1; k <= Te; k++) if (bull ? visible[k]!.low < C : visible[k]!.high > C) return null;
  for (let k = b + 1; k < Te; k++) if (bull ? visible[k]!.high > B : visible[k]!.low < B) return null;
  const depth = fibDepth(A, B, C);
  const range = EXT_C_DEPTH[p.evalDifficulty];
  if (!(depth >= range.min && (range.maxExclusive ? depth < range.max : depth <= range.max + 1e-12))) return null;
  if (depth >= 1) return null;
  const outcome = resolveExtension({ candles: series, direction: impulse.direction, A, B, C, Te, limit });
  if (outcome.incomplete) return null;
  return {
    impulse,
    T: Te,
    nExt: p.nExt,
    evalDifficulty: p.evalDifficulty,
    c: { index: c, time: visible[c]!.openTime, price: C },
    j: o.index,
    outcome,
    targetOptions: p.evalDifficulty === 'hard' ? ['1', '1.272', '1.618', 'none'] : ['1', '1.272', '1.618'],
    limit,
    series,
  };
}

export function extensionReplayRange(ref: Pick<ExtensionRef, 'T' | 'outcome'>): { from: number; to: number; exit: number | null } {
  return {
    from: ref.T + 1,
    to: ref.outcome.endIndex,
    exit: ref.outcome.invalidationIndex === null ? null : ref.outcome.invalidationIndex - (ref.T + 1),
  };
}

/** Окно непрерывно (без пропусков свечей). */
export function continuous(candles: readonly Candle[], tf: TaskTimeframe): boolean {
  return gaps(candles, tf).length === 0;
}

