import { isOutcomeOk, type Mark, type Symbol } from '@tl/core';
import { TradingLabDB } from './db';
import {
  DEFAULT_DAILY_GOAL,
  SKILL_WINDOW,
  type Attempt,
  type AttemptFilter,
  type DailyActivity,
  type Repository,
  type Settings,
  type SkillOutcome,
  type SkillStat,
} from './types';

function defaultSettings(): Settings {
  return {
    id: crypto.randomUUID(),
    updatedAt: Date.now(),
    theme: 'dark',
    candleStyle: 'blue-orange',
    dailyGoal: DEFAULT_DAILY_GOAL,
    lastTerminalSymbol: 'BTCUSDT',
    locale: 'ru',
  };
}

/** Хранилище на IndexedDB (Dexie). До M7 единственная реализация Repository. */
export class LocalRepository implements Repository {
  private readonly db: TradingLabDB;

  constructor(dbName = 'trading-lab') {
    this.db = new TradingLabDB(dbName);
  }

  async saveAttempt(a: Attempt): Promise<void> {
    const { db } = this;
    await db.transaction('rw', [db.attempts, db.skillStats, db.dailyActivity, db.settings], async () => {
      if (await db.attempts.get(a.id)) return;
      await db.attempts.add(a);

      const outcomes: SkillOutcome[] =
        a.grade.skillOutcomes ??
        a.skills.map((skill) => ({ skill, correct: a.correct ? 1 : 0, total: 1 }));
      for (const o of outcomes) {
        const row = (await db.skillStats.get(o.skill)) ?? {
          skill: o.skill,
          attempts: 0,
          correct: 0,
          recent: [],
          updatedAt: a.createdAt,
        };
        const ok = isOutcomeOk(o as Parameters<typeof isOutcomeOk>[0]); // правило навыка из @tl/core: correct/total >= OK_THRESHOLD (0.8)
        row.attempts += 1;
        if (ok) row.correct += 1;
        row.recent = [...row.recent, { t: a.createdAt, ok }].slice(-SKILL_WINDOW);
        row.updatedAt = a.createdAt;
        await db.skillStats.put(row);
      }

      const day = (await db.dailyActivity.get(a.localDay)) ?? {
        day: a.localDay,
        tasksDone: 0,
        goal: (await db.settings.toCollection().first())?.dailyGoal ?? DEFAULT_DAILY_GOAL,
        updatedAt: a.createdAt,
      };
      day.tasksDone += 1;
      day.updatedAt = a.createdAt;
      await db.dailyActivity.put(day);
    });
  }

  async listAttempts(f: AttemptFilter): Promise<Attempt[]> {
    let rows = await this.db.attempts.orderBy('createdAt').toArray();
    rows = rows.filter(
      (a) =>
        (f.module === undefined || a.module === f.module) &&
        (f.skill === undefined || a.skills.includes(f.skill)) &&
        (f.correct === undefined || a.correct === f.correct) &&
        (f.fromTime === undefined || a.createdAt >= f.fromTime) &&
        (f.toTime === undefined || a.createdAt <= f.toTime),
    );
    if ((f.order ?? 'desc') === 'desc') rows.reverse();
    const start = f.offset ?? 0;
    return rows.slice(start, f.limit === undefined ? undefined : start + f.limit);
  }

  async getSkillStats(): Promise<SkillStat[]> {
    const rows = await this.db.skillStats.toArray();
    return rows.map((r) => ({
      ...r,
      accuracy: r.recent.length === 0 ? null : r.recent.filter((x) => x.ok).length / r.recent.length,
    }));
  }

  async saveTerminalMarks(symbol: Symbol, marks: Mark[]): Promise<void> {
    const { db } = this;
    await db.transaction('rw', db.terminalMarks, async () => {
      const existing = await db.terminalMarks.where('symbol').equals(symbol).first();
      await db.terminalMarks.put({
        id: existing?.id ?? crypto.randomUUID(),
        symbol,
        marks,
        updatedAt: Date.now(),
      });
    });
  }

  async getTerminalMarks(symbol: Symbol): Promise<Mark[]> {
    return (await this.db.terminalMarks.where('symbol').equals(symbol).first())?.marks ?? [];
  }

  async getSettings(): Promise<Settings> {
    const { db } = this;
    return db.transaction('rw', db.settings, async () => {
      const existing = await db.settings.toCollection().first();
      if (existing) return existing;
      const created = defaultSettings();
      await db.settings.add(created);
      return created;
    });
  }

  async saveSettings(s: Settings): Promise<void> {
    await this.db.settings.put({ ...s, updatedAt: Date.now() });
  }

  async getDailyActivity(fromDay: string, toDay: string): Promise<DailyActivity[]> {
    const rows = await this.db.dailyActivity.where('day').between(fromDay, toDay, true, true).toArray();
    return rows.map(({ day, tasksDone, goal }) => ({ day, tasksDone, goal }));
  }
}
