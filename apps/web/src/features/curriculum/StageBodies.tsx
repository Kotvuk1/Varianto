'use client';
// Тела заданий ступеней 1-2: sw-mark, sw-trend, lv-strongest, lv-zone, lv-reaction.
import { useCallback, useMemo, useState } from 'react';
import { TIMEFRAME_MS, type Mark, type SkillId } from '@tl/core';
import { Annotated } from '@/features/guide';
import { GradeGlyph } from '@/features/feedback';
import { formatDateTimeRu, msConceptShort, msConceptTask } from '@/i18n/ru/ms';
import { cuSession as cs } from '@/i18n/ru/curriculum';
import { ss } from '@/i18n/ru/session';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { keepSingleLevel, lvStrongestAnswer, swMarkAnswer } from '../session/adapters';
import { AnswerList } from '../session/AnswerParts';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { msToolGroups, paLevelGroups } from '../session/toolGroups';
import type { LvReactionPayload, LvStrongestPayload, LvZonePayload, SwMarkPayload, SwTrendPayload, TaskEnvelope, TaskPayload } from '../session/types';
import { useChartInteraction } from '../session/useChartInteraction';
import { CurShell } from './CurShell';
import { zoneMarkOf } from './marks';

interface P<T extends TaskPayload> {
  envelope: TaskEnvelope<T>;
  flow: FlowState;
  base: SessionBase;
}
const LEAD_IN = 12;
const keepLastZone = (next: Mark[]): Mark[] => {
  const zones = next.filter((m) => m.kind === 'zone');
  const last = zones[zones.length - 1];
  return next.filter((m) => m.kind !== 'zone' || m === last);
};

