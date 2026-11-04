'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { paBody, parsePaParams } from '../session/params';
import { TaskSession } from '../session/TaskSession';
import { PaContextBody } from './PaContextBody';
import { PaFindBody } from './PaFindBody';
import { PaLevelBody } from './PaLevelBody';

const INTRO = { 'find-pattern': 'pa-find', 'draw-level': 'pa-level', context: 'pa-context' } as const;

/** /learn/price-action/session?type=find-pattern|draw-level|context&difficulty=&tf=&symbol= */
export function PaSessionScreen() {
  const sp = useSearchParams();
  const params = useMemo(() => parsePaParams((k) => sp.get(k)), [sp]);
  const loading = params.symbol ? ss.loadingChart(params.symbol, TF_LABEL[params.tf]) : ss.loadingChartAny(TF_LABEL[params.tf]);
  return (
    <TaskSession
      key={JSON.stringify(paBody(params))}
      module="price-action"
      body={paBody(params)}
      base={{ backHref: '/learn/price-action', title: paTx.title, subtitle: paTx.types[params.type] }}
      loadingLabel={loading}
      intro={INTRO[params.type]}
    >
      {({ envelope, flow, base }) => {
        const k = envelope.payload.kind;
        if (k === 'pa-find') return <PaFindBody envelope={envelope as never} flow={flow} base={base} />;
        if (k === 'pa-level') return <PaLevelBody envelope={envelope as never} flow={flow} base={base} />;
        return <PaContextBody envelope={envelope as never} flow={flow} base={base} />;
      }}
    </TaskSession>
  );
}
