import type { TaskTimeframe } from '@tl/core';

export const TF_LABEL: Record<TaskTimeframe, string> = { '15m': '15m', '1h': '1H', '4h': '4H', '1d': '1D' };
export const TASK_TFS: readonly TaskTimeframe[] = ['15m', '1h', '4h', '1d'];
export const isTaskTf = (v: unknown): v is TaskTimeframe => typeof v === 'string' && (TASK_TFS as readonly string[]).includes(v);
