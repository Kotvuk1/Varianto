'use client';
import { useMemo } from 'react';
import { formatPercentValue } from '@/i18n/format';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { GradeGlyph } from '@/features/feedback';
import { keepSingleLevel, paLevelAnswer } from '../session/adapters';
import { MarkSession } from '../session/MarkSession';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { paLevelGroups } from '../session/toolGroups';
import type { PaLevelPayload, TaskEnvelope } from '../session/types';

/** PA «Проведи уровень»: один горизонтальный уровень, допуск около 0.3%. */
export function PaLevelBody({ envelope, flow, base }: { envelope: TaskEnvelope<PaLevelPayload>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const groups = useMemo(() => paLevelGroups(), []);
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(envelope.symbol)), [envelope.symbol]);
  const result = flow.phase === 'graded' ? flow.result : null;
  const d = result?.detail;
  const extra =
    d && d.kind === 'pa-level' ? (
      <ul data-testid="level-detail" className="tnum mb-2 space-y-1 text-sm">
        <li className="flex items-start gap-2">
          <GradeGlyph kind={result!.verdict === 'correct' ? 'match' : 'extra'} />
          <span>{paTx.level.yours(fmt(d.userPrice))}</span>
        </li>
        <li className="flex items-start gap-2">
          <GradeGlyph kind="info" />
          <span>{paTx.level.reference(fmt(d.referencePrice), formatPercentValue(d.deviationPct), formatPercentValue(d.tolerancePct))}</span>
        </li>
      </ul>
    ) : null;
  return (
    <MarkSession
      envelope={envelope}
      flow={flow}
      base={base}
      groups={groups}
      initialTool="level"
      transform={keepSingleLevel}
      hintText={paTx.level[p.levelType]}
      hintDetails={<p>{paTx.level.details}</p>}
      candles={envelope.series[p.tf] ?? []}
      bars={120}
      buildAnswer={(marks) => paLevelAnswer(marks) ?? ss.input.noLevel}
      resultExtra={() => extra}
    />
  );
}
