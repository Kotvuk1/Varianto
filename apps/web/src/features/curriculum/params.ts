// Параметры заданий ступеней 1-4 и комбо в URL: `?type=sw-mark&difficulty=easy&tf=1h&symbol=BTCUSDT`.
import { CUR_TFS, SW_MARK_TFS, SW_TREND_TFS, type Difficulty, type TaskSymbol, type TaskTimeframe } from '@tl/core';
import type { CurModule, CurTaskType } from '@/i18n/ru/curriculum';
import { DIFFICULTIES, TASK_SYMBOLS, TASK_TFS, type NextBody } from '../session/types';

export const CUR_MODULES: readonly CurModule[] = ['stage-swings', 'levels', 'limit-entry', 'stop-take', 'combo-level-trade', 'combo-smc-entry'];
export const isCurModule = (m: string): m is CurModule => (CUR_MODULES as readonly string[]).includes(m);

/** Типы заданий модуля; у остальных модулей один тип. */
export const CUR_TYPES: Readonly<Partial<Record<CurModule, readonly CurTaskType[]>>> = {
  'stage-swings': ['sw-mark', 'sw-trend'],
  levels: ['lv-strongest', 'lv-zone', 'lv-reaction'],
};

export interface CurParams {
  module: CurModule;
  type: CurTaskType | null;
  difficulty: Difficulty;
  /** null - «Авто» (только модули, где tf необязателен). */
  tf: TaskTimeframe | null;
  symbol: TaskSymbol | null;
  focus: string[];
}

/** Таймфреймы, доступные для сложности (CURRICULUM_STAGES §2-§8); иначе сервер ответит 400 UNKNOWN_TIMEFRAME. */
export function allowedTfs(module: CurModule, type: CurTaskType | null, difficulty: Difficulty): readonly TaskTimeframe[] {
  if (module === 'stage-swings') return (type === 'sw-trend' ? SW_TREND_TFS : SW_MARK_TFS)[difficulty];
  if (module === 'levels') return (type === 'lv-reaction' ? CUR_TFS.reaction : CUR_TFS.levels)[difficulty];
  return CUR_TFS.trade[difficulty];
}

/** Модули, где tf обязателен в запросе (ступени 1-2). */
export const tfRequired = (module: CurModule): boolean => module === 'stage-swings' || module === 'levels';

type Get = (key: string) => string | null;
const pick = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T => (v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback);

/** Приводит tf к допустимому для сложности/типа. */
export function fixTf(module: CurModule, type: CurTaskType | null, difficulty: Difficulty, tf: TaskTimeframe | null): TaskTimeframe | null {
  const list = allowedTfs(module, type, difficulty);
  if (tf && list.includes(tf)) return tf;
  return tfRequired(module) ? list[0]! : null;
}

export function parseCurParams(module: CurModule, get: Get): CurParams {
  const types = CUR_TYPES[module];
  const type = types ? pick(get('type'), types, types[0]!) : null;
  const difficulty = pick(get('difficulty'), DIFFICULTIES, 'easy');
  const rawTf = get('tf');
  const tf = fixTf(module, type, difficulty, rawTf && (TASK_TFS as readonly string[]).includes(rawTf) ? (rawTf as TaskTimeframe) : null);
  const symbol = get('symbol');
  return {
    module,
    type,
    difficulty,
    tf,
    symbol: symbol && (TASK_SYMBOLS as readonly string[]).includes(symbol) ? (symbol as TaskSymbol) : null,
    focus: (get('focus') ?? '').split(',').filter(Boolean).slice(0, 5),
  };
}

export function curQuery(p: CurParams): string {
  const q = new URLSearchParams();
  if (p.type) q.set('type', p.type);
  q.set('difficulty', p.difficulty);
  if (p.tf) q.set('tf', p.tf);
  if (p.symbol) q.set('symbol', p.symbol);
  if (p.focus.length) q.set('focus', p.focus.join(','));
  return q.toString();
}

export function curBody(p: CurParams): NextBody {
  const common = {
    difficulty: p.difficulty,
    ...(p.symbol ? { symbol: p.symbol } : {}),
    ...(p.focus.length ? { focus: p.focus } : {}),
  };
  if (p.type && p.tf) return { ...common, taskType: p.type, tf: p.tf };
  return { ...common, ...(p.tf ? { tf: p.tf } : {}) };
}
