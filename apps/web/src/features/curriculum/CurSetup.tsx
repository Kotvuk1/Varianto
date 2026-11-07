'use client';
// Экран выбора задания модуля ступени 1-4 или комбо: тип, сложность, пара, таймфрейм (допустимые для сложности).
import { useState } from 'react';
import type { Difficulty, TaskSymbol, TaskTimeframe } from '@tl/core';
import { TF_LABEL } from '@/features/terminal/dataSource';
import { cuSetup, type CurModule, type CurTaskType } from '@/i18n/ru/curriculum';
import { ss } from '@/i18n/ru/session';
import { SetupChoice, SetupField, SetupScreen } from '../session/SetupScreen';
import { DIFFICULTIES, TASK_SYMBOLS } from '../session/types';
import { CUR_TYPES, allowedTfs, curQuery, fixTf, tfRequired, type CurParams } from './params';

const SHORT: Record<TaskSymbol, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', SOLUSDT: 'SOL' };

export function CurSetup({ module }: { module: CurModule }) {
  const types = CUR_TYPES[module];
  const [p, setP] = useState<CurParams>({ module, type: types ? types[0]! : null, difficulty: 'easy', tf: null, symbol: null, focus: [] });
  const set = (next: CurParams) => setP({ ...next, tf: fixTf(module, next.type, next.difficulty, next.tf) });
  const tfs = allowedTfs(module, p.type, p.difficulty);
  const tf: TaskTimeframe | 'auto' = p.tf ?? (tfRequired(module) ? tfs[0]! : 'auto');
  return (
    <SetupScreen title={cuSetup.titles[module]} subtitle={cuSetup.subtitles[module]} startHref={`/learn/${module}/session?${curQuery({ ...p, tf: tfRequired(module) ? (p.tf ?? tfs[0]!) : p.tf })}`}>
      {types && (
        <SetupChoice<CurTaskType>
          id="type"
          label={cuSetup.typeLabel}
          options={types.map((t) => ({ value: t, label: cuSetup.types[t], help: cuSetup.typeHelp[t] }))}
          value={p.type!}
          onChange={(type) => set({ ...p, type })}
        />
      )}
      <SetupField<Difficulty>
        id="difficulty"
        label={ss.setup.difficulty}
        options={DIFFICULTIES.map((d) => ({ value: d, label: ss.difficulty[d] }))}
        value={p.difficulty}
        onChange={(difficulty) => set({ ...p, difficulty })}
        help={cuSetup.difficultyHelp[module][p.difficulty]}
      />
      <SetupField<TaskSymbol | 'any'>
        id="symbol"
        label={ss.setup.pair}
        options={[{ value: 'any', label: ss.setup.anyPair }, ...TASK_SYMBOLS.map((s) => ({ value: s, label: SHORT[s] }))]}
        value={p.symbol ?? 'any'}
        onChange={(s) => set({ ...p, symbol: s === 'any' ? null : s })}
      />
      <SetupField<TaskTimeframe | 'auto'>
        id="tf"
        label={ss.setup.timeframe}
        options={[...(tfRequired(module) ? [] : [{ value: 'auto' as const, label: cuSetup.auto }]), ...tfs.map((t) => ({ value: t, label: TF_LABEL[t] }))]}
        value={tf}
        onChange={(v) => set({ ...p, tf: v === 'auto' ? null : v })}
      />
    </SetupScreen>
  );
}
