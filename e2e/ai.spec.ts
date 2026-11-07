import { expect, test, type Page } from '@playwright/test';
import { checkAndSeeResult, openSession, tapCandle } from './ms.helpers';

test.describe.configure({ timeout: 180_000 });

async function toFeedback(page: Page) {
  await openSession(page, '/learn/market-structure/session?mode=mark&difficulty=easy&tf=1h&symbol=BTCUSDT');
  // Набор инструментов зависит от задания: берём первый инструмент доступной группы.
  await page.getByRole('button', { name: 'Пробои', exact: true }).click();
  await page.getByRole('toolbar', { name: 'Пробои' }).getByRole('button').first().click();
  await tapCandle(page, 20);
  await checkAndSeeResult(page);
}


// Экран с разбором: терминал после проверки. Здесь проверяем сам API и панель через route intercept.
test('GET /api/ai/status отвечает {enabled: boolean}', async ({ request }) => {
  const res = await request.get('/api/ai/status');
  expect(res.ok()).toBe(true);
  expect(typeof (await res.json()).enabled).toBe('boolean');
});

test('POST /api/ai/explain без ключа: 404 feature_disabled; с ключом валидация 400', async ({ request }) => {
  const status = await (await request.get('/api/ai/status')).json();
  const res = await request.post('/api/ai/explain', { data: { question: '' } });
  if (status.enabled) expect(res.status()).toBe(400);
  else {
    expect(res.status()).toBe(404);
    expect((await res.json()).error.code).toBe('feature_disabled');
  }
});

test('ключ не попадает в клиентский бандл страницы', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/MINIMAX_API_KEY/);
});

test('UI: при enabled=false кнопки «Спросить ИИ» нет', async ({ page }) => {
  await page.route('**/api/ai/status', (r) => r.fulfill({ json: { enabled: false } }));
  await toFeedback(page);
  await expect(page.getByTestId('feedback-view')).toBeVisible();
  await expect(page.getByTestId('ask-ai-open')).toHaveCount(0);
});

test('UI: при enabled=true панель отвечает, подпись с моделью; лимит показывается', async ({ page }) => {
  let n = 0;
  await page.route('**/api/ai/status', (r) => r.fulfill({ json: { enabled: true } }));
  await page.route('**/api/ai/explain', (r) => {
    n += 1;
    if (n === 1) return r.fulfill({ json: { answer: 'Тестовый ответ.', model: 'MiniMax-M3.1-Flash', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } } });
    return r.fulfill({ status: 429, json: { error: { code: 'daily_limit', message: 'x' } } });
  });
  await toFeedback(page);
  await page.getByTestId('ask-ai-open').click();
  await page.getByRole('button', { name: 'Как было правильно?' }).click();
  await expect(page.getByTestId('ask-ai-history')).toContainText('Тестовый ответ.');
  await expect(page.getByTestId('ask-ai-signature')).toHaveText('Ответ ИИ, модель: MiniMax-M3.1-Flash. Оценку определяет алгоритм.');
  await page.getByTestId('ask-ai-input').fill('Ещё вопрос');
  await page.getByTestId('ask-ai-send').click();
  await expect(page.getByTestId('ask-ai-error')).toContainText('Лимит');
});
