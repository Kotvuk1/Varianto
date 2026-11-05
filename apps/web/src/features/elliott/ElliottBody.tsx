'use client';
// Тело заданий Elliott: разметка волн на графике, панель «Сценарий», проверка, проигрывание будущего (дата скрыта), итог.
import { ChevronUp } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { checkEwMarks, TIMEFRAME_MS, type ElliottTask, type EwPrimaryScenario, type EwScenarioId, type Mark } from '@tl/core';
import type { CandleHighlight, TimeWindow, TradingChartHandle } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { Annotated } from '@/features/guide';
import { InstructionBar } from '@/features/terminal/InstructionBar';
import { ewx } from '@/i18n/ru/elliott';
import { ss } from '@/i18n/ru/session';
import { BottomSheet, Button } from '@/ui';
import { ReplayBar } from '../challenge/panels';
import { RelativeAxis } from '../challenge/RelativeAxis';
import { revealErrors, revealFeedback } from '../fibonacci/reveal';
import { useReplay } from '../fibonacci/useReplay';
import { AsideSection, InputMessage, SubmitButton } from '../session/AnswerParts';
import { ResultBody } from '../session/ResultView';
import { SessionLayout, TaskHint } from '../session/SessionLayout';
import { TaskChart } from '../session/TaskChart';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { TaskToolbarBar, TaskToolRail } from '../session/TaskToolbar';
import { msToolGroups } from '../session/toolGroups';
import type { GradeResultDto, TaskEnvelope } from '../session/types';
import { useChartInteraction } from '../session/useChartInteraction';
import { useIsDesktop } from '../session/useIsDesktop';
import { EW_KIND, impliedFromMarks, invalidationMarkAt, invalidationOf, keepEwMarks, liveChecks, liveHints, reconcileAlternative, requiredPoints, userEwMarks, ewAnswer, type LiveHint } from './adapters';
import { LiveRules } from './LiveRules';
import { ResultExtra } from './ResultExtra';
import { ScenarioPanel } from './ScenarioPanel';

const LEAD_IN = 12;
const HINT_TEXT = { 'ew-impulse': ewx.hint.easy, 'ew-impulse-correction': ewx.hint.medium, 'ew-scenario': ewx.hint.hard } as const;

function EwProgress({ marks, kind }: { marks: readonly Mark[]; kind: ElliottTask['kind'] }) {
  const need = requiredPoints(kind);
  const { impulse, correction } = userEwMarks(marks);
  const n = impulse?.anchors.length ?? 0;
  if (!need) return null;
  return (
    <p data-testid="ew-progress" className="tnum text-xs text-text-2">
      {ewx.progress(n, need.impulse)}
      {need.correction > 0 && ` · ${ewx.progressCorr(correction?.anchors.length ?? 0, need.correction)}`}
    </p>
  );
}

