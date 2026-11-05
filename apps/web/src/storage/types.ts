import type { Mark, Symbol, UtcMs } from '@tl/core';

// Типы по docs/API_CONTRACTS.md §7. Типы заданий и разбора (RevealedTask, Answer, GradeResult)
// появятся с модулями M2+; до тех пор поля хранятся как JSON-совместимые.

export type ModuleId = 'market-structure' | 'price-action' | 'challenge' | 'fibonacci' | 'elliott';
export type SkillId = string;

export interface SkillOutcome {
  skill: SkillId;
  correct: number;
  total: number;
}

export interface Attempt {
  id: string;
  module: ModuleId;
  taskId: string;
  task: unknown;
  answer: unknown;
  grade: { verdict: 'correct' | 'partial' | 'incorrect'; skillOutcomes?: SkillOutcome[] } & Record<
    string,
    unknown
  >;
  algoVersion: string;
  skills: SkillId[];
  correct: boolean;
  rMultiple: number | null;
  /** 'YYYY-MM-DD' в локальном поясе на момент попытки. */
  localDay: string;
  durationMs: number | null;
  createdAt: UtcMs;
  updatedAt: UtcMs;
}

export interface AttemptFilter {
  module?: ModuleId;
  skill?: SkillId;
  correct?: boolean;
  fromTime?: UtcMs;
  toTime?: UtcMs;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

export interface SkillStat {
  skill: SkillId;
  attempts: number;
  correct: number;
  recent: { t: UtcMs; ok: boolean }[];
  accuracy: number | null;
  updatedAt: UtcMs;
}

export interface Settings {
  id: string;
  updatedAt: UtcMs;
  theme: 'dark' | 'light';
  /** 'blue-orange' = «Цветные» в UI. */
  candleStyle: 'blue-orange' | 'mono';
  dailyGoal: number;
  lastTerminalSymbol: Symbol;
  locale: 'ru';
}

export interface DailyActivity {
  day: string;
  tasksDone: number;
  goal: number;
}

export interface Repository {
  saveAttempt(a: Attempt): Promise<void>;
  listAttempts(f: AttemptFilter): Promise<Attempt[]>;
  getSkillStats(): Promise<SkillStat[]>;
  saveTerminalMarks(symbol: Symbol, marks: Mark[]): Promise<void>;
  getTerminalMarks(symbol: Symbol): Promise<Mark[]>;
  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;
  /** Расширение (API_CONTRACTS §7): дни включительно, 'YYYY-MM-DD'. */
  getDailyActivity(fromDay: string, toDay: string): Promise<DailyActivity[]>;
}

export const DEFAULT_DAILY_GOAL = 10;
export const SKILL_WINDOW = 20;
