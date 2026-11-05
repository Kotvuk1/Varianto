// Генерация заданий Fibonacci по seed (FIBONACCI.md §4-§7). Чистые функции над готовым непрерывным рядом свечей:
// выбор реального периода и сеть - на стороне API. Эталон проверяется теми же buildGridRef/buildReactionRef/buildExtensionRef,
// что используются при grade (эталон не зависит от того, кто его строит).
import { visibleCount, relaxation, MAX_ATTEMPTS } from '../pa/generate';
import { mulberry32, randInt } from '../rng';
import { atr14, gaps } from '../smc/series';
import { detectSwings } from '../smc/swings';
import { TIMEFRAME_MS, type Candle, type Difficulty, type Mark, type TaskTimeframe, type UtcMs } from '../types';
import { findImpulses } from './impulses';
import { gridMark, reactionHints } from './marks';
import { availableOptions } from './reaction';
import {
  EXT_C_DEPTH,
  FIB_TOLERANCE_CANDLES,
  buildExtensionRef,
  buildGridRef,
  buildReactionRef,
  fibLimit,
  type ExtensionRef,
  type ReactionRef,
} from './ref';
import type {
  FibDirection,
  FibExtensionTask,
  FibGridTask,
  FibReactionOption,
  FibReactionTask,
  FibTarget,
  Impulse,
  ImpulseScan,
} from './types';
import { FIB_CONFLUENCE_KEYS } from './confluence';

export type FibTaskType = 'grid' | 'reaction' | 'extension';

/** nExt (импульс и структура) по сложности. */
export const FIB_NEXT: Readonly<Record<Difficulty, number>> = { easy: 7, medium: 5, hard: 5 };
/** Фильтры импульса по сложности (§4): rangeAtr >= min, длина ноги в свечах. */
export const FIB_IMPULSE_RULES: Readonly<Record<Difficulty, { minRangeAtr: number; candles: [number, number]; pad: [number, number] }>> = {
  easy: { minRangeAtr: 6, candles: [8, 60], pad: [5, 7] },
  medium: { minRangeAtr: 4, candles: [5, 80], pad: [5, 20] },
  hard: { minRangeAtr: 3, candles: [5, 120], pad: [20, 60] },
};
const GRID_MAX_EXTRA = 10;
/** Классы ответа «Где реакция?» по сложности. */
const REACTION_CLASSES: Readonly<Record<Difficulty, readonly FibReactionOption[]>> = {
  easy: ['0.5', '0.618', '0.705', '0.786'],
  medium: ['0.382', '0.5', '0.618', '0.705', '0.786'],
  hard: ['0.382', '0.5', '0.618', '0.705', '0.786', 'deep'],
};
const DEEP_SHARE = 0.3;
const NONE_SHARE = 0.25;
const EXT_TARGETS: readonly FibTarget[] = ['1', '1.272', '1.618'];

export interface FibPickInput {
  /** Непрерывный ряд закрытых свечей tf (история + будущее). */
  candles: readonly Candle[];
  tf: TaskTimeframe;
  difficulty: Difficulty;
  seed: number;
  taskType: FibTaskType;
  maxAttempts?: number;
  /** Глубина видимой истории, свечей (по умолчанию как в заданиях: 500, для 1d - 365). Меняется только в тестах на коротких фикстурах. */
  depth?: number;
  /** Разрешено ли ослабление критерия сложности и снятие балансировки (§4); по умолчанию да. */
  allowRelax?: boolean;
  /** Исключение момента T (openTime последней видимой свечи + шаг ТФ). */
  isExcluded?: (T: UtcMs) => boolean;
}

export interface FibPick {
  taskType: FibTaskType;
  /** Индекс последней видимой свечи (T для grid/reaction, Te для extension) во входном ряду. */
  endIndex: number;
  /** Момент решения: openTime последней видимой свечи + шаг ТФ. */
  T: UtcMs;
  /** Первый индекс видимого ряда во входном (`endIndex - depth + 1`). */
  visibleFrom: number;
  nExt: number;
  /** Уровень сложности, по которому отобрано задание (после ослабления). */
  evalDifficulty: Difficulty;
  direction: FibDirection;
  aTime: UtcMs;
  bTime: UtcMs;
  cTime?: UtcMs;
  window?: { fromTime: UtcMs; toTime: UtcMs };
  directionHint: FibDirection | null;
  /** Эталонный класс ответа (reaction - вариант; extension - цель). */
  answerClass?: string;
}

