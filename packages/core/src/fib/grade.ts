// Оценка ответов Fibonacci (FIBONACCI.md §5.2, §6.6, §7.3, §10): gradeFibGrid / gradeFibReaction / gradeFibExtension.
import {
  FIB_CONF_TEXT_RU,
  FIB_DEEP_END_TEXT_RU,
  FIB_DIR_TEXT_RU,
  FIB_END_REASON_RU,
  FIB_EXT_END_TEXT_RU,
  FIB_FACTOR_NAME_RU,
  FIB_FACTOR_RULE_RU,
  FIB_LEG_TEXT_RU,
  FIB_OPTION_LABEL_RU,
  FIB_POINT_RULE_RU,
  FIB_START_REASON_RU,
  FIB_TARGET_LABEL_RU,
  FIB_THR_TEXT_RU,
} from '../feedback/templates.ru';
import type { OkItem } from '../feedback/types';
import { candleIndexAt } from '../smc/series';
import { TIMEFRAME_MS } from '../types';
import type { Anchor, Candle, GradeError, Mark, SkillOutcome, TaskTimeframe, UtcMs, Verdict } from '../types';
import { FIB_CONFLUENCE_KEYS, bandOf } from './confluence';
import { TARGET_ORDER } from './extension';
import { fibExtensionPrice } from './levels';
import { extensionMark, gridMark, reactionHints } from './marks';
import { levelScore } from './reaction';
import {
  FIB_TOLERANCE_CANDLES,
  extensionReplayRange,
  reactionReplayRange,
  type ExtensionRef,
  type GridRef,
  type ReactionRef,
} from './ref';
import type {
  FibAnchorCheck,
  FibConfluenceKey,
  FibDetail,
  FibDirection,
  FibExtensionAnswer,
  FibGridAnswer,
  FibReactionAnswer,
  FibTarget,
  Impulse,
} from './types';

export interface FibGradeOutput {
  verdict: Verdict;
  score: number;
  errors: GradeError[];
  skillOutcomes: SkillOutcome[];
  ok: OkItem[];
  detail: FibDetail;
  /** Эталонные метки (реальное время; сдвиг шкалы - на стороне сервера). */
  reference: Mark[];
  replay?: { candles: Candle[]; exitIndex: number | null };
  toleranceCandles: number;
}

const verdictOf = (score: number): Verdict => (score >= 1 - 1e-9 ? 'correct' : score >= 0.5 ? 'partial' : 'incorrect');
const signed = (n: number): string => (n > 0 ? `+${n}` : String(n));
const f3 = (x: number): string => x.toFixed(3);

// ------------------------------------------------------------------ привязка якорей

export interface SnapInput {
  /** Видимый ряд (индексы эталона - в нём). */
  candles: readonly Candle[];
  tf: TaskTimeframe;
}

/** Индекс свечи по времени якоря, -1 - вне ряда. */
export function anchorIndex(c: SnapInput, time: UtcMs): number {
  return candleIndexAt(c.candles, time, TIMEFRAME_MS[c.tf]);
}

function userDirection(first: Anchor, second: Anchor): FibDirection | null {
  return second.price > first.price ? 'bull' : second.price < first.price ? 'bear' : null;
}

interface PointRef {
  point: 'A' | 'B' | 'C';
  index: number;
  price: number;
  time: UtcMs;
  /** Допустимый диапазон для «равного экстремума» (строго внутри). */
  equalRange: { from: number; to: number };
  /** Какая сторона свечи: low/high. */
  side: 'low' | 'high';
}

function checkPoint(c: SnapInput, ref: PointRef, userIndex: number, userDir: FibDirection | null, anchorPrice: number, forceFail = false): FibAnchorCheck & { snapIndex: number } {
  const candle = c.candles[userIndex]!;
  // снап на сервере: bull - A=low, B=high, C=low; bear - наоборот
  const wantLow = ref.side === 'low';
  const snapped = userDir === null ? anchorPrice : wantLow ? candle.low : candle.high;
  const offset = userIndex - ref.index;
  const within = Math.abs(offset) <= FIB_TOLERANCE_CANDLES;
  const equal = !within && snapped === ref.price && userIndex >= ref.equalRange.from && userIndex <= ref.equalRange.to;
  return {
    point: ref.point,
    userTime: candle.openTime,
    snappedPrice: snapped,
    offsetCandles: offset,
    refTime: ref.time,
    refPrice: ref.price,
    ok: !forceFail && (within || equal),
    equalExtreme: !forceFail && equal,
    snapIndex: userIndex,
  };
}
const strip = (k: FibAnchorCheck & { snapIndex: number }): FibAnchorCheck => {
  const { snapIndex, ...rest } = k;
  void snapIndex;
  return rest;
};

