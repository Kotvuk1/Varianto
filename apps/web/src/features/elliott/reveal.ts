// Elliott: времена разбора приходят на шкале задания (relative); показываем и храним реальные. Вердикт остаётся «Верно N%».
import type { Feedback, GradeError } from '@tl/core';
import { revealErrors, revealFeedback } from '../fibonacci/reveal';

/** Попытка для хранения: без свечей проигрывания, с реальными временами в разборе и ошибках. */
export function storableElliott<G extends { feedback: Feedback; errors?: readonly GradeError[]; replay?: unknown; task?: { reveal?: { shiftMs: number } } }>(g: G): Omit<G, 'replay'> {
  const { replay: _replay, ...rest } = g;
  void _replay;
  const shift = g.task?.reveal?.shiftMs ?? 0;
  return { ...rest, feedback: revealFeedback(g.feedback, shift), ...(g.errors ? { errors: revealErrors(g.errors, shift) } : {}) };
}
