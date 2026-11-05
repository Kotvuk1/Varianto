'use client';
import { useState } from 'react';
import { fx } from '@/i18n/ru/fib';
import { ss } from '@/i18n/ru/session';
import { CommonFields } from '../session/CommonFields';
import { SetupChoice, SetupScreen } from '../session/SetupScreen';
import type { FibType } from '../session/types';
import { FIB_TYPES, fibQuery, type FibParams } from './params';

/** /learn/fibonacci: тип задания, сложность, пара, ТФ -> сессия. */
export function FibSetup() {
  const [p, setP] = useState<FibParams>({ type: 'grid', difficulty: 'easy', tf: '1h', symbol: null, focus: [] });
  return (
    <SetupScreen title={fx.title} subtitle={fx.subtitle} startHref={`/learn/fibonacci/session?${fibQuery(p)}`}>
      <SetupChoice<FibType>
        id="type"
        label={ss.setup.type}
        options={FIB_TYPES.map((t) => ({ value: t, label: fx.types[t], help: fx.typeHelp[t] }))}
        value={p.type}
        onChange={(type) => setP({ ...p, type })}
      />
      <CommonFields value={p} onChange={setP} difficultyHelp={fx.difficultyHelp} />
    </SetupScreen>
  );
}