// ------------------------------------------------------------------ grid

export function gradeFibGrid(ref: GridRef, input: SnapInput, answer: FibGridAnswer): FibGradeOutput {
  const imp = ref.impulse;
  const rd = imp.direction;
  const a = imp.a.index;
  const b = imp.b.index;
  const h = imp.event.brokenSwing.index;
  const [first, second] = answer.mark.anchors as [Anchor, Anchor];
  const userDir = userDirection(first, second);
  const i0 = anchorIndex(input, first.time);
  const i1 = anchorIndex(input, second.time);
  if (i0 < 0 || i1 < 0 || i0 > ref.T || i1 > ref.T) throw new Error('FIB_ANCHOR_OUT_OF_RANGE');
  const bull = rd === 'bull';
  const sideA = bull ? 'low' : 'high';
  const sideB = bull ? 'high' : 'low';
  // свечи в сторону пользователя: для снапа пользователь решает, low/high, по своему направлению
  const uBull = userDir === 'bull';
  const snapSide = (isStart: boolean): 'low' | 'high' => (uBull ? (isStart ? 'low' : 'high') : isStart ? 'high' : 'low');
  const pA: PointRef = { point: 'A', index: a, price: imp.a.price, time: imp.a.time, equalRange: { from: a + 1, to: b - 1 }, side: sideA };
  const pB: PointRef = { point: 'B', index: b, price: imp.b.price, time: imp.b.time, equalRange: { from: b + 1, to: ref.T }, side: sideB };

  const dirOk = userDir === rd;
  // не импульс вовсе: горизонталь, одна свеча либо перевёрнутая по времени сетка в направлении импульса.
  // (Спецификация §5.2 строка 1 пишет `i0 >= i1`, но её же строка WRONG_DIRECTION - протяжка от B к A, где i0 > i1: отклонение, см. отчёт.)
  const structural = userDir === null || i0 === i1 || (userDir === rd && i0 > i1);
  const snapStart = { ...pA, side: snapSide(true) };
  const snapEnd = { ...pB, side: snapSide(false) };
  // для userDir === null snapped = NaN; сторона для отчёта берётся эталонная
  const cA = checkPoint(input, userDir === null ? pA : snapStart, i0, userDir, first.price, !dirOk || structural);
  const cB = checkPoint(input, userDir === null ? pB : snapEnd, i1, userDir, second.price, !dirOk || structural);
  // равный экстремум требует совпадения стороны эталона: если пользователь снапнулся к другой стороне, цена не равна по определению
  const errors: GradeError[] = [];
  const ok: OkItem[] = [];
  let points = 0;
  const refPts = {
    refStartTime: imp.a.time, refStartPrice: imp.a.price, refEndTime: imp.b.time, refEndPrice: imp.b.price,
  };
  const userPts = { userStartTime: cA.userTime, userEndTime: cB.userTime };
  const notImpulse = (legKind: 'correction' | 'previous-leg' | 'other') =>
    errors.push({
      code: 'FIB_NOT_IMPULSE', skill: 'fib-anchor', severity: 'major',
      params: {
        legText: FIB_LEG_TEXT_RU[legKind], ...userPts,
        eventKind: imp.event.kind === 'bos' ? 'BOS' : 'CHoCH', eventTime: imp.event.breakTime, ...refPts,
      },
    });

  if (structural) {
    notImpulse('other');
  } else if (!dirOk) {
    if (Math.abs(i0 - b) <= FIB_TOLERANCE_CANDLES && Math.abs(i1 - a) <= FIB_TOLERANCE_CANDLES) {
      errors.push({
        code: 'FIB_WRONG_DIRECTION', skill: 'fib-anchor', severity: 'major',
        params: { givenDir: FIB_DIR_TEXT_RU[userDir!], expectedDir: FIB_DIR_TEXT_RU[rd], ...refPts },
      });
    } else if (Math.abs(i0 - b) <= FIB_TOLERANCE_CANDLES && i1 > b + FIB_TOLERANCE_CANDLES) notImpulse('correction');
    else notImpulse('other');
  } else {
    points = (cA.ok ? 1 : 0) + (cB.ok ? 1 : 0);
    if (points === 2) {
      ok.push({ code: 'OK_FIB_ANCHOR', params: { startTime: cA.userTime, endTime: cB.userTime, tol: FIB_TOLERANCE_CANDLES } });
    } else if (!cA.ok && cB.ok) {
      const reason = i0 <= h ? 'previous-leg' : Math.abs(cA.offsetCandles) <= 4 ? 'offset' : i0 > a && i0 < b ? 'internal' : 'offset';
      errors.push({
        code: 'FIB_WRONG_ANCHOR_START', skill: 'fib-anchor', severity: 'major',
        params: {
          userTime: cA.userTime, userPrice: cA.snappedPrice, refTime: imp.a.time, refPrice: imp.a.price, offset: signed(cA.offsetCandles),
          tol: FIB_TOLERANCE_CANDLES, reasonText: FIB_START_REASON_RU[reason], sideName: sideA, brokenTime: imp.event.brokenSwing.time, eventTime: imp.event.breakTime,
        },
      });
    } else if (cA.ok && !cB.ok) {
      const reason = Math.abs(cB.offsetCandles) <= 4 ? 'offset' : i1 > a && i1 < b ? 'short' : 'offset';
      errors.push({
        code: 'FIB_WRONG_ANCHOR_END', skill: 'fib-anchor', severity: 'major',
        params: {
          userTime: cB.userTime, userPrice: cB.snappedPrice, refTime: imp.b.time, refPrice: imp.b.price, offset: signed(cB.offsetCandles),
          tol: FIB_TOLERANCE_CANDLES, reasonText: FIB_END_REASON_RU[reason], level: imp.event.level,
        },
      });
    } else {
      notImpulse(Math.max(i0, i1) < a ? 'previous-leg' : Math.min(i0, i1) >= b - 2 ? 'correction' : 'other');
    }
    if (ref.pending && cB.ok) {
      errors.push({ code: 'FIB_IMPULSE_UNCONFIRMED', skill: 'fib-anchor', severity: 'minor', params: { userTime: cB.userTime, n: ref.nExt } });
    }
    for (const x of [cA, cB]) {
      if (x.equalExtreme) ok.push({ code: 'OK_FIB_EQUAL_EXTREME', params: { point: x.point, userTime: x.userTime, price: x.snappedPrice, refTime: x.refTime } });
    }
  }

  const gridShift =
    userDir === null || structural
      ? null
      : Math.max(Math.abs(cA.snappedPrice - imp.a.price), Math.abs(cB.snappedPrice - imp.b.price)) / Math.abs(imp.b.price - imp.a.price);
  const score = points / 2;
  return {
    verdict: verdictOf(score),
    score,
    errors,
    skillOutcomes: [{ skill: 'fib-anchor', correct: points, total: 2 }],
    ok,
    detail: { direction: { user: userDir, ref: rd }, anchors: [strip(cA), strip(cB)], gridShift },
    reference: [gridMark(imp)],
    toleranceCandles: FIB_TOLERANCE_CANDLES,
  };
}

