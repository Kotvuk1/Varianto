import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { fibExtensionAnswer, fibGridAnswer, fibReactionAnswer, keepLastFib, optionFromLevel, optionRatio, userFibMarks } from './adapters';

// SYNTHETIC: чистая логика адаптеров ответа; координаты меток не привязаны к рынку
const mark = (id: string, kind: Mark['kind'], n: number, author: Mark['author'] = 'user'): Mark => ({
  id,
  kind,
  anchors: Array.from({ length: n }, (_, i) => ({ time: 1000 * (i + 1), price: 100 + i })),
  scope: null,
  direction: null,
  author,
});

describe('метки сетки', () => {
  it('в задании одна сетка: новая заменяет прежнюю, чужие метки остаются', () => {
    const a = mark('a', 'fib-retracement', 2);
    const b = mark('b', 'fib-retracement', 2);
    const other = mark('o', 'hline', 1);
    expect(keepLastFib([a, other, b], 'fib-retracement').map((m) => m.id)).toEqual(['o', 'b']);
  });
  it('неполная сетка и сетка эталона не попадают в ответ', () => {
    expect(userFibMarks([mark('a', 'fib-retracement', 1), mark('b', 'fib-retracement', 2, 'algo')], 'fib-retracement')).toEqual([]);
    expect(fibGridAnswer([])).toBeNull();
  });
  it('ответ «Построй сетку» несёт последнюю метку', () => {
    const m = mark('a', 'fib-retracement', 2);
    expect(fibGridAnswer([m])).toEqual({ kind: 'fib-grid', mark: m });
  });
  it('ответ Extension требует три якоря и цель', () => {
    const m = mark('e', 'fib-extension', 3);
    expect(fibExtensionAnswer([m], null)).toBeNull();
    expect(fibExtensionAnswer([mark('x', 'fib-extension', 2)], '1')).toBeNull();
    expect(fibExtensionAnswer([m], '1.272')).toEqual({ kind: 'fib-extension', mark: m, target: '1.272' });
  });
});

describe('ответ «Где реакция?»', () => {
  const order = ['order-block', 'fvg', 'level'] as const;
  it('конфлюэнс в порядке задания, без дубликатов', () => {
    expect(fibReactionAnswer('0.618', new Set(['level', 'order-block']), order, 'discount')).toEqual({
      kind: 'fib-reaction',
      option: '0.618',
      confluence: ['order-block', 'level'],
      pd: 'discount',
    });
  });
  it('для deep конфлюэнс не отправляется (FIB_CONFLUENCE_INVALID)', () => {
    expect(fibReactionAnswer('deep', new Set(['fvg']), order, null).confluence).toEqual([]);
  });
  it('pd null при отсутствии вопроса', () => {
    expect(fibReactionAnswer('0.5', new Set(), order, null).pd).toBeNull();
  });
});

describe('уровни', () => {
  const avail = ['0.382', '0.5', '0.618', 'ote'] as const;
  it('касание линии выбирает доступный вариант', () => {
    expect(optionFromLevel(0.618, avail)).toBe('0.618');
    expect(optionFromLevel(0.5, avail)).toBe('0.5');
  });
  it('недоступный и служебный уровни игнорируются', () => {
    expect(optionFromLevel(0.786, avail)).toBeNull();
    expect(optionFromLevel(0, avail)).toBeNull();
    expect(optionFromLevel(1, avail)).toBeNull();
  });
  it('подсветка: только у вариантов-уровней', () => {
    expect(optionRatio('0.705')).toBe(0.705);
    expect(optionRatio('ote')).toBeNull();
    expect(optionRatio('deep')).toBeNull();
    expect(optionRatio(null)).toBeNull();
  });
});
