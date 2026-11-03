// analyzeStructure (ALGORITHMS §3): внешний + внутренний слой, sweep, OB, FVG.
import { ANALYSIS_ALGO_VERSION } from '../version';
import type {
  Candle,
  LayerState,
  StructureEvent,
  StructureParams,
  StructureResult,
  Swing,
  Timeframe,
} from '../types';
import { detectFvgs } from './fvg';
import { detectOrderBlocks } from './orderblock';
import { closedOnly, gaps, inferTimeframe, lastSegmentStart } from './series';
import { runExternalLayer, runInternalLayer } from './structure';
import { detectSweeps } from './sweeps';
import { detectSwings, labelSwings, pendingSwings } from './swings';

export const EMPTY_LAYER: LayerState = { trend: 'none', refHigh: null, refLow: null, lastEvent: null };

export interface AnalyzeOptions {
  /** ТФ ряда для поиска пропусков; по умолчанию определяется по длительности свечи. */
  tf?: Timeframe;
}

const typeOrder = (s: Swing) => (s.type === 'high' ? 0 : 1);
const scopeOrder = (s: Swing) => (s.scope === 'external' ? 0 : 1);

export function analyzeStructure(
  candles: readonly Candle[],
  p: StructureParams,
  opts: AnalyzeOptions = {},
): StructureResult {
  const closed = closedOnly(candles);
  const tf = opts.tf ?? inferTimeframe(closed);
  const base = tf ? lastSegmentStart(closed, tf) : 0;
  const gapList = tf ? gaps(closed, tf) : [];
  const seg = base === 0 ? closed : closed.slice(base);

  // ---- swing и метки ----
  const ext = detectSwings(seg, { left: p.nExt, right: p.nExt }, 'external');
  labelSwings(ext).forEach((l, i) => (ext[i]!.label = l));
  const intAll = p.nInt === null ? [] : detectSwings(seg, { left: p.nInt, right: p.nInt }, 'internal');
  labelSwings(intAll).forEach((l, i) => (intAll[i]!.label = l));
  const extKey = new Set(ext.map((s) => `${s.index}:${s.type}`));
  const intOnly = intAll.filter((s) => !extKey.has(`${s.index}:${s.type}`));

  // ---- слои ----
  const extRun = runExternalLayer(seg, ext);
  const intRun = p.nInt === null ? null : runInternalLayer(seg, intAll);
  const suppressed = new Set(extRun.events.map((e) => `${e.breakIndex}:${e.direction}`));
  const intEvents = (intRun?.events ?? []).filter((e) => !suppressed.has(`${e.breakIndex}:${e.direction}`));
  const events: StructureEvent[] = [...extRun.events, ...intEvents].sort((a, b) => a.breakIndex - b.breakIndex);
  // sort стабилен: при равном breakIndex внешние (добавлены первыми) остаются раньше внутренних

  // ---- sweep, FVG, OB ----
  const sw = detectSweeps(seg, ext, p.sweepHoldK);
  const fv = detectFvgs(seg, p.fvgMinAtr);
  const obs = detectOrderBlocks(seg, extRun.events, fv.fvgs, p.obDisplacementAtr);

  // ---- кандидаты swing справа ----
  const pend = pendingSwings(seg, { left: p.nExt, right: p.nExt }, 'external');
  if (p.nInt !== null) {
    const pk = new Set(pend.map((s) => `${s.index}:${s.type}`));
    for (const s of pendingSwings(seg, { left: p.nInt, right: p.nInt }, 'internal')) {
      if (!pk.has(`${s.index}:${s.type}`)) pend.push(s);
    }
    pend.sort((a, b) => a.index - b.index || typeOrder(a) - typeOrder(b) || scopeOrder(a) - scopeOrder(b));
  }

  const swings = [...ext, ...intOnly].sort(
    (a, b) => a.index - b.index || typeOrder(a) - typeOrder(b) || scopeOrder(a) - scopeOrder(b),
  );

  // ---- сдвиг индексов в систему входного массива ----
  if (base > 0) {
    const seen = new Set<object>();
    const shiftSwing = (s: Swing) => {
      if (seen.has(s)) return;
      seen.add(s);
      s.index += base;
      s.confirmedIndex += base;
    };
    const shiftEvent = (e: StructureEvent) => {
      if (seen.has(e)) return;
      seen.add(e);
      e.brokenSwing.index += base;
      e.breakIndex += base;
    };
    [...ext, ...intAll, ...pend].forEach(shiftSwing);
    [...extRun.events, ...(intRun?.events ?? [])].forEach(shiftEvent);
    for (const s of [...sw.confirmed, ...sw.candidates]) {
      s.index += base;
      if (s.confirmedIndex !== null) s.confirmedIndex += base;
    }
    for (const f of [...fv.fvgs, ...fv.small]) {
      f.middleIndex += base;
      if (f.statusIndex !== null) f.statusIndex += base;
    }
    for (const o of obs) {
      o.index += base;
      o.originIndex += base;
      if (o.statusIndex !== null) o.statusIndex += base;
    }
  }

  const snapExt = extRun.snapshots;
  const snapInt = intRun?.snapshots ?? null;
  const stateAt = (index: number) => {
    const i = Math.min(index - base, snapExt.length - 1);
    if (i < 0) return { external: EMPTY_LAYER, internal: snapInt ? EMPTY_LAYER : null };
    return { external: snapExt[i]!, internal: snapInt ? snapInt[i]! : null };
  };

  const result: StructureResult = {
    algoVersion: ANALYSIS_ALGO_VERSION,
    params: p,
    swings,
    events,
    sweeps: sw.confirmed,
    sweepCandidates: sw.candidates,
    orderBlocks: obs,
    fvgs: fv.fvgs,
    smallFvgs: fv.small,
    pendingSwings: pend,
    state: stateAt(closed.length - 1),
    stateAt,
    gaps: gapList,
    baseIndex: base,
    times: closed.map((c) => c.openTime),
    closes: closed.map((c) => c.close),
  };
  // доступ ко всем swing внутреннего слоя (включая совпадающие с внешними) нужен для refsAt
  allSwingsMap.set(result, [...ext, ...intAll]);
  return result;
}

/** Все swing обоих слоёв (с confirmedIndex своего слоя) — для refsAt; не часть публичного результата. */
const allSwingsMap = new WeakMap<StructureResult, Swing[]>();
export function allLayerSwings(r: StructureResult): Swing[] {
  return allSwingsMap.get(r) ?? r.swings;
}
