// Генерация заданий Elliott (ELLIOTT.md §8, §9): каталог кандидатов по сегменту ряда и сборка задания с проверками.
import { detectSwings } from '../smc/swings';
import { candleIndexAt } from '../smc/series';
import { mulberry32, randInt } from '../rng';
import { TIMEFRAME_MS } from '../types';
import type { Candle, TaskTimeframe, UtcMs } from '../types';
import { findWaveCandidates, zigzagPivots } from './candidates';
import { atrOf, EW_N_POINT } from './check';
import { enumerateCounts, EW_MAX_COUNTS } from './enumerate';
import { impulseRules, normSeries, priceOrderViolation, segmentViolation, sgOf, vAt } from './measure';
import { buildEwRef, EW_MODE, EW_VISIBLE, ewLimit, type EwRef, type EwRefParams } from './ref';
import { countPoints, scenarioRule } from './scenarios';
import type { EwCorrectionType, EwDirection, EwTaskKind, WaveCount } from './types';

/** Запись каталога: время - единственная связь с рядом (индексы зависят от нарезки). */
export interface EwCatalogEntry {
  kind: EwTaskKind;
  tf: TaskTimeframe;
  /** Время (openTime) последней точки эталона / последнего swing (hard). */
  lastPivotTime: UtcMs;
  /** Время свечи, на которой последняя точка подтверждена. */
  confirmTime: UtcMs;
  refTimes: UtcMs[];
  corrType: EwCorrectionType | null;
  dir: EwDirection | null;
}

/** Непрерывные отрезки ряда (границы пропусков). */
export function contiguousRuns(candles: readonly Candle[], step: number): [number, number][] {
  const runs: [number, number][] = [];
  let s = 0;
  for (let i = 1; i <= candles.length; i++) {
    if (i === candles.length || candles[i]!.openTime - candles[i - 1]!.openTime !== step) {
      if (i > s) runs.push([s, i]);
      s = i;
    }
  }
  return runs;
}

const isContiguous = (c: readonly Candle[], a: number, b: number, step: number): boolean => c[b]!.openTime - c[a]!.openTime === (b - a) * step;

/** Каталог кандидатов сегмента ряда (закрытые свечи). relaxed - ослабление критерия сложности (§8). Порядок - по времени. */
export function ewCatalog(candles: readonly Candle[], tf: TaskTimeframe, kind: EwTaskKind, relaxed = false): EwCatalogEntry[] {
  const step = TIMEFRAME_MS[tf];
  const mode = EW_MODE[kind];
  const out: EwCatalogEntry[] = [];
  for (const [from, to] of contiguousRuns(candles, step)) {
    const seg = candles.slice(from, to);
    if (seg.length < 60) continue;
    if (kind === 'ew-scenario') {
      for (const s of detectSwings(seg, { left: EW_N_POINT, right: EW_N_POINT })) {
        if (s.index < 30) continue;
        out.push({ kind, tf, lastPivotTime: s.time, confirmTime: seg[s.index + EW_N_POINT]!.openTime, refTimes: [], corrType: null, dir: null });
      }
      continue;
    }
    const minGuides = relaxed && kind === 'ew-impulse' ? 0 : mode.minGuides;
    for (const c of findWaveCandidates(seg, { ...mode, minGuides })) {
      if (c.confirmedIndex >= seg.length) continue;
      const pts = countPoints(c.count);
      out.push({
        kind, tf,
        lastPivotTime: pts[pts.length - 1]!.time,
        confirmTime: seg[c.confirmedIndex]!.openTime,
        refTimes: pts.map((p) => p.time),
        corrType: c.count.correction?.type ?? null,
        dir: c.count.direction,
      });
    }
  }
  return out.sort((a, b) => a.lastPivotTime - b.lastPivotTime);
}

export interface EwPick {
  kind: EwTaskKind;
  tf: TaskTimeframe;
  /** openTime следующей (первой невидимой) свечи: момент решения. */
  T: UtcMs;
  /** Индекс последней видимой свечи в исходном ряду. */
  iT: number;
  visible: Candle[];
  future: Candle[];
  params: EwRefParams;
  ref: EwRef;
}

// ---------------------------------------------------------------- ловушка hard (§9.4 п.4)

