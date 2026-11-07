// Сервис заданий: выбор ситуации (next) и проверка ответа (grade) поверх @tl/core. Без HTTP-деталей.
// Инвариант: payload next и эталон grade строятся из одних и тех же рядов - loadClosedBefore(T) (ADR-0005).
import {
  ALGO_VERSION,
  FIB_ALGO_VERSION,
  HTF_OF,
  MS_DEPTH,
  REASON_CODES,
  TIMEFRAME_MS,
  TIME_LIMIT_CANDLES,
  analyzeStructure,
  anchorIndex,
  buildAlgoMarkSet,
  buildExtensionRef,
  buildGridRef,
  buildReactionRef,
  buildFeedback,
  buildPatternAlgoMarkSet,
  computeChallengeFacts,
  computeContext,
  detectPatterns,
  gradeChallenge,
  fibExtensionTask,
  fibGridTask,
  fibLimit,
  fibReactionTask,
  gradeContext,
  gradeFibExtension,
  gradeFibGrid,
  gradeFibReaction,
  gradeMarks,
  gradeMsQuestion,
  htfClosedAt,
  msConceptsFor,
  msParamsFor,
  mulberry32,
  patternGradeContext,
  patternToMark,
  pickChallengeScenario,
  pickContextTask,
  pickFibTask,
  pickFindPattern,
  randInt,
  rebuildMsQuestion,
  resolveTrade,
  selectMsMarkTask,
  selectMsQuestionTask,
  sliceAt,
  FIND_WINDOW,
  type Candle,
  type ChallengeFacts,
  type Difficulty,
  type Feedback,
  type GradeError,
  type Mark,
  type MarkGrade,
  type ModuleId,
  type PatternType,
  type SkillId,
  type SkillOutcome,
  type TaskSymbol,
  type TaskTimeframe,
  type UtcMs,
  type Verdict,
} from '@tl/core';
import { z } from 'zod';
import { ArchiveError } from '@tl/market-data';
import { ApiError, validationError } from './errors';
import { SYMBOLS, type Answer, type ChallengeAnswer, type CurAnswer, type ElliottAnswerApi, type FibAnswer, type GradeRequest, type NextRequest } from './schemas';
import {
  CHALLENGE_FUTURE_MS,
  ChallengeZone,
  DAY_MS,
  cutoffOf,
  depthOf,
  floorTo,
  futureProviderFor,
  loadClosedBefore,
  loadMinutes,
  type CandleLoader,
  ARCHIVE_START,
} from './sources';
import { open, seal, taskIdFor } from './token';
import { shiftCandle, shiftMark, shiftTimes } from './shift';
import { SEGMENT_EXTRA, TICK, pickSegment, rangeOf, rngOf, sameSeries, toSeed, withPartial } from './common';
import {
  CUR_PARAM_SCHEMAS,
  buildLevels,
  buildStageSwings,
  buildTradeTask,
  gradeCurTask,
  type CurParams,
} from './curriculum';
import { buildElliott, gradeElliottTask, ElliottParamsSchema } from './elliott';

export { shiftMark };

export interface ServerDeps {
  loader: CandleLoader;
  now: () => UtcMs;
  /** Источник seed (сервер: crypto.randomUUID -> число). */
  newSeed: () => number;
  /** Диапазон архива, из которого выбираются ситуации; по умолчанию [ARCHIVE_START, cutoff]. */
  range?: { from: UtcMs; to: UtcMs };
  /** Минимальная предистория перед зоной Challenge (по умолчанию 400 суток под 1d-контекст). */
  warmupMs?: number;
  /** Шаг сетки T (по умолчанию 15m). Тесты на фикстурах без 1m задают границу ТФ, чтобы не требовать частичных свечей. */
  gridStepMs?: number;
  /** Число попыток генератора на уровень сложности (по умолчанию как в ядре). */
  maxAttempts?: number;
  secret?: string;
  aggTradesTimeoutMs?: number;
  /** Бюджет времени выбора ситуации в next, мс (по умолчанию 20 с). */
  nextBudgetMs?: number;
}

const HTF_TF = HTF_OF as Readonly<Record<TaskTimeframe, TaskTimeframe>>;
const MAX_TRIES = 12;
/** Сбои источника не тратят MAX_TRIES, но ограничены числом и общим бюджетом времени. */
const MAX_SOURCE_FAILURES = 3;
const NEXT_BUDGET_MS = 20_000;
const ZONE_MS = 15 * DAY_MS;
const BASE_MS = 15 * 60_000;

// ------------------------------------------------------------------ параметры токена

const FibParams = <K extends string>(kind: K) =>
  z.object({
    kind: z.literal(kind),
    fibAlgoVersion: z.string(),
    tf: z.string(),
    nExt: z.number().int(),
    evalDifficulty: z.enum(['easy', 'medium', 'hard']),
    a: z.object({ time: z.number() }),
    b: z.object({ time: z.number() }),
  });

const ParamsSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('ms-mark'), tf: z.string(), focus: z.array(z.string()).optional(), windowSize: z.number().int().min(1).max(500) }),
  z.object({ kind: z.literal('ms-question'), tf: z.string(), questionId: z.string(), focus: z.array(z.string()).optional() }),
  z.object({ kind: z.literal('pa-find'), tf: z.string(), target: z.string() }),
  z.object({ kind: z.literal('pa-context'), tf: z.string(), patternType: z.string(), direction: z.enum(['bull', 'bear']) }),
  z.object({ kind: z.literal('challenge'), defaultTf: z.string(), entry: z.number() }),
  FibParams('fib-grid').extend({ window: z.object({ fromTime: z.number(), toTime: z.number() }) }),
  FibParams('fib-reaction').extend({ options: z.array(z.string()), pdAsked: z.boolean() }),
  FibParams('fib-extension').extend({
    cTime: z.number(),
    window: z.object({ fromTime: z.number(), toTime: z.number() }),
    targetOptions: z.array(z.string()),
    directionHint: z.enum(['bull', 'bear']).nullable(),
  }),
  ElliottParamsSchema,
  ...CUR_PARAM_SCHEMAS,
]);
type Params = z.infer<typeof ParamsSchema>;

