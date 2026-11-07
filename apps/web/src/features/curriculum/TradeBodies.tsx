'use client';
// Тела заданий ступеней 3-4 и комбо: лимитка, стоп/тейк, полная сделка. Будущее проигрывается после «Проверить».
import { useCallback, useMemo, useState } from 'react';
import type { Candle, LimitType, Mark } from '@tl/core';
import { replayMarkers, type ReplayMarker } from '@/chart/replay/markers';
import type { CandleHighlight } from '@/chart/TradingChart';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { cuSession as cs } from '@/i18n/ru/curriculum';
import { isLimitMark, limitPrice } from '@/chart/zone/model';
import { formatR } from '@/i18n/format';
import { formatRR, roundToTick } from '../challenge/position';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { msToolGroups } from '../session/toolGroups';
import type { Answer, ComboPayload, GradeResultDto, LimitEntryPayload, QualityPartDto, StopTakePayload, TaskEnvelope, TaskPayload, TradeSide } from '../session/types';
import { useChartInteraction } from '../session/useChartInteraction';
import { CurShell, type ResultVisuals } from './CurShell';
import { POS_ID, defaultSlTp, fullScoreBand, planIssue, positionOf, sideOfZone, structurePoint, zoneInfoMarkOf } from './marks';
import { LimitForm, PartsSummary } from './TradeForm';

interface P<T extends TaskPayload> {
  envelope: TaskEnvelope<T>;
  flow: FlowState;
  base: SessionBase;
}

const lastClosed = (cs_: readonly Candle[]): Candle => [...cs_].reverse().find((c) => c.closed !== false) ?? cs_[cs_.length - 1]!;
const issueText = { 'limit-side': cs.input.limitSide, 'sl-side': cs.input.slSide, 'tp-side': cs.input.tpSide } as const;
const detailOf = (r: GradeResultDto) => r.detail as unknown as {
  quality?: number;
  parts?: QualityPartDto[];
  stopHunted?: boolean;
  limit?: { price: number };
  outcome?: { kind?: string; result?: string; rMultiple?: number };
};

function outcomeKind(r: GradeResultDto): string | null {
  const o = detailOf(r).outcome;
  return o ? (o.kind ?? o.result ?? null) : null;
}

/** Метка выхода из сделки на свече выхода. */
function exitHighlight(r: GradeResultDto): CandleHighlight[] {
  const rep = r.replay;
  const k = outcomeKind(r);
  const c = rep && rep.exitIndex !== null ? rep.candles[rep.exitIndex] : undefined;
  if (!c || (k !== 'tp' && k !== 'sl' && k !== 'timeout')) return [];
  return [{ time: c.openTime, tone: 'ref', label: cs.replay[k] }];
}

function tradeExtra(r: GradeResultDto) {
  const d = detailOf(r);
  const o = d.outcome;
  const k = outcomeKind(r);
  return (
    <>
      {d.parts && d.quality !== undefined && <PartsSummary parts={d.parts} quality={d.quality} />}
      {o && k && (k === 'tp' || k === 'sl' || k === 'timeout') && typeof o.rMultiple === 'number' && (
        <p data-testid="cur-outcome" className="tnum">
          {cs.outcomeLine(cs.replay[k], formatR(o.rMultiple))}
        </p>
      )}
    </>
  );
}

// ------------------------------------------------------------------ ступень 3

export function LimitEntryBody({ envelope, flow, base }: P<LimitEntryPayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('limit');
  const groups = useMemo(() => msToolGroups(['limit']), []);
  const [limit, setLimit] = useState<number | null>(null);
  const [type, setType] = useState<LimitType | null>(null);
  const [frontK, setFrontK] = useState<number | null>(null);
  const last = lastClosed(envelope.series[p.tf] ?? []);
  const pre = useMemo<Mark[]>(() => [zoneInfoMarkOf(p.zone), ...(p.hints ?? [])], [p.zone, p.hints]);
  const visuals = useCallback(
    (r: GradeResultDto): ResultVisuals => {
      const rep = r.replay;
      const price = detailOf(r).limit?.price ?? limit;
      return {
        guideBand: fullScoreBand(p.zone, p.side, p.atr),
        ...(rep && price !== null ? { replayMarkers: replayMarkers({ candles: rep.candles, fillIndex: rep.fillIndex ?? null, limitPrice: price, exitIndex: rep.exitIndex }) } : {}),
      };
    },
    [p, limit],
  );
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      groups={groups}
      hintText={cs.hints[p.side === 'LONG' ? 'limit-entry-long' : 'limit-entry-short']}
      details={<p>{cs.details['limit-entry']}</p>}
      bars={100}
      preMarks={pre}
      onLimitChange={setLimit}
      form={<LimitForm type={type} onType={setType} frontK={frontK} onFrontK={setFrontK} range={p.frontK} disabled={flow.phase === 'grading'} />}
      visuals={visuals}
      resultExtra={tradeExtra}
      buildAnswer={() => {
        const price = limitPrice(ci.marks);
        if (price === null) return cs.input.noLimit;
        if (p.side === 'LONG' ? price >= last.close : price <= last.close) return cs.input.limitSide;
        if (!type) return cs.input.noType;
        if (type === 'front-run' && frontK === null) return cs.input.noFront;
        return { kind: 'limit-entry', limit: { price, type, frontK: type === 'front-run' ? frontK : null } } as Answer;
      }}
    />
  );
}

