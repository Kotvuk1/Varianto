// Курс по ступеням на сервере (CURRICULUM_STAGES.md §11): next и grade для stage-swings, levels, limit-entry, stop-take,
// combo-level-trade, combo-smc-entry. Инвариант ADR-0005: payload next и эталон grade строятся одними функциями ядра по
// одним и тем же закрытым свечам; будущее и реальные даты до grade не отдаются (задания с проигрыванием - relative-шкала).
import {
  CUR_ALGO_VERSION,
  CUR_TFS,
  CurValidationError,
  HTF_OF,
  MS_DEPTH,
  SW_MARK_TFS,
  SW_TREND_OPTIONS,
  SW_TREND_TFS,
  SW_TREND_WINDOW,
  TIMEFRAME_MS,
  TIME_LIMIT_CANDLES,
  CUR_OUTCOME_TEXT_RU,
  analyzeStructure,
  atr14,
  buildAlgoMarkSet,
  buildStopTakeRef,
  computeZones,
  correctReactionId,
  gradeComboLevel,
  gradeComboSmc,
  gradeLimitEntry,
  gradeLvReaction,
  gradeLvStrongest,
  gradeLvZone,
  gradeMarks,
  gradeSwTrend,
  hlineMark,
  huntBlocks,
  levelHints,
  levelsContext,
  msConceptsFor,
  msParamsFor,
  pickComboLevelTask,
  pickComboSmcTask,
  pickLevelsTask,
  pickLimitEntryTask,
  pickLvReactionTask,
  pickStopTakeTask,
  playCombo,
  playStopTake,
  positionMark,
  reactionOptions,
  resolveZoneChain,
  resolveZoneReaction,
  scoreStopTake,
  selectMsMarkTask,
  selectSwTrendTask,
  smcContext,
  swTrendHints,
  swingTrend,
  validateLimitOrder,
  validateStopTake,
  zoneFromMark,
  zoneInfo,
  zoneInfoMark,
  zoneMark,
  type Candle,
  type ComboAnswer,
  type Difficulty,
  type LevelRole,
  type Mark,
  type MsStage,
  type Side,
  type SkillId,
  type TaskSymbol,
  type TaskTimeframe,
  type UtcMs,
  type ZoneInfo,
} from '@tl/core';
import { z } from 'zod';
import { ApiError, validationError } from './errors';
import { SEGMENT_EXTRA, TICK, pickSegment, rngOf, sameSeries, withPartial } from './common';
import { shiftCandle, shiftMark, shiftTimes } from './shift';
import { DAY_MS, cutoffOf, depthOf, futureProviderFor, loadClosedBefore } from './sources';
import type { CurAnswer, NextRequest } from './schemas';
import type { Core, Draft, GradeCtx, ServerDeps, TaskReplay } from './tasks';

// ------------------------------------------------------------------ параметры токена

const Role = z.enum(['support', 'resistance']);
const SideZ = z.enum(['LONG', 'SHORT']);
const ZoneInfoZ = z.object({
  bottom: z.number(),
  top: z.number(),
  role: z.enum(['support', 'resistance', 'inside']),
  center: z.number(),
  touches: z.number().int(),
  reactions: z.number().int(),
  strength: z.number(),
  flip: z.boolean(),
  lastTouchTime: z.number(),
});
const cur = <K extends string>(kind: K) => z.object({ kind: z.literal(kind), curAlgoVersion: z.string(), tf: z.string() });

export const CUR_PARAM_SCHEMAS = [
  cur('sw-mark').extend({ windowSize: z.number().int().min(1).max(500) }),
  cur('sw-trend').extend({ nExt: z.number().int(), trend: z.enum(['up', 'down', 'range']) }),
  cur('lv-strongest').extend({ role: Role.nullable(), refBottom: z.number(), refTop: z.number() }),
  cur('lv-zone').extend({ role: Role.nullable(), refBottom: z.number(), refTop: z.number() }),
  cur('lv-reaction').extend({
    side: SideZ,
    options: z.array(z.object({ id: z.string(), bottom: z.number(), top: z.number() })).min(2).max(3),
    allowNone: z.boolean(),
    correct: z.string(),
  }),
  cur('limit-entry').extend({ side: SideZ, zone: ZoneInfoZ }),
  cur('stop-take').extend({ side: SideZ, zone: ZoneInfoZ, entry: z.number(), fillTime: z.number() }),
  cur('combo-level-trade').extend({
    /** Сторона, показанная пользователю (null - hard). */
    shown: SideZ.nullable(),
    role: Role.nullable(),
    refSide: SideZ,
    refBottom: z.number(),
    refTop: z.number(),
  }),
  cur('combo-smc-entry').extend({ side: SideZ, trend: z.enum(['up', 'down']), poiBottom: z.number(), poiTop: z.number(), poiKind: z.enum(['order-block', 'fvg']) }),
] as const;
export type CurParams = z.infer<(typeof CUR_PARAM_SCHEMAS)[number]>;

type Req<M extends NextRequest['module']> = Extract<NextRequest, { module: M }>;
const SHIFT_SALT = 0xc1de;

// ------------------------------------------------------------------ общее

const FUTURE_EXTRA = 1500;
const EXTRA_FOR: Record<TaskTimeframe, number> = { '15m': FUTURE_EXTRA, '1h': FUTURE_EXTRA, '4h': 1200, '1d': 400 };

