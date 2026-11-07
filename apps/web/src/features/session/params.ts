// Параметры задания в URL: `?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT`. Недопустимые значения заменяются значениями по умолчанию.
import type { Difficulty, TaskSymbol, TaskTimeframe } from '@tl/core';
import { DIFFICULTIES, TASK_SYMBOLS, TASK_TFS, type MsMode, type NextBody, type PaType } from './types';

export interface CommonParams {
  difficulty: Difficulty;
  tf: TaskTimeframe;
  /** null = любая из трёх пар. */
  symbol: TaskSymbol | null;
  focus: string[];
}
export interface MsParams extends CommonParams {
  mode: MsMode;
}
export interface PaParams extends CommonParams {
  type: PaType;
}

type Get = (key: string) => string | null;
const pick = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T => (v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback);

function common(get: Get): CommonParams {
  const symbol = get('symbol');
  return {
    difficulty: pick(get('difficulty'), DIFFICULTIES, 'easy'),
    tf: pick(get('tf'), TASK_TFS, '1h'),
    symbol: symbol && (TASK_SYMBOLS as readonly string[]).includes(symbol) ? (symbol as TaskSymbol) : null,
    focus: (get('focus') ?? '').split(',').filter(Boolean).slice(0, 5),
  };
}

export const parseCommonParams = common;
export const parseMsParams = (get: Get): MsParams => ({ ...common(get), mode: pick(get('mode'), ['mark', 'question'] as const, 'mark') });
export const parsePaParams = (get: Get): PaParams => ({
  ...common(get),
  type: pick(get('type'), ['find-pattern', 'context'] as const, 'find-pattern'),
});

function query(p: CommonParams, extra: Record<string, string>): string {
  const q = new URLSearchParams({ ...extra, difficulty: p.difficulty, tf: p.tf });
  if (p.symbol) q.set('symbol', p.symbol);
  if (p.focus.length) q.set('focus', p.focus.join(','));
  return q.toString();
}
export const msQuery = (p: MsParams) => query(p, { mode: p.mode });
export const paQuery = (p: PaParams) => query(p, { type: p.type });

const withCommon = (p: CommonParams) => ({
  difficulty: p.difficulty,
  tf: p.tf,
  ...(p.symbol ? { symbol: p.symbol } : {}),
  ...(p.focus.length ? { focus: p.focus } : {}),
});
export const msBody = (p: MsParams): NextBody => ({ ...withCommon(p), mode: p.mode });
export const paBody = (p: PaParams): NextBody => ({ ...withCommon(p), taskType: p.type });
