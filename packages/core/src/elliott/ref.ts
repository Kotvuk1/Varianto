// Эталон задания Elliott: восстановление из видимого ряда по запечатанным параметрам (общий путь для next и grade).
import { TIME_LIMIT_CANDLES } from '../challenge/facts';
import { candleIndexAt } from '../smc/series';
import { TIMEFRAME_MS } from '../types';
import type { Candle, TaskTimeframe, UtcMs } from '../types';
import { atrOf, checkCount, EW_N_POINT, EW_TOLERANCE_CANDLES } from './check';
import { enumerateCounts, EW_MAX_COUNTS } from './enumerate';
import { sideAt } from './measure';
import { EW_ALTERNATIVE_OPTIONS, EW_PRIMARY_OPTIONS, countPoints, defaultAlternative } from './scenarios';
import type {
  CountScan,
  ElliottTask,
  EwCorrectionType,
  EwDirection,
  EwPrimaryScenario,
  EwScenarioId,
  EwShape,
  EwTaskKind,
  WaveCount,
} from './types';

export const ewLimit = (tf: TaskTimeframe): number => TIME_LIMIT_CANDLES[tf];
/** Хвост после события в проигрывании. */
export const EW_REPLAY_TAIL = 10;
export const EW_VISIBLE = 500;

export const EW_TFS: Record<EwTaskKind, TaskTimeframe[]> = {
  'ew-impulse': ['1h', '4h'],
  'ew-impulse-correction': ['15m', '1h', '4h'],
  'ew-scenario': ['15m', '1h', '4h'],
};

export const EW_KIND_BY_DIFFICULTY = { easy: 'ew-impulse', medium: 'ew-impulse-correction', hard: 'ew-scenario' } as const satisfies Record<string, EwTaskKind>;

export const EW_SHAPES: Record<EwTaskKind, EwShape[]> = {
  'ew-impulse': ['impulse-6'],
  'ew-impulse-correction': ['impulse-6+correction'],
  'ew-scenario': ['impulse-3', 'impulse-5', 'impulse-6', 'impulse-6+correction'],
};

export interface EwMode {
  nPivot: number;
  withCorrection: boolean;
  minSizeAtr: number;
  minWaveAtr: number;
  minGuides: number;
}
export const EW_MODE: Record<EwTaskKind, EwMode> = {
  'ew-impulse': { nPivot: 7, withCorrection: false, minSizeAtr: 6, minWaveAtr: 1, minGuides: 2 },
  'ew-impulse-correction': { nPivot: 5, withCorrection: true, minSizeAtr: 6, minWaveAtr: 1, minGuides: 0 },
  'ew-scenario': { nPivot: 5, withCorrection: false, minSizeAtr: 5, minWaveAtr: 0, minGuides: 0 },
};

/** Запечатываемые параметры эталона (ELLIOTT.md §9.5). */
export interface EwRefParams {
  kind: EwTaskKind;
  tf: TaskTimeframe;
  nPivot: number;
  nPoint: number;
  window: { fromTime: UtcMs; toTime: UtcMs };
  lastPivot: { index: number; time: UtcMs };
  refCount: { times: UtcMs[]; type: EwCorrectionType | null; dir: EwDirection };
  invTol: number;
}

export interface EwRef {
  params: EwRefParams;
  kind: EwTaskKind;
  tf: TaskTimeframe;
  /** Индекс последней видимой свечи. */
  T: number;
  fromIndex: number;
  lastPivot: { index: number; time: UtcMs; type: 'high' | 'low'; price: number };
  /** Основной эталон. */
  count: WaveCount;
  /** До 3 разметок с разными сценариями (первая - основной эталон). */
  references: WaveCount[];
  scan: CountScan;
  atrT: number;
  invTol: number;
  primary: EwPrimaryScenario;
  alternative: EwScenarioId;
  limit: number;
}

