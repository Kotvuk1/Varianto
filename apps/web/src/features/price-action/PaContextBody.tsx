'use client';
import type { TaskTimeframe } from '@tl/core';
import { useMemo, useState } from 'react';
import { GradeGlyph } from '@/features/feedback';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { Segmented } from '@/ui';
import { paContextAnswer, type ContextFactors } from '../session/adapters';
import { AnswerSession } from '../session/AnswerSession';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import type { PaContextPayload, TaskEnvelope } from '../session/types';

const HTF: Record<TaskTimeframe, TaskTimeframe> = { '15m': '1h', '1h': '4h', '4h': '1d', '1d': '1d' };
type YN = 'yes' | 'no';
const yn = [
  { value: 'yes' as YN, label: paTx.context.yes },
  { value: 'no' as YN, label: paTx.context.no },
];

function Row({ label, children, id }: { label: string; children: React.ReactNode; id: string }) {
  return (
    <div className="px-3 py-1.5" data-testid={`ctx-${id}`}>
      <p className="mb-1 text-sm">{label}</p>
      {children}
    </div>
  );
}

/** PA «Контекст»: модель подсвечена; ответы - sweep / OB / уровень / старший тренд + значимость (ALGORITHMS §11). */
export function PaContextBody({ envelope, flow, base }: { envelope: TaskEnvelope<PaContextPayload>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const htf = HTF[p.tf];
  const [view, setView] = useState<'base' | 'htf'>('base');
  const [sweep, setSweep] = useState<YN | null>(null);
  const [ob, setOb] = useState<YN | null>(null);
  const [lvl, setLvl] = useState<YN | null>(null);
  const [trend, setTrend] = useState<ContextFactors['htfTrend'] | null>(null);
  const [sig, setSig] = useState<YN | null>(null);
  const busy = flow.phase === 'grading';
  const name = paTx.patterns[(p.pattern.meta?.patternType as keyof typeof paTx.patterns) ?? 'engulfing']?.name ?? '';
  const dir = p.pattern.direction === 'bear' ? paTx.context.dirBear : paTx.context.dirBull;
  const tf = view === 'htf' ? htf : p.tf;
  const candles = envelope.series[tf] ?? envelope.series[p.tf] ?? [];
  const highlight = useMemo(() => [p.pattern], [p.pattern]);

  const form = (
    <div role="group" aria-label={paTx.context.groupLabel} aria-disabled={busy || undefined}>
      <Row id="sweep" label={paTx.context.sweep}>
        <Segmented label={paTx.context.sweep} options={yn} value={sweep ?? ('' as YN)} onChange={setSweep} />
      </Row>
      <Row id="ob" label={paTx.context.orderBlock}>
        <Segmented label={paTx.context.orderBlock} options={yn} value={ob ?? ('' as YN)} onChange={setOb} />
      </Row>
      <Row id="level" label={paTx.context.keyLevel}>
        <Segmented label={paTx.context.keyLevel} options={yn} value={lvl ?? ('' as YN)} onChange={setLvl} />
      </Row>
      <Row id="trend" label={paTx.context.htfTrend(TF_LABEL[htf])}>
        <Segmented
          label={paTx.context.htfTrend(TF_LABEL[htf])}
          options={(['up', 'down', 'range'] as const).map((v) => ({ value: v, label: paTx.context.trend[v] }))}
          value={trend ?? ('' as 'up')}
          onChange={setTrend}
        />
      </Row>
      <Row id="significant" label={paTx.context.significant}>
        <Segmented label={paTx.context.significant} options={yn} value={sig ?? ('' as YN)} onChange={setSig} />
      </Row>
    </div>
  );

  const result = flow.phase === 'graded' ? flow.result : null;
  const d = result?.detail;
  const extra =
    d && d.kind === 'pa-context' ? (
      <table data-testid="context-detail" className="mb-2 w-full text-sm">
        <thead>
          <tr className="text-left text-text-2">
            <th className="py-1 font-medium">Фактор</th>
            <th className="font-medium">Ваш ответ</th>
            <th className="font-medium">Эталон</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ['sweep', 'Sweep'],
              ['orderBlock', 'Order Block'],
              ['keyLevel', 'Уровень'],
              ['htfTrend', 'Старший тренд'],
              ['significant', 'Значима'],
            ] as const
          ).map(([k, label]) => {
            const g = d.given[k];
            const e = d.expected[k];
            const fmt = (v: unknown) => (v === true ? paTx.context.yes : v === false ? paTx.context.no : (paTx.context.trend as Record<string, string>)[String(v)] ?? String(v));
            return (
              <tr key={k} className="border-t border-border">
                <td className="py-1">{label}</td>
                <td>
                  <span className="inline-flex items-center gap-1">
                    <GradeGlyph kind={g === e ? 'match' : 'extra'} size={16} />
                    {fmt(g)}
                  </span>
                </td>
                <td>{fmt(e)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : null;

  const toggle =
    htf !== p.tf ? (
      <div className="w-full py-1">
        <Segmented
          label={paTx.context.viewLabel}
          options={[
            { value: 'base', label: paTx.context.viewBase(TF_LABEL[p.tf]) },
            { value: 'htf', label: paTx.context.viewHtf(TF_LABEL[htf]) },
          ]}
          value={view}
          onChange={setView}
        />
      </div>
    ) : undefined;

  return (
    <AnswerSession
      envelope={envelope}
      flow={flow}
      base={base}
      chartTf={tf}
      candles={candles}
      bars={view === 'htf' ? 40 : 70}
      hintText={paTx.context.task(name, dir)}
      hintDetails={
        <>
          <p>{paTx.context.taskShort}</p>
          <p>{paTx.context.significanceHelp}</p>
        </>
      }
      highlight={highlight}
      chartControls={toggle}
      form={form}
      buildAnswer={() =>
        sweep && ob && lvl && trend && sig
          ? paContextAnswer({ sweep: sweep === 'yes', orderBlock: ob === 'yes', keyLevel: lvl === 'yes', htfTrend: trend }, sig === 'yes')
          : ss.input.noContext
      }
      resultExtra={extra}
    />
  );
}
