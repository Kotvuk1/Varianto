'use client';
import { useMemo, useState } from 'react';
import type { Mark } from '@tl/core';
import { GradeGlyph } from '@/features/feedback';
import { msQuestionText, msTx } from '@/i18n/ru/ms';
import { ss } from '@/i18n/ru/session';
import { msQuestionAnswer } from '../session/adapters';
import { AnswerList } from '../session/AnswerParts';
import { AnswerSession } from '../session/AnswerSession';
import type { SessionBase } from '../session/TaskSession';
import type { FlowState } from '../session/taskFlow';
import type { MsQuestionPayload, TaskEnvelope } from '../session/types';

/** Подсветка места вопроса: одна точка - горизонталь от свечи, две - линия от swing к свече. */
export function highlightMarks(highlight: MsQuestionPayload['highlight']): Mark[] {
  if (!highlight?.length) return [];
  const base = { scope: null, direction: null, author: 'algo' as const };
  if (highlight.length >= 2) {
    const [a, b] = [highlight[0]!, highlight[highlight.length - 1]!];
    return [{ ...base, id: 'highlight', kind: 'trendline', anchors: [a, b] }];
  }
  return [{ ...base, id: 'highlight', kind: 'hline', anchors: [highlight[0]!] }];
}

/** MS «Вопрос»: подсвеченное место графика, варианты ответа, «Ответить». */
export function MsQuestionBody({ envelope, flow, base }: { envelope: TaskEnvelope<MsQuestionPayload>; flow: FlowState; base: SessionBase }) {
  const p = envelope.payload;
  const [optionId, setOptionId] = useState<string | null>(null);
  const options = useMemo(() => p.options.map((o) => ({ id: o.id, label: msQuestionText(o.labelKey, o.labelParams) })), [p.options]);
  const highlight = useMemo(() => highlightMarks(p.highlight), [p.highlight]);
  const prompt = msQuestionText(p.promptKey, p.promptParams);
  const result = flow.phase === 'graded' ? flow.result : null;
  const extra =
    result && result.detail.kind === 'ms-question' ? (
      <ul data-testid="question-detail" className="mb-2 space-y-1 text-sm">
        <li className="flex items-start gap-2">
          <GradeGlyph kind={result.detail.chosenOptionId === result.detail.correctOptionId ? 'match' : 'extra'} />
          <span>Ваш ответ: {options.find((o) => o.id === result.detail.chosenOptionId)?.label}</span>
        </li>
        {result.detail.chosenOptionId !== result.detail.correctOptionId && (
          <li className="flex items-start gap-2">
            <GradeGlyph kind="match" />
            <span>Верный ответ: {options.find((o) => o.id === (result.detail as { correctOptionId: string }).correctOptionId)?.label}</span>
          </li>
        )}
      </ul>
    ) : null;
  return (
    <AnswerSession
      envelope={envelope}
      flow={flow}
      base={base}
      chartTf={p.tf}
      candles={envelope.series[p.tf] ?? []}
      bars={162}
      hintText={prompt}
      hintDetails={<p>{p.highlight?.length ? msTx.highlightNote : msTx.answerHelpDesktop}</p>}
      highlight={highlight}
      form={<AnswerList label={msTx.answerGroup} options={options} value={optionId} onChange={setOptionId} disabled={flow.phase === 'grading'} />}
      buildAnswer={() => (optionId ? msQuestionAnswer(p.questionId, optionId) : ss.input.noAnswer)}
      resultExtra={extra}
    />
  );
}
