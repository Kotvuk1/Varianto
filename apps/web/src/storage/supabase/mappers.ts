import { isOutcomeOk, type Symbol } from '@tl/core';
import {
  DEFAULT_DAILY_GOAL,
  SKILL_WINDOW,
  type Attempt,
  type Settings,
  type SkillOutcome,
  type SkillStat,
} from '../types';

type Row = Record<string, unknown>;

export const iso = (ms: number) => new Date(ms).toISOString();
export const ms = (t: unknown) => new Date(t as string).getTime();

export function attemptToRow(a: Attempt, userId: string): Row {
  return {
    id: a.id,
    user_id: userId,
    module: a.module,
    task_id: a.taskId,
    task_token_payload: a.task ?? {},
    answer: a.answer ?? {},
    grade: a.grade,
    algo_version: a.algoVersion,
    skills: a.skills,
    correct: a.correct,
    r_multiple: a.rMultiple,
    local_day: a.localDay,
    duration_ms: a.durationMs,
    created_at: iso(a.createdAt),
    updated_at: iso(a.updatedAt),
  };
}

export function rowToAttempt(r: Row): Attempt {
  return {
    id: r.id as string,
    module: r.module as Attempt['module'],
    taskId: r.task_id as string,
    task: r.task_token_payload,
    answer: r.answer,
    grade: r.grade as Attempt['grade'],
    algoVersion: r.algo_version as string,
    skills: r.skills as string[],
    correct: r.correct as boolean,
    rMultiple: r.r_multiple === null ? null : Number(r.r_multiple),
    localDay: r.local_day as string,
    durationMs: r.duration_ms as number | null,
    createdAt: ms(r.created_at),
    updatedAt: ms(r.updated_at),
  };
}

export function defaultSettingsData(): Omit<Settings, 'id' | 'updatedAt'> {
  return {
    theme: 'dark',
    candleStyle: 'blue-orange',
    dailyGoal: DEFAULT_DAILY_GOAL,
    lastTerminalSymbol: 'BTCUSDT' satisfies Symbol,
    locale: 'ru',
  };
}

export function settingsToData(s: Settings): Row {
  const { id: _id, updatedAt: _u, ...data } = s;
  return data;
}

export function rowToSettings(r: Row): Settings {
  return { ...defaultSettingsData(), ...(r.data as object), id: r.id as string, updatedAt: ms(r.updated_at) };
}

export type SkillStatRow = Omit<SkillStat, 'accuracy'>;

export function outcomesOf(a: Attempt): SkillOutcome[] {
  return a.grade.skillOutcomes ?? a.skills.map((skill) => ({ skill, correct: a.correct ? 1 : 0, total: 1 }));
}

/** Тот же расчёт, что в LocalRepository: исход навыка по правилу @tl/core, окно SKILL_WINDOW. */
export function applyOutcome(row: SkillStatRow | undefined, o: SkillOutcome, a: Attempt): SkillStatRow {
  const ok = isOutcomeOk(o as Parameters<typeof isOutcomeOk>[0]);
  const base = row ?? { skill: o.skill, attempts: 0, correct: 0, recent: [], updatedAt: a.createdAt };
  return {
    skill: o.skill,
    attempts: base.attempts + 1,
    correct: base.correct + (ok ? 1 : 0),
    recent: [...base.recent, { t: a.createdAt, ok }].slice(-SKILL_WINDOW),
    updatedAt: a.createdAt,
  };
}

/** Пересчёт производных данных из попыток (DATABASE_SCHEMA §4.3). attempts — по возрастанию createdAt. */
export function deriveFromAttempts(attempts: Attempt[]): {
  skills: SkillStatRow[];
  days: Map<string, { tasksDone: number; updatedAt: number }>;
} {
  const skills = new Map<string, SkillStatRow>();
  const days = new Map<string, { tasksDone: number; updatedAt: number }>();
  for (const a of [...attempts].sort((x, y) => x.createdAt - y.createdAt)) {
    for (const o of outcomesOf(a)) skills.set(o.skill, applyOutcome(skills.get(o.skill), o, a));
    const d = days.get(a.localDay) ?? { tasksDone: 0, updatedAt: a.createdAt };
    days.set(a.localDay, { tasksDone: d.tasksDone + 1, updatedAt: a.createdAt });
  }
  return { skills: [...skills.values()], days };
}
