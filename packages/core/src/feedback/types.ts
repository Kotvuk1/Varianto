// Типы разбора (API_CONTRACTS §5.2).
import type { ErrorCode, GradeError, ModuleId, OkCode, SkillOutcome, Verdict } from '../types';

export interface FeedbackBlock {
  /** Ключ шаблона `feedback.*` (см. templates.ru.ts). */
  templateKey: string;
  code: ErrorCode | OkCode | null;
  params?: Record<string, string | number>;
  markIds?: string[];
  glyph: 'match' | 'miss' | 'extra' | 'info';
}

export interface Feedback {
  verdict: FeedbackBlock;
  understood: FeedbackBlock[];
  mistakes: FeedbackBlock[];
  why: FeedbackBlock[];
  howTo: FeedbackBlock[];
  principle: FeedbackBlock;
}

export interface OkItem {
  code: OkCode;
  params?: Record<string, string | number>;
  markIds?: string[];
}

export interface FeedbackInput {
  module: ModuleId;
  verdict: Verdict;
  /** 0..1. */
  score: number;
  errors: readonly GradeError[];
  /** Явные блоки «что понято верно» (PA-level, Context, Challenge, ...). */
  ok?: readonly OkItem[];
  /** Если `ok` не задан — блоки выводятся из исходов навыков (метки). */
  skillOutcomes?: readonly SkillOutcome[];
  /** Допуск по времени для OK_SWING ({tol}); по умолчанию 2. */
  toleranceCandles?: number;
  /** Шаг цены символа: цены в params округляются по нему (по умолчанию 2 знака). */
  tickSize?: number;
}
