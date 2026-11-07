// Параметры сессии Fibonacci в URL: `?type=reaction&difficulty=easy&tf=1h&symbol=BTCUSDT`.
import { parseCommonParams, type CommonParams } from '../session/params';
import type { FibType, NextBody } from '../session/types';

export const FIB_TYPES: readonly FibType[] = ['grid', 'reaction', 'extension'];
export interface FibParams extends CommonParams {
  type: FibType;
}

type Get = (key: string) => string | null;

export function parseFibParams(get: Get): FibParams {
  const t = get('type');
  return { ...parseCommonParams(get), type: (FIB_TYPES as readonly (string | null)[]).includes(t) ? (t as FibType) : 'grid' };
}

export function fibQuery(p: FibParams): string {
  const q = new URLSearchParams({ type: p.type, difficulty: p.difficulty, tf: p.tf });
  if (p.symbol) q.set('symbol', p.symbol);
  return q.toString();
}

export const fibBody = (p: FibParams): NextBody => ({ difficulty: p.difficulty, tf: p.tf, taskType: p.type, ...(p.symbol ? { symbol: p.symbol } : {}) });
