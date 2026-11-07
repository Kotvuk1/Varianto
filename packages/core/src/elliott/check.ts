// checkCount: снап якорей, проверка точек (§3), правил (§4) и рекомендаций (§5) разметки пользователя. Без будущего.
import { EW_GUIDE_NAME_RU, EW_GUIDE_RULE_RU } from '../feedback/templates.ru';
import { atr14, candleIndexAt } from '../smc/series';
import { detectSwings } from '../smc/swings';
import { TIMEFRAME_MS } from '../types';
import type { Anchor, Candle, GradeError, TaskTimeframe, UtcMs } from '../types';
import {
  LABELS,
  correctionGuides,
  correctionRules,
  impulseGuides,
  impulseRules,
  isLowPos,
  measure,
  normSeries,
  priceOrderViolation,
  round3,
  segmentViolation,
  sgOf,
  sideAt,
  validCorrectionTypes,
  vAt,
  type Measures,
} from './measure';
import type {
  EwCorrectionType,
  EwDirection,
  EwGuideCheck,
  EwLabel,
  EwPointCheck,
  EwRuleCheck,
  WaveCount,
  WavePoint,
} from './types';

export const EW_TOLERANCE_CANDLES = 2;
export const EW_N_POINT = 5;

export interface EwCheckInput {
  candles: readonly Candle[];
  tf: TaskTimeframe;
  impulse: readonly Anchor[];
  impulseId?: string;
  correction?: { type: EwCorrectionType; anchors: readonly Anchor[]; id?: string } | null;
  nPoint?: number;
  toleranceCandles?: number;
}

export interface EwCheck {
  direction: EwDirection | null;
  orderBroken: boolean;
  points: EwPointCheck[];
  /** Снапнутые точки (impulse + correction) в порядке позиций. */
  snapped: WavePoint[];
  errors: GradeError[];
  rules: EwRuleCheck[];
  guides: EwGuideCheck[];
  lengths: number[];
  ratios: Record<string, number>;
  extended3: boolean | null;
  correction: { given: EwCorrectionType; validTypes: EwCorrectionType[] } | null;
  measures: Measures | null;
  /** Разметка пользователя как WaveCount (после снапа); null при нарушенном порядке. */
  count: WaveCount | null;
  /** Индексы свечей точек по позициям. */
  idx: number[];
  /** Нормированные цены по позициям. */
  v: number[];
  /** Ошибки уровня правил (для навыков): число точек с EW_POINT_*. */
  pointErrors: { notExtreme: number; notSwing: number };
  atr: (number | null)[];
}

const swingCache = new WeakMap<readonly Candle[], Map<number, { high: Uint8Array; low: Uint8Array }>>();
function swingFlags(candles: readonly Candle[], n: number): { high: Uint8Array; low: Uint8Array } {
  let m = swingCache.get(candles);
  if (!m) swingCache.set(candles, (m = new Map()));
  let f = m.get(n);
  if (!f) {
    const high = new Uint8Array(candles.length);
    const low = new Uint8Array(candles.length);
    for (const s of detectSwings(candles, { left: n, right: n })) (s.type === 'high' ? high : low)[s.index] = 1;
    m.set(n, (f = { high, low }));
  }
  return f;
}

const atrCache = new WeakMap<readonly Candle[], (number | null)[]>();
export function atrOf(candles: readonly Candle[]): (number | null)[] {
  let a = atrCache.get(candles);
  if (!a) atrCache.set(candles, (a = atr14(candles)));
  return a;
}

/** Снап точки роли pos: экстремум роли в окне [i-tol, i+tol]; свеча i, если сама достигает экстремума, иначе более ранняя. */
export function snapIndex(ns: ReturnType<typeof normSeries>, pos: number, i: number, tol: number, n: number): number {
  const from = Math.max(0, i - tol);
  const to = Math.min(n - 1, i + tol);
  const low = isLowPos(pos);
  let best = from;
  for (let j = from; j <= to; j++) {
    const x = vAt(ns, pos, j);
    const b = vAt(ns, pos, best);
    if (low ? x < b : x > b) best = j;
  }
  const bv = vAt(ns, pos, best);
  return vAt(ns, pos, i) === bv ? i : best;
}

