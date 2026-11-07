// Типы Price Action (ALGORITHMS §9, §10). PatternType — в общем types.ts.
import type { UtcMs, PatternType } from '../types';

export type { PatternType };

export interface PatternInstance {
  type: PatternType;
  direction: 'bull' | 'bear' | null;
  firstIndex: number;
  lastIndex: number;
  /** openTime последней свечи модели. */
  time: UtcMs;
}