// ------------------------------------------------------------------ вспомогательное

export interface TaskEnvelope {
  taskId: string;
  taskToken: string;
  module: ModuleId;
  difficulty: Difficulty;
  symbol: TaskSymbol;
  algoVersion: string;
  expiresAt: UtcMs;
  timeline: { mode: 'relative' | 'absolute' };
  decisionTime: UtcMs;
  series: Partial<Record<TaskTimeframe, Candle[]>>;
  payload: Record<string, unknown>;
}

export interface Draft {
  T: UtcMs;
  seed: number;
  shiftMs: number;
  tf: TaskTimeframe;
  params: Params;
  series: Partial<Record<TaskTimeframe, Candle[]>>;
  payload: Record<string, unknown>;
  /** Шкала времени задания скрыта (будущее проигрывается): timeline.mode = relative. */
  relative?: boolean;
}

function symbolFor(req: { symbol?: TaskSymbol }, baseSeed: number): TaskSymbol {
  return req.symbol ?? SYMBOLS[randInt(rngOf(baseSeed, 0x51b0), SYMBOLS.length)]!;
}

export { withPartial } from './common';

// ------------------------------------------------------------------ next

export async function nextTask(module: ModuleId, req: NextRequest, deps: ServerDeps): Promise<TaskEnvelope> {
  const now = deps.now();
  const baseSeed = toSeed(deps.newSeed());
  const symbol = symbolFor(req, baseSeed);
  const excluded = new Set(req.exclude ?? []);
  const idOf = (T: UtcMs) => taskIdFor(module, symbol, T, deps.secret);

  const started = Date.now();
  const budget = deps.nextBudgetMs ?? NEXT_BUDGET_MS;
  let sourceFailure: ArchiveError | undefined;
  let failures = 0;
  for (let attempt = 0, n = 0; attempt < MAX_TRIES; n++) {
    if (n > 0 && Date.now() - started > budget) break;
    const seed = toSeed(baseSeed + n * 0x9e3779b1);
    let draft: Draft | null;
    try {
      if (req.module === 'market-structure') draft = await buildMs(req, symbol, seed, deps, (T) => excluded.has(idOf(T)));
      else if (req.module === 'price-action') draft = await buildPa(req, symbol, seed, deps);
      else if (req.module === 'fibonacci') draft = await buildFib(req, symbol, seed, deps, (T) => excluded.has(idOf(T)), attempt);
      else if (req.module === 'elliott') draft = await buildElliott(req, symbol, seed, deps, rangeOf(deps), (T) => excluded.has(idOf(T)), attempt, started + budget);
      else if (req.module === 'stage-swings') draft = await buildStageSwings(req, symbol, seed, deps, (T) => excluded.has(idOf(T)));
      else if (req.module === 'levels') draft = await buildLevels(req, symbol, seed, deps, (T) => excluded.has(idOf(T)));
      else if (
        req.module === 'limit-entry' || req.module === 'stop-take' || req.module === 'combo-level-trade' || req.module === 'combo-smc-entry'
      ) draft = await buildTradeTask(req, symbol, seed, deps, (T) => excluded.has(idOf(T)));
      else draft = await buildChallenge(req, symbol, seed, deps);
    } catch (e) {
      // not_found файла - период непригоден (обычная отбраковка); недоступность источника - не «ситуация не подошла».
      if (e instanceof ArchiveError && e.code !== 'not_found') {
        sourceFailure = e;
        if (++failures >= MAX_SOURCE_FAILURES) break;
        continue;
      }
      if (e instanceof ArchiveError) {
        attempt++;
        continue;
      }
      throw e;
    }
    attempt++;
    if (!draft || excluded.has(idOf(draft.T))) continue;

    const { token, header } = seal({
      header: { module, symbol, difficulty: req.difficulty },
      sealed: { T: draft.T, seed: draft.seed, shiftMs: draft.shiftMs, tf: draft.tf, params: draft.params },
      now,
      secret: deps.secret,
    });
    return {
      taskId: idOf(draft.T),
      taskToken: token,
      module,
      difficulty: req.difficulty,
      symbol,
      algoVersion: ALGO_VERSION,
      expiresAt: header.exp,
      timeline: { mode: module === 'challenge' || draft.relative ? 'relative' : 'absolute' },
      decisionTime: draft.T - draft.shiftMs,
      series: draft.series,
      payload: draft.payload,
    };
  }
  if (sourceFailure) throw new ApiError(502, 'archive_unavailable', `Archive error: ${sourceFailure.code}`);
  throw new ApiError(404, 'not_found', 'No suitable task situation found for the request');
}

type MsReq = Extract<NextRequest, { module: 'market-structure' }>;

