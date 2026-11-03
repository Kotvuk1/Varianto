'use client';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ss } from '@/i18n/ru/session';
import { Button, ButtonLink } from '@/ui';
import { TaskApiError } from './types';

/** Загрузка: пустая область графика с тремя полосами скелетона и текстом (LAYOUTS §8.1). Без анимации блеска. */
export function ChartSkeleton({ label, backHref }: { label: string; backHref: string }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div role="status" aria-busy="true" data-testid="chart-loading" className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <div aria-hidden className="flex w-full max-w-xs flex-col gap-3">
        <div className="h-3 w-full rounded-sm bg-surface-2" />
        <div className="h-3 w-4/5 rounded-sm bg-surface-2" />
        <div className="h-3 w-3/5 rounded-sm bg-surface-2" />
      </div>
      <p className="text-sm text-text-2">{label}</p>
      {slow && (
        <>
          <p className="text-sm text-text-2">{ss.slowLoad}</p>
          <Link href={backHref} className="inline-flex h-11 items-center rounded-md border border-border-strong px-4 text-sm font-medium hover:bg-surface-2">
            {ss.back}
          </Link>
        </>
      )}
    </div>
  );
}

function copyFor(e: TaskApiError): { title: string; text: string } {
  switch (e.kind) {
    case 'no-situation':
      return ss.errors.noSituation;
    case 'rate-limited':
      return { title: ss.errors.rateLimited.title, text: ss.errors.rateLimited.text(e.retryAfterSec) };
    case 'archive':
      return ss.errors.archive;
    case 'network':
      return ss.errors.network;
    case 'expired':
      return ss.errors.expired;
    default:
      return ss.errors.generic;
  }
}

export interface TaskErrorProps {
  error: TaskApiError;
  /** Ошибка проверки, а не получения задания. */
  stage: 'next' | 'grade';
  onRetry: () => void;
  onAnother: () => void;
  backHref: string;
}

/** Блок ошибки на месте графика (не тост): иконка, заголовок, причина, действия, «Подробности». */
export function TaskError({ error, stage, onRetry, onAnother, backHref }: TaskErrorProps) {
  const c = stage === 'grade' && error.kind !== 'expired' && error.kind !== 'rate-limited' ? ss.errors.gradeFailed : copyFor(error);
  const canRetry = error.kind !== 'no-situation' && error.kind !== 'expired';
  const canAnother = stage === 'next' ? error.kind === 'no-situation' || error.kind === 'archive' : error.kind === 'expired';
  return (
    <div role="alert" data-testid="task-error" data-kind={error.kind} className="flex h-full w-full items-center justify-center bg-bg p-4">
      <div className="max-w-sm">
        <TriangleAlert size={24} strokeWidth={1.75} aria-hidden className="mb-2 text-text-2" />
        <h2 className="text-lg font-semibold">{c.title}</h2>
        <p className="mt-1 text-sm text-text-2">{c.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {canRetry && (
            <Button variant={canAnother ? 'secondary' : 'primary'} size="lg" onClick={onRetry}>
              {stage === 'grade' ? ss.retryCheck : ss.retry}
            </Button>
          )}
          {canAnother && (
            <Button variant="primary" size="lg" onClick={onAnother}>
              {ss.another}
            </Button>
          )}
          <ButtonLink href={backHref} variant="ghost" size="lg">
            {ss.back}
          </ButtonLink>
        </div>
        <details className="mt-3 text-sm text-text-2">
          <summary className="min-h-11 cursor-pointer leading-[44px]">{ss.details}</summary>
          <p className="tnum break-words">{ss.errors.code(error.status || 'network')}</p>
        </details>
      </div>
    </div>
  );
}
