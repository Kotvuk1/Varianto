// Закрытый список сценариев, таблица альтернатив, уровни (ELLIOTT.md §6, §19: после ABC invalidation = точка C).
import type { EwPrimaryScenario, EwScenarioId, WaveCount, WavePoint } from './types';

export const EW_PRIMARY_OPTIONS: EwPrimaryScenario[] = ['w3-next', 'w5-next', 'abc-next', 'trend-next'];
export const EW_ALTERNATIVE_OPTIONS: EwScenarioId[] = ['w3-next', 'w5-next', 'abc-next', 'trend-next', 'bc-next', 'correction-extends', 'impulse-extends'];

/** Допустимые альтернативы к основному сценарию (§6.2). */
export const EW_ALT_ALLOWED: Record<EwPrimaryScenario, EwScenarioId[]> = {
  'w3-next': ['correction-extends'],
  'w5-next': ['bc-next', 'correction-extends'],
  'abc-next': ['impulse-extends'],
  'trend-next': ['correction-extends'],
};

export function impliedScenario(impulsePoints: number, hasCorrection: boolean): EwPrimaryScenario | null {
  if (impulsePoints === 3) return 'w3-next';
  if (impulsePoints === 5) return 'w5-next';
  if (impulsePoints === 6) return hasCorrection ? 'trend-next' : 'abc-next';
  return null;
}

export type EwRuleRef = 'P0' | 'P1' | 'P5' | 'C';
export const EW_RULE_REF: Record<EwPrimaryScenario, EwRuleRef> = { 'w3-next': 'P0', 'w5-next': 'P1', 'abc-next': 'P5', 'trend-next': 'C' };

/** Все точки разметки по порядку (импульс, затем A/B/C, у bc-next - A). */
export function countPoints(c: WaveCount): WavePoint[] {
  return [...c.impulse, ...(c.correction?.points ?? [])];
}

export interface ScenarioRule {
  /** Нормированный знак направления. */
  sg: 1 | -1;
  /** Цена уровня invalidation по правилу (реальная). */
  invalidation: number;
  ruleRef: EwRuleRef;
  /** Цена уровня подтверждения основного сценария. */
  confirm: number;
  /** Цена уровня подтверждения альтернативы (цена последней точки) или null. */
  altConfirm: number | null;
  /** invalidation: касание (true) экстремумом; сторона: 'down' - v-low ниже/равно уровня, 'up' - v-high выше. */
  invalidatedBy: (vLow: number, vHigh: number) => boolean;
  /** Подтверждение основного: нормированное закрытие. */
  primaryClosed: (vClose: number) => boolean;
  altClosed: ((vClose: number) => boolean) | null;
}

/** Уровни и предикаты сценария по точкам разметки (§6.1). Точки - реальные цены, нормировка внутри. */
export function scenarioRule(count: WaveCount, primary: EwPrimaryScenario, alt: EwScenarioId | null): ScenarioRule | null {
  const sg = count.direction === 'bull' ? 1 : -1;
  const pts = countPoints(count);
  const need = primary === 'w3-next' ? 3 : primary === 'w5-next' ? 5 : primary === 'abc-next' ? 6 : 9;
  if (pts.length < need) return null;
  const P = (k: number) => pts[k]!.price;
  const v = (k: number) => sg * P(k);
  const lastK = need - 1;
  let invalidation: number;
  let confirmK: number;
  let invalidatedBy: ScenarioRule['invalidatedBy'];
  switch (primary) {
    case 'w3-next':
      invalidation = P(0);
      confirmK = 1;
      invalidatedBy = (lo) => lo < v(0);
      break;
    case 'w5-next':
      invalidation = P(1);
      confirmK = 3;
      invalidatedBy = (lo) => lo <= v(1);
      break;
    case 'abc-next':
      invalidation = P(5);
      confirmK = 4;
      invalidatedBy = (_lo, hi) => hi > v(5);
      break;
    case 'trend-next':
      invalidation = P(8);
      confirmK = 7;
      invalidatedBy = (lo) => lo < v(8);
      break;
  }
  const primaryClosed = primary === 'abc-next' ? (c: number) => c < v(confirmK) : (c: number) => c > v(confirmK);
  let altClosed: ScenarioRule['altClosed'] = null;
  let altConfirm: number | null = null;
  if (alt) {
    altConfirm = P(lastK);
    altClosed = alt === 'impulse-extends' ? (c) => c > v(lastK) : (c) => c < v(lastK);
  }
  return { sg, invalidation, ruleRef: EW_RULE_REF[primary], confirm: P(confirmK), altConfirm, invalidatedBy, primaryClosed, altClosed };
}

/** Основной сценарий с альтернативой «по умолчанию» для эталона: первая допустимая и поддержанная. */
export function defaultAlternative(primary: EwPrimaryScenario, bcSupported: boolean): EwScenarioId {
  const list = EW_ALT_ALLOWED[primary];
  return list.find((a) => a !== 'bc-next' || bcSupported) ?? list[list.length - 1]!;
}
