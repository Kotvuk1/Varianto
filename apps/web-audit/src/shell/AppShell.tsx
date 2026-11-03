'use client';

import { BookOpen, ChartCandlestick, ChartNoAxesColumn, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ru } from '@/i18n/ru';
import { cn } from '@/ui';
import { activeNav, isChartRoute, NAV_ITEMS, type NavId } from './routes';

const ICONS: Record<NavId, ReactNode> = {
  terminal: <ChartCandlestick size={24} strokeWidth={1.75} aria-hidden />,
  learn: <BookOpen size={24} strokeWidth={1.75} aria-hidden />,
  progress: <ChartNoAxesColumn size={24} strokeWidth={1.75} aria-hidden />,
};

/** Верхние вкладки (десктоп >= 1024). Экспортируется для верхней панели терминала. */
export function DesktopTabs({ className }: { className?: string }) {
  const active = activeNav(usePathname());
  return (
    <nav aria-label={ru.nav.sections} className={cn('hidden items-center gap-1 lg:flex', className)}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={active === item.id ? 'page' : undefined}
          className={cn(
            'flex h-12 items-center border-b-2 px-3 text-sm font-medium',
            active === item.id ? 'border-accent text-text-1' : 'border-transparent text-text-2 hover:text-text-1',
          )}
        >
          {ru.nav[item.id]}
        </Link>
      ))}
    </nav>
  );
}

function BottomTabs() {
  const active = activeNav(usePathname());
  return (
    <nav
      aria-label={ru.nav.main}
      className="flex shrink-0 border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={active === item.id ? 'page' : undefined}
          className={cn(
            'flex h-14 flex-1 flex-col items-center justify-center gap-0.5 border-t-2 text-xs',
            active === item.id ? 'border-accent text-text-1' : 'border-transparent text-text-2',
          )}
        >
          {ICONS[item.id]}
          {ru.nav[item.id]}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Каркас всех страниц. Экраны с графиком (/terminal, /learn/{модуль}/session): без нижней навигации
 * и общей верхней панели; main = 100dvh с safe-area сверху/по бокам (низ — у панели инструментов графика).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isChartRoute(pathname)) {
    return (
      <main
        id="main"
        className="flex h-dvh flex-col overflow-hidden pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
      >
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-dvh flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface-1 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold">
            {ru.appName}
          </Link>
          <DesktopTabs />
        </div>
        <Link
          href="/settings"
          aria-label={ru.actions.settings}
          title={ru.actions.settings}
          className="-mr-2 flex size-11 items-center justify-center rounded-md hover:bg-surface-2"
        >
          <Settings size={20} strokeWidth={1.75} aria-hidden />
        </Link>
      </header>
      <main id="main" className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