// ------------------------------------------------------------------ reaction

export function gradeFibReaction(ref: ReactionRef, input: SnapInput, answer: FibReactionAnswer): FibGradeOutput {
  const imp = ref.impulse;
  const [A, B] = [imp.a.price, imp.b.price];
  const o = ref.outcome;
  const series = ref.series;
  const lvl = levelScore(answer.option, ref.cls, o);
  const chosen = ref.confluence.atOption(answer.option);
  const claimed = [...new Set(answer.confluence)].filter((k) => FIB_CONFLUENCE_KEYS.includes(k)) as FibConfluenceKey[];
  const rightClaims = claimed.filter((k) => chosen[k]);
  const wrongClaims = claimed.filter((k) => !chosen[k]);
  const pdAsked = ref.pd.asked;
  const pdGiven = pdAsked ? answer.pd : null;
  const pdOk = pdAsked ? pdGiven === ref.pd.expected : true;
  const label = FIB_OPTION_LABEL_RU;
  const errors: GradeError[] = [];
  const ok: OkItem[] = [];

  const extreme = series[o.extremeIndex]!;
  const confFound = FIB_CONFLUENCE_KEYS.filter((k) => ref.atReference[k]);
  const cCommon = { cPrice: o.extremePrice, depth: f3(o.depth), cTime: extreme.openTime };
  if (lvl < 1) {
    if (ref.cls.kind === 'level') {
      errors.push({
        code: 'FIB_LEVEL_MISS', skill: 'fib-reaction', severity: lvl === 0.5 ? 'minor' : 'major',
        params: {
          given: label[answer.option], expected: label[ref.referenceOption], ...cCommon,
          thr: o.threshold, thrText: FIB_THR_TEXT_RU[o.thresholdBy], reactionTime: series[o.index]!.openTime,
          confText: confFound.length ? confFound.map((k) => FIB_CONF_TEXT_RU[k]).join(', ') : 'нет',
        },
      });
    } else {
      errors.push({
        code: 'FIB_DEEP_MISSED', skill: 'fib-reaction', severity: 'major',
        params: { given: label[answer.option], ...cCommon, endText: FIB_DEEP_END_TEXT_RU[o.kind === 'fail' ? 'fail' : 'reaction'] },
      });
    }
  } else {
    ok.push({ code: 'OK_FIB_REACTION', params: { given: label[answer.option], ...cCommon } });
  }
  if (pdAsked && !pdOk) {
    errors.push({
      code: 'FIB_PD_WRONG', skill: 'premium-discount', severity: 'major',
      params: { price: ref.pd.price, given: pdGiven ?? 'нет ответа', expected: ref.pd.expected, eq: ref.pd.eq },
    });
  } else if (pdAsked) ok.push({ code: 'OK_PD', params: { price: ref.pd.price, expected: ref.pd.expected, eq: ref.pd.eq } });
  const band = bandOf(A, B, answer.option);
  for (const k of wrongClaims) {
    errors.push({
      code: 'FIB_CONFLUENCE_WRONG', skill: 'fib-reaction', severity: 'minor',
      params: {
        factorName: FIB_FACTOR_NAME_RU[k], given: label[answer.option], low: band?.low ?? 0, high: band?.high ?? 0, factorRule: FIB_FACTOR_RULE_RU[k],
      },
    });
  }
  if (claimed.length > 0 && wrongClaims.length === 0) {
    ok.push({ code: 'OK_FIB_CONFLUENCE', params: { factors: claimed.map((k) => FIB_FACTOR_NAME_RU[k]).join(', ') } });
  }

  const parts: { w: number; s: number }[] = [{ w: 0.6, s: lvl }];
  if (pdAsked) parts.push({ w: 0.2, s: pdOk ? 1 : 0 });
  if (claimed.length > 0) parts.push({ w: 0.2, s: rightClaims.length / claimed.length });
  const score = parts.reduce((a, p) => a + p.w * p.s, 0) / parts.reduce((a, p) => a + p.w, 0);
  const verdict: Verdict = lvl === 1 && pdOk && wrongClaims.length === 0 ? 'correct' : score >= 0.5 ? 'partial' : 'incorrect';

  const skillOutcomes: SkillOutcome[] = [
    { skill: 'fib-reaction', correct: (lvl === 1 ? 1 : 0) + rightClaims.length, total: 1 + claimed.length },
  ];
  if (pdAsked) skillOutcomes.push({ skill: 'premium-discount', correct: pdOk ? 1 : 0, total: 1 });

  const range = reactionReplayRange(ref);
  const levelRef: Mark = {
    id: 'algo:level:-:-:fib-reaction',
    kind: 'level',
    anchors: [{ time: extreme.openTime, price: o.extremePrice }],
    scope: null,
    direction: imp.direction,
    meta: { role: 'fib-reaction', depth: o.depth, option: ref.referenceOption },
    author: 'algo',
  };
  const zone = ref.confluence.zoneMarks(bandOf(A, B, ref.referenceOption));
  const outcomeKind: 'reaction' | 'fail' = o.kind === 'fail' ? 'fail' : 'reaction';
  return {
    verdict,
    score,
    errors,
    skillOutcomes,
    ok,
    detail: {
      direction: { user: imp.direction, ref: imp.direction },
      anchors: [],
      gridShift: null,
      reaction: {
        option: answer.option,
        correctOptions: ref.correct,
        levelScore: lvl,
        outcome: { kind: outcomeKind, time: series[o.index]!.openTime, extremeTime: extreme.openTime, extremePrice: o.extremePrice, depth: o.depth, threshold: o.threshold },
        pd: { asked: pdAsked, given: pdGiven, expected: pdAsked ? ref.pd.expected : null, price: pdAsked ? ref.pd.price : null, eq: ref.pd.eq },
        confluence: { claimed, atChosen: chosen, atReference: ref.atReference },
      },
    },
    reference: [gridMark(imp), levelRef, ...zone],
    replay: { candles: series.slice(range.from, range.to + 1) as Candle[], exitIndex: range.exit },
    toleranceCandles: FIB_TOLERANCE_CANDLES,
  };
}

