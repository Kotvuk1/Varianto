// @vitest-environment node
// Сбои источника при выборе T не должны превращаться в 404 «нет подходящих сценариев» (фикстуры data.binance.vision).
import { describe, expect, it, vi } from 'vitest';
import type { Candle } from '@tl/core';
import { ArchiveError } from '@tl/market-data';
import type { ArchiveSource } from '@tl/market-data/archive';
import { FixtureLoader } from './fixture-loader';
import { handleNext, type HandlerDeps } from './handlers';
import { RateLimiter } from './rate-limit';
import { ArchiveLoader, DAY_MS, type CandleLoader } from './sources';

const NOW = Date.UTC(2026, 10, 3, 3);
const fixtures = new FixtureLoader();

const flaky = (failFirst: number, code: 'unavailable' | 'not_found' = 'unavailable') => {
  let calls = 0;
  const loader: CandleLoader = {
    candles: async (...a) => {
      if (calls++ < failFirst) throw new ArchiveError(code, 'boom', 'u');
      return fixtures.candles(...a);
    },
    aggTrades: (...a) => fixtures.aggTrades(...a),
  };
  return loader;
};

const deps = (loader: CandleLoader): HandlerDeps => ({
  loader,
  now: () => NOW,
  newSeed: () => 1,
  secret: 'integration-secret-0123456789abcdef',
  range: { from: Date.UTC(2026, 7, 14), to: Date.UTC(2026, 9, 22) },
  warmupMs: 0,
  gridStepMs: DAY_MS,
  maxAttempts: 400,
  limiter: new RateLimiter({ capacity: 1000, now: () => NOW }),
});
const post = (d: HandlerDeps) =>
  handleNext(
    new Request('http://localhost/api/tasks/challenge/next', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ module: 'challenge', difficulty: 'medium', symbol: 'BTCUSDT' }),
    }),
    'challenge',
    d,
  );

describe('next: сбои источника', () => {
  it('первые 2 сбоя загрузки -> 200, а не 404', async () => {
    expect((await post(deps(flaky(2)))).status).toBe(200);
  });

  it('источник недоступен полностью -> 502 archive_unavailable', async () => {
    const res = await post(deps(flaky(Infinity)));
    expect(res.status).toBe(502);
    expect((await res.json()).error.code).toBe('archive_unavailable');
  });
});

describe('ArchiveLoader: ретраи', () => {
  const rows = [] as Candle[];
  const mk = (failures: number) => {
    let n = 0;
    const get = vi.fn(async () => {
      if (n++ < failures) throw new ArchiveError('unavailable', 'net', 'u');
      return rows;
    });
    const sleep = vi.fn(async (ms: number) => { void ms; });
    const loader = new ArchiveLoader({ archive: { get } as unknown as ArchiveSource, now: () => NOW, sleep });
    return { get, sleep, loader };
  };
  const D = Date.UTC(2026, 9, 20);

  it('2 сбоя -> успех с backoff; параллельные запросы делят загрузку', async () => {
    const { get, sleep, loader } = mk(2);
    await Promise.all([loader.candles('BTCUSDT', '1h', D, D + DAY_MS), loader.candles('BTCUSDT', '1h', D, D + DAY_MS)]);
    expect(get).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([300, 600]);
  });

  it('3 сбоя подряд -> ошибка пробрасывается; not_found не ретраится', async () => {
    const a = mk(3);
    await expect(a.loader.candles('BTCUSDT', '1h', D, D + DAY_MS)).rejects.toMatchObject({ code: 'unavailable' });
    const get = vi.fn(async () => {
      throw new ArchiveError('not_found', 'x', 'u');
    });
    const l = new ArchiveLoader({ archive: { get } as unknown as ArchiveSource, now: () => NOW });
    await expect(l.candles('BTCUSDT', '1h', D, D + DAY_MS)).rejects.toMatchObject({ code: 'not_found' });
    expect(get).toHaveBeenCalledTimes(1);
  });
});
