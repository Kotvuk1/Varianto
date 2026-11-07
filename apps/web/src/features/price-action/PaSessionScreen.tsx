'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { paBody, parsePaParams } from '../session/params';
import { TaskSession } from '../session/TaskSession';
import { PaContextBody } from './PaContextBody';
import { PaFindBody } from './PaFindBody';

const INTRO = { 'find-pattern': 'pa-find', context: 'pa-context' } as const;

/** Старые ссылки type=draw-level: задание переехало в ступень 2 (levels / lv-strongest); сервер для draw-level отвечает 400. */
export function levelsRedirect(get: (k: string) => string | null): string | null {
  if (get('type') !== 'draw-level') return null;
  const q = new URLSearchParams({ type: 'lv-strongest', difficulty: get('difficulty') === 'hard' || get('difficulty') === 'medium' ? (get('difficulty') as string) : 'easy', tf: get('tf') ?? '1h' });
  const sym = get('symbol');
  if (sym) q.set('symbol', sym);
  return `/learn/levels/session?${q}`;
}

/** /learn/price-action/session?type=find-pattern|draw-level|context&difficulty=&tf=&symbol= */
export function PaSessionScreen() {
  const sp = useSearchParams();
  const router = useRouter();
  const params = useMemo(() => parsePaParams((k) => sp.get(k)), [sp]);
  const redirect = useMemo(() => levelsRedirect((k) => sp.get(k)), [sp]);
  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);
  if (redirect) return null;
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
        return <PaContextBody envelope={envelope as never} flow={flow} base={base} />;
      }}
    </TaskSession>
  );
}
