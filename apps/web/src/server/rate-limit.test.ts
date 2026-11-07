// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { clientKey, RateLimiter } from './rate-limit';

describe('RateLimiter', () => {
  it('30 запросов проходят, 31-й -> retryAfter; через 2 с снова один', () => {
    let t = 0;
    const rl = new RateLimiter({ now: () => t });
    for (let i = 0; i < 30; i++) expect(rl.take('a').ok).toBe(true);
    const d = rl.take('a');
    expect(d).toEqual({ ok: false, retryAfterSec: 2 });
    expect(rl.take('b').ok).toBe(true);
    t += 2000;
    expect(rl.take('a').ok).toBe(true);
    expect(rl.take('a').ok).toBe(false);
  });
  it('ограничивает число ключей', () => {
    const rl = new RateLimiter({ maxKeys: 2, now: () => 0, capacity: 1 });
    rl.take('a');
    rl.take('b');
    rl.take('c'); // вытесняет a
    expect(rl.take('a').ok).toBe(true);
  });
  it('clientKey', () => {
    // Подделанный клиентом левый элемент XFF не должен выбираться: берём адрес, добавленный ближайшим прокси (последний).
    expect(clientKey(new Headers({ 'x-forwarded-for': '9.9.9.9, 5.6.7.8' }))).toBe('5.6.7.8');
    expect(clientKey(new Headers({ 'x-forwarded-for': '1.2.3.4' }))).toBe('1.2.3.4');
    // x-real-ip (задаётся платформой Vercel) приоритетнее XFF.
    expect(clientKey(new Headers({ 'x-real-ip': '7.7.7.7', 'x-forwarded-for': '9.9.9.9' }))).toBe('7.7.7.7');
    expect(clientKey(new Headers())).toBe('anonymous');
  });
});

import { rateFromEnv } from './deps';
describe('rateFromEnv', () => {
  it('дефолт при отсутствии/мусоре, значение из env иначе', () => {
    expect(rateFromEnv('X', 30, {} as unknown as NodeJS.ProcessEnv)).toBe(30);
    expect(rateFromEnv('X', 30, { X: 'abc' } as unknown as NodeJS.ProcessEnv)).toBe(30);
    expect(rateFromEnv('X', 30, { X: '-5' } as unknown as NodeJS.ProcessEnv)).toBe(30);
    expect(rateFromEnv('X', 30, { X: '500' } as unknown as NodeJS.ProcessEnv)).toBe(500);
  });
});
