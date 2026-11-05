// Нормированные ряды, измерения волн, правила (§4) и рекомендации (§5). Все формулы - в нормированных ценах v = sg * price.
import type { Candle } from '../types';
import type { EwCorrectionType, EwDirection, EwGuideCheck, EwGuideId, EwRuleCheck } from './types';

export const sgOf = (dir: EwDirection): 1 | -1 => (dir === 'bull' ? 1 : -1);

/** Нормированные high/low: bull - как есть, bear - зеркально (hi = -low, lo = -high). */
export interface NormSeries {
  sg: 1 | -1;
  hi: Float64Array;
  lo: Float64Array;
}
const cache = new WeakMap<readonly Candle[], { 1?: NormSeries; '-1'?: NormSeries }>();
export function normSeries(candles: readonly Candle[], sg: 1 | -1): NormSeries {
  let e = cache.get(candles);
  if (!e) {
    e = {};
    cache.set(candles, e);
  }
  const key = sg === 1 ? 1 : '-1';
  const hit = e[key];
  if (hit) return hit;
  const n = candles.length;
  const hi = new Float64Array(n);
  const lo = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const c = candles[i]!;
    hi[i] = sg === 1 ? c.high : -c.low;
    lo[i] = sg === 1 ? c.low : -c.high;
  }
  const ns = { sg, hi, lo };
  e[key] = ns;
  return ns;
}

/** Позиции 0,2,4,6,8 (0,2,4,A,C) - v-low; 1,3,5,7 (1,3,5,B) - v-high. */
export const isLowPos = (pos: number): boolean => pos % 2 === 0;
/** Нормированная цена экстремума свечи i для позиции pos. */
export const vAt = (ns: NormSeries, pos: number, i: number): number => (isLowPos(pos) ? ns.lo[i]! : ns.hi[i]!);
/** Сторона свечи (реальная цена) для позиции pos. */
export const sideAt = (sg: 1 | -1, pos: number): 'low' | 'high' => ((isLowPos(pos) ? sg > 0 : sg < 0) ? 'low' : 'high');

export const LABELS = ['0', '1', '2', '3', '4', '5', 'A', 'B', 'C'] as const;

// ------------------------------------------------------------------ экстремумы сегментов (§3 п.2)

export interface ExtremeViolation {
  /** Позиция точки, которая не экстремум. */
  pos: number;
  /** Позиции границ сегмента, на котором нарушение найдено. */
  seg: [number, number];
  index: number;
}

/** Нарушения экстремума на сегменте [s..e] (позиции ps, ps+1): сначала начало, затем конец; пустой массив - сегмент корректен. */
export function segmentViolation(ns: NormSeries, ps: number, s: number, e: number): ExtremeViolation[] {
  const upWave = isLowPos(ps); // из v-low в v-high
  let startBest = vAt(ns, ps, s);
  let endBest = vAt(ns, ps + 1, e);
  let startBad = -1;
  let endBad = -1;
  for (let j = s; j <= e; j++) {
    if (upWave) {
      if (ns.lo[j]! < startBest) {
        startBest = ns.lo[j]!;
        startBad = j;
      }
      if (ns.hi[j]! > endBest) {
        endBest = ns.hi[j]!;
        endBad = j;
      }
    } else {
      if (ns.hi[j]! > startBest) {
        startBest = ns.hi[j]!;
        startBad = j;
      }
      if (ns.lo[j]! < endBest) {
        endBest = ns.lo[j]!;
        endBad = j;
      }
    }
  }
  const out: ExtremeViolation[] = [];
  if (startBad >= 0) out.push({ pos: ps, seg: [ps, ps + 1], index: startBad });
  if (endBad >= 0) out.push({ pos: ps + 1, seg: [ps, ps + 1], index: endBad });
  return out;
}

// ------------------------------------------------------------------ измерения

export interface Measures {
  /** L1..L5 (по имеющимся точкам). */
  L: number[];
  r2: number | null;
  r3: number | null;
  r4: number | null;
  /** L5 / L1. */
  w5a: number | null;
  /** L5 / (v3 - v0). */
  w5b: number | null;
  extended3: boolean | null;
  a: number | null;
  retrB: number | null;
  cBeyond: number | null;
  cLen: number | null;
  corrRetr: number | null;
}

/** v - нормированные цены точек в порядке позиций (0..2, 0..4, 0..5, +A,B,C). */
export function measure(v: readonly number[]): Measures {
  const n = v.length;
  const L: number[] = [];
  if (n >= 2) L.push(v[1]! - v[0]!);
  if (n >= 3) L.push(v[1]! - v[2]!);
  if (n >= 4) L.push(v[3]! - v[2]!);
  if (n >= 5) L.push(v[3]! - v[4]!);
  if (n >= 6) L.push(v[5]! - v[4]!);
  const m: Measures = {
    L,
    r2: n >= 3 ? L[1]! / L[0]! : null,
    r3: n >= 4 ? L[2]! / L[0]! : null,
    r4: n >= 5 ? L[3]! / L[2]! : null,
    w5a: n >= 6 ? L[4]! / L[0]! : null,
    w5b: n >= 6 ? L[4]! / (v[3]! - v[0]!) : null,
    extended3: n >= 6 ? L[2]! >= 1.618 * Math.max(L[0]!, L[4]!) : null,
    a: null,
    retrB: null,
    cBeyond: null,
    cLen: null,
    corrRetr: null,
  };
  if (n >= 9) {
    const a = v[5]! - v[6]!;
    m.a = a;
    m.retrB = (v[7]! - v[6]!) / a;
    m.cBeyond = (v[6]! - v[8]!) / a;
    m.cLen = (v[7]! - v[8]!) / a;
    m.corrRetr = (v[5]! - v[8]!) / (v[5]! - v[0]!);
  }
  return m;
}

