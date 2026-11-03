import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { AppShell } from './AppShell';
import { activeNav, isChartRoute } from './routes';

beforeEach(() => {
  pathname = '/';
});

describe('AppShell', () => {
  it('на обычной странице показывает нижнюю навигацию из трёх разделов', () => {
    render(
      <AppShell>
        <p>страница</p>
      </AppShell>,
    );
    const nav = screen.getByRole('navigation', { name: 'Основная навигация' });
    expect(nav).toBeTruthy();
    const links = screen.getAllByRole('link', { name: /Терминал|Обучение|Прогресс/ });
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByRole('link', { name: 'Обучение' }).some((l) => l.getAttribute('aria-current') === 'page')).toBe(true);
  });

  it.each(['/terminal', '/learn/market-structure/session'])('на %s навигации нет, main на всю высоту', (p) => {
    pathname = p;
    render(
      <AppShell>
        <p>график</p>
      </AppShell>,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('banner')).toBeNull();
    const main = screen.getByRole('main');
    expect(main.className).toContain('h-dvh');
    expect(screen.getByText('график')).toBeTruthy();
  });
});

describe('routes', () => {
  it('распознаёт экраны с графиком', () => {
    expect(isChartRoute('/terminal')).toBe(true);
    expect(isChartRoute('/learn/price-action/session')).toBe(true);
    expect(isChartRoute('/learn/price-action')).toBe(false);
    expect(isChartRoute('/progress')).toBe(false);
  });
  it('активный раздел', () => {
    expect(activeNav('/')).toBe('learn');
    expect(activeNav('/learn/x')).toBe('learn');
    expect(activeNav('/progress')).toBe('progress');
    expect(activeNav('/settings')).toBeNull();
  });
});
