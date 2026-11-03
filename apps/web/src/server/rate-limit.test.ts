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
    expect(clientKey(new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4');
    expect(clientKey(new Headers())).toBe('anonymous');
  });
});
