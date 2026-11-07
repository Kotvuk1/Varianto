'use client';
// Тело заданий Fibonacci: «Построй сетку», «Где реакция?», «Цель по Extension» на общем каркасе сессии.
// reaction/extension: после «Принять» проигрывается будущее (шкала относительная, дата скрыта), затем разбор.
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { TIMEFRAME_MS, type FibConfluenceKey, type FibReactionOption, type FibTarget, type Mark, type PdSide } from '@tl/core';
import type { CandleHighlight, TimeWindow, TradingChartHandle } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { Annotated } from '@/features/guide';
import { InstructionBar } from '@/features/terminal/InstructionBar';
import { fx } from '@/i18n/ru/fib';
import { ss } from '@/i18n/ru/session';
import { Button } from '@/ui';
import { ReplayBar } from '../challenge/panels';
import { RelativeAxis } from '../challenge/RelativeAxis';
import { formatScenarioDate } from '../challenge/reveal';
import { AsideSection, InputMessage, SubmitButton } from '../session/AnswerParts';
import { ResultBody } from '../session/ResultView';
import { SessionLayout, TaskHint } from '../session/SessionLayout';
import { TaskChart } from '../session/TaskChart';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { TaskToolbarBar, TaskToolRail } from '../session/TaskToolbar';
import { msToolGroups } from '../session/toolGroups';
import type { Answer, FibPayload, GradeResultDto, TaskEnvelope } from '../session/types';
import { useChartInteraction } from '../session/useChartInteraction';
import { useIsDesktop } from '../session/useIsDesktop';
import { fibExtensionAnswer, fibGridAnswer, fibReactionAnswer, keepLastFib, optionFromLevel, optionRatio } from './adapters';
import { ReactionForm, TargetPicker } from './ReactionForm';
import { plainVerdict, revealFeedback } from './reveal';
import { useReplay } from './useReplay';

const LEAD_IN = 12;
const REACTION_BARS = 70;

type Kind = FibPayload['kind'];
const MARK_KIND = { 'fib-grid': 'fib-retracement', 'fib-extension': 'fib-extension' } as const;

function summaryOf(result: GradeResultDto, fmt: (p: number) => string): { id: string; text: string }[] {
  const d = result.detail;
  if (d.kind !== 'fib-reaction' && d.kind !== 'fib-extension') return [];
  const out: { id: string; text: string }[] = [];
  const r = d.fib.reaction;
  if (r) {
    out.push({ id: 'choice', text: fx.result.reaction(fx.reaction.options[r.option], r.correctOptions.map((o) => fx.reaction.options[o]).join(', ')) });
    out.push({ id: 'outcome', text: r.outcome.kind === 'fail' ? fx.result.outcomeFail : fx.result.depth(r.outcome.depth.toFixed(3), fmt(r.outcome.extremePrice)) });
    out.push({ id: 'pd', text: r.pd.asked && r.pd.given && r.pd.expected ? fx.result.pd(fx.reaction.pd[r.pd.given], fx.reaction.pd[r.pd.expected]) : fx.result.pdNone });
  }
  const e = d.fib.extension;
  if (e) out.push({ id: 'target', text: fx.result.extension(fx.extension.targets[e.target], fx.extension.targets[e.reached], e.xMax.toFixed(3)) });
  return out;
}

