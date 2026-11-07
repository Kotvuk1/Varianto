'use client';
import { useState } from 'react';
import { paTx } from '@/i18n/ru/pa';
import { ss } from '@/i18n/ru/session';
import { CommonFields } from '../session/CommonFields';
import { paQuery, type PaParams } from '../session/params';
import { SetupChoice, SetupScreen } from '../session/SetupScreen';
import type { PaType } from '../session/types';

/** /learn/price-action: тип задания, сложность, пара, ТФ -> сессия. */
export function PaSetup() {
  const [p, setP] = useState<PaParams>({ type: 'context', difficulty: 'easy', tf: '1h', symbol: null, focus: [] });
  return (
    <SetupScreen title={paTx.title} subtitle={paTx.subtitle} startHref={`/learn/price-action/session?${paQuery(p)}`}>
      <SetupChoice<PaType>
        id="type"
        label={ss.setup.type}
        options={(['find-pattern', 'context'] as const).map((t) => ({ value: t, label: paTx.types[t], help: paTx.typeHelp[t] }))}
        value={p.type}
        onChange={(type) => setP({ ...p, type })}
      />
      <CommonFields value={p} onChange={setP} difficultyHelp={paTx.difficultyHelp} />
    </SetupScreen>
  );
}