export function userDirection(a: Anchor, b: Anchor): EwDirection | null {
  return b.price > a.price ? 'bull' : b.price < a.price ? 'bear' : null;
}

const GUIDE_SKILL = (g: string) => (g.startsWith('zigzag') || g.startsWith('flat') ? 'ew-correction' : 'ew-impulse');

export function checkCount(input: EwCheckInput): EwCheck {
  const { candles, tf } = input;
  const tol = input.toleranceCandles ?? EW_TOLERANCE_CANDLES;
  const nPoint = input.nPoint ?? EW_N_POINT;
  const step = TIMEFRAME_MS[tf];
  const n = candles.length;
  const atr = atrOf(candles);
  const impulseCount = input.impulse.length;
  // коррекция имеет смысл только после 6-точечного импульса
  const corr = impulseCount === 6 ? (input.correction ?? null) : null;
  const anchors: Anchor[] = [...input.impulse, ...(corr?.anchors ?? [])];
  const markIdOf = (pos: number) => (pos < impulseCount ? input.impulseId : corr?.id);
  const userIdx = anchors.map((a) => candleIndexAt(candles, a.time, step));
  if (userIdx.some((i) => i < 0)) throw new Error('EW_ANCHOR_OUT_OF_RANGE');

  const empty = (direction: EwDirection | null, errors: GradeError[], points: EwPointCheck[] = []): EwCheck => ({
    direction, orderBroken: true, points, snapped: [], errors, rules: [], guides: [], lengths: [], ratios: {}, extended3: null,
    correction: null, measures: null, count: null, idx: [], v: [], pointErrors: { notExtreme: 0, notSwing: 0 }, atr,
  });

  const dir = userDirection(input.impulse[0]!, input.impulse[1]!);
  if (!dir) {
    const t = (k: number) => candles[userIdx[k]!]!.openTime;
    return empty(null, [
      {
        code: 'EW_WRONG_ORDER', skill: 'ew-impulse', severity: 'major',
        ...(input.impulseId ? { markIds: [input.impulseId] } : {}),
        params: { pointA: '0', pointATime: t(0), priceA: anchors[0]!.price, pointB: '1', pointBTime: t(1), priceB: anchors[1]!.price },
      },
    ]);
  }
  const sg = sgOf(dir);
  const ns = normSeries(candles, sg);
  const total = anchors.length;
  const idx: number[] = [];
  for (let k = 0; k < total; k++) {
    const pos = k < impulseCount ? k : 6 + (k - impulseCount);
    idx.push(snapIndex(ns, pos, userIdx[k]!, tol, n));
  }
  // позиции точек: импульс 0..impulseCount-1, коррекция 6,7,8 (только при 6 точках импульса)
  const posOf = (k: number) => (k < impulseCount ? k : 6 + (k - impulseCount));
  const v = idx.map((j, k) => vAt(ns, posOf(k), j));
  const label = (k: number): EwLabel => LABELS[posOf(k)]!;
  const raw = (x: number) => sg * x;
  const snapped: WavePoint[] = idx.map((j, k) => ({ index: j, time: candles[j]!.openTime, price: raw(v[k]!), label: label(k) }));
  const flags = swingFlags(candles, nPoint);

  const pointBase = (k: number): EwPointCheck => {
    const j = idx[k]!;
    const side = sideAt(sg, posOf(k));
    return {
      label: label(k), userTime: candles[userIdx[k]!]!.openTime, time: candles[j]!.openTime, price: raw(v[k]!),
      offsetCandles: j - userIdx[k]!, extreme: true, swing: (side === 'high' ? flags.high : flags.low)[j] === 1,
    };
  };

  // --- порядок (§3 п.1)
  let bad: number | null = null;
  for (let k = 0; k + 1 < total; k++) if (idx[k + 1]! <= idx[k]!) { bad = k; break; }
  if (bad === null) bad = priceOrderViolation(v);
  if (bad !== null) {
    const a = bad;
    const points = idx.map((_, k) => ({ ...pointBase(k), extreme: false }));
    return {
      ...empty(dir, [
        {
          code: 'EW_WRONG_ORDER', skill: 'ew-impulse', severity: 'major',
          markIds: [markIdOf(a), markIdOf(a + 1)].filter((x): x is string => !!x),
          params: {
            pointA: label(a), pointATime: candles[idx[a]!]!.openTime, priceA: raw(v[a]!),
            pointB: label(a + 1), pointBTime: candles[idx[a + 1]!]!.openTime, priceB: raw(v[a + 1]!),
          },
        },
      ], points),
      snapped,
      idx,
      v,
    };
  }

  // --- экстремумы сегментов (§3 п.2), swing (п.3)
  const errors: GradeError[] = [];
  const points: EwPointCheck[] = idx.map((_, k) => pointBase(k));
  const flagged = new Set<number>();
  for (let k = 0; k + 1 < total; k++) {
    for (const viol of segmentViolation(ns, posOf(k), idx[k]!, idx[k + 1]!)) {
      const kk = viol.pos === posOf(k) ? k : k + 1;
      if (flagged.has(kk)) continue;
      flagged.add(kk);
      points[kk]!.extreme = false;
      const lab = label(kk);
      errors.push({
        code: 'EW_POINT_NOT_EXTREME', skill: lab === 'A' || lab === 'B' || lab === 'C' ? 'ew-correction' : 'ew-impulse', severity: 'major',
        ...(markIdOf(kk) ? { markIds: [markIdOf(kk)!] } : {}),
        params: {
          label: lab, userTime: points[kk]!.userTime, price: points[kk]!.price,
          prevLabel: label(k), nextLabel: label(k + 1),
          extremePrice: raw(vAt(ns, viol.pos, viol.index)), extremeTime: candles[viol.index]!.openTime,
          sideName: sideAt(sg, viol.pos),
        },
      });
    }
  }
  let notSwing = 0;
  for (let k = 0; k < total; k++) {
    if (flagged.has(k) || points[k]!.swing) continue;
    notSwing++;
    const lab = label(k);
    errors.push({
      code: 'EW_POINT_NOT_SWING', skill: lab === 'A' || lab === 'B' || lab === 'C' ? 'ew-correction' : 'ew-impulse', severity: 'minor',
      ...(markIdOf(k) ? { markIds: [markIdOf(k)!] } : {}),
      params: { label: lab, time: points[k]!.time, n: nPoint, sideName: sideAt(sg, posOf(k)) },
    });
  }

  // --- правила (§4)
  const vi = v.slice(0, impulseCount);
  const m = measure(v);
  const iRules = impulseRules(vi, sg);
  const rules: EwRuleCheck[] = [...iRules];
  const corrType = corr?.type ?? null;
  const cRules = corrType && v.length >= 9 ? correctionRules(corrType, m) : [];
  rules.push(...cRules);
  const px = (k: number) => raw(v[k]!);
  const tx = (k: number) => candles[idx[k]!]!.openTime;
  const ruleErr = (r: EwRuleCheck) => {
    const mk = input.impulseId ? { markIds: [input.impulseId] } : {};
    switch (r.rule) {
      case 'w2':
        return { code: 'EW_RULE_W2_BEYOND_W1', skill: 'ew-rules', params: { pTwo: px(2), pTwoTime: tx(2), pZero: px(0), pZeroTime: tx(0), depthTwo: round3(m.r2!), extremeTime: tx(2) }, ...mk };
      case 'w3-beyond-w1':
        return { code: 'EW_RULE_W3_NOT_BEYOND_W1', skill: 'ew-rules', params: { pThree: px(3), pOne: px(1) }, ...mk };
      case 'w3-shortest':
        return { code: 'EW_RULE_W3_SHORTEST', skill: 'ew-rules', params: { lenThree: m.L[2]!, lenOne: m.L[0]!, lenFive: m.L[4]! }, ...mk };
      case 'w4-overlap':
        return { code: 'EW_RULE_W4_OVERLAP', skill: 'ew-rules', params: { pFour: px(4), pFourTime: tx(4), pOne: px(1) }, ...mk };
      case 'zigzag-b':
        return { code: 'EW_ZIGZAG_B_TOO_DEEP', skill: 'ew-correction', params: { pB: px(7), pFive: px(5), retrB: round3(m.retrB!) }, ...(corr?.id ? { markIds: [corr.id] } : {}) };
      case 'zigzag-c':
        return { code: 'EW_ZIGZAG_C_NOT_BEYOND_A', skill: 'ew-correction', params: { pC: px(8), pA: px(6) }, ...(corr?.id ? { markIds: [corr.id] } : {}) };
      case 'flat-b':
        return { code: 'EW_FLAT_B_TOO_SHALLOW', skill: 'ew-correction', params: { retrB: round3(m.retrB!) }, ...(corr?.id ? { markIds: [corr.id] } : {}) };
      case 'flat-c':
        return { code: 'EW_FLAT_C_TOO_SHORT', skill: 'ew-correction', params: { pC: px(8), pA: px(6), short: round3(-m.cBeyond!) }, ...(corr?.id ? { markIds: [corr.id] } : {}) };
    }
  };
  for (const r of rules) if (!r.ok) errors.push({ severity: 'major', ...(ruleErr(r) as unknown as Omit<GradeError, 'severity'>) });

  // --- рекомендации (§5)
  const guides: EwGuideCheck[] = [...impulseGuides(m, vi, idx.slice(0, impulseCount))];
  if (corrType && v.length >= 9) guides.push(...correctionGuides(corrType, m));
  for (const g of guides) {
    if (g.ok) continue;
    errors.push({
      code: 'EW_GUIDE_MISS', skill: GUIDE_SKILL(g.guide), severity: 'minor',
      params: { guide: g.guide, guideName: EW_GUIDE_NAME_RU[g.guide], actual: round3(g.actual), expected: g.expected, guideRule: EW_GUIDE_RULE_RU[g.guide] },
    });
  }

  const ratios: Record<string, number> = {};
  const put = (k: string, x: number | null) => { if (x !== null && Number.isFinite(x)) ratios[k] = x; };
  put('r2', m.r2); put('r3', m.r3); put('r4', m.r4); put('w5a', m.w5a); put('w5b', m.w5b);
  put('retrB', m.retrB); put('cBeyond', m.cBeyond); put('cLen', m.cLen); put('corrRetr', m.corrRetr);
  if (impulseCount >= 6) {
    const a0 = atr[idx[0]!];
    if (a0 !== null && a0 !== undefined) put('size', (v[5]! - v[0]!) / a0);
  }

  const impulsePts = snapped.slice(0, impulseCount);
  const corrPts = snapped.slice(impulseCount);
  const count: WaveCount = {
    direction: dir,
    impulse: impulsePts,
    correction: corrType && corrPts.length === 3 ? { type: corrType, points: corrPts } : null,
    scenario: impulseCount === 3 ? 'w3-next' : impulseCount === 5 ? 'w5-next' : corrPts.length === 3 ? 'trend-next' : 'abc-next',
    amplitude: Math.max(...v) - Math.min(...v),
  };
  return {
    direction: dir,
    orderBroken: false,
    points,
    snapped,
    errors,
    rules,
    guides,
    lengths: m.L,
    ratios,
    extended3: m.extended3,
    correction: corrType && v.length >= 9 ? { given: corrType, validTypes: validCorrectionTypes(m) } : null,
    measures: m,
    count,
    idx,
    v,
    pointErrors: { notExtreme: flagged.size, notSwing },
    atr,
  };
}

export type { UtcMs };
