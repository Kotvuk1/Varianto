// Ступень 4 «Стоп и тейк»: эталон входа, рубрика SL/TP/RR, stop hunt (CURRICULUM_STAGES.md §6, §20).
import { atr14 } from '../smc/series';
import { resolveTrade, type FutureProvider, type ResolvedTrade } from '../challenge/resolve';
import type { Candle, GradeError, OkCode, SkillOutcome, TaskTimeframe, UtcMs, Verdict } from '../types';
import { CurValidationError, type CurPart } from './limit';
import {
  buildTargets,
  rrOf,
  slBand,
  slClass,
  structurePoint,
  tpClass,
  type SlCode,
  type Target,
  type TargetSet,
  type TargetSource,
} from './rubric';
import type { Side, Zone } from './zone';

export const TARGET_SOURCE_TEXT_RU: Record<TargetSource, string> = {
  level: 'ближний край встречного уровня',
  swing: 'внешний swing, ликвидность за ним',
  'order-block': 'ближний край встречного Order Block',
  fvg: 'ближний край встречного FVG',
};

export interface StopTakeRef {
  side: Side;
  zone: Zone;
  /** Цена входа - ближний край зоны. */
  E: number;
  /** max(E, close[f]) для LONG, min для SHORT. */
  Estar: number;
  closeF: number;
  /** ATR14 свечи исполнения. */
  A: number;
  /** Структурная точка: за дальним краем зоны или фитилём свечи входа. */
  Pl: number;
  targets: TargetSet;
}

/** Эталон ступени 4 по ряду, оканчивающемуся свечой исполнения `f`; null - ATR не определён или нет цели на 2R. */
export function buildStopTakeRef(visible: readonly Candle[], side: Side, zone: Zone, E: number): StopTakeRef | null {
  const n = visible.length;
  const f = visible[n - 1];
  const A = atr14(visible)[n - 1];
  if (!f || A === null || A === undefined || !(A > 0)) return null;
  const Pl = structurePoint(side, zone, f);
  const Estar = side === 'LONG' ? Math.max(E, f.close) : Math.min(E, f.close);
  const targets = buildTargets(visible, side, E, Estar, A, Pl);
  if (targets.kStar < 0) return null;
  return { side, zone, E, Estar, closeF: f.close, A, Pl, targets };
}

/** Validation 400 (§6.5): SL/TP с неверной стороны от входа. */
export function validateStopTake(ref: StopTakeRef, sl: number, tp: number): void {
  const long = ref.side === 'LONG';
  if (long ? sl >= Math.min(ref.E, ref.closeF) : sl <= Math.max(ref.E, ref.closeF)) throw new CurValidationError('SL_WRONG_SIDE');
  if (long ? tp <= ref.Estar : tp >= ref.Estar) throw new CurValidationError('TP_WRONG_SIDE');
}

