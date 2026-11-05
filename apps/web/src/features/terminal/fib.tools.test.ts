import { describe, expect, it } from 'vitest';
import { GROUPS, HOTKEYS, MOBILE_GROUPS, TOOL_ICON, groupOf } from './toolCatalog';
import { instructionText } from './InstructionBar';
import { tx } from './strings';

const base = { notice: null, selected: null, fmt: (p: number) => String(p) };

describe('группа «Фибо»', () => {
  it('есть в рейке и мобильной панели, подпись «Фибо», два инструмента с иконками', () => {
    for (const groups of [GROUPS, MOBILE_GROUPS]) {
      const g = groups.find((x) => x.id === 'fib')!;
      expect(g.tools).toEqual(['fib-retracement', 'fib-extension']);
      expect(tx.groups.fib).toBe('Фибо');
    }
    expect(TOOL_ICON['fib-retracement']).toBeTruthy();
    expect(groupOf('fib-extension')).toBe('fib');
  });
  it('горячая клавиша G', () => {
    expect(HOTKEYS['g']).toBe('fib-retracement');
  });
});

describe('строка-инструкция Фибо', () => {
  it('retracement: шаг 0 - общая, шаг 1 - про точку B', () => {
    expect(instructionText({ ...base, tool: 'fib-retracement', step: 0 }).text).toContain('1) нажмите на начало импульса (A)');
    expect(instructionText({ ...base, tool: 'fib-retracement', step: 1 }).text).toContain('(B)');
  });
  it('extension: три разных шага', () => {
    const t = [0, 1, 2].map((step) => instructionText({ ...base, tool: 'fib-extension', step }).text);
    expect(new Set(t).size).toBe(3);
    expect(t[2]).toContain('(C)');
  });
  it('position не изменился: шаги 1 и 2 - «вход задан»', () => {
    expect(instructionText({ ...base, tool: 'position', step: 2 }).text).toContain('вход задан');
  });
});
