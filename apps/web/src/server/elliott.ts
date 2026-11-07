// Elliott Wave Lab на сервере (ELLIOTT.md §9, §12, §19): next (каталог кандидатов по месяцам архива + кэш) и grade.
// Инвариант: payload next и эталон grade строятся одной функцией buildEwRef по одним и тем же закрытым свечам (ADR-0005).
import {
  EW_ALGO_VERSION,
  EW_KIND_BY_DIFFICULTY,
  EW_SHAPES,
  EW_TFS,
  EW_VISIBLE,
  EW_PRIMARY_OPTIONS,
  EW_ALTERNATIVE_OPTIONS,
  TIMEFRAME_MS,
  buildEwRef,
  candleIndexAt,
  ewCatalog,
  ewLimit,
  ewMakeTask,
  ewTaskPayload,
  gradeElliott,
  mulberry32,
  randInt,
  type Candle,
  type ElliottAnswer,
  type EwCatalogEntry,
  type EwRefParams,
  type EwTaskKind,
  type Mark,
  type TaskSymbol,
  type TaskTimeframe,
  type UtcMs,
} from '@tl/core';
import { ArchiveError } from '@tl/market-data';
import { z } from 'zod';
import { ApiError, validationError } from './errors';
import type { ElliottAnswerApi, NextRequest } from './schemas';
import { DAY_MS, cutoffOf, loadClosedBefore, type CandleLoader } from './sources';
import { shiftCandle, shiftMark, shiftTimes } from './shift';
import type { Core, Draft, GradeCtx, ServerDeps } from './tasks';

// ------------------------------------------------------------------ параметры токена

export const ElliottParamsSchema = z.object({
  kind: z.enum(['ew-impulse', 'ew-impulse-correction', 'ew-scenario']),
  ewAlgoVersion: z.string(),
  tf: z.string(),
  nPivot: z.number().int(),
  nPoint: z.number().int(),
  window: z.object({ fromTime: z.number(), toTime: z.number() }),
  lastPivot: z.object({ index: z.number().int(), time: z.number() }),
  refCount: z.object({
    times: z.array(z.number()).min(3).max(9),
    type: z.enum(['zigzag', 'flat']).nullable(),
    dir: z.enum(['bull', 'bear']),
  }),
  invTol: z.number(),
});
export type ElliottParams = z.infer<typeof ElliottParamsSchema>;

// ------------------------------------------------------------------ каталог кандидатов (кэш)

/** Сегментов-месяцев на один вызов генерации (ELLIOTT.md §9.1). */
export const EW_MAX_SEGMENTS = 24;
/** Сегментов-месяцев, загружаемых параллельно. */
const BATCH = 3;
/** После стольких неудачных вызовов разрешается ослабление критерия (ELLIOTT.md §8). */
const RELAX_AFTER = 2;
/** Предел проб на сегмент для hard (каждая проба - перебор разметок). */
const HARD_TRIES = 120;
const CACHE_LIMIT = 400;

const catalogCache = new Map<string, EwCatalogEntry[]>();
const key = (symbol: string, tf: string, month: number, kind: string, relaxed: boolean) => `${EW_ALGO_VERSION}|${symbol}|${tf}|${month}|${kind}|${relaxed ? 1 : 0}`;
/** Для тестов: сброс кэша каталога. */
export const clearEwCatalogCache = (): void => catalogCache.clear();
export const ewCatalogCacheSize = (): number => catalogCache.size;

const monthStart = (t: UtcMs) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};
const nextMonth = (t: UtcMs) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
};

/** Закрытые месяцы архива в диапазоне: конец месяца + хвост проигрывания не позже границы данных. */
export function archiveMonths(range: { from: UtcMs; to: UtcMs }, tf: TaskTimeframe): UtcMs[] {
  const step = TIMEFRAME_MS[tf];
  const tail = (ewLimit(tf) + 12) * step;
  const out: UtcMs[] = [];
  for (let m = nextMonthIfPartial(range.from); nextMonth(m) + tail <= range.to; m = nextMonth(m)) out.push(m);
  return out;
}
const nextMonthIfPartial = (t: UtcMs) => (monthStart(t) === t ? t : nextMonth(t));

interface Segment {
  month: UtcMs;
  series: Candle[];
  entries: EwCatalogEntry[];
}

