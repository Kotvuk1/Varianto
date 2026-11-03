'use client';
import { Trash2, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import type { Mark } from '@tl/core';
import type { NoticeCode } from '@/chart/interaction/controller';
import type { ToolId } from '@/chart/drawing/tools';
import { IconButton, cn } from '@/ui';
import { describeMark } from './markText';
import { tx } from './strings';

export interface InstructionBarProps {
  tool: ToolId;
  /** Сколько касаний уже сделано в текущей метке. */
  step: number;
  notice: NoticeCode | null;
  selected: Mark | null;
  fmt: (p: number) => string;
  onCancel: () => void;
  onDelete: () => void;
  onDeselect: () => void;
  /** Сообщение проверки (например, нечего проверять): приоритетнее подсказки. */
  message?: string | null;
}

/** Текст строки-инструкции (без кнопок): выбор метки / предупреждение / инструмент и шаг. */
export function instructionText(p: Pick<InstructionBarProps, 'tool' | 'step' | 'notice' | 'selected' | 'fmt' | 'message'>): { text: string; warn: boolean } {
  if (p.message) return { text: p.message, warn: true };
  if (p.notice) return { text: tx.notice[p.notice], warn: true };
  if (p.selected) return { text: `${tx.selectedPrefix}: ${describeMark(p.selected, p.fmt)}`, warn: false };
  if (p.tool === 'select') return { text: tx.stripHint, warn: false };
  if (p.tool === 'eraser') return { text: `${tx.toolPrefix(tx.tools_.eraser)} — ${tx.eraserHelp}`, warn: false };
  const step2 = p.step > 0 ? (tx.helpStep2 as Record<string, string>)[p.tool] : undefined;
  return { text: `${tx.toolPrefix(tx.tools_[p.tool])} — ${step2 ?? tx.help[p.tool]}`, warn: false };
}

/**
 * Компактная полоса над графиком (не тост): инструмент и шаг, мягкое предупреждение, «Отмена».
 * Одна строка; при нехватке места - ellipsis, по нажатию раскрывается целиком.
 */
export function InstructionBar(props: InstructionBarProps) {
  const [expanded, setExpanded] = useState(false);
  const { text, warn } = instructionText(props);
  const drawing = props.tool !== 'select';
  return (
    <div data-testid="instruction-bar" className="flex min-h-11 min-w-0 flex-1 items-center gap-1">
      <button
        type="button"
        aria-expanded={expanded}
        title={text}
        onClick={() => setExpanded((e) => !e)}
        className={cn(
          'flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 text-left text-sm',
          warn ? 'text-text-1' : 'text-text-2',
        )}
      >
        {warn && <TriangleAlert size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />}
        <span data-testid="instruction-text" role={warn ? 'status' : undefined} className={cn('min-w-0 flex-1', expanded ? 'whitespace-normal' : 'truncate')}>
          {text}
        </span>
      </button>
      {props.selected && (
        <>
          <IconButton label={tx.deleteMark} icon={<Trash2 size={20} strokeWidth={1.75} />} onClick={props.onDelete} />
          <IconButton label={tx.clearSelection} icon={<X size={20} strokeWidth={1.75} />} onClick={props.onDeselect} />
        </>
      )}
      {!props.selected && drawing && (
        <button
          type="button"
          onClick={props.onCancel}
          className="h-11 shrink-0 cursor-pointer rounded-md border border-border-strong px-3 text-sm font-medium text-text-1 hover:bg-surface-2"
        >
          {tx.cancel}
        </button>
      )}
    </div>
  );
}
