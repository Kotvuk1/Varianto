// Токен-бакет в памяти инстанса (ARCHITECTURE §7): 30 запросов/мин на ключ для next+grade.
export interface RateLimiterOptions {
  capacity?: number;
  refillPerMin?: number;
  maxKeys?: number;
  now?: () => number;
}

export type RateDecision = { ok: true } | { ok: false; retryAfterSec: number };

export class RateLimiter {
  private readonly capacity: number;
  private readonly perMs: number;
  private readonly maxKeys: number;
  private readonly now: () => number;
  private readonly buckets = new Map<string, { tokens: number; at: number }>();

  constructor(opts: RateLimiterOptions = {}) {
    this.capacity = opts.capacity ?? 30;
    this.perMs = (opts.refillPerMin ?? 30) / 60_000;
    this.maxKeys = opts.maxKeys ?? 5000;
    this.now = opts.now ?? (() => Date.now());
  }

  take(key: string): RateDecision {
    const t = this.now();
    const b = this.buckets.get(key) ?? { tokens: this.capacity, at: t };
    b.tokens = Math.min(this.capacity, b.tokens + (t - b.at) * this.perMs);
    b.at = t;
    // LRU: переставляем ключ в конец; при переполнении вытесняем самый давний.
    this.buckets.delete(key);
    this.buckets.set(key, b);
    if (this.buckets.size > this.maxKeys) this.buckets.delete(this.buckets.keys().next().value as string);
    if (b.tokens >= 1) {
      b.tokens -= 1;
      return { ok: true };
    }
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((1 - b.tokens) / this.perMs / 1000)) };
  }
}

/** Ключ клиента: первый адрес из x-forwarded-for, иначе x-real-ip, иначе общий. */
export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (fwd || headers.get('x-real-ip') || 'anonymous').slice(0, 64);
}
