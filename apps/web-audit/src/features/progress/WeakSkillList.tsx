import { formatPercent, plural } from '@/i18n/format';
import { ru } from '@/i18n/ru';
import { pr, SKILL_NAMES_RU } from '@/i18n/ru/progress';
import type { SkillId } from '@tl/core';
import type { SkillStat } from '@/storage';
import { ButtonLink, ProgressBar } from '@/ui';
import { MIN_SAMPLE, trainTarget, trendOf } from './progressLogic';

export const skillName = (skill: string): string => SKILL_NAMES_RU[skill as SkillId] ?? skill;

/** Строки навыков: название, %, бар, попытки, тренд и «Тренировать». Один цвет независимо от значения. */
export function WeakSkillList({ skills, showTrain = true }: { skills: readonly SkillStat[]; showTrain?: boolean }) {
  return (
    <ul data-testid="weak-list">
      {skills.map((s) => {
        const enough = s.accuracy !== null && s.recent.length >= MIN_SAMPLE;
        const trend = trendOf(s.recent);
        const name = skillName(s.skill);
        return (
          <li
            key={s.skill}
            data-testid="weak-row"
            data-skill={s.skill}
            className="flex min-h-14 flex-col justify-center gap-1 border-b border-border py-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="tnum text-xs text-text-2">
                  {enough
                    ? `${formatPercent(s.accuracy ?? 0)} · ${s.recent.length} ${plural(s.recent.length, ru.plural.attempts)}${trend ? ` · ${pr.trendLabel}: ${pr.trend[trend].toLowerCase()}` : ''}`
                    : pr.fewData(s.recent.length, MIN_SAMPLE)}
                </span>
              </div>
              {showTrain && (
                <ButtonLink
                  href={trainTarget(s).href}
                  variant="secondary"
                  size="md"
                  aria-label={pr.trainSkill(name)}
                  data-testid="train-skill"
                >
                  {pr.train}
                </ButtonLink>
              )}
            </div>
            {enough && <ProgressBar value={Math.round((s.accuracy ?? 0) * 100)} max={100} label={name} size="sm" />}
          </li>
        );
      })}
    </ul>
  );
}
