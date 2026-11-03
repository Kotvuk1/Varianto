'use client';
// Общее тело заданий «поставь метки на графике»: MS «Разметка», PA «Найди модель», PA «Проведи уровень».
import { useMemo, useState, type ReactNode } from 'react';
import type { Candle, Mark } from '@tl/core';
import type { ToolId } from '@/chart/drawing/tools';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { InstructionBar } from '@/features/terminal/InstructionBar';
import { ss } from '@/i18n/ru/session';
import { Button } from '@/ui';
import { statesFromGrade } from './adapters';
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
  candles: Candle[];
}

export function MarkSession(p: MarkSessionProps) {
  const { envelope, flow, base } = p;
  const ci = useChartInteraction(p.initialTool, p.transform);
  const [showRef, setShowRef] = useState(true);
  const result = flow.phase === 'graded' ? flow.result : null;
  const busy = flow.phase === 'grading';
  const tf = envelope.payload.tf;
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);

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
      {...(result && showRef ? { readOnlyMarks: result.reference } : {})}
      {...(states ? { markStates: states } : {})}
      selectedId={ci.selectedId}
      onSelectedChange={ci.setSelectedId}
      onNotice={ci.setNotice}
      focus={ci.focus}
    />
  );

  const instruction = (
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
    />
  );

  return (
    <SessionLayout
      {...base}
      hint={<TaskHint text={p.hintText} {...(p.hintDetails ? { details: p.hintDetails } : {})} />}
      instruction={result ? undefined : instruction}
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
          <AsideSection>
            {p.extraControls}
            <div className="flex flex-col gap-2">
              <InputMessage text={ci.message} />
              {flow.gradeError && <InputMessage text={ss.errors.gradeFailed.text} />}
              <SubmitButton onClick={submit} busy={busy} />
            </div>
          </AsideSection>
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
                  onFocusMarks={(ids) => ci.focusOn(ids, [...ci.marks, ...result.reference])}
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