const rngFor = (seed: number, salt: number) => mulberry32((seed ^ Math.imul(salt + 1, 0x9e3779b1)) | 0);

function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

interface PoolEntry<R> {
  imp: Impulse;
  ref: R;
  /** Индекс последней видимой свечи во входном ряду. */
  end: number;
}

class Ctx {
  private readonly scans = new Map<number, ImpulseScan>();
  private readonly reactionPools = new Map<number, PoolEntry<ReactionRef>[]>();
  private readonly extensionPools = new Map<number, PoolEntry<ExtensionRef>[]>();
  private atrCache: (number | null)[] | null = null;
  readonly depth: number;
  readonly minHistory: number;
  readonly limit: number;
  readonly step: number;
  constructor(readonly inp: FibPickInput) {
    this.depth = inp.depth ?? visibleCount(inp.tf);
    this.minHistory = this.depth - 200;
    this.limit = fibLimit(inp.tf);
    this.step = TIMEFRAME_MS[inp.tf];
  }
  get candles(): readonly Candle[] {
    return this.inp.candles;
  }
  scan(nExt: number): ImpulseScan {
    let s = this.scans.get(nExt);
    if (!s) {
      s = findImpulses(this.candles, { nExt });
      this.scans.set(nExt, s);
    }
    return s;
  }
  decisionTime(end: number): UtcMs {
    return this.candles[end]!.openTime + this.step;
  }
  excluded(end: number): boolean {
    return this.inp.isExcluded?.(this.decisionTime(end)) ?? false;
  }
  visible(end: number): Candle[] {
    return this.candles.slice(end - this.depth + 1, end + 1) as Candle[];
  }
  /** Видимая история полная и окно [видимое начало, futureTo] непрерывно (без пропусков свечей). */
  windowOk(end: number, futureTo: number): boolean {
    const from = end - this.depth + 1;
    if (from < 0 || futureTo > this.candles.length - 1) return false;
    return gaps(this.candles.slice(from, futureTo + 1), this.inp.tf).length === 0;
  }
  historyOk(imp: Impulse, end: number): boolean {
    const from = end - this.depth + 1;
    return from >= 0 && imp.a.index - from >= this.minHistory;
  }
  impulseFilter(imp: Impulse, level: Difficulty): boolean {
    const r = FIB_IMPULSE_RULES[level];
    return imp.rangeAtr >= r.minRangeAtr && imp.candles >= r.candles[0] && imp.candles <= r.candles[1];
  }
  reactionPool(nExt: number): PoolEntry<ReactionRef>[] {
    let pool = this.reactionPools.get(nExt);
    if (!pool) {
      pool = [];
      for (const imp of this.scan(nExt).impulses) {
        const end = imp.confirmedIndex;
        if (!this.historyOk(imp, end) || !this.windowOk(end, end + this.limit)) continue;
        const ref = buildReactionRef(this.visible(end), this.candles.slice(end + 1, end + 1 + this.limit), {
          nExt, tf: this.inp.tf, evalDifficulty: 'hard', aTime: imp.a.time, bTime: imp.b.time,
        });
        if (ref) pool.push({ imp, ref, end });
      }
      this.reactionPools.set(nExt, pool);
    }
    return pool;
  }
  extensionPool(nExt: number): PoolEntry<ExtensionRef>[] {
    let pool = this.extensionPools.get(nExt);
    if (!pool) {
      pool = [];
      for (const imp of this.scan(nExt).impulses) {
        const end = this.extensionEnd(imp);
        if (end === null || !this.historyOk(imp, end) || !this.windowOk(end, end + this.limit)) continue;
        const ref = buildExtensionRef(this.visible(end), this.candles.slice(end + 1, end + 1 + this.limit), {
          nExt, tf: this.inp.tf, evalDifficulty: 'hard', aTime: imp.a.time, bTime: imp.b.time,
        });
        if (ref) pool.push({ imp, ref, end });
      }
      this.extensionPools.set(nExt, pool);
    }
    return pool;
  }
  /** Te = max(j, c + 2) по тем же правилам §6.3, что resolveReaction от T0 (окончательная проверка - в buildExtensionRef). */
  private extensionEnd(imp: Impulse): number | null {
    const c = this.candles;
    const bull = imp.direction === 'bull';
    const T0 = imp.confirmedIndex;
    const [A, B] = [imp.a.price, imp.b.price];
    const lim = Math.min(T0 + this.limit, c.length - 1);
    const atr = this.atrAt(T0);
    if (atr === null) return null;
    const thr = Math.max(1.5 * atr, 0.236 * Math.abs(B - A));
    let m = 0;
    let mi = -1;
    for (let j = imp.b.index + 1; j <= lim; j++) {
      const k = c[j]!;
      const v = bull ? k.low : k.high;
      if (mi < 0 || (bull ? v < m : v > m)) {
        mi = j;
        m = v;
      }
      if (bull ? k.close < A : k.close > A) return null;
      if (bull ? k.close >= m + thr : k.close <= m - thr) return j > T0 ? Math.max(j, mi + 2) : null;
      if (bull ? k.high > B : k.low < B) return null;
    }
    return null;
  }
  private atrAt(i: number): number | null {
    if (!this.atrCache) this.atrCache = atr14(this.candles);
    return this.atrCache[i] ?? null;
  }
}

