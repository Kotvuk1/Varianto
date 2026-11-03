'use client';

import { useCallback } from 'react';
import { softStreak } from '@/data/streak';
import { localDay } from '@/i18n/format';
import { useRepository, type SkillStat } from '@/storage';
import { useAsync } from '../common/useAsync';

/** Минимальное окно, при котором показывается точность (DATABASE_SCHEMA §5.1, MIN_SAMPLE). */
export const MIN_SAMPLE = 5;

export interface DailyProgress {
  done: number;
  goal: number;
  streak: number;
}

/** Дневная цель и мягкая серия из Repository. Новый пользователь: 0 из 10, серия 0. */
export function useDailyProgress() {
  const repo = useRepository();
  const load = useCallback(async (): Promise<DailyProgress> => {
    const settings = await repo.getSettings();
    const today = localDay(Date.now());
    const activity = await repo.getDailyActivity('2000-01-01', today);
    const map = new Map(activity.map((a) => [a.day, a]));
    const todayStat = map.get(today);
    const firstDay = activity[0]?.day ?? today;
    return {
      done: todayStat?.tasksDone ?? 0,
      goal: settings.dailyGoal,
      streak: softStreak(map, today, firstDay).streak,
    };
  }, [repo]);
  return useAsync(load);
}

/** Слабые места: навыки с достаточным окном, по возрастанию точности (при равенстве — меньше окно). */
export function useWeakSkills() {
  const repo = useRepository();
  const load = useCallback(async (): Promise<SkillStat[]> => {
    const stats = await repo.getSkillStats();
    return stats
      .filter((s) => s.accuracy !== null && s.recent.length >= MIN_SAMPLE)
      .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || a.recent.length - b.recent.length);
  }, [repo]);
  return useAsync(load);
}
