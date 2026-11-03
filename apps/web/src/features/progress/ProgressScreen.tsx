'use client';

import { useState } from 'react';
import { ru } from '@/i18n/ru';
import { ButtonLink, Segmented, Stat } from '@/ui';
import { EmptyState, ErrorState, LoadingRows } from '../common/StateBlock';
import { DailyGoal } from './DailyGoal';
import { useWeakSkills } from './progressData';
import { WeakSkillList } from './WeakSkillList';

type Tab = 'weak' | 'skills' | 'challenge';

const TABS = [
  { value: 'weak', label: ru.progress.tabs.weak },
  { value: 'skills', label: ru.progress.tabs.skills },
  { value: 'challenge', label: ru.progress.tabs.challenge },
] as const;

function ErrorLog() {
  return (
    <section aria-labelledby="errors-h" className="border-t border-border py-4">
      <h2 id="errors-h" className="mb-2 text-lg font-semibold">
        {ru.progress.errorLog}
      </h2>
      <EmptyState title={ru.empty.errorsTitle} text={ru.empty.errorsText} />
    </section>
  );
}

function WeakTab() {
  const weak = useWeakSkills();
  return (
    <>
      <section aria-labelledby="weak-h" className="py-4">
        <h2 id="weak-h" className="text-lg font-semibold">
          {ru.home.weakTitle}
        </h2>
        <p className="mb-2 text-sm text-text-2">{ru.progress.weakSubtitle}</p>
        {weak.status === 'loading' && <LoadingRows />}
        {weak.status === 'error' && (
          <ErrorState title={ru.states.storageErrorTitle} text={ru.states.storageErrorText} onRetry={weak.reload} />
        )}
        {weak.status === 'ready' && weak.data.length === 0 && (
          <EmptyState
            title={ru.empty.weakTitle}
            text={ru.empty.weakText}
            action={
              <ButtonLink href="/learn/market-structure" variant="primary" size="lg">
                {ru.actions.startMarketStructure}
              </ButtonLink>
            }
          />
        )}
        {weak.status === 'ready' && weak.data.length > 0 && (
          <>
            <WeakSkillList skills={weak.data} />
            <ButtonLink href="/learn/market-structure" variant="primary" size="lg" className="mt-4 w-full lg:w-auto">
              {ru.actions.trainWeak}
            </ButtonLink>
          </>
        )}
      </section>
      <ErrorLog />
    </>
  );
}

function SkillsTab() {
  return (
    <>
      <section aria-labelledby="today-h" className="border-b border-border py-4">
        <h2 id="today-h" className="mb-2 text-lg font-semibold">
          {ru.home.todayTitle}
        </h2>
        <DailyGoal />
      </section>
      <section className="py-4">
        <EmptyState title={ru.empty.weakTitle} text={ru.progress.skillsEmpty} />
      </section>
    </>
  );
}

function ChallengeTab() {
  const { winRate, avgR, waitCorrect } = ru.progress.challengeStats;
  return (
    <>
      <section className="grid grid-cols-3 gap-4 py-4" aria-label={ru.progress.tabs.challenge}>
        {/* Пока нет сценариев: прочерк вместо значений */}
        <Stat label={winRate} value="—" />
        <Stat label={avgR} value="—" />
        <Stat label={waitCorrect} value="—" />
      </section>
      <section aria-labelledby="scenarios-h" className="border-t border-border py-4">
        <h2 id="scenarios-h" className="mb-2 text-lg font-semibold">
          {ru.progress.recentScenarios}
        </h2>
        <EmptyState
          title={ru.empty.scenariosTitle}
          text={ru.empty.scenariosText}
          action={
            <ButtonLink href="/learn/challenge" variant="secondary" size="lg">
              {ru.empty.startScenario}
            </ButtonLink>
          }
        />
      </section>
    </>
  );
}

/** Раздел «Прогресс» (LAYOUTS §6). Данные из Repository; без попыток — пустые состояния. */
export function ProgressScreen() {
  const [tab, setTab] = useState<Tab>('weak');
  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pb-6 lg:pt-4">
      <h1 className="py-3 text-xl font-semibold">{ru.progress.title}</h1>
      <Segmented label={ru.progress.tabsLabel} options={TABS} value={tab} onChange={setTab} className="lg:max-w-md" />
      {tab === 'weak' && <WeakTab />}
      {tab === 'skills' && <SkillsTab />}
      {tab === 'challenge' && <ChallengeTab />}
    </div>
  );
}
