import { describe, expect, it } from 'vitest';
import { msToolGroups } from '@/features/session/toolGroups';
import { instructionText } from './InstructionBar';
import { tx } from './strings';
import { GROUPS, HOTKEYS, MOBILE_GROUPS, TOOL_ICON, groupOf } from './toolCatalog';

const base = { notice: null, selected: null, fmt: (p: number) => String(p) };

describe('группа «Уровни»', () => {
  it('в терминале: зона и лимитка с иконками, подпись «Уровни», клавиша Z', () => {
    const g = GROUPS.find((x) => x.id === 'levels')!;
    expect(g.tools).toEqual(['zone', 'limit']);
    expect(tx.groups.levels).toBe('Уровни');
    expect(HOTKEYS['z']).toBe('zone');
    for (const t of g.tools) expect(TOOL_ICON[t]).toBeTruthy();
    expect(groupOf('limit')).toBe('levels');
  });
  it('мобильная панель: «Уровни» (с линиями и позицией), число кнопок не выросло', () => {
    const g = MOBILE_GROUPS.find((x) => x.id === 'levels')!;
    expect(g.tools).toEqual(expect.arrayContaining(['zone', 'limit', 'position', 'level', 'hline']));
    expect(MOBILE_GROUPS).toHaveLength(6);
  });
  it('в заданиях группа есть, только если tools содержит zone/limit', () => {
    expect(msToolGroups(['hline', 'bos']).some((g) => g.id === 'levels')).toBe(false);
    expect(msToolGroups(['zone']).find((g) => g.id === 'levels')!.tools.map((t) => t.id)).toEqual(['zone']);
    expect(msToolGroups(['zone', 'limit']).find((g) => g.id === 'levels')!.tools.map((t) => t.id)).toEqual(['zone', 'limit']);
    expect(msToolGroups(['limit']).find((g) => g.id === 'levels')!.label).toBe('Уровни');
  });
  it('строка-инструкция: зона по шагам, лимитка', () => {
    expect(instructionText({ ...base, tool: 'zone', step: 0 }).text).toContain('протяните');
    expect(instructionText({ ...base, tool: 'zone', step: 1 }).text).toContain('второй край');
    expect(instructionText({ ...base, tool: 'limit', step: 0 }).text).toContain('Limit');
    expect(instructionText({ ...base, tool: 'zone', step: 1, notice: 'zone-flat' }).warn).toBe(true);
  });
});
