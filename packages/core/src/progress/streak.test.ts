import { describe, expect, it } from 'vitest';
import { challengeStats, dailyProgress, longestStreak, nextDay, prevDay, softStreak, type DayMap } from './streak';

const days = (spec: Record<string, [number, number]>): DayMap =>
  new Map(Object.entries(spec).map(([d, [tasksDone, goal]]) => [d, { tasksDone, goal }]));
const d = (n: number) => `2026-10-${String(n).padStart(2, '0')}`;
const met = (...ns: number[]) => days(Object.fromEntries(ns.map((n) => [d(n), [10, 10] as [number, number]])));

describe('даты', () => {
  it('prevDay/nextDay через границы месяца и года', () => {
    expect(prevDay('2026-11-01')).toBe('2026-10-31');
    expect(prevDay('2026-01-01')).toBe('2025-12-31');
    expect(nextDay('2028-02-28')).toBe('2028-02-29');
  });
});

describe('мягкая серия (AC-15)', () => {
  it('дни 1,2,3, пропуск 4, выполнен 5 -> серия 4', () => {
    expect(softStreak(met(1, 2, 3, 5), d(5), d(1)).streak).toBe(4);
  });
  it('дни 1,2,3, пропуски 4 и 5 -> к дню 6 серия 0', () => {
    expect(softStreak(met(1, 2, 3), d(6), d(1)).streak).toBe(0);
  });
  it('в день 5 (не завершён) серия ещё жива', () => {
    const r = softStreak(met(1, 2, 3), d(5), d(1));
    expect(r.streak).toBe(3);
    expect(r.atRisk).toBe(true);
  });
  it('сегодня выполнено, вчера нет -> atRisk=false', () => {
    const r = softStreak(met(1, 2, 3, 5), d(5), d(1));
    expect(r.atRisk).toBe(false);
  });
  it('цель не достигнута (9 из 10) не считается выполненным днём', () => {
    expect(softStreak(days({ [d(1)]: [9, 10] }), d(1), d(1)).streak).toBe(0);
  });
  it('пустая история', () => {
    expect(softStreak(new Map(), d(3), d(3))).toEqual({ streak: 0, atRisk: true });
  });
  it('наибольшая серия по тому же правилу', () => {
    // 1,2,3, пропуск, 5,6, пропуски 7,8, 9
    expect(longestStreak(met(1, 2, 3, 5, 6, 9), d(1), d(9))).toBe(5);
    expect(longestStreak(met(), d(1), d(3))).toBe(0);
  });
});

describe('дневная цель', () => {
  it('прогресс и выполнение', () => {
    expect(dailyProgress(3, 10)).toEqual({ tasksDone: 3, goal: 10, ratio: 0.3, reached: false });
    expect(dailyProgress(12, 10)).toEqual({ tasksDone: 12, goal: 10, ratio: 1, reached: true });
  });
  it('цель ограничена диапазоном 1..100', () => {
    expect(dailyProgress(1, 0).goal).toBe(1);
    expect(dailyProgress(1, 500).goal).toBe(100);
  });
});

describe('статистика Challenge', () => {
  it('win rate, средний R, доля верных WAIT', () => {
    const s = challengeStats([
      { side: 'LONG', rMultiple: 2 },
      { side: 'SHORT', rMultiple: -1 },
      { side: 'LONG', rMultiple: 0.5 },
      { side: 'WAIT', rMultiple: null, waitCorrect: true },
      { side: 'WAIT', rMultiple: null, waitCorrect: false },
      { side: 'WAIT', rMultiple: null, waitCorrect: true },
    ]);
    expect(s.positions).toBe(3);
    expect(s.winRate).toBeCloseTo(2 / 3, 12);
    expect(s.avgR).toBeCloseTo((2 - 1 + 0.5) / 3, 12);
    expect(s.waitCorrectRate).toBeCloseTo(2 / 3, 12);
  });
  it('пустые выборки -> null', () => {
    expect(challengeStats([])).toEqual({ positions: 0, winRate: null, avgR: null, waits: 0, waitCorrectRate: null });
  });
});
