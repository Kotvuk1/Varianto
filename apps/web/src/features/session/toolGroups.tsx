import { Minus, ScanSearch } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MarkKind } from '@tl/core';
import type { ToolId } from '@/chart/drawing/tools';
import { GROUPS, TOOL_ICON } from '@/features/terminal/toolCatalog';
import { tx } from '@/features/terminal/strings';
import { ss } from '@/i18n/ru/session';
import { paTx } from '@/i18n/ru/pa';

export interface ToolItem {
  id: ToolId;
  label: string;
  icon: ReactNode;
}
export interface ToolGroupDef {
  id: string;
  label: string;
  /** Полное название для tooltip. */
  title?: string;
  icon: ReactNode;
  tools: readonly ToolItem[];
}

const SELECT: ToolGroupDef = {
  id: 'select',
  label: ss.tool.select,
  icon: TOOL_ICON.select,
  tools: [{ id: 'select', label: ss.tool.select, icon: TOOL_ICON.select }],
};
export const ERASER: ToolItem = { id: 'eraser', label: ss.tool.eraser, icon: TOOL_ICON.eraser };

/** Группы рейки, суженные до понятий задания (payload.tools): остальные инструменты недоступны. */
export function msToolGroups(allowed: readonly (MarkKind | string)[]): ToolGroupDef[] {
  const set = new Set<string>(allowed);
  const groups: ToolGroupDef[] = [SELECT];
  for (const g of GROUPS) {
    if (g.id === 'select' || g.id === 'position') continue;
    const tools = g.tools.filter((t) => set.has(t)).map((t) => ({ id: t as ToolId, label: tx.tools_[t], icon: TOOL_ICON[t] }));
    if (tools.length) groups.push({ id: g.id, label: tx.groups[g.id], title: tx.groupTitles[g.id], icon: g.icon, tools });
  }
  return groups;
}

/** «Найди модель»: касание свечи инструментом выбора свечи (внутри - одиночная метка, превращаемая в pattern). */
export const PATTERN_TAP_TOOL: ToolId = 'swing-high';
export const paFindGroups = (): ToolGroupDef[] => [
  SELECT,
  { id: 'pattern', label: paTx.find.tool, icon: <ScanSearch size={24} strokeWidth={1.75} aria-hidden />, tools: [{ id: PATTERN_TAP_TOOL, label: paTx.find.tool, icon: <ScanSearch size={24} strokeWidth={1.75} aria-hidden /> }] },
];
export const paLevelGroups = (): ToolGroupDef[] => [
  SELECT,
  { id: 'level', label: paTx.level.tool, icon: <Minus size={24} strokeWidth={1.75} aria-hidden />, tools: [{ id: 'level', label: paTx.level.tool, icon: <Minus size={24} strokeWidth={1.75} aria-hidden /> }] },
];