/** Первая пара соседних позиций, нарушающая чередование/порядок цен: v должен идти вверх на чётных позициях и вниз на нечётных. */
export function priceOrderViolation(v: readonly number[]): number | null {
  for (let k = 0; k + 1 < v.length; k++) {
    const ok = k % 2 === 0 ? v[k + 1]! > v[k]! : v[k]! > v[k + 1]!;
    if (!ok) return k;
  }
  return null;
}

// ------------------------------------------------------------------ правила §4

export function impulseRules(v: readonly number[], sg: 1 | -1): EwRuleCheck[] {
  const n = v.length;
  const out: EwRuleCheck[] = [];
  const raw = (x: number) => sg * x || 0; // без -0
  if (n >= 3) out.push({ rule: 'w2', ok: !(v[2]! < v[0]!), actual: raw(v[2]!), limit: raw(v[0]!) });
  if (n >= 4) out.push({ rule: 'w3-beyond-w1', ok: v[3]! > v[1]!, actual: raw(v[3]!), limit: raw(v[1]!) });
  if (n >= 6) {
    const L1 = v[1]! - v[0]!;
    const L3 = v[3]! - v[2]!;
    const L5 = v[5]! - v[4]!;
    out.push({ rule: 'w3-shortest', ok: !(L3 < L1 && L3 < L5), actual: L3, limit: Math.min(L1, L5) });
  }
  if (n >= 5) out.push({ rule: 'w4-overlap', ok: v[4]! > v[1]!, actual: raw(v[4]!), limit: raw(v[1]!) });
  return out;
}

export function correctionRules(type: EwCorrectionType, m: Measures): EwRuleCheck[] {
  const { retrB, cBeyond } = m;
  if (retrB === null || cBeyond === null) return [];
  return type === 'zigzag'
    ? [
        { rule: 'zigzag-b', ok: retrB < 1, actual: retrB, limit: 1 },
        { rule: 'zigzag-c', ok: cBeyond > 0, actual: cBeyond, limit: 0 },
      ]
    : [
        { rule: 'flat-b', ok: retrB >= 0.9, actual: retrB, limit: 0.9 },
        { rule: 'flat-c', ok: cBeyond >= -0.1, actual: cBeyond, limit: -0.1 },
      ];
}

export function validCorrectionTypes(m: Measures): EwCorrectionType[] {
  const out: EwCorrectionType[] = [];
  for (const t of ['zigzag', 'flat'] as const) if (correctionRules(t, m).every((r) => r.ok)) out.push(t);
  return out;
}

// ------------------------------------------------------------------ рекомендации §5

const within = (x: number, target: number): boolean => Math.abs(x - target) <= 0.1 * target;
const f3 = (x: number): number => Math.round(x * 1000) / 1000;

/** Рекомендации импульса. `idx` - индексы свечей точек (для чередования по времени). */
export function impulseGuides(m: Measures, v: readonly number[], idx: readonly number[]): EwGuideCheck[] {
  const out: EwGuideCheck[] = [];
  const n = v.length;
  if (n >= 3) out.push({ guide: 'w2-depth', ok: m.r2! >= 0.46 && m.r2! <= 0.658, actual: m.r2!, expected: '0.46–0.658' });
  if (n >= 4) out.push({ guide: 'w3-ratio', ok: m.r3! >= 1.4562, actual: m.r3!, expected: '≥ 1.456' });
  if (n >= 5) out.push({ guide: 'w4-depth', ok: m.r4! >= 0.196 && m.r4! <= 0.422, actual: m.r4!, expected: '0.196–0.422' });
  if (n >= 6) {
    const ok = Math.abs(m.w5a! - 1) <= 0.1 || Math.abs(m.w5b! - 0.618) <= 0.0618;
    out.push({ guide: 'w5-ratio', ok, actual: m.w5a!, expected: '0.9–1.1 (к wave 1) или 0.556–0.68 (к пути 0–3)' });
  }
  if (n >= 5) {
    const d2 = idx[2]! - idx[1]!;
    const d4 = idx[4]! - idx[3]!;
    const diff = Math.abs(m.r2! - m.r4!);
    const ok = diff >= 0.2 || Math.max(d2, d4) >= 2 * Math.min(d2, d4);
    out.push({ guide: 'alternation', ok, actual: diff, expected: '≥ 0.2 по глубине или ≥ 2× по времени' });
  }
  return out;
}

export function correctionGuides(type: EwCorrectionType, m: Measures): EwGuideCheck[] {
  if (m.retrB === null || m.cLen === null) return [];
  if (type === 'zigzag') {
    return [
      { guide: 'zigzag-b', ok: m.retrB >= 0.342 && m.retrB <= 0.826, actual: m.retrB, expected: '0.342–0.826' },
      { guide: 'zigzag-c', ok: within(m.cLen, 0.618) || within(m.cLen, 1) || within(m.cLen, 1.618), actual: m.cLen, expected: '0.618, 1 или 1.618 (±10%)' },
    ];
  }
  return [
    { guide: 'flat-b', ok: m.retrB <= 1.382, actual: m.retrB, expected: '≤ 1.382' },
    { guide: 'flat-c', ok: within(m.cLen, 1) || within(m.cLen, 1.618), actual: m.cLen, expected: '1 или 1.618 (±10%)' },
  ];
}

export const GUIDE_IDS: readonly EwGuideId[] = ['w2-depth', 'w3-ratio', 'w4-depth', 'w5-ratio', 'alternation', 'zigzag-b', 'zigzag-c', 'flat-b', 'flat-c'];

export const round3 = f3;