// ------------------------------------------------------------------ ступень 4

export function StopTakeBody({ envelope, flow, base }: P<StopTakePayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('select');
  const candles = envelope.series[p.tf] ?? [];
  const last = candles[candles.length - 1]!;
  const tick = tickSizeFor(envelope.symbol);
  const init = useMemo(() => {
    const d = defaultSlTp(p.side, p.entry.price, p.atr);
    return { sl: roundToTick(d.sl, tick), tp: roundToTick(d.tp, tick) };
  }, [p, tick]);
  const [sl, setSl] = useState(init.sl);
  const [tp, setTp] = useState(init.tp);
  const locked = flow.phase !== 'ready';
  const position = useMemo(() => [positionOf(last.openTime, p.entry.price, sl, tp)], [last.openTime, p.entry.price, sl, tp]);
  const onMarks = useCallback((marks: Mark[]) => {
    const m = marks.find((x) => x.id === POS_ID);
    if (m && m.anchors.length === 3) {
      setSl(m.anchors[1]!.price);
      setTp(m.anchors[2]!.price);
    }
  }, []);
  const fmt = useMemo(() => makePriceFormatter(tick), [tick]);
  const pre = useMemo<Mark[]>(() => [zoneInfoMarkOf(p.zone), ...(p.hints ?? [])], [p.zone, p.hints]);
  const rr = Math.abs(p.entry.price - sl) > 0 ? formatRR(Math.abs(tp - p.entry.price) / Math.abs(p.entry.price - sl)) : null;
  const visuals = useCallback(
    (r: GradeResultDto): ResultVisuals => {
      const rep = r.replay;
      const hunt: ReplayMarker[] = [];
      if (detailOf(r).stopHunted && rep && rep.exitIndex !== null) {
        const c = rep.candles[rep.exitIndex];
        if (c) hunt.push({ kind: 'stop-hunt', time: c.openTime, price: sl });
      }
      return { highlights: exitHighlight(r), replayMarkers: hunt };
    },
    [sl],
  );
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      hintText={cs.hints['stop-take'](p.side)}
      details={<p>{cs.details['stop-take']}</p>}
      bars={90}
      preMarks={pre}
      chartMarks={position}
      onChartMarks={onMarks}
      selectedId={locked ? null : POS_ID}
      {...(envelope.difficulty !== 'hard' ? { slHint: { structure: structurePoint(p.zone, p.side, last), atr: p.atr } } : {})}
      form={<p data-testid="plan-line" className="tnum px-3 pt-2 text-xs text-text-2 lg:px-0 lg:pt-0">{cs.planLine(null, fmt(sl), fmt(tp), rr)}</p>}
      visuals={visuals}
      resultExtra={tradeExtra}
      buildAnswer={() => {
        const closeP = lastClosed(candles).close;
        const long = p.side === 'LONG';
        const issue = planIssue(p.side, closeP, null, long ? Math.min(p.entry.price, closeP) : Math.max(p.entry.price, closeP), long ? Math.max(p.entry.price, closeP) : Math.min(p.entry.price, closeP), sl, tp);
        return issue ? issueText[issue] : { kind: 'stop-take', sl, tp };
      }}
    />
  );
}

// ------------------------------------------------------------------ комбо

const keepLastZone = (next: Mark[]): Mark[] => {
  const zones = next.filter((m) => m.kind === 'zone');
  const lastZone = zones[zones.length - 1];
  return next.filter((m) => m.kind !== 'zone' || m === lastZone);
};

