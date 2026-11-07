// Адаптеры Fibonacci: состояние UI -> Answer (FIBONACCI.md §9.3) и разбор ответа сервера -> данные для UI.
import type { FibConfluenceKey, FibReactionOption, FibTarget, Mark, PdSide } from '@tl/core';
import type { Answer, FibType } from '../session/types';

type FibKind = 'fib-retracement' | 'fib-extension';
const ANCHORS: Record<FibKind, number> = { 'fib-retracement': 2, 'fib-extension': 3 };

/** Метки пользователя нужного вида с полным набором якорей. */
export function userFibMarks(marks: readonly Mark[], kind: FibKind): Mark[] {
  return marks.filter((m) => m.author === 'user' && m.kind === kind && m.anchors.length === ANCHORS[kind]);
}

/** В задании одна сетка: новая заменяет прежнюю. */
export function keepLastFib(next: readonly Mark[], kind: FibKind): Mark[] {
  const same = next.filter((m) => m.kind === kind);
  const last = same[same.length - 1];
  return next.filter((m) => m.kind !== kind || m === last);
}

export function fibGridAnswer(marks: readonly Mark[]): Extract<Answer, { kind: 'fib-grid' }> | null {
  const m = userFibMarks(marks, 'fib-retracement').at(-1);
  return m ? { kind: 'fib-grid', mark: m as never } : null;
}

export function fibExtensionAnswer(marks: readonly Mark[], target: FibTarget | null): Extract<Answer, { kind: 'fib-extension' }> | null {
  const m = userFibMarks(marks, 'fib-extension').at(-1);
  return m && target ? { kind: 'fib-extension', mark: m as never, target } : null;
}

/** Порядок и дубликаты факторов: как в списке задания. */
export function fibReactionAnswer(option: FibReactionOption, confluence: ReadonlySet<FibConfluenceKey>, order: readonly FibConfluenceKey[], pd: PdSide | null): Extract<Answer, { kind: 'fib-reaction' }> {
  const list = option === 'deep' ? [] : order.filter((k) => confluence.has(k));
  return { kind: 'fib-reaction', option, confluence: list, pd };
}

/** Вариант-уровень -> доля для подсветки на сетке; OTE и deep уровня не имеют. */
export function optionRatio(option: FibReactionOption | null): number | null {
  if (!option || option === 'ote' || option === 'deep') return null;
  return Number(option);
}

/** Касание линии сетки -> вариант ответа; null - уровень не входит в доступные варианты. */
export function optionFromLevel(level: number, available: readonly FibReactionOption[]): FibReactionOption | null {
  const key = String(level) as FibReactionOption;
  return available.includes(key) ? key : null;
}

/** Тип задания проигрывает будущее (дата скрыта до итога). */
export const hasFuture = (type: FibType): boolean => type !== 'grid';
