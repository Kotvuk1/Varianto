// Генерация заданий Price Action по seed (ALGORITHMS §13.1, §13.4, §11.6). Чистые функции над готовым рядом свечей:
// выбор реального момента из архива и сеть — на стороне API.
import { gaps } from '../smc/series';
import { atr14, closedOnly } from '../smc/series';
import { mulberry32, randInt } from '../rng';
import type {
  AlgoMarkSet,
  Candle,
  Difficulty,
  GradeContext,
  PatternType,
  SkillId,
  TaskTimeframe,
  UtcMs,
} from '../types';
import { computeContext, htfClosedAt, patternToMark, type ContextReference } from './context';
import { pickLevelReference, LEVEL_TOLERANCE_PCT, type Level } from './levels';
import { detectPatterns } from './patterns';
import type { PatternInstance } from './types';

/** Окно поиска «Найди модель», свечей. */
export const FIND_WINDOW = 40;
/** Видимая история, свечей (1d — 365). */
export const visibleCount = (tf: TaskTimeframe): number => (tf === '1d' ? 365 : 500);
export const MAX_ATTEMPTS = 200;
const DEFAULT_MIN_HISTORY = 300;

const LADDER: Difficulty[] = ['hard', 'medium', 'easy'];
/** Ослабление критерия: hard -> medium -> easy (`difficulty` задания сохраняется вызывающим). */
export function relaxation(d: Difficulty): Difficulty[] {
  return LADDER.slice(LADDER.indexOf(d));
}

export interface PaPickInput {
  candles: readonly Candle[];
  tf: TaskTimeframe;
  difficulty: Difficulty;
  seed: number;
  /** Минимум закрытых свечей до момента T (прогрев); по умолчанию 300. */
  minHistory?: number;
  maxAttempts?: number;
}

/** Видимый ряд для момента end: непрерывный, ATR14 определён и > 0. */
function usable(candles: readonly Candle[], end: number, tf: TaskTimeframe): boolean {
  const vis = candles.slice(Math.max(0, end - visibleCount(tf) + 1), end + 1);
  if (gaps(vis, tf).length > 0) return false;
  const a = atr14(vis)[vis.length - 1];
  return a !== null && a !== undefined && a > 0;
}

function* endCandidates(seed: number, lo: number, hi: number, attempts: number): Generator<number> {
  const rng = mulberry32(seed);
  const span = hi - lo + 1;
  if (span <= 0) return;
  for (let a = 0; a < attempts; a++) yield lo + randInt(rng, span);
}

const FIND_RULES: Record<Difficulty, { minRangeAtr: number; maxInstances: number }> = {
  easy: { minRangeAtr: 1.0, maxInstances: 2 },
  medium: { minRangeAtr: 0, maxInstances: 3 },
  hard: { minRangeAtr: 0, maxInstances: 4 },
};

export interface FindPatternPick {
  endIndex: number;
  /** T = closeTime последней видимой свечи + 1. */
  T: UtcMs;
  target: PatternType;
  instances: PatternInstance[];
  window: { fromIndex: number; toIndex: number };
  /** Сложность, по критерию которой найдено (если ослаблено). */
  relaxedTo?: Difficulty;
}

export function pickFindPattern(input: PaPickInput & { targets?: readonly PatternType[] }): FindPatternPick | null {
  const candles = closedOnly(input.candles);
  const n = candles.length;
  const minHistory = input.minHistory ?? DEFAULT_MIN_HISTORY;
  const patterns = detectPatterns(candles);
  const atr = atr14(candles);
  const attempts = input.maxAttempts ?? MAX_ATTEMPTS;

  for (const level of relaxation(input.difficulty)) {
    const rule = FIND_RULES[level];
    const rng = mulberry32(input.seed ^ (LADDER.indexOf(level) * 0x9e3779b1));
    for (const end of endCandidates(input.seed + LADDER.indexOf(level), minHistory, n - 1, attempts)) {
      if (!usable(candles, end, input.tf)) continue;
      const from = end - FIND_WINDOW + 1;
      const inWin = patterns.filter((p) => p.lastIndex >= from && p.lastIndex <= end);
      const byType = new Map<PatternType, PatternInstance[]>();
      for (const p of inWin) {
        if (input.targets && !input.targets.includes(p.type)) continue;
        if (rule.minRangeAtr > 0) {
          const a = atr[p.lastIndex];
          let maxRange = 0;
          for (let i = p.firstIndex; i <= p.lastIndex; i++) maxRange = Math.max(maxRange, candles[i]!.high - candles[i]!.low);
          if (a === null || a === undefined || maxRange < rule.minRangeAtr * a) continue;
        }
        const list = byType.get(p.type) ?? [];
        list.push(p);
        byType.set(p.type, list);
      }
      const eligible = [...byType.entries()].filter(([, l]) => l.length >= 1 && l.length <= rule.maxInstances);
      if (eligible.length === 0) continue;
      eligible.sort((a, b) => a[0].localeCompare(b[0]));
      const [target, instances] = eligible[randInt(rng, eligible.length)]!;
      return {
        endIndex: end,
        T: candles[end]!.closeTime + 1,
        target,
        instances,
        window: { fromIndex: from, toIndex: end },
        ...(level !== input.difficulty ? { relaxedTo: level } : {}),
      };
    }
  }
  return null;
}

