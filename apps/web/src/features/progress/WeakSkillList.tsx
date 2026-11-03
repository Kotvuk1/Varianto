import { formatPercent, plural } from '@/i18n/format';
import { ru } from '@/i18n/ru';
import type { SkillStat } from '@/storage';
import { ProgressBar } from '@/ui';

/** Строки навыков: название, %, бар, число попыток. Один цвет независимо от значения. */
export function WeakSkillList({ skills }: { skills: readonly SkillStat[] }) {
  return (
    <ul>
      {skills.map((s) => (
        <li key={s.skill} className="flex min-h-14 flex-col justify-center gap-1 border-b border-border py-2">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium">{s.skill}</span>
            <span className="tnum text-sm text-text-2">
              {formatPercent(s.accuracy ?? 0)} · {s.recent.length} {plural(s.recent.length, ru.plural.attempts)}
            </span>
          </div>
          <ProgressBar value={Math.round((s.accuracy ?? 0) * 100)} max={100} label={s.skill} size="sm" />
        </li>
      ))}
    </ul>
  );
}
