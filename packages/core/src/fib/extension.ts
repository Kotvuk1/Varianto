// Исход extension A-B-C (FIBONACCI.md §2.2, §7.2): достигнутая цель, максимум движения, инвалидация закрытием за C.
import type { Candle } from '../types';
import { FIB_EXTENSION_TARGETS, fibExtensionPrice } from './levels';
import type { FibDirection, FibTarget } from './types';

export interface ExtensionInput {
  candles: readonly Candle[];
  direction: FibDirection;
  A: number;
  B: number;
  C: number;
  /** Индекс последней видимой свечи Te. */
  Te: number;
  limit: number;
}

export interface ExtensionOutcome {
  reached: FibTarget;
  /** (extreme - C) / (B - A). */
  xMax: number;
  extremePrice: number;
  extremeIndex: number;
  invalidationIndex: number | null;
  /** Последняя свеча проигрывания: инвалидация либо Te + limit. */
  endIndex: number;
  incomplete: boolean;
}

/** Порядок целей: none < 1 < 1.272 < 1.618. */
export const TARGET_ORDER: readonly FibTarget[] = ['none', '1', '1.272', '1.618'];

export function resolveExtension(inp: ExtensionInput): ExtensionOutcome {
  const { candles, direction, A, B, C, Te, limit } = inp;
  const bull = direction === 'bull';
  const last = Math.min(Te + limit, candles.length - 1);
  let eIdx = -1;
  let extreme = 0;
  let inval: number | null = null;
  for (let q = Te + 1; q <= last; q++) {
    const c = candles[q]!;
    const v = bull ? c.high : c.low;
    if (eIdx < 0 || (bull ? v > extreme : v < extreme)) {
      eIdx = q;
      extreme = v;
    }
    if (bull ? c.close < C : c.close > C) {
      inval = q;
      break;
    }
  }
  let reached: FibTarget = 'none';
  if (eIdx >= 0) {
    for (let i = FIB_EXTENSION_TARGETS.length - 1; i >= 0; i--) {
      const p = fibExtensionPrice(A, B, C, FIB_EXTENSION_TARGETS[i]!);
      if (bull ? extreme >= p : extreme <= p) {
        reached = String(FIB_EXTENSION_TARGETS[i]) as FibTarget;
        break;
      }
    }
  }
  return {
    reached,
    xMax: eIdx < 0 ? 0 : (extreme - C) / (B - A),
    extremePrice: eIdx < 0 ? C : extreme,
    extremeIndex: eIdx < 0 ? Te : eIdx,
    invalidationIndex: inval,
    endIndex: inval ?? last,
    incomplete: inval === null && Te + limit > candles.length - 1,
  };
}
