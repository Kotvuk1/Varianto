'use client';
// Панели сессии Challenge: решение, причины, проигрывание, итог, ошибки.
import { Info, Pause, Play, SkipForward, TriangleAlert, Check, X } from 'lucide-react';
import { useState } from 'react';
import type { ReasonCode } from '@tl/core';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { ch } from '@/i18n/ru/challenge';
import { formatR } from '@/i18n/format';
import { BottomSheet, Button, Chip, Segmented, Stat } from '@/ui';
import { FeedbackView, GradeLegend } from '../feedback';
import { ChallengeApiError } from './api';
import { relativeDuration } from './axis';
import { TF_LABEL } from './tf';
import { formatRR, reasonsFor, riskReward, validatePosition, type Side } from './position';
import { revealFeedback, formatScenarioDate, resolutionNote } from './reveal';
import { SPEEDS, type Speed } from './sessionStore';
import type { ChallengeGradeResult } from './types';

// ---------------------------------------------------------------- ошибки

export function errorCopy(e: ChallengeApiError, grading: boolean): { title: string; text: string } {
  const c = ch.errors;
  if (grading && e.kind !== 'rate' && e.kind !== 'offline' && e.kind !== 'expired') return c.gradeFailed;
  switch (e.kind) {
    case 'not-found':
      return c.notFound;
    case 'rate':
      return { title: c.rate.title, text: e.retryAfterSec ? `${c.rate.text} ${c.retryAfter(e.retryAfterSec)}` : c.rate.text };
    case 'archive':
      return c.archive;
    case 'offline':
      return c.offline;
    case 'expired':
      return c.expired;
    default:
      return c.generic;
  }
}

