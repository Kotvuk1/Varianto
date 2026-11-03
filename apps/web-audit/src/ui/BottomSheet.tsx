'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ru } from '@/i18n/ru';
import { cn } from './cn';
import { IconButton } from './IconButton';

export type SheetHeight = 'peek' | 'medium' | 'full';

const HEIGHT: Record<SheetHeight, string> = {
  peek: 'h-[120px]',
  medium: 'h-[50dvh]',
  full: 'h-[min(90dvh,calc(100dvh-var(--topbar-h)))]',
};

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Закреплённый низ с кнопками. */
  footer?: ReactNode;
  height?: SheetHeight;
  /** Модальная: скрим, клик по скриму закрывает. Немодальная: график остаётся интерактивным. */
  modal?: boolean;
}

/**
 * Шторка (COMPONENTS §2.6). На экранах >= 1024 px показывается диалогом 480 px по центру.
 * Фокус: на заголовок при открытии, на вызвавший элемент при закрытии.
 */
export function BottomSheet({ open, onClose, title, children, footer, height = 'medium', modal = true }: BottomSheetProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<Element | null>(null);
  const drag = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, [open]);

  if (!open) return null;

  const dragHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      drag.current = e.clientY;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (drag.current !== null) setDragY(Math.max(0, e.clientY - drag.current));
    },
    onPointerUp: () => {
      const moved = dragY;
      drag.current = null;
      setDragY(0);
      if (moved > 80) onClose();
    },
    onPointerCancel: () => {
      drag.current = null;
      setDragY(0);
    },
  };

  return (
    <>
      {modal && (
        <div
          data-testid="sheet-scrim"
          className="fixed inset-0 z-30 bg-scrim"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        role="dialog"
        aria-modal={modal}
        aria-labelledby={titleId}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        className={cn(
          'sheet-in fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] flex-col rounded-t-lg bg-surface-2 shadow-raised',
          'pb-[env(safe-area-inset-bottom)] lg:top-1/2 lg:bottom-auto lg:h-auto lg:max-h-[80dvh] lg:-translate-y-1/2 lg:rounded-lg',
          HEIGHT[height],
        )}
      >
        <div {...dragHandlers} className="shrink-0 touch-none lg:touch-auto">
          <div className="flex h-5 items-center justify-center lg:hidden" aria-hidden="true">
            <span className="h-1 w-10 rounded-full bg-border-strong" />
          </div>
          <div className="flex h-12 items-center justify-between pr-1 pl-4">
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-lg font-semibold outline-none">
              {title}
            </h2>
            <IconButton
              label={ru.actions.close}
              icon={<X size={20} strokeWidth={1.75} />}
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{children}</div>
        {footer && <div className="flex shrink-0 gap-2 border-t border-border p-3">{footer}</div>}
      </div>
    </>
  );
}
