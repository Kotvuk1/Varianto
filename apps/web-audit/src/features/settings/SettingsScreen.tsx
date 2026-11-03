'use client';

import { Minus, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ru } from '@/i18n/ru';
import { useRepository } from '@/storage';
import { useTheme } from '@/theme';
import { IconButton, Segmented, useToast } from '@/ui';
import { ErrorState, LoadingRows } from '../common/StateBlock';
import { useAsync } from '../common/useAsync';

export const DAILY_GOAL_MIN = 1;
export const DAILY_GOAL_MAX = 50;

const THEME_OPTIONS = [
  { value: 'dark', label: ru.settings.themeDark },
  { value: 'light', label: ru.settings.themeLight },
] as const;
const CANDLE_OPTIONS = [
  { value: 'color', label: ru.settings.candlesColor },
  { value: 'mono', label: ru.settings.candlesMono },
] as const;

const ROW = 'flex min-h-14 flex-col justify-center gap-2 border-b border-border py-3 lg:flex-row lg:items-center lg:justify-between';

function DailyGoalStepper() {
  const repo = useRepository();
  const toast = useToast();
  const load = useCallback(() => repo.getSettings(), [repo]);
  const settings = useAsync(load);
  const [override, setGoal] = useState<number | null>(null);
  const goal = override ?? (settings.status === 'ready' ? settings.data.dailyGoal : null);

  if (settings.status === 'error') {
    return <ErrorState title={ru.states.storageErrorTitle} text={ru.states.storageErrorText} onRetry={settings.reload} />;
  }
  if (goal === null) return <LoadingRows rows={1} rowHeight="h-11" />;

  async function change(next: number) {
    const clamped = Math.min(DAILY_GOAL_MAX, Math.max(DAILY_GOAL_MIN, next));
    if (clamped === goal) return;
    setGoal(clamped);
    try {
      await repo.saveSettings({ ...(await repo.getSettings()), dailyGoal: clamped });
      toast.show({ message: ru.settings.saved });
    } catch {
      settings.reload();
    }
  }

  return (
    <div className="flex items-center gap-1">
      <IconButton
        label={ru.actions.decrease}
        icon={<Minus size={20} strokeWidth={1.75} />}
        disabled={goal <= DAILY_GOAL_MIN}
        onClick={() => void change(goal - 1)}
        className="border-border-strong"
      />
      <output aria-label={ru.settings.dailyGoal} className="tnum min-w-16 text-center text-base font-medium">
        {goal}
      </output>
      <IconButton
        label={ru.actions.increase}
        icon={<Plus size={20} strokeWidth={1.75} />}
        disabled={goal >= DAILY_GOAL_MAX}
        onClick={() => void change(goal + 1)}
        className="border-border-strong"
      />
      <span className="ml-2 text-sm text-text-2">{ru.settings.dailyGoalUnit}</span>
    </div>
  );
}

/** Настройки: тема и стиль свечей применяются сразу и сохраняются в Repository. */
export function SettingsScreen() {
  const { theme, candleStyle, setTheme, setCandleStyle } = useTheme();
  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-6 lg:pt-4">
      <h1 className="py-3 text-xl font-semibold">{ru.settings.title}</h1>
      <div className={ROW}>
        <span className="text-sm font-medium">{ru.settings.theme}</span>
        <Segmented label={ru.settings.theme} options={THEME_OPTIONS} value={theme} onChange={setTheme} className="lg:w-64" />
      </div>
      <div className={ROW}>
        <span className="text-sm font-medium">{ru.settings.candles}</span>
        <Segmented
          label={ru.settings.candles}
          options={CANDLE_OPTIONS}
          value={candleStyle}
          onChange={setCandleStyle}
          className="lg:w-64"
        />
      </div>
      <div className={ROW}>
        <span className="text-sm font-medium">{ru.settings.dailyGoal}</span>
        <DailyGoalStepper />
      </div>
    </div>
  );
}