// ------------------------------------------------------------------ extension

export interface ExtensionPointsResult {
  userDir: FibDirection | null;
  checks: (FibAnchorCheck & { snapIndex: number })[];
  okPoints: number;
  errors: GradeError[];
  ok: OkItem[];
}

/** Проверка точек A-B-C (§7.3): направление, снап, допуск ±2 или равный экстремум. */
export function evaluateExtensionPoints(
  imp: Pick<Impulse, 'direction' | 'a' | 'b'>,
  c: { index: number; time: UtcMs; price: number },
  T: number,
  input: SnapInput,
  mark: Mark,
): ExtensionPointsResult {
  const rd = imp.direction;
  const bull = rd === 'bull';
  const [aIdx, bIdx, cIdx] = [imp.a.index, imp.b.index, c.index];
  const [x0, x1, x2] = mark.anchors as [Anchor, Anchor, Anchor];
  const userDir = userDirection(x0, x1);
  const idx = [anchorIndex(input, x0.time), anchorIndex(input, x1.time), anchorIndex(input, x2.time)] as const;
  if (idx.some((i) => i < 0 || i > T)) throw new Error('FIB_ANCHOR_OUT_OF_RANGE');
  const uBull = userDir === 'bull';
  const dirOk = userDir === rd;
  const sideOf = (p: 'A' | 'B' | 'C'): 'low' | 'high' => {
    if (userDir === null) return p === 'B' ? (bull ? 'high' : 'low') : bull ? 'low' : 'high';
    return p === 'B' ? (uBull ? 'high' : 'low') : uBull ? 'low' : 'high';
  };
  const refs: PointRef[] = [
    { point: 'A', index: aIdx, price: imp.a.price, time: imp.a.time, equalRange: { from: aIdx + 1, to: bIdx - 1 }, side: sideOf('A') },
    { point: 'B', index: bIdx, price: imp.b.price, time: imp.b.time, equalRange: { from: bIdx + 1, to: T }, side: sideOf('B') },
    { point: 'C', index: cIdx, price: c.price, time: c.time, equalRange: { from: cIdx + 1, to: T }, side: sideOf('C') },
  ];
  const checks = refs.map((r, i) => checkPoint(input, r, idx[i]!, userDir, [x0, x1, x2][i]!.price, !dirOk));
  const okPoints = checks.filter((k) => k.ok).length;
  const errors: GradeError[] = [];
  const ok: OkItem[] = [];
  if (!dirOk) {
    errors.push({
      code: 'EXT_WRONG_DIRECTION', skill: 'fib-anchor', severity: 'major',
      params: {
        givenDir: FIB_DIR_TEXT_RU[userDir ?? 'none'], expectedDir: FIB_DIR_TEXT_RU[rd],
        refATime: imp.a.time, refAPrice: imp.a.price, refBTime: imp.b.time, refBPrice: imp.b.price, refCTime: c.time, refCPrice: c.price,
      },
    });
  } else {
    for (const k of checks) {
      if (k.ok) continue;
      errors.push({
        code: 'EXT_WRONG_POINTS', skill: k.point === 'C' ? 'fib-extension' : 'fib-anchor', severity: 'major',
        params: {
          point: k.point, userTime: k.userTime, userPrice: k.snappedPrice, refTime: k.refTime, refPrice: k.refPrice, offset: signed(k.offsetCandles),
          tol: FIB_TOLERANCE_CANDLES, pointRule: FIB_POINT_RULE_RU[k.point], sideName: refs.find((r) => r.point === k.point)!.side === 'low' ? 'low' : 'high',
        },
      });
    }
    if (okPoints === 3) ok.push({ code: 'OK_EXT_POINTS' });
    for (const k of checks) {
      if (k.equalExtreme) ok.push({ code: 'OK_FIB_EQUAL_EXTREME', params: { point: k.point, userTime: k.userTime, price: k.snappedPrice, refTime: k.refTime } });
    }
  }
  return { userDir, checks, okPoints, errors, ok };
}

