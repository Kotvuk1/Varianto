import { plural } from '@/i18n/format';
import { ru } from '@/i18n/ru';
import { ProgressBar } from '@/ui';
import { ErrorState, LoadingRows } from '../common/StateBlock';
import { useDailyProgress } from './progressData';

/** Цель дня и серия: одна строка + бар, серия — текст без значков. */
export function DailyGoal() {
  const p = useDailyProgress();
  if (p.status === 'loading') return <LoadingRows rows={2} rowHeight="h-6" />;
  if (p.status === 'error')
    return <ErrorState title={ru.states.storageErrorTitle} text={ru.states.storageErrorText} onRetry={p.reload} />;
  const { done, goal, streak } = p.data;
  return (
    <div className="flex flex-col gap-2">
      <p className="tnum text-sm">{ru.home.goalLine(done, goal)}</p>
      <ProgressBar value={done} max={goal} label={ru.home.goalBar} />
      <p className="tnum text-sm text-text-2">
        {ru.home.streak(streak, plural(streak, ru.plural.days))}
      </p>
      <p className="text-xs text-text-3">{ru.home.streakHelp}</p>
    </div>
  );
}