// ------------------------------------------------------------------ окно задания

interface WindowPlan {
  fromIndex: number;
}

function planWindow(ctx: Ctx, imp: Impulse, level: Difficulty, end: number): WindowPlan | null {
  const rng = rngFor(ctx.inp.seed, imp.b.index);
  const [lo, hi] = FIB_IMPULSE_RULES[level].pad;
  const pad = lo + randInt(rng, hi - lo + 1);
  const fromIndex = imp.a.index - pad;
  const visFrom = end - ctx.depth + 1;
  if (fromIndex < 0 || fromIndex - visFrom < ctx.minHistory) return null;
  return { fromIndex };
}

/** A - крайний экстремум своей стороны на [from, toA], B - своей на [from, toB] (easy/medium). */
function extremesOk(c: readonly Candle[], imp: Impulse, from: number, toA: number, toB: number): boolean {
  const bull = imp.direction === 'bull';
  for (let i = from; i <= toA; i++) if (bull ? c[i]!.low < imp.a.price : c[i]!.high > imp.a.price) return false;
  for (let i = from; i <= toB; i++) if (bull ? c[i]!.high > imp.b.price : c[i]!.low < imp.b.price) return false;
  return true;
}

/** Ловушка hard (§5.1 п.4): экстремум за A до A в окне либо внутренний swing (N=2) противоположного типа в ноге. */
function hasTrap(c: readonly Candle[], imp: Impulse, from: number): boolean {
  const bull = imp.direction === 'bull';
  for (let i = from; i < imp.a.index; i++) if (bull ? c[i]!.low < imp.a.price : c[i]!.high > imp.a.price) return true;
  const leg = c.slice(imp.a.index, imp.b.index + 1);
  return detectSwings(leg, { left: 2, right: 2 }, 'internal').some((s) => (bull ? s.type === 'high' : s.type === 'low'));
}

// ------------------------------------------------------------------ grid