function pickTf(req: { tf?: TaskTimeframe }, list: readonly TaskTimeframe[], seed: number): TaskTimeframe {
  if (req.tf !== undefined) {
    if (!list.includes(req.tf)) throw validationError('UNKNOWN_TIMEFRAME', 'tf', 'Timeframe is not available for this difficulty');
    return req.tf;
  }
  return list[seed % list.length]!;
}

/** Скрытая шкала времени: сдвиг на целое число суток (сетка 4h/1d сохраняется), реальная дата не раскрывается. */
const shiftFor = (T: UtcMs, seed: number): number => (Math.floor(T / DAY_MS) - (1000 + Math.floor(rngOf(seed, SHIFT_SALT)() * 3000))) * DAY_MS;

async function loadFuture(deps: ServerDeps, symbol: string, tf: TaskTimeframe, T: UtcMs, limit: number): Promise<Candle[] | null> {
  const step = TIMEFRAME_MS[tf];
  const future = (await deps.loader.candles(symbol, tf, T, Math.min(T + limit * step, cutoffOf(deps.now())))).filter((c) => c.closed && c.openTime >= T);
  if (future.length !== limit || future.some((c, i) => c.openTime !== T + i * step)) return null;
  return future;
}

interface SegmentData {
  candles: Candle[];
  htf: Candle[];
  segFrom: UtcMs;
  segTo: UtcMs;
}

async function loadSegment(deps: ServerDeps, symbol: string, tf: TaskTimeframe, seed: number, futureCandles: number): Promise<SegmentData | null> {
  const depth = depthOf(tf);
  const seg = pickSegment(deps, seed, tf, depth + EXTRA_FOR[tf] + futureCandles, depth + 100 + futureCandles);
  if (!seg) return null;
  const htfTf = HTF_OF[tf];
  const [candles, htf] = await Promise.all([
    deps.loader.candles(symbol, tf, seg.from, seg.to),
    htfTf === tf ? Promise.resolve([] as Candle[]) : deps.loader.candles(symbol, htfTf, seg.from - depthOf(htfTf) * TIMEFRAME_MS[htfTf], seg.to),
  ]);
  return { candles, htf, segFrom: seg.from, segTo: seg.to };
}

/** Видимый ряд и старший ТФ, восстановленные из загрузчика ровно так же, как при grade. */
async function loadVisible(deps: ServerDeps, symbol: string, tf: TaskTimeframe, T: UtcMs): Promise<{ visible: Candle[]; htf: Candle[] | null }> {
  const visible = await loadClosedBefore(deps.loader, symbol, tf, T);
  const htfTf = HTF_OF[tf];
  const htf = htfTf === tf ? null : await loadClosedBefore(deps.loader, symbol, htfTf, T);
  return { visible, htf };
}

const base = (deps: ServerDeps, d: Difficulty) => ({ difficulty: d, ...(deps.maxAttempts ? { maxAttempts: deps.maxAttempts } : {}) });

// ------------------------------------------------------------------ next: ступень 1

export async function buildStageSwings(req: Req<'stage-swings'>, symbol: TaskSymbol, seed: number, deps: ServerDeps, isExcludedId: (T: UtcMs) => boolean): Promise<Draft | null> {
  const { difficulty, taskType } = req;
  const tf = pickTf(req, (taskType === 'sw-mark' ? SW_MARK_TFS : SW_TREND_TFS)[difficulty], seed);
  const depth = MS_DEPTH[tf];
  const seg = pickSegment(deps, seed, tf, depth + SEGMENT_EXTRA, depth + 50);
  if (!seg) return null;
  const candles = await deps.loader.candles(symbol, tf, seg.from, seg.to);
  const fullFrom = seg.from + depth * TIMEFRAME_MS[tf];
  const common = {
    candles,
    tf,
    seed,
    ...base(deps, difficulty),
    isExcluded: (T: UtcMs) => T < fullFrom || (deps.gridStepMs !== undefined && T % deps.gridStepMs !== 0) || isExcludedId(T),
    maxT: seg.to,
  };

  if (taskType === 'sw-mark') {
    const sel = selectMsMarkTask({ ...common, stage: 'swings' });
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
      params: { kind: 'sw-mark', curAlgoVersion: CUR_ALGO_VERSION, tf, windowSize: sel.windowSize },
      series: { [tf]: shown },
      payload: {
        kind: 'sw-mark',
        tf,
        window: { fromTime: visible[sel.window.fromIndex]!.openTime, toTime: visible[sel.window.toIndex]!.openTime },
        windowCandles: sel.windowSize,
        concepts: sel.concepts,
        n: sel.params.nExt,
        requiredCount: sel.requiredCount,
        toleranceCandles: 2,
        tools: sel.tools,
        scoped: false,
      },
    };
  }

  const sel = selectSwTrendTask(common);
  if (!sel) return null;
  const visible = await loadClosedBefore(deps.loader, symbol, tf, sel.T);
  if (!sameSeries(visible, sel.visible)) return null;
  const shown = await withPartial(deps, symbol, tf, visible, sel.T);
  if (!shown) return null;
  const n = visible.length;
  return {
    T: sel.T,
    seed,
    shiftMs: 0,
    tf,
    params: { kind: 'sw-trend', curAlgoVersion: CUR_ALGO_VERSION, tf, nExt: sel.nExt, trend: sel.result.trend },
    series: { [tf]: shown },
    payload: {
      kind: 'sw-trend',
      tf,
      questionId: `sw-trend:${seed}`,
      window: { fromTime: visible[n - SW_TREND_WINDOW]!.openTime, toTime: visible[n - 1]!.openTime },
      n: sel.nExt,
      options: [...SW_TREND_OPTIONS],
      ...(difficulty === 'easy' ? { hints: swTrendHints(visible, sel.nExt) } : {}),
    },
  };
}

