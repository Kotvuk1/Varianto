'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { ElliottTask } from '@tl/core';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { ewx } from '@/i18n/ru/elliott';
import { ss } from '@/i18n/ru/session';
import { TaskSession } from '../session/TaskSession';
import type { TaskEnvelope } from '../session/types';
import { EW_INTRO } from './adapters';
import { ElliottBody } from './ElliottBody';
import { ewBody, parseEwParams } from './params';

/** /learn/elliott/session?difficulty=easy|medium|hard&tf=&symbol= */
export function ElliottSessionScreen() {
  const sp = useSearchParams();
  const params = useMemo(() => parseEwParams((k) => sp.get(k)), [sp]);
  const loading = params.symbol ? ss.loadingChart(params.symbol, TF_LABEL[params.tf]) : ss.loadingChartAny(TF_LABEL[params.tf]);
  return (
    <TaskSession
      key={JSON.stringify(ewBody(params))}
      module="elliott"
      body={ewBody(params)}
      base={{ backHref: '/learn/elliott', title: ewx.card.title, subtitle: ewx.levels[params.difficulty] }}
      loadingLabel={loading}
      intro={EW_INTRO[params.difficulty]}
    >
      {({ envelope, flow, base }) => <ElliottBody envelope={envelope as TaskEnvelope<ElliottTask>} flow={flow} base={base} />}
    </TaskSession>
  );
}