export function ComboBody({ envelope, flow, base }: P<ComboPayload>) {
  const p = envelope.payload;
  const ci = useChartInteraction('zone', keepLastZone);
  const groups = useMemo(() => msToolGroups(['zone', 'limit']), []);
  const candles = envelope.series[p.tf] ?? [];
  const lastC = candles[candles.length - 1]!;
  const closeP = lastClosed(candles).close;
  const tick = tickSizeFor(envelope.symbol);
  const fmt = useMemo(() => makePriceFormatter(tick), [tick]);
  const [limit, setLimit] = useState<number | null>(null);
  const [type, setType] = useState<LimitType | null>(null);
  const [frontK, setFrontK] = useState<number | null>(null);
  const [slTp, setSlTp] = useState<{ sl: number; tp: number } | null>(null);
  const zone = ci.marks.filter((m) => m.kind === 'zone').pop();
  const side: TradeSide | null = p.side ?? (zone ? sideOfZone({ top: Math.max(...zone.anchors.map((a) => a.price)), bottom: Math.min(...zone.anchors.map((a) => a.price)) }, closeP) : null);
  const eff = slTp ?? (limit !== null && side ? (() => {
    const d = defaultSlTp(side, limit, p.atr);
    return { sl: roundToTick(d.sl, tick), tp: roundToTick(d.tp, tick) };
  })() : null);
  const position = limit !== null && eff ? positionOf(lastC.openTime, limit, eff.sl, eff.tp) : null;
  const chartMarks = useMemo(() => (position ? [...ci.marks, position] : ci.marks), [ci.marks, position]);
  const onMarks = (marks: Mark[]) => {
    const m = marks.find((x) => x.id === POS_ID);
    if (m && m.anchors.length === 3) setSlTp({ sl: m.anchors[1]!.price, tp: m.anchors[2]!.price });
    ci.setMarks(marks.filter((x) => x.id !== POS_ID));
  };
  const rr = limit !== null && eff && Math.abs(limit - eff.sl) > 0 ? formatRR(Math.abs(eff.tp - limit) / Math.abs(limit - eff.sl)) : null;
  const visuals = useCallback(
    (r: GradeResultDto): ResultVisuals => {
      const rep = r.replay;
      const price = limit ?? detailOf(r).limit?.price;
      const out: ResultVisuals = { highlights: exitHighlight(r) };
      if (rep && price !== undefined && price !== null) {
        const hunted = detailOf(r).stopHunted === true && rep.exitIndex !== null && eff;
        out.replayMarkers = replayMarkers({
          candles: rep.candles,
          fillIndex: rep.fillIndex ?? null,
          limitPrice: price,
          exitIndex: rep.exitIndex,
          ...(hunted && eff ? { stopHunt: { index: rep.exitIndex!, sl: eff.sl } } : {}),
        });
      }
      return out;
    },
    [limit, eff],
  );
  const smc = p.kind === 'combo-smc-entry';
  return (
    <CurShell
      envelope={envelope as never}
      flow={flow}
      base={base}
      ci={ci}
      groups={groups}
      hintText={smc ? cs.hints['combo-smc'](p.side ?? 'LONG') : cs.hints['combo-level'](p.side)}
      details={<p>{cs.details.combo}</p>}
      bars={100}
      {...(p.hints ? { preMarks: p.hints } : {})}
      chartMarks={chartMarks}
      onChartMarks={onMarks}
      selectedId={ci.selectedId ?? (ci.tool === 'select' && position && flow.phase === 'ready' ? POS_ID : null)}
      onLimitChange={setLimit}
      form={
        <LimitForm
          type={type}
          onType={setType}
          frontK={frontK}
          onFrontK={setFrontK}
          range={p.frontK}
          disabled={flow.phase === 'grading'}
          plan={{ limit: limit !== null ? fmt(limit) : null, sl: eff ? fmt(eff.sl) : null, tp: eff ? fmt(eff.tp) : null, rr }}
        />
      }
      visuals={visuals}
      resultExtra={tradeExtra}
      buildAnswer={() => {
        if (!zone) return cs.input.noZone;
        const price = ci.marks.find(isLimitMark)?.anchors[0]?.price ?? null;
        if (price === null || !eff || !side) return cs.input.noLimit;
        const issue = planIssue(side, closeP, price, price, price, eff.sl, eff.tp);
        if (issue) return issueText[issue];
        if (!type) return cs.input.noType;
        if (type === 'front-run' && frontK === null) return cs.input.noFront;
        return {
          kind: p.kind,
          zone: { ...zone, author: 'user' } as never,
          limit: { price, type, frontK: type === 'front-run' ? frontK : null },
          sl: eff.sl,
          tp: eff.tp,
        } as Answer;
      }}
    />
  );
}
