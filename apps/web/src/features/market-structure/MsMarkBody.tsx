'use client';
import { useMemo } from 'react';
import { TIMEFRAME_MS, type SkillId } from '@tl/core';
import { formatWhen } from '@/features/terminal/markText';
import { msConceptTask, msReference } from '@/i18n/ru/ms';
import { ss } from '@/i18n/ru/session';
import { msMarkAnswer } from '../session/adapters';
import { MarkSession } from '../session/MarkSession';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import { msToolGroups } from '../session/toolGroups';
import type { MsMarkPayload, TaskEnvelope } from '../session/types';

const LEAD_IN = 12;

/** MS «Разметка»: инструменты ограничены понятиями задания, окно оценки - последние W свечей. */
export function MsMarkBody({ envelope, flow, base }: { envelope: TaskEnvelope<MsMarkPayload>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const candles = envelope.series[p.tf] ?? [];
  const groups = useMemo(() => msToolGroups(p.tools), [p.tools]);
  const concepts = p.concepts as SkillId[];
  const windowBars = Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1;
  const names = concepts.map((c) => msConceptTask[c]?.name).filter(Boolean).join(', ');
  const details = (
    <>
      <ul className="space-y-2">
        {concepts.map((c) => {
          const t = msConceptTask[c];
          return t ? (
            <li key={c}>
              <p className="text-text-1">{t.task}</p>
              <p>{t.term}</p>
            </li>
          ) : null;
        })}
      </ul>
      <p>{msReference(p.referenceKey)}</p>
      <p data-testid="window-note">{ss.windowNote(windowBars, formatWhen(p.window.fromTime))}</p>
    </>
  );
  return (
    <MarkSession
      envelope={envelope}
      flow={flow}
      base={base}
      groups={groups}
      initialTool="select"
      hintText={`Отметьте на графике: ${names}.`}
      hintDetails={details}
      candles={candles}
      bars={windowBars + LEAD_IN}
      buildAnswer={(marks) => (marks.length === 0 ? ss.input.noMarks : msMarkAnswer(marks))}
    />
  );
}
