'use client';
import { Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { FeedbackView, GradeLegend } from '@/features/feedback';
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

/** Содержимое разбора: переключатель эталона, итоговая строка, легенда, 6 частей FeedbackView. */
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
      {counts && (
        <p data-testid="result-summary" className="tnum mb-1 text-sm font-medium">
          {ss.summary(counts.match, counts.missed, counts.extra)}
        </p>
      )}
      {counts && <GradeLegend className="mb-2" />}
      {extra}
      <FeedbackView feedback={result.feedback} fmtPrice={fmtPrice} onFocusMarks={onFocusMarks} />
      {saveFailed && (
        <p role="status" data-testid="save-failed" className="mt-2 text-sm text-text-2">
          {ss.saveFailed}
        </p>
      )}
    </div>
  );
}
