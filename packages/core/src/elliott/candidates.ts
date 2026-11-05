// findWaveCandidates (ELLIOTT.md §7.2): чистые импульсы (6 подряд pivot) с коррекцией или без - участки для easy/medium.
import { detectSwings } from '../smc/swings';
import type { Candle, SwingType } from '../types';
import { atrOf } from './check';
import {
  LABELS,
  correctionRules,
  impulseGuides,
  impulseRules,
  measure,
  normSeries,
  priceOrderViolation,
  segmentViolation,
  sgOf,
  validCorrectionTypes,
} from './measure';
import type { EwDirection, WaveCandidate, WaveCount, WavePoint } from './types';

export interface CandidateParams {
  nPivot: number;
  withCorrection: boolean;
  minSizeAtr: number;
  minWaveAtr: number;
  minGuides: number;
}

interface Pivot {
  index: number;
  type: SwingType;
}

/** Чередующаяся последовательность pivot: подряд идущие одного типа сжимаются в более экстремальный (при равенстве - ранний). */
export function zigzagPivots(candles: readonly Candle[], n: number): Pivot[] {
  const out: Pivot[] = [];
  for (const s of detectSwings(candles, { left: n, right: n })) {
    const last = out[out.length - 1];
    if (last && last.type === s.type) {
      const c = candles[last.index]!;
      const better = s.type === 'high' ? candles[s.index]!.high > c.high : candles[s.index]!.low < c.low;
      if (better) out[out.length - 1] = { index: s.index, type: s.type };
    } else out.push({ index: s.index, type: s.type });
  }
  return out;
}

export function findWaveCandidates(candles: readonly Candle[], p: CandidateParams): WaveCandidate[] {
  const pivots = zigzagPivots(candles, p.nPivot);
  const atr = atrOf(candles);
  const out: WaveCandidate[] = [];
  const need = p.withCorrection ? 9 : 6;
  for (let k = 0; k + need <= pivots.length; k++) {
    const startType = pivots[k]!.type;
    const dir: EwDirection = startType === 'low' ? 'bull' : 'bear';
    const sg = sgOf(dir);
    const ns = normSeries(candles, sg);
    const idx = pivots.slice(k, k + need).map((x) => x.index);
    const v = idx.map((j, pos) => (pos % 2 === 0 ? ns.lo[j]! : ns.hi[j]!));
    if (idx.some((j, q) => q > 0 && j <= idx[q - 1]!)) continue;
    const vi = v.slice(0, 6);
    if (priceOrderViolation(vi) !== null) continue;
    let ok = true;
    for (let q = 0; q < 5 && ok; q++) if (segmentViolation(ns, q, idx[q]!, idx[q + 1]!).length > 0) ok = false;
    if (!ok || !impulseRules(vi, sg).every((r) => r.ok)) continue;
    if (!(vi[5]! > vi[3]!)) continue; // без truncation
    const a0 = atr[idx[0]!];
    if (a0 === null || a0 === undefined) continue;
    const m6 = measure(vi);
    const size = (vi[5]! - vi[0]!) / a0;
    if (size < p.minSizeAtr) continue;
    if (m6.L.some((l) => l < p.minWaveAtr * a0)) continue;
    const guides = impulseGuides(m6, vi, idx.slice(0, 6)).filter((g) => g.ok).length;
    if (guides < p.minGuides) continue;

    let corrType: 'zigzag' | 'flat' | null = null;
    let corrRetr: number | null = null;
    if (p.withCorrection) {
      const vAll = v;
      if (priceOrderViolation(vAll) !== null) continue;
      let cok = true;
      for (let q = 5; q < 8 && cok; q++) if (segmentViolation(ns, q, idx[q]!, idx[q + 1]!).length > 0) cok = false;
      if (!cok) continue;
      const m9 = measure(vAll);
      const types = validCorrectionTypes(m9);
      if (types.length === 0 || !correctionRules(types[0]!, m9).every((r) => r.ok)) continue;
      if (!(m9.corrRetr! >= 0.236 && m9.corrRetr! < 1)) continue;
      corrType = types[0]!;
      corrRetr = m9.corrRetr!;
    }
    const pts = (from: number, to: number): WavePoint[] =>
      idx.slice(from, to).map((j, q) => ({ index: j, time: candles[j]!.openTime, price: sg * v[from + q]!, label: LABELS[from + q]! }));
    const count: WaveCount = {
      direction: dir,
      impulse: pts(0, 6),
      correction: corrType ? { type: corrType, points: pts(6, 9) } : null,
      scenario: corrType ? 'trend-next' : 'abc-next',
      amplitude: Math.max(...v) - Math.min(...v),
    };
    out.push({ count, size, guides, corrRetr, confirmedIndex: idx[need - 1]! + p.nPivot });
  }
  return out;
}
