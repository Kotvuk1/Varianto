'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatPercent } from '@/i18n/format';
import { ru } from '@/i18n/ru';
import { pr } from '@/i18n/ru/progress';
import { ButtonLink } from '@/ui';
import { EmptyState, ErrorState, LoadingRows } from '../common/StateBlock';
import { useSkillStats } from '../progress/progressData';
import { MIN_SAMPLE, moduleAccuracies, recommend, selectWeak } from '../progress/progressLogic';
import { ModuleAccuracy } from '../progress/ModuleAccuracy';
import { skillName, WeakSkillList } from '../progress/WeakSkillList';

/** «Продолжить»: рекомендованное задание по слабейшему навыку. Без попыток — старт с Market Structure. */
export function ContinueBlock() {
  const stats = useSkillStats();
  const rec = stats.status === 'ready' ? recommend(stats.data) : null;
  if (stats.status === 'ready' && rec) {
    const acc = rec.skill.accuracy;
    return (
      <section aria-labelledby="start-h" className="order-1 border-b border-border py-4 lg:col-span-2 lg:border-b-0">
        <h2 id="start-h" className="text-xl font-semibold">
          {pr.continueTitle}
        </h2>
        <p className="mt-1 text-sm text-text-2">
          {pr.continueHint(pr.moduleNames[rec.target.module], skillName(rec.skill.skill))}
          {acc !== null && rec.skill.recent.length >= 5 ? ` · ${formatPercent(acc)}` : ''}
        </p>
        <ButtonLink href={rec.target.href} variant="primary" size="lg" data-testid="continue" className="mt-4 w-full lg:w-auto">
          {pr.continueButton}
        </ButtonLink>
      </section>
    );
  }
  return (
    <section aria-labelledby="start-h" className="order-1 border-b border-border py-4 lg:col-span-2 lg:border-b-0">
      <h2 id="start-h" className="text-xl font-semibold">
        {ru.home.start}
      </h2>
      <p className="mt-1 text-sm text-text-2">{ru.home.startHint}</p>
      <ButtonLink href="/learn/market-structure" variant="primary" size="lg" className="mt-4 w-full lg:w-auto">
        {ru.actions.startMarketStructure}
      </ButtonLink>
    </section>
  );
}

/** «Слабые места» (топ-3) с тренировкой по навыку. */
export function HomeWeakSpots() {
  const stats = useSkillStats();
  if (stats.status === 'loading') return <LoadingRows />;
  if (stats.status === 'error')
    return <ErrorState title={ru.states.storageErrorTitle} text={ru.states.storageErrorText} onRetry={stats.reload} />;
  const weak = selectWeak(stats.data, 3);
  if (weak.length === 0) {
    const mods = moduleAccuracies(stats.data);
    if (mods.length === 0) return <EmptyState title={ru.empty.weakTitle} text={ru.empty.weakText} />;
    const done = mods.reduce((n, m) => n + m.attempts, 0);
    return (
      <>
        <p className="mb-2 text-sm text-text-2" data-testid="home-few-data">
          {pr.homeFewData(done, MIN_SAMPLE)}
        </p>
        <ModuleAccuracy stats={stats.data} />
        <Link href="/progress" className="flex min-h-11 items-center justify-between text-sm text-text-2 hover:text-text-1">
          <span>{pr.weakAll}</span>
          <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
        </Link>
      </>
    );
  }
  return (
    <>
      <WeakSkillList skills={weak} />
      <Link
        href="/progress"
        className="mt-2 flex min-h-11 items-center justify-between text-sm text-text-2 hover:text-text-1"
      >
        <span>{pr.weakAll}</span>
        <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
      </Link>
    </>
  );
}