async function loadSegment(loader: CandleLoader, symbol: string, tf: TaskTimeframe, kind: EwTaskKind, month: UtcMs, relaxed: boolean, cutoff: UtcMs): Promise<Segment | null> {
  const step = TIMEFRAME_MS[tf];
  const from = month - (EW_VISIBLE + 5) * step;
  const to = Math.min(nextMonth(month) + (ewLimit(tf) + 8) * step, cutoff);
  let series: Candle[];
  try {
    series = (await loader.candles(symbol, tf, from, to)).filter((c) => c.closed);
  } catch (e) {
    if (e instanceof ArchiveError && e.code === 'not_found') return null; // месяца нет в архиве - сегмент непригоден
    throw e;
  }
  if (series.length < EW_VISIBLE + 100) return null;
  const k = key(symbol, tf, month, kind, relaxed);
  let entries = catalogCache.get(k);
  if (!entries) {
    const end = nextMonth(month);
    entries = ewCatalog(series, tf, kind, relaxed).filter((e) => e.lastPivotTime >= month && e.lastPivotTime < end);
    if (catalogCache.size >= CACHE_LIMIT) catalogCache.delete(catalogCache.keys().next().value as string);
    catalogCache.set(k, entries);
  } else {
    catalogCache.delete(k);
    catalogCache.set(k, entries);
  }
  return { month, series, entries };
}

const sameEnds = (a: readonly Candle[], b: readonly Candle[]) =>
  a.length === b.length && a.length > 0 && a[0]!.openTime === b[0]!.openTime && a[a.length - 1]!.openTime === b[b.length - 1]!.openTime;

// ------------------------------------------------------------------ next

type EwReq = Extract<NextRequest, { module: 'elliott' }>;

export async function buildElliott(
  req: EwReq,
  symbol: TaskSymbol,
  seed: number,
  deps: ServerDeps,
  range: { from: UtcMs; to: UtcMs },
  isExcludedId: (T: UtcMs) => boolean,
  attempt: number,
  deadline: number,
): Promise<Draft | null> {
  const kind = EW_KIND_BY_DIFFICULTY[req.difficulty];
  const allowed = EW_TFS[kind];
  if (req.tf !== undefined && !(allowed as readonly string[]).includes(req.tf)) throw validationError('UNKNOWN_TIMEFRAME', 'tf', 'Timeframe is not available for this difficulty');
  const tf = (req.tf as TaskTimeframe | undefined) ?? allowed[seed % allowed.length]!;
  const step = TIMEFRAME_MS[tf];
  const limit = ewLimit(tf);
  const cutoff = cutoffOf(deps.now());
  const relaxed = attempt >= RELAX_AFTER;
  const months = archiveMonths({ from: range.from, to: Math.min(range.to, cutoff) }, tf);
  if (months.length === 0) return null;
  const start = seed % months.length;
  const order = Array.from({ length: Math.min(EW_MAX_SEGMENTS, months.length) }, (_, i) => months[(start + i) % months.length]!);

  for (let b = 0; b < order.length; b += BATCH) {
    if (Date.now() > deadline) return null;
    const segs = await Promise.all(order.slice(b, b + BATCH).map((m) => loadSegment(deps.loader, symbol, tf, kind, m, relaxed, cutoff)));
    for (const seg of segs) {
      if (!seg || seg.entries.length === 0) continue;
      const n = seg.entries.length;
      const k0 = randInt(mulberry32((seed ^ 0x3e11) | 0), n);
      const tries = kind === 'ew-scenario' ? Math.min(n, HARD_TRIES) : n;
      for (let j = 0; j < tries; j++) {
        if (Date.now() > deadline) return null;
        const entry = seg.entries[(k0 + j) % n]!;
        const pick = ewMakeTask(seg.series, tf, entry, seed, relaxed);
        if (!pick || isExcludedId(pick.T)) continue;

        // тот же ряд, что увидит grade
        const visible = await loadClosedBefore(deps.loader, symbol, tf, pick.T);
        if (!sameEnds(visible, pick.visible) || visible.length !== EW_VISIBLE) continue;
        const future = (await deps.loader.candles(symbol, tf, pick.T, Math.min(pick.T + limit * step, cutoff))).filter((c) => c.closed && c.openTime >= pick.T);
        if (future.length !== limit || future.some((c, i) => c.openTime !== pick.T + i * step)) continue;

        const params: ElliottParams = { ...pick.params, ewAlgoVersion: EW_ALGO_VERSION };
        const offDays = 1000 + randInt(mulberry32((seed ^ 0xe110) | 0), 3000);
        const shiftMs = (Math.floor(pick.T / DAY_MS) - offDays) * DAY_MS;
        const task = ewTaskPayload(pick.ref);
        return {
          T: pick.T, seed, shiftMs, tf, relative: true,
          params,
          series: { [tf]: visible.map((c) => shiftCandle(c, shiftMs)) },
          payload: {
            ...task,
            window: { fromTime: task.window.fromTime - shiftMs, toTime: task.window.toTime - shiftMs },
            lastPivot: { ...task.lastPivot, time: task.lastPivot.time - shiftMs },
          },
        };
      }
    }
  }
  return null;
}