export function SwMarkBody({ envelope, flow, base }: P<SwMarkPayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('select');
  const groups = useMemo(() => msToolGroups(p.tools), [p.tools]);
  const concepts = p.concepts as SkillId[];
  const windowBars = p.windowCandles ?? Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1;
  const names = concepts.map((c) => msConceptShort[c]).filter((x): x is string => !!x);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}` : (names[0] ?? '');
  const details = (
    <>
      <ul className="space-y-2">
        {concepts.map((c) => {
          const t = msConceptTask[c];
          return t ? (
            <li key={c}>
              <p className="text-text-1"><Annotated text={t.task} /></p>
              <p><Annotated text={t.term} /></p>
            </li>
          ) : null;
        })}
      </ul>
      <p>{cs.details['sw-mark']}</p>
      <p data-testid="window-note">{ss.windowNote(windowBars, formatDateTimeRu(p.window.fromTime))}</p>
    </>
  );
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      groups={groups}
      hintText={cs.hints['sw-mark'](list, p.requiredCount)}
      details={details}
      bars={windowBars + LEAD_IN}
      highlightRange={p.window}
      buildAnswer={() => (ci.marks.length === 0 ? ss.input.noMarks : swMarkAnswer(ci.marks))}
    />
  );
}

export function SwTrendBody({ envelope, flow, base }: P<SwTrendPayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('select');
  const [optionId, setOptionId] = useState<string | null>(null);
  const options = useMemo(() => p.options.map((o) => ({ id: o, label: cs.options[o] })), [p.options]);
  const windowBars = Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1;
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      hintText={cs.hints['sw-trend']}
      details={<p>{cs.details['sw-trend']}</p>}
      bars={windowBars + LEAD_IN}
      highlightRange={p.window}
      {...(p.hints ? { preMarks: p.hints } : {})}
      form={<AnswerList label={cs.optionsGroup} options={options} value={optionId} onChange={setOptionId} disabled={flow.phase === 'grading'} />}
      buildAnswer={() => (optionId ? { kind: 'sw-trend', questionId: p.questionId, optionId: optionId as 'up' | 'down' | 'range' } : ss.input.noAnswer)}
      resultExtra={(r) => {
        const d = r.detail;
        if (d.kind !== 'sw-trend') return null;
        return (
          <ul data-testid="trend-detail" className="space-y-1">
            <li className="flex items-start gap-2">
              <GradeGlyph kind={d.chosen === d.correct ? 'match' : 'extra'} />
              <span>{cs.trendDetail.chosen(cs.options[d.chosen as 'up'] ?? d.chosen)}</span>
            </li>
            {d.chosen !== d.correct && (
              <li className="flex items-start gap-2">
                <GradeGlyph kind="match" />
                <span>{cs.trendDetail.correct(cs.options[d.correct as 'up'] ?? d.correct)}</span>
              </li>
            )}
          </ul>
        );
      }}
    />
  );
}

const roleKey = (r: 'support' | 'resistance' | null) => (r ?? 'any') as 'support' | 'resistance' | 'any';

export function LvStrongestBody({ envelope, flow, base }: P<LvStrongestPayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('level', keepSingleLevel);
  const groups = useMemo(() => paLevelGroups(), []);
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      groups={groups}
      hintText={cs.hints[`lv-strongest-${roleKey(p.role)}`]}
      details={<p>{cs.details['lv-strongest']}</p>}
      bars={120}
      {...(p.hints ? { preMarks: p.hints } : {})}
      buildAnswer={() => lvStrongestAnswer(ci.marks) ?? cs.input.noLevel}
      resultExtra={(r) => {
        const d = r.detail as { kind: string; userPrice?: number; reference?: { bottom: number; top: number; touches: number; strength: number }; deviationPct?: number };
        if (d.kind !== 'lv-strongest' || !d.reference || d.userPrice === undefined) return null;
        return (
          <ul data-testid="level-detail" className="tnum space-y-1">
            <li>{cs.levelDetail.yours(fmt(d.userPrice))}</li>
            <li>{cs.levelDetail.reference(fmt(d.reference.bottom), fmt(d.reference.top), d.reference.touches, d.reference.strength)}</li>
          </ul>
        );
      }}
    />
  );
}

export function LvZoneBody({ envelope, flow, base }: P<LvZonePayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('zone', keepLastZone);
  const groups = useMemo(() => msToolGroups(['zone']), []);
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      groups={groups}
      hintText={cs.hints[`lv-zone-${roleKey(p.role)}`]}
      details={<p>{cs.details['lv-zone']}</p>}
      bars={120}
      {...(p.hints ? { preMarks: p.hints } : {})}
      buildAnswer={() => {
        const z = ci.marks.filter((m) => m.kind === 'zone').pop();
        return z ? { kind: 'lv-zone', zone: z as never } : cs.input.noZone;
      }}
      resultExtra={(r) => {
        const d = r.detail as { kind: string; user?: { bottom: number; top: number }; reference?: { bottom: number; top: number; touches: number } };
        if (d.kind !== 'lv-zone' || !d.user || !d.reference) return null;
        return (
          <ul data-testid="zone-detail" className="tnum space-y-1">
            <li>{cs.zoneDetail.yours(fmt(d.user.bottom), fmt(d.user.top))}</li>
            <li>{cs.zoneDetail.reference(fmt(d.reference.bottom), fmt(d.reference.top), d.reference.touches)}</li>
          </ul>
        );
      }}
    />
  );
}

export function LvReactionBody({ envelope, flow, base }: P<LvReactionPayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('select');
  const [optionId, setOptionId] = useState<string | null>(null);
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  const candles = envelope.series[p.tf] ?? [];
  const t0 = candles[Math.max(0, candles.length - 60)]?.openTime ?? 0;
  const pre = useMemo(() => p.options.map((o) => zoneMarkOf(o, t0, `opt:${o.id}`)), [p.options, t0]);
  const options = useMemo(
    () => [
      ...p.options.map((o) => ({ id: o.id, label: cs.reactionOption(o.id, fmt(o.bottom), fmt(o.top), o.touches, o.strength) })),
      ...(p.allowNone ? [{ id: 'none', label: cs.reactionNone }] : []),
    ],
    [p.options, p.allowNone, fmt],
  );
  const visuals = useCallback(
    (r: import('../session/types').GradeResultDto) => {
      const rep = r.replay;
      const c = rep && rep.exitIndex !== null ? rep.candles[rep.exitIndex] : undefined;
      const correct = (r.detail as { correct?: string }).correct;
      return c ? { highlights: [{ time: c.openTime, tone: 'ref' as const, label: correct === 'none' ? cs.replay.broken : cs.replay.reaction }] } : {};
    },
    [],
  );
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      hintText={cs.hints[p.side === 'LONG' ? 'lv-reaction-long' : 'lv-reaction-short']}
      details={<p>{cs.details['lv-reaction']}</p>}
      bars={90}
      preMarks={pre}
      form={<AnswerList label={cs.reactionGroup} options={options} value={optionId} onChange={setOptionId} disabled={flow.phase === 'grading'} />}
      submitLabel={ss.checkAnswer}
      buildAnswer={() => (optionId ? { kind: 'lv-reaction', optionId } : cs.input.noAnswer)}
      visuals={visuals}
    />
  );
}