// ------------------------------------------------------------------ next: ступень 2

export async function buildLevels(req: Req<'levels'>, symbol: TaskSymbol, seed: number, deps: ServerDeps, isExcludedId: (T: UtcMs) => boolean): Promise<Draft | null> {
  const { difficulty, taskType } = req;
  const tf = pickTf(req, (taskType === 'lv-reaction' ? CUR_TFS.reaction : CUR_TFS.levels)[difficulty], seed);
  const limit = TIME_LIMIT_CANDLES[tf];
  const data = await loadSegment(deps, symbol, tf, seed, taskType === 'lv-reaction' ? limit : 0);
  if (!data) return null;
  const input = {
    candles: data.candles,
    htf: data.htf,
    tf,
    seed,
    tick: TICK[symbol],
    ...base(deps, difficulty),
    isExcluded: (T: UtcMs) => (deps.gridStepMs !== undefined && T % deps.gridStepMs !== 0) || isExcludedId(T),
    maxT: data.segTo,
  };

  if (taskType === 'lv-reaction') {
    const pick = pickLvReactionTask(input);
    if (!pick) return null;
    const { visible, htf } = await loadVisible(deps, symbol, tf, pick.T);
    if (!sameSeries(visible, pick.visible) || visible.length !== depthOf(tf)) return null;
    if (htf && pick.htfVisible && !sameSeries(htf, pick.htfVisible)) return null;
    const future = await loadFuture(deps, symbol, tf, pick.T, limit);
    if (!future) return null;
    const shiftMs = shiftFor(pick.T, seed);
    const easy = difficulty === 'easy';
    return {
      T: pick.T,
      seed,
      shiftMs,
      tf,
      relative: true,
      params: {
        kind: 'lv-reaction',
        curAlgoVersion: CUR_ALGO_VERSION,
        tf,
        side: pick.side,
        options: pick.options.map((o) => ({ id: o.id, bottom: o.zone.bottom, top: o.zone.top })),
        allowNone: pick.allowNone,
        correct: correctReactionId(pick.chain),
      },
      series: { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) },
      payload: {
        kind: 'lv-reaction',
        tf,
        side: pick.side,
        atr: pick.set.A,
        options: pick.options.map((o) => ({ id: o.id, bottom: o.zone.bottom, top: o.zone.top, touches: easy ? o.zone.touches : null, strength: easy ? o.zone.strength : null })),
        allowNone: pick.allowNone,
        limitCandles: limit,
      },
    };
  }

  const pick = pickLevelsTask(input);
  if (!pick) return null;
  const { visible, htf } = await loadVisible(deps, symbol, tf, pick.T);
  if (!sameSeries(visible, pick.visible) || visible.length !== depthOf(tf)) return null;
  if (htf && pick.htfVisible && !sameSeries(htf, pick.htfVisible)) return null;
  const ctx = levelsContext(visible, htf, pick.role, difficulty);
  if (!ctx || ctx.ref.bottom !== pick.ctx.ref.bottom || ctx.ref.top !== pick.ctx.ref.top) return null; // эталон при grade должен восстанавливаться
  const shown = await withPartial(deps, symbol, tf, visible, pick.T);
  if (!shown) return null;
  const common = {
    kind: taskType,
    tf,
    role: pick.role,
    atr: pick.ctx.set.A,
  };
  return {
    T: pick.T,
    seed,
    shiftMs: 0,
    tf,
    params: { kind: taskType, curAlgoVersion: CUR_ALGO_VERSION, tf, role: pick.role, refBottom: ctx.ref.bottom, refTop: ctx.ref.top },
    series: { [tf]: shown },
    payload:
      taskType === 'lv-strongest'
        ? { ...common, tolerancePct: 0.3, maxDistanceAtr: 5, ...(difficulty === 'easy' ? { hints: levelHints(visible) } : {}) }
        : { ...common, edgeToleranceAtr: 0.1, maxExtraHeightAtr: 1, tools: ['zone'], ...(difficulty === 'easy' ? { hints: levelHints(visible) } : {}) },
  };
}

// ------------------------------------------------------------------ next: ступени 3, 4 и комбо

const FRONT_K = { min: 0.05, max: 0.5 } as const;
/** Сегментов архива на один запрос next: ситуации комбо редки (SMC-вход - около трети сегментов), поиск ограничен временем. */
const TRADE_SEGMENTS = 14;
const TRADE_BUDGET_MS = 6_000;

/** Подсказки easy ступени 3: горизонтали ближнего края, середины и опережения 0.2*A (времена привязаны к последней свече). */
function limitHints(zone: { bottom: number; top: number }, side: Side, A: number, time: UtcMs): Mark[] {
  const near = side === 'LONG' ? zone.top : zone.bottom;
  const front = side === 'LONG' ? near + 0.2 * A : near - 0.2 * A;
  return [
    hlineMark(near, time, 'hint:near-edge', { role: 'near-edge' }),
    hlineMark((zone.bottom + zone.top) / 2, time, 'hint:middle', { role: 'middle' }),
    hlineMark(front, time, 'hint:front-run', { role: 'front-run' }),
  ];
}

const zoneForPayload = (z: ZoneInfo, shiftMs: number): ZoneInfo => ({ ...z, lastTouchTime: z.lastTouchTime - shiftMs });

type TradeReq = Req<'limit-entry'> | Req<'stop-take'> | Req<'combo-level-trade'> | Req<'combo-smc-entry'>;

