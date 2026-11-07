'use client';
// Тело заданий с вариантами ответа: MS «Вопрос», PA «Контекст». График только для чтения (подсветка места), форма ответа снизу / справа.
import { useMemo, useRef, useState, type ReactNode } from 'react';
import type { Candle, Mark, TaskTimeframe } from '@tl/core';
import type { TradingChartHandle } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { ss } from '@/i18n/ru/session';
import { Button } from '@/ui';
import { AsideSection, InputMessage, SubmitButton } from './AnswerParts';
import { ResultBody } from './ResultView';
import { SessionLayout, TaskHint } from './SessionLayout';
import type { SessionBase } from './TaskSession';
import { patternHighlights } from './highlights';
import { TaskChart } from './TaskChart';
import type { FlowState } from './taskFlow';
import type { Answer, TaskEnvelope } from './types';
import { useChartInteraction } from './useChartInteraction';

export interface AnswerSessionProps {
  envelope: TaskEnvelope;
  flow: FlowState;
  base: SessionBase;
  /** Ряд и ТФ графика (в «Контексте» переключаются на старший ТФ). */
  chartTf: TaskTimeframe;
  candles: Candle[];
  bars: number;
  hintText: string;
  hintDetails?: ReactNode;
  /** Метки-подсветка места на графике (до проверки). */
  highlight?: Mark[];
  /** Модель PA: колонки за свечами до проверки (tone focus) и после (tone ref). */
  patternLabel?: string;
  /** Строка над графиком: переключатель ТФ. */
  chartControls?: ReactNode;
  /** Форма ответа (десктоп - правая панель; мобильный - нижняя панель, если нет mobileBottom). */
  form: ReactNode;
  /** Своя мобильная панель (пошаговая форма): получает submit и статус. */
  mobileBottom?: (ctx: { submit: () => void; busy: boolean; status: ReactNode }) => ReactNode;
  /** Ответ или текст ошибки ввода. */
  buildAnswer: () => Answer | string;
  submitLabel?: string;
  resultExtra?: ReactNode;
}

export function AnswerSession(p: AnswerSessionProps) {
  const { envelope, flow, base } = p;
  const ci = useChartInteraction('select');
  const [showRef, setShowRef] = useState(true);
  const result = flow.phase === 'graded' ? flow.result : null;
  const busy = flow.phase === 'grading';
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  const chartRef = useRef<TradingChartHandle>(null);
  const noMarks = useMemo<Mark[]>(() => [], []);

  const submit = () => {
    if (busy || result) return;
    const a = p.buildAnswer();
    if (typeof a === 'string') {
      ci.setMessage(a);
      return;
    }
    ci.setMessage(null);
    void flow.submit(a);
  };

  const readOnly = result ? (showRef ? result.reference : undefined) : p.highlight;
  const chart = (
    <TaskChart
      symbol={envelope.symbol}
      tf={p.chartTf}
      candles={p.candles}
      marks={noMarks}
      tool="select"
      onMarksChange={() => undefined}
      bars={p.bars}
      {...(readOnly ? { readOnlyMarks: readOnly } : {})}
      focus={ci.focus}
      handleRef={chartRef}
      {...(p.highlight && p.highlight.some((m) => m.kind === 'pattern') ? { highlightCandles: patternHighlights(p.highlight, p.chartTf, result ? 'ref' : 'focus') } : {})}
    />
  );

  const status = (
    <div className="flex flex-col gap-1 px-3 pb-2">
      <InputMessage text={ci.message} />
      {flow.gradeError && <InputMessage text={ss.errors.gradeFailed.text} />}
    </div>
  );

  return (
    <SessionLayout
      {...base}
      hint={<TaskHint text={p.hintText} wrap {...(p.hintDetails ? { details: p.hintDetails } : {})} />}
      instruction={p.chartControls}
      chart={chart}
      bottom={
        p.mobileBottom ? (
          p.mobileBottom({ submit, busy, status })
        ) : (
        <div data-testid="answer-panel" className="max-h-[46dvh] overflow-y-auto border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]">
          {p.form}
          {status}
          <div className="px-3 pb-3">
            <SubmitButton onClick={submit} busy={busy} label={p.submitLabel ?? ss.checkAnswer} className="w-full" />
          </div>
        </div>
        )
      }
      aside={
        <AsideSection>
          {p.form}
          <div className="mt-3 flex flex-col gap-2">
            <InputMessage text={ci.message} />
            {flow.gradeError && <InputMessage text={ss.errors.gradeFailed.text} />}
            <SubmitButton onClick={submit} busy={busy} label={p.submitLabel ?? ss.checkAnswer} />
          </div>
        </AsideSection>
      }
      result={
        result
          ? {
              body: (sheetControls) => (
                <ResultBody
                  result={result}
                  fmtPrice={fmt}
                  showRef={showRef}
                  onToggleRef={() => setShowRef((v) => !v)}
                  onFocusMarks={(ids) => {
                    if (!ids.some((id) => chartRef.current?.focusMark(id))) ci.focusOn(ids, result.reference);
                  }}
                  saveFailed={flow.saveFailed}
                  sheetControls={sheetControls}
                  extra={p.resultExtra}
                />
              ),
              footer: (
                <Button variant="primary" size="lg" className="flex-1" onClick={() => void flow.load()} data-testid="next-task">
                  {ss.next}
                </Button>
              ),
            }
          : null
      }
    />
  );
}
