'use client';
import type { ReactNode } from 'react';
import { ss } from '@/i18n/ru/session';
import { ChartSkeleton, TaskError } from './States';
import { SessionLayout, TaskHint } from './SessionLayout';
import type { FlowState } from './taskFlow';
import type { NextBody, TaskEnvelope, TaskModule } from './types';
import { useTaskFlow } from './useTaskFlow';

export interface SessionBase {
  backHref: string;
  title: string;
  subtitle: string;
  counter: string;
}

export interface TaskSessionProps {
  module: TaskModule;
  body: NextBody;
  base: Omit<SessionBase, 'counter'>;
  /** Подпись загрузки, например «Загружаю свечи BTCUSDT 1H…» (пара может быть неизвестна заранее). */
  loadingLabel: string;
  children: (ctx: { envelope: TaskEnvelope; flow: FlowState; base: SessionBase }) => ReactNode;
}

/** Каркас жизненного цикла: загрузка -> задание (children) / ошибка. Тело задания пересоздаётся на каждое новое задание. */
export function TaskSession({ module, body, base, loadingLabel, children }: TaskSessionProps) {
  const flow = useTaskFlow(module, body);
  const full: SessionBase = { ...base, counter: ss.taskNumber(flow.solved + (flow.phase === 'graded' ? 0 : 1)) };

  if (flow.phase === 'failed' && flow.error) {
    return (
      <SessionLayout
        {...full}
        hint={null}
        chart={<TaskError error={flow.error} stage="next" onRetry={() => void flow.load()} onAnother={() => void flow.load()} backHref={base.backHref} />}
      />
    );
  }
  if (!flow.envelope) {
    return <SessionLayout {...full} hint={<TaskHint text={ss.loadingTask} />} chart={<ChartSkeleton label={loadingLabel} backHref={base.backHref} />} />;
  }
  return <div className="flex min-h-0 flex-1 flex-col" key={flow.envelope.taskId}>{children({ envelope: flow.envelope, flow, base: full })}</div>;
}
