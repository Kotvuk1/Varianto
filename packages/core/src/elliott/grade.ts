// Оценка ответа Elliott (ELLIOTT.md §3-§6, §11, §13, §19): gradeElliott.
import {
  EW_ALT_REASON_RU,
  EW_ALT_TRIGGER_RU,
  EW_CORR_TYPE_RU,
  EW_INV_REASON_RU,
  EW_OUTCOME_TEXT_RU,
  EW_RULE_NAME_RU,
  EW_RULE_TEXT_RU,
  EW_SCENARIO_LABEL_RU,
  EW_SHAPE_RULE_RU,
  EW_SHAPE_TEXT_RU,
  EW_TOOLS_TEXT_RU,
  fillTemplate,
} from '../feedback/templates.ru';
import { roundByTick } from '../feedback/format';
import type { OkItem } from '../feedback/types';
import type { Candle, GradeError, Mark, SkillId, SkillOutcome, TaskTimeframe, Verdict } from '../types';
import { TIMEFRAME_MS } from '../types';
import { candleIndexAt } from '../smc/series';
import { checkCount, type EwCheck } from './check';
import { countMarks, invalidationMark } from './marks';
import { round3 } from './measure';
import { EW_REPLAY_TAIL, type EwRef } from './ref';
import { resolveScenario } from './resolve';
import { EW_ALT_ALLOWED, EW_RULE_REF, impliedScenario, scenarioRule, type EwRuleRef } from './scenarios';
import type {
  ElliottAnswer,
  ElliottDetail,
  EwAltStatus,
  EwCorrectionType,
  EwInvalidationStatus,
  EwOutcome,
  EwPrimaryScenario,
  WaveCount,
} from './types';

export interface EwGradeOutput {
  verdict: Verdict;
  score: number;
  errors: GradeError[];
  skillOutcomes: SkillOutcome[];
  ok: OkItem[];
  detail: ElliottDetail;
  reference: Mark[];
  replay?: { candles: Candle[]; exitIndex: number | null };
  /** Параметры вердикта: outcomeText + outcomeTime (шаблон feedback.verdict.elliott.*). */
  verdictParams: { outcomeText: string; outcomeTime: number };
  toleranceCandles: number;
}

/** Веса частей рубрики (§11.1): points, rules, guides, scenario, invalidation, alternative. */
export const EW_WEIGHTS = {
  'ew-impulse': { points: 20, rules: 40, guides: 15, scenario: 5, invalidation: 20, alternative: 0 },
  'ew-impulse-correction': { points: 15, rules: 35, guides: 15, scenario: 5, invalidation: 15, alternative: 15 },
  'ew-scenario': { points: 10, rules: 25, guides: 10, scenario: 5, invalidation: 25, alternative: 25 },
} as const;

const BLOCKING = /^(EW_WRONG_ORDER|EW_RULE_|EW_ZIGZAG_|EW_FLAT_|EW_COUNT_NOT_CURRENT|EW_COUNT_INCOMPLETE)/;
const corrTypeOf = (m: Mark): EwCorrectionType => (m.kind === 'ew-zigzag' ? 'zigzag' : 'flat');

export interface EwGradeOptions {
  tickSize?: number;
}

interface InvEval {
  status: EwInvalidationStatus;
  reason: 'missing' | 'wrong-side' | 'too-wide' | null;
  ruleLevel: number;
  ruleRef: EwRuleRef;
}

/** §6.3: оценка уровня invalidation. */
export function evaluateInvalidation(u: number | null, ruleLevel: number, close: number, tol: number): Pick<InvEval, 'status' | 'reason'> {
  if (u === null) return { status: 'missing', reason: 'missing' };
  if (Math.abs(u - ruleLevel) <= tol) return { status: 'ok', reason: null };
  const s = Math.sign(ruleLevel - close);
  if (s !== 0 && s * (u - close) <= 0) return { status: 'wrong', reason: 'wrong-side' };
  if (s * (u - ruleLevel) > 0) return { status: 'wrong', reason: 'too-wide' };
  return { status: 'tight', reason: null };
}