export function ElliottBody({ envelope, flow, base }: { envelope: TaskEnvelope<ElliottTask>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const kind = p.kind;
  const desktop = useIsDesktop();
  const ci = useChartInteraction('ew-impulse', keepEwMarks);
  const [showRef, setShowRef] = useState(true);
  const [win, setWin] = useState<TimeWindow | null>(null);
  const [primary, setPrimary] = useState<EwPrimaryScenario | null>(null);
  const [alternative, setAlternative] = useState<EwScenarioId | null>(null);
  const [sheet, setSheet] = useState(false);
  const chartRef = useRef<TradingChartHandle>(null);

  const result: GradeResultDto | null = flow.phase === 'graded' ? flow.result : null;
  const busy = flow.phase === 'grading';
  const replayCandles = useMemo(() => result?.replay?.candles ?? [], [result]);
  const replay = useReplay(replayCandles.length, replayCandles.length > 0);
  const replaying = result !== null && !replay.done;
  const final = result !== null && replay.done;
  const locked = busy || result !== null;

  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  const visible = useMemo(() => envelope.series[p.tf] ?? [], [envelope.series, p.tf]);
  const candles = useMemo(() => (replay.played > 0 ? [...visible, ...replayCandles.slice(0, replay.played)] : visible), [visible, replayCandles, replay.played]);
  const windowBars = Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1;
  // hline из payload.tools - инструмент «Инвалидация» (hline с meta.role = ew-invalidation)
  const groups = useMemo(() => msToolGroups(p.tools.map((t) => (t === 'hline' ? 'ew-invalidation' : t))), [p.tools]);

  const invalidation = invalidationOf(ci.marks);
  const implied = impliedFromMarks(ci.marks);
  const liveOn = p.hints?.liveRules === true && !locked;
  const hints = useMemo<LiveHint[]>(() => {
    if (!liveOn) return [];
    const { results } = checkEwMarks(visible, p.tf, ci.marks);
    return liveHints(liveChecks(results), primary !== null && implied !== null && primary !== implied);
  }, [liveOn, visible, p.tf, ci.marks, primary, implied]);
  const hasCount = userEwMarks(ci.marks).impulse !== null;

  const onPrimary = (s: EwPrimaryScenario) => {
    setPrimary(s);
    setAlternative((a) => reconcileAlternative(s, a));
    ci.setMessage(null);
  };
  const onInvalidation = (price: number | null) => {
    const rest = ci.marks.filter((m) => !(m.kind === 'hline' && m.author === 'user'));
    const last = visible[visible.length - 1];
    ci.setMarks(price !== null && last ? [...rest, invalidationMarkAt(price, last.openTime)] : rest);
  };

  const submit = () => {
    if (locked) return;
    const r = ewAnswer({ kind: EW_KIND[envelope.difficulty], marks: ci.marks, primary, alternative, invalidation, alternativeRequired: p.alternativeRequired });
    if ('error' in r) {
      ci.setMessage(ewx.input[r.error]);
      return;
    }
    ci.setMessage(null);
    setSheet(false);
    void flow.submit({ ...r.answer, kind });
  };

  const hintText = [HINT_TEXT[kind], p.directionHint ? ewx.hint.dir(p.directionHint) : ''].filter(Boolean).join(' ');
  const details: ReactNode = (
    <>
      <p>
        <Annotated text={ewx.hint.details} />
      </p>
      <p>{ewx.hint.windowNote(windowBars)}</p>
    </>
  );

  const message = ci.message ?? (flow.gradeError ? ss.errors.gradeFailed.text : null);
  const panel = (
    <ScenarioPanel
      primaryOptions={p.primaryOptions}
      primary={primary}
      onPrimary={onPrimary}
      alternative={alternative}
      onAlternative={setAlternative}
      alternativeRequired={p.alternativeRequired}
      invalidation={invalidation}
      onInvalidation={onInvalidation}
      disabled={locked}
    />
  );
  const liveBlock = p.hints?.liveRules ? <LiveRules hints={hints} hasCount={hasCount} /> : null;

  const exitTime = useMemo(() => {
    const i = result?.replay?.exitIndex;
    return i === null || i === undefined ? null : (replayCandles[i]?.openTime ?? null);
  }, [result, replayCandles]);
  const highlights = useMemo<CandleHighlight[]>(() => {
    const out: CandleHighlight[] = [{ time: p.lastPivot.time, tone: 'focus', label: ewx.currentPoint }];
    if (final && exitTime !== null && result && result.detail.kind !== undefined && 'elliott' in result.detail) {
      out.push({ time: exitTime, tone: 'ref', label: ewx.result.marker[result.detail.elliott.outcome.kind] });
    }
    return out;
  }, [p.lastPivot.time, final, exitTime, result]);

  const readOnly = final && showRef && result ? result.reference : undefined;
  const chart = (
    <>
      <TaskChart
        symbol={envelope.symbol}
        tf={p.tf}
        candles={candles}
        marks={ci.marks}
        tool={locked ? 'select' : ci.tool}
        onMarksChange={locked ? () => undefined : ci.setMarks}
        bars={windowBars + LEAD_IN}
        highlightRange={p.window}
        {...(readOnly ? { readOnlyMarks: readOnly } : {})}
        selectedId={ci.selectedId}
        onSelectedChange={ci.setSelectedId}
        onNotice={ci.setNotice}
        focus={ci.focus}
        handleRef={chartRef}
        highlightCandles={highlights}
        onVisibleRangeChange={setWin}
      />
      <RelativeAxis win={win} decisionTime={envelope.decisionTime} />
    </>
  );

  const replayPanel = (
    <div data-testid="ew-replay" className="border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:border-t-0">
      <p className="px-3 pt-2 text-sm font-medium">{ewx.replay.title}</p>
      <ReplayBar played={replay.played} limit={replayCandles.length} paused={replay.paused} speed={replay.speed} onPause={replay.setPaused} onSpeed={replay.setSpeed} onSkip={replay.skip} />
    </div>
  );

  const instruction =
    !result && !(ci.tool === 'select' && !ci.notice.code && !ci.message) ? (
      <InstructionBar
        tool={ci.tool}
        step={ci.notice.step}
        notice={ci.notice.code}
        selected={null}
        fmt={fmt}
        onCancel={() => ci.setTool('select')}
        onDelete={() => ci.selected && ci.deleteMark(ci.selected.id)}
        onDeselect={() => ci.setSelectedId(null)}
        onFinish={() => chartRef.current?.finishDraft()}
        message={message}
      />
    ) : undefined;

  const summary = ewx.panel.summary(primary ? ewx.scenarioShort[primary] : null, alternative !== null, invalidation === null ? null : fmt(invalidation));
  const firstHint = hints[0];
  const mobileBottom = replaying ? (
    replayPanel
  ) : (
    <div>
      <button
        type="button"
        data-testid="scenario-open"
        aria-haspopup="dialog"
        onClick={() => setSheet(true)}
        className="flex min-h-11 w-full cursor-pointer items-center gap-2 border-t border-border bg-surface-1 px-3 py-1 text-left text-sm hover:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="font-medium">{ewx.panel.open}</span>
          <span className="block truncate text-xs text-text-2" data-testid="scenario-summary">
            {summary}
          </span>
        </span>
        <ChevronUp size={20} strokeWidth={1.75} aria-hidden />
      </button>
      <div className="flex flex-col gap-0.5 bg-surface-1 px-3 pb-1">
        <EwProgress marks={ci.marks} kind={kind} />
        {firstHint && (
          <p data-testid="live-line" className="truncate text-xs text-text-2">
            {firstHint.text}
          </p>
        )}
        <InputMessage text={ci.message ?? (flow.gradeError ? ss.errors.gradeFailed.text : null)} />
      </div>
      <TaskToolbarBar groups={groups} tool={ci.tool} onTool={ci.setTool} onCheck={submit} checking={busy} />
    </div>
  );

  const aside = replaying ? (
    replayPanel
  ) : (
    <>
      <AsideSection title={ss.aside.task}>
        <p data-testid="task-text" className="text-sm leading-5">
          <Annotated text={hintText} />
        </p>
        <div className="mt-1">
          <EwProgress marks={ci.marks} kind={kind} />
        </div>
      </AsideSection>
      <AsideSection>
        {panel}
        {liveBlock && <div className="mt-4">{liveBlock}</div>}
        <div className="mt-3 flex flex-col gap-2">
          <InputMessage text={message} />
          <SubmitButton onClick={submit} busy={busy} label={ss.check} />
        </div>
      </AsideSection>
      <AsideSection title={ss.aside.criteria}>
        <div data-testid="task-criteria" className="space-y-2 text-sm text-text-2">
          {details}
        </div>
      </AsideSection>
    </>
  );

  const revealed = useMemo(() => {
    if (!result || !final) return null;
    const shift = result.task.reveal?.shiftMs ?? 0;
    return { ...result, feedback: revealFeedback(result.feedback, shift), errors: revealErrors(result.errors, shift) };
  }, [result, final]);
  const detail = result && 'elliott' in result.detail ? result.detail.elliott : null;
  const extra = detail ? <ResultExtra detail={detail} limit={p.limitCandles} fmt={fmt} decisionTime={result?.task.reveal?.decisionTime ?? null} /> : null;

  const onFocusMarks = useCallback(
    (ids: string[]) => {
      if (!ids.some((id) => chartRef.current?.focusMark(id))) ci.focusOn(ids, [...ci.marks, ...(result?.reference ?? [])]);
    },
    [ci, result],
  );

  return (
    <>
      <SessionLayout
        {...base}
        hint={desktop ? undefined : <TaskHint text={hintText} details={details} />}
        instruction={instruction}
        chart={chart}
        rail={<TaskToolRail groups={groups} tool={ci.tool} onTool={ci.setTool} />}
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
                    onFocusMarks={onFocusMarks}
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
      {!desktop && !result && (
        <BottomSheet
          open={sheet}
          onClose={() => setSheet(false)}
          title={ewx.panel.title}
          height="full"
          footer={
            <Button variant="primary" size="lg" className="flex-1" onClick={() => setSheet(false)} data-testid="scenario-done">
              {ewx.panel.done}
            </Button>
          }
        >
          {panel}
          {liveBlock && <div className="mt-4">{liveBlock}</div>}
        </BottomSheet>
      )}
    </>
  );
}
