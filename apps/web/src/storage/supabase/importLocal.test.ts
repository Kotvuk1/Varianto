import { beforeEach, describe, expect, it } from 'vitest';
import { LocalRepository } from '../LocalRepository';
import { contractAttempt, contractMark } from '../repositoryContract';
import { FakeSupabase } from './fakeSupabase';
import { importSnapshot, runFirstSignInImport } from './importLocal';
import { SupabaseRepository } from './SupabaseRepository';

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';
let n = 0;
let local: LocalRepository;
let fake: FakeSupabase;

beforeEach(() => {
  local = new LocalRepository(`trading-lab-import-${++n}`);
  fake = new FakeSupabase(U1);
  fake.rows('profiles').push({ id: U1, local_import_at: null });
});

async function seedLocal() {
  await local.saveSettings({ ...(await local.getSettings()), dailyGoal: 12 });
  await local.saveAttempt(contractAttempt({ createdAt: 1_000 }));
  await local.saveAttempt(contractAttempt({ createdAt: 2_000, localDay: '2026-11-04' }));
  await local.saveTerminalMarks('BTCUSDT', [contractMark]);
}

describe('импорт локальных данных', () => {
  it('переносит данные и ставит флаг импорта', async () => {
    await seedLocal();
    const out = await runFirstSignInImport(local, fake.asClient(), U1);
    expect(out).toMatchObject({ status: 'imported', report: { attempts: { inserted: 2, skipped: 0 } } });
    const repo = new SupabaseRepository(fake.asClient(), U1);
    expect(await repo.listAttempts({})).toHaveLength(2);
    expect(await repo.getTerminalMarks('BTCUSDT')).toEqual([contractMark]);
    expect((await repo.getSettings()).dailyGoal).toBe(12);
    expect(await repo.getDailyActivity('2026-11-03', '2026-11-04')).toEqual([
      { day: '2026-11-03', tasksDone: 1, goal: 12 },
      { day: '2026-11-04', tasksDone: 1, goal: 12 },
    ]);
    expect((await repo.getSkillStats())[0]).toMatchObject({ skill: 'bos', attempts: 2 });
    expect(fake.rows('profiles')[0]?.local_import_at).toBeTruthy();
    expect(await local.getMeta('importedUserId')).toBe(U1);
  });

  it('повторный запуск пропускается по флагу', async () => {
    await seedLocal();
    await runFirstSignInImport(local, fake.asClient(), U1);
    expect(await runFirstSignInImport(local, fake.asClient(), U1)).toEqual({ status: 'already-imported' });
  });

  it('идемпотентен по id даже без флага', async () => {
    await seedLocal();
    const snap = await local.exportSnapshot();
    await importSnapshot(fake.asClient(), U1, snap);
    const again = await importSnapshot(fake.asClient(), U1, snap);
    expect(again.attempts).toEqual({ inserted: 0, skipped: 2 });
    expect(again.terminalMarks).toEqual({ upserted: 0, skipped: 1 });
    expect(again.settings).toBe('skipped');
    expect(fake.rows('attempts')).toHaveLength(2);
    expect(fake.rows('daily_activity').map((r) => r.tasks_done)).toEqual([1, 1]);
    expect(fake.rows('skill_stats')[0]).toMatchObject({ attempts: 2 });
  });

  it('конфликты по updated_at: побеждает более новая запись; при равенстве серверная', async () => {
    await local.saveTerminalMarks('BTCUSDT', [contractMark]);
    const snap = await local.exportSnapshot();
    const localAt = snap.terminalMarks[0]!.updatedAt;

    fake.rows('terminal_marks').push({ id: 'x', user_id: U1, symbol: 'BTCUSDT', marks: [], updated_at: new Date(localAt + 1000).toISOString() });
    await importSnapshot(fake.asClient(), U1, snap);
    expect(fake.rows('terminal_marks')[0]?.marks).toEqual([]); // сервер новее

    fake.rows('terminal_marks')[0]!.updated_at = new Date(localAt).toISOString();
    await importSnapshot(fake.asClient(), U1, snap);
    expect(fake.rows('terminal_marks')[0]?.marks).toEqual([]); // равенство: серверная

    fake.rows('terminal_marks')[0]!.updated_at = new Date(localAt - 1000).toISOString();
    await importSnapshot(fake.asClient(), U1, snap);
    expect(fake.rows('terminal_marks')[0]?.marks).toEqual([contractMark]); // локальная новее
  });

  it('данные другого устройства не теряются: пересчёт учитывает серверные попытки', async () => {
    const other = new SupabaseRepository(fake.asClient(), U1);
    await other.saveAttempt(contractAttempt({ createdAt: 500 }));
    await seedLocal();
    await runFirstSignInImport(local, fake.asClient(), U1);
    expect(await other.listAttempts({})).toHaveLength(3);
    expect(await other.getDailyActivity('2026-11-03', '2026-11-03')).toEqual([{ day: '2026-11-03', tasksDone: 2, goal: 12 }]);
  });

  it('локальные данные другого пользователя не импортируются; пусто — пропуск', async () => {
    expect(await runFirstSignInImport(local, fake.asClient(), U1)).toEqual({ status: 'nothing-to-import' });
    await seedLocal();
    await local.setMeta('importedUserId', U2);
    expect(await runFirstSignInImport(local, fake.asClient(), U1)).toEqual({ status: 'other-user' });
    expect(fake.rows('attempts')).toHaveLength(0);
  });

  it('при ошибке сети флаг не ставится, повтор дособирает', async () => {
    await seedLocal();
    fake.failNext = 'terminal_marks';
    await expect(runFirstSignInImport(local, fake.asClient(), U1)).rejects.toThrow();
    expect(await local.getMeta('importedUserId')).toBeUndefined();
    const out = await runFirstSignInImport(local, fake.asClient(), U1);
    expect(out.status).toBe('imported');
    expect(fake.rows('attempts')).toHaveLength(2);
  });
});