export function gradeFibExtension(ref: ExtensionRef, input: SnapInput, answer: FibExtensionAnswer): FibGradeOutput {
  const imp = ref.impulse;
  const rd = imp.direction;
  const { userDir, checks, okPoints, errors, ok } = evaluateExtensionPoints(imp, ref.c, ref.T, input, answer.mark);

  // цель оценивается по эталонной сетке
  const o = ref.outcome;
  const pos = (t: FibTarget) => TARGET_ORDER.indexOf(t);
  const diff = pos(o.reached) - pos(answer.target);
  const targetScore = diff === 0 ? 1 : diff === 1 ? 0.5 : diff >= 2 ? 0.25 : 0;
  const series = ref.series;
  const [A, B, C] = [imp.a.price, imp.b.price, ref.c.price];
  const maxTime = series[o.extremeIndex]!.openTime;
  const endTime = series[o.endIndex]!.openTime;
  if (targetScore === 1) {
    ok.push({ code: 'OK_EXT_TARGET', params: { target: FIB_TARGET_LABEL_RU[answer.target], maxPrice: o.extremePrice, xMax: f3(o.xMax) } });
  } else if (diff < 0) {
    errors.push({
      code: 'EXT_TARGET_MISS', skill: 'fib-extension', severity: 'major',
      params: {
        target: FIB_TARGET_LABEL_RU[answer.target], targetPrice: fibExtensionPrice(A, B, C, Number(answer.target)), maxPrice: o.extremePrice, xMax: f3(o.xMax), maxTime,
        endText: FIB_EXT_END_TEXT_RU[o.invalidationIndex === null ? 'limit' : 'invalidation'], endTime, reached: FIB_TARGET_LABEL_RU[o.reached],
      },
    });
  } else {
    errors.push({
      code: 'EXT_TARGET_CONSERVATIVE', skill: 'fib-extension', severity: 'minor',
      params: { target: FIB_TARGET_LABEL_RU[answer.target], reached: FIB_TARGET_LABEL_RU[o.reached], maxPrice: o.extremePrice },
    });
  }

  const score = 0.5 * (okPoints / 3) + 0.5 * targetScore;
  const verdict: Verdict = okPoints === 3 && targetScore === 1 ? 'correct' : score >= 0.5 ? 'partial' : 'incorrect';
  const okA = checks[0]!.ok ? 1 : 0;
  const okB = checks[1]!.ok ? 1 : 0;
  const okC = checks[2]!.ok ? 1 : 0;
  const range = extensionReplayRange(ref);
  return {
    verdict,
    score,
    errors,
    skillOutcomes: [
      { skill: 'fib-anchor', correct: okA + okB, total: 2 },
      { skill: 'fib-extension', correct: okC + (targetScore === 1 ? 1 : 0), total: 2 },
    ],
    ok,
    detail: {
      direction: { user: userDir, ref: rd },
      anchors: checks.map(strip),
      gridShift: null,
      extension: {
        target: answer.target,
        reached: o.reached,
        xMax: o.xMax,
        extremePrice: o.extremePrice,
        extremeTime: maxTime,
        invalidationTime: o.invalidationIndex === null ? null : series[o.invalidationIndex]!.openTime,
        endTime,
      },
    },
    reference: [extensionMark(imp, ref.c)],
    replay: { candles: series.slice(range.from, range.to + 1) as Candle[], exitIndex: range.exit },
    toleranceCandles: FIB_TOLERANCE_CANDLES,
  };
}

export { reactionHints };
export type { Impulse };
