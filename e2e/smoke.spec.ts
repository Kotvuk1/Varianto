import { expect, test } from '@playwright/test';

test('/api/health отвечает ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBe(true);
  expect(await res.json()).toEqual({ status: 'ok', algoVersion: '0.1.0' });
});

test('заголовки безопасности выставлены', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.headers()['content-security-policy']).toContain('https://fapi.binance.com');
  expect(res.headers()['x-content-type-options']).toBe('nosniff');
});