export function gradeElliott(
  ref: EwRef,
  input: { candles: readonly Candle[]; tf: TaskTimeframe },
  future: readonly Candle[],
  answer: ElliottAnswer,
  opts: EwGradeOptions = {},
): EwGradeOutput {
  const { candles: visible, tf } = input;
  const kind = ref.kind;
  const W = EW_WEIGHTS[kind];
  const tick = opts.tickSize;
  const price = (x: number) => roundByTick(x, tick);

  const impulseMark = answer.impulse;
  const corrMark = answer.correction;
  const chk: EwCheck = checkCount({
    candles: visible,
    tf,
    impulse: impulseMark.anchors,
    impulseId: impulseMark.id,
    correction: corrMark ? { type: corrTypeOf(corrMark), anchors: corrMark.anchors, id: corrMark.id } : null,
  });
  const errors: GradeError[] = [...chk.errors];
  const nImp = impulseMark.anchors.length;
  const hasCorr = !!corrMark && nImp === 6;
  const orderBroken = chk.orderBroken;
  const last = chk.snapped[chk.snapped.length - 1];

  // §3 п.4-5: текущая точка и полнота
  if (!orderBroken && last) {
    if (last.index !== ref.lastPivot.index && last.price !== ref.lastPivot.price) {
      errors.push({
        code: 'EW_COUNT_NOT_CURRENT', skill: 'ew-impulse', severity: 'major', markIds: [(hasCorr ? corrMark! : impulseMark).id],
        params: { userTime: last.time, lastTime: ref.lastPivot.time, lastPrice: ref.lastPivot.price },
      });
    }
    if (kind !== 'ew-scenario') {
      const need6 = nImp === 6;
      const incomplete = kind === 'ew-impulse' ? !need6 || !!corrMark : !need6 || !hasCorr;
      if (incomplete) {
        errors.push({
          code: 'EW_COUNT_INCOMPLETE', skill: 'ew-impulse', severity: 'major', markIds: [impulseMark.id],
          params: {
            shapeText: kind === 'ew-impulse' ? EW_SHAPE_TEXT_RU.impulse6 : EW_SHAPE_TEXT_RU.impulse6Correction,
            givenText: corrMark ? EW_SHAPE_TEXT_RU.impulseAndCorrection : fillTemplate(EW_SHAPE_TEXT_RU.impulsePoints, { n: nImp }),
            shapeRule: EW_SHAPE_RULE_RU[kind],
            toolsText: EW_TOOLS_TEXT_RU[kind],
          },
        });
      }
    }
  }

  // §6.2: сценарий
  const implied = impliedScenario(nImp, hasCorr);
  const lastLabel = chk.snapped.length ? chk.snapped[Math.min(chk.snapped.length, hasCorr ? 9 : nImp) - 1]!.label : '0';
  const scenarioOk = implied !== null && answer.primary === implied;
  if (!scenarioOk) {
    errors.push({
      code: 'EW_SCENARIO_MISMATCH', skill: 'ew-invalidation', severity: 'major',
      params: { given: EW_SCENARIO_LABEL_RU[answer.primary], lastLabel, implied: implied ? EW_SCENARIO_LABEL_RU[implied] : '—' },
    });
  }

  // разметка пользователя как WaveCount (даже при нарушенных правилах)
  const userCount: WaveCount | null = chk.count ?? userCountFromSnap(chk);
  const effPrimary: EwPrimaryScenario = implied ?? ref.primary;
  const closeT = visible[visible.length - 1]!.close;

  // §6.3: invalidation (по разметке пользователя; если её построить нельзя - по эталону)
  const ruleSrc = userCount && scenarioRule(userCount, effPrimary, null) ? userCount : ref.count;
  const ruleScenario = ruleSrc === userCount ? effPrimary : ref.primary;
  const rule0 = scenarioRule(ruleSrc, ruleScenario, null)!;
  const ruleLevel = rule0.invalidation;
  const ruleRef = EW_RULE_REF[ruleScenario];
  const invEval = evaluateInvalidation(answer.invalidation, ruleLevel, closeT, ref.invTol);
  const inv: InvEval = { ...invEval, ruleLevel, ruleRef };
  if (inv.status === 'wrong' || inv.status === 'missing') {
    errors.push({
      code: 'EW_INVALIDATION_WRONG', skill: 'ew-invalidation', severity: 'major',
      params: {
        given: answer.invalidation ?? 'не задан',
        reasonText: EW_INV_REASON_RU[inv.reason!],
        primary: EW_SCENARIO_LABEL_RU[ruleScenario],
        ruleText: EW_RULE_TEXT_RU[ruleRef],
        ruleLevel,
        invTol: ref.invTol,
      },
    });
  } else if (inv.status === 'tight') {
    errors.push({ code: 'EW_INVALIDATION_TOO_TIGHT', skill: 'ew-invalidation', severity: 'minor', params: { given: answer.invalidation!, ruleLevel } });
  }

  // §6.2: альтернатива
  const required = kind !== 'ew-impulse';
  const allowed = EW_ALT_ALLOWED[effPrimary];
  const allowedText = allowed.map((a) => EW_SCENARIO_LABEL_RU[a]).join('; ');
  const alt = answer.alternative;
  let altStatus: EwAltStatus;
  if (alt === null) altStatus = required ? 'missing' : 'optional-empty';
  else if (alt === answer.primary || alt === effPrimary) altStatus = 'same';
  else if (!allowed.includes(alt)) altStatus = 'not-allowed';
  else if (alt === 'bc-next') altStatus = !orderBroken && last && bcSupported(ref, last.index, chk) ? 'ok' : 'unsupported';
  else altStatus = 'ok';
  const primaryLabel = EW_SCENARIO_LABEL_RU[effPrimary];
  if (altStatus === 'missing') {
    const counts = Object.entries(ref.scan.byScenario).map(([k, n]) => `${EW_SCENARIO_LABEL_RU[k as keyof typeof EW_SCENARIO_LABEL_RU]}: ${n}`);
    errors.push({
      code: 'EW_ALT_MISSING', skill: 'ew-invalidation', severity: 'major',
      params: { altCountsText: counts.length ? counts.join('; ') : 'других допустимых разметок не найдено', primary: primaryLabel, allowedText },
    });
  } else if (altStatus === 'same') {
    errors.push({ code: 'EW_ALT_SAME', skill: 'ew-invalidation', severity: 'major', params: { primary: primaryLabel, allowedText } });
  } else if (altStatus === 'not-allowed' || altStatus === 'unsupported') {
    errors.push({
      code: 'EW_ALT_INCONSISTENT', skill: 'ew-invalidation', severity: 'minor',
      params: { alt: EW_SCENARIO_LABEL_RU[alt!], reasonText: EW_ALT_REASON_RU[altStatus], primary: primaryLabel, allowedText },
    });
  }

  // ---- рубрика §11
  const nPoints = chk.points.length;
  const hasCode = (re: RegExp) => errors.some((e) => re.test(e.code));
  const pointsPart = orderBroken ? 0 : Math.max(0, 1 - (chk.pointErrors.notExtreme + 0.5 * chk.pointErrors.notSwing) / nPoints);
  const rulesPart = orderBroken || hasCode(/^(EW_RULE_|EW_ZIGZAG_|EW_FLAT_)/) ? 0 : 1;
  const guidesOk = chk.guides.filter((g) => g.ok).length;
  const guidesPart = orderBroken || chk.guides.length === 0 ? 0 : guidesOk / chk.guides.length;
  const scenarioPart = scenarioOk ? 1 : 0;
  const invPart = inv.status === 'ok' ? 1 : inv.status === 'tight' ? 0.5 : 0;
  const altPart = altStatus === 'ok' ? 1 : altStatus === 'unsupported' ? 0.5 : 0;
  const parts = [
    { key: 'points', score: pointsPart, weight: W.points },
    { key: 'rules', score: rulesPart, weight: W.rules },
    { key: 'guides', score: guidesPart, weight: W.guides },
    { key: 'scenario', score: scenarioPart, weight: W.scenario },
    { key: 'invalidation', score: invPart, weight: W.invalidation },
    { key: 'alternative', score: altPart, weight: W.alternative },
  ];
  const quality = parts.reduce((s, p) => s + p.score * p.weight, 0);
  const blocked = errors.some((e) => BLOCKING.test(e.code));
  let score = quality / 100;
  let verdict: Verdict;
  if (blocked) {
    verdict = 'incorrect';
    score = Math.min(score, 0.4);
  } else if (quality >= 80 && !errors.some((e) => e.severity === 'major')) verdict = 'correct';
  else verdict = quality >= 50 ? 'partial' : 'incorrect';

  // ---- проигрывание §10
  const full: Candle[] = [...visible, ...future];
  const T = visible.length - 1;
  const userBasis = !orderBroken && !hasCode(/^EW_POINT_NOT_EXTREME$/) && userCount !== null && implied !== null;
  const altForReplay = alt && (altStatus === 'ok' || altStatus === 'unsupported') ? alt : null;
  let outcome: EwOutcome | null = null;
  if (userBasis) outcome = resolveScenario(full, T, userCount!, implied!, altForReplay, ref.limit, 'user');
  if (!outcome) outcome = resolveScenario(full, T, ref.count, ref.primary, ref.alternative, ref.limit, 'reference');
  if (!outcome) throw new Error('EW_OUTCOME_UNAVAILABLE');
  const step = TIMEFRAME_MS[tf];
  let replayEnd = Math.min(outcome.index + EW_REPLAY_TAIL, T + ref.limit);
  if (outcome.altAfterInvalidation !== null) {
    const ai = candleIndexAt(full, outcome.altAfterInvalidation, step);
    if (ai >= 0) replayEnd = Math.max(replayEnd, ai);
  }
  replayEnd = Math.min(replayEnd, full.length - 1);
  const replay = {
    candles: full.slice(T + 1, replayEnd + 1),
    exitIndex: outcome.kind === 'timeout' ? null : outcome.index - (T + 1),
  };

  // ---- навыки §13
  const badPoint = (label: string) => chk.points.some((p) => p.label === label && (!p.extreme || !p.swing));
  const impulseLabels = chk.points.filter((p) => !['A', 'B', 'C'].includes(p.label)).map((p) => p.label);
  const corrLabels = chk.points.filter((p) => ['A', 'B', 'C'].includes(p.label)).map((p) => p.label);
  const iGuides = chk.guides.filter((g) => !/^(zigzag|flat)/.test(g.guide));
  const cGuides = chk.guides.filter((g) => /^(zigzag|flat)/.test(g.guide));
  const iRules = chk.rules.filter((r) => !/^(zigzag|flat)/.test(r.rule));
  const cRules = chk.rules.filter((r) => /^(zigzag|flat)/.test(r.rule));
  const z = (n: number) => (orderBroken ? 0 : n);
  const outcomes: SkillOutcome[] = [
    {
      skill: 'ew-impulse' as SkillId,
      total: nImp + iGuides.length,
      correct: z(impulseLabels.filter((l) => !badPoint(l)).length + iGuides.filter((g) => g.ok).length),
    },
  ];
  if (corrLabels.length === 3) {
    outcomes.push({
      skill: 'ew-correction',
      total: 3 + cRules.length + cGuides.length,
      correct: z(corrLabels.filter((l) => !badPoint(l)).length + cRules.filter((r) => r.ok).length + cGuides.filter((g) => g.ok).length),
    });
  }
  outcomes.push({ skill: 'ew-rules', total: Math.max(1, iRules.length + cRules.length), correct: z(chk.rules.filter((r) => r.ok).length) });
  outcomes.push({
    skill: 'ew-invalidation',
    total: 2 + (required ? 1 : 0),
    correct: z((inv.status === 'ok' ? 1 : 0) + scenarioPart + (required && altStatus === 'ok' ? 1 : 0)),
  });
  const skillOutcomes = outcomes.map((o) => ({ ...o, correct: Math.min(o.correct, o.total) }));

  // ---- «что понято верно»
  const ok: OkItem[] = [];
  if (!orderBroken) {
    const goodPts = nPoints - chk.points.filter((p) => !p.extreme || !p.swing).length;
    if (goodPts > 0) ok.push({ code: 'OK_EW_POINTS', params: { count: goodPts, total: nPoints } });
    if (chk.rules.length && chk.rules.every((r) => r.ok)) ok.push({ code: 'OK_EW_RULES', params: { rulesText: chk.rules.map((r) => EW_RULE_NAME_RU[r.rule]).join('; ') } });
    if (guidesOk > 0) ok.push({ code: 'OK_EW_GUIDES', params: { count: guidesOk, total: chk.guides.length } });
    if (chk.extended3 && chk.lengths.length >= 5) ok.push({ code: 'OK_EW_EXTENDED3', params: { lenThree: chk.lengths[2]!, lenOne: chk.lengths[0]!, lenFive: chk.lengths[4]! } });
    if (chk.correction && chk.correction.validTypes.includes(chk.correction.given)) {
      ok.push({ code: 'OK_EW_CORRECTION', params: { type: EW_CORR_TYPE_RU[chk.correction.given], retrB: round3(chk.ratios.retrB!), cBeyond: round3(chk.ratios.cBeyond!) } });
    }
  }
  if (inv.status === 'ok') ok.push({ code: 'OK_EW_INVALIDATION', params: { price: answer.invalidation!, ruleText: EW_RULE_TEXT_RU[ruleRef] } });
  if (altStatus === 'ok') {
    ok.push({ code: 'OK_EW_ALT', params: { alt: EW_SCENARIO_LABEL_RU[alt!], altTrigger: EW_ALT_TRIGGER_RU[alt === 'bc-next' || alt === 'correction-extends' || alt === 'impulse-extends' ? alt : 'other'] } });
  }

  // ---- эталон
  const reference: Mark[] = ref.references.flatMap((c, i) => countMarks(c, i === 0 ? '' : `:${c.scenario}`));
  reference.push(invalidationMark(scenarioRule(ref.count, ref.primary, null)!.invalidation, ref.lastPivot.time));

  const detail: ElliottDetail = {
    direction: chk.direction,
    points: chk.points,
    lengths: chk.lengths,
    ratios: chk.ratios,
    extended3: chk.extended3,
    rules: chk.rules,
    guides: chk.guides,
    correction: chk.correction,
    scenario: {
      primary: answer.primary,
      implied,
      alternative: alt,
      altStatus,
      secondaryLimit: secondaryLimit(chk),
    },
    invalidation: { given: answer.invalidation, ruleLevel, ruleRef, tolerance: ref.invTol, status: inv.status, reason: inv.reason },
    validCounts: ref.scan.byScenario,
    quality: { score: quality, parts },
    outcome,
  };

  const outcomeText = fillTemplate(EW_OUTCOME_TEXT_RU[outcome.kind], {
    confirm: price(outcome.levels.confirm),
    altConfirm: outcome.levels.altConfirm === null ? '—' : price(outcome.levels.altConfirm),
    invalidation: price(outcome.levels.invalidation),
    limit: ref.limit,
  });

  // major первыми (стабильно)
  const ordered = [...errors.filter((e) => e.severity === 'major'), ...errors.filter((e) => e.severity !== 'major')];
  return {
    verdict, score, errors: ordered, skillOutcomes, ok, detail, reference, replay,
    verdictParams: { outcomeText, outcomeTime: outcome.time },
    toleranceCandles: 2,
  };
}