/** Перебирает сегменты архива (разные сегменты по seed), пока не найдётся ситуация; грейд и правила отбора не меняются. */
export async function buildTradeTask(req: TradeReq, symbol: TaskSymbol, seed: number, deps: ServerDeps, isExcludedId: (T: UtcMs) => boolean): Promise<Draft | null> {
  const tf = pickTf(req, CUR_TFS.trade[req.difficulty], seed);
  const fixed = { ...req, tf } as TradeReq;
  const budget = Math.min(deps.nextBudgetMs ?? TRADE_BUDGET_MS, TRADE_BUDGET_MS);
  const started = Date.now();
  for (let k = 0; k < TRADE_SEGMENTS; k++) {
    if (k > 0 && Date.now() - started > budget) break;
    const d = await buildTradeOnce(fixed, symbol, (seed + k * 0x9e3779b1) >>> 0, deps, isExcludedId);
    if (d) return d;
  }
  return null;
}

async function buildTradeOnce(
  req: Req<'limit-entry'> | Req<'stop-take'> | Req<'combo-level-trade'> | Req<'combo-smc-entry'>,
  symbol: TaskSymbol,
  seed: number,
  deps: ServerDeps,
  isExcludedId: (T: UtcMs) => boolean,
): Promise<Draft | null> {
  const { difficulty } = req;
  const tf = pickTf(req, CUR_TFS.trade[difficulty], seed);
  const limit = TIME_LIMIT_CANDLES[tf];
  const depth = depthOf(tf);
  const data = await loadSegment(deps, symbol, tf, seed, req.module === 'stop-take' ? 2 * limit : limit);
  if (!data) return null;
  const input = {
    candles: data.candles,
    htf: data.htf,
    tf,
    seed,
    tick: TICK[symbol],
    ...base(deps, difficulty),
    isExcluded: (T: UtcMs) => (deps.gridStepMs !== undefined && T % deps.gridStepMs !== 0) || isExcludedId(T),
    maxT: data.segTo,
  };
  const easy = difficulty === 'easy';

  if (req.module === 'limit-entry') {
    const pick = pickLimitEntryTask(input);
    if (!pick) return null;
    const { visible, htf } = await loadVisible(deps, symbol, tf, pick.T);
    if (!sameSeries(visible, pick.visible) || visible.length !== depth) return null;
    if (htf && pick.htfVisible && !sameSeries(htf, pick.htfVisible)) return null;
    const future = await loadFuture(deps, symbol, tf, pick.T, limit);
    if (!future) return null;
    const reaction = resolveZoneReaction([...visible, ...future], visible.length - 1, pick.ref, pick.side, pick.set.A, limit);
    if (reaction.kind !== 'reaction') return null;
    const shiftMs = shiftFor(pick.T, seed);
    const zone = zoneInfo(pick.ref);
    const last = visible[visible.length - 1]!.openTime - shiftMs;
    return {
      T: pick.T,
      seed,
      shiftMs,
      tf,
      relative: true,
      params: { kind: 'limit-entry', curAlgoVersion: CUR_ALGO_VERSION, tf, side: pick.side, zone },
      series: { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) },
      payload: {
        kind: 'limit-entry',
        tf,
        side: pick.side,
        zone: zoneForPayload(zone, shiftMs),
        atr: pick.set.A,
        frontK: FRONT_K,
        limitCandles: limit,
        ...(easy ? { hints: limitHints(zone, pick.side, pick.set.A, last) } : {}),
      },
    };
  }

  if (req.module === 'stop-take') {
    const pick = pickStopTakeTask(input);
    if (!pick) return null;
    const { visible } = await loadVisible(deps, symbol, tf, pick.T);
    if (!sameSeries(visible, pick.visible) || visible.length !== depth) return null;
    const future = await loadFuture(deps, symbol, tf, pick.T, limit);
    if (!future) return null;
    const zone = zoneInfo(pick.zone);
    const ref = buildStopTakeRef(visible, pick.side, zone, pick.ref.E);
    if (!ref) return null;
    const shiftMs = shiftFor(pick.T, seed);
    const f = visible[visible.length - 1]!;
    const last = f.openTime - shiftMs;
    const hints = easy
      ? [
          hlineMark(ref.Pl, last, 'hint:structure', { role: 'structure' }),
          ...ref.targets.targets.map((t, i) => hlineMark(t.price, last, `hint:target:${i}`, { role: 'target-candidate' })),
        ]
      : [];
    return {
      T: pick.T,
      seed,
      shiftMs,
      tf,
      relative: true,
      params: { kind: 'stop-take', curAlgoVersion: CUR_ALGO_VERSION, tf, side: pick.side, zone, entry: ref.E, fillTime: f.openTime },
      series: { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) },
      payload: {
        kind: 'stop-take',
        tf,
        side: pick.side,
        zone: zoneForPayload(zone, shiftMs),
        entry: { price: ref.E, fillTime: f.openTime - shiftMs },
        atr: ref.A,
        limitCandles: limit,
        ...(easy ? { hints } : {}),
      },
    };
  }

  if (req.module === 'combo-level-trade') {
    const pick = pickComboLevelTask(input);
    if (!pick) return null;
    const { visible, htf } = await loadVisible(deps, symbol, tf, pick.T);
    if (!sameSeries(visible, pick.visible) || visible.length !== depth) return null;
    if (htf && pick.htfVisible && !sameSeries(htf, pick.htfVisible)) return null;
    const ctx = levelsContext(visible, htf, pick.role, difficulty);
    if (!ctx || ctx.ref.bottom !== pick.ctx.ref.bottom || ctx.ref.top !== pick.ctx.ref.top) return null;
    const future = await loadFuture(deps, symbol, tf, pick.T, limit);
    if (!future) return null;
    const shiftMs = shiftFor(pick.T, seed);
    return {
      T: pick.T,
      seed,
      shiftMs,
      tf,
      relative: true,
      params: {
        kind: 'combo-level-trade',
        curAlgoVersion: CUR_ALGO_VERSION,
        tf,
        shown: pick.sideShown,
        role: pick.role,
        refSide: pick.refSide,
        refBottom: ctx.ref.bottom,
        refTop: ctx.ref.top,
      },
      series: { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) },
      payload: {
        kind: 'combo-level-trade',
        tf,
        side: pick.sideShown,
        atr: ctx.set.A,
        frontK: FRONT_K,
        limitCandles: limit,
        tools: ['zone', 'hline'],
        ...(easy ? { hints: levelHints(visible).map((m, i) => shiftMark(m, shiftMs, `hint:${i}`)) } : {}),
      },
    };
  }

  const pick = pickComboSmcTask({ ...input, htf: [] });
  if (!pick) return null;
  const { visible } = await loadVisible(deps, symbol, tf, pick.T);
  if (!sameSeries(visible, pick.visible) || visible.length !== depth) return null;
  const ctx = smcContext(visible);
  const poi = ctx?.candidates[0];
  if (!ctx || !poi || poi.bottom !== pick.ctx.candidates[0]!.bottom || poi.top !== pick.ctx.candidates[0]!.top) return null;
  const future = await loadFuture(deps, symbol, tf, pick.T, limit);
  if (!future) return null;
  const shiftMs = shiftFor(pick.T, seed);
  let hints: Mark[] = [];
  if (easy) {
    const r = analyzeStructure(visible, { nExt: 5, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 }, { tf });
    const n = visible.length;
    hints = buildAlgoMarkSet(r, { concepts: ['swing', 'bos', 'choch'], window: { fromIndex: Math.max(0, n - 150), toIndex: n - 1 } }).required.map((m, i) => shiftMark(m, shiftMs, `hint:${i}`));
  }
  return {
    T: pick.T,
    seed,
    shiftMs,
    tf,
    relative: true,
    params: { kind: 'combo-smc-entry', curAlgoVersion: CUR_ALGO_VERSION, tf, side: ctx.side, trend: ctx.trend, poiBottom: poi.bottom, poiTop: poi.top, poiKind: poi.kind },
    series: { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) },
    payload: {
      kind: 'combo-smc-entry',
      tf,
      side: ctx.side,
      atr: ctx.A,
      frontK: FRONT_K,
      limitCandles: limit,
      tools: ['zone', 'hline'],
      ...(easy ? { hints } : {}),
    },
  };
}