/** Соблазнительная 5/6-точечная последовательность подряд идущих pivot, нарушающая ровно одно правило §4.1. */
function pivotTrap(visible: readonly Candle[], fromIndex: number, to: number): boolean {
  const piv = zigzagPivots(visible.slice(0, to + 1), EW_N_POINT).filter((p) => p.index >= fromIndex);
  for (let k = 0; k + 5 <= piv.length; k++) {
    for (const len of [5, 6]) {
      if (k + len > piv.length) continue;
      const dir: EwDirection = piv[k]!.type === 'low' ? 'bull' : 'bear';
      const sg = sgOf(dir);
      const ns = normSeries(visible, sg);
      const idx = piv.slice(k, k + len).map((p) => p.index);
      const v = idx.map((j, pos) => vAt(ns, pos, j));
      if (priceOrderViolation(v) !== null) continue;
      let ok = true;
      for (let q = 0; q + 1 < len && ok; q++) if (segmentViolation(ns, q, idx[q]!, idx[q + 1]!).length > 0) ok = false;
      if (!ok) continue;
      if (impulseRules(v, sg).filter((r) => !r.ok).length === 1) return true;
    }
  }
  return false;
}

/** Пик/дно с фитилём за точкой 3/5 эталона без закрытия за ней (в пределах видимого ряда). */
function wickTrap(visible: readonly Candle[], count: WaveCount): boolean {
  const pts = countPoints(count);
  const sg = sgOf(count.direction);
  const ns = normSeries(visible, sg);
  const T = visible.length - 1;
  for (const k of [3, 5]) {
    const p = pts[k];
    if (!p || k >= count.impulse.length) continue;
    const level = sg * p.price;
    let wick = false;
    let closed = false;
    for (let j = p.index + 1; j <= T; j++) {
      if (k === 3 && j <= (pts[4]?.index ?? p.index)) continue;
      if (ns.hi[j]! > level) wick = true;
      if (sg * visible[j]!.close > level) closed = true;
    }
    if (wick && !closed) return true;
  }
  return false;
}

const MAIN_5PLUS = new Set(['w5-next', 'abc-next', 'trend-next']);

/**
 * Сборка задания из записи каталога. `series` - ряд с контекстом слева и будущим справа (может содержать пропуски).
 * Детерминирована по seed. null - запись непригодна (пропуск в видимом ряду или лимите, сработали триггеры и т.д.).
 */
export function ewMakeTask(series: readonly Candle[], tf: TaskTimeframe, entry: EwCatalogEntry, seed: number, relaxed = false): EwPick | null {
  const step = TIMEFRAME_MS[tf];
  const kind = entry.kind;
  const mode = EW_MODE[kind];
  const limit = ewLimit(tf);
  const iL = candleIndexAt(series, entry.lastPivotTime, step);
  const iConfirm = candleIndexAt(series, entry.confirmTime, step);
  if (iL < 0 || iConfirm < 0) return null;
  const rng = mulberry32((seed ^ Math.imul(entry.lastPivotTime / 1000 | 0, 0x9e3779b1)) | 0);
  const u0 = randInt(rng, 4);
  const pad = 10 + randInt(rng, 21);
  const W = 80 + randInt(rng, 121);
  for (let u = u0; u >= 0; u--) {
    const iT = iConfirm + u;
    const start = iT - (EW_VISIBLE - 1);
    const end = iT + limit;
    if (start < 0 || end >= series.length) continue;
    if (!isContiguous(series, start, end, step)) continue; // пропуск данных в видимом ряду или лимите проигрывания (§19)
    const visible = series.slice(start, iT + 1);
    const future = series.slice(iT + 1, end + 1);
    const pick = tryBuild(visible, future, tf, entry, relaxed, mode.nPivot, { pad, W }, iL - start);
    if (pick) return { ...pick, iT, T: series[iT]!.openTime + step };
  }
  return null;
}

type Partial0 = Omit<EwPick, 'iT' | 'T'>;

