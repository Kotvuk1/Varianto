'use client';
// /learn/challenge/session: загрузка сценария -> решение -> проигрывание -> итог (LAYOUTS §5).
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type { Difficulty, Mark, TaskTimeframe } from '@tl/core';
import { TradingChart, type TimeWindow } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { ch } from '@/i18n/ru/challenge';
import { ss } from '@/i18n/ru/session';
import { formatR } from '@/i18n/format';
import { SKILL_NAMES_RU } from '@/i18n/ru/progress';
import { useRepository } from '@/storage';
import { Button, Segmented } from '@/ui';
import { selectHints } from './hints';
import { buildAttempt } from './attempt';
import { ChallengeApiError, fetchNext, gradeChallenge } from './api';
import { buildAnswer } from './position';
import { DecisionPanel, ErrorBlock, ReasonsSheet, ReplayBar, ResultView, hitText } from './panels';
import { RelativeAxis } from './RelativeAxis';
import { createSessionStore } from './sessionStore';
import { TF_LABEL, TASK_TFS, isTaskTf } from './tf';
import { BottomSheet, IconButton, type SheetHeight } from '@/ui';

const POS_ID = 'challenge-position';
const EXIT_ID = 'challenge-exit';
const BASE_TICK_MS = 700;
const noop = () => undefined;
const FOCUS_SKILLS = ['challenge-entry', 'challenge-risk', 'challenge-wait'] as const;
const SHEET_PAD: Record<SheetHeight, string> = { peek: '120px', medium: '50dvh', full: '50dvh' };

const toError = (e: unknown): ChallengeApiError => (e instanceof ChallengeApiError ? e : new ChallengeApiError('generic', 0));

function useDesktop(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return on;
}

