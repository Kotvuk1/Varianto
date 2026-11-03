'use client';
import { useEffect, useState } from 'react';
import type { Scope } from '@tl/core';

/** Слой структуры для новых BOS/CHoCH; по умолчанию внешний. */
export function useScope(initial: Scope = 'external') {
  return useState<Scope>(initial);
}

/** Горячая клавиша I (по физической клавише - работает и в русской раскладке) переключает слой. */
export function useScopeHotkey(enabled: boolean, toggle: () => void): void {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
      const letter = e.code.startsWith('Key') ? e.code.slice(3).toLowerCase() : e.key.toLowerCase();
      if (letter === 'i') toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, toggle]);
}

export const otherScope = (s: Scope): Scope => (s === 'internal' ? 'external' : 'internal');
