'use client';

import type { ReactNode } from 'react';
import { RepositoryProvider } from '@/storage';
import { ThemeProvider } from '@/theme';
import { ToastProvider } from '@/ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RepositoryProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </RepositoryProvider>
  );
}
