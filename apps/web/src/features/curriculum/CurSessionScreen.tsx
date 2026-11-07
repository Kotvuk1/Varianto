'use client';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { cuSetup, type CurModule } from '@/i18n/ru/curriculum';
import { ss } from '@/i18n/ru/session';
import { TaskSession } from '../session/TaskSession';
import { ComboBody, LimitEntryBody, StopTakeBody } from './TradeBodies';
import { LvReactionBody, LvStrongestBody, LvZoneBody, SwMarkBody, SwTrendBody } from './StageBodies';
import { curBody, parseCurParams } from './params';

/** /learn/<module>/session?type=&difficulty=&tf=&symbol= для ступеней 1-4 и комбо. */
export function CurSessionScreen({ module }: { module: CurModule }) {
  const sp = useSearchParams();
  const params = useMemo(() => parseCurParams(module, (k) => sp.get(k)), [module, sp]);
  const body = curBody(params);
  const tfLabel = params.tf ? TF_LABEL[params.tf] : '';
  const loading = params.symbol ? ss.loadingChart(params.symbol, tfLabel) : ss.loadingChartAny(tfLabel);
  return (
    <TaskSession
      key={JSON.stringify(body)}
      module={module}
      body={body}
      base={{ backHref: `/learn/${module}`, title: cuSetup.titles[module], subtitle: params.type ? cuSetup.types[params.type] : cuSetup.subtitleShort[module] }}
      loadingLabel={loading}
      {...(params.type === 'lv-strongest' ? { intro: 'pa-level' as const } : {})}
    >
      {({ envelope, flow, base }) => {
        const props = { envelope: envelope as never, flow, base };
        switch (envelope.payload.kind as string) {
          case 'sw-mark': return <SwMarkBody {...props} />;
          case 'sw-trend': return <SwTrendBody {...props} />;
          case 'lv-strongest': return <LvStrongestBody {...props} />;
          case 'lv-zone': return <LvZoneBody {...props} />;
          case 'lv-reaction': return <LvReactionBody {...props} />;
          case 'limit-entry': return <LimitEntryBody {...props} />;
          case 'stop-take': return <StopTakeBody {...props} />;
          default: return <ComboBody {...props} />;
        }
      }}
    </TaskSession>
  );
}
