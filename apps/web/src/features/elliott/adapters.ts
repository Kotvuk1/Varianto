// Адаптеры Elliott: состояние UI -> ElliottAnswer (ELLIOTT.md §12.3), допустимые пары сценариев, мягкие подсказки правил.
import { EW_ALT_ALLOWED, EW_PRIMARY_OPTIONS, impliedScenario, type Difficulty, type EwCheck, type EwMarkCheck, type EwPrimaryScenario, type EwScenarioId, type EwTaskKind, type Mark, type TaskTimeframe } from '@tl/core';
import { ewx } from '@/i18n/ru/elliott';
import type { Answer } from '../session/types';

export const EW_KIND: Record<Difficulty, EwTaskKind> = { easy: 'ew-impulse', medium: 'ew-impulse-correction', hard: 'ew-scenario' };
export const EW_TFS: Record<Difficulty, readonly TaskTimeframe[]> = { easy: ['1h', '4h'], medium: ['15m', '1h', '4h'], hard: ['15m', '1h', '4h'] };
export const EW_INTRO = { easy: 'ew-easy', medium: 'ew-medium', hard: 'ew-hard' } as const;
export const INVALIDATION_ROLE = 'ew-invalidation';
export const NO_ALTERNATIVE = 'none';

const isCorrection = (m: Mark) => m.kind === 'ew-zigzag' || m.kind === 'ew-flat';
const isInvalidation = (m: Mark) => m.kind === 'hline' && m.author === 'user';

/** Допустимые альтернативы для основного сценария (§6.2); пустой список, пока основной не выбран. */
export function allowedAlternatives(primary: EwPrimaryScenario | null): EwScenarioId[] {
  return primary ? [...EW_ALT_ALLOWED[primary]] : [];
}

/** Смена основного сценария сбрасывает альтернативу, если она недопустима для нового. */
export function reconcileAlternative(primary: EwPrimaryScenario | null, alt: EwScenarioId | null): EwScenarioId | null {
  return alt && allowedAlternatives(primary).includes(alt) ? alt : null;
}

/** В задании одна разметка: по одной метке impulse, коррекции и уровня invalidation (последняя заменяет прежнюю). hline получает роль ew-invalidation. */
export function keepEwMarks(next: readonly Mark[]): Mark[] {
  const lastOf = (pred: (m: Mark) => boolean) => [...next].reverse().find(pred);
  const impulse = lastOf((m) => m.kind === 'ew-impulse');
  const corr = lastOf(isCorrection);
  const line = lastOf(isInvalidation);
  return next
    .filter((m) => m === impulse || m === corr || m === line || (m.kind !== 'ew-impulse' && !isCorrection(m) && !isInvalidation(m)))
    .map((m) => (m === line && m.meta?.role !== INVALIDATION_ROLE ? { ...m, meta: { ...m.meta, role: INVALIDATION_ROLE } } : m));
}

export interface EwUserMarks {
  impulse: Mark | null;
  correction: Mark | null;
}

export function userEwMarks(marks: readonly Mark[]): EwUserMarks {
  const mine = marks.filter((m) => m.author === 'user');
  const impulse = [...mine].reverse().find((m) => m.kind === 'ew-impulse' && [3, 5, 6].includes(m.anchors.length)) ?? null;
  const correction = impulse?.anchors.length === 6 ? ([...mine].reverse().find((m) => isCorrection(m) && m.anchors.length === 3) ?? null) : null;
  return { impulse, correction };
}

/** Цена горизонтали invalidation на графике. */
export function invalidationOf(marks: readonly Mark[]): number | null {
  const m = [...marks].reverse().find((x) => isInvalidation(x) && x.anchors.length === 1);
  return m ? m.anchors[0]!.price : null;
}

/** Горизонталь invalidation, введённая ценой (время - правая свеча ряда). */
export function invalidationMarkAt(price: number, time: number): Mark {
  return { id: 'user-ew-invalidation', kind: 'hline', anchors: [{ time, price }], scope: null, direction: null, meta: { role: INVALIDATION_ROLE }, author: 'user' };
}

/** Число из поля ввода: положительное конечное либо null. */
export function parsePrice(text: string): number | null {
  const n = Number(text.trim().replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export interface EwFormState {
  kind: EwTaskKind;
  marks: readonly Mark[];
  primary: EwPrimaryScenario | null;
  alternative: EwScenarioId | null;
  invalidation: number | null;
  alternativeRequired: boolean;
}
export type EwAnswerOrError = { answer: Extract<Answer, { kind: EwTaskKind }> } | { error: keyof typeof ewx.input };

export function ewAnswer(s: EwFormState): EwAnswerOrError {
  const { impulse, correction } = userEwMarks(s.marks);
  if (!impulse) return { error: 'noImpulse' };
  if (!s.primary) return { error: 'noPrimary' };
  if (s.alternativeRequired && !s.alternative) return { error: 'noAlt' };
  if (s.invalidation === null) return { error: 'noInv' };
  return {
    answer: {
      kind: s.kind,
      impulse: impulse as never,
      correction: (correction as never) ?? null,
      primary: s.primary,
      alternative: reconcileAlternative(s.primary, s.alternative),
      invalidation: s.invalidation,
    },
  };
}

/** Сценарий, который следует из разметки (3/5/6 точек, 6 + коррекция). */
export function impliedFromMarks(marks: readonly Mark[]): EwPrimaryScenario | null {
  const { impulse, correction } = userEwMarks(marks);
  return impulse ? impliedScenario(impulse.anchors.length, correction !== null) : null;
}

export const PRIMARY_OPTIONS = EW_PRIMARY_OPTIONS;

/** Нужное число точек: easy 6, medium 6 + 3, hard - любое допустимое (null). */
export function requiredPoints(kind: EwTaskKind): { impulse: number; correction: number } | null {
  if (kind === 'ew-impulse') return { impulse: 6, correction: 0 };
  if (kind === 'ew-impulse-correction') return { impulse: 6, correction: 3 };
  return null;
}

export type LiveCheck = Pick<EwCheck, 'orderBroken' | 'points' | 'rules' | 'guides'>;
export interface LiveHint {
  id: string;
  text: string;
  tone: 'rule' | 'soft';
}

/** Мягкие подсказки по черновику: порядок, экстремумы, правила (первыми), затем рекомендации. Ничего не блокирует. */
export function liveHints(checks: readonly LiveCheck[], mismatch = false): LiveHint[] {
  const out: LiveHint[] = [];
  for (const c of checks) {
    if (c.orderBroken) {
      out.push({ id: 'order', text: ewx.live.order, tone: 'rule' });
      continue;
    }
    for (const p of c.points) {
      if (!p.extreme) out.push({ id: `extreme-${p.label}`, text: ewx.live.notExtreme(p.label), tone: 'rule' });
      else if (!p.swing) out.push({ id: `swing-${p.label}`, text: ewx.live.notSwing(p.label), tone: 'soft' });
    }
    for (const r of c.rules) if (!r.ok) out.push({ id: `rule-${r.rule}`, text: ewx.live.rule(ewx.live.rules[r.rule]), tone: 'rule' });
    for (const g of c.guides) if (!g.ok) out.push({ id: `guide-${g.guide}`, text: ewx.live.guide(ewx.live.guides[g.guide]), tone: 'soft' });
  }
  if (mismatch) out.push({ id: 'mismatch', text: ewx.live.mismatch, tone: 'soft' });
  return out;
}

export const liveChecks = (results: readonly EwMarkCheck[]): LiveCheck[] => results.map((r) => r.check);
