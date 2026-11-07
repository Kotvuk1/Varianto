'use client';

import { useState } from 'react';
import { formatDayShort, formatPercent, formatR, plural } from '@/i18n/format';
import { ru } from '@/i18n/ru';
import { pr } from '@/i18n/ru/progress';
import { ch } from '@/i18n/ru/challenge';
import type { Attempt } from '@/storage';
import { ButtonLink, ProgressBar, Segmented, Stat } from '@/ui';
import { RCurve } from '../challenge/RCurve';
import { computeChallengeStats, sideOf } from '../challenge/stats';
import { EmptyState, ErrorState, LoadingRows } from '../common/StateBlock';
import { ModuleAccuracy } from './ModuleAccuracy';
import { DailyGoal } from './DailyGoal';
import { ErrorLog } from './ErrorLog';
import { useAttempts, useSkillStats } from './progressData';
import { avgQuality, groupByModule, MIN_SAMPLE, selectFewData, selectWeak } from './progressLogic';
import { skillName, WeakSkillList } from './WeakSkillList';

type Tab = 'weak' | 'skills' | 'challenge';

const TABS = [
  { value: 'weak', label: ru.progress.tabs.weak },
  { value: 'skills', label: ru.progress.tabs.skills },
  { value: 'challenge', label: ru.progress.tabs.challenge },
] as const;

const storageError = (reload: () => void) => (
  <ErrorState title={ru.states.storageErrorTitle} text={ru.states.storageErrorText} onRetry={reload} />
);

function WeakTab() {
  const stats = useSkillStats();
  const attempts = useAttempts();
  return (
    <div className="lg:grid lg:grid-cols-[55fr_45fr] lg:gap-x-8">
      <section aria-labelledby="weak-h" className="py-4">
        <h2 id="weak-h" className="text-lg font-semibold">
          {ru.home.weakTitle}
        </h2>
        <p className="mb-2 text-sm text-text-2">{ru.progress.weakSubtitle}</p>
        {stats.status === 'loading' && <LoadingRows />}
        {stats.status === 'error' && storageError(stats.reload)}
        {stats.status === 'ready' && <WeakBody stats={stats.data} />}
      </section>
      <div>
        {attempts.status === 'loading' && <LoadingRows />}
        {attempts.status === 'error' && storageError(attempts.reload)}
        {attempts.status === 'ready' && <ErrorLog attempts={attempts.data} />}
      </div>
    </div>
  );
}

function WeakBody({ stats }: { stats: Parameters<typeof selectWeak>[0] }) {
  const weak = selectWeak(stats);
  const few = selectFewData(stats);
  if (weak.length === 0 && few.length === 0)
    return (
      <EmptyState
        title={ru.empty.weakTitle}
        text={ru.empty.weakText}
        action={
          <ButtonLink href="/learn/stage-swings" variant="primary" size="lg">
            {ru.actions.startMarketStructure}
          </ButtonLink>
        }
      />
    );
  return (
    <>
      <ModuleAccuracy stats={stats} />
      {weak.length > 0 && <WeakSkillList skills={weak} />}
      {few.length > 0 && (
        <>
          <h3 className="mt-4 mb-1 text-sm font-semibold">{pr.fewDataTitle}</h3>
          <WeakSkillList skills={few} />
        </>
      )}
    </>
  );
}