export function ErrorBlock({
  error,
  grading = false,
  onRetry,
  onOther,
}: {
  error: ChallengeApiError;
  grading?: boolean;
  onRetry: () => void;
  onOther?: () => void;
}) {
  const copy = errorCopy(error, grading);
  return (
    <div role="alert" data-testid="challenge-error" data-kind={error.kind} className="flex flex-col items-start gap-2 p-4">
      <TriangleAlert size={24} strokeWidth={1.75} aria-hidden className="text-text-2" />
      <h2 className="text-lg font-semibold">{copy.title}</h2>
      <p className="text-sm text-text-2">{copy.text}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {error.kind !== 'not-found' && (
          <Button variant="primary" onClick={onRetry}>
            {ch.errors.retry}
          </Button>
        )}
        {onOther && (
          <Button variant="secondary" onClick={onOther}>
            {error.kind === 'not-found' ? ch.errors.notFound.action : ch.errors.archive.other}
          </Button>
        )}
      </div>
      <details className="text-sm text-text-2">
        <summary className="min-h-11 cursor-pointer leading-[44px]">{ch.errors.details}</summary>
        <p className="tnum">Код: {error.status || 'network'}</p>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------- решение

function PriceField({
  label,
  value,
  fmt,
  onCommit,
  testId,
}: {
  label: string;
  value: number | null;
  fmt: (p: number) => string;
  onCommit: (v: number) => void;
  testId: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value === null ? '' : fmt(value).replace(/\s/g, ''));
  const commit = () => {
    if (draft === null) return;
    const v = Number(draft.replace(',', '.'));
    if (Number.isFinite(v) && v > 0) onCommit(v);
    setDraft(null);
  };
  return (
    <label className="flex min-w-0 flex-1 flex-col text-xs text-text-2">
      {label}
      <input
        data-testid={testId}
        inputMode="decimal"
        value={shown}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="tnum h-11 w-full min-w-0 rounded-sm border border-border-strong bg-surface-2 px-2 text-base text-text-1"
      />
    </label>
  );
}

export function blockerKey(
  side: Side | null,
  entry: number,
  sl: number | null,
  tp: number | null,
): keyof typeof ch.decision.errors | null {
  if (side === null) return 'noSide';
  if (side === 'WAIT') return null;
  if (sl === null || tp === null) return side === 'LONG' ? 'slLong' : 'slShort';
  const issues = validatePosition(side, entry, sl, tp);
  if (issues.includes('sl-wrong-side')) return side === 'LONG' ? 'slLong' : 'slShort';
  if (issues.includes('tp-wrong-side')) return side === 'LONG' ? 'tpLong' : 'tpShort';
  return null;
}

export function DecisionPanel(p: {
  side: Side | null;
  entry: number;
  sl: number | null;
  tp: number | null;
  symbol: string;
  fmt: (v: number) => string;
  disabled: boolean;
  onSide: (s: Side) => void;
  onLevels: (sl: number, tp: number) => void;
  onOpen: () => void;
}) {
  const blocker = blockerKey(p.side, p.entry, p.sl, p.tp);
  const rr = p.side && p.side !== 'WAIT' && p.sl !== null && p.tp !== null ? riskReward(p.entry, p.sl, p.tp) : null;
  return (
    <div className="flex flex-col gap-2 p-3" data-testid="decision-panel">
      {p.side && p.side !== 'WAIT' && p.sl !== null && p.tp !== null ? (
        <div data-testid="challenge-summary" className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <PriceField label={ch.decision.slFieldLabel} value={p.sl} fmt={p.fmt} onCommit={(v) => p.onLevels(v, p.tp!)} testId="challenge-sl" />
            <PriceField label={ch.decision.tpFieldLabel} value={p.tp} fmt={p.fmt} onCommit={(v) => p.onLevels(p.sl!, v)} testId="challenge-tp" />
            <div className="flex h-11 shrink-0 flex-col justify-center text-xs text-text-2">
              <span>{ch.decision.entry}</span>
              <span className="tnum text-sm text-text-1" data-testid="challenge-entry">
                {p.fmt(p.entry)}
              </span>
            </div>
          </div>
          <p className="tnum text-sm text-text-1" data-testid="challenge-rr">
            {rr ? `R:R ${formatRR(rr.rr)} · ${ch.decision.riskLine(`${(rr.riskPct * 100).toFixed(2)}%`)}` : ''}
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-2">{p.side === 'WAIT' ? ch.decision.hintWait : ch.decision.hintNone}</p>
      )}
      <Segmented
        label={ch.decision.group}
        value={(p.side ?? '') as Side}
        onChange={p.onSide}
        options={[
          { value: 'LONG', label: ch.decision.long },
          { value: 'SHORT', label: ch.decision.short },
          { value: 'WAIT', label: ch.decision.wait },
        ]}
        className="[&_button]:h-14 [&_button]:pointer-fine:h-12"
      />
      <Button variant="primary" size="lg" disabled={p.disabled || blocker !== null} onClick={p.onOpen} data-testid="challenge-open-reasons">
        {ch.decision.open}
      </Button>
      <p role="status" aria-live="polite" data-testid="challenge-blocker" className="min-h-5 text-sm text-text-2">
        {blocker ? ch.decision.errors[blocker] : ''}
      </p>
    </div>
  );
}

export function ReasonsSheet(p: {
  open: boolean;
  side: Side;
  options: readonly ReasonCode[];
  reasons: readonly ReasonCode[];
  note: string;
  submitting: boolean;
  error: ChallengeApiError | null;
  onToggle: (r: ReasonCode) => void;
  onNote: (n: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onRetryHint?: () => void;
}) {
  const opts = reasonsFor(p.side, p.options);
  const none = p.reasons.length === 0;
  return (
    <BottomSheet
      open={p.open}
      onClose={p.onClose}
      title={ch.reasons.title}
      height="medium"
      footer={
        <Button variant="primary" size="lg" className="w-full" disabled={none} loading={p.submitting} onClick={p.onSubmit} data-testid="challenge-submit">
          {p.submitting ? ch.decision.submitting : ch.decision.submit}
        </Button>
      }
    >
      <p className="mb-2 text-sm text-text-2">{ch.reasons.pick}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={ch.reasons.title}>
        {opts.map((r) => (
          <Chip key={r} selected={p.reasons.includes(r)} onSelectedChange={() => p.onToggle(r)} data-testid={`reason-${r}`}>
            {ch.reasons.labels[r]}
          </Chip>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium" htmlFor="challenge-note">
        {ch.reasons.note}
      </label>
      <textarea
        id="challenge-note"
        data-testid="challenge-note"
        rows={3}
        maxLength={500}
        value={p.note}
        placeholder={ch.reasons.notePlaceholder}
        onChange={(e) => p.onNote(e.target.value)}
        className="mt-1 w-full rounded-sm border border-border-strong bg-surface-1 p-2 text-base text-text-1"
      />
      <p className="tnum text-right text-xs text-text-3">{ch.reasons.noteMax(p.note.length)}</p>
      {none && <p className="text-sm text-text-2">{ch.decision.errors.noReasons}</p>}
      {p.error && <ErrorBlock error={p.error} grading onRetry={p.onSubmit} />}
    </BottomSheet>
  );
}

// ---------------------------------------------------------------- проигрывание

export function ReplayBar(p: {
  played: number;
  limit: number;
  paused: boolean;
  speed: Speed;
  onPause: (v: boolean) => void;
  onSpeed: (s: Speed) => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3" data-testid="replay-bar">
      <p role="status" aria-live="polite" data-testid="replay-status" className="tnum text-sm text-text-1">
        {ch.replay.status(p.played, p.limit)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          icon={p.paused ? <Play size={20} strokeWidth={1.75} /> : <Pause size={20} strokeWidth={1.75} />}
          onClick={() => p.onPause(!p.paused)}
          data-testid="replay-pause"
          className="min-w-[56px] shrink-0"
        >
          {p.paused ? ch.replay.resume : ch.replay.pause}
        </Button>
        <Segmented
          label={ch.replay.speed}
          value={String(p.speed) as `${Speed}`}
          onChange={(v) => p.onSpeed(Number(v) as Speed)}
          options={SPEEDS.map((s) => ({ value: String(s) as `${Speed}`, label: `×${s}` }))}
          className="min-w-0 flex-1"
        />
        <Button icon={<SkipForward size={20} strokeWidth={1.75} />} onClick={p.onSkip} data-testid="replay-skip" className="shrink-0">
          {ch.replay.skip}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- итог

function partMax(key: string, wait: boolean): number {
  if (wait && key === 'reasons') return ch.result.waitReasonsMax;
  return ch.result.componentMax[key] ?? 100;
}

export function hitText(g: ChallengeGradeResult): string | null {
  const o = g.detail.challenge.outcome;
  if (!o) return ch.replay.waitEnd;
  const rel = relativeDuration(Math.max(0, o.exitTime - (g.task.reveal.decisionTime - g.task.reveal.shiftMs)));
  const what = o.result === 'tp' ? ch.replay.hitTp : o.result === 'sl' ? ch.replay.hitSl : ch.replay.hitTimeout;
  return ch.replay.hitAt(what, rel);
}

export function ResultView({ grade, fmt }: { grade: ChallengeGradeResult; fmt: (v: number) => string }) {
  const d = grade.detail.challenge;
  const o = d.outcome;
  const wait = o === null;
  const note = resolutionNote(grade, TF_LABEL[grade.replay.tf]);
  const outcomeValue = o ? formatR(o.rMultiple) : d.waitCorrect ? ch.result.waitOk : ch.result.waitBad;
  const outcomeSub = o ? (o.result === 'tp' ? ch.result.posTp : o.result === 'sl' ? ch.result.posSl : ch.result.posTimeout) : ch.result.waitNoR;
  const q = d.quality;
  return (
    <div data-testid="challenge-result" className="text-sm">
      <div className="grid grid-cols-2 gap-4 py-2">
        <div>
          <Stat label={ch.result.outcome} value={outcomeValue} className="[&>span:first-child]:text-xl" />
          <p className="mt-1 flex items-center gap-1 text-xs text-text-2" data-testid="result-outcome-sub">
            {wait && (d.waitCorrect ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <X size={14} strokeWidth={1.75} aria-hidden />)}
            {outcomeSub}
          </p>
        </div>
        <Stat label={ch.result.decision} value={d.decisionCorrect ? ch.result.decisionOk : ch.result.decisionBad} className="[&>span:first-child]:text-xl" />
      </div>
      <p className="text-xs text-text-2">{ch.result.separate}</p>
      {note && (
        <p data-testid="resolution-note" className="mt-3 flex items-start gap-2 rounded-sm border border-border-strong bg-surface-1 p-2 text-sm">
          <Info size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
          <span>{note}</span>
        </p>
      )}
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-border pt-3" data-testid="result-reveal">
        <dt className="text-text-2">{ch.result.date}</dt>
        <dd data-testid="result-date" className="tnum">
          {formatScenarioDate(grade.task.reveal.decisionTime)}
        </dd>
        <dt className="text-text-2">{ch.result.pair}</dt>
        <dd data-testid="result-pair">{grade.task.symbol}</dd>
      </dl>
      {q && (
        <section className="mt-3 border-t border-border pt-3" aria-labelledby="q-h" data-testid="result-quality">
          <h3 id="q-h" className="text-sm font-semibold">
            {ch.result.quality}: <span className="tnum">{ch.result.qualityOf(Math.round(q.score))}</span>
          </h3>
          <p className="text-xs text-text-2">{ch.result.qualityNote}</p>
          <ul className="mt-2" aria-label={ch.result.parts}>
            {q.parts.map((part) => (
              <li key={part.key} className="flex min-h-9 items-center justify-between border-b border-border" data-testid={`quality-${part.key}`}>
                <span>{ch.result.components[part.key] ?? part.key}</span>
                <span className="tnum text-text-2">
                  {Math.round(part.score)} / {partMax(part.key, wait)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-3 text-sm text-text-2" data-testid="result-reference">
        {grade.reference.length ? ch.result.reference : ch.result.noReference}
      </p>
      <FeedbackView className="mt-2" feedback={revealFeedback(grade.feedback, grade.task.reveal.shiftMs)} fmtPrice={fmt} />
      <GradeLegend className="mt-2" />
    </div>
  );
}

export function fmtOf(symbol: string): (v: number) => string {
  return makePriceFormatter(tickSizeFor(symbol));
}