/** Разметка по снапнутым точкам, когда порядок нарушен (для расчёта уровня invalidation). */
function userCountFromSnap(chk: EwCheck): WaveCount | null {
  if (!chk.direction || chk.snapped.length < 3) return null;
  const nImp = chk.snapped.length >= 9 ? 6 : chk.snapped.length;
  if (![3, 5, 6].includes(nImp)) return null;
  return {
    direction: chk.direction,
    impulse: chk.snapped.slice(0, nImp),
    correction: chk.snapped.length >= 9 ? { type: 'zigzag', points: chk.snapped.slice(6, 9) } : null,
    scenario: nImp === 3 ? 'w3-next' : nImp === 5 ? 'w5-next' : chk.snapped.length >= 9 ? 'trend-next' : 'abc-next',
    amplitude: 0,
  };
}

/** bc-next поддержан, если в перечне разметок есть 0..5 + A, где A - последняя точка пользователя. */
function bcSupported(ref: EwRef, lastIndex: number, chk: EwCheck): boolean {
  void chk;
  return ref.scan.counts.some((c) => c.scenario === 'bc-next' && c.correction!.points[0]!.index === lastIndex);
}

/** Потолок будущей 5-й при L3 < L1 (справочно, не оценивается). */
function secondaryLimit(chk: EwCheck): number | null {
  if (chk.orderBroken || chk.snapped.length !== 5 || !chk.measures) return null;
  const [L1, , L3] = chk.measures.L;
  if (L1 === undefined || L3 === undefined || !(L3 < L1)) return null;
  const sg = chk.direction === 'bull' ? 1 : -1;
  return sg * (chk.v[4]! + L3);
}

