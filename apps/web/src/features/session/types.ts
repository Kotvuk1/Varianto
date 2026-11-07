import type {
  Candle, Difficulty, ElliottDetail, ElliottTask, EwTaskKind, Feedback, FibDetail, FibExtensionTask, FibGridTask, FibReactionTask, GradeError, Mark, MarkGrade, ModuleId, SkillOutcome, TaskSymbol, TaskTimeframe, Verdict,
} from '@tl/core';
import type { Answer } from '@/server/schemas';
import type { CurTaskType } from '@/i18n/ru/curriculum';

export type { Answer };
export type TaskModule = Exclude<ModuleId, 'challenge'>;

export type MsMode = 'mark' | 'question';
export type PaType = 'find-pattern' | 'context';
export type FibType = 'grid' | 'reaction' | 'extension';
export const TASK_TFS: readonly TaskTimeframe[] = ['15m', '1h', '4h', '1d'];
export const TASK_SYMBOLS: readonly TaskSymbol[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

/** Тело запроса POST /api/tasks/{module}/next (API_CONTRACTS §3.3). */
export type NextBody =
  | { difficulty: Difficulty; mode: MsMode; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] }
  | { difficulty: Difficulty; taskType: PaType | FibType; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] }
  /** Elliott и ступени 3-4/комбо: тип задания определяется модулем или сложностью; tf необязателен. */
  | { difficulty: Difficulty; tf?: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] }
  /** Ступени 1-2: тип задания sw-mark | sw-trend | lv-*. */
  | { difficulty: Difficulty; taskType: CurTaskType; tf: TaskTimeframe; symbol?: TaskSymbol; exclude?: string[]; focus?: string[] };

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
export interface PaContextPayload extends TaskPayloadBase {
  kind: 'pa-context';
  pattern: Mark;
  factorOptions: string[];
}
export type LevelRole = 'support' | 'resistance';
export type TradeSide = 'LONG' | 'SHORT';
export interface ZoneInfoDto {
  bottom: number;
  top: number;
  role: LevelRole | 'inside';
  center: number;
  touches: number;
  reactions: number;
  strength: number;
  flip: boolean;
  lastTouchTime: number;
}
/** Payload ступеней 1-4 и комбо (CURRICULUM_STAGES.md §11.2). */
export interface SwMarkPayload extends TaskPayloadBase {
  kind: 'sw-mark';
  window: { fromTime: number; toTime: number };
  windowCandles?: number;
  concepts: string[];
  n: number;
  requiredCount: number;
  toleranceCandles: 2;
  tools: string[];
}
export interface SwTrendPayload extends TaskPayloadBase {
  kind: 'sw-trend';
  questionId: string;
  window: { fromTime: number; toTime: number };
  n: number;
  options: ('up' | 'down' | 'range')[];
  hints?: Mark[];
}
export interface LvStrongestPayload extends TaskPayloadBase {
  kind: 'lv-strongest';
  role: LevelRole | null;
  tolerancePct: number;
  maxDistanceAtr: number;
  atr: number;
  hints?: Mark[];
}
export interface LvZonePayload extends TaskPayloadBase {
  kind: 'lv-zone';
  role: LevelRole | null;
  atr: number;
  tools: string[];
  hints?: Mark[];
}
export interface LvReactionPayload extends TaskPayloadBase {
  kind: 'lv-reaction';
  side: TradeSide;
  atr: number;
  options: { id: string; bottom: number; top: number; touches: number | null; strength: number | null }[];
  allowNone: boolean;
  limitCandles: number;
}
export interface LimitEntryPayload extends TaskPayloadBase {
  kind: 'limit-entry';
  side: TradeSide;
  zone: ZoneInfoDto;
  atr: number;
  frontK: { min: number; max: number };
  limitCandles: number;
  hints?: Mark[];
}
export interface StopTakePayload extends TaskPayloadBase {
  kind: 'stop-take';
  side: TradeSide;
  zone: ZoneInfoDto;
  entry: { price: number; fillTime: number };
  atr: number;
  limitCandles: number;
  hints?: Mark[];
}
export interface ComboPayload extends TaskPayloadBase {
  kind: 'combo-level-trade' | 'combo-smc-entry';
  side: TradeSide | null;
  atr: number;
  frontK: { min: number; max: number };
  limitCandles: number;
  tools: string[];
  hints?: Mark[];
}
export type CurPayload = SwMarkPayload | SwTrendPayload | LvStrongestPayload | LvZonePayload | LvReactionPayload | LimitEntryPayload | StopTakePayload | ComboPayload;

export type FibPayload = FibGridTask | FibReactionTask | FibExtensionTask;
export type TaskPayload = MsMarkPayload | MsQuestionPayload | PaFindPayload | PaContextPayload | FibPayload | ElliottTask | CurPayload;

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
  /** Свеча исполнения лимитки в `candles` (ступень 3, комбо); null - не исполнилась. */
  fillIndex?: number | null;
}

export interface QualityPartDto {
  key: 'placement' | 'type' | 'fill' | 'price' | 'zone' | 'sl' | 'tp' | 'rr';
  score: number;
  max: number;
  code: string | null;
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
    | { kind: 'sw-mark'; marks: MarkGrade }
    | { kind: 'sw-trend'; chosen: string; correct: string; bosTrend: string }
    | { kind: 'lv-strongest' | 'lv-zone' | 'lv-reaction' }
    | { kind: 'limit-entry'; quality: number; parts: QualityPartDto[]; fill: { time: number; candles: number } | null }
    | { kind: 'stop-take' | 'combo-level-trade' | 'combo-smc-entry'; quality: number; parts: QualityPartDto[]; stopHunted: boolean; outcome: { result?: string; kind?: string; rMultiple?: number } }
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
