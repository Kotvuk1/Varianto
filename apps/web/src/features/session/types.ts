import type {
  Candle, Difficulty, ElliottDetail, ElliottTask, EwTaskKind, Feedback, FibDetail, FibExtensionTask, FibGridTask, FibReactionTask, GradeError, Mark, MarkGrade, ModuleId, SkillOutcome, TaskSymbol, TaskTimeframe, Verdict,
} from '@tl/core';
import type { Answer } from '@/server/schemas';

export type { Answer };
export type TaskModule = Exclude<ModuleId, 'challenge'>;

export type MsMode = 'mark' | 'question';
export type PaType = 'find-pattern' | 'draw-level' | 'context';
export type FibType = 'grid' | 'reaction' | 'extension';
export const TASK_TFS: readonly TaskTimeframe[] = ['15m', '1h', '4h', '1d'];
export const TASK_SYMBOLS: readonly TaskSymbol[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

/** Тело запроса POST /api/tasks/{module}/next (API_CONTRACTS §3.3). */
export type NextBody =
  | { difficulty: Difficulty; mode: MsMode; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] }
  | { difficulty: Difficulty; taskType: PaType | FibType; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] }
  /** Elliott: тип задания определяется сложностью (ELLIOTT.md §19). */
  | { difficulty: Difficulty; tf?: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[] };

export interface TaskPayloadBase {
  kind: string;
  tf: TaskTimeframe;
}
export interface MsMarkPayload extends TaskPayloadBase {
  kind: 'ms-mark';
  concepts: string[];
  /** Явный набор проверяемых понятий (ALGO 1.1.0); у старых заданий нет. */
  focus?: string[];
  windowCandles?: number;
  requiredCount?: number;
  /** Показывать выбор internal/external (только при scoped). */
  scoped?: boolean;
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
export type FibPayload = FibGridTask | FibReactionTask | FibExtensionTask;
export type TaskPayload = MsMarkPayload | MsQuestionPayload | PaFindPayload | PaLevelPayload | PaContextPayload | FibPayload | ElliottTask;

export interface TaskEnvelope<P extends TaskPayload = TaskPayload> {
  taskId: string;
  taskToken: string;
  module: TaskModule;
  difficulty: Difficulty;
  symbol: TaskSymbol;
  algoVersion: string;
  expiresAt: number;
  /** relative: шкала времени сдвинута, дата скрыта до итога (Fibonacci reaction/extension). */
  timeline?: { mode: 'relative' | 'absolute' };
  decisionTime: number;
  series: Partial<Record<TaskTimeframe, Candle[]>>;
  payload: P;
}

/** Проигрывание после решения: свечи шкалы задания и индекс события в них. */
export interface TaskReplay {
  tf: TaskTimeframe;
  candles: Candle[];
  exitIndex: number | null;
}

/** Ответ grade (API_CONTRACTS §5.1); поля, которые использует UI. */
export interface GradeResultDto {
  taskId: string;
  module: TaskModule;
  algoVersion: string;
  verdict: Verdict;
  score: number;
  task: { module: TaskModule; difficulty: Difficulty; symbol: TaskSymbol; tf: TaskTimeframe | null; taskKind: string; reveal?: { decisionTime: number; shiftMs: number } };
  skillOutcomes: SkillOutcome[];
  errors: GradeError[];
  reference: Mark[];
  detail:
    | { kind: 'ms-mark' | 'pa-find'; marks: MarkGrade }
    | { kind: 'ms-question'; chosenOptionId: string; correctOptionId: string }
    | { kind: 'pa-level'; userPrice: number; referencePrice: number; deviationPct: number; tolerancePct: number }
    | { kind: 'pa-context'; expected: Record<string, unknown>; given: Record<string, unknown> }
    | { kind: 'fib-grid' | 'fib-reaction' | 'fib-extension'; fib: FibDetail }
    | { kind: EwTaskKind; elliott: ElliottDetail };
  feedback: Feedback;
  /** Проигрывание будущего (Fibonacci reaction/extension, шкала задания). В попытку не сохраняется. */
  replay?: TaskReplay;
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
