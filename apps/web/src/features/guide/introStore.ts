import type { IntroKey } from '@/i18n/ru/guide';

// Флаг «Больше не показывать» хранится в localStorage (поля в Settings нет; Dexie-схема не меняется).
const key = (k: IntroKey) => `tl.intro.dismissed.${k}`;

export function isIntroDismissed(k: IntroKey): boolean {
  try {
    return window.localStorage.getItem(key(k)) === '1';
  } catch {
    return false;
  }
}

export function dismissIntro(k: IntroKey): void {
  try {
    window.localStorage.setItem(key(k), '1');
  } catch {
    /* хранилище недоступно: интро просто покажется снова */
  }
}
