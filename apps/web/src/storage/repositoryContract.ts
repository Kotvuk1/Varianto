import type { Mark } from '@tl/core';
import { describe, expect, it } from 'vitest';
import type { Attempt, Repository } from './types';

// SYNTHETIC: минимальные записи для проверки контракта хранилища, не рыночные данные
export function contractAttempt(over: Partial<Attempt> = {}): Attempt {
  return {
    id: crypto.randomUUID(),
    module: 'market-structure',
    taskId: 'synthetic_t1',
    task: { reveal: {} },
    answer: {},
    grade: { verdict: 'correct', skillOutcomes: [{ skill: 'bos', correct: 1, total: 1 }] },
    algoVersion: '0.1.0',
    skills: ['bos'],
    correct: true,
    rMultiple: null,
    localDay: '2026-11-03',
    durationMs: null,
    createdAt: 1_000,
    updatedAt: 1_000,
    ...over,
  };
}

// SYNTHETIC: метка для проверки хранилища
export const contractMark: Mark = {
  id: 'synthetic_m1',
  kind: 'swing-high',
  anchors: [{ time: 1, price: 2 }],
  scope: null,
  direction: null,
  author: 'user',
};

/** Общий контрактный набор: одно поведение для LocalRepository и SupabaseRepository. */
export function runRepositoryContract(name: string, make: () => Promise<Repository> | Repository) {
  describe(`Repository contract: ${name}`, () => {
    it('настройки по умолчанию и сохранение', async () => {
      const repo = await make();
      const s = await repo.getSettings();
      expect(s).toMatchObject({ theme: 'dark', candleStyle: 'blue-orange', dailyGoal: 10, locale: 'ru' });
      await repo.saveSettings({ ...s, dailyGoal: 15, theme: 'light' });
      expect(await repo.getSettings()).toMatchObject({ id: s.id, dailyGoal: 15, theme: 'light' });
    });

    it('saveAttempt идемпотентен по id', async () => {
      const repo = await make();
      const a = contractAttempt();
      await repo.saveAttempt(a);
      await repo.saveAttempt(a);
      expect(await repo.listAttempts({})).toHaveLength(1);
      expect((await repo.getSkillStats())[0]).toMatchObject({ skill: 'bos', attempts: 1, correct: 1 });
    });

    it('listAttempts: порядок, фильтры, пагинация, круговое преобразование', async () => {
      const repo = await make();
      const a1 = contractAttempt({ createdAt: 1_000, updatedAt: 1_000, rMultiple: 1.5, durationMs: 700 });
      const a2 = contractAttempt({
        module: 'challenge',
        skills: ['wait'],
        correct: false,
        grade: { verdict: 'incorrect', skillOutcomes: [{ skill: 'wait', correct: 0, total: 1 }] },
        createdAt: 2_000,
        updatedAt: 2_000,
      });
      const a3 = contractAttempt({ createdAt: 3_000, updatedAt: 3_000 });
      for (const a of [a2, a1, a3]) await repo.saveAttempt(a);

      expect((await repo.listAttempts({})).map((a) => a.id)).toEqual([a3.id, a2.id, a1.id]);
      expect((await repo.listAttempts({ order: 'asc' })).map((a) => a.id)).toEqual([a1.id, a2.id, a3.id]);
      expect(await repo.listAttempts({ module: 'challenge' })).toHaveLength(1);
      expect(await repo.listAttempts({ skill: 'wait' })).toHaveLength(1);
      expect(await repo.listAttempts({ correct: false })).toHaveLength(1);
      expect(await repo.listAttempts({ fromTime: 1_500, toTime: 2_500 })).toHaveLength(1);
      expect((await repo.listAttempts({ order: 'asc', limit: 1, offset: 1 })).map((a) => a.id)).toEqual([a2.id]);
      expect((await repo.listAttempts({ order: 'asc' }))[0]).toEqual(a1);
    });

    it('статистика навыков и дневная активность', async () => {
      const repo = await make();
      await repo.saveSettings({ ...(await repo.getSettings()), dailyGoal: 7 });
      await repo.saveAttempt(contractAttempt({ createdAt: 1 }));
      await repo.saveAttempt(
        contractAttempt({
          createdAt: 2,
          correct: false,
          grade: { verdict: 'incorrect', skillOutcomes: [{ skill: 'bos', correct: 0, total: 1 }] },
        }),
      );
      await repo.saveAttempt(contractAttempt({ createdAt: 3, localDay: '2026-11-04' }));
      const bos = (await repo.getSkillStats()).find((s) => s.skill === 'bos');
      expect(bos).toMatchObject({ attempts: 3, correct: 2 });
      expect(bos?.accuracy).toBeCloseTo(2 / 3);
      expect(await repo.getDailyActivity('2026-11-03', '2026-11-04')).toEqual([
        { day: '2026-11-03', tasksDone: 2, goal: 7 },
        { day: '2026-11-04', tasksDone: 1, goal: 7 },
      ]);
      expect(await repo.getDailyActivity('2026-11-05', '2026-11-06')).toEqual([]);
    });

    it('разметка терминала: замена целиком по символу', async () => {
      const repo = await make();
      expect(await repo.getTerminalMarks('BTCUSDT')).toEqual([]);
      await repo.saveTerminalMarks('BTCUSDT', [contractMark]);
      await repo.saveTerminalMarks('ETHUSDT', []);
      expect(await repo.getTerminalMarks('BTCUSDT')).toEqual([contractMark]);
      await repo.saveTerminalMarks('BTCUSDT', []);
      expect(await repo.getTerminalMarks('BTCUSDT')).toEqual([]);
    });
  });
}
