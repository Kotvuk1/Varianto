import type { TaskTimeframe } from '@tl/core';

export const CONTEXT_FIELD_IDS = ['sweep', 'ob', 'level', 'trend', 'significant'] as const;
export type ContextFieldId = (typeof CONTEXT_FIELD_IDS)[number];

/** Старший ТФ для «Контекста» (ALGORITHMS §11.2). */
export const CONTEXT_HTF: Record<TaskTimeframe, TaskTimeframe> = { '15m': '1h', '1h': '4h', '4h': '1d', '1d': '1d' };

/** На шаге «Тренд» график показывает старший ТФ, на остальных - рабочий. */
export function viewForField(id: ContextFieldId): 'base' | 'htf' {
  return id === 'trend' ? 'htf' : 'base';
}
