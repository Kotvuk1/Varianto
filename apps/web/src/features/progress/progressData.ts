'use client';

import { useCallback } from 'react';
import { softStreak } from '@/data/streak';
import { localDay } from '@/i18n/format';
import { useRepository, type SkillStat } from '@/storage';
import { useLiveData } from './useLiveData';
import { selectWeak } from './progressLogic';

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
  return useLiveData(load);
}

/** Слабые места: навыки с окном >= MIN_SAMPLE по возрастанию точности (ядро: rankWeakSkills). */
export function useWeakSkills() {
  const repo = useRepository();
  const load = useCallback(async (): Promise<SkillStat[]> => selectWeak(await repo.getSkillStats()), [repo]);
  return useLiveData(load);
}

/** Все статистики навыков (для группировки и рекомендации). */
export function useSkillStats() {
  const repo = useRepository();
  const load = useCallback(() => repo.getSkillStats(), [repo]);
  return useLiveData(load);
}

/** Все попытки по убыванию времени (журнал ошибок, статистика Challenge). */
export function useAttempts() {
  const repo = useRepository();
  const load = useCallback(() => repo.listAttempts({ order: 'desc' }), [repo]);
  return useLiveData(load);
}