// ------------------------------------------------------------------ grade

const markGradeOf = (g: ReturnType<typeof gradeMarks>) => ({ matched: g.matched, missed: g.missed, extra: g.extra, ignored: g.ignored, toleranceCandles: g.toleranceCandles });

const VALIDATION_PATH: Record<string, string> = {
  ZONE_MARK_INVALID: 'answer.zone',
  ZONE_SIDE_MISMATCH: 'answer.zone',
  LIMIT_WRONG_SIDE: 'answer.limit.price',
  LIMIT_TYPE_INVALID: 'answer.limit',
  SL_WRONG_SIDE: 'answer.sl',
  TP_WRONG_SIDE: 'answer.tp',
  INVALID_TYPE: 'answer',
};

/** CurValidationError ядра -> 400 с кодом контракта (попытка не оценивается). */
function asValidation<T>(f: () => T): T {
  try {
    return f();
  } catch (e) {
    if (e instanceof CurValidationError) throw validationError(e.code, VALIDATION_PATH[e.code] ?? 'answer');
    throw e;
  }
}

const mismatch500 = (what: string) => new Error(`CUR_REFERENCE_MISMATCH:${what}`); // сервер не смог воспроизвести эталон: 500 + лог, не оценка

/** Метка-зона пользователя: время якорей на шкале задания должно попадать в видимый ряд. */
function checkZoneAnchors(m: { anchors: { time: number }[] }, visible: readonly Candle[], shift: number, path: string, T: UtcMs): void {
  const from = visible[0]!.openTime;
  const to = T; // до момента решения: на сетке 15m последняя показанная свеча может быть формирующейся
  for (const a of m.anchors) if (a.time + shift < from || a.time + shift > to) throw validationError('ZONE_MARK_INVALID', path);
}

interface WrapIn {
  g: { verdict: Core['verdict']; score: number; skillOutcomes: Core['skillOutcomes']; errors: Core['errors']; ok?: unknown[] };
  detail: Record<string, unknown>;
  reference: Mark[];
  shift: number;
  replay?: TaskReplay;
  resolution?: Core['resolution'];
  verdictParams?: Record<string, string | number>;
}

function wrap(w: WrapIn): Core {
  const { g, shift } = w;
  return {
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors.map((e) => (e.params ? { ...e, params: shiftTimes(e.params, shift) } : e)),
    reference: w.reference,
    detail: shiftTimes(w.detail, shift),
    ...(g.ok ? { ok: (g.ok as { params?: Record<string, string | number> }[]).map((o) => (o.params ? { ...o, params: shiftTimes(o.params, shift) } : o)) as unknown as Core['ok'] } : {}),
    ...(w.verdictParams ? { verdictParams: shiftTimes(w.verdictParams, shift) } : {}),
    ...(w.replay ? { replay: w.replay } : {}),
    ...(w.resolution ? { resolution: w.resolution } : {}),
  };
}

