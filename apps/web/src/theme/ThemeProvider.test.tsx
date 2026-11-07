import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LocalRepository, RepositoryProvider } from '@/storage';
import { ThemeProvider, useTheme } from './ThemeProvider';

let n = 0;
let repo: LocalRepository;

function Probe() {
  const { theme, candleStyle, setTheme, setCandleStyle } = useTheme();
  return (
    <div>
      <span data-testid="state">{`${theme}/${candleStyle}`}</span>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setCandleStyle('mono')}>mono</button>
    </div>
  );
}

function setup() {
  return render(
    <RepositoryProvider repository={repo}>
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    </RepositoryProvider>,
  );
}

beforeEach(() => {
  n += 1;
  repo = new LocalRepository(`theme-test-${n}`);
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-candles');
});

describe('ThemeProvider', () => {
  it('по умолчанию тёмная тема и цветные свечи', async () => {
    setup();
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(document.documentElement.dataset.candles).toBe('color');
    expect(screen.getByTestId('state').textContent).toBe('dark/color');
  });

  it('setTheme меняет data-theme и сохраняет в репозиторий', async () => {
    setup();
    await userEvent.click(screen.getByText('light'));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByTestId('state').textContent).toBe('light/color');
    await waitFor(async () => expect((await repo.getSettings()).theme).toBe('light'));
  });

  it('setCandleStyle меняет data-candles и сохраняет', async () => {
    setup();
    await userEvent.click(screen.getByText('mono'));
    expect(document.documentElement.dataset.candles).toBe('mono');
    await waitFor(async () => expect((await repo.getSettings()).candleStyle).toBe('mono'));
  });

  it('подхватывает сохранённые настройки при старте', async () => {
    const s = await repo.getSettings();
    await repo.saveSettings({ ...s, theme: 'light', candleStyle: 'mono' });
    setup();
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('light/mono'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('быстрые подряд изменения не затирают друг друга', async () => {
    setup();
    await act(async () => {
      await userEvent.click(screen.getByText('light'));
      await userEvent.click(screen.getByText('mono'));
    });
    await waitFor(async () => {
      const s = await repo.getSettings();
      expect([s.theme, s.candleStyle]).toEqual(['light', 'mono']);
    });
  });
});