function SkillsTab() {
  const stats = useSkillStats();
  return (
    <>
      <section aria-labelledby="today-h" className="border-b border-border py-4">
        <h2 id="today-h" className="sr-only">
          {ru.home.todayTitle}
        </h2>
        <DailyGoal />
      </section>
      <section aria-labelledby="skills-h" className="py-4">
        <h2 id="skills-h" className="mb-2 text-lg font-semibold">
          {pr.skillsTitle}
        </h2>
        {stats.status === 'loading' && <LoadingRows />}
        {stats.status === 'error' && storageError(stats.reload)}
        {stats.status === 'ready' && stats.data.length === 0 && <EmptyState title={ru.empty.weakTitle} text={ru.progress.skillsEmpty} />}
        {stats.status === 'ready' && stats.data.length > 0 && (
          <>
          <ModuleAccuracy stats={stats.data} />
          <div className="lg:grid lg:grid-cols-3 lg:gap-x-8">
            {groupByModule(stats.data).map((g) => (
              <div key={g.module} data-testid="skill-group" data-module={g.module}>
                <h3 className="mt-2 mb-1 text-sm font-semibold">{pr.moduleNames[g.module]}</h3>
                <ul>
                  {g.skills.map((s) => {
                    const enough = s.recent.length >= MIN_SAMPLE && s.accuracy !== null;
                    return (
                      <li key={s.skill} className="flex min-h-14 flex-col justify-center gap-1 border-b border-border py-2">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm">{skillName(s.skill)}</span>
                          <span className="tnum text-xs text-text-2">
                            {enough
                              ? `${formatPercent(s.accuracy ?? 0)} · ${s.recent.length} ${plural(s.recent.length, ru.plural.attempts)}`
                              : `${pr.fewData(s.recent.length, MIN_SAMPLE)} · ${pr.prelim(s.correct, s.attempts)}`}
                          </span>
                        </div>
                        {enough && <ProgressBar value={Math.round((s.accuracy ?? 0) * 100)} max={100} label={skillName(s.skill)} size="sm" />}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          </>
        )}
      </section>
    </>
  );
}

function recentLine(a: Attempt): string {
  const t = a.task as { symbol?: string };
  const r = a.rMultiple === null ? ch.stats.noValue : formatR(a.rMultiple);
  return ch.stats.recentRow(formatDayShort(a.createdAt), t.symbol ?? '', sideOf(a) ?? '', r);
}

function ChallengeTab() {
  const attempts = useAttempts();
  if (attempts.status === 'loading') return <LoadingRows />;
  if (attempts.status === 'error') return storageError(attempts.reload);
  const list = attempts.data.filter((a) => a.module === 'challenge');
  const s = computeChallengeStats(list);
  const q = avgQuality(list);
  const none = ch.stats.noValue;
  return (
    <>
      <section data-testid="challenge-stats" className="py-4" aria-label={ru.progress.tabs.challenge}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label={ru.progress.challengeStats.winRate} value={s.winRate === null ? none : formatPercent(s.winRate)} />
          <Stat label={ru.progress.challengeStats.avgR} value={s.avgR === null ? none : formatR(s.avgR)} />
          <Stat label={ru.progress.challengeStats.waitCorrect} value={s.waitCorrect === null ? none : formatPercent(s.waitCorrect)} />
          <Stat label={pr.qualityAvg} value={q === null ? pr.qualityNone : ch.result.qualityOf(Math.round(q))} />
        </div>
        <p className="mt-1 text-xs text-text-2">
          {ch.stats.positions(s.positions)} · {ch.stats.waits(s.waits)}
        </p>
        <div className="mt-4 lg:max-w-xl">
          <RCurve curve={s.curve} />
        </div>
      </section>
      <section aria-labelledby="scenarios-h" className="border-t border-border py-4">
        <h2 id="scenarios-h" className="mb-2 text-lg font-semibold">
          {ru.progress.recentScenarios}
        </h2>
        {list.length === 0 ? (
          <EmptyState
            title={ru.empty.scenariosTitle}
            text={ru.empty.scenariosText}
            action={
              <ButtonLink href="/learn/challenge" variant="secondary" size="lg">
                {ru.empty.startScenario}
              </ButtonLink>
            }
          />
        ) : (
          <ul className="tnum text-sm text-text-2">
            {list.slice(0, 10).map((a) => (
              <li key={a.id} className="flex min-h-9 items-center border-b border-border">
                {recentLine(a)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Раздел «Прогресс» (LAYOUTS §6). Данные из Repository, обновляются при возврате на страницу. */
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
