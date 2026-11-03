/** Экраны с графиком: нижняя навигация и общая верхняя панель скрыты, main занимает всю высоту. */
export function isChartRoute(pathname: string): boolean {
  return pathname === '/terminal' || pathname.startsWith('/terminal/') || /^\/learn\/[^/]+\/session(\/|$)/.test(pathname);
}

export type NavId = 'terminal' | 'learn' | 'progress';

export const NAV_ITEMS: readonly { id: NavId; href: string }[] = [
  { id: 'terminal', href: '/terminal' },
  { id: 'learn', href: '/' },
  { id: 'progress', href: '/progress' },
];

export function activeNav(pathname: string): NavId | null {
  if (pathname === '/terminal' || pathname.startsWith('/terminal/')) return 'terminal';
  if (pathname === '/progress' || pathname.startsWith('/progress/')) return 'progress';
  if (pathname === '/' || pathname.startsWith('/learn')) return 'learn';
  return null;
}
