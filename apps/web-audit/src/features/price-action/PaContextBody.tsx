'use client';
import type { TaskTimeframe } from '@tl/core';
import { useMemo, useState } from 'react';
import { GradeGlyph } from '@/features/feedback';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { Button, Segmented } from '@/ui';
import { SubmitButton } from '../session/AnswerParts';
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
  const [step, setStep] = useState(0);
  const busy = flow.phase === 'grading';
  const name = paTx.patterns[(p.pattern.meta?.patternType as keyof typeof paTx.patterns) ?? 'engulfing']?.name ?? '';
  const dir = p.pattern.direction === 'bear' ? paTx.context.dirBear : paTx.context.dirBull;
  const tf = view === 'htf' ? htf : p.tf;
  const candles = envelope.series[tf] ?? envelope.series[p.tf] ?? [];
  const highlight = useMemo(() => [p.pattern], [p.pattern]);

  const fields: { id: string; label: string; options: { value: string; label: string }[]; value: string | null; set: (v: string) => void }[] = [
    { id: 'sweep', label: paTx.context.sweep, options: yn, value: sweep, set: (v) => setSweep(v as YN) },
    { id: 'ob', label: paTx.context.orderBlock, options: yn, value: ob, set: (v) => setOb(v as YN) },
    { id: 'level', label: paTx.context.keyLevel, options: yn, value: lvl, set: (v) => setLvl(v as YN) },
    {
      id: 'trend',
      label: paTx.context.htfTrend(TF_LABEL[htf]),
      options: (['up', 'down', 'range'] as const).map((v) => ({ value: v, label: paTx.context.trend[v] })),
      value: trend,
      set: (v) => setTrend(v as ContextFactors['htfTrend']),
    },
    { id: 'significant', label: paTx.context.significant, options: yn, value: sig, set: (v) => setSig(v as YN) },
  ];
  const field = (f: (typeof fields)[number]) => (
    <Row key={f.id} id={f.id} label={f.label}>
      <Segmented label={f.label} options={f.options} value={f.value ?? ''} onChange={f.set} />
    </Row>
  );
  const form = (
    <div role="group" aria-label={paTx.context.groupLabel} aria-disabled={busy || undefined}>
      {fields.map(field)}
    </div>
  );
  const cur = fields[step]!;
  const last = step === fields.length - 1;
  const stepper = (ctx: { submit: () => void; busy: boolean; status: React.ReactNode }) => (
    <div data-testid="answer-panel" className="shrink-0 border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]">
      <div role="group" aria-label={paTx.context.groupLabel}>
        {field(cur)}
      </div>
      {ctx.status}
      <div className="flex items-center gap-2 px-3 pb-3">
        <Button variant="ghost" size="lg" disabled={step === 0} onClick={() => setStep(step - 1)} data-testid="step-prev">
          {ss.prevStep}
        </Button>
        <span data-testid="step-counter" className="tnum min-w-10 text-center text-sm text-text-2">
          {ss.stepCounter(step + 1, fields.length)}
        </span>
        {last ? (
          <SubmitButton onClick={ctx.submit} busy={ctx.busy} label={ss.checkAnswer} className="flex-1" />
        ) : (
          <Button variant="primary" size="lg" className="flex-1" disabled={cur.value === null} onClick={() => setStep(step + 1)} data-testid="step-next">
            {ss.nextStep}
          </Button>
        )}
      </div>
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
      mobileBottom={stepper}
      buildAnswer={() =>
        sweep && ob && lvl && trend && sig
          ? paContextAnswer({ sweep: sweep === 'yes', orderBlock: ob === 'yes', keyLevel: lvl === 'yes', htfTrend: trend }, sig === 'yes')
          : ss.input.noContext
      }
      resultExtra={extra}
    />
  );
}