/** Разметка из времён точек (реальные цены свечей); null - не проходит проверки точек и правил. */
export function countFromTimes(
  candles: readonly Candle[],
  tf: TaskTimeframe,
  times: readonly UtcMs[],
  type: EwCorrectionType | null,
  dir: EwDirection,
): WaveCount | null {
  const step = TIMEFRAME_MS[tf];
  const idx = times.map((t) => candleIndexAt(candles, t, step));
  if (idx.some((i) => i < 0) || times.length < 3) return null;
  const nImp = type ? times.length - 3 : times.length;
  if (![3, 5, 6].includes(nImp)) return null;
  const sg = dir === 'bull' ? 1 : -1;
  const anchors = idx.map((j, k) => {
    const c = candles[j]!;
    return { time: c.openTime, price: sideAt(sg, k < nImp ? k : 6 + (k - nImp)) === 'low' ? c.low : c.high };
  });
  const chk = checkCount({
    candles, tf, toleranceCandles: 0,
    impulse: anchors.slice(0, nImp),
    correction: type ? { type, anchors: anchors.slice(nImp) } : null,
  });
  if (chk.orderBroken || !chk.count) return null;
  if (chk.errors.some((e) => e.severity === 'major')) return null;
  return chk.count;
}

/** Эталон по запечатанным параметрам: null - расхождение (сервер: 500). */
export function buildEwRef(visible: readonly Candle[], params: EwRefParams): EwRef | null {
  const { tf } = params;
  const step = TIMEFRAME_MS[tf];
  const T = visible.length - 1;
  if (T < 50) return null;
  const fromIndex = candleIndexAt(visible, params.window.fromTime, step);
  const toIndex = candleIndexAt(visible, params.window.toTime, step);
  if (fromIndex < 0 || toIndex !== T) return null;
  const count = countFromTimes(visible, tf, params.refCount.times, params.refCount.type, params.refCount.dir);
  if (!count) return null;
  const pts = countPoints(count);
  const lastP = pts[pts.length - 1]!;
  if (lastP.time !== params.lastPivot.time || lastP.index !== params.lastPivot.index) return null;
  const atrT = atrOf(visible)[T];
  if (atrT === null || atrT === undefined) return null;
  const invTol = 0.25 * atrT;
  if (Math.abs(invTol - params.invTol) > 1e-9 * Math.max(1, invTol)) return null;
  const scan = enumerateCounts(visible, { nPoint: params.nPoint, fromIndex, lastIndex: lastP.index, maxCounts: EW_MAX_COUNTS });
  const primary = count.scenario as EwPrimaryScenario;
  if (primary === ('bc-next' as string)) return null;
  const sg = count.direction === 'bull' ? 1 : -1;
  const pos = pts.length - 1;
  const type = sideAt(sg, pos);
  const references: WaveCount[] = [count];
  if (params.kind === 'ew-scenario') {
    const seen = new Set<string>([count.scenario]);
    for (const c of scan.counts) {
      if (references.length >= 3) break;
      if (seen.has(c.scenario) || c.scenario === 'w3-next') continue;
      seen.add(c.scenario);
      references.push(c);
    }
  }
  const bc = (scan.byScenario['bc-next'] ?? 0) > 0;
  return {
    params, kind: params.kind, tf, T, fromIndex,
    lastPivot: { index: lastP.index, time: lastP.time, type, price: lastP.price },
    count, references, scan, atrT, invTol, primary,
    alternative: defaultAlternative(primary, bc),
    limit: ewLimit(tf),
  };
}

/** Payload next (время - реальное; сервер сдвигает шкалу). */
export function ewTaskPayload(ref: EwRef): ElliottTask {
  const easy = ref.kind === 'ew-impulse';
  return {
    kind: ref.kind,
    tf: ref.tf,
    window: { ...ref.params.window },
    lastPivot: { time: ref.lastPivot.time, type: ref.lastPivot.type, price: ref.lastPivot.price },
    directionHint: easy ? ref.count.direction : null,
    shapes: [...EW_SHAPES[ref.kind]],
    primaryOptions: [...EW_PRIMARY_OPTIONS],
    alternativeOptions: [...EW_ALTERNATIVE_OPTIONS],
    alternativeRequired: !easy,
    nPoint: EW_N_POINT,
    toleranceCandles: EW_TOLERANCE_CANDLES,
    invalidationTolerance: ref.invTol,
    limitCandles: ref.limit,
    tools: ['ew-impulse', 'ew-zigzag', 'ew-flat', 'hline'],
    ...(easy ? { hints: { liveRules: true as const } } : {}),
  };
}
