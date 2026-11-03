'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ru } from '@/i18n/ru';
import { ButtonLink } from '@/ui';
import { EmptyState, ErrorState, LoadingRows } from '../common/StateBlock';
import { DailyGoal } from '../progress/DailyGoal';
import { useWeakSkills } from '../progress/progressData';
import { WeakSkillList } from '../progress/WeakSkillList';

const MODULES = [
  { href: '/learn/market-structure', title: ru.modules.marketStructure, modes: ru.modules.marketStructureModes },
  { href: '/learn/price-action', title: ru.modules.priceAction, modes: ru.modules.priceActionModes },
  { href: '/learn/challenge', title: ru.modules.challenge, modes: ru.modules.challengeModes },
] as const;

const SECTION = 'border-b border-border py-4 lg:border-b-0';

function WeakSpots() {
  const weak = useWeakSkills();
  if (weak.status === 'loading') return <LoadingRows />;
  if (weak.status === 'error')
    return <ErrorState title={ru.states.storageErrorTitle} text={ru.states.storageErrorText} onRetry={weak.reload} />;
  if (weak.data.length === 0) return <EmptyState title={ru.empty.weakTitle} text={ru.empty.weakText} />;
  return (
    <>
      <WeakSkillList skills={weak.data.slice(0, 3)} />
      <ButtonLink href="/learn/market-structure" variant="secondary" size="lg" className="mt-4 w-full lg:w-auto">
        {ru.actions.trainWeak}
      </ButtonLink>
    </>
  );
}

/** Главная: раздел «Обучение» (LAYOUTS §1). Данные только из Repository, без выдуманных значений. */
export function LearnScreen() {
  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pb-6 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:pt-4">
      <h1 className="sr-only">{ru.nav.learn}</h1>

      <section aria-labelledby="start-h" className={`${SECTION} order-1 lg:col-span-2`}>
        <h2 id="start-h" className="text-xl font-semibold">
          {ru.home.start}
        </h2>
        <p className="mt-1 text-sm text-text-2">{ru.home.startHint}</p>
        <ButtonLink href="/learn/market-structure" variant="primary" size="lg" className="mt-4 w-full lg:w-auto">
          {ru.actions.startMarketStructure}
        </ButtonLink>
      </section>

      <section aria-labelledby="weak-h" className={`${SECTION} order-2 lg:order-3 lg:col-span-3 lg:border-t`}>
        <h2 id="weak-h" className="mb-2 text-lg font-semibold">
          {ru.home.weakTitle}
        </h2>
        <WeakSpots />
      </section>

      <section aria-labelledby="today-h" className={`${SECTION} order-3 lg:order-2 lg:col-span-1`}>
        <h2 id="today-h" className="mb-2 text-lg font-semibold">
          {ru.home.todayTitle}
        </h2>
        <DailyGoal />
      </section>

      <section aria-labelledby="modules-h" className="order-4 py-4 lg:col-span-3 lg:border-t lg:border-border">
        <h2 id="modules-h" className="mb-2 text-lg font-semibold">
          {ru.modules.title}
        </h2>
        <ul className="lg:grid lg:grid-cols-3 lg:gap-x-8">
          {MODULES.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="flex min-h-14 items-center justify-between gap-2 border-b border-border py-2 hover:bg-surface-1"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{m.title}</span>
                  <span className="text-xs text-text-2">{m.modes}</span>
                </span>
                <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
