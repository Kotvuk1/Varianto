'use client';
// Общий каркас сессий ступеней 1-4 и комбо: график (с проигрыванием будущего для relative-шкалы), инструменты или форма ответа,
// «Проверить», разбор после проигрывания. Основан на каркасе Fibonacci; тела заданий передают только отличия.
import { useMemo, useRef, useState, type ReactNode } from 'react';
import type { Mark } from '@tl/core';
import type { ToolId } from '@/chart/drawing/tools';
import type { ReplayMarker } from '@/chart/replay/markers';
import type { CandleHighlight, TimeWindow, TradingChartHandle } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { InstructionBar } from '@/features/terminal/InstructionBar';
import { Annotated } from '@/features/guide';
import { cuSession } from '@/i18n/ru/curriculum';
import { ss } from '@/i18n/ru/session';
import { Button } from '@/ui';
import { ReplayBar } from '../challenge/panels';
import { RelativeAxis } from '../challenge/RelativeAxis';
import { formatScenarioDate } from '../challenge/reveal';
import { useReplay } from '../fibonacci/useReplay';
import { revealFeedback } from '../fibonacci/reveal';
import { AsideSection, InputMessage, SubmitButton } from '../session/AnswerParts';
import { ResultBody } from '../session/ResultView';
import { SessionLayout, TaskHint } from '../session/SessionLayout';
import { TaskChart } from '../session/TaskChart';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { TaskToolbarBar, TaskToolRail } from '../session/TaskToolbar';
import type { ToolGroupDef } from '../session/toolGroups';
import type { Answer, GradeResultDto, TaskEnvelope } from '../session/types';
import type { useChartInteraction } from '../session/useChartInteraction';
import { useIsDesktop } from '../session/useIsDesktop';

export interface ResultVisuals {
  replayMarkers?: ReplayMarker[];
  highlights?: CandleHighlight[];
  guideBand?: { from: number; to: number } | null;
}

export interface CurShellProps {
  envelope: TaskEnvelope;
  flow: FlowState;
  base: SessionBase;
  ci: ReturnType<typeof useChartInteraction>;
  /** Инструменты рейки; без них - задание с вариантами ответа. */
  groups?: ToolGroupDef[];
  hintText: string;
  details?: ReactNode;
  bars: number;
  highlightRange?: { fromTime: number; toTime: number };
  /** Метки, которые пользователь видит, но не меняет (подсказки, заданная зона, варианты зон); до разбора. */
  preMarks?: Mark[];
  /** Метки на графике вместо ci.marks (позиция стоп/тейк добавляется к меткам пользователя). */
  chartMarks?: Mark[];
  onChartMarks?: (m: Mark[]) => void;
  selectedId?: string | null;
  form?: ReactNode;
  buildAnswer: () => Answer | string;
  submitLabel?: string;
  onLimitChange?: (price: number | null) => void;
  slHint?: { structure: number; atr: number } | null;
  visuals?: (result: GradeResultDto) => ResultVisuals;
  resultExtra?: (result: GradeResultDto, fmt: (p: number) => string) => ReactNode;
}

