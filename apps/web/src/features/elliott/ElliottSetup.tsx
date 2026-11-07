'use client';
import type { Difficulty, TaskSymbol, TaskTimeframe } from '@tl/core';
import { useState } from 'react';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { ewx } from '@/i18n/ru/elliott';
import { ss } from '@/i18n/ru/session';
import { SetupChoice, SetupField, SetupScreen } from '../session/SetupScreen';
import { DIFFICULTIES, TASK_SYMBOLS } from '../session/types';
import { EW_TFS } from './adapters';
import { ewQuery, type EwParams } from './params';

const SHORT: Record<TaskSymbol, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL' };

/** /learn/elliott: сложность (определяет тип задания), пара, ТФ -> сессия. */
export function ElliottSetup() {
  const [p, setP] = useState<EwParams>({ difficulty: 'easy', tf: '1h', symbol: null });
  const tfs = EW_TFS[p.difficulty];
  const setDifficulty = (difficulty: Difficulty) => setP({ ...p, difficulty, tf: EW_TFS[difficulty].includes(p.tf) ? p.tf : '1h' });
  return (
    <SetupScreen title={ewx.title} subtitle={ewx.subtitle} startHref={`/learn/elliott/session?${ewQuery(p)}`}>
      <SetupChoice<Difficulty>
        id="difficulty"
        label={ss.setup.difficulty}
        options={DIFFICULTIES.map((d) => ({ value: d, label: ewx.levels[d], help: ewx.levelHelp[d] }))}
        value={p.difficulty}
        onChange={setDifficulty}
      />
      <SetupField<TaskSymbol | 'any'>
        id="symbol"
        label={ss.setup.pair}
        options={[{ value: 'any', label: ss.setup.anyPair }, ...TASK_SYMBOLS.map((s) => ({ value: s, label: SHORT[s] }))]}
        value={p.symbol ?? 'any'}
        onChange={(s) => setP({ ...p, symbol: s === 'any' ? null : s })}
      />
      <SetupField<TaskTimeframe>
        id="tf"
        label={ss.setup.timeframe}
        options={tfs.map((t) => ({ value: t, label: TF_LABEL[t] }))}
        value={p.tf}
        onChange={(tf) => setP({ ...p, tf })}
        help={p.difficulty === 'easy' ? ewx.tfNote : ''}
      />
    </SetupScreen>
  );
}
