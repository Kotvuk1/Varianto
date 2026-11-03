'use client';
import { Trash2 } from 'lucide-react';
import type { Mark } from '@tl/core';
import { BottomSheet, IconButton, cn } from '@/ui';
import { describeMark, markName } from './markText';
import { tx } from './strings';

export interface MarksSheetProps {
  open: boolean;
  onClose: () => void;
  marks: Mark[];
  selectedId: string | null;
  fmt: (p: number) => string;
  /** Выбор метки из списка: график центрируется на ней. */
  onFocus: (m: Mark) => void;
  onDelete: (id: string) => void;
}

/** Список меток пользователя: выдвижной лист по кнопке «Разметка (N)». */
export function MarksSheet({ open, onClose, marks, selectedId, fmt, onFocus, onDelete }: MarksSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={tx.marksTitle} height="medium">
      {marks.length === 0 ? (
        <div className="text-sm text-text-2">
          <p className="font-medium text-text-1">{tx.marksEmpty}</p>
          <p>{tx.hint}</p>
        </div>
      ) : (
        <ul aria-label={tx.marksTitle} data-testid="marks-list">
          {marks.map((m) => (
            <li key={m.id} className={cn('flex items-center border-b border-border', m.id === selectedId && 'bg-accent-muted')}>
              <button
                type="button"
                title={tx.focusMark}
                onClick={() => onFocus(m)}
                className="tnum flex min-h-11 flex-1 cursor-pointer items-center px-1 py-2 text-left text-sm"
              >
                {describeMark(m, fmt)}
              </button>
              <IconButton label={`${tx.deleteMark}: ${markName(m)}`} icon={<Trash2 size={20} strokeWidth={1.75} />} onClick={() => onDelete(m.id)} />
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
