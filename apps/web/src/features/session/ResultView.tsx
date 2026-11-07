'use client';
import { Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { FeedbackView, GradeLegendToggle } from '@/features/feedback';
import { ss } from '@/i18n/ru/session';
import { Button } from '@/ui';
import { countsFromGrade } from './adapters';
import type { GradeResultDto } from './types';

export interface ResultBodyProps {
  result: GradeResultDto;
  fmtPrice: (p: number) => string;
  showRef: boolean;
  onToggleRef: () => void;
  onFocusMarks: (ids: string[]) => void;
  saveFailed: boolean;
  /** Модульная сводка (уровень, контекст, вопрос). */
  extra?: ReactNode;
  /** Кнопки управления высотой шторки (мобильный). */
  sheetControls?: ReactNode;
}

/** Содержимое разбора: переключатель эталона, Итог первым, затем части 2-6, легенда внизу. */
export function ResultBody({ result, fmtPrice, showRef, onToggleRef, onFocusMarks, saveFailed, extra, sheetControls }: ResultBodyProps) {
  const counts = countsFromGrade(result);
  const hasRef = result.reference.length > 0;
  return (
    <div data-testid="result" data-verdict={result.verdict}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {hasRef && (
          <Button
            size="md"
            variant="secondary"
            icon={showRef ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
            aria-pressed={showRef}
            data-testid="toggle-ref"
            onClick={onToggleRef}
          >
            {showRef ? ss.hideRef : ss.showRef}
          </Button>
        )}
        {sheetControls}
      </div>
      <FeedbackView
        feedback={result.feedback}
        aiModule={result.module}
        fmtPrice={fmtPrice}
        onFocusMarks={onFocusMarks}
        verdictExtra={
          <>
            {counts && (
              <p data-testid="result-summary" className="tnum mt-1 text-sm text-text-2">
                {ss.summary(counts.match, counts.missed, counts.extra)}
              </p>
            )}
            {extra}
          </>
        }
        footer={counts ? <GradeLegendToggle className="pt-1" /> : null}
      />
      {saveFailed && (
        <p role="status" data-testid="save-failed" className="mt-2 text-sm text-text-2">
          {ss.saveFailed}
        </p>
      )}
    </div>
  );
}
