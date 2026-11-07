'use client';
import { ScanSearch } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ToolId } from '@/chart/drawing/tools';
import { ss } from '@/i18n/ru/session';
import { cn } from '@/ui';
import { ERASER, type ToolGroupDef } from './toolGroups';

export interface TaskToolbarProps {
  groups: readonly ToolGroupDef[];
  tool: ToolId;
  onTool: (t: ToolId) => void;
  onCheck: () => void;
  checkDisabled?: boolean;
  checking?: boolean;
}

const groupOf = (groups: readonly ToolGroupDef[], tool: ToolId) => groups.find((g) => g.tools.some((t) => t.id === tool))?.id ?? null;

function Cell({
  label,
  icon,
  selected = false,
  group = false,
  expanded,
  onClick,
  className,
  testId,
  title,
}: {
  title?: string;
  label: string;
  icon: ReactNode;
  selected?: boolean;
  group?: boolean;
  expanded?: boolean;
  onClick: () => void;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      aria-pressed={group ? undefined : selected}
      aria-expanded={group ? expanded : undefined}
      aria-haspopup={group ? 'true' : undefined}
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

/** Мобильная панель 56 px: группы понятий задания, ластик, «Проверить». Группа из нескольких инструментов раскрывается полосой над панелью. */
export function TaskToolbarBar({ groups, tool, onTool, onCheck, checkDisabled, checking }: TaskToolbarProps) {
  const [fan, setFan] = useState<string | null>(null);
  const active = groupOf(groups, tool);
  const fanGroup = groups.find((g) => g.id === fan);
  const pick = (t: ToolId) => {
    onTool(t);
    setFan(null);
  };
  return (
    <div>
      {fanGroup && (
        <div role="toolbar" aria-label={fanGroup.label} data-testid="tool-fan" className="flex h-14 border-t border-border bg-surface-2">
          {fanGroup.tools.map((t) => (
            <Cell key={t.id} label={t.label} icon={t.icon} selected={tool === t.id} onClick={() => pick(t.id)} className="h-14 min-w-11 flex-auto" />
          ))}
        </div>
      )}
      <div
        role="toolbar"
        aria-label={ss.tools}
        className="flex h-[calc(var(--toolbar-h)+env(safe-area-inset-bottom))] border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)]"
      >
        {groups.map((g) => {
          const multi = g.tools.length > 1;
          const on = active === g.id;
          const current = g.tools.find((t) => t.id === tool);
          return (
            <Cell
              key={g.id}
              label={g.label}
              title={g.title}
              icon={on && multi && current ? current.icon : g.icon}
              group={multi}
              expanded={fan === g.id}
              selected={on}
              onClick={() => (multi ? setFan((f) => (f === g.id ? null : g.id)) : pick(g.tools[0]!.id))}
              className="h-14 min-w-11 flex-auto"
            />
          );
        })}
        <Cell label={ERASER.label} icon={ERASER.icon} selected={tool === 'eraser'} onClick={() => pick('eraser')} className="h-14 min-w-11 flex-auto" />
        <button
          type="button"
          aria-label={ss.check}
          aria-disabled={checkDisabled || checking || undefined}
          aria-busy={checking || undefined}
          data-testid="check-button"
          onClick={onCheck}
          className="flex h-14 min-w-11 flex-auto cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md bg-accent px-0.5 text-on-accent hover:bg-accent-hover"
        >
          <ScanSearch size={24} strokeWidth={1.75} aria-hidden />
          <span aria-hidden className="max-w-full text-[11px] leading-[14px] font-medium whitespace-nowrap">
            {ss.check}
          </span>
        </button>
      </div>
    </div>
  );
}

/** Десктопная рейка 64 px: группы с подписью, flyout для групп из нескольких инструментов, ластик внизу. */
export function TaskToolRail({ groups, tool, onTool }: Omit<TaskToolbarProps, 'onCheck'>) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const active = groupOf(groups, tool);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const pick = (t: ToolId) => {
    onTool(t);
    setOpen(null);
  };
  return (
    <div ref={ref} role="toolbar" aria-label={ss.tools} aria-orientation="vertical" className="relative z-20 flex w-16 shrink-0 flex-col border-r border-border bg-surface-1 py-1">
      <div className="flex flex-1 flex-col items-center gap-1 px-1">
        {groups.map((g) => {
          const multi = g.tools.length > 1;
          const on = active === g.id;
          const current = g.tools.find((t) => t.id === tool);
          return (
            <div key={g.id} className="relative w-full">
              <Cell
                label={g.label}
              title={g.title}
                icon={on && multi && current ? current.icon : g.icon}
                group={multi}
                expanded={open === g.id}
                selected={on}
                onClick={() => (multi ? setOpen((o) => (o === g.id ? null : g.id)) : pick(g.tools[0]!.id))}
                className="h-14 w-full"
              />
              {multi && open === g.id && (
                <div role="toolbar" aria-label={g.label} data-testid="tool-flyout" className="absolute top-0 left-full z-30 ml-2 w-52 rounded-md border border-border-strong bg-surface-1 py-1 shadow-lg">
                  {g.tools.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-label={t.label}
                      aria-pressed={tool === t.id}
                      onClick={() => pick(t.id)}
                      className={cn('flex h-11 w-full cursor-pointer items-center gap-3 px-3 text-left text-sm', tool === t.id ? 'bg-accent text-on-accent' : 'text-text-1 hover:bg-surface-2')}
                    >
                      <span className="flex w-6 shrink-0 items-center justify-center">{t.icon}</span>
                      <span aria-hidden>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center border-t border-border px-1 pt-1">
        <Cell label={ERASER.label} icon={ERASER.icon} selected={tool === 'eraser'} onClick={() => pick('eraser')} className="h-14 w-full" />
      </div>
    </div>
  );
}