function tryBuild(
  visible: Candle[],
  future: Candle[],
  tf: TaskTimeframe,
  entry: EwCatalogEntry,
  relaxed: boolean,
  nPivot: number,
  rnd: { pad: number; W: number },
  lastIdx: number,
): Partial0 | null {
  const kind = entry.kind;
  const T = visible.length - 1;
  const atr = atrOf(visible);
  const a0 = atr[T];
  if (a0 === null || a0 === undefined) return null;
  let fromIndex: number;
  let times: UtcMs[];
  let type: EwCorrectionType | null;
  let dir: EwDirection;

  if (kind === 'ew-scenario') {
    fromIndex = Math.max(0, T - rnd.W);
    if (lastIdx - fromIndex < 20) return null;
    const scan = enumerateCounts(visible, { nPoint: EW_N_POINT, fromIndex, lastIndex: lastIdx, maxCounts: EW_MAX_COUNTS });
    if (scan.truncated) return null;
    const big = scan.counts.filter((c) => c.scenario !== 'w3-next');
    const scenarios = new Set(big.map((c) => c.scenario));
    const six = big.some((c) => c.impulse.length === 6);
    if (relaxed ? !six : scenarios.size < 2) return null;
    const top = big[0];
    if (!top) return null;
    if (!relaxed) {
      const a = atr[top.impulse[0]!.index];
      if (a === null || a === undefined || top.amplitude / a < 5) return null;
    }
    const main = big.find((c) => MAIN_5PLUS.has(c.scenario));
    if (!main) return null;
    const pts = countPoints(main);
    times = pts.map((p) => p.time);
    type = main.correction?.type ?? null;
    dir = main.direction;
  } else {
    times = entry.refTimes;
    type = entry.corrType;
    dir = entry.dir!;
    const step = TIMEFRAME_MS[tf];
    const i0 = candleIndexAt(visible, times[0]!, step);
    if (i0 < 0) return null;
    // окно [i0 - pad, T], pad ∈ [10, 30] по seed; P0 (на easy и P5) - крайний экстремум окна своей стороны: pad уменьшается, пока условие не выполнится
    const sg0 = dir === 'bull' ? 1 : -1;
    const ns0 = normSeries(visible, sg0);
    const p0v = ns0.lo[i0]!;
    const i5 = candleIndexAt(visible, times[5]!, step);
    const p5v = ns0.hi[i5]!;
    const okWin = (from: number): boolean => {
      for (let j = from; j <= T; j++) {
        if (ns0.lo[j]! < p0v) return false;
        if (kind === 'ew-impulse' && ns0.hi[j]! > p5v) return false;
      }
      return true;
    };
    let pad = rnd.pad;
    while (pad >= 10 && !okWin(Math.max(0, i0 - pad))) pad--;
    if (pad < 10) return null;
    fromIndex = Math.max(0, i0 - pad);
  }

  const params: EwRefParams = {
    kind, tf, nPivot, nPoint: EW_N_POINT,
    window: { fromTime: visible[fromIndex]!.openTime, toTime: visible[T]!.openTime },
    lastPivot: { index: lastIdx, time: visible[lastIdx]!.openTime },
    refCount: { times, type, dir },
    invTol: 0.25 * a0,
  };
  const ref = buildEwRef(visible, params);
  if (!ref) return null;

  // (lastIdx, T]: нет цены за последней точкой, не сработал ни один триггер, не подтверждён новый swing nPoint
  const sg = sgOf(ref.count.direction);
  const ns = normSeries(visible, sg);
  const lastSide = ref.lastPivot.type;
  for (let j = lastIdx + 1; j <= T; j++) {
    const c = visible[j]!;
    if (lastSide === 'high' ? c.high > ref.lastPivot.price : c.low < ref.lastPivot.price) return null;
  }
  const rule = scenarioRule(ref.count, ref.primary, ref.alternative);
  if (!rule) return null;
  for (let j = lastIdx + 1; j <= T; j++) {
    if (rule.invalidatedBy(ns.lo[j]!, ns.hi[j]!) || rule.primaryClosed(sg * visible[j]!.close) || (rule.altClosed && rule.altClosed(sg * visible[j]!.close))) return null;
  }
  for (const s of detectSwings(visible, { left: EW_N_POINT, right: EW_N_POINT })) if (s.index > lastIdx && s.index <= T) return null;

  if (kind === 'ew-scenario' && !relaxed) {
    if (!pivotTrap(visible, fromIndex, T) && !wickTrap(visible, ref.count)) return null;
  }
  return { kind, tf, visible, future, params, ref };
}
