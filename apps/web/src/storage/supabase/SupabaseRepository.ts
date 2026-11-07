import type { Mark, Symbol } from '@tl/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Attempt,
  AttemptFilter,
  DailyActivity,
  Repository,
  Settings,
  SkillStat,
} from '../types';
import { DEFAULT_DAILY_GOAL } from '../types';
import {
  applyOutcome,
  attemptToRow,
  defaultSettingsData,
  iso,
  ms,
  outcomesOf,
  rowToAttempt,
  rowToSettings,
  settingsToData,
  type SkillStatRow,
} from './mappers';

const PAGE = 1000;

function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/**
 * Облачное хранилище (Postgres + RLS). Клиент создаётся с anon-ключом; userId нужен только для явных
 * значений user_id (RLS всё равно проверяет user_id = auth.uid()). Включается лишь при наличии сессии.
 */
export class SupabaseRepository implements Repository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async saveAttempt(a: Attempt): Promise<void> {
    const c = this.client;
    const existing = must(await c.from('attempts').select('id').eq('id', a.id).maybeSingle());
    if (existing) return;
    must(await c.from('attempts').insert(attemptToRow(a, this.userId)));

    for (const o of outcomesOf(a)) {
      const row = must(await c.from('skill_stats').select('*').eq('skill', o.skill).maybeSingle());
      const next = applyOutcome(row ? this.rowToStat(row) : undefined, o, a);
      must(
        await c.from('skill_stats').upsert(
          {
            user_id: this.userId,
            skill: next.skill,
            attempts: next.attempts,
            correct: next.correct,
            recent: next.recent,
            updated_at: iso(next.updatedAt),
          },
          { onConflict: 'user_id,skill' },
        ),
      );
    }

    const day = must(await c.from('daily_activity').select('*').eq('day', a.localDay).maybeSingle());
    const goal = day?.goal ?? (await this.readSettings())?.dailyGoal ?? DEFAULT_DAILY_GOAL;
    must(
      await c.from('daily_activity').upsert(
        {
          user_id: this.userId,
          day: a.localDay,
          tasks_done: (day?.tasks_done ?? 0) + 1,
          goal,
          updated_at: iso(a.createdAt),
        },
        { onConflict: 'user_id,day' },
      ),
    );
  }

  async listAttempts(f: AttemptFilter): Promise<Attempt[]> {
    const start = f.offset ?? 0;
    const out: Attempt[] = [];
    // PostgREST отдаёт не больше PAGE строк за запрос: без limit читаем страницами.
    for (;;) {
      const want = f.limit === undefined ? PAGE : Math.min(PAGE, f.limit - out.length);
      if (want <= 0) break;
      const from = start + out.length;
      let q = this.client.from('attempts').select('*');
      if (f.module !== undefined) q = q.eq('module', f.module);
      if (f.skill !== undefined) q = q.contains('skills', [f.skill]);
      if (f.correct !== undefined) q = q.eq('correct', f.correct);
      if (f.fromTime !== undefined) q = q.gte('created_at', iso(f.fromTime));
      if (f.toTime !== undefined) q = q.lte('created_at', iso(f.toTime));
      q = q.order('created_at', { ascending: f.order === 'asc' }).range(from, from + want - 1);
      const rows = must(await q) as Record<string, unknown>[];
      out.push(...rows.map(rowToAttempt));
      if (rows.length < want) break;
    }
    return out;
  }

  async getSkillStats(): Promise<SkillStat[]> {
    const rows = must(await this.client.from('skill_stats').select('*')) as Record<string, unknown>[];
    return rows.map((r) => {
      const s = this.rowToStat(r);
      return { ...s, accuracy: s.recent.length === 0 ? null : s.recent.filter((x) => x.ok).length / s.recent.length };
    });
  }

  async saveTerminalMarks(symbol: Symbol, marks: Mark[]): Promise<void> {
    must(
      await this.client
        .from('terminal_marks')
        .upsert({ user_id: this.userId, symbol, marks, updated_at: iso(Date.now()) }, { onConflict: 'user_id,symbol' }),
    );
  }

  async getTerminalMarks(symbol: Symbol): Promise<Mark[]> {
    const row = must(await this.client.from('terminal_marks').select('marks').eq('symbol', symbol).maybeSingle());
    return (row?.marks as Mark[] | undefined) ?? [];
  }

  async getSettings(): Promise<Settings> {
    const existing = await this.readSettings();
    if (existing) return existing;
    const id = crypto.randomUUID();
    const now = Date.now();
    must(
      await this.client
        .from('settings')
        .upsert(
          { id, user_id: this.userId, data: defaultSettingsData(), updated_at: iso(now) },
          { onConflict: 'user_id', ignoreDuplicates: true },
        ),
    );
    return (await this.readSettings()) ?? { ...defaultSettingsData(), id, updatedAt: now };
  }

  async saveSettings(s: Settings): Promise<void> {
    must(
      await this.client
        .from('settings')
        .upsert({ user_id: this.userId, data: settingsToData(s), updated_at: iso(Date.now()) }, { onConflict: 'user_id' }),
    );
  }

  async getDailyActivity(fromDay: string, toDay: string): Promise<DailyActivity[]> {
    const rows = must(
      await this.client
        .from('daily_activity')
        .select('day,tasks_done,goal')
        .gte('day', fromDay)
        .lte('day', toDay)
        .order('day', { ascending: true }),
    ) as { day: string; tasks_done: number; goal: number }[];
    return rows.map((r) => ({ day: r.day, tasksDone: r.tasks_done, goal: r.goal }));
  }

  private async readSettings(): Promise<Settings | null> {
    const row = must(await this.client.from('settings').select('*').maybeSingle());
    return row ? rowToSettings(row) : null;
  }

  private rowToStat(r: Record<string, unknown>): SkillStatRow {
    return {
      skill: r.skill as string,
      attempts: r.attempts as number,
      correct: r.correct as number,
      recent: r.recent as SkillStatRow['recent'],
      updatedAt: ms(r.updated_at),
    };
  }
}