function pickGrid(ctx: Ctx, level: Difficulty, rng: () => number): FibPick | null {
  const nExt = FIB_NEXT[level];
  const scan = ctx.scan(nExt);
  const c = ctx.candles;
  const eventBreaks = [...scan.impulses, ...scan.pending, ...scan.rejected].map((x) => x.event.breakIndex);
  const cands: { imp: Impulse; end: number; plan: WindowPlan }[] = [];
  for (const imp of scan.impulses) {
    if (!ctx.impulseFilter(imp, level)) continue;
    const end = imp.confirmedIndex + randInt(rngFor(ctx.inp.seed, imp.b.index + 7919), GRID_MAX_EXTRA + 1);
    if (end > c.length - 1 || end - ctx.depth + 1 < 0) continue;
    const bull = imp.direction === 'bull';
    let alive = true;
    for (let i = imp.b.index + 1; i <= end && alive; i++) {
      if (bull ? c[i]!.high > imp.b.price || c[i]!.close < imp.a.price : c[i]!.low < imp.b.price || c[i]!.close > imp.a.price) alive = false;
    }
    if (!alive || eventBreaks.some((k) => k > imp.event.breakIndex && k <= end)) continue;
    const plan = planWindow(ctx, imp, level, end);
    if (!plan || !ctx.windowOk(end, end)) continue;
    if (level === 'hard' ? !hasTrap(c, imp, plan.fromIndex) : !extremesOk(c, imp, plan.fromIndex, end, end)) continue;
    cands.push({ imp, end, plan });
  }
  for (const cand of shuffled(cands, rng).slice(0, ctx.inp.maxAttempts ?? MAX_ATTEMPTS)) {
    if (ctx.excluded(cand.end)) continue;
    if (!buildGridRef(ctx.visible(cand.end), { nExt, aTime: cand.imp.a.time, bTime: cand.imp.b.time })) continue;
    return {
      taskType: 'grid',
      endIndex: cand.end,
      T: ctx.decisionTime(cand.end),
      visibleFrom: cand.end - ctx.depth + 1,
      nExt,
      evalDifficulty: level,
      direction: cand.imp.direction,
      aTime: cand.imp.a.time,
      bTime: cand.imp.b.time,
      window: { fromTime: c[cand.plan.fromIndex]!.openTime, toTime: c[cand.end]!.openTime },
      directionHint: level === 'easy' ? cand.imp.direction : null,
    };
  }
  return null;
}

// ------------------------------------------------------------------ reaction / extension

/** Желаемый класс ответа: `special` (deep / none) с долей `share`, остальные равновероятно. */
function desiredClass<T extends string>(classes: readonly T[], special: T | null, share: number, rng: () => number): T {
  if (special && classes.includes(special) && rng() < share) return special;
  const rest = classes.filter((x) => x !== special);
  return rest[randInt(rng, rest.length)]!;
}

function pickReaction(ctx: Ctx, level: Difficulty, balanced: boolean, rng: () => number): FibPick | null {
  const nExt = FIB_NEXT[level];
  const classes = REACTION_CLASSES[level];
  const want = balanced ? desiredClass(classes, level === 'hard' ? 'deep' : null, DEEP_SHARE, rng) : null;
  const pool = ctx.reactionPool(nExt).filter(({ imp, ref, end }) => {
    if (!ctx.impulseFilter(imp, level)) return false;
    const cls = ref.referenceOption;
    if (!classes.includes(cls)) return false;
    if (want !== null && cls !== want) return false;
    const opts = availableOptions(ref.dT, level);
    if (!opts.includes(cls)) return false; // класс эталона пройден до T
    if (ref.outcome.index <= ref.T) return false; // исход наступил на (b, T]
    if (ctx.excluded(end)) return false;
    if (level === 'easy') return FIB_CONFLUENCE_KEYS.some((k) => ref.atReference[k]);
    if (level === 'hard' && cls !== 'deep') {
      const others = opts.filter((o) => o !== 'ote' && o !== 'deep' && !ref.correct.includes(o));
      return others.some((o) => FIB_CONFLUENCE_KEYS.some((k) => ref.confluence.atOption(o)[k]));
    }
    return true;
  });
  const cand = shuffled(pool, rng)[0];
  if (!cand) return null;
  return {
    taskType: 'reaction',
    endIndex: cand.end,
    T: ctx.decisionTime(cand.end),
    visibleFrom: cand.end - ctx.depth + 1,
    nExt,
    evalDifficulty: level,
    direction: cand.imp.direction,
    aTime: cand.imp.a.time,
    bTime: cand.imp.b.time,
    directionHint: null,
    answerClass: cand.ref.referenceOption,
  };
}

