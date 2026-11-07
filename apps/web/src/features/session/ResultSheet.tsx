'use client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { ss } from '@/i18n/ru/session';
import { IconButton, cn } from '@/ui';

export type ResultSheetHeight = 'peek' | 'medium' | 'full';

/** Высоты шторки разбора: свёрнут ~25%, средний ~55%, полный (LAYOUTS §4.1). */
export const SHEET_CLASS: Record<ResultSheetHeight, string> = {
  peek: 'h-[25dvh]',
  medium: 'h-[55dvh]',
  full: 'h-[min(92dvh,calc(100dvh-var(--topbar-h)))]',
};
/** Отступ под график: при полной шторке график остаётся видимым в верхней части. */
export const SHEET_PAD: Record<ResultSheetHeight, string> = { peek: '25dvh', medium: '55dvh', full: '55dvh' };

const ORDER: ResultSheetHeight[] = ['peek', 'medium', 'full'];

export interface ResultSheetProps {
  title: string;
  height: ResultSheetHeight;
  onHeight: (h: ResultSheetHeight) => void;
  children: ReactNode;
  footer: ReactNode;
}

/** Немодальная шторка разбора на трёх высотах; график над ней остаётся интерактивным. */
export function ResultSheet({ title, height, onHeight, children, footer }: ResultSheetProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  const i = ORDER.indexOf(height);
  const startY = useRef<number | null>(null);
  return (
    <div
      role="dialog"
      aria-modal={false}
      aria-labelledby={titleId}
      data-testid="result-sheet"
      data-height={height}
      className={cn(
        'sheet-in fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] flex-col rounded-t-lg bg-surface-2 pb-[env(safe-area-inset-bottom)] shadow-raised',
        SHEET_CLASS[height],
      )}
    >
      <div
        className="shrink-0 touch-none"
        onPointerDown={(e) => {
          startY.current = e.clientY;
        }}
        onPointerUp={(e) => {
          if (startY.current === null) return;
          const dy = e.clientY - startY.current;
          startY.current = null;
          if (dy < -40 && i < 2) onHeight(ORDER[i + 1]!);
          else if (dy > 40 && i > 0) onHeight(ORDER[i - 1]!);
        }}
      >
        <div className="flex h-4 items-center justify-center" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-border-strong" />
        </div>
        <div className="flex h-12 items-center justify-between pr-1 pl-4">
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            {title}
          </h2>
          <div className="flex" onPointerDown={(e) => e.stopPropagation()}>
            <IconButton
              label={height === 'full' ? ss.collapseSheet : ss.expandSheet}
              icon={height === 'full' ? <ChevronDown size={20} strokeWidth={1.75} /> : <ChevronUp size={20} strokeWidth={1.75} />}
              onClick={() => onHeight(ORDER[(i + 1) % 3]!)}
              data-testid="sheet-toggle"
            />
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{children}</div>
      <div className="flex shrink-0 gap-2 border-t border-border p-3">{footer}</div>
    </div>
  );
}
