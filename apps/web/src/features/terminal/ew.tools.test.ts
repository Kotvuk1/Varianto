import { describe, expect, it } from 'vitest';
import { GROUPS, HOTKEYS, MOBILE_GROUPS, TOOL_ICON, groupOf } from './toolCatalog';
import { instructionText } from './InstructionBar';
import { tx } from './strings';
import { msToolGroups } from '../session/toolGroups';
import { liveHints } from '../elliott/adapters';

const base = { notice: null, selected: null, fmt: (p: number) => String(p) };

describe('группа «Волны»', () => {
  it('в рейке: импульс, зигзаг, плоская, инвалидация; подпись «Волны»; клавиша W', () => {
    const g = GROUPS.find((x) => x.id === 'ew')!;
    expect(g.tools).toEqual(['ew-impulse', 'ew-zigzag', 'ew-flat', 'ew-invalidation']);
    expect(tx.groups.ew).toBe('Волны');
    expect(HOTKEYS['w']).toBe('ew-impulse');
    for (const t of g.tools) expect(TOOL_ICON[t]).toBeTruthy();
    expect(groupOf('ew-flat')).toBe('ew');
  });
  it('мобильная панель: 6 групп (Пробои и Зоны - в «SMC»), все группы достижимы', () => {
    expect(MOBILE_GROUPS.map((g) => g.id)).toEqual(['select', 'structure', 'smc', 'lines', 'fib', 'ew']);
    const all = new Set(MOBILE_GROUPS.flatMap((g) => g.tools));
    for (const t of ['order-block', 'fvg', 'position', 'ew-impulse']) expect(all.has(t as never)).toBe(true);
  });
  it('в заданиях группа есть, только если tools содержит ew-*', () => {
    expect(msToolGroups(['ew-impulse', 'ew-zigzag', 'ew-flat', 'hline']).map((g) => g.id)).toEqual(['select', 'lines', 'ew']);
    expect(msToolGroups(['hline', 'bos']).some((g) => g.id === 'ew')).toBe(false);
    expect(msToolGroups(['ew-impulse']).find((g) => g.id === 'ew')!.tools.map((t) => t.id)).toEqual(['ew-impulse']);
  });
});

describe('строка-инструкция Elliott', () => {
  it('импульс: общая подсказка, затем «точка N», «Готово» на 3 и 5', () => {
    expect(instructionText({ ...base, tool: 'ew-impulse', step: 0 }).text).toContain('0 → 5');
    expect(instructionText({ ...base, tool: 'ew-impulse', step: 1 }).text).toContain('Нажмите на точку 1');
    expect(instructionText({ ...base, tool: 'ew-impulse', step: 3 }).text).toContain('«Готово»');
    expect(instructionText({ ...base, tool: 'ew-impulse', step: 4 }).text).not.toContain('«Готово»');
    expect(instructionText({ ...base, tool: 'ew-impulse', step: 5 }).text).toContain('точку 5');
  });
  it('зигзаг/плоская: A, B, C', () => {
    expect(instructionText({ ...base, tool: 'ew-zigzag', step: 1 }).text).toContain('точку B');
    expect(instructionText({ ...base, tool: 'ew-flat', step: 2 }).text).toContain('точку C');
  });
  it('ошибка порядка точек', () => {
    expect(instructionText({ ...base, tool: 'ew-impulse', step: 2, notice: 'ew-order' }).text).toContain('правее');
  });
});

describe('живые подсказки правил', () => {
  it('нарушенное правило «wave 3 самая короткая» попадает в подсказки', () => {
    const hints = liveHints([{ orderBroken: false, points: [], guides: [], rules: [{ rule: 'w3-shortest', ok: false, actual: 1, limit: 2 }] }]);
    expect(hints[0]!.tone).toBe('rule');
    expect(hints[0]!.text).toContain('Проверьте правило');
    expect(tx.ewLive(hints[0]!.text, 2)).toContain('ещё замечаний: 2');
  });
});
