'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRepository, type Settings } from '@/storage';
import { APPEARANCE_STORAGE_KEY } from './init-script';

export type Theme = 'dark' | 'light';
export type CandleStyle = 'color' | 'mono';

export interface ThemeContextValue {
  theme: Theme;
  candleStyle: CandleStyle;
  setTheme: (t: Theme) => void;
  setCandleStyle: (s: CandleStyle) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const toStoredCandle = (s: CandleStyle): Settings['candleStyle'] => (s === 'mono' ? 'mono' : 'blue-orange');
const fromStoredCandle = (s: Settings['candleStyle']): CandleStyle => (s === 'mono' ? 'mono' : 'color');

function applyToDom(theme: Theme, candleStyle: CandleStyle) {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.dataset.candles = candleStyle;
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ theme, candleStyle }));
  } catch {
    // приватный режим: настройка сохранится в IndexedDB
  }
}

/**
 * Тема и стиль свечей. Источник истины — Settings в Repository; зеркало в localStorage
 * нужно только скрипту до гидратации (без вспышки темы). Атрибуты data-theme / data-candles — на <html>.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const repo = useRepository();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [candleStyle, setCandleState] = useState<CandleStyle>('color');
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const touched = useRef(false);

  useEffect(() => {
    let cancelled = false;
    repo
      .getSettings()
      .then((s) => {
        if (cancelled || touched.current) return;
        setThemeState(s.theme);
        setCandleState(fromStoredCandle(s.candleStyle));
        applyToDom(s.theme, fromStoredCandle(s.candleStyle));
      })
      .catch(() => {
        // хранилище недоступно: остаются значения, выставленные скриптом/по умолчанию
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const persist = useCallback(
    (patch: Partial<Pick<Settings, 'theme' | 'candleStyle'>>) => {
      queue.current = queue.current
        .then(async () => repo.saveSettings({ ...(await repo.getSettings()), ...patch }))
        .catch(() => undefined);
    },
    [repo],
  );

  const setTheme = useCallback(
    (t: Theme) => {
      touched.current = true;
      setThemeState(t);
      applyToDom(t, document.documentElement.dataset.candles === 'mono' ? 'mono' : 'color');
      persist({ theme: t });
    },
    [persist],
  );

  const setCandleStyle = useCallback(
    (s: CandleStyle) => {
      touched.current = true;
      setCandleState(s);
      applyToDom(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark', s);
      persist({ candleStyle: toStoredCandle(s) });
    },
    [persist],
  );

  const value = useMemo(
    () => ({ theme, candleStyle, setTheme, setCandleStyle }),
    [theme, candleStyle, setTheme, setCandleStyle],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme: нет ThemeProvider');
  return ctx;
}
