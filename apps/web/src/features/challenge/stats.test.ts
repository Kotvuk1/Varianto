import { describe, expect, it } from 'vitest';
import type { Attempt } from '@/storage';
import { computeChallengeStats } from './stats';

function att(i: number, side: string, r: number | null, waitCorrect?: boolean): Attempt {
  return {
    id: `a${i}`, module: 'challenge', taskId: `t${i}`, task: {}, answer: { side },
    grade: { verdict: 'correct', detail: { challenge: { waitCorrect: waitCorrect ?? null } } },
    algoVersion: 'x', skills: [], correct: true, rMultiple: r, localDay: '2026-01-01', durationMs: null, createdAt: i, updatedAt: i,
  };
}

describe('computeChallengeStats', () => {
  it('пусто -> null и пустая кривая', () => {
    expect(computeChallengeStats([])).toMatchObject({ positions: 0, winRate: null, avgR: null, waitCorrect: null, curve: [] });
  });
  it('win rate по R > 0, средний R, доля верных WAIT, накопленная кривая', () => {
    const s = computeChallengeStats([att(3, 'SHORT', 2), att(1, 'LONG', -1), att(2, 'WAIT', null, true), att(4, 'WAIT', null, false), att(5, 'LONG', -1)]);
    expect(s.positions).toBe(3);
    expect(s.winRate).toBeCloseTo(1 / 3);
    expect(s.avgR).toBeCloseTo(0);
    expect(s.waitCorrect).toBe(0.5);
    expect(s.curve).toEqual([-1, 1, 0]);
  });
});
