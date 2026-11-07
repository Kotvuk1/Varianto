// Fibonacci: времена разбора приходят на шкале задания (reaction/extension сдвинуты); показываем реальные.
import { isTimeParam, type Feedback, type FeedbackBlock, type GradeError, type Verdict } from '@tl/core';

type Params = Record<string, string | number>;

/** Сдвигает числовые параметры-времена (`time`, `*Time`) на shiftMs; остальное без изменений. */
export function shiftTimeParams(params: Params | undefined, shiftMs: number): Params | undefined {
  if (!params || shiftMs === 0) return params;
  const out: Params = {};
  for (const [k, v] of Object.entries(params)) out[k] = typeof v === 'number' && isTimeParam(k) ? v + shiftMs : v;
  return out;
}

const block = (b: FeedbackBlock, shift: number): FeedbackBlock => {
  const params = shiftTimeParams(b.params, shift);
  return params ? { ...b, params } : b;
};

/** Разбор с реальными временами в параметрах (на графике шкала остаётся сдвинутой). */
export function revealFeedback(f: Feedback, shiftMs: number): Feedback {
  if (shiftMs === 0) return f;
  const m = (xs: FeedbackBlock[]) => xs.map((b) => block(b, shiftMs));
  return {
    verdict: block(f.verdict, shiftMs),
    understood: m(f.understood),
    mistakes: m(f.mistakes),
    why: m(f.why),
    howTo: m(f.howTo),
    principle: block(f.principle, shiftMs),
  };
}

export function revealErrors(errors: readonly GradeError[], shiftMs: number): GradeError[] {
  if (shiftMs === 0) return [...errors];
  return errors.map((e) => {
    const params = shiftTimeParams(e.params as Params | undefined, shiftMs);
    return params ? ({ ...e, params } as GradeError) : e;
  });
}

/**
 * Итог Fibonacci без счёта меток (FIBONACCI.md §11.1: `feedback.verdict.plain.<verdict>`):
 * шаблон «совпало N из M эталонных меток» к сеткам неприменим.
 */
export function plainVerdict(f: Feedback, verdict: Verdict, score: number): Feedback {
  if (f.verdict.templateKey === `feedback.verdict.plain.${verdict}`) return f;
  return { ...f, verdict: { ...f.verdict, templateKey: `feedback.verdict.plain.${verdict}`, params: { score: Math.round(score * 100) } } };
}

/** Попытка для хранения: без свечей проигрывания (API_CONTRACTS §5.1), реальные времена, итог без счёта меток. */
export function storableGrade<G extends { feedback: Feedback; verdict: Verdict; score: number; errors?: readonly GradeError[]; replay?: unknown; task?: { reveal?: { shiftMs: number } } }>(g: G): Omit<G, 'replay'> {
  const { replay: _replay, ...rest } = g;
  void _replay;
  const shift = g.task?.reveal?.shiftMs ?? 0;
  return {
    ...rest,
    feedback: plainVerdict(revealFeedback(g.feedback, shift), g.verdict, g.score),
    ...(g.errors ? { errors: revealErrors(g.errors, shift) } : {}),
  };
}