/** Проигрывание: свечи от T до min(exit + 10, T + limit) на шкале задания; индексы выхода и исполнения. */
function replayOf(tf: TaskTimeframe, future: readonly Candle[], shift: number, exitTime: UtcMs | null, fillTime: UtcMs | null, limit: number): TaskReplay {
  const idxOf = (t: UtcMs | null) => (t === null ? -1 : future.findIndex((c) => t >= c.openTime && t <= c.closeTime));
  const exit = idxOf(exitTime);
  const fill = idxOf(fillTime);
  const end = exit >= 0 ? Math.min(exit + 10, limit - 1) : future.length - 1;
  return {
    tf,
    candles: future.slice(0, end + 1).map((c) => shiftCandle(c, shift)),
    exitIndex: exit >= 0 ? exit : null,
    fillIndex: fillTime === null ? null : fill >= 0 ? fill : null,
  };
}

const lastTime = (visible: readonly Candle[], shift: number) => visible[visible.length - 1]!.openTime - shift;

export async function gradeCurTask(c: GradeCtx, p: CurParams, a: CurAnswer, shift: number): Promise<Core> {
  if (p.curAlgoVersion !== CUR_ALGO_VERSION) throw new ApiError(401, 'token_expired', 'Task token was issued for another curriculum algorithm version');
  const tf = p.tf as TaskTimeframe;
  const { deps, symbol, T, difficulty } = c;
  const tick = TICK[symbol];
  const { visible, htf } = await loadVisible(deps, symbol, tf, T);
  if (visible.length < 50) throw new ApiError(404, 'not_found', 'No archive data for the task period');
  if (visible.length !== depthOf(tf)) throw new ApiError(404, 'not_found', 'No archive data for the task period');
  const lastOpen = visible[visible.length - 1]!.openTime;
  const lt = lastTime(visible, shift);
  const limit = TIME_LIMIT_CANDLES[tf];
  const provider = () => futureProviderFor(deps.loader, symbol, cutoffOf(deps.now()), { aggTradesTimeoutMs: deps.aggTradesTimeoutMs });
  const future = async (): Promise<Candle[]> => {
    const f = await loadFuture(deps, symbol, tf, T, limit);
    if (!f) throw new ApiError(404, 'not_found', 'No archive data after the decision time');
    return f;
  };

  switch (p.kind) {
    case 'sw-mark': {
      const ans = a as Extract<CurAnswer, { kind: 'sw-mark' }>;
      const n = visible.length;
      const window = { fromIndex: Math.max(0, n - p.windowSize), toIndex: n - 1 };
      const concepts = msConceptsFor(difficulty, [], 'swings' satisfies MsStage);
      const r = analyzeStructure(visible, msParamsFor(difficulty, 'swings'), { tf });
      const algo = buildAlgoMarkSet(r, { concepts, window });
      const g = gradeMarks(ans.marks as Mark[], algo, {
        candles: visible, window, concepts, toleranceCandles: 2, iouMin: 0.5, levelPricePct: 0.1, scoped: false, tickSize: tick,
      });
      return { verdict: g.verdict, score: g.score, skillOutcomes: g.skillOutcomes, errors: g.errors, reference: algo.required, detail: { kind: 'sw-mark', marks: markGradeOf(g) }, toleranceCandles: g.toleranceCandles };
    }

    case 'sw-trend': {
      const ans = a as Extract<CurAnswer, { kind: 'sw-trend' }>;
      if (ans.questionId !== `sw-trend:${c.seed}`) throw validationError('INVALID_TYPE', 'answer.questionId', 'Question does not match the task');
      const r = swingTrend(visible, p.nExt);
      if (!r || r.trend !== p.trend) throw mismatch500('sw-trend');
      const g = gradeSwTrend(r, ans.optionId);
      return wrap({ g, shift: 0, reference: [], detail: { kind: 'sw-trend', ...g.detail } });
    }

    case 'lv-strongest':
    case 'lv-zone': {
      const ctx = levelsContext(visible, htf, p.role, difficulty);
      if (!ctx || ctx.ref.bottom !== p.refBottom || ctx.ref.top !== p.refTop) throw mismatch500(p.kind);
      const refMarks = [zoneInfoMark(zoneInfo(ctx.ref), ctx.ref.lastTouchTime, lastOpen, 'ref:zone', { role: 'reference' })];
      if (ctx.second) refMarks.push(zoneInfoMark(zoneInfo(ctx.second), ctx.second.lastTouchTime, lastOpen, 'ref:second', { role: 'second' }));
      if (p.kind === 'lv-strongest') {
        const g = gradeLvStrongest(ctx, (a as Extract<CurAnswer, { kind: 'lv-strongest' }>).price);
        return wrap({ g, shift: 0, reference: refMarks, detail: { kind: 'lv-strongest', ...g.detail } });
      }
      const ans = a as Extract<CurAnswer, { kind: 'lv-zone' }>;
      checkZoneAnchors(ans.zone, visible, 0, 'answer.zone.anchors', T);
      const { ub, ut } = asValidation(() => zoneFromMark(ans.zone as Mark));
      const g = gradeLvZone(ctx, ub, ut);
      return wrap({ g, shift: 0, reference: refMarks, detail: { kind: 'lv-zone', ...g.detail } });
    }

    case 'lv-reaction': {
      const ans = a as Extract<CurAnswer, { kind: 'lv-reaction' }>;
      const set = computeZones(visible, htf);
      if (!set) throw mismatch500('lv-reaction');
      const options = reactionOptions(set, p.side, difficulty);
      if (options.length !== p.options.length || options.some((o, i) => o.zone.bottom !== p.options[i]!.bottom || o.zone.top !== p.options[i]!.top)) throw mismatch500('lv-reaction options');
      const ids = [...options.map((o) => o.id), ...(p.allowNone ? ['none'] : [])];
      if (!ids.includes(ans.optionId)) throw validationError('OPTION_UNKNOWN', 'answer.optionId');
      const fut = await future();
      const all = [...visible, ...fut];
      const iT = visible.length - 1;
      const chain = resolveZoneChain(all, iT, options.map((o) => o.zone), p.side, set.A, limit);
      if (correctReactionId(chain) !== p.correct || (chain.kind !== 'reaction' && chain.kind !== 'none')) throw mismatch500('lv-reaction outcome');
      const g = gradeLvReaction(options, chain, all, ans.optionId);
      const e = chain.e - iT - 1;
      const replay = replayOf(tf, fut, shift, fut[e]!.openTime, null, limit);
      const reference = g.detail.options.map((o, i) => zoneInfoMark(o, lastOpen - 0, all[Math.min(chain.e, all.length - 1)]!.openTime, `ref:${o.id}`, { id: o.id, status: o.status, strength: options[i]!.zone.strength }));
      const shifted = reference.map((m, i) => shiftMark(m, shift, `ref:${i}`));
      return wrap({ g, shift, reference: shifted, replay, detail: { kind: 'lv-reaction', ...g.detail } });
    }

    case 'limit-entry': {
      const ans = a as Extract<CurAnswer, { kind: 'limit-entry' }>;
      const order = ans.limit;
      const P = visible[visible.length - 1]!.close;
      asValidation(() => validateLimitOrder(p.side, P, order));
      const A = atr14(visible)[visible.length - 1];
      if (A === null || A === undefined) throw mismatch500('limit-entry atr');
      const fut = await future();
      const all = [...visible, ...fut];
      const iT = visible.length - 1;
      const reaction = resolveZoneReaction(all, iT, p.zone, p.side, A, limit);
      if (reaction.kind !== 'reaction') throw mismatch500('limit-entry reaction');
      const g = gradeLimitEntry({ side: p.side, zone: p.zone, A, tick, candles: all, T: iT, limitCandles: limit, order, reaction });
      const replayEnd = g.replay.to - iT - 1;
      const replay: TaskReplay = {
        tf,
        candles: fut.slice(0, replayEnd + 1).map((x) => shiftCandle(x, shift)),
        exitIndex: g.replay.exitIndex - iT - 1,
        fillIndex: g.replay.fillIndex === null ? null : g.replay.fillIndex - iT - 1,
      };
      const t = lt;
      const reference = [
        zoneInfoMark(p.zone, p.zone.lastTouchTime - shift, t, 'ref:zone', { role: 'reference' }),
        hlineMark(order.price, t, 'ref:limit', { role: 'limit' }),
      ];
      return wrap({
        g,
        shift,
        reference,
        replay,
        detail: { kind: 'limit-entry', ...g.detail },
        verdictParams: { outcomeText: CUR_OUTCOME_TEXT_RU[g.verdictParams.outcomeText], outcomeTime: g.verdictParams.outcomeTime },
      });
    }

    case 'stop-take': {
      const ans = a as Extract<CurAnswer, { kind: 'stop-take' }>;
      const ref = buildStopTakeRef(visible, p.side, p.zone, p.entry);
      if (!ref || visible[visible.length - 1]!.openTime !== p.fillTime) throw mismatch500('stop-take');
      asValidation(() => validateStopTake(ref, ans.sl, ans.tp));
      const sc = scoreStopTake(ref, ans.sl, ans.tp);
      let play;
      try {
        play = await playStopTake(ref, ans.sl, ans.tp, T, tf, limit, provider());
      } catch (e) {
        if (e instanceof Error && e.message === 'NO_FUTURE_CANDLES') throw new ApiError(404, 'not_found', 'No archive data after the decision time');
        throw e;
      }
      const blk = huntBlocks(p.side, ans.sl, sc.slFull, play.hunt, ref);
      const o = play.outcome;
      const replay = replayOf(tf, play.future, shift, o.exitTime, null, limit);
      const t = lt;
      const reference: Mark[] = [
        zoneInfoMark(p.zone, p.zone.lastTouchTime - shift, t, 'ref:zone', { role: 'reference' }),
        hlineMark(ref.Pl, t, 'ref:structure', { role: 'structure' }),
        ...ref.targets.targets.map((x, i) => hlineMark(x.price, t, `ref:target:${i}`, { role: 'target', allowed: x.allowed, source: x.source })),
        positionMark(p.side, t, ref.E, play.referencePlan.sl, play.referencePlan.tp, 'ref:plan', { role: 'reference-plan' }),
      ];
      const g = { verdict: sc.verdict, score: sc.quality / 100, skillOutcomes: sc.skillOutcomes, errors: [...sc.errors, ...blk.errors], ok: [...sc.ok, ...blk.ok] };
      const refOut = play.referencePlan.outcome;
      return wrap({
        g,
        shift,
        reference,
        replay,
        resolution: { method: o.method, triggerTime: o.triggerTime - shift, triggerTf: o.triggerTf },
        verdictParams: { outcomeText: CUR_OUTCOME_TEXT_RU[o.result], outcomeTime: o.exitTime, r: o.rMultiple },
        detail: {
          kind: 'stop-take',
          entry: ref.E,
          structure: ref.Pl,
          slBand: sc.slBand,
          targets: ref.targets.targets.map((x) => ({ price: x.price, source: x.source, rrRef: x.rrRef, allowed: x.allowed })),
          rr: sc.rr,
          parts: sc.parts,
          quality: sc.quality,
          outcome: stripTrigger(o),
          referencePlan: { sl: play.referencePlan.sl, tp: play.referencePlan.tp, outcome: stripTrigger(refOut) },
          stopHunted: play.hunt.hunted,
        },
      });
    }

    case 'combo-level-trade':
    case 'combo-smc-entry': {
      const ans = a as Extract<CurAnswer, { kind: 'combo-level-trade' | 'combo-smc-entry' }>;
      const answer: ComboAnswer = { zone: ans.zone as Mark, limit: ans.limit, sl: ans.sl, tp: ans.tp };
      checkZoneAnchors(ans.zone, visible, shift, 'answer.zone.anchors', T);
      // зона/якоря на шкале задания -> реальное время не нужно: оцениваются только цены
      const unshiftedZone = { ...ans.zone, anchors: ans.zone.anchors.map((x) => ({ ...x, time: x.time + shift })) } as Mark;
      answer.zone = unshiftedZone;
      const fut = await future();
      const reference: Mark[] = [];
      let g: ReturnType<typeof gradeComboLevel> | ReturnType<typeof gradeComboSmc>;
      let A: number;
      let P: number;
      let matched: unknown;
      if (p.kind === 'combo-level-trade') {
        const ctx = levelsContext(visible, htf, p.role, difficulty);
        if (!ctx || ctx.ref.bottom !== p.refBottom || ctx.ref.top !== p.refTop) throw mismatch500('combo-level');
        g = asValidation(() => gradeComboLevel(ctx, visible, answer, p.shown));
        A = ctx.set.A;
        P = ctx.set.P;
        matched = (g as ReturnType<typeof gradeComboLevel>).matched;
        reference.push(zoneInfoMark(matched as ZoneInfo, (matched as ZoneInfo).lastTouchTime - shift, lt, 'ref:zone', { role: 'reference' }));
      } else {
        const ctx = smcContext(visible);
        const poi = ctx?.candidates[0];
        if (!ctx || !poi || poi.bottom !== p.poiBottom || poi.top !== p.poiTop) throw mismatch500('combo-smc');
        g = asValidation(() => gradeComboSmc(ctx, visible, answer));
        A = ctx.A;
        P = ctx.P;
        matched = (g as ReturnType<typeof gradeComboSmc>).matched;
        const m = matched as { bottom: number; top: number; time: number; kind: string; status: string };
        reference.push(zoneMark({ bottom: m.bottom, top: m.top }, m.time - shift, lt, 'ref:zone', { role: 'reference', kind: m.kind, status: m.status }));
      }
      const near = g.side === 'LONG' ? g.zone.top : g.zone.bottom;
      const far = g.side === 'LONG' ? g.zone.bottom : g.zone.top;
      let play;
      try {
        play = await playCombo(g, { side: g.side, T, tf, limitCandles: limit, zone: { near, far }, A, P, tick }, answer, provider());
      } catch (e) {
        if (e instanceof Error && e.message === 'NO_FUTURE_CANDLES') throw new ApiError(404, 'not_found', 'No archive data after the decision time');
        throw e;
      }
      reference.push(hlineMark(g.Pl, lt, 'ref:structure', { role: 'structure' }));
      g.targets.forEach((x, i) => reference.push(hlineMark(x.price, lt, `ref:target:${i}`, { role: 'target', allowed: x.allowed, source: x.source })));
      const o = play.outcome;
      const filled = o.kind === 'tp' || o.kind === 'sl' || o.kind === 'timeout';
      const exitTime = filled ? o.exitTime : (o as { time: UtcMs }).time;
      const fillTime = filled ? o.fillTime : null;
      const replay = replayOf(tf, fut, shift, exitTime, fillTime, limit);
      const outKey = o.kind as keyof typeof CUR_OUTCOME_TEXT_RU;
      const gr = { verdict: g.verdict, score: g.quality / 100, skillOutcomes: g.skillOutcomes, errors: [...g.errors, ...play.blocks.errors], ok: [...g.ok, ...play.blocks.ok] };
      return wrap({
        g: gr,
        shift,
        reference,
        replay,
        ...(filled ? { resolution: { method: o.method, triggerTime: o.triggerTime - shift, triggerTf: o.triggerTf } } : {}),
        verdictParams: { outcomeText: CUR_OUTCOME_TEXT_RU[outKey], outcomeTime: exitTime, r: o.rMultiple },
        detail: {
          kind: p.kind,
          matchedZone: matched,
          parts: g.parts,
          quality: g.quality,
          rr: g.rr,
          targets: g.targets.map((x) => ({ price: x.price, source: x.source, rrRef: x.rrRef, allowed: x.allowed })),
          outcome: filled ? stripTrigger(o) : o,
          stopHunted: play.hunt.hunted,
        },
      });
    }
  }
}

function stripTrigger<T extends { triggerTime?: unknown; triggerTf?: unknown }>(o: T): Omit<T, 'triggerTime' | 'triggerTf'> {
  const { triggerTime: _t, triggerTf: _f, ...rest } = o;
  void _t;
  void _f;
  return rest;
}

export type { LevelRole, SkillId };
