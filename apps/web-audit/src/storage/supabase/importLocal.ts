import type { SupabaseClient } from '@supabase/supabase-js';
import type { LocalRepository, LocalSnapshot } from '../LocalRepository';
import { DEFAULT_DAILY_GOAL } from '../types';
import { attemptToRow, deriveFromAttempts, iso, ms, rowToAttempt, settingsToData } from './mappers';

const BATCH = 100;
export const IMPORTED_USER_META = 'importedUserId';

export interface ImportReport {
  attempts: { inserted: number; skipped: number };
  terminalMarks: { upserted: number; skipped: number };
  settings: 'upserted' | 'skipped' | 'none';
}

export type ImportOutcome =
  | { status: 'imported'; report: ImportReport }
  | { status: 'already-imported' | 'other-user' | 'nothing-to-import' };

type Row = Record<string, unknown>;

function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const chunks = <T>(xs: T[], n: number): T[][] =>
  Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

/**
 * Слияние снимка в облако (DATABASE_SCHEMA §4.2). Идемпотентно: повторный запуск ничего не меняет.
 * attempts: по id (существующие пропускаются); terminal_marks и settings: побеждает больший updated_at,
 * при равенстве серверная запись; daily_activity и skill_stats пересчитываются из попыток.
 */
export async function importSnapshot(client: SupabaseClient, userId: string, snap: LocalSnapshot): Promise<ImportReport> {
  const report: ImportReport = {
    attempts: { inserted: 0, skipped: 0 },
    terminalMarks: { upserted: 0, skipped: 0 },
    settings: 'none',
  };

  // attempts
  for (const batch of chunks(snap.attempts, BATCH)) {
    const ids = batch.map((a) => a.id);
    const have = new Set((must(await client.from('attempts').select('id').in('id', ids)) as Row[]).map((r) => r.id));
    const fresh = batch.filter((a) => !have.has(a.id));
    report.attempts.skipped += batch.length - fresh.length;
    if (fresh.length === 0) continue;
    must(
      await client
        .from('attempts')
        .upsert(fresh.map((a) => attemptToRow(a, userId)), { onConflict: 'id', ignoreDuplicates: true }),
    );
    report.attempts.inserted += fresh.length;
  }

  // terminal_marks: целиком по updated_at
  if (snap.terminalMarks.length > 0) {
    const server = must(await client.from('terminal_marks').select('symbol,updated_at')) as Row[];
    const serverAt = new Map(server.map((r) => [r.symbol as string, ms(r.updated_at)]));
    for (const m of snap.terminalMarks) {
      const at = serverAt.get(m.symbol);
      if (at !== undefined && m.updatedAt <= at) {
        report.terminalMarks.skipped += 1;
        continue;
      }
      must(
        await client
          .from('terminal_marks')
          .upsert(
            { user_id: userId, symbol: m.symbol, marks: m.marks, updated_at: iso(m.updatedAt) },
            { onConflict: 'user_id,symbol' },
          ),
      );
      report.terminalMarks.upserted += 1;
    }
  }

  // settings
  if (snap.settings) {
    const server = must(await client.from('settings').select('updated_at').maybeSingle()) as Row | null;
    if (server && snap.settings.updatedAt <= ms(server.updated_at)) {
      report.settings = 'skipped';
    } else {
      must(
        await client
          .from('settings')
          .upsert(
            { user_id: userId, data: settingsToData(snap.settings), updated_at: iso(snap.settings.updatedAt) },
            { onConflict: 'user_id' },
          ),
      );
      report.settings = 'upserted';
    }
  }

  await recomputeDerived(client, userId, snap);
  return report;
}

/** skill_stats и daily_activity.tasks_done пересчитываются из всех серверных попыток (§4.3). */
async function recomputeDerived(client: SupabaseClient, userId: string, snap: LocalSnapshot): Promise<void> {
  const all = [];
  for (let from = 0; ; from += 1000) {
    const rows = must(
      await client.from('attempts').select('*').order('created_at', { ascending: true }).range(from, from + 999),
    ) as Row[];
    all.push(...rows.map(rowToAttempt));
    if (rows.length < 1000) break;
  }
  const { skills, days } = deriveFromAttempts(all);

  for (const batch of chunks(skills, BATCH)) {
    must(
      await client.from('skill_stats').upsert(
        batch.map((s) => ({
          user_id: userId,
          skill: s.skill,
          attempts: s.attempts,
          correct: s.correct,
          recent: s.recent,
          updated_at: iso(s.updatedAt),
        })),
        { onConflict: 'user_id,skill' },
      ),
    );
  }

  // goal берётся из строки с большим updated_at (при равенстве серверная)
  const serverDays = new Map(
    (must(await client.from('daily_activity').select('day,goal,updated_at')) as Row[]).map((r) => [
      r.day as string,
      { goal: r.goal as number, updatedAt: ms(r.updated_at) },
    ]),
  );
  const localDays = new Map(snap.dailyActivity.map((d) => [d.day, d]));
  const fallbackGoal = snap.settings?.dailyGoal ?? DEFAULT_DAILY_GOAL;
  const rows = [...days].map(([day, d]) => {
    const s = serverDays.get(day);
    const l = localDays.get(day);
    const goal = l && (!s || l.updatedAt > s.updatedAt) ? l.goal : (s?.goal ?? fallbackGoal);
    return { user_id: userId, day, tasks_done: d.tasksDone, goal, updated_at: iso(Math.max(d.updatedAt, s?.updatedAt ?? 0)) };
  });
  for (const batch of chunks(rows, BATCH)) {
    must(await client.from('daily_activity').upsert(batch, { onConflict: 'user_id,day' }));
  }
}

/** Однократный импорт при первом входе (§4.1). Локальные данные не удаляются. */
export async function runFirstSignInImport(
  local: LocalRepository,
  client: SupabaseClient,
  userId: string,
): Promise<ImportOutcome> {
  const done = await local.getMeta(IMPORTED_USER_META);
  if (done === userId) return { status: 'already-imported' };
  if (typeof done === 'string' && done !== '') return { status: 'other-user' };

  const snap = await local.exportSnapshot();
  if (snap.attempts.length === 0 && snap.terminalMarks.length === 0 && !snap.settings) {
    return { status: 'nothing-to-import' };
  }
  const report = await importSnapshot(client, userId, snap);
  must(await client.from('profiles').update({ local_import_at: iso(Date.now()) }).eq('id', userId));
  await local.setMeta(IMPORTED_USER_META, userId);
  return { status: 'imported', report };
}
