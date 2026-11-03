// Чистая логика позиции Challenge: стороны SL/TP, R:R, уровни по умолчанию, ответ API.
import type { ReasonCode, TaskTimeframe } from '@tl/core';

export type Side = 'LONG' | 'SHORT' | 'WAIT';

export type PositionIssue = 'sl-wrong-side' | 'tp-wrong-side';

/** Проверка сторон (FR-TC-08) на клиенте до отправки: те же правила, что SL_WRONG_SIDE/TP_WRONG_SIDE на сервере. */
export function validatePosition(side: 'LONG' | 'SHORT', entry: number, sl: number, tp: number): PositionIssue[] {
  const long = side === 'LONG';
  const issues: PositionIssue[] = [];
  if (long ? sl >= entry : sl <= entry) issues.push('sl-wrong-side');
  if (long ? tp <= entry : tp >= entry) issues.push('tp-wrong-side');
  return issues;
}

export interface RiskReward {
  /** Расстояние до SL (1R) в цене. */
  risk: number;
  reward: number;
  /** reward / risk. */
  rr: number;
  /** Риск как доля цены входа. */
  riskPct: number;
}

export function riskReward(entry: number, sl: number, tp: number): RiskReward | null {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (!(risk > 0) || !(entry > 0)) return null;
  return { risk, reward, rr: reward / risk, riskPct: risk / entry };
}

/** «1:2.5» - R:R без округления до целых. */
export function formatRR(rr: number): string {
  const s = rr >= 10 ? rr.toFixed(0) : rr.toFixed(1).replace(/\.0$/, '');
  return `1:${s}`;
}

export function roundToTick(price: number, tick: number): number {
  const q = Math.round(price / tick);
  const decimals = Math.max(0, Math.round(-Math.log10(tick)));
  return Number((q * tick).toFixed(decimals));
}

/** SL/TP по умолчанию: 1 ATR и 2 ATR от входа в сторону сделки (LAYOUTS §5.1: 1R/2R). */
export function defaultLevels(side: 'LONG' | 'SHORT', entry: number, atr: number, tick: number): { sl: number; tp: number } {
  const unit = Math.max(atr, tick * 10);
  const dir = side === 'LONG' ? 1 : -1;
  return { sl: roundToTick(entry - dir * unit, tick), tp: roundToTick(entry + dir * 2 * unit, tick) };
}

export interface AnswerInput {
  side: Side;
  tf: TaskTimeframe;
  entry: number;
  sl: number | null;
  tp: number | null;
  reasons: readonly ReasonCode[];
  note: string;
}

export interface ChallengeAnswerBody {
  kind: 'challenge';
  side: Side;
  tf: TaskTimeframe;
  entry?: number;
  sl?: number;
  tp?: number;
  reasons: ReasonCode[];
  note?: string;
}

/** Адаптер решения -> Answer API (API_CONTRACTS §4.2). WAIT не несёт entry/sl/tp. */
export function buildAnswer(i: AnswerInput): ChallengeAnswerBody {
  const note = i.note.trim();
  const base = { kind: 'challenge' as const, side: i.side, tf: i.tf, reasons: [...i.reasons], ...(note ? { note } : {}) };
  if (i.side === 'WAIT') return base;
  if (i.sl === null || i.tp === null) throw new Error('SL_TP_REQUIRED');
  return { ...base, entry: i.entry, sl: i.sl, tp: i.tp };
}

/** Какие причины предлагать: при WAIT предикаты ядра верны только для двух (ALGORITHMS §14.5). */
export function reasonsFor(side: Side, all: readonly ReasonCode[]): ReasonCode[] {
  return side === 'WAIT' ? all.filter((r) => r === 'range-no-edge' || r === 'unclear-structure') : [...all];
}
