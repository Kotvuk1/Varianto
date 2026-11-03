import type { Mark } from '@tl/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { LocalRepository } from './LocalRepository';
import type { Attempt } from './types';

let n = 0;
let repo: LocalRepository;

beforeEach(() => {
  n += 1;
  repo = new LocalRepository(`trading-lab-test-${n}`);
});

function attempt(over: Partial<Attempt> = {}): Attempt {
  return {
    id: crypto.randomUUID(),
    module: 'market-structure',
    taskId: 't1',
    task: {},
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

// SYNTHETIC: минимальная метка для проверки хранилища, не рыночные данные
const mark: Mark = {
  id: 'synthetic_m1',
  kind: 'swing-high',
  anchors: [{ time: 1, price: 2 }],
  scope: null,
  direction: null,
  author: 'user',
};

describe('LocalRepository: настройки', () => {
  it('создаёт настройки по умолчанию', async () => {
    const s = await repo.getSettings();
    expect(s).toMatchObject({
      theme: 'dark',
      candleStyle: 'blue-orange',
      dailyGoal: 10,
      lastTerminalSymbol: 'BTCUSDT',
      locale: 'ru',
    });
    expect((await repo.getSettings()).id).toBe(s.id);
  });

  it('сохраняет и возвращает изменения', async () => {
    const s = await repo.getSettings();
    await repo.saveSettings({ ...s, theme: 'light', dailyGoal: 15 });
    const again = await repo.getSettings();
    expect(again.theme).toBe('light');
    expect(again.dailyGoal).toBe(15);
    expect(again.id).toBe(s.id);
  });
});

describe('LocalRepository: разметка терминала', () => {
  it('пусто для новой пары', async () => {
    expect(await repo.getTerminalMarks('BTCUSDT')).toEqual([]);
  });

  it('заменяет всю разметку пары и не смешивает пары', async () => {
    await repo.saveTerminalMarks('BTCUSDT', [mark]);
    await repo.saveTerminalMarks('ETHUSDT', [{ ...mark, id: 'synthetic_m2' }]);
    await repo.saveTerminalMarks('BTCUSDT', [{ ...mark, id: 'synthetic_m3' }]);
    expect((await repo.getTerminalMarks('BTCUSDT')).map((m) => m.id)).toEqual(['synthetic_m3']);
    expect((await repo.getTerminalMarks('ETHUSDT')).map((m) => m.id)).toEqual(['synthetic_m2']);
  });
});

describe('LocalRepository: попытки', () => {
  it('сохраняет, фильтрует и сортирует', async () => {
    await repo.saveAttempt(attempt({ id: 'a', createdAt: 1 }));
    await repo.saveAttempt(attempt({ id: 'b', createdAt: 2, module: 'challenge', skills: ['x'], correct: false }));
    await repo.saveAttempt(attempt({ id: 'c', createdAt: 3 }));
    expect((await repo.listAttempts({})).map((a) => a.id)).toEqual(['c', 'b', 'a']);
    expect((await repo.listAttempts({ order: 'asc' })).map((a) => a.id)).toEqual(['a', 'b', 'c']);
    expect((await repo.listAttempts({ module: 'challenge' })).map((a) => a.id)).toEqual(['b']);
    expect((await repo.listAttempts({ skill: 'bos' })).map((a) => a.id)).toEqual(['c', 'a']);
    expect((await repo.listAttempts({ correct: false })).map((a) => a.id)).toEqual(['b']);
    expect((await repo.listAttempts({ fromTime: 2, toTime: 2 })).map((a) => a.id)).toEqual(['b']);
    expect((await repo.listAttempts({ limit: 1, offset: 1 })).map((a) => a.id)).toEqual(['b']);
  });

  it('повторная запись той же попытки игнорируется', async () => {
    const a = attempt({ id: 'dup' });
    await repo.saveAttempt(a);
    await repo.saveAttempt(a);
    expect(await repo.listAttempts({})).toHaveLength(1);
    expect((await repo.getDailyActivity('2026-11-03', '2026-11-03'))[0]?.tasksDone).toBe(1);
  });

  it('обновляет статистику навыков и дневную активность', async () => {
    await repo.saveAttempt(attempt({ id: '1' }));
    await repo.saveAttempt(
      attempt({
        id: '2',
        correct: false,
        grade: { verdict: 'incorrect', skillOutcomes: [{ skill: 'bos', correct: 0, total: 2 }] },
      }),
    );
    const stats = await repo.getSkillStats();
    expect(stats).toHaveLength(1);
    expect(stats[0]).toMatchObject({ skill: 'bos', attempts: 2, correct: 1, accuracy: 0.5 });
    expect(await repo.getDailyActivity('2026-11-01', '2026-11-05')).toEqual([
      { day: '2026-11-03', tasksDone: 2, goal: 10 },
    ]);
  });

  it('окно навыка ограничено 20 исходами', async () => {
    for (let i = 0; i < 25; i++) await repo.saveAttempt(attempt({ id: `w${i}`, createdAt: i }));
    const [s] = await repo.getSkillStats();
    expect(s?.recent).toHaveLength(20);
    expect(s?.attempts).toBe(25);
  });

  it('навык верен при correct/total >= 0.8 (OK_THRESHOLD из @tl/core)', async () => {
    const out = (correct: number, total: number) => ({ verdict: 'partial' as const, skillOutcomes: [{ skill: 'bos', correct, total }] });
    await repo.saveAttempt(attempt({ grade: out(4, 5), createdAt: 1 }));
    await repo.saveAttempt(attempt({ grade: out(3, 5), createdAt: 2 }));
    const [bos] = await repo.getSkillStats();
    expect(bos!.recent.map((r) => r.ok)).toEqual([true, false]);
    expect(bos!.correct).toBe(1);
  });
});