async function buildMs(req: MsReq, symbol: TaskSymbol, seed: number, deps: ServerDeps, isExcludedId: (T: UtcMs) => boolean): Promise<Draft | null> {
  const { tf, difficulty } = req;
  const depth = MS_DEPTH[tf];
  const seg = pickSegment(deps, seed, tf, depth + SEGMENT_EXTRA, depth + 50);
  if (!seg) return null;
  const candles = await deps.loader.candles(symbol, tf, seg.from, seg.to);
  const fullFrom = seg.from + depth * TIMEFRAME_MS[tf];
  const common = {
    candles,
    tf,
    difficulty,
    seed,
    ...(req.focus ? { focus: req.focus as SkillId[] } : {}),
    isExcluded: (T: UtcMs) => T < fullFrom || (deps.gridStepMs !== undefined && T % deps.gridStepMs !== 0) || isExcludedId(T),
    maxT: seg.to,
    ...(deps.maxAttempts ? { maxAttempts: deps.maxAttempts } : {}),
  };

  if (req.mode === 'mark') {
    const sel = selectMsMarkTask(common);
    if (!sel) return null;
    const visible = await loadClosedBefore(deps.loader, symbol, tf, sel.T);
    if (!sameSeries(visible, sel.visible)) return null;
    const shown = await withPartial(deps, symbol, tf, visible, sel.T);
    if (!shown) return null;
    return {
      T: sel.T,
      seed,
      shiftMs: 0,
      tf,
      params: { kind: 'ms-mark', tf, focus: sel.focus, windowSize: sel.windowSize },
      series: { [tf]: shown },
      payload: {
        kind: 'ms-mark',
        tf,
        concepts: sel.concepts,
        /** Что именно отметить сверх базы (hard); [] для easy/medium. */
        focus: sel.focus,
        tools: sel.tools,
        windowCandles: sel.windowSize,
        requiredCount: sel.requiredCount,
        scoped: sel.scoped,
        referenceKey: `ms.reference.${difficulty}`,
        window: { fromTime: visible[sel.window.fromIndex]!.openTime, toTime: visible[sel.window.toIndex]!.openTime },
      },
    };
  }

  const sel = selectMsQuestionTask(common);
  if (!sel) return null;
  const visible = await loadClosedBefore(deps.loader, symbol, tf, sel.T);
  if (!sameSeries(visible, sel.visible)) return null;
  const shown = await withPartial(deps, symbol, tf, visible, sel.T);
  if (!shown) return null;
  const q = sel.question;
  return {
    T: sel.T,
    seed,
    shiftMs: 0,
    tf,
    params: { kind: 'ms-question', tf, questionId: q.questionId, ...(req.focus ? { focus: req.focus } : {}) },
    series: { [tf]: shown },
    payload: {
      kind: 'ms-question',
      tf,
      questionId: q.questionId,
      promptKey: q.promptKey,
      promptParams: q.promptParams,
      options: q.options,
      ...(q.highlight ? { highlight: q.highlight } : {}),
    },
  };
}

const TARGETS_BY_SKILL: Partial<Record<SkillId, PatternType[]>> = {
  'pa-engulfing': ['engulfing'],
  'pa-pin-bar': ['pin-bar'],
  'pa-inside-bar': ['inside-bar'],
  'pa-doji': ['doji'],
  'pa-star': ['morning-star', 'evening-star'],
};

type PaReq = Extract<NextRequest, { module: 'price-action' }>;

async function buildPa(req: PaReq, symbol: TaskSymbol, seed: number, deps: ServerDeps): Promise<Draft | null> {
  const { tf, difficulty } = req;
  const depth = depthOf(tf);
  const seg = pickSegment(deps, seed, tf, depth + SEGMENT_EXTRA, depth + 50);
  if (!seg) return null;
  const htfTf = HTF_TF[tf];
  const [candles, htf] = await Promise.all([
    deps.loader.candles(symbol, tf, seg.from, seg.to),
    req.taskType === 'context'
      ? deps.loader.candles(symbol, htfTf, seg.from - depthOf(htfTf) * TIMEFRAME_MS[htfTf], seg.to)
      : Promise.resolve([] as Candle[]),
  ]);
  const base = { candles, tf, difficulty, seed, minHistory: depth, ...(deps.maxAttempts ? { maxAttempts: deps.maxAttempts } : {}) };

  if (req.taskType === 'find-pattern') {
    const targets = (req.focus ?? []).flatMap((s) => TARGETS_BY_SKILL[s as SkillId] ?? []);
    const pick = pickFindPattern({ ...base, ...(targets.length ? { targets } : {}) });
    if (!pick) return null;
    const visible = await loadClosedBefore(deps.loader, symbol, tf, pick.T);
    if (visible.length !== depth) return null;
    const window = { fromIndex: visible.length - FIND_WINDOW, toIndex: visible.length - 1 };
    if (buildPatternAlgoMarkSet(visible, pick.target, window).required.length === 0) return null; // эталон при grade пуст
    return {
      T: pick.T,
      seed,
      shiftMs: 0,
      tf,
      params: { kind: 'pa-find', tf, target: pick.target },
      series: { [tf]: visible },
      payload: {
        kind: 'pa-find',
        tf,
        target: pick.target,
        window: { fromTime: visible[window.fromIndex]!.openTime, toTime: visible[window.toIndex]!.openTime },
      },
    };
  }

  const pick = pickContextTask({ ...base, htf });
  if (!pick) return null;
  const visible = await loadClosedBefore(deps.loader, symbol, tf, pick.T);
  if (visible.length !== depth) return null;
  const htfVisible = htfTf === tf ? visible : await loadClosedBefore(deps.loader, symbol, htfTf, pick.T);
  const rec = reconstructContext(visible, htfVisible, pick.T, pick.pattern.type, pick.pattern.direction as 'bull' | 'bear');
  if (!rec) return null;
  return {
    T: pick.T,
    seed,
    shiftMs: 0,
    tf,
    params: { kind: 'pa-context', tf, patternType: rec.pattern.type, direction: rec.pattern.direction as 'bull' | 'bear' },
    series: htfTf === tf ? { [tf]: visible } : { [tf]: visible, [htfTf]: htfVisible },
    payload: {
      kind: 'pa-context',
      tf,
      pattern: patternToMark(visible, rec.pattern),
      factorOptions: ['sweep', 'order-block', 'key-level', 'htf-trend'],
    },
  };
}

