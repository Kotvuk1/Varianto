import type { Candle, Difficulty, Feedback, GradeError, Mark, MarkGrade, ModuleId, SkillOutcome, TaskSymbol, TaskTimeframe, Verdict } from '@tl/core';
import type { Answer } from '@/server/schemas';

export type { Answer };
export type TaskModule = Exclude<ModuleId, 'challenge'>;

export type MsMode = 'mark' | 'question';
export type PaType = 'find-pattern' | 'draw-level' | 'context';
export const TASK_TFS: readonly TaskTimeframe[] = ['15m', '1h', '4h', '1d'];
export const TASK_SYMBOLS: readonly TaskSymbol[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

/** Тело запроса POST /api/tasks/{module}/next (API_CONTRACTS §3.3). */
export type NextBody =
  | { difficulty: Difficulty; mode: MsMode; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] }
  | { difficulty: Difficulty; taskType: PaType; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] };

export interface TaskPayloadBase {
  kind: string;
  tf: TaskTimeframe;
}
export interface MsMarkPayload extends TaskPayloadBase {
  kind: 'ms-mark';
  concepts: string[];
  /** Явный набор проверяемых понятий (ALGO 1.1.0); у старых заданий нет. */
  focus?: string[];
  tools: string[];
  referenceKey: string;
  window: { fromTime: number; toTime: number };
}
export interface MsQuestionPayload extends TaskPayloadBase {
  kind: 'ms-question';
  questionId: string;
  promptKey: string;
  promptParams: Record<string, string | number>;
  options: { id: string; labelKey: string; labelParams?: Record<string, string | number> }[];
  highlight?: { time: number; price: number }[];
}
export interface PaFindPayload extends TaskPayloadBase {
  kind: 'pa-find';
  target: string;
  window: { fromTime: number; toTime: number };
}
export interface PaLevelPayload extends TaskPayloadBase {
  kind: 'pa-level';
  levelType: 'support' | 'resistance';
  tolerancePct: number;
}
export interface PaContextPayload extends TaskPayloadBase {
  kind: 'pa-context';
  pattern: Mark;
  factorOptions: string[];
}
export type TaskPayload = MsMarkPayload | MsQuestionPayload | PaFindPayload | PaLevelPayload | PaContextPayload;

export interface TaskEnvelope<P extends TaskPayload = TaskPayload> {
  taskId: string;
  taskToken: string;
  module: TaskModule;
  difficulty: Difficulty;
  symbol: TaskSymbol;
  algoVersion: string;
  expiresAt: number;
  decisionTime: number;
  series: Partial<Record<TaskTimeframe, Candle[]>>;
  payload: P;
}

/** Ответ grade (API_CONTRACTS §5.1); поля, которые использует UI. */
export interface GradeResultDto {
  taskId: string;
  module: TaskModule;
  algoVersion: string;
  verdict: Verdict;
  score: number;
  task: { module: TaskModule; difficulty: Difficulty; symbol: TaskSymbol; tf: TaskTimeframe | null; taskKind: string };
  skillOutcomes: SkillOutcome[];
  errors: GradeError[];
  reference: Mark[];
  detail:
    | { kind: 'ms-mark' | 'pa-find'; marks: MarkGrade }
    | { kind: 'ms-question'; chosenOptionId: string; correctOptionId: string }
    | { kind: 'pa-level'; userPrice: number; referencePrice: number; deviationPct: number; tolerancePct: number }
    | { kind: 'pa-context'; expected: Record<string, unknown>; given: Record<string, unknown> };
  feedback: Feedback;
}

export type TaskErrorKind = 'no-situation' | 'rate-limited' | 'archive' | 'network' | 'expired' | 'generic';

export class TaskApiError extends Error {
  constructor(
    readonly kind: TaskErrorKind,
    readonly status: number,
    readonly retryAfterSec: number | null = null,
  ) {
    super(`task api: ${kind} (${status})`);
    this.name = 'TaskApiError';
  }
}
