// Попытка курса для хранения: без свечей проигрывания, времена разбора в реальном времени (шкала задания сдвинута).
import type { Feedback, GradeError, Verdict } from '@tl/core';
import { revealErrors, revealFeedback } from '../fibonacci/reveal';

export function storableCurGrade<G extends { feedback: Feedback; verdict: Verdict; errors?: readonly GradeError[]; replay?: unknown; task?: { reveal?: { shiftMs: number } } }>(g: G): Omit<G, 'replay'> {
  const { replay: _replay, ...rest } = g;
  void _replay;
  const shift = g.task?.reveal?.shiftMs ?? 0;
  return { ...rest, feedback: revealFeedback(g.feedback, shift), ...(g.errors ? { errors: revealErrors(g.errors, shift) } : {}) };
}
