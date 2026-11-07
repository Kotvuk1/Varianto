import { formatPercent } from '@/i18n/format';
import { pr } from '@/i18n/ru/progress';
import { ProgressBar } from '@/ui';
import type { SkillStat } from '@/storage';
import { MIN_SAMPLE, moduleAccuracies } from './progressLogic';

/** Точность по модулям целиком; пока по навыкам мало данных, подпись это прямо говорит (F-11). */
export function ModuleAccuracy({ stats }: { stats: readonly SkillStat[] }) {
  const rows = moduleAccuracies(stats);
  if (rows.length === 0) return null;
  return (
    <ul data-testid="module-accuracy" aria-label={pr.moduleAccTitle} className="mb-2">
      {rows.map((m) => (
        <li key={m.module} data-module={m.module} className="flex min-h-14 flex-col justify-center gap-1 border-b border-border py-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{pr.moduleNames[m.module]}</span>
            <span className="tnum text-sm">
              {formatPercent(m.accuracy)} · {pr.moduleAccLine(m.correct, m.attempts)}
            </span>
          </div>
          <ProgressBar value={Math.round(m.accuracy * 100)} max={100} label={pr.moduleNames[m.module]} size="sm" />
          {m.skillsFew && <span className="text-xs text-text-2">{pr.moduleFew(m.maxSkillAttempts, MIN_SAMPLE)}</span>}
        </li>
      ))}
    </ul>
  );
}