export function ChallengeSession() {
  const params = useSearchParams();
  const router = useRouter();
  const repo = useRepository();
  const diffParam = params.get('difficulty');
  const difficulty: Difficulty = diffParam === 'medium' || diffParam === 'hard' ? diffParam : 'easy';
  const focusParam = params.get('focus');
  const focus = FOCUS_SKILLS.find((f) => f === focusParam) ?? null;
  const [sheetH, setSheetH] = useState<SheetHeight>('peek');
  const tfParam = params.get('tf');
  const startTf = isTaskTf(tfParam) ? tfParam : 'auto';

  const [store] = useState(createSessionStore);
  const s = useStore(store);
  const desktop = useDesktop();
  const [win, setWin] = useState<TimeWindow | null>(null);
  const seen = useRef<string[]>([]);
  const startedAt = useRef(0);
  const saved = useRef<string | null>(null);
  const reqId = useRef(0);

  const load = useCallback(async () => {
    const my = ++reqId.current;
    try {
      const task = await fetchNext(difficulty, seen.current, undefined, focus ? [focus] : []);
      if (my !== reqId.current) return;
      seen.current.push(task.taskId);
      startedAt.current = Date.now();
      saved.current = null;
      store.getState().loaded(task, startTf);
    } catch (e) {
      if (my === reqId.current) store.getState().failed(toError(e));
    }
  }, [store, difficulty, startTf, focus]);

  useEffect(() => {
    void load();
  }, [load]);

  // Проигрывание: шаг по таймеру, скорость ×1/×4/×16.
  useEffect(() => {
    if (s.phase !== 'replay' || s.paused) return;
    const id = setInterval(() => store.getState().tick(), BASE_TICK_MS / s.speed);
    return () => clearInterval(id);
  }, [store, s.phase, s.paused, s.speed]);

  const task = s.task;
  const symbol = task?.symbol ?? 'BTCUSDT';
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(symbol)), [symbol]);
  const base = useMemo(() => task?.series[s.tf] ?? [], [task, s.tf]);
  const replayActive = s.grade !== null && s.tf === s.grade.replay.tf;
  const candles = useMemo(
    () => (replayActive && s.played > 0 ? [...base, ...s.grade!.replay.candles.slice(0, s.played)] : base),
    [base, replayActive, s.played, s.grade],
  );
  const series = useMemo(() => ({ symbol, tf: s.tf, source: 'binance-archive' as const, candles: [...candles] }), [symbol, s.tf, candles]);
  const lastOpen = base.length ? base[base.length - 1]!.openTime : 0;
  const entry = task?.payload.entryPrice ?? 0;

  const positionMarks = useMemo<Mark[]>(() => {
    if (!task || !s.side || s.side === 'WAIT' || s.sl === null || s.tp === null || !lastOpen) return [];
    return [
      {
        id: POS_ID,
        kind: 'position',
        anchors: [
          { time: lastOpen, price: entry },
          { time: lastOpen, price: s.sl },
          { time: lastOpen, price: s.tp },
        ],
        scope: null,
        direction: null,
        meta: { entry, sl: s.sl, tp: s.tp },
        author: 'user',
      },
    ];
  }, [task, s.side, s.sl, s.tp, lastOpen, entry]);

  const onMarks = useCallback(
    (marks: Mark[]) => {
      const m = marks.find((x) => x.id === POS_ID);
      // Вход зафиксирован: меняются только SL и TP.
      if (m && m.anchors.length === 3) store.getState().setLevels(m.anchors[1]!.price, m.anchors[2]!.price);
    },
    [store],
  );

  const g = s.grade;
  const finished = s.phase === 'result' || (s.phase === 'replay' && g !== null && s.played >= g.replay.candles.length);
  const readOnly = useMemo<Mark[]>(() => {
    if (!task) return [];
    if (s.phase === 'decide' || s.phase === 'grading') return selectHints(task.payload.hints);
    if (!g) return [];
    const out: Mark[] = [];
    if (s.phase === 'result') out.push(...g.reference);
    const o = g.detail.challenge.outcome;
    const exitC = g.replay.exitIndex !== null ? g.replay.candles[g.replay.exitIndex] : undefined;
    if (finished && o && exitC && replayActive) {
      out.push({
        id: EXIT_ID,
        kind: 'hline',
        anchors: [{ time: exitC.openTime, price: o.exitPrice }],
        scope: null,
        direction: null,
        author: 'algo',
      });
    }
    return out;
  }, [task, s.phase, g, finished, replayActive]);

  const saveAttempt = useCallback(
    async (res: Awaited<ReturnType<typeof gradeChallenge>>, answer: ReturnType<typeof buildAnswer>) => {
      const t = store.getState().task;
      if (!t || saved.current === res.taskId) return;
      saved.current = res.taskId;
      try {
        const now = Date.now();
        await repo.saveAttempt(buildAttempt(t, answer, res, now, now - startedAt.current, globalThis.crypto?.randomUUID?.() ?? `${res.taskId}:${now}`));
      } catch {
        store.getState().setSaveFailed(true);
      }
    },
    [store, repo],
  );

  const submit = useCallback(async () => {
    const st = store.getState();
    if (!st.task || !st.side || st.phase !== 'decide') return;
    let answer;
    try {
      answer = buildAnswer({ side: st.side, tf: st.tf, entry: st.task.payload.entryPrice, sl: st.sl, tp: st.tp, reasons: st.reasons, note: st.note });
    } catch {
      return;
    }
    st.grading();
    try {
      const res = await gradeChallenge(st.task.taskToken, answer);
      store.getState().graded(res);
      void saveAttempt(res, answer);
    } catch (e) {
      store.getState().gradeFailed(toError(e));
    }
  }, [store, saveAttempt]);

  const next = () => {
    setSheetH('peek');
    store.getState().start();
    void load();
  };
  const exit = () => router.push('/learn/challenge');
  const otherDifficulty = () => router.push('/learn/challenge');

  const locked = s.phase === 'replay' || s.phase === 'result' || s.phase === 'grading';
  const hasMultiple = s.task !== null;
  const strip =
    s.phase === 'replay' || s.phase === 'result'
      ? finished && g
        ? hitText(g)
        : task
          ? ch.session.pairHidden(task.symbol)
          : null
      : task
        ? ch.session.pairHidden(task.symbol)
        : null;
  const interactive = s.phase === 'decide' && s.side !== null && s.side !== 'WAIT';
  const partial = base.length > 0 && !base[base.length - 1]!.closed;

  const resultBody = g && task ? <ResultView grade={g} fmt={fmt} /> : null;
  const summary = (() => {
    if (!g) return '';
    const d = g.detail.challenge;
    const outcome = d.outcome ? formatR(d.outcome.rMultiple) : d.waitCorrect ? ch.result.waitOk : ch.result.waitBad;
    const verdict = ch.result.verdicts[g.verdict];
    return d.quality ? ch.result.summary(outcome, verdict, ch.result.qualityOf(Math.round(d.quality.score))) : ch.result.summaryNoQuality(outcome, verdict);
  })();
  const sheetToggle = (
    <Button
      size="md"
      variant="ghost"
      icon={sheetH === 'full' ? <ChevronDown size={20} strokeWidth={1.75} /> : <ChevronUp size={20} strokeWidth={1.75} />}
      onClick={() => setSheetH((h) => (h === 'peek' ? 'medium' : h === 'medium' ? 'full' : 'peek'))}
      data-testid="sheet-toggle"
    >
      {sheetH === 'full' ? ss.collapseSheet : ss.expandSheet}
    </Button>
  );
  const resultButtons = (
    <>
      <Button variant="primary" size="lg" className="flex-1" onClick={next} data-testid="challenge-next">
        {ch.result.next}
      </Button>
      <Button variant="secondary" size="lg" className="flex-1" onClick={exit} data-testid="challenge-exit">
        {ch.result.exit}
      </Button>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="challenge-session" data-phase={s.phase}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface-1 px-2 lg:px-4">
        <Link href="/learn/challenge" aria-label={ch.back} className="flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-surface-2">
          <ChevronLeft size={24} strokeWidth={1.75} aria-hidden />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
          <span className="lg:hidden">{ch.session.titleShort(ch.difficulties[difficulty].label)}</span>
          <span className="hidden lg:inline">{ch.session.title(ch.difficulties[difficulty].label)}</span>
        </h1>
        <div className="w-[176px] shrink-0 lg:w-60 [&_button]:px-1 lg:[&_button]:px-3" title={locked ? ch.session.tfLockedReplay : undefined}>
          <Segmented
            label={ch.session.timeframe}
            value={s.tf}
            onChange={(v: TaskTimeframe) => store.getState().setTf(v)}
            options={TASK_TFS.map((v) => ({ value: v, label: TF_LABEL[v], disabled: !hasMultiple || (locked && v !== s.tf) }))}
          />
        </div>
      </header>
      {focus && (
        <p data-testid="challenge-focus" className="shrink-0 border-b border-border bg-surface-1 px-3 py-1.5 text-xs text-text-2">
          {ch.session.focusHint(SKILL_NAMES_RU[focus])}
          {focus === 'challenge-wait' ? ` · ${ch.session.focusWait}` : ''}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-bg" aria-label={ch.session.chartLabel}>
          <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border bg-surface-1 px-3 text-xs text-text-2" data-testid="challenge-strip">
            <span role="status" aria-live="polite" className="tnum truncate">
              {strip}
            </span>
            {partial && !locked && (
              <span title={ch.session.openCandleNote} className="ml-auto shrink-0">
                {ch.session.openCandleShort}
              </span>
            )}
          </div>
          <div
            className="relative min-h-0 flex-1"
            style={s.phase === 'result' && !desktop ? { paddingBottom: SHEET_PAD[sheetH] } : undefined}
          >
            {task && (
              <TradingChart
                key={task.taskId}
                series={series}
                marks={positionMarks}
                tool={interactive ? 'select' : null}
                onMarksChange={onMarks}
                selectedId={positionMarks.length && s.phase === 'decide' ? POS_ID : null}
                onSelectedChange={noop}
                readOnlyMarks={readOnly}
                onVisibleRangeChange={setWin}
                openCandleLabel={ch.session.openCandle}
                ariaLabel={`${task.symbol} ${TF_LABEL[s.tf]}`}
                snap={false}
              />
            )}
            {task && <RelativeAxis win={win} decisionTime={task.decisionTime} />}
            {s.phase === 'loading' && (
              <div role="status" className="absolute inset-0 z-20 flex items-center justify-center bg-bg text-sm text-text-2" data-testid="challenge-loading">
                {ch.session.loading}
              </div>
            )}
            {s.phase === 'error' && s.error && (
              <div className="absolute inset-0 z-20 bg-bg">
                <ErrorBlock error={s.error} onRetry={next} onOther={s.error.kind === 'not-found' || s.error.kind === 'archive' ? otherDifficulty : undefined} />
              </div>
            )}
          </div>
        </section>

        <aside hidden={s.phase === 'result' && !desktop && !s.saveFailed} className="flex max-h-[45%] shrink-0 flex-col overflow-y-auto border-t border-border bg-surface-1 lg:max-h-none lg:w-[360px] lg:border-t-0 lg:border-l" aria-label={ch.decision.group}>
          {(s.phase === 'decide' || s.phase === 'grading') && task && (
            <DecisionPanel
              side={s.side}
              entry={entry}
              sl={s.sl}
              tp={s.tp}
              symbol={symbol}
              fmt={fmt}
              disabled={s.phase === 'grading'}
              onSide={(v) => store.getState().setSide(v)}
              onLevels={(sl, tp) => store.getState().setLevels(sl, tp)}
              onOpen={() => store.getState().setReasonsOpen(true)}
            />
          )}
          {s.phase === 'replay' && g && (
            <ReplayBar
              played={s.played}
              limit={task?.payload.timeLimitCandles[g.replay.tf] ?? g.replay.candles.length}
              paused={s.paused}
              speed={s.speed}
              onPause={(v) => store.getState().setPaused(v)}
              onSpeed={(v) => store.getState().setSpeed(v)}
              onSkip={() => store.getState().skip()}
            />
          )}
          {s.phase === 'result' && desktop && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                <h2 className="text-lg font-semibold">{ch.result.title}</h2>
                {resultBody}
              </div>
              <div className="flex shrink-0 gap-2 border-t border-border p-3">{resultButtons}</div>
            </div>
          )}
          {s.saveFailed && (
            <p role="status" className="px-3 pb-3 text-sm text-text-2" data-testid="save-failed">
              {ch.errors.saveFailed.title}. {ch.errors.saveFailed.text}
            </p>
          )}
        </aside>
      </div>

      {s.side && task && (
        <ReasonsSheet
          open={s.reasonsOpen && s.phase !== 'replay' && s.phase !== 'result'}
          side={s.side}
          options={task.payload.reasonOptions}
          reasons={s.reasons}
          note={s.note}
          submitting={s.phase === 'grading'}
          error={s.gradeError}
          onToggle={(r) => store.getState().toggleReason(r)}
          onNote={(n) => store.getState().setNote(n)}
          onClose={() => store.getState().setReasonsOpen(false)}
          onSubmit={() => void submit()}
        />
      )}
      {!desktop && (
        <BottomSheet
          open={s.phase === 'result'}
          onClose={() => setSheetH('peek')}
          title={sheetH === 'peek' ? summary : ch.result.title}
          height={sheetH}
          modal={false}
          footer={sheetH === 'peek' ? undefined : resultButtons}
        >
          {sheetH === 'peek' ? (
            <div data-testid="challenge-summary" className="flex items-center gap-2">
              {resultButtons}
              <IconButton
                label={ss.expandSheet}
                icon={<ChevronUp size={20} strokeWidth={1.75} />}
                onClick={() => setSheetH('medium')}
                data-testid="sheet-toggle"
              />
            </div>
          ) : (
            <>
              <div className="mb-2">{sheetToggle}</div>
              {resultBody}
            </>
          )}
        </BottomSheet>
      )}
    </div>
  );
}
