// Мягкая серия, дневная цель и статистика Challenge (DATABASE_SCHEMA §5.2-§5.4). Дни — 'YYYY-MM-DD'.

export interface DayRecord {
  tasksDone: number;
  goal: number;
}
export type DayMap = Map<string, DayRecord>;

export const GOAL_MIN = 1;
export const GOAL_MAX = 100;
export const GOAL_DEFAULT = 10;

function shift(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + delta));
  return t.toISOString().slice(0, 10);
}
export const prevDay = (day: string): string => shift(day, -1);
export const nextDay = (day: string): string => shift(day, 1);

function isMet(days: DayMap, d: string): boolean {
  const x = days.get(d);
  return !!x && x.tasksDone >= x.goal;
}

/** Одиночный пропуск прощается, два подряд обнуляют; текущий невыполненный день пропуском не считается. */
export function softStreak(days: DayMap, today: string, firstDay: string): { streak: number; atRisk: boolean } {
  let streak = isMet(days, today) ? 1 : 0;
  let misses = 0;
  for (let d = prevDay(today); d >= firstDay; d = prevDay(d)) {
    if (isMet(days, d)) {
      streak++;
      misses = 0;
    } else if (++misses >= 2) break;
  }
  const atRisk = !isMet(days, today) && !isMet(days, prevDay(today));
  return { streak, atRisk };
}

/** Наибольшая серия на отрезке [firstDay, lastDay] по тому же правилу. */
export function longestStreak(days: DayMap, firstDay: string, lastDay: string): number {
  let best = 0;
  let cur = 0;
  let misses = 0;
  for (let d = firstDay; d <= lastDay; d = nextDay(d)) {
    if (isMet(days, d)) {
      cur++;
      misses = 0;
      best = Math.max(best, cur);
    } else if (++misses >= 2) {
      cur = 0;
    }
  }
  return best;
}

export function dailyProgress(tasksDone: number, goal: number): { tasksDone: number; goal: number; ratio: number; reached: boolean } {
  const g = Math.min(GOAL_MAX, Math.max(GOAL_MIN, Math.round(goal)));
  return { tasksDone, goal: g, ratio: Math.min(1, tasksDone / g), reached: tasksDone >= g };
}

export interface ChallengeAttemptStat {
  side: 'LONG' | 'SHORT' | 'WAIT';
  rMultiple: number | null;
  waitCorrect?: boolean | null;
}

export function challengeStats(attempts: readonly ChallengeAttemptStat[]): {
  positions: number;
  winRate: number | null;
  avgR: number | null;
  waits: number;
  waitCorrectRate: number | null;
} {
  const pos = attempts.filter((a) => a.side !== 'WAIT' && a.rMultiple !== null);
  const waits = attempts.filter((a) => a.side === 'WAIT');
  const wins = pos.filter((a) => (a.rMultiple as number) > 0).length;
  const sumR = pos.reduce((s, a) => s + (a.rMultiple as number), 0);
  const ok = waits.filter((a) => a.waitCorrect === true).length;
  return {
    positions: pos.length,
    winRate: pos.length ? wins / pos.length : null,
    avgR: pos.length ? sumR / pos.length : null,
    waits: waits.length,
    waitCorrectRate: waits.length ? ok / waits.length : null,
  };
}