export function FibBody({ envelope, flow, base }: { envelope: TaskEnvelope<FibPayload>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const kind: Kind = p.kind;
  const future = kind !== 'fib-grid';
  const desktop = useIsDesktop();
  const markKind = kind === 'fib-reaction' ? null : MARK_KIND[kind];
  const transform = useCallback((next: Mark[]) => (markKind ? keepLastFib(next, markKind) : next), [markKind]);
  const ci = useChartInteraction(markKind ?? 'select', transform);
  const [showRef, setShowRef] = useState(true);
  const [win, setWin] = useState<TimeWindow | null>(null);
  const [option, setOption] = useState<FibReactionOption | null>(null);
  const [confluence, setConfluence] = useState<ReadonlySet<FibConfluenceKey>>(new Set());
  const [pd, setPd] = useState<PdSide | null>(null);
  const [target, setTarget] = useState<FibTarget | null>(null);
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
    const base = envelope.series[p.tf] ?? [];
    return replay.played > 0 ? [...base, ...replayCandles.slice(0, replay.played)] : base;
  }, [envelope.series, p.tf, replayCandles, replay.played]);

  const windowBars = 'window' in p ? Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1 : 0;
  const groups = useMemo(() => (markKind ? msToolGroups([markKind]) : []), [markKind]);

  const pre = useMemo<Mark[] | undefined>(() => (p.kind === 'fib-reaction' ? [p.grid, ...(p.hints ?? [])] : undefined), [p]);
  const readOnly = final && showRef && result ? result.reference : pre;

  const exitTime = useMemo(() => {
    const i = result?.replay?.exitIndex;
    return i === null || i === undefined ? null : (replayCandles[i]?.openTime ?? null);
  }, [result, replayCandles]);
  const markers = useMemo<CandleHighlight[] | undefined>(() => {
    if (!final || exitTime === null || !result) return undefined;
    const failed = result.detail.kind === 'fib-reaction' && result.detail.fib.reaction?.outcome.kind === 'fail';
    const label = kind === 'fib-reaction' ? (failed ? fx.result.marker.fail : fx.result.marker.reaction) : fx.result.marker.invalidation;
    return [{ time: exitTime, tone: 'ref', label }];
  }, [final, exitTime, result, kind]);

  const ratio = optionRatio(option);
  const onPick = useCallback(
    (level: number) => {
      if (p.kind !== 'fib-reaction') return;
      const o = optionFromLevel(level, p.options);
      if (o) {
        setOption(o);
        ci.setMessage(null);
      } else ci.setMessage(fx.reaction.notAnOption);
    },
    [p, ci],
  );

  const toggleConf = (k: FibConfluenceKey) =>
    setConfluence((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const build = (): Answer | string => {
    if (p.kind === 'fib-grid') return fibGridAnswer(ci.marks) ?? fx.input.noGrid;
    if (p.kind === 'fib-extension') {
      if (!fibExtensionAnswer(ci.marks, 'none')) return fx.input.noExtension;
      return fibExtensionAnswer(ci.marks, target) ?? fx.input.noTarget;
    }
    if (!option) return fx.input.noOption;
    if (p.pdQuestion && !pd) return fx.input.noPd;
    return fibReactionAnswer(option, confluence, p.confluenceOptions, p.pdQuestion ? pd : null);
  };
  const submit = () => {
    if (locked) return;
    const a = build();
    if (typeof a === 'string') {
      ci.setMessage(a);
      return;
    }
    ci.setMessage(null);
    void flow.submit(a);
  };

  const hintText = (() => {
    if (p.kind === 'fib-grid') return [fx.hint.grid, p.directionHint ? fx.hint.gridDir(p.directionHint) : ''].filter(Boolean).join(' ');
    if (p.kind === 'fib-extension') return [fx.hint.extension, p.directionHint ? fx.hint.extensionDir(p.directionHint) : ''].filter(Boolean).join(' ');
    return fx.hint.reaction;
  })();
  const details: ReactNode = (
    <>
      <p>
        <Annotated text={p.kind === 'fib-grid' ? fx.hint.gridDetails : p.kind === 'fib-extension' ? fx.hint.extensionDetails : fx.hint.reactionDetails} />
      </p>
      {kind === 'fib-reaction' && <p>{fx.hint.reactionTap}</p>}
      {windowBars > 0 && <p>{fx.hint.windowNote(windowBars)}</p>}
    </>
  );

  const message = ci.message ?? (flow.gradeError ? ss.errors.gradeFailed.text : null);
  const status = (
    <div className="flex flex-col gap-1 px-3 pb-2 lg:px-0">
      <InputMessage text={message} />
    </div>
  );
  const form: ReactNode =
    p.kind === 'fib-reaction' ? (
      <ReactionForm
        options={p.options}
        confluenceOptions={p.confluenceOptions}
        pdQuestion={p.pdQuestion}
        fmtPrice={fmt}
        option={option}
        onOption={(o) => {
          setOption(o);
          ci.setMessage(null);
        }}
        confluence={confluence}
        onConfluence={toggleConf}
        pd={pd}
        onPd={setPd}
        disabled={locked}
      />
    ) : p.kind === 'fib-extension' ? (
      <TargetPicker options={p.targetOptions} value={target} onChange={setTarget} disabled={locked} />
    ) : null;

  const chart = (
    <>
      <TaskChart
        symbol={envelope.symbol}
        tf={p.tf}
        candles={candles}
        marks={ci.marks}
        tool={locked ? 'select' : ci.tool}
        onMarksChange={locked ? () => undefined : ci.setMarks}
        bars={windowBars ? windowBars + LEAD_IN : REACTION_BARS}
        {...('window' in p ? { highlightRange: p.window } : {})}
        {...(readOnly ? { readOnlyMarks: readOnly } : {})}
        selectedId={ci.selectedId}
        onSelectedChange={ci.setSelectedId}
        onNotice={ci.setNotice}
        focus={ci.focus}
        handleRef={chartRef}
        {...(kind === 'fib-reaction' && !locked ? { onLevelPick: onPick } : {})}
        {...(kind === 'fib-reaction' ? { highlightLevel: ratio } : {})}
        {...(markers ? { highlightCandles: markers } : {})}
        {...(future ? { onVisibleRangeChange: setWin } : {})}
      />
      {future && <RelativeAxis win={win} decisionTime={envelope.decisionTime} />}
    </>
  );

  const replayPanel = (
    <div data-testid="fib-replay" className="border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:border-t-0">
      <p className="px-3 pt-2 text-sm font-medium">{fx.replay.title}</p>
      <ReplayBar
        played={replay.played}
        limit={replayCandles.length}
        paused={replay.paused}
        speed={replay.speed}
        onPause={replay.setPaused}
        onSpeed={replay.setSpeed}
        onSkip={replay.skip}
      />
    </div>
  );

  const instruction =
    markKind && !result && !(ci.tool === 'select' && !ci.notice.code && !ci.message) ? (
      <InstructionBar
        tool={ci.tool}
        step={ci.notice.step}
        notice={ci.notice.code}
        selected={future ? null : ci.selected}
        fmt={fmt}
        onCancel={() => ci.setTool('select')}
        onDelete={() => ci.selected && ci.deleteMark(ci.selected.id)}
        onDeselect={() => ci.setSelectedId(null)}
        message={message}
      />
    ) : undefined;

  const mobileBottom = replaying ? (
    replayPanel
  ) : markKind ? (
    <div>
      {form}
      {status}
      <TaskToolbarBar groups={groups} tool={ci.tool} onTool={ci.setTool} onCheck={submit} checking={busy} />
    </div>
  ) : (
    <div data-testid="answer-panel" className="max-h-[46dvh] overflow-y-auto border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]">
      {form}
      {status}
      <div className="px-3 pb-3">
        <SubmitButton onClick={submit} busy={busy} label={fx.reaction.accept} className="w-full" />
      </div>
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
      </AsideSection>
      <AsideSection>
        {form}
        <div className="mt-3 flex flex-col gap-2">
          <InputMessage text={message} />
          <SubmitButton onClick={submit} busy={busy} label={kind === 'fib-reaction' ? fx.reaction.accept : ss.check} />
        </div>
      </AsideSection>
      <AsideSection title={ss.aside.criteria}>
        <div data-testid="task-criteria" className="space-y-2 text-sm text-text-2">
          {details}
        </div>
      </AsideSection>
    </>
  );

  const extra = result ? (
    <div data-testid="fib-summary" className="mt-1 space-y-0.5 text-sm text-text-2">
      {future && result.task.reveal && <p data-testid="fib-scenario-date">{fx.result.scenario(formatScenarioDate(result.task.reveal.decisionTime))}</p>}
      {summaryOf(result, fmt).map((l) => (
        <p key={l.id} data-testid={`fib-sum-${l.id}`} className="tnum">
          {l.text}
        </p>
      ))}
    </div>
  ) : null;
  const revealed = result && final ? { ...result, feedback: plainVerdict(revealFeedback(result.feedback, result.task.reveal?.shiftMs ?? 0), result.verdict, result.score) } : null;

  return (
    <SessionLayout
      {...base}
      hint={desktop ? undefined : <TaskHint text={hintText} wrap={kind === 'fib-reaction'} details={details} />}
      instruction={instruction}
      chart={chart}
      rail={markKind ? <TaskToolRail groups={groups} tool={ci.tool} onTool={ci.setTool} /> : undefined}
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
