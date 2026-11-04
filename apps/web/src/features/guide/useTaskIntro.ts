'use client';
import { useCallback, useState, useSyncExternalStore } from 'react';
import type { IntroKey } from '@/i18n/ru/guide';
import { dismissIntro, isIntroDismissed } from './introStore';

const noopSubscribe = () => () => undefined;

/** Состояние интро: открывается само при первом входе (только на клиенте), пока не нажато «Больше не показывать». */
export function useTaskIntro(introKey: IntroKey | undefined) {
  const client = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // null - решение по умолчанию (показать, если не отключено); true/false - выбор пользователя в этом визите.
  const [forced, setForced] = useState<boolean | null>(null);
  const auto = client && !!introKey && !isIntroDismissed(introKey);
  const open = forced ?? auto;
  const show = useCallback(() => setForced(true), []);
  const close = useCallback(() => setForced(false), []);
  const never = useCallback(() => {
    if (introKey) dismissIntro(introKey);
    setForced(false);
  }, [introKey]);
  return { open, show, close, never };
}
