// Параметры сессии Elliott в URL: `?difficulty=hard&tf=1h&symbol=BTCUSDT`. Тип задания определяется сложностью (ELLIOTT.md §19).
import type { Difficulty, TaskSymbol, TaskTimeframe } from '@tl/core';
import { parseCommonParams } from '../session/params';
import type { NextBody } from '../session/types';
import { EW_TFS } from './adapters';

export interface EwParams {
  difficulty: Difficulty;
  tf: TaskTimeframe;
  symbol: TaskSymbol | null;
}

type Get = (key: string) => string | null;

/** Недопустимый ТФ сложности (1d, 15m на easy) заменяется на 1h. */
export function parseEwParams(get: Get): EwParams {
  const c = parseCommonParams(get);
  return { difficulty: c.difficulty, symbol: c.symbol, tf: EW_TFS[c.difficulty].includes(c.tf) ? c.tf : '1h' };
}

export function ewQuery(p: EwParams): string {
  const q = new URLSearchParams({ difficulty: p.difficulty, tf: p.tf });
  if (p.symbol) q.set('symbol', p.symbol);
  return q.toString();
}

export const ewBody = (p: EwParams): NextBody => ({ difficulty: p.difficulty, tf: p.tf, ...(p.symbol ? { symbol: p.symbol } : {}) });
