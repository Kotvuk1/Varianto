// Оценка качества решения Challenge 0-100 (ALGORITHMS §14.3, §14.4, §16.1): независимо от исхода сделки.
import { REASON_WHY_RU } from '../feedback/templates.ru';
import type { GradeError, OkCode, SkillOutcome, Swing, TaskTimeframe, Verdict } from '../types';
import { reasonValid, RR_FULL, RR_MIN, type ChallengeFacts, type ReasonCode, type RefSide, type Side } from './facts';
import type { ChallengeOutcome, ResolvedTrade } from './resolve';

export interface ChallengeAnswerInput {
  side: Side | 'WAIT';
  tf: TaskTimeframe;
  entry?: number;
  sl?: number;
  tp?: number;
  reasons: readonly ReasonCode[];
}

export interface QualityPart {
  key: 'htf' | 'structure' | 'location' | 'sl' | 'rr' | 'reasons' | 'wait';
  score: number;
  max: number;
}

export interface ChallengeDetail {
  decisionCorrect: boolean;
  waitCorrect: boolean | null;
  quality: { score: number; parts: QualityPart[] } | null;
  outcome: ChallengeOutcome | null;
}

export interface ChallengeGrade {
  refSide: RefSide;
  verdict: Verdict;
  /** quality / 100. */
  score: number;
  quality: { score: number; parts: QualityPart[] };
  errors: GradeError[];
  skillOutcomes: SkillOutcome[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  detail: ChallengeDetail;
}

const trendOf = (side: Side) => (side === 'LONG' ? 'up' : 'down');
const dirOf = (side: Side) => (side === 'LONG' ? 'bull' : 'bear');

/** Защищённый уровень для SL: refLow/refHigh по стороне сделки, если он с нужной стороны от входа, иначе последний внешний swing. */
export function protectedLevel(side: Side, f: ChallengeFacts, entry: number): Swing | null {
  const ref = side === 'LONG' ? f.refLow : f.refHigh;
  if (ref && (side === 'LONG' ? ref.price < entry : ref.price > entry)) return ref;
  const cands = f.structure.swings.filter(
    (s) => s.scope === 'external' && s.type === (side === 'LONG' ? 'low' : 'high') && (side === 'LONG' ? s.price < entry : s.price > entry),
  );
  return cands.reduce<Swing | null>((best, s) => (best === null || s.index > best.index ? s : best), null);
}

function lastInternal(side: Side, f: ChallengeFacts, entry: number): Swing | null {
  const cands = f.structure.swings.filter(
    (s) => s.type === (side === 'LONG' ? 'low' : 'high') && (side === 'LONG' ? s.price < entry : s.price > entry),
  );
  return cands.reduce<Swing | null>((best, s) => (best === null || s.index > best.index ? s : best), null);
}

function slScore(side: Side, f: ChallengeFacts, entry: number, sl: number): { score: number; code: 'SL_TOO_WIDE' | 'SL_INSIDE_STRUCTURE' | null; level: number | null } {
  const P = protectedLevel(side, f, entry);
  if (!P) return { score: 8, code: null, level: null }; // эталонного уровня нет — частичный балл без ошибки
  const A = f.atr;
  const bull = side === 'LONG';
  const beyond = bull ? sl < P.price : sl > P.price;
  if (beyond) {
    const wide = bull ? sl < P.price - 1.5 * A : sl > P.price + 1.5 * A;
    return wide ? { score: 8, code: 'SL_TOO_WIDE', level: P.price } : { score: 15, code: null, level: P.price };
  }
  const inner = lastInternal(side, f, entry);
  if (inner && (bull ? sl < inner.price : sl > inner.price)) return { score: 8, code: null, level: P.price };
  return { score: 0, code: 'SL_INSIDE_STRUCTURE', level: P.price };
}

function lastEventText(f: ChallengeFacts): string {
  const e = f.lastEvent;
  return e ? `${e.kind === 'bos' ? 'BOS' : 'CHoCH'} ${e.direction}` : 'нет';
}

function reasonScore(
  selected: readonly ReasonCode[],
  f: ChallengeFacts,
  side: RefSide,
  max: number,
  errors: GradeError[],
): number {
  const uniq = [...new Set(selected)];
  if (uniq.length === 0) return 0;
  let ok = 0;
  for (const r of uniq) {
    if (reasonValid(r, f, side)) ok++;
    else {
      const why = side === 'WAIT' && r !== 'range-no-edge' && r !== 'unclear-structure' ? REASON_WHY_RU['wait-other']! : REASON_WHY_RU[r]!;
      errors.push({ code: 'REASON_MISMATCH', skill: 'challenge-entry', severity: 'minor', params: { reason: r, reasonWhy: why } });
    }
  }
  return (max * ok) / uniq.length;
}

function verdictOf(side: Side | 'WAIT', refSide: RefSide, quality: number): Verdict {
  if (side === refSide) return quality >= 70 ? 'correct' : 'partial';
  const opposite = (side === 'LONG' && refSide === 'SHORT') || (side === 'SHORT' && refSide === 'LONG');
  return !opposite && quality >= 70 ? 'partial' : 'incorrect';
}

export function gradeChallenge(
  answer: ChallengeAnswerInput,
  f: ChallengeFacts,
  outcome: ResolvedTrade | null,
): ChallengeGrade {
  const errors: GradeError[] = [];
  const ok: ChallengeGrade['ok'] = [];
  const parts: QualityPart[] = [];
  const err = (code: GradeError['code'], skill: GradeError['skill'], params: Record<string, string | number>, severity: 'minor' | 'major' = 'minor') =>
    errors.push({ code, skill, severity, params });

  if (answer.side === 'WAIT') {
    const waitCorrect = f.refSide === 'WAIT';
    parts.push({ key: 'wait', score: waitCorrect ? 70 : 0, max: 70 });
    if (waitCorrect) ok.push({ code: 'OK_WAIT' });
    else {
      const side = f.refSide as Side;
      const p = f.poi[dirOf(side)];
      err('WAIT_MISSED_SETUP', 'challenge-wait', {
        refSide: f.refSide,
        trendTf: f.trendTf,
        htfTrend: f.trendHtf,
        poi: p.ob ? 'OB' : p.fvg ? 'FVG' : 'protected',
      }, 'major');
    }
    parts.push({ key: 'reasons', score: reasonScore(answer.reasons, f, 'WAIT', 30, errors), max: 30 });
    const score = parts.reduce((s, p) => s + p.score, 0);
    return {
      refSide: f.refSide,
      verdict: verdictOf('WAIT', f.refSide, score),
      score: score / 100,
      quality: { score, parts },
      errors,
      skillOutcomes: [{ skill: 'challenge-wait', correct: waitCorrect ? 1 : 0, total: 1 }],
      ok,
      detail: { decisionCorrect: waitCorrect, waitCorrect, quality: { score, parts }, outcome: null },
    };
  }

  const side = answer.side;
  const dir = dirOf(side);
  const want = trendOf(side);
  const entry = answer.entry ?? f.entry;
  const sl = answer.sl as number;
  const tp = answer.tp as number;

  // htf
  const htf = f.trendHtf === want ? 25 : f.trendHtf === 'none' ? 10 : 0;
  parts.push({ key: 'htf', score: htf, max: 25 });
  if (htf === 0) err('TRADE_AGAINST_HTF', 'challenge-entry', { side, htfTrend: f.trendHtf, htfTf: f.htfTf });
  else if (htf === 25) ok.push({ code: 'OK_HTF', params: { htfTrend: f.trendHtf } });

  // structure
  const st = f.trendTf === want ? 25 : f.trendTf === 'none' ? 10 : 0;
  parts.push({ key: 'structure', score: st, max: 25 });
  if (st === 0) {
    const prot = f.trendTf === 'up' ? f.refLow : f.refHigh;
    err('TRADE_AGAINST_STRUCTURE', 'challenge-entry', { side, trendTf: f.trendTf, lastEvent: lastEventText(f), level: prot ? prot.price : 'нет' });
  } else if (st === 10 && f.refSide === 'WAIT') {
    err('TRADE_IN_RANGE', 'challenge-entry', { trendTf: f.trendTf, htfTrend: f.trendHtf });
  }

  // location
  const poi = f.poi[dir];
  parts.push({ key: 'location', score: poi.any ? 15 : 0, max: 15 });
  if (!poi.any) err('ENTRY_NO_POI', 'challenge-entry', { entry });

  // sl
  const s = slScore(side, f, entry, sl);
  parts.push({ key: 'sl', score: s.score, max: 15 });
  if (s.code === 'SL_INSIDE_STRUCTURE') err('SL_INSIDE_STRUCTURE', 'challenge-risk', { sl, level: s.level as number });
  else if (s.code === 'SL_TOO_WIDE') err('SL_TOO_WIDE', 'challenge-risk', { sl, level: s.level as number });
  else if (s.score === 15) ok.push({ code: 'OK_SL_PLACEMENT', params: { level: s.level as number } });

  // rr
  const rr = Math.abs(tp - entry) / Math.abs(entry - sl);
  const rrScore = rr >= RR_FULL ? 10 : rr >= RR_MIN ? 5 : 0;
  parts.push({ key: 'rr', score: rrScore, max: 10 });
  if (rr < RR_MIN) err('RR_TOO_LOW', 'challenge-risk', { rr });
  else if (rr >= RR_FULL) ok.push({ code: 'OK_RR', params: { rr } });

  // reasons
  parts.push({ key: 'reasons', score: reasonScore(answer.reasons, f, side, 10, errors), max: 10 });

  const score = parts.reduce((a, p) => a + p.score, 0);
  const entryOk =
    side === f.refSide && !errors.some((e) => e.code === 'TRADE_AGAINST_HTF' || e.code === 'TRADE_AGAINST_STRUCTURE' || e.code === 'TRADE_IN_RANGE');
  const skillOutcomes: SkillOutcome[] = [
    { skill: 'challenge-entry', correct: entryOk ? 1 : 0, total: 1 },
    { skill: 'challenge-risk', correct: s.score === 15 && rr >= RR_MIN ? 1 : 0, total: 1 },
  ];
  if (f.refSide === 'WAIT') skillOutcomes.push({ skill: 'challenge-wait', correct: 0, total: 1 });

  const r = outcome?.rMultiple ?? null;
  return {
    refSide: f.refSide,
    verdict: verdictOf(side, f.refSide, score),
    score: score / 100,
    quality: { score, parts },
    errors,
    skillOutcomes,
    ok,
    detail: {
      decisionCorrect: side === f.refSide && r !== null && r > 0,
      waitCorrect: null,
      quality: { score, parts },
      outcome: outcome ? stripTrigger(outcome) : null,
    },
  };
}

function stripTrigger(o: ResolvedTrade): ChallengeOutcome {
  const { triggerTime: _t, triggerTf: _f, ...rest } = o;
  void _t;
  void _f;
  return rest;
}
