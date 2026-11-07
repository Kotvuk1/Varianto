'use client';
// /learn/challenge: выбор сложности и ТФ старта, статистика из LocalRepository.
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { Difficulty, TaskTimeframe } from '@tl/core';
import { ch } from '@/i18n/ru/challenge';
import { formatDayShort, formatR, formatPercent } from '@/i18n/format';
import { useRepository, type Attempt } from '@/storage';
import { ButtonLink, Segmented, Stat, cn } from '@/ui';
import { EmptyState, ErrorState, LoadingRows } from '../common/StateBlock';
import { useAsync } from '../common/useAsync';
import { RCurve } from './RCurve';
import { TF_LABEL } from './tf';
import { computeChallengeStats, sideOf } from './stats';

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];
type StartTf = TaskTimeframe | 'auto';
const TF_OPTIONS = [
  { value: 'auto' as const, label: ch.startTfAuto },
  ...(['15m', '1h', '4h', '1d'] as const).map((v) => ({ value: v, label: TF_LABEL[v] })),
];

function recentLine(a: Attempt): string {
  const t = a.task as { symbol?: string };
  const side = sideOf(a) ?? '';
  const r = a.rMultiple === null ? ch.stats.noValue : formatR(a.rMultiple);
  return ch.stats.recentRow(formatDayShort(a.createdAt), t.symbol ?? '', side, r);
}

function Stats() {
  const repo = useRepository();
  const load = useCallback(() => repo.listAttempts({ module: 'challenge', order: 'desc' }), [repo]);
  const state = useAsync(load);
  if (state.status === 'loading') return <LoadingRows rows={2} />;
  if (state.status === 'error')
    return <ErrorState title={ch.stats.errorTitle} text={ch.stats.errorText} onRetry={state.reload} />;
  const attempts = state.data;
  if (attempts.length === 0) return <EmptyState title={ch.stats.empty} text={ch.stats.emptyText} />;
  const s = computeChallengeStats(attempts);
  return (
    <div data-testid="challenge-stats">
      <div className="grid grid-cols-3 gap-4">
        <Stat label={ch.stats.winRate} value={s.winRate === null ? ch.stats.noValue : formatPercent(s.winRate)} />
        <Stat label={ch.stats.avgR} value={s.avgR === null ? ch.stats.noValue : formatR(s.avgR)} />
        <Stat label={ch.stats.waitCorrect} value={s.waitCorrect === null ? ch.stats.noValue : formatPercent(s.waitCorrect)} />
      </div>
      <p className="mt-1 text-xs text-text-2">
        {ch.stats.positions(s.positions)} · {ch.stats.waits(s.waits)}
      </p>
      <div className="mt-4">
        <RCurve curve={s.curve} />
      </div>
      <h3 className="mt-4 mb-1 text-sm font-semibold">{ch.stats.recent}</h3>
      <ul className="tnum text-sm text-text-2">
        {attempts.slice(0, 10).map((a) => (
          <li key={a.id} className="flex min-h-9 items-center border-b border-border">
            {recentLine(a)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChallengeHome() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [tf, setTf] = useState<StartTf>('auto');
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pb-6 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:pt-4">
      <div>
        <div className="flex items-center gap-1 py-3">
          <Link href="/" aria-label={ch.back} className="flex size-11 items-center justify-center rounded-md hover:bg-surface-2">
            <ChevronLeft size={24} strokeWidth={1.75} aria-hidden />
          </Link>
          <h1 className="text-xl font-semibold">{ch.title}</h1>
        </div>
        <section aria-labelledby="diff-h">
          <h2 id="diff-h" className="mb-2 text-lg font-semibold">
            {ch.difficulty}
          </h2>
          <div role="radiogroup" aria-labelledby="diff-h" className="border-t border-border">
            {DIFFS.map((d) => {
              const on = d === difficulty;
              return (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  data-testid={`difficulty-${d}`}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'flex min-h-16 w-full cursor-pointer items-center gap-3 border-b border-border px-1 text-left hover:bg-surface-1',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border-strong', on && 'border-accent')}
                  >
                    {on && <span className="size-2.5 rounded-full bg-accent" />}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{ch.difficulties[d].label}</span>
                    <span className="text-xs text-text-2">{ch.difficulties[d].hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="mt-4" aria-labelledby="tf-h">
          <h2 id="tf-h" className="mb-2 text-sm font-semibold">
            {ch.startTf}
          </h2>
          <Segmented label={ch.startTf} options={TF_OPTIONS} value={tf} onChange={setTf} />
        </section>
        <div className="mt-6">
          {online ? (
            <ButtonLink
              href={`/learn/challenge/session?difficulty=${difficulty}&tf=${tf}`}
              variant="primary"
              size="lg"
              className="w-full"
              data-testid="challenge-start"
            >
              {ch.start}
            </ButtonLink>
          ) : (
            <>
              <button type="button" aria-disabled className="h-12 w-full rounded-md border border-border text-sm font-medium text-text-3">
                {ch.start}
              </button>
              <p className="mt-2 text-sm text-text-2">{ch.offlineHint}</p>
            </>
          )}
        </div>
      </div>
      <section aria-labelledby="stats-h" className="mt-6 border-t border-border pt-4 lg:mt-0 lg:border-t-0 lg:pt-14">
        <h2 id="stats-h" className="mb-3 text-lg font-semibold">
          {ch.stats.title}
        </h2>
        <Stats />
      </section>
    </div>
  );
}