function pickExtension(ctx: Ctx, level: Difficulty, balanced: boolean, rng: () => number): FibPick | null {
  const nExt = FIB_NEXT[level];
  const classes: readonly FibTarget[] = level === 'hard' ? [...EXT_TARGETS, 'none'] : EXT_TARGETS;
  const want = balanced ? desiredClass<FibTarget>(classes, level === 'hard' ? 'none' : null, NONE_SHARE, rng) : null;
  const range = EXT_C_DEPTH[level];
  const c = ctx.candles;
  const pool = ctx.extensionPool(nExt)
    .map((e) => ({ ...e, plan: planWindow(ctx, e.imp, level, e.end) }))
    .filter(({ imp, ref, end, plan }) => {
      if (!plan || !ctx.impulseFilter(imp, level)) return false;
      const depth = Math.abs((imp.b.price - ref.c.price) / (imp.b.price - imp.a.price));
      if (!(depth >= range.min && (range.maxExclusive ? depth < range.max : depth <= range.max + 1e-12))) return false;
      const r = ref.outcome.reached;
      if (!classes.includes(r) || (want !== null && r !== want) || ctx.excluded(end)) return false;
      // easy/medium: A и B - крайние экстремумы окна (свеча Te может выйти за B)
      return level === 'hard' || extremesOk(c, imp, plan.fromIndex, end, end - 1);
    });
  const cand = shuffled(pool, rng)[0];
  if (!cand) return null;
  return {
    taskType: 'extension',
    endIndex: cand.end,
    T: ctx.decisionTime(cand.end),
    visibleFrom: cand.end - ctx.depth + 1,
    nExt,
    evalDifficulty: level,
    direction: cand.imp.direction,
    aTime: cand.imp.a.time,
    bTime: cand.imp.b.time,
    cTime: cand.ref.c.time,
    window: { fromTime: c[cand.plan!.fromIndex]!.openTime, toTime: c[cand.end]!.openTime },
    directionHint: level === 'easy' ? cand.imp.direction : null,
    answerClass: cand.ref.outcome.reached,
  };
}

/**
 * Выбор задания по seed (§4): желаемый класс ответа выбирается по seed (балансировка), затем ищется подходящий импульс;
 * при неудаче критерий ослабляется на ступень (hard -> medium -> easy) с сохранением `difficulty`, затем снимается балансировка.
 * Результат не зависит от порядка вызовов: все случайные выборы - от `seed` и индексов свечей.
 */
export function pickFibTask(inp: FibPickInput): FibPick | null {
  const ctx = new Ctx(inp);
  const relax = inp.allowRelax !== false;
  const levels = relax ? relaxation(inp.difficulty) : [inp.difficulty];
  const stages: { level: Difficulty; balanced: boolean }[] = [
    ...levels.map((level) => ({ level, balanced: true })),
    ...(relax && inp.taskType !== 'grid' ? levels.map((level) => ({ level, balanced: false })) : []),
  ];
  for (let i = 0; i < stages.length; i++) {
    const { level, balanced } = stages[i]!;
    const rng = rngFor(inp.seed, 0x4000 + i);
    const pick =
      inp.taskType === 'grid'
        ? pickGrid(ctx, level, rng)
        : inp.taskType === 'reaction'
          ? pickReaction(ctx, level, balanced, rng)
          : pickExtension(ctx, level, balanced, rng);
    if (pick) return pick;
  }
  return null;
}

// ------------------------------------------------------------------ payload (реальное время; шкалу задания сдвигает API)

export function fibGridTask(pick: FibPick, tf: TaskTimeframe): FibGridTask {
  return {
    kind: 'fib-grid',
    tf,
    window: pick.window!,
    directionHint: pick.directionHint,
    toleranceCandles: FIB_TOLERANCE_CANDLES,
    tools: ['fib-retracement'],
  };
}

export function fibReactionTask(ref: ReactionRef, tf: TaskTimeframe, withHints: boolean, visible: readonly Candle[]): FibReactionTask {
  return {
    kind: 'fib-reaction',
    tf,
    grid: gridMark(ref.impulse),
    options: ref.options,
    confluenceOptions: [...FIB_CONFLUENCE_KEYS],
    pdQuestion: ref.pd.asked ? { price: ref.pd.price } : null,
    limitCandles: ref.limit,
    ...(withHints ? { hints: reactionHints(ref.impulse, visible[visible.length - 1]!.openTime) } : {}),
  };
}

export function fibExtensionTask(
  ref: ExtensionRef,
  tf: TaskTimeframe,
  window: { fromTime: UtcMs; toTime: UtcMs },
  directionHint: FibDirection | null,
): FibExtensionTask {
  return { kind: 'fib-extension', tf, window, directionHint, targetOptions: ref.targetOptions, limitCandles: ref.limit, tools: ['fib-extension'] };
}

export type { Mark };
