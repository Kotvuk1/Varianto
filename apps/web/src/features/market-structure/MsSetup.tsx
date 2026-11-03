'use client';
import { useState } from 'react';
import { msTx } from '@/i18n/ru/ms';
import { ss } from '@/i18n/ru/session';
import { CommonFields } from '../session/CommonFields';
import { msQuery, type MsParams } from '../session/params';
import { SetupChoice, SetupScreen } from '../session/SetupScreen';
import type { MsMode } from '../session/types';

/** /learn/market-structure: режим, сложность, пара, ТФ -> сессия. */
export function MsSetup() {
  const [p, setP] = useState<MsParams>({ mode: 'mark', difficulty: 'easy', tf: '1h', symbol: null, focus: [] });
  return (
    <SetupScreen title={msTx.title} subtitle={msTx.subtitle} startHref={`/learn/market-structure/session?${msQuery(p)}`}>
      <SetupChoice<MsMode>
        id="mode"
        label={ss.setup.mode}
        options={(['mark', 'question'] as const).map((m) => ({ value: m, label: msTx.modes[m], help: msTx.modeHelp[m] }))}
        value={p.mode}
        onChange={(mode) => setP({ ...p, mode })}
      />
      <CommonFields value={p} onChange={setP} difficultyHelp={msTx.difficultyHelp} />
    </SetupScreen>
  );
}