function reconstructContext(visible: Candle[], htfVisible: Candle[], T: UtcMs, type: string, direction: 'bull' | 'bear') {
  const last = visible.length - 1;
  const pattern = detectPatterns(visible).find((p) => p.type === type && p.direction === direction && p.lastIndex === last && p.firstIndex >= 1);
  if (!pattern) return null;
  try {
    return { pattern, ref: computeContext(visible, pattern, htfClosedAt(htfVisible, T)) };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ Challenge next

type ChReq = Extract<NextRequest, { module: 'challenge' }>;

async function buildChallenge(req: ChReq, symbol: TaskSymbol, seed: number, deps: ServerDeps): Promise<Draft | null> {
  const r = rangeOf(deps);
  const earliest = Math.ceil((r.from + (deps.warmupMs ?? 400 * DAY_MS)) / BASE_MS) * BASE_MS;
  const latest = Math.floor((r.to - CHALLENGE_FUTURE_MS) / BASE_MS) * BASE_MS;
  const span = latest - earliest;
  if (span < DAY_MS) return null;
  const zoneLen = Math.min(ZONE_MS, Math.floor(span / DAY_MS) * DAY_MS);
  const zoneFrom = earliest + randInt(rngOf(seed, 0x20e), Math.floor((span - zoneLen) / BASE_MS) + 1) * BASE_MS;
  let zone = await ChallengeZone.load(deps.loader, symbol, zoneFrom, zoneFrom + zoneLen, cutoffOf(deps.now()));
  if (deps.gridStepMs && deps.gridStepMs !== BASE_MS) zone = zone.withStep(deps.gridStepMs);

  const wait = (req.focus ?? []).includes('challenge-wait');
  const pick = pickChallengeScenario({
    source: zone.asSource(),
    difficulty: req.difficulty,
    seed,
    ...(wait ? { waitShare: 0.6 } : {}),
    ...(deps.maxAttempts ? { maxAttempts: deps.maxAttempts } : {}),
  });
  if (!pick || !Number.isFinite(pick.entry)) return null;
  const T = pick.T;

  const dayStart = floorTo(T, DAY_MS);
  const minutes = dayStart === T ? [] : await loadMinutes(deps.loader, symbol, dayStart, T);
  if (!minutes) return null;

  const source = zone.asSource();
  const tfs: TaskTimeframe[] = ['15m', '1h', '4h', '1d'];
  const closed = Object.fromEntries(tfs.map((tf) => [tf, source.closedAt(tf, T) as Candle[]])) as Record<TaskTimeframe, Candle[]>;
  const sliced = sliceAt({ ...closed, '1m': minutes }, T);

  // Скрытый якорь: сдвиг на целое число суток (сетка 4h/1d сохраняется), реальная дата не раскрывается.
  const offDays = 1000 + randInt(rngOf(seed, 0xa5a5), 3000);
  const shiftMs = (Math.floor(T / DAY_MS) - offDays) * DAY_MS;
  const series = Object.fromEntries(tfs.map((tf) => [tf, (sliced[tf] ?? []).map((c) => shiftCandle(c, shiftMs))])) as Record<TaskTimeframe, Candle[]>;
  const hints = pick.hints?.map((m, i) => shiftMark(m, shiftMs, `hint:${i}`));

  return {
    T,
    seed,
    shiftMs,
    tf: pick.defaultTf,
    params: { kind: 'challenge', defaultTf: pick.defaultTf, entry: pick.entry },
    series,
    payload: {
      kind: 'challenge',
      defaultTf: pick.defaultTf,
      entryPrice: pick.entry,
      reasonOptions: [...REASON_CODES],
      timeLimitCandles: { ...TIME_LIMIT_CANDLES },
      ...(hints ? { hints } : {}),
    },
  };
}


// ------------------------------------------------------------------ Fibonacci next

type FibReq = Extract<NextRequest, { module: 'fibonacci' }>;
/** Запас истории сверх видимого окна и будущего: чем длиннее ряд, тем больше кандидатов для балансировки ответа. */
const FIB_EXTRA: Record<TaskTimeframe, number> = { '15m': 2500, '1h': 2500, '4h': 1500, '1d': 500 };
/** После стольких неудачных сегментов разрешается ослабление критерия сложности (FIBONACCI.md §4). */
const FIB_RELAX_AFTER = 3;

async function buildFib(
  req: FibReq,
  symbol: TaskSymbol,
  seed: number,
  deps: ServerDeps,
  isExcludedId: (T: UtcMs) => boolean,
  attempt: number,
): Promise<Draft | null> {
  const { tf, difficulty, taskType } = req;
  const depth = depthOf(tf);
  const limit = fibLimit(tf);
  const step = TIMEFRAME_MS[tf];
  const seg = pickSegment(deps, seed, tf, depth + FIB_EXTRA[tf] + limit, depth + 300 + limit);
  if (!seg) return null;
  const candles = await deps.loader.candles(symbol, tf, seg.from, seg.to);
  const pick = pickFibTask({
    candles,
    tf,
    difficulty,
    seed,
    taskType,
    allowRelax: attempt >= FIB_RELAX_AFTER,
    isExcluded: isExcludedId,
    ...(deps.maxAttempts ? { maxAttempts: deps.maxAttempts } : {}),
  });
  if (!pick) return null;

  // тот же ряд, что увидит grade
  const visible = await loadClosedBefore(deps.loader, symbol, tf, pick.T);
  const local = candles.slice(pick.visibleFrom, pick.endIndex + 1);
  if (!sameSeries(visible, local) || visible.length !== depth) return null;
  const common = { kind: undefined as never, fibAlgoVersion: FIB_ALGO_VERSION, tf, nExt: pick.nExt, evalDifficulty: pick.evalDifficulty, a: { time: pick.aTime }, b: { time: pick.bTime } };

  if (pick.taskType === 'grid') {
    if (!buildGridRef(visible, { nExt: pick.nExt, aTime: pick.aTime, bTime: pick.bTime })) return null;
    const task = fibGridTask(pick, tf);
    return {
      T: pick.T, seed, shiftMs: 0, tf,
      params: { ...common, kind: 'fib-grid', window: pick.window! },
      series: { [tf]: visible },
      payload: { ...task },
    };
  }

  const cutoff = cutoffOf(deps.now());
  const future = (await deps.loader.candles(symbol, tf, pick.T, Math.min(pick.T + limit * step, cutoff))).filter((c) => c.closed && c.openTime >= pick.T);
  if (future.length !== limit || future.some((c, i) => c.openTime !== pick.T + i * step)) return null;
  const offDays = 1000 + randInt(rngOf(seed, 0xf1b0), 3000);
  const shiftMs = (Math.floor(pick.T / DAY_MS) - offDays) * DAY_MS;
  const shiftedSeries = { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) };
  const win = (w: { fromTime: UtcMs; toTime: UtcMs }) => ({ fromTime: w.fromTime - shiftMs, toTime: w.toTime - shiftMs });
  const refParams = { nExt: pick.nExt, tf, evalDifficulty: pick.evalDifficulty, aTime: pick.aTime, bTime: pick.bTime };

  if (pick.taskType === 'reaction') {
    const ref = buildReactionRef(visible, future, refParams);
    if (!ref) return null;
    const task = fibReactionTask(ref, tf, difficulty === 'easy', visible);
    const payload = {
      ...task,
      grid: shiftMark(task.grid, shiftMs, 'fib:grid'),
      ...(task.hints ? { hints: task.hints.map((m, i) => shiftMark(m, shiftMs, `hint:${i}`)) } : {}),
    };
    return {
      T: pick.T, seed, shiftMs, tf, relative: true,
      params: { ...common, kind: 'fib-reaction', options: ref.options, pdAsked: ref.pd.asked },
      series: shiftedSeries,
      payload,
    };
  }

  const ref = buildExtensionRef(visible, future, refParams);
  if (!ref || ref.c.time !== pick.cTime) return null;
  const task = fibExtensionTask(ref, tf, win(pick.window!), pick.directionHint);
  return {
    T: pick.T, seed, shiftMs, tf, relative: true,
    params: { ...common, kind: 'fib-extension', cTime: pick.cTime!, window: pick.window!, targetOptions: ref.targetOptions, directionHint: pick.directionHint },
    series: shiftedSeries,
    payload: { ...task },
  };
}

// ------------------------------------------------------------------ grade

/** Проигрывание после решения (challenge и fibonacci): свечи шкалы задания, индекс события в них. */
export interface TaskReplay {
  tf: TaskTimeframe;
  candles: Candle[];
  exitIndex: number | null;
  /** Индекс свечи исполнения лимитки в `candles` (ступень 3, комбо); null - не исполнилась. */
  fillIndex?: number | null;
}

export interface GradeResultApi {
  taskId: string;
  module: ModuleId;
  algoVersion: string;
  verdict: Verdict;
  score: number;
  task: {
    module: ModuleId;
    difficulty: Difficulty;
    symbol: TaskSymbol;
    tf: TaskTimeframe | null;
    reveal: { decisionTime: UtcMs; shiftMs: number };
    taskKind: string;
  };
  skillOutcomes: SkillOutcome[];
  errors: GradeError[];
  reference: Mark[];
  detail: Record<string, unknown>;
  feedback: Feedback;
  replay?: TaskReplay;
  /** Расширение контракта: как определён исход и где сработал (шкала задания). Только challenge. */
  resolution?: { method: string; triggerTime: UtcMs; triggerTf: string };
}

export interface Core {
  verdict: Verdict;
  score: number;
  skillOutcomes: SkillOutcome[];
  errors: GradeError[];
  reference: Mark[];
  detail: Record<string, unknown>;
  ok?: { code: never; params?: Record<string, string | number>; markIds?: string[] }[];
  toleranceCandles?: number;
  /** Параметры вердикта (Elliott: outcomeText, outcomeTime). */
  verdictParams?: Record<string, string | number>;
  replay?: TaskReplay;
  resolution?: GradeResultApi['resolution'];
}

const mismatch = (path: string, message: string) => validationError('INVALID_TYPE', path, message);

export async function gradeTask(module: ModuleId, req: GradeRequest, deps: ServerDeps): Promise<GradeResultApi> {
  const { header, sealed } = open(req.taskToken, deps.now(), deps.secret);
  if (header.module !== module) throw mismatch('taskToken', 'Token belongs to another module');
  const parsed = ParamsSchema.safeParse(sealed.params);
  if (!parsed.success) throw new ApiError(401, 'invalid_token_signature', 'Invalid task token');
  const params = parsed.data;
  const answer = req.answer;
  if (answer.kind !== params.kind) throw mismatch('answer.kind', 'Answer kind does not match the task');

  const symbol = header.symbol;
  const T = sealed.T;
  const ctx = { deps, symbol, T, difficulty: header.difficulty, seed: sealed.seed };
  let core: Core;
  let tf: TaskTimeframe | null;
  switch (params.kind) {
    case 'ms-mark':
      tf = params.tf as TaskTimeframe;
      core = await gradeMsMark(ctx, params, answer as Extract<Answer, { kind: 'ms-mark' }>);
      break;
    case 'ms-question':
      tf = params.tf as TaskTimeframe;
      core = await gradeMsQuestionTask(ctx, params, answer as Extract<Answer, { kind: 'ms-question' }>);
      break;
    case 'pa-find':
      tf = params.tf as TaskTimeframe;
      core = await gradePaFind(ctx, params, answer as Extract<Answer, { kind: 'pa-find' }>);
      break;
    case 'pa-context':
      tf = params.tf as TaskTimeframe;
      core = await gradePaContext(ctx, params, answer as Extract<Answer, { kind: 'pa-context' }>);
      break;
    case 'challenge':
      tf = params.defaultTf as TaskTimeframe;
      core = await gradeChallengeTask(ctx, params, answer as ChallengeAnswer, sealed.shiftMs);
      break;
    case 'fib-grid':
    case 'fib-reaction':
    case 'fib-extension':
      tf = params.tf as TaskTimeframe;
      core = await gradeFibTask(ctx, params, answer as FibAnswer, sealed.shiftMs);
      break;
    case 'ew-impulse':
    case 'ew-impulse-correction':
    case 'ew-scenario':
      tf = params.tf as TaskTimeframe;
      core = await gradeElliottTask(ctx, params, answer as ElliottAnswerApi, sealed.shiftMs, TICK[symbol]);
      break;
    case 'sw-mark':
    case 'sw-trend':
    case 'lv-strongest':
    case 'lv-zone':
    case 'lv-reaction':
    case 'limit-entry':
    case 'stop-take':
    case 'combo-level-trade':
    case 'combo-smc-entry':
      tf = params.tf as TaskTimeframe;
      core = await gradeCurTask(ctx, params as CurParams, answer as CurAnswer, sealed.shiftMs);
      break;
  }

  const feedback = buildFeedback({
    module,
    taskKind: params.kind,
    verdict: core.verdict,
    score: core.score,
    errors: core.errors,
    skillOutcomes: core.skillOutcomes,
    ...(core.ok ? { ok: core.ok } : {}),
    ...(core.toleranceCandles !== undefined ? { toleranceCandles: core.toleranceCandles } : {}),
    ...(core.verdictParams ? { verdictParams: core.verdictParams } : {}),
    tickSize: TICK[symbol],
  });
  return {
    taskId: taskIdFor(module, symbol, T, deps.secret),
    module,
    algoVersion: header.algoVersion,
    verdict: core.verdict,
    score: core.score,
    task: {
      module,
      difficulty: header.difficulty,
      symbol,
      tf,
      reveal: { decisionTime: T, shiftMs: sealed.shiftMs },
      taskKind: params.kind,
    },
    skillOutcomes: core.skillOutcomes,
    errors: core.errors,
    reference: core.reference,
    detail: core.detail,
    feedback,
    ...(core.replay ? { replay: core.replay } : {}),
    ...(core.resolution ? { resolution: core.resolution } : {}),
  };
}

export interface GradeCtx {
  deps: ServerDeps;
  symbol: TaskSymbol;
  T: UtcMs;
  difficulty: Difficulty;
  /** seed задания из токена (questionId sw-trend). */
  seed: number;
}

async function visibleFor(c: GradeCtx, tf: TaskTimeframe): Promise<Candle[]> {
  const visible = await loadClosedBefore(c.deps.loader, c.symbol, tf, c.T);
  if (visible.length < 50) throw new ApiError(404, 'not_found', 'No archive data for the task period');
  return visible;
}

const markGradeOf = (g: MarkGrade): MarkGrade => ({
  matched: g.matched,
  missed: g.missed,
  extra: g.extra,
  ignored: g.ignored,
  toleranceCandles: g.toleranceCandles,
});

async function gradeMsMark(c: GradeCtx, p: Extract<Params, { kind: 'ms-mark' }>, a: Extract<Answer, { kind: 'ms-mark' }>): Promise<Core> {
  const tf = p.tf as TaskTimeframe;
  const visible = await visibleFor(c, tf);
  const n = visible.length;
  const window = { fromIndex: Math.max(0, n - p.windowSize), toIndex: n - 1 };
  const concepts = msConceptsFor(c.difficulty, p.focus as SkillId[] | undefined);
  const r = analyzeStructure(visible, msParamsFor(c.difficulty), { tf });
  const algo = buildAlgoMarkSet(r, { concepts, window });
  const g = gradeMarks(a.marks, algo, {
    candles: visible,
    window,
    concepts,
    toleranceCandles: 2,
    iouMin: 0.5,
    levelPricePct: 0.1,
    scoped: concepts.includes('internal-external'),
    tickSize: TICK[c.symbol],
  });
  return {
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors,
    reference: algo.required,
    detail: { kind: 'ms-mark', marks: markGradeOf(g) },
    toleranceCandles: g.toleranceCandles,
  };
}

async function gradeMsQuestionTask(c: GradeCtx, p: Extract<Params, { kind: 'ms-question' }>, a: Extract<Answer, { kind: 'ms-question' }>): Promise<Core> {
  const tf = p.tf as TaskTimeframe;
  if (a.questionId !== p.questionId) throw mismatch('answer.questionId', 'Question does not match the task');
  const visible = await visibleFor(c, tf);
  const q = rebuildMsQuestion(visible, c.difficulty, tf, p.questionId);
  if (!q) throw new ApiError(404, 'not_found', 'Question cannot be reconstructed');
  if (!q.options.some((o) => o.id === a.optionId)) throw mismatch('answer.optionId', 'Unknown option');
  const g = gradeMsQuestion(q, a.optionId);
  return { verdict: g.verdict, score: g.score, skillOutcomes: g.skillOutcomes, errors: g.errors, reference: [], detail: g.detail };
}

async function gradePaFind(c: GradeCtx, p: Extract<Params, { kind: 'pa-find' }>, a: Extract<Answer, { kind: 'pa-find' }>): Promise<Core> {
  const tf = p.tf as TaskTimeframe;
  const target = p.target as PatternType;
  const visible = await visibleFor(c, tf);
  const window = { fromIndex: visible.length - FIND_WINDOW, toIndex: visible.length - 1 };
  const algo = buildPatternAlgoMarkSet(visible, target, window);
  const g = gradeMarks(a.marks, algo, { ...patternGradeContext(visible, target, window), tickSize: TICK[c.symbol] });
  return {
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors,
    reference: algo.required,
    detail: { kind: 'pa-find', marks: markGradeOf(g) },
    toleranceCandles: g.toleranceCandles,
  };
}

async function gradePaContext(c: GradeCtx, p: Extract<Params, { kind: 'pa-context' }>, a: Extract<Answer, { kind: 'pa-context' }>): Promise<Core> {
  const tf = p.tf as TaskTimeframe;
  const htfTf = HTF_TF[tf];
  const visible = await visibleFor(c, tf);
  const htfVisible = htfTf === tf ? visible : await loadClosedBefore(c.deps.loader, c.symbol, htfTf, c.T);
  const rec = reconstructContext(visible, htfVisible, c.T, p.patternType, p.direction);
  if (!rec) throw new ApiError(404, 'not_found', 'Pattern cannot be reconstructed');
  const g = gradeContext(rec.ref, { ...a.factors, significant: a.significant }, htfTf);
  return {
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors,
    reference: [patternToMark(visible, rec.pattern)],
    detail: g.detail,
    ok: g.ok as Core['ok'],
  };
}


// ---- Fibonacci grade

type FibParamsT = Extract<Params, { kind: 'fib-grid' | 'fib-reaction' | 'fib-extension' }>;

async function gradeFibTask(c: GradeCtx, p: FibParamsT, a: FibAnswer, shift: number): Promise<Core> {
  if (p.fibAlgoVersion !== FIB_ALGO_VERSION) throw new ApiError(401, 'token_expired', 'Task token was issued for another Fibonacci algorithm version');
  const tf = p.tf as TaskTimeframe;
  const visible = await visibleFor(c, tf);
  const input = { candles: visible, tf };
  const key = { nExt: p.nExt, aTime: p.a.time, bTime: p.b.time };
  const mismatch500 = () => new Error('FIB_REFERENCE_MISMATCH'); // сервер не смог воспроизвести эталон: 500 + лог, не оценка

  // якоря пользователя -> реальное время; вне видимого ряда -> 400
  const unshift = (m: Mark): Mark => {
    const anchors = m.anchors.map((x) => ({ ...x, time: x.time + shift }));
    for (const x of anchors) if (anchorIndex(input, x.time) < 0) throw validationError('FIB_ANCHOR_OUT_OF_RANGE', 'answer.mark.anchors');
    return { ...m, anchors };
  };
  const wrap = (g: ReturnType<typeof gradeFibGrid>, extra: Pick<Core, 'replay'> = {}): Core => ({
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors.map((e) => (e.params ? { ...e, params: shiftTimes(e.params, shift) } : e)),
    reference: g.reference.map((m, i) => shiftMark(m, shift, shift === 0 ? m.id : `ref:${i}`)),
    detail: { kind: p.kind, fib: shiftTimes(g.detail, shift) },
    ok: g.ok.map((o) => (o.params ? { ...o, params: shiftTimes(o.params, shift) } : o)) as unknown as Core['ok'],
    toleranceCandles: g.toleranceCandles,
    ...extra,
  });
  const replayOf = (g: ReturnType<typeof gradeFibGrid>): Pick<Core, 'replay'> =>
    g.replay ? { replay: { tf, candles: g.replay.candles.map((x) => shiftCandle(x, shift)), exitIndex: g.replay.exitIndex } } : {};

  if (p.kind === 'fib-grid') {
    const ref = buildGridRef(visible, key);
    if (!ref) throw mismatch500();
    const ans = a as Extract<FibAnswer, { kind: 'fib-grid' }>;
    return wrap(gradeFibGrid(ref, input, { kind: 'fib-grid', mark: unshift(ans.mark as Mark) }));
  }

  const limit = fibLimit(tf);
  const step = TIMEFRAME_MS[tf];
  const cutoff = cutoffOf(c.deps.now());
  const future = (await c.deps.loader.candles(c.symbol, tf, c.T, Math.min(c.T + limit * step, cutoff))).filter((x) => x.closed && x.openTime >= c.T);
  if (future.length !== limit) throw new ApiError(404, 'not_found', 'No archive data after the decision time');
  const refParams = { ...key, tf, evalDifficulty: p.evalDifficulty };

  if (p.kind === 'fib-reaction') {
    const ref = buildReactionRef(visible, future, refParams);
    if (!ref || ref.options.join() !== p.options.join() || ref.pd.asked !== p.pdAsked) throw mismatch500();
    const ans = a as Extract<FibAnswer, { kind: 'fib-reaction' }>;
    if (!ref.options.includes(ans.option)) throw validationError('FIB_OPTION_UNAVAILABLE', 'answer.option');
    if (ref.pd.asked !== (ans.pd !== null)) throw validationError('FIB_PD_MISMATCH', 'answer.pd');
    const g = gradeFibReaction(ref, input, { kind: 'fib-reaction', option: ans.option, confluence: ans.confluence, pd: ans.pd });
    return wrap(g, replayOf(g));
  }

  const ref = buildExtensionRef(visible, future, refParams);
  if (!ref || ref.c.time !== p.cTime || ref.targetOptions.join() !== p.targetOptions.join()) throw mismatch500();
  const ans = a as Extract<FibAnswer, { kind: 'fib-extension' }>;
  if (!ref.targetOptions.includes(ans.target)) throw validationError('FIB_OPTION_UNAVAILABLE', 'answer.target');
  const g = gradeFibExtension(ref, input, { kind: 'fib-extension', mark: unshift(ans.mark as Mark), target: ans.target });
  return wrap(g, replayOf(g));
}

// ---- Challenge grade

async function gradeChallengeTask(
  c: GradeCtx,
  p: Extract<Params, { kind: 'challenge' }>,
  a: ChallengeAnswer,
  shift: number,
): Promise<Core> {
  const { deps, symbol, T } = c;
  const defaultTf = p.defaultTf as TaskTimeframe;
  const htfTf = HTF_TF[defaultTf];
  const entry = p.entry;

  if (a.side !== 'WAIT') {
    if (Math.abs((a.entry as number) - entry) > TICK[symbol]) throw validationError('ENTRY_MISMATCH', 'answer.entry');
    const long = a.side === 'LONG';
    if (long ? (a.sl as number) >= entry : (a.sl as number) <= entry) throw validationError('SL_WRONG_SIDE', 'answer.sl');
    if (long ? (a.tp as number) <= entry : (a.tp as number) >= entry) throw validationError('TP_WRONG_SIDE', 'answer.tp');
  }

  const [work, htf] = await Promise.all([
    loadClosedBefore(deps.loader, symbol, defaultTf, T),
    loadClosedBefore(deps.loader, symbol, htfTf, T),
  ]);
  if (work.length < 50) throw new ApiError(404, 'not_found', 'No archive data for the task period');
  const facts: ChallengeFacts = computeChallengeFacts({ candles: work, tf: defaultTf, htf, entry });

  const provider = futureProviderFor(deps.loader, symbol, cutoffOf(deps.now()), { aggTradesTimeoutMs: deps.aggTradesTimeoutMs });
  const replayTf = a.side === 'WAIT' ? defaultTf : a.tf;
  const limit = TIME_LIMIT_CANDLES[replayTf];

  let outcome = null;
  if (a.side !== 'WAIT') {
    try {
      outcome = await resolveTrade(
        { side: a.side, entry, sl: a.sl as number, tp: a.tp as number, T, tf: a.tf, limitCandles: limit },
        provider,
      );
    } catch (e) {
      if (e instanceof Error && e.message === 'NO_FUTURE_CANDLES') throw new ApiError(404, 'not_found', 'No archive data after the decision time');
      if (e instanceof Error && e.message === 'INVALID_POSITION') throw validationError('INVALID_TYPE', 'answer');
      throw e;
    }
  }

  const g = gradeChallenge(
    { side: a.side, tf: a.tf, entry, sl: a.sl, tp: a.tp, reasons: a.reasons as never },
    facts,
    outcome,
  );

  const future = (await provider.candles(replayTf, T, limit)).filter((x) => x.closed);
  let exitIndex: number | null = null;
  let shown = future;
  if (outcome) {
    const i = future.findIndex((x) => outcome!.exitTime >= x.openTime && outcome!.exitTime <= x.closeTime);
    if (i >= 0) {
      exitIndex = i;
      shown = future.slice(0, i + 1);
    }
  }
  const detail = g.detail.outcome
    ? { ...g.detail, outcome: { ...g.detail.outcome, exitTime: g.detail.outcome.exitTime - shift } }
    : g.detail;

  const T2 = T - shift;
  const reference: Mark[] = facts.ref
    ? [
        {
          id: 'algo:position:reference',
          kind: 'position',
          anchors: [
            { time: T2, price: entry },
            { time: T2, price: facts.ref.sl },
            { time: T2, price: facts.ref.tp },
          ],
          scope: null,
          direction: facts.refSide === 'LONG' ? 'bull' : 'bear',
          meta: { side: facts.refSide, sl: facts.ref.sl, tp: facts.ref.tp, rr: facts.ref.rr },
          author: 'algo',
        },
      ]
    : [];

  return {
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors,
    reference,
    detail: { kind: 'challenge', challenge: detail },
    ok: g.ok as Core['ok'],
    replay: { tf: replayTf, candles: shown.map((x) => shiftCandle(x, shift)), exitIndex },
    ...(outcome ? { resolution: { method: outcome.method, triggerTime: outcome.triggerTime - shift, triggerTf: outcome.triggerTf } } : {}),
  };
}
