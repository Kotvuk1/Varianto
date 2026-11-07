'use client';

import type { Feedback } from '@tl/core';
import { useState } from 'react';
import { FeedbackView, renderBlock } from '@/features/feedback';
import { formatDayShort, formatPrice, formatTime, plural } from '@/i18n/format';
import { ru } from '@/i18n/ru';
import { ERROR_NAMES_RU, pr } from '@/i18n/ru/progress';
import type { Attempt } from '@/storage';
import { BottomSheet } from '@/ui';
import { EmptyState } from '../common/StateBlock';
import { buildErrorLog, type ErrorExample } from './progressLogic';

const fmtPrice = (p: number) => formatPrice(p, Number.isInteger(p) ? 0 : p >= 100 ? 1 : 2);

export const errorName = (code: string): string => (ERROR_NAMES_RU as Record<string, string>)[code] ?? pr.unknownError;

const textOf = (e: ErrorExample) => renderBlock(e.templateKey, e.params, fmtPrice);

/** Журнал ошибок: коды с названиями из шаблонов ядра, число случаев, примеры; клик открывает сохранённый разбор. */
export function ErrorLog({ attempts }: { attempts: readonly Attempt[] }) {
  const groups = buildErrorLog(attempts);
  const [open, setOpen] = useState<string | null>(null);
  const [review, setReview] = useState<Attempt | null>(null);

  return (
    <section aria-labelledby="errors-h" className="border-t border-border py-4 lg:border-t-0 lg:pt-4">
      <h2 id="errors-h" className="text-lg font-semibold">
        {ru.progress.errorLog}
      </h2>
      {groups.length === 0 ? (
        <EmptyState title={ru.empty.errorsTitle} text={ru.empty.errorsText} />
      ) : (
        <>
          <p className="mb-2 text-sm text-text-2">{pr.errorLogSub}</p>
          <ul data-testid="error-log">
            {groups.map((g) => {
              const expanded = open === g.code;
              return (
                <li key={g.code} data-testid="error-group" data-code={g.code} className="border-b border-border">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : g.code)}
                    className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 py-2 text-left"
                  >
                    <span className="text-sm font-medium">{errorName(g.code)}</span>
                    <span className="tnum shrink-0 text-xs text-text-2">{pr.errorCount(g.count, plural(g.count, pr.caseForms))}</span>
                  </button>
                  {expanded && (
                    <ul aria-label={pr.examples} className="pb-2">
                      {g.examples.map((e) => (
                        <li key={e.attempt.id}>
                          <button
                            type="button"
                            data-testid="error-example"
                            aria-label={`${pr.openReview}: ${textOf(e)}`}
                            onClick={() => setReview(e.attempt)}
                            className="flex min-h-11 w-full cursor-pointer items-start gap-3 py-1 text-left text-sm text-text-2"
                          >
                            <span className="tnum shrink-0">
                              {formatDayShort(e.attempt.createdAt)} {formatTime(e.attempt.createdAt)}
                            </span>
                            <span className="min-w-0">{textOf(e)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
      <BottomSheet open={review !== null} onClose={() => setReview(null)} title={pr.reviewTitle} height="full">
        {review && <Review attempt={review} />}
      </BottomSheet>
    </section>
  );
}

function Review({ attempt }: { attempt: Attempt }) {
  const feedback = attempt.grade.feedback as Feedback | undefined;
  if (!feedback) return <p className="text-sm text-text-2">{pr.reviewMissing}</p>;
  return (
    <div data-testid="error-review">
      <FeedbackView feedback={feedback} aiModule={attempt.module} />
    </div>
  );
}
