'use client';

import { useState, type ReactNode } from 'react';
import { ru } from '@/i18n/ru';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

export interface HintProps {
  /** Расшифровка, например «Break of Structure, слом структуры». */
  full: string;
  definition: string;
  children: ReactNode;
}

/** Термин SMC с пунктирным подчёркиванием; по нажатию — определение в мини-шторке/диалоге. */
export function Hint({ full, definition, children }: HintProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-help underline decoration-dotted underline-offset-4"
        aria-haspopup="dialog"
      >
        {children}
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={full}
        height="peek"
        footer={
          <Button variant="secondary" className="w-full" onClick={() => setOpen(false)}>
            {ru.actions.close}
          </Button>
        }
      >
        <p className="text-base text-text-2">{definition}</p>
      </BottomSheet>
    </>
  );
}