export function CurShell(p: CurShellProps) {
  const { envelope, flow, base, ci } = p;
  const tf = envelope.payload.tf;
  const relative = envelope.timeline?.mode === 'relative';
  const desktop = useIsDesktop();
  const [showRef, setShowRef] = useState(true);
  const [win, setWin] = useState<TimeWindow | null>(null);
  const chartRef = useRef<TradingChartHandle>(null);
  const result = flow.phase === 'graded' ? flow.result : null;
  const busy = flow.phase === 'grading';
  const replayCandles = useMemo(() => result?.replay?.candles ?? [], [result]);
  const replay = useReplay(replayCandles.length, replayCandles.length > 0);
  const replaying = result !== null && !replay.done;
  const final = result !== null && replay.done;
  const locked = busy || result !== null;
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  const candles = useMemo(() => {
    const b = envelope.series[tf] ?? [];
    return replay.played > 0 ? [...b, ...replayCandles.slice(0, replay.played)] : b;
  }, [envelope.series, tf, replayCandles, replay.played]);
  const vis = useMemo(() => (final && result && p.visuals ? p.visuals(result) : {}), [final, result, p]);

  const submit = () => {
    if (locked) return;
    const a = p.buildAnswer();
    if (typeof a === 'string') {
      ci.setMessage(a);
      return;
    }
    ci.setMessage(null);
    void flow.submit(a);
  };

  const message = ci.message ?? (flow.gradeError ? ss.errors.gradeFailed.text : null);
  const status = (
    <div className="flex flex-col gap-1 px-3 pb-2 lg:px-0">
      <InputMessage text={message} />
    </div>
  );

  const readOnly = final && showRef && result ? result.reference : p.preMarks;
  const chart = (
    <>
      <TaskChart
        symbol={envelope.symbol}
        tf={tf}
        candles={candles}
        marks={p.chartMarks ?? ci.marks}
        tool={locked ? 'select' : (ci.tool as ToolId)}
        onMarksChange={locked ? () => undefined : (p.onChartMarks ?? ci.setMarks)}
        bars={p.bars}
        {...(p.highlightRange ? { highlightRange: p.highlightRange } : {})}
        {...(readOnly ? { readOnlyMarks: readOnly } : {})}
        selectedId={p.selectedId !== undefined ? p.selectedId : ci.selectedId}
        onSelectedChange={ci.setSelectedId}
        onNotice={ci.setNotice}
        focus={ci.focus}
        handleRef={chartRef}
        {...(p.onLimitChange ? { onLimitChange: p.onLimitChange } : {})}
        {...(p.slHint && !result ? { slHint: p.slHint } : {})}
        {...(vis.guideBand ? { guideBand: vis.guideBand } : {})}
        {...(vis.replayMarkers ? { replayMarkers: vis.replayMarkers } : {})}
        {...(vis.highlights ? { highlightCandles: vis.highlights } : {})}
        {...(relative ? { onVisibleRangeChange: setWin } : {})}
      />
      {relative && <RelativeAxis win={win} decisionTime={envelope.decisionTime} />}
    </>
  );

  const replayPanel = (
    <div data-testid="cur-replay" className="border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:border-t-0">
      <p className="px-3 pt-2 text-sm font-medium">{cuSession.replay.title}</p>
      <ReplayBar played={replay.played} limit={replayCandles.length} paused={replay.paused} speed={replay.speed} onPause={replay.setPaused} onSpeed={replay.setSpeed} onSkip={replay.skip} />
    </div>
  );

  const hasTools = !!p.groups && p.groups.length > 0;
  const quiet = !ci.selected && !ci.notice.code && !message;
  const instruction =
    hasTools && !result && !(quiet && ci.tool === 'select') ? (
      <InstructionBar
        tool={ci.tool}
        step={ci.notice.step}
        notice={ci.notice.code}
        selected={ci.selected}
        fmt={fmt}
        onCancel={() => ci.setTool('select')}
        onDelete={() => ci.selected && ci.deleteMark(ci.selected.id)}
        onDeselect={() => ci.setSelectedId(null)}
        message={message}
      />
    ) : undefined;

  const mobileBottom = replaying ? (
    replayPanel
  ) : hasTools ? (
    <div>
      {p.form}
      {status}
      <TaskToolbarBar groups={p.groups!} tool={ci.tool} onTool={ci.setTool} onCheck={submit} checking={busy} />
    </div>
  ) : (
    <div data-testid="answer-panel" className="max-h-[46dvh] overflow-y-auto border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]">
      {p.form}
      {status}
      <div className="px-3 pb-3">
        <SubmitButton onClick={submit} busy={busy} label={p.submitLabel ?? ss.checkAnswer} className="w-full" />
      </div>
    </div>
  );

  const aside = replaying ? (
    replayPanel
  ) : (
    <>
      <AsideSection title={ss.aside.task}>
        <p data-testid="task-text" className="text-sm leading-5">
          <Annotated text={p.hintText} />
        </p>
      </AsideSection>
      <AsideSection>
        {p.form}
        <div className="mt-3 flex flex-col gap-2">
          <InputMessage text={message} />
          <SubmitButton onClick={submit} busy={busy} label={hasTools ? ss.check : (p.submitLabel ?? ss.checkAnswer)} />
        </div>
      </AsideSection>
      {hasTools && (
        <AsideSection title={ss.aside.tools}>
          <p className="text-sm text-text-2">{ss.aside.toolsHelp}</p>
        </AsideSection>
      )}
      {p.details && (
        <AsideSection title={ss.aside.criteria}>
          <div data-testid="task-criteria" className="space-y-2 text-sm text-text-2">
            {p.details}
          </div>
        </AsideSection>
      )}
    </>
  );

  const revealed = result && final ? { ...result, feedback: revealFeedback(result.feedback, result.task.reveal?.shiftMs ?? 0) } : null;
  const extra = revealed ? (
    <div data-testid="cur-summary" className="mt-1 space-y-0.5 text-sm text-text-2">
      {relative && revealed.task.reveal && <p data-testid="cur-scenario-date">{cuSession.scenarioDate(formatScenarioDate(revealed.task.reveal.decisionTime))}</p>}
      {p.resultExtra?.(revealed, fmt)}
    </div>
  ) : null;

  return (
    <SessionLayout
      {...base}
      hint={desktop ? undefined : <TaskHint text={p.hintText} wrap {...(p.details ? { details: p.details } : {})} />}
      instruction={instruction}
      chart={chart}
      rail={hasTools ? <TaskToolRail groups={p.groups!} tool={ci.tool} onTool={ci.setTool} /> : undefined}
      bottom={mobileBottom}
      aside={aside}
      result={
        revealed
          ? {
              body: (sheetControls) => (
                <ResultBody
                  result={revealed}
                  fmtPrice={fmt}
                  showRef={showRef}
                  onToggleRef={() => setShowRef((v) => !v)}
                  onFocusMarks={(ids) => {
                    if (!ids.some((id) => chartRef.current?.focusMark(id))) ci.focusOn(ids, [...ci.marks, ...revealed.reference]);
                  }}
                  saveFailed={flow.saveFailed}
                  sheetControls={sheetControls}
                  extra={extra}
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
