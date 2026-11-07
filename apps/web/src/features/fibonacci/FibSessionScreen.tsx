'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { fx } from '@/i18n/ru/fib';
import { ss } from '@/i18n/ru/session';
import { TaskSession } from '../session/TaskSession';
import type { FibPayload, TaskEnvelope } from '../session/types';
import { FibBody } from './FibBody';
import { fibBody, parseFibParams } from './params';

const INTRO = { grid: 'fib-grid', reaction: 'fib-reaction', extension: 'fib-extension' } as const;

/** /learn/fibonacci/session?type=grid|reaction|extension&difficulty=&tf=&symbol= */
export function FibSessionScreen() {
  const sp = useSearchParams();
  const params = useMemo(() => parseFibParams((k) => sp.get(k)), [sp]);
  const loading = params.symbol ? ss.loadingChart(params.symbol, TF_LABEL[params.tf]) : ss.loadingChartAny(TF_LABEL[params.tf]);
  return (
    <TaskSession
      key={JSON.stringify(fibBody(params))}
      module="fibonacci"
      body={fibBody(params)}
      base={{ backHref: '/learn/fibonacci', title: fx.card.title, subtitle: fx.types[params.type] }}
      loadingLabel={loading}
      intro={INTRO[params.type]}
    >
      {({ envelope, flow, base }) => <FibBody envelope={envelope as TaskEnvelope<FibPayload>} flow={flow} base={base} />}
    </TaskSession>
  );
}
