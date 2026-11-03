'use client';

import type { ReactNode } from 'react';
import { AuthRepositoryProvider } from '@/auth';
import { ThemeProvider } from '@/theme';
import { ToastProvider } from '@/ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthRepositoryProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </AuthRepositoryProvider>
  );
}
