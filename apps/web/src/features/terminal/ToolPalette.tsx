'use client';
import { ScanSearch } from 'lucide-react';
import { useState } from 'react';
import type { ToolId } from '@/chart/drawing/tools';
import { Toolbar, ToolButton } from '@/ui';
import { GROUPS, groupOf, TOOL_ICON, type GroupId, type TerminalTool } from './toolCatalog';
import { tx } from './strings';

export interface ToolPaletteProps {
  tool: ToolId | null;
  onTool: (t: TerminalTool) => void;
}

const name = (t: TerminalTool) => tx.tools_[t];

/** Мобильная нижняя панель: Выбор, группы с «веером», Ластик, Проверить (LAYOUTS 2.1). */
export function MobileToolbar({ tool, onTool }: ToolPaletteProps) {
  const [fan, setFan] = useState<GroupId | null>(null);
  const [last, setLast] = useState<Record<GroupId, TerminalTool>>({ structure: 'bos', zones: 'order-block', lines: 'level' });
  const active = groupOf(tool);
  const fanGroup = GROUPS.find((g) => g.id === fan);
  const pick = (t: TerminalTool) => {
    const g = groupOf(t);
    if (g) setLast((l) => ({ ...l, [g]: t }));
    onTool(t);
    setFan(null);
  };
  return (
    <div className="lg:hidden">
      {fanGroup && (
        <div
          role="toolbar"
          aria-label={tx.groups[fanGroup.id]}
          data-testid="tool-fan"
          className="flex h-14 overflow-x-auto border-t border-border bg-surface-2"
        >
          {fanGroup.tools.map((t) => (
            <ToolButton
              key={t}
              label={name(t)}
              icon={TOOL_ICON[t]}
              selected={tool === t}
              onClick={() => pick(t)}
              className="size-14 w-14"
            />
          ))}
        </div>
      )}
      <Toolbar label={tx.tools}>
        <ToolButton label={tx.tools_.select} icon={TOOL_ICON.select} selected={tool === 'select'} onClick={() => pick('select')} />
        {GROUPS.map((g) => (
          <ToolButton
            key={g.id}
            label={tx.groups[g.id]}
            icon={active === g.id ? TOOL_ICON[tool as TerminalTool] : g.icon}
            hasGroup
            selected={active === g.id}
            aria-expanded={fan === g.id}
            onClick={() => setFan((f) => (f === g.id ? null : g.id))}
            onDoubleClick={() => pick(last[g.id])}
          />
        ))}
        <ToolButton label={tx.tools_.eraser} icon={TOOL_ICON.eraser} selected={tool === 'eraser'} onClick={() => pick('eraser')} />
        <button
          type="button"
          aria-disabled="true"
          title={tx.checkDisabled}
          aria-label={`${tx.checkFull}. ${tx.checkDisabled}`}
          className="m-1 ml-auto flex h-12 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-md border border-border px-1 text-sm font-medium text-text-3"
        >
          <ScanSearch size={20} strokeWidth={1.75} aria-hidden />
          {tx.check}
        </button>
      </Toolbar>
    </div>
  );
}

/** Десктопная рейка 56 px: все инструменты столбцом, группы с разделителями. */
export function DesktopRail({ tool, onTool }: ToolPaletteProps) {
  return (
    <div className="hidden lg:flex">
      <Toolbar label={tx.tools} orientation="vertical" className="overflow-y-auto">
        <ToolButton label={`${tx.tools_.select} (V)`} icon={TOOL_ICON.select} selected={tool === 'select'} onClick={() => onTool('select')} />
        {GROUPS.map((g) => (
          <div key={g.id} role="group" aria-label={tx.groups[g.id]} className="flex flex-col items-center gap-1 border-t border-border pt-1">
            {g.tools.map((t) => (
              <ToolButton key={t} label={name(t)} icon={TOOL_ICON[t]} selected={tool === t} onClick={() => onTool(t)} showLabel={false} />
            ))}
          </div>
        ))}
        <div className="flex flex-col items-center gap-1 border-t border-border pt-1">
          <ToolButton label={`${tx.tools_.eraser} (E)`} icon={TOOL_ICON.eraser} selected={tool === 'eraser'} onClick={() => onTool('eraser')} showLabel={false} />
        </div>
      </Toolbar>
    </div>
  );
}
