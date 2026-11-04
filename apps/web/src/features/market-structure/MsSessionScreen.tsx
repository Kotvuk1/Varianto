'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { msTx } from '@/i18n/ru/ms';
import { ss } from '@/i18n/ru/session';
import { msBody, parseMsParams } from '../session/params';
import { TaskSession } from '../session/TaskSession';
import { MsMarkBody } from './MsMarkBody';
import { MsQuestionBody } from './MsQuestionBody';

/** /learn/market-structure/session?mode=mark|question&difficulty=&tf=&symbol= */
export function MsSessionScreen() {
  const sp = useSearchParams();
  const params = useMemo(() => parseMsParams((k) => sp.get(k)), [sp]);
  const loading = params.symbol ? ss.loadingChart(params.symbol, TF_LABEL[params.tf]) : ss.loadingChartAny(TF_LABEL[params.tf]);
  return (
    <TaskSession
      key={JSON.stringify(msBody(params))}
      module="market-structure"
      body={msBody(params)}
      base={{ backHref: '/learn/market-structure', title: msTx.title, subtitle: msTx.sessionTitle[params.mode] }}
      loadingLabel={loading}
      intro={params.mode === 'question' ? 'ms-question' : 'ms-mark'}
    >
      {({ envelope, flow, base }) =>
        envelope.payload.kind === 'ms-mark' ? (
          <MsMarkBody envelope={envelope as never} flow={flow} base={base} />
        ) : (
          <MsQuestionBody envelope={envelope as never} flow={flow} base={base} />
        )
      }
    </TaskSession>
  );
}
