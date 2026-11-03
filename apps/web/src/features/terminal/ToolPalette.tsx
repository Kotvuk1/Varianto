'use client';
import { ScanSearch } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ToolId } from '@/chart/drawing/tools';
import { cn } from '@/ui';
import { tx } from './strings';
import { GROUPS, groupOf, HOTKEY_OF, MOBILE_GROUPS, TOOL_ICON, type GroupId, type TerminalTool, type ToolGroup } from './toolCatalog';

export interface ToolPaletteProps {
  tool: ToolId | null;
  onTool: (t: TerminalTool) => void;
  /** Запуск проверки разметки (кнопка «Проверить»). */
  onCheck?: () => void;
}

const name = (t: TerminalTool) => tx.tools_[t];

interface CellProps {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  group?: boolean;
  expanded?: boolean;
  onClick: () => void;
  className?: string;
  testId?: string;
  shortcut?: string;
}

/** Кнопка рейки/панели: иконка и подпись 11 px под ней. */
function Cell({ label, icon, selected = false, group = false, expanded, onClick, className, testId, shortcut }: CellProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={group ? undefined : selected}
      aria-expanded={group ? expanded : undefined}
      aria-haspopup={group ? 'true' : undefined}
      aria-keyshortcuts={shortcut}
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'relative flex min-w-0 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md px-0.5',
        selected ? 'bg-accent text-on-accent' : 'text-text-2 hover:bg-surface-2 hover:text-text-1',
        className,
      )}
    >
      {icon}
      <span aria-hidden className="max-w-full text-[11px] leading-[14px] font-medium whitespace-nowrap">
        {label}
      </span>
      {group && (
        <span aria-hidden className="absolute right-1 bottom-1 size-0 border-x-[3px] border-t-0 border-b-[3px] border-x-transparent border-b-current" />
      )}
    </button>
  );
}

/** Мобильная нижняя панель: 5 групп, Ластик и «Проверить» в одну строку (360 px, без прокрутки): ширина по подписи (11 px) плюс равная доля остатка, минимум 44 px. */
export function MobileToolbar({ tool, onTool, onCheck }: ToolPaletteProps) {
  const [fan, setFan] = useState<GroupId | null>(null);
  const active = groupOf(tool, MOBILE_GROUPS);
  const fanGroup = MOBILE_GROUPS.find((g) => g.id === fan);
  const pick = (t: TerminalTool) => {
    onTool(t);
    setFan(null);
  };
  const clickGroup = (g: ToolGroup) => {
    if (g.tools.length === 1) pick(g.tools[0]!);
    else setFan((f) => (f === g.id ? null : g.id));
  };
  return (
    <div className="lg:hidden">
      {fanGroup && (
        <div role="toolbar" aria-label={tx.groups[fanGroup.id]} data-testid="tool-fan" className="flex h-14 border-t border-border bg-surface-2">
          {fanGroup.tools.map((t) => (
            <Cell key={t} label={name(t)} icon={TOOL_ICON[t]} selected={tool === t} onClick={() => pick(t)} className="h-14 min-w-11 flex-auto" />
          ))}
        </div>
      )}
      <div
        role="toolbar"
        aria-label={tx.tools}
        className="flex h-[calc(var(--toolbar-h)+env(safe-area-inset-bottom))] border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]"
      >
        {MOBILE_GROUPS.map((g) => {
          const multi = g.tools.length > 1;
          const on = active === g.id;
          return (
            <Cell
              key={g.id}
              label={tx.groups[g.id]}
              icon={on && multi ? TOOL_ICON[tool as TerminalTool] : g.icon}
              group={multi}
              expanded={fan === g.id}
              selected={on}
              onClick={() => clickGroup(g)}
              className="h-14 min-w-11 flex-auto"
            />
          );
        })}
        <Cell label={tx.tools_.eraser} icon={TOOL_ICON.eraser} selected={tool === 'eraser'} onClick={() => pick('eraser')} className="h-14 min-w-11 flex-auto" />
        <button
          type="button"
          title={tx.checkHint}
          aria-label={tx.checkFull}
          data-testid="check-button-mobile"
          onClick={onCheck}
          className="flex h-14 min-w-11 flex-auto cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md px-0.5 text-text-1 hover:bg-surface-2"
        >
          <ScanSearch size={24} strokeWidth={1.75} aria-hidden />
          <span aria-hidden className="max-w-full text-[11px] leading-[14px] font-medium whitespace-nowrap">
            {tx.check}
          </span>
        </button>
      </div>
    </div>
  );
}

/** Десктопная рейка: 6 групп с подписью, flyout со списком инструментов (иконка, название, клавиша), Ластик внизу. */
export function DesktopRail({ tool, onTool }: ToolPaletteProps) {
  const [open, setOpen] = useState<GroupId | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const active = groupOf(tool);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (t: TerminalTool) => {
    onTool(t);
    setOpen(null);
  };

  return (
    <div ref={ref} role="toolbar" aria-label={tx.tools} aria-orientation="vertical" className="relative z-20 hidden w-16 shrink-0 flex-col border-r border-border bg-surface-1 py-1 lg:flex">
      <div className="flex flex-1 flex-col items-center gap-1 px-1">
        {GROUPS.map((g) => {
          const multi = g.tools.length > 1;
          const on = active === g.id;
          return (
            <div key={g.id} className="relative w-full">
              <Cell
                label={tx.groups[g.id]}
                icon={on && multi ? TOOL_ICON[tool as TerminalTool] : g.icon}
                group={multi}
                expanded={open === g.id}
                selected={on}
                shortcut={g.id === 'select' ? 'V' : undefined}
                onClick={() => (multi ? setOpen((o) => (o === g.id ? null : g.id)) : pick(g.tools[0]!))}
                className="h-14 w-full"
              />
              {multi && open === g.id && (
                <div
                  role="toolbar"
                  aria-label={tx.groups[g.id]}
                  aria-orientation="vertical"
                  data-testid="tool-flyout"
                  className="absolute top-0 left-full z-30 ml-2 w-56 rounded-md border border-border-strong bg-surface-1 py-1 shadow-lg"
                >
                  {g.tools.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-label={name(t)}
                      aria-pressed={tool === t}
                      aria-keyshortcuts={HOTKEY_OF[t]}
                      onClick={() => pick(t)}
                      className={cn(
                        'flex h-11 w-full cursor-pointer items-center gap-3 px-3 text-left text-sm',
                        tool === t ? 'bg-accent text-on-accent' : 'text-text-1 hover:bg-surface-2',
                      )}
                    >
                      <span className="flex w-6 shrink-0 items-center justify-center">{TOOL_ICON[t]}</span>
                      <span aria-hidden className="flex-1">
                        {name(t)}
                      </span>
                      {HOTKEY_OF[t] && (
                        <kbd aria-hidden className="rounded-sm border border-current px-1.5 text-xs opacity-70">
                          {HOTKEY_OF[t]}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center border-t border-border px-1 pt-1">
        <Cell label={tx.tools_.eraser} icon={TOOL_ICON.eraser} selected={tool === 'eraser'} shortcut="E" onClick={() => pick('eraser')} className="h-14 w-full" />
      </div>
    </div>
  );
}
