'use client';
import { useCallback, useMemo, useState } from 'react';
import { TIMEFRAME_MS, type Mark, type PatternType } from '@tl/core';
import { formatDateTimeRu } from '@/i18n/ru/ms';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { Segmented } from '@/ui';
import { impliedDirection, paFindAnswer, toPatternMarks } from '../session/adapters';
import { MarkSession } from '../session/MarkSession';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { PATTERN_TAP_TOOL, paFindGroups } from '../session/toolGroups';
import type { PaFindPayload, TaskEnvelope } from '../session/types';

/** PA «Найди модель»: касание свечи (инструмент «Модель») отмечает модель из задания. */
export function PaFindBody({ envelope, flow, base }: { envelope: TaskEnvelope<PaFindPayload>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const target = p.target as PatternType;
  const info = paTx.patterns[target];
  const [dir, setDir] = useState<'bull' | 'bear'>('bull');
  const groups = useMemo(() => paFindGroups(), []);
  const transform = useCallback((next: Mark[]) => toPatternMarks(next, target, p.tf), [target, p.tf]);
  const n = Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1;
  const candles = envelope.series[p.tf] ?? [];
  const choice = impliedDirection(target) === 'choice';
  const picker = choice ? (
    <div className="px-3 py-2">
      <p className="mb-1 text-sm text-text-2">{paTx.find.direction}</p>
      <Segmented
        label={paTx.find.direction}
        options={[
          { value: 'bull', label: paTx.find.bull },
          { value: 'bear', label: paTx.find.bear },
        ]}
        value={dir}
        onChange={setDir}
      />
    </div>
  ) : null;
  return (
    <MarkSession
      envelope={envelope}
      flow={flow}
      base={base}
      groups={groups}
      initialTool={PATTERN_TAP_TOOL}
      transform={transform}
      hintText={paTx.find.task(info.name)}
      hintDetails={
        <>
          <p>{info.hint}</p>
          <p>{paTx.find.window(n, formatDateTimeRu(p.window.fromTime))}</p>
          {choice && <p>{paTx.find.directionHelp}</p>}
        </>
      }
      extraControls={picker}
      candles={candles}
      highlightRange={p.window}
      bars={n + 12}
      buildAnswer={(marks) => (marks.some((m) => m.kind === 'pattern') ? paFindAnswer(marks, target, dir) : ss.input.noPattern)}
    />
  );
}
