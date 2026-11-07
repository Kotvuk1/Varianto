'use client';
// Общее тело заданий «поставь метки на графике»: MS «Разметка», PA «Найди модель», PA «Проведи уровень».
import { useMemo, useRef, useState, type ReactNode } from 'react';
import type { Candle, Mark } from '@tl/core';
import type { ToolId } from '@/chart/drawing/tools';
import type { TradingChartHandle } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { otherScope, useScopeHotkey } from '@/features/terminal/useScope';
import { InstructionBar } from '@/features/terminal/InstructionBar';
import { ss } from '@/i18n/ru/session';
import { Button } from '@/ui';
import { useIsDesktop } from './useIsDesktop';
import { statesFromGrade } from './adapters';
import { patternHighlights } from './highlights';
import { AsideSection, InputMessage, SubmitButton } from './AnswerParts';
import { ResultBody } from './ResultView';
import { SessionLayout, TaskHint } from './SessionLayout';
import type { SessionBase } from './TaskSession';
import { TaskToolbarBar, TaskToolRail } from './TaskToolbar';
import { TaskChart } from './TaskChart';
import type { FlowState } from './taskFlow';
import type { ToolGroupDef } from './toolGroups';
import type { Answer, TaskEnvelope } from './types';
import { useChartInteraction } from './useChartInteraction';

export interface MarkSessionProps {
  envelope: TaskEnvelope;
  flow: FlowState;
  base: SessionBase;
  groups: ToolGroupDef[];
  initialTool: ToolId;
  hintText: string;
  hintDetails?: ReactNode;
  /** Строка-инструкция активного инструмента, если стандартная (по ToolId) не подходит (PA «Найди модель»). */
  toolText?: string;
  /** Строит ответ из меток; строка - текст ошибки ввода. */
  buildAnswer: (marks: Mark[]) => Answer | string;
  /** Нормализация набора меток после каждого изменения (одиночный уровень, превращение в pattern). */
  transform?: (next: Mark[]) => Mark[];
  /** Дополнительные элементы мобильной панели над инструментами и правой панели. */
  extraControls?: ReactNode;
  asideIntro?: ReactNode;
  /** Модульная сводка внутри разбора. */
  resultExtra?: (flow: FlowState) => ReactNode;
  bars: number;
  /** Окно оценки: вне него график затемнён. */
  highlightRange?: { fromTime: number; toTime: number };
  candles: Candle[];
  /** Показывать выбор слоя Внешняя/Внутренняя для BOS/CHoCH (MS: payload.scoped). */
  allowScope?: boolean;
}

export function MarkSession(p: MarkSessionProps) {
  const { envelope, flow, base } = p;
  const desktop = useIsDesktop();
  const ci = useChartInteraction(p.initialTool, p.transform);
  const [showRef, setShowRef] = useState(true);
  const chartRef = useRef<TradingChartHandle>(null);
  const result = flow.phase === 'graded' ? flow.result : null;
  const busy = flow.phase === 'grading';
  const tf = envelope.payload.tf;
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);

  const allowScope = p.allowScope === true;
  useScopeHotkey(allowScope && !result, () => ci.setScope(otherScope(ci.scope)));

  const submit = () => {
    if (busy || result) return;
    const a = p.buildAnswer(ci.marks);
    if (typeof a === 'string') {
      ci.setMessage(a);
      return;
    }
    ci.setMessage(null);
    void flow.submit(a);
  };

  const states = useMemo(() => (result ? statesFromGrade(result) : undefined), [result]);
  const message = ci.message ?? (flow.gradeError ? ss.errors.gradeFailed.text : null);
  const chart = (
    <TaskChart
      symbol={envelope.symbol}
      tf={tf}
      candles={p.candles}
      marks={ci.marks}
      tool={result ? 'select' : ci.tool}
      onMarksChange={result ? () => undefined : ci.setMarks}
      bars={p.bars}
      {...(p.highlightRange ? { highlightRange: p.highlightRange } : {})}
      {...(result && showRef ? { readOnlyMarks: result.reference } : {})}
      {...(states ? { markStates: states } : {})}
      selectedId={ci.selectedId}
      onSelectedChange={ci.setSelectedId}
      onNotice={ci.setNotice}
      focus={ci.focus}
      handleRef={chartRef}
      {...(result && showRef ? { highlightCandles: patternHighlights(result.reference, tf, 'ref') } : {})}
      scope={allowScope ? ci.scope : null}
    />
  );

  const quiet = !ci.selected && !ci.notice.code && !message;
  // «Выбор» без выделения и сообщений: подсказка дублирует очевидное и отнимает высоту графика (F-08).
  const showInstruction = !result && !(quiet && ci.tool === 'select');
  const ownText = p.toolText !== undefined && quiet && ci.tool !== 'select' && ci.tool !== 'eraser';
  const instruction = ownText ? (
    <div data-testid="instruction-bar" className="flex min-h-11 min-w-0 flex-1 items-center">
      <p data-testid="instruction-text" className="min-w-0 flex-1 py-2 text-sm leading-5 text-text-2">
        {p.toolText}
      </p>
    </div>
  ) : (
    <InstructionBar
      tool={result ? 'select' : ci.tool}
      step={ci.notice.step}
      notice={ci.notice.code}
      selected={result ? null : ci.selected}
      fmt={fmt}
      onCancel={() => ci.setTool('select')}
      onDelete={() => ci.selected && ci.deleteMark(ci.selected.id)}
      onDeselect={() => ci.setSelectedId(null)}
      message={message}
      allowScope={allowScope}
      scope={ci.scope}
      onScope={ci.setScope}
    />
  );

  return (
    <SessionLayout
      {...base}
      hint={desktop ? undefined : <TaskHint text={p.hintText} {...(p.hintDetails ? { details: p.hintDetails } : {})} />}
      instruction={showInstruction ? instruction : undefined}
      chart={chart}
      rail={<TaskToolRail groups={p.groups} tool={ci.tool} onTool={ci.setTool} />}
      bottom={
        <div>
          {p.extraControls}
          <TaskToolbarBar groups={p.groups} tool={ci.tool} onTool={ci.setTool} onCheck={submit} checking={busy} />
        </div>
      }
      aside={
        <>
          {p.asideIntro}
          <AsideSection title={ss.aside.task}>
            <p data-testid="task-text" className="text-sm leading-5">
              {p.hintText}
            </p>
          </AsideSection>
          <AsideSection>
            {p.extraControls}
            <div className="flex flex-col gap-2">
              <InputMessage text={ci.message} />
              {flow.gradeError && <InputMessage text={ss.errors.gradeFailed.text} />}
              <SubmitButton onClick={submit} busy={busy} />
            </div>
          </AsideSection>
          <AsideSection title={ss.aside.tools}>
            <p className="text-sm text-text-2">{ss.aside.toolsHelp}</p>
          </AsideSection>
          {p.hintDetails && (
            <AsideSection title={ss.aside.criteria}>
              <div data-testid="task-criteria" className="space-y-2 text-sm text-text-2">
                {p.hintDetails}
              </div>
            </AsideSection>
          )}
        </>
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
                    if (!ids.some((id) => chartRef.current?.focusMark(id))) ci.focusOn(ids, [...ci.marks, ...result.reference]);
                  }}
                  saveFailed={flow.saveFailed}
                  sheetControls={sheetControls}
                  extra={p.resultExtra?.(flow)}
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
