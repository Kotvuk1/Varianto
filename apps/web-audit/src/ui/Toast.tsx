'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from './cn';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastApi {
  show: (t: ToastOptions) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast: нет ToastProvider');
  return ctx;
}

/** Один тост одновременно; 4 с (6 с с действием); пауза при наведении и фокусе. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { key: number }) | null>(null);
  const [paused, setPaused] = useState(false);
  const counter = useRef(0);

  const show = useCallback((t: ToastOptions) => {
    counter.current += 1;
    setPaused(false);
    setToast({ ...t, key: counter.current });
  }, []);

  useEffect(() => {
    if (!toast || paused) return;
    const id = window.setTimeout(() => setToast(null), toast.actionLabel ? 6000 : 4000);
    return () => window.clearTimeout(id);
  }, [toast, paused]);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--toolbar-h)+env(safe-area-inset-bottom)+0.5rem)] z-50 flex justify-center px-3 lg:bottom-4 lg:justify-start"
      >
        {toast && (
          <div
            key={toast.key}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className={cn(
              'pointer-events-auto flex max-w-[360px] items-center gap-3 rounded-md border border-border-strong bg-surface-2 px-4 py-3 text-sm shadow-raised',
            )}
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                className="h-11 cursor-pointer font-medium underline"
                onClick={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