export interface StopTakeScore {
  parts: CurPart[];
  quality: number;
  verdict: Verdict;
  rr: number;
  errors: GradeError[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  skillOutcomes: SkillOutcome[];
  slBand: [number, number];
  slFull: boolean;
}

/** Рубрика SL 40 / TP 35 / RR 25 (§6.2-§6.5), без исхода. */
export function scoreStopTake(ref: StopTakeRef, sl: number, tp: number): StopTakeScore {
  const { side, A, Pl, E } = ref;
  const long = side === 'LONG';
  const errors: GradeError[] = [];
  const ok: StopTakeScore['ok'] = [];
  const parts: CurPart[] = [];

  const slc: SlCode = slClass(side, sl, Pl, A);
  const slScore = slc === 'OK_SL_PLACEMENT' ? 40 : slc === 'SL_INSIDE_STRUCTURE' ? 0 : 20;
  parts.push({ key: 'sl', score: slScore, max: 40, code: slc === 'OK_SL_PLACEMENT' ? null : slc });
  if (slc === 'OK_SL_PLACEMENT') ok.push({ code: 'OK_SL_PLACEMENT', params: { level: Pl } });
  else {
    errors.push({
      code: slc,
      skill: 'stop-placement',
      severity: slc === 'SL_INSIDE_STRUCTURE' ? 'major' : 'minor',
      params: { sl, level: Pl, bufferAtr: long ? (Pl - sl) / A : (sl - Pl) / A },
    });
  }

  const tc = tpClass(side, tp, ref.targets, A);
  const tpScore = tc?.code === 'OK_TP_LEVEL' ? 35 : tc?.code === 'TP_NOT_AT_LEVEL' ? 15 : 0;
  parts.push({ key: 'tp', score: tpScore, max: 35, code: tc && tc.code !== 'OK_TP_LEVEL' ? tc.code : null });
  if (tc?.code === 'OK_TP_LEVEL') {
    ok.push({ code: 'OK_TP_LEVEL', params: { tp, target: tc.nearest.price, sourceText: TARGET_SOURCE_TEXT_RU[tc.nearest.source] } });
  } else if (tc) {
    const t = tc.code === 'TP_BEYOND_TARGETS' ? tc.last : tc.nearest;
    errors.push({
      code: tc.code,
      skill: 'take-profit',
      severity: tc.code === 'TP_BEYOND_TARGETS' ? 'major' : 'minor',
      params: { tp, target: t.price, sourceText: TARGET_SOURCE_TEXT_RU[t.source], firstTarget: tc.first.price },
    });
  }

  const rr = rrOf(E, sl, tp);
  const rrScore = rr >= 2 ? 25 : rr >= 1.5 ? 12 : 0;
  parts.push({ key: 'rr', score: rrScore, max: 25, code: rr < 1.5 ? 'RR_TOO_LOW' : null });
  if (rr >= 2) ok.push({ code: 'OK_RR', params: { rr } });
  else if (rr < 1.5) errors.push({ code: 'RR_TOO_LOW', skill: 'risk-reward', severity: 'minor', params: { rr } });

  const quality = parts.reduce((s, p) => s + p.score, 0);
  const verdict: Verdict = slScore === 40 && tpScore === 35 && rrScore >= 12 ? 'correct' : quality >= 50 ? 'partial' : 'incorrect';
  return {
    parts,
    quality,
    verdict,
    rr,
    errors,
    ok,
    skillOutcomes: [
      { skill: 'stop-placement', correct: slScore === 40 ? 1 : 0, total: 1 },
      { skill: 'take-profit', correct: tpScore === 35 ? 1 : 0, total: 1 },
      { skill: 'risk-reward', correct: rrScore >= 12 ? 1 : 0, total: 1 },
    ],
    slBand: slBand(side, Pl, A),
    slFull: slScore === 40,
  };
}

export interface StopHunt {
  hunted: boolean;
  /** Свеча выноса. */
  candle: Candle | null;
}

/**
 * §6.5: result = sl; стоп снят фитилём (свеча выноса закрылась по эту сторону стопа), после чего цена достигла tp раньше,
 * чем какая-либо свеча закрылась за экстремумом выноса.
 */
export function detectStopHunt(side: Side, sl: number, tp: number, outcome: Pick<ResolvedTrade, 'result' | 'triggerTime'>, future: readonly Candle[]): StopHunt {
  if (outcome.result !== 'sl') return { hunted: false, candle: null };
  const long = side === 'LONG';
  const si = future.findIndex((c) => outcome.triggerTime >= c.openTime && outcome.triggerTime <= c.closeTime);
  if (si < 0) return { hunted: false, candle: null };
  const s = future[si]!;
  if (long ? !(s.close > sl) : !(s.close < sl)) return { hunted: false, candle: s };
  for (let j = si + 1; j < future.length; j++) {
    const x = future[j]!;
    if (long ? x.high >= tp : x.low <= tp) return { hunted: true, candle: s };
    if (long ? x.close < s.low : x.close > s.high) return { hunted: false, candle: s };
  }
  return { hunted: false, candle: s };
}

/** Блоки stop hunt (§6.5): не меняют quality, verdict и skillOutcomes. */
export function huntBlocks(side: Side, sl: number, slFull: boolean, hunt: StopHunt, ref: Pick<StopTakeRef, 'Pl' | 'A'>): { errors: GradeError[]; ok: StopTakeScore['ok'] } {
  if (!hunt.hunted || !hunt.candle) return { errors: [], ok: [] };
  const c = hunt.candle;
  const long = side === 'LONG';
  const wick = long ? c.low : c.high;
  if (slFull) return { errors: [], ok: [{ code: 'OK_STOP_HUNT_RULES', params: { sl, time: c.openTime, wick } }] };
  return {
    errors: [
      {
        code: 'STOP_HUNTED',
        skill: 'stop-placement',
        severity: 'minor',
        params: { sl, time: c.openTime, wick, close: c.close, level: ref.Pl, bufferAtr: long ? (ref.Pl - sl) / ref.A : (sl - ref.Pl) / ref.A },
      },
    ],
    ok: [],
  };
}

export interface StopTakePlay {
  outcome: ResolvedTrade;
  referencePlan: { sl: number; tp: number; outcome: ResolvedTrade };
  hunt: StopHunt;
  /** Свечи tf после свечи исполнения (до limit). */
  future: Candle[];
}

/** Проигрывание плана и эталонного плана через resolveTrade (§6.5), определение stop hunt. */
export async function playStopTake(
  ref: StopTakeRef,
  sl: number,
  tp: number,
  T: UtcMs,
  tf: TaskTimeframe,
  limit: number,
  provider: FutureProvider,
): Promise<StopTakePlay> {
  const pos = (s: number, t: number) => ({ side: ref.side, entry: ref.E, sl: s, tp: t, T, tf, limitCandles: limit });
  const outcome = await resolveTrade(pos(sl, tp), provider);
  const refSl = ref.targets.slRef;
  const refTp = ref.targets.targets[ref.targets.kStar]!.price;
  const refOutcome = await resolveTrade(pos(refSl, refTp), provider);
  const future = (await provider.candles(tf, T, limit)).filter((c) => c.closed && c.openTime >= T).slice(0, limit);
  return { outcome, referencePlan: { sl: refSl, tp: refTp, outcome: refOutcome }, hunt: detectStopHunt(ref.side, sl, tp, outcome, future), future };
}

export type { Target };
