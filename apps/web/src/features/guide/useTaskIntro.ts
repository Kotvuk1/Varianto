'use client';
import { useCallback, useEffect, useState } from 'react';
import type { IntroKey } from '@/i18n/ru/guide';
import { dismissIntro, isIntroDismissed } from './introStore';

/** Состояние интро: открывается само при первом входе, пока не нажато «Больше не показывать». */
export function useTaskIntro(introKey: IntroKey | undefined) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (introKey && !isIntroDismissed(introKey)) setOpen(true);
  }, [introKey]);
  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const never = useCallback(() => {
    if (introKey) dismissIntro(introKey);
    setOpen(false);
  }, [introKey]);
  return { open, show, close, never };
}
