import { describe, expect, it } from 'vitest';
import { prevDay, softStreak } from './streak';

const done = { tasksDone: 10, goal: 10 };
const days = (list: Record<string, { tasksDone: number; goal: number }>) => new Map(Object.entries(list));

describe('softStreak (AC-15)', () => {
  it('prevDay переходит через границу месяца', () => {
    expect(prevDay('2026-11-01')).toBe('2026-10-31');
    expect(prevDay('2026-03-01')).toBe('2026-02-28');
  });
  it('пустая история: серия 0', () => {
    expect(softStreak(new Map(), '2026-11-03', '2026-11-03').streak).toBe(0);
  });
  it('дни 1,2,3 выполнены, 4 пропущен, 5 выполнен -> 4', () => {
    const m = days({ '2026-11-01': done, '2026-11-02': done, '2026-11-03': done, '2026-11-05': done });
    expect(softStreak(m, '2026-11-05', '2026-11-01').streak).toBe(4);
  });
  it('два пропуска подряд обнуляют серию к дню 6', () => {
    const m = days({ '2026-11-01': done, '2026-11-02': done, '2026-11-03': done });
    expect(softStreak(m, '2026-11-06', '2026-11-01').streak).toBe(0);
    expect(softStreak(m, '2026-11-05', '2026-11-01').streak).toBe(3);
  });
});
