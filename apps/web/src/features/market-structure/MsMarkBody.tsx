'use client';
import { useMemo } from 'react';
import { TIMEFRAME_MS, type SkillId } from '@tl/core';
import { formatDateTimeRu, msConceptTask, msFocusTask, msReference } from '@/i18n/ru/ms';
import { ss } from '@/i18n/ru/session';
import { Annotated } from '@/features/guide';
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
  // focus - явный набор проверяемых понятий; без него (старый payload) - concepts. Инструменты только по focus.
  const concepts = useMemo(() => (p.focus?.length ? p.focus : p.concepts) as SkillId[], [p.focus, p.concepts]);
  // Инструменты - все понятия задания (база + focus): база тоже оценивается, без неё (например, при focus=internal-external) рисовать нечем.
  const groups = useMemo(() => msToolGroups(p.tools), [p.tools]);
  const windowBars = p.windowCandles ?? Math.round((p.window.toTime - p.window.fromTime) / TIMEFRAME_MS[p.tf]) + 1;
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
      <p><Annotated text={msReference(p.referenceKey)} /></p>
      <p data-testid="window-note">{ss.windowNote(windowBars, formatDateTimeRu(p.window.fromTime))}</p>
    </>
  );
  return (
    <MarkSession
      envelope={envelope}
      flow={flow}
      base={base}
      groups={groups}
      initialTool="select"
      hintText={msFocusTask(concepts, p.requiredCount)}
      hintDetails={details}
      candles={candles}
      highlightRange={p.window}
      allowScope={p.scoped === true}
      bars={windowBars + LEAD_IN}
      buildAnswer={(marks) => (marks.length === 0 ? ss.input.noMarks : msMarkAnswer(marks))}
    />
  );
}
