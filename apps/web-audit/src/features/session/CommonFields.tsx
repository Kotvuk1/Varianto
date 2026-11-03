'use client';
import type { Difficulty, TaskSymbol, TaskTimeframe } from '@tl/core';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { ss } from '@/i18n/ru/session';
import type { CommonParams } from './params';
import { SetupField } from './SetupScreen';
import { DIFFICULTIES, TASK_SYMBOLS, TASK_TFS } from './types';

const SHORT: Record<TaskSymbol, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL' };

/** Сложность, пара и таймфрейм: общие поля выбора задания обоих модулей. */
export function CommonFields<P extends CommonParams>({ value, onChange, difficultyHelp }: { value: P; onChange: (next: P) => void; difficultyHelp: Record<Difficulty, string> }) {
  return (
    <>
      <SetupField<Difficulty>
        id="difficulty"
        label={ss.setup.difficulty}
        options={DIFFICULTIES.map((d) => ({ value: d, label: ss.difficulty[d] }))}
        value={value.difficulty}
        onChange={(difficulty) => onChange({ ...value, difficulty })}
        help={difficultyHelp[value.difficulty]}
      />
      <SetupField<TaskSymbol | 'any'>
        id="symbol"
        label={ss.setup.pair}
        options={[{ value: 'any', label: ss.setup.anyPair }, ...TASK_SYMBOLS.map((s) => ({ value: s, label: SHORT[s] }))]}
        value={value.symbol ?? 'any'}
        onChange={(s) => onChange({ ...value, symbol: s === 'any' ? null : s })}
      />
      <SetupField<TaskTimeframe>
        id="tf"
        label={ss.setup.timeframe}
        options={TASK_TFS.map((t) => ({ value: t, label: TF_LABEL[t] }))}
        value={value.tf}
        onChange={(tf) => onChange({ ...value, tf })}
      />
    </>
  );
}
