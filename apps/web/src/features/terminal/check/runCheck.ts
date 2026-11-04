// Клиентская проверка разметки терминала (ALGORITHMS §12, §1.6): gradeMarks(userMarks, buildAlgoMarkSet(...)).
// Результат не сохраняется как попытка (решение MVP: проверки терминала не идут в прогресс).
import {
  analyzeStructure,
  buildAlgoMarkSet,
  buildFeedback,
  closedOnly,
  gradeMarks,
  msParamsFor,
  type Candle,
  type Feedback,
  type FeedbackBlock,
  type Mark,
  type MarkGradeResult,
  type SkillId,
  type Timeframe,
} from '@tl/core';

export type CheckState = 'match' | 'missed' | 'extra';

export interface CheckResult {
  grade: MarkGradeResult;
  feedback: Feedback;
  /** Метки эталона (алгоритма) для показа поверх графика. */
  algoMarks: Mark[];
  /** Состояние каждой метки: id метки пользователя или эталона -> match/missed/extra. */
  states: Record<string, CheckState>;
  /** «N из M ваших меток подтверждено»: M - метки пользователя, учтённые в проверке (F-05). */
  summary: { matched: number; total: number };
  /** Пропуски эталона в диапазоне: блоки «Пропущено ...» для свёрнутого раздела (K = missedBlocks.length). */
  missedBlocks: FeedbackBlock[];
  /** Окно оценки (индексы закрытых свечей). */
  window: { fromIndex: number; toIndex: number };
}

/** Запас после последней метки пользователя, свечей. */
export const RANGE_TAIL_CANDLES = 3;

const CONCEPT_OF: Partial<Record<Mark['kind'], SkillId>> = {
  'swing-high': 'swing',
  'swing-low': 'swing',
  hh: 'structure-labels',
  hl: 'structure-labels',
  lh: 'structure-labels',
  ll: 'structure-labels',
  bos: 'bos',
  choch: 'choch',
  sweep: 'sweep',
  'order-block': 'order-block',
  fvg: 'fvg',
};

/** Понятия по типам меток пользователя; BOS и CHoCH всегда оцениваются вместе со swing (§13.2). */
export function conceptsFor(marks: readonly Mark[]): SkillId[] {
  const set = new Set<SkillId>();
  for (const m of marks) {
    const c = CONCEPT_OF[m.kind];
    if (c) set.add(c);
  }
  // BOS и CHoCH различаются только вместе; swing без запроса не оцениваем (иначе каждый непомеченный swing - «пропуск»)
  if (set.has('bos') || set.has('choch')) {
    set.add('bos');
    set.add('choch');
  }
  return [...set];
}

export type CheckOutcome = { ok: true; result: CheckResult } | { ok: false; reason: 'no-marks' | 'no-concepts' | 'no-candles' };

/**
 * Окно - от свечи первой метки пользователя до последней закрытой свечи; понятия - по типам меток.
 * Эталон строится по ВСЕМ закрытым свечам текущего ТФ (прогрев машины состояний).
 */
export function runCheck(candles: readonly Candle[], tf: Timeframe, userMarks: readonly Mark[]): CheckOutcome {
  const closed = closedOnly(candles);
  if (closed.length < 20) return { ok: false, reason: 'no-candles' };
  const scored = userMarks.filter((m) => CONCEPT_OF[m.kind]);
  if (scored.length === 0) return { ok: false, reason: userMarks.length ? 'no-concepts' : 'no-marks' };
  const concepts = conceptsFor(scored);
  const first = Math.min(...scored.map((m) => Math.min(...m.anchors.map((a) => a.time))));
  let from = closed.findIndex((c) => c.openTime >= first);
  if (from < 0) from = closed.length - 1;
  // Диапазон оценки (решение F-05): [первая метка пользователя, последняя + 3 свечи].
  // SYNC-CORE: когда Core добавит опции range/kinds в buildAlgoMarkSet/gradeMarks, перейти на них; пока фильтруем здесь.
  const lastT = Math.max(...scored.map((m) => Math.max(...m.anchors.map((a) => a.time))));
  let lastIdx = closed.findIndex((c) => c.openTime >= lastT);
  if (lastIdx < 0) lastIdx = closed.length - 1;
  const window = { fromIndex: from, toIndex: Math.min(closed.length - 1, Math.max(from, lastIdx) + RANGE_TAIL_CANDLES) };
  const r = analyzeStructure(closed, msParamsFor('medium'), { tf });
  // Внутренняя (internal) структура: пробои (BOS/CHoCH) обязательны наравне с внешними - иначе BOS на месте
  // внутреннего CHoCH нельзя разобрать; остальные внутренние объекты допустимы, но не обязательны.
  const full = buildAlgoMarkSet(r, { concepts: [...concepts, 'internal-external'], window });
  // Только типы меток, поставленные пользователем (BOS и CHoCH различаются только вместе).
  const kinds = new Set<Mark['kind']>(scored.map((m) => m.kind));
  if (kinds.has('bos') || kinds.has('choch')) {
    kinds.add('bos');
    kinds.add('choch');
  }
  const optional = (m: Mark) => (m.scope === 'internal' && m.kind !== 'bos' && m.kind !== 'choch') || !kinds.has(m.kind);
  const algo = {
    ...full,
    required: full.required.filter((m) => !optional(m)),
    tolerated: [...full.tolerated, ...full.required.filter(optional)],
  };
  const grade = gradeMarks(scored, algo, {
    candles: closed,
    window,
    concepts,
    toleranceCandles: 2,
    iouMin: 0.5,
    levelPricePct: 0.1,
    scoped: false,
  });
  const isMissed = (e: { code: string }) => e.code.endsWith('_MISSED');
  const feedbackOf = (errors: typeof grade.errors) =>
    buildFeedback({
      module: 'market-structure',
      verdict: grade.verdict,
      score: grade.score,
      errors,
      skillOutcomes: grade.skillOutcomes,
      toleranceCandles: grade.toleranceCandles,
    });
  // Разбор по ошибкам пользователя; пропуски эталона уходят в свёрнутый раздел.
  const feedback = feedbackOf(grade.errors.filter((e) => !isMissed(e)));
  const missedBlocks = feedbackOf(grade.errors.filter(isMissed)).mistakes;
  const states: Record<string, CheckState> = {};
  for (const p of grade.okPairs) {
    states[p.userMarkId] = 'match';
    states[p.algoMarkId] = 'match';
  }
  for (const m of grade.matched) {
    states[m.userMarkId] ??= 'match';
    states[m.algoMarkId] ??= 'match';
  }
  // Пара совпала по месту, но есть ошибка по ней (например, BOS вместо CHoCH): метка пользователя - «лишнее», эталон - «пропущено».
  for (const e of grade.errors) {
    for (const id of e.markIds ?? []) {
      if (states[id] === 'match') states[id] = id.startsWith('algo:') ? 'missed' : 'extra';
    }
  }
  for (const m of grade.missed) states[m.id] = 'missed';
  for (const m of grade.extra) states[m.id] = 'extra';
  const shown = new Map<string, Mark>();
  for (const m of [...algo.required, ...grade.missed]) shown.set(m.id, m);
  for (const m of grade.matched) {
    const a = [...algo.required, ...algo.tolerated].find((x) => x.id === m.algoMarkId);
    if (a) shown.set(a.id, a);
  }
  const userIds = new Set(scored.map((m) => m.id));
  const summary = { matched: scored.filter((m) => states[m.id] === 'match').length, total: userIds.size };
  return { ok: true, result: { grade, feedback, missedBlocks,
      algoMarks: [...shown.values()],
      states,
      summary,
      window,
    } };
}