export interface LevelTaskPick {
  endIndex: number;
  T: UtcMs;
  levelType: 'support' | 'resistance';
  reference: Level;
  tolerancePct: number;
  difficulty: Difficulty;
  relaxedTo?: Difficulty;
}

export function pickLevelTask(input: PaPickInput): LevelTaskPick | null {
  const candles = closedOnly(input.candles);
  const n = candles.length;
  const minHistory = input.minHistory ?? DEFAULT_MIN_HISTORY;
  const attempts = input.maxAttempts ?? MAX_ATTEMPTS;
  for (const level of relaxation(input.difficulty)) {
    const rng = mulberry32(input.seed ^ (LADDER.indexOf(level) * 0x85ebca6b));
    for (const end of endCandidates(input.seed + LADDER.indexOf(level), minHistory, n - 1, attempts)) {
      if (!usable(candles, end, input.tf)) continue;
      const vis = candles.slice(Math.max(0, end - visibleCount(input.tf) + 1), end + 1);
      const options = (['support', 'resistance'] as const)
        .map((t) => ({ t, r: pickLevelReference(vis, t, level) }))
        .filter((o): o is { t: 'support' | 'resistance'; r: NonNullable<typeof o.r> } => o.r !== null);
      if (options.length === 0) continue;
      const pick = options[randInt(rng, options.length)]!;
      return {
        endIndex: end,
        T: candles[end]!.closeTime + 1,
        levelType: pick.t,
        reference: pick.r.ref,
        tolerancePct: LEVEL_TOLERANCE_PCT,
        difficulty: input.difficulty,
        ...(level !== input.difficulty ? { relaxedTo: level } : {}),
      };
    }
  }
  return null;
}

const CONTEXT_TYPES: readonly PatternType[] = ['engulfing', 'pin-bar', 'morning-star', 'evening-star'];

export interface ContextTaskPick {
  endIndex: number;
  T: UtcMs;
  pattern: PatternInstance;
  reference: ContextReference;
  /** Желаемая значимость, выбранная по seed (50/50). */
  desired: boolean;
  /** true, если после MAX_ATTEMPTS желаемый ответ инвертирован (11.6). */
  inverted: boolean;
}

export function pickContextTask(input: PaPickInput & { htf: readonly Candle[] }): ContextTaskPick | null {
  const candles = closedOnly(input.candles);
  const minHistory = input.minHistory ?? DEFAULT_MIN_HISTORY;
  const attempts = input.maxAttempts ?? MAX_ATTEMPTS;
  const pool = detectPatterns(candles).filter(
    (p) => CONTEXT_TYPES.includes(p.type) && p.direction !== null && p.firstIndex >= 1 && p.lastIndex >= minHistory && usable(candles, p.lastIndex, input.tf),
  );
  if (pool.length === 0) return null;
  const rng = mulberry32(input.seed);
  const desired = rng() < 0.5;
  const cache = new Map<number, ContextReference>();
  const evalAt = (p: PatternInstance): ContextReference => {
    const key = p.lastIndex * 10 + CONTEXT_TYPES.indexOf(p.type);
    let r = cache.get(key);
    if (!r) {
      r = computeContext(candles, p, htfClosedAt(input.htf, candles[p.lastIndex]!.closeTime + 1));
      cache.set(key, r);
    }
    return r;
  };
  const make = (p: PatternInstance, want: boolean, inverted: boolean): ContextTaskPick => ({
    endIndex: p.lastIndex,
    T: candles[p.lastIndex]!.closeTime + 1,
    pattern: p,
    reference: evalAt(p),
    desired: want,
    inverted,
  });
  for (const [want, inverted] of [[desired, false], [!desired, true]] as const) {
    for (let a = 0; a < attempts; a++) {
      const p = pool[randInt(rng, pool.length)]!;
      if (evalAt(p).significant === want) return make(p, want, inverted);
    }
  }
  return null;
}

const PATTERN_SKILL: Record<PatternType, SkillId> = {
  engulfing: 'pa-engulfing',
  'pin-bar': 'pa-pin-bar',
  'inside-bar': 'pa-inside-bar',
  doji: 'pa-doji',
  'morning-star': 'pa-star',
  'evening-star': 'pa-star',
};
export const skillOfPattern = (t: PatternType): SkillId => PATTERN_SKILL[t];

/** Эталон «Найди модель» для gradeMarks: только экземпляры типа `target` в окне. */
export function buildPatternAlgoMarkSet(
  candles: readonly Candle[],
  target: PatternType,
  window: { fromIndex: number; toIndex: number },
): AlgoMarkSet {
  const closed = closedOnly(candles);
  const required = detectPatterns(closed)
    .filter((p) => p.type === target && p.lastIndex >= window.fromIndex && p.lastIndex <= window.toIndex)
    .map((p) => patternToMark(closed, p));
  return {
    required,
    tolerated: [],
    aux: { sweepsCandidates: [], obCandidates: [], pending: [], smallFvgs: [], refsAt: () => [] },
  };
}

export function patternGradeContext(
  candles: readonly Candle[],
  target: PatternType,
  window: { fromIndex: number; toIndex: number },
): GradeContext {
  return {
    candles: closedOnly(candles),
    window,
    concepts: [skillOfPattern(target)],
    toleranceCandles: 2,
    iouMin: 0.5,
    levelPricePct: 0.1,
    scoped: false,
  };
}