// ------------------------------------------------------------------ grade

/** Валидация ответа относительно задания (400, попытка не оценивается): диапазон якорей, формы, сценарии. */
function validateAnswer(p: ElliottParams, a: ElliottAnswerApi, visible: readonly Candle[], step: number, shift: number): void {
  const inRange = (t: number) => t >= p.window.fromTime && t < p.window.toTime + step && candleIndexAt(visible, t, step) >= 0;
  a.impulse.anchors.forEach((x, i) => {
    if (!inRange(x.time + shift)) throw validationError('EW_ANCHOR_OUT_OF_RANGE', `answer.impulse.anchors.${i}.time`);
  });
  a.correction?.anchors.forEach((x, i) => {
    if (!inRange(x.time + shift)) throw validationError('EW_ANCHOR_OUT_OF_RANGE', `answer.correction.anchors.${i}.time`);
  });
  if (a.correction && a.impulse.anchors.length !== 6) throw validationError('EW_CORRECTION_WITHOUT_IMPULSE', 'answer.correction');
  if (a.correction && !EW_SHAPES[p.kind].includes('impulse-6+correction')) throw validationError('EW_SHAPE_NOT_ALLOWED', 'answer.correction');
  if (!(EW_PRIMARY_OPTIONS as string[]).includes(a.primary)) throw validationError('EW_SCENARIO_UNKNOWN', 'answer.primary');
  if (a.alternative !== null && !(EW_ALTERNATIVE_OPTIONS as string[]).includes(a.alternative)) throw validationError('EW_SCENARIO_UNKNOWN', 'answer.alternative');
}

export async function gradeElliottTask(c: GradeCtx, p: ElliottParams, a: ElliottAnswerApi, shift: number, tickSize: number): Promise<Core> {
  if (p.ewAlgoVersion !== EW_ALGO_VERSION) throw new ApiError(401, 'token_expired', 'Task token was issued for another Elliott algorithm version');
  const tf = p.tf as TaskTimeframe;
  const step = TIMEFRAME_MS[tf];
  const visible = await loadClosedBefore(c.deps.loader, c.symbol, tf, c.T);
  if (visible.length !== EW_VISIBLE) throw new ApiError(404, 'not_found', 'No archive data for the task period');
  validateAnswer(p, a, visible, step, shift);

  const limit = ewLimit(tf);
  const cutoff = cutoffOf(c.deps.now());
  const future = (await c.deps.loader.candles(c.symbol, tf, c.T, Math.min(c.T + limit * step, cutoff))).filter((x) => x.closed && x.openTime >= c.T);
  if (future.length !== limit) throw new ApiError(404, 'not_found', 'No archive data after the decision time');

  const refParams: EwRefParams = { ...p, kind: p.kind, tf, refCount: { ...p.refCount } };
  const ref = buildEwRef(visible, refParams);
  if (!ref) throw new Error('EW_REFERENCE_MISMATCH'); // сервер не смог воспроизвести эталон: 500 + лог, не оценка

  const unshift = (m: Mark): Mark => ({ ...m, anchors: m.anchors.map((x) => ({ ...x, time: x.time + shift })) });
  const answer: ElliottAnswer = {
    kind: p.kind,
    impulse: unshift(a.impulse as Mark),
    correction: a.correction ? unshift(a.correction as Mark) : null,
    primary: a.primary,
    alternative: a.alternative,
    invalidation: a.invalidation,
  };
  const g = gradeElliott(ref, { candles: visible, tf }, future, answer, { tickSize });

  const detail = shiftTimes(g.detail, shift);
  if (g.detail.outcome.altAfterInvalidation !== null) detail.outcome.altAfterInvalidation = g.detail.outcome.altAfterInvalidation - shift;
  return {
    verdict: g.verdict,
    score: g.score,
    skillOutcomes: g.skillOutcomes,
    errors: g.errors.map((e) => (e.params ? { ...e, params: shiftTimes(e.params, shift) } : e)),
    reference: g.reference.map((m, i) => shiftMark(m, shift, `ref:${i}`)),
    detail: { kind: p.kind, elliott: detail },
    ok: g.ok.map((o) => (o.params ? { ...o, params: shiftTimes(o.params, shift) } : o)) as unknown as Core['ok'],
    toleranceCandles: g.toleranceCandles,
    verdictParams: { outcomeText: g.verdictParams.outcomeText, outcomeTime: g.verdictParams.outcomeTime - shift },
    ...(g.replay ? { replay: { tf, candles: g.replay.candles.map((x) => shiftCandle(x, shift)), exitIndex: g.replay.exitIndex } } : {}),
  };
}

