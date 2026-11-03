'use client';
import { ScanSearch, Trash2 } from 'lucide-react';
import type { Mark } from '@tl/core';
import { formatPrice } from '@/chart/drawing/layout';
import { TOOL_DEFS, type DrawKind } from '@/chart/drawing/tools';
import { Button, IconButton, cn } from '@/ui';
import { tx } from './strings';

const when = (t: number) => {
  const d = new Date(t);
  return `${d.getDate()} ${d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const markTitle = (m: Mark) => TOOL_DEFS[m.kind as DrawKind]?.label || tx.tools_[m.kind as keyof typeof tx.tools_] || m.kind;

/** Правая панель десктопа: список меток и «Проверить мою разметку» (неактивна до M2). */
export function MarksPanel({
  marks,
  selectedId,
  onSelect,
  onDelete,
}: {
  marks: Mark[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside aria-label={tx.marksPanel} className="hidden w-(--panel-w) shrink-0 flex-col border-l border-border bg-surface-1 lg:flex">
      <div className="border-b border-border p-3">
        <h2 className="text-sm font-semibold">{tx.marksPanel}</h2>
        <p className="tnum text-sm text-text-2">{tx.yours(marks.length)}</p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto" aria-label={tx.marksPanel}>
        {marks.length === 0 && (
          <li className="p-3 text-sm text-text-2">
            <p className="font-medium text-text-1">{tx.marksEmpty}</p>
            <p>{tx.hint}</p>
          </li>
        )}
        {marks.map((m) => (
          <li key={m.id} className={cn('flex items-center border-b border-border', m.id === selectedId && 'bg-accent-muted')}>
            <button type="button" onClick={() => onSelect(m.id)} className="flex min-h-11 flex-1 cursor-pointer flex-col items-start justify-center px-3 text-left">
              <span className="text-sm font-medium">{markTitle(m)}</span>
              <span className="tnum text-xs text-text-2">
                {when(m.anchors[0]!.time)} · {formatPrice(m.anchors[0]!.price)}
              </span>
            </button>
            <IconButton label={`${tx.deleteMark}: ${markTitle(m)}`} icon={<Trash2 size={20} strokeWidth={1.75} />} onClick={() => onDelete(m.id)} />
          </li>
        ))}
      </ul>
      <div className="border-t border-border p-3">
        <Button variant="primary" disabled icon={<ScanSearch size={20} strokeWidth={1.75} />} className="w-full" title={tx.checkDisabled}>
          {tx.checkFull}
        </Button>
        <p className="mt-2 text-xs text-text-2">{tx.checkDisabled}</p>
      </div>
    </aside>
  );
}
