'use client';
import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 1024px)';
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};

/** >= 1024 px: рейка слева и панель 360 справа (LAYOUTS §9). До гидратации - мобильная раскладка. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
