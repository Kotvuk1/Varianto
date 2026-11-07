import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LocalRepository, RepositoryProvider } from '@/storage';
import { ThemeProvider } from '@/theme';
import { ToastProvider } from '@/ui';
import { LearnScreen } from './learn/LearnScreen';
import { ProgressScreen } from './progress/ProgressScreen';
import { SettingsScreen } from './settings/SettingsScreen';

let n = 0;
let repo: LocalRepository;
beforeEach(() => {
  n += 1;
  repo = new LocalRepository(`screens-test-${n}`);
  localStorage.clear();
});

function wrap(ui: ReactNode) {
  return render(
    <RepositoryProvider repository={repo}>
      <ThemeProvider>
        <ToastProvider>{ui}</ToastProvider>
      </ThemeProvider>
    </RepositoryProvider>,
  );
}

describe('Обучение (главная)', () => {
  it('новый пользователь: цель 0 из 10, серия 0, слабые места пусты, курс из 8 ступеней и закрытые комбо', async () => {
    wrap(<LearnScreen />);
    expect(await screen.findByText('Сегодня: 0 из 10 заданий')).toBeTruthy();
    expect(screen.getByText('Серия: 0 дней')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Дневная цель' }).getAttribute('aria-valuenow')).toBe('0');
    expect(await screen.findByText('Пока нет данных')).toBeTruthy();
    // курс: 8 ступеней-ссылок (все открыты), комбо и Challenge закрыты и не являются ссылками
    const hrefs = ['stage-swings', 'levels', 'limit-entry', 'stop-take', 'market-structure', 'price-action', 'fibonacci', 'elliott'];
    for (const [i, h] of hrefs.entries()) {
      const row = await screen.findByTestId(`stage-${i + 1}`);
      expect(row.querySelector('a')?.getAttribute('href')).toBe(`/learn/${h}`);
    }
    expect(screen.getByTestId('stage-1').textContent).toContain('Рекомендуем');
    for (const m of ['combo-level-trade', 'combo-smc-entry', 'challenge']) {
      const row = screen.getByTestId(`combo-${m}`);
      expect(row.getAttribute('data-locked')).toBe('true');
      expect(row.querySelector('a')).toBeNull();
    }
    expect(screen.getByTestId('combo-combo-level-trade-remaining').textContent).toContain('Ступень 2 «Уровни»: ещё 10 заданий');
    expect(screen.getByRole('heading', { name: 'Начать курс со ступени 1' })).toBeTruthy();
  });

  it('цель и прогресс берутся из репозитория', async () => {
    const s = await repo.getSettings();
    await repo.saveSettings({ ...s, dailyGoal: 4 });
    wrap(<LearnScreen />);
    expect(await screen.findByText('Сегодня: 0 из 4 заданий')).toBeTruthy();
  });
});

describe('Прогресс', () => {
  it('показывает пустые состояния на всех вкладках', async () => {
    wrap(<ProgressScreen />);
    expect(await screen.findByText('Пока нет данных')).toBeTruthy();
    expect(screen.getByText('Ошибок пока нет')).toBeTruthy();
    await userEvent.click(screen.getByRole('radio', { name: 'Challenge' }));
    expect(screen.getByText('Сценариев пока нет')).toBeTruthy();
    expect(screen.getByText('Верные WAIT')).toBeTruthy();
  });
});

describe('Настройки', () => {
  it('тема, свечи и цель сохраняются в репозитории', async () => {
    wrap(<SettingsScreen />);
    await userEvent.click(screen.getByRole('radio', { name: 'Светлая' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Монохром' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Увеличить' }));
    await waitFor(async () => {
      const s = await repo.getSettings();
      expect(s).toMatchObject({ theme: 'light', candleStyle: 'mono', dailyGoal: 11 });
    });
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(await screen.findByText('Настройки сохранены')).toBeTruthy();
  });

  it('цель ограничена диапазоном 1–50', async () => {
    const s = await repo.getSettings();
    await repo.saveSettings({ ...s, dailyGoal: 1 });
    wrap(<SettingsScreen />);
    const dec = await screen.findByRole('button', { name: 'Уменьшить' });
    expect(dec.getAttribute('disabled')).not.toBeNull();
  });
});
