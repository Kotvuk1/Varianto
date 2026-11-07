import { expect, test } from '@playwright/test';

test.describe('главная', () => {
  test('показывает структуру Обучения с пустыми состояниями', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Начать с Market Structure' })).toBeVisible();
    await expect(page.getByText('Сегодня: 0 из 10 заданий')).toBeVisible();
    await expect(page.getByText('Пока нет данных')).toBeVisible();
    // курс: 8 ступеней-ссылок; комбо и Challenge закрыты (не ссылки)
    for (const name of ['Свинги', 'Уровни', 'Лимитный вход', 'Стоп и тейк', 'Smart Money Concepts', 'Свечные модели', 'Фибоначчи', 'Волны Эллиотта']) {
      await expect(page.getByRole('link', { name: new RegExp(`${name}`) }).first()).toBeVisible();
    }
    await expect(page.getByTestId('combo-challenge')).toHaveAttribute('data-locked', 'true');
    await expect(page.getByRole('link', { name: 'Начать Market Structure' })).toBeVisible();
  });
});

test.describe('настройки', () => {
  test('тема сохраняется после перезагрузки', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('radio', { name: 'Светлая' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    // Запись в IndexedDB асинхронна: ждём подтверждения через повторное чтение после перезагрузки.
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('radio', { name: 'Светлая' })).toHaveAttribute('aria-checked', 'true');
  });

  test('стиль свечей и дневная цель сохраняются', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('radio', { name: 'Монохром' }).click();
    await page.getByRole('button', { name: 'Увеличить' }).click();
    await expect(page.getByText('Настройки сохранены')).toBeVisible();
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-candles', 'mono');
    await expect(page.getByLabel('Дневная цель', { exact: true }).and(page.locator('output'))).toHaveText('11');
    await page.goto('/');
    await expect(page.getByText('Сегодня: 0 из 11 заданий')).toBeVisible();
  });
});

test.describe('навигация', () => {
  test('мобильный: нижняя панель, десктоп: верхние вкладки', async ({ page }, info) => {
    await page.goto('/');
    const mobile = info.project.name === 'mobile';
    const bottom = page.locator('nav[aria-label="Основная навигация"]');
    const top = page.locator('nav[aria-label="Разделы"]');
    if (mobile) {
      await expect(bottom).toBeVisible();
      await expect(top).toBeHidden();
      await bottom.getByRole('link', { name: 'Прогресс' }).click();
    } else {
      await expect(top).toBeVisible();
      await expect(bottom).toBeHidden();
      await top.getByRole('link', { name: 'Прогресс' }).click();
    }
    await expect(page).toHaveURL(/\/progress$/);
    await expect(page.getByRole('heading', { name: 'Прогресс', level: 1 })).toBeVisible();
    await expect(page.getByText('Ошибок пока нет')).toBeVisible();

    const nav = mobile ? bottom : top;
    await expect(nav.getByRole('link', { name: 'Терминал' })).toHaveAttribute('href', '/terminal');
    await nav.getByRole('link', { name: 'Обучение' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('значок настроек ведёт на /settings', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Настройки' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { name: 'Настройки', level: 1 })).toBeVisible();
  });
});

test.describe('адаптивность', () => {
  for (const path of ['/', '/progress', '/settings']) {
    test(`нет горизонтальной прокрутки на 360 px: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto(path);
      await expect(page.getByRole('main')).toBeVisible();
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth - el.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
