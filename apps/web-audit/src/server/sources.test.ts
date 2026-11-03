// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { Candle } from '@tl/core';
import type { ArchiveSource } from '@tl/market-data/archive';
import { FixtureLoader } from './fixture-loader';
import { ArchiveLoader, countClosedBefore, cutoffOf, DAY_MS, loadClosedBefore, loadMinutes, planChunks, tailBefore } from './sources';

const fixtures = new FixtureLoader();
const NOW = Date.UTC(2026, 10, 3, 3);

describe('planChunks', () => {
  it('закрытые месяцы - целиком, текущий месяц и 1m - по суткам', () => {
    const c = planChunks('4h', Date.UTC(2026, 6, 15), Date.UTC(2026, 8, 2), NOW);
    expect(c).toEqual([
      { from: Date.UTC(2026, 6, 1), to: Date.UTC(2026, 7, 1) },
      { from: Date.UTC(2026, 7, 1), to: Date.UTC(2026, 8, 1) },
      { from: Date.UTC(2026, 8, 1), to: Date.UTC(2026, 9, 1) },
    ]);
    expect(planChunks('1h', Date.UTC(2026, 10, 1), Date.UTC(2026, 10, 2, 5), NOW)).toEqual([
      { from: Date.UTC(2026, 10, 1), to: Date.UTC(2026, 10, 2) },
      { from: Date.UTC(2026, 10, 2), to: Date.UTC(2026, 10, 3) },
    ]);
    expect(planChunks('1m', Date.UTC(2026, 9, 20, 5), Date.UTC(2026, 9, 21, 1), NOW)).toHaveLength(2);
    expect(planChunks('1m', 10, 10, NOW)).toEqual([]);
  });
});

describe('ряды: бинарный поиск и хвост', () => {
  it('countClosedBefore / tailBefore: closeTime < T, последние depth', async () => {
    const h1 = await fixtures.candles('BTCUSDT', '1h', Date.UTC(2026, 9, 20), Date.UTC(2026, 9, 22));
    const T = Date.UTC(2026, 9, 20, 10);
    expect(countClosedBefore(h1, T)).toBe(10);
    expect(countClosedBefore(h1, T + 3_600_000)).toBe(11);
    const tail = tailBefore(h1, T, 3);
    expect(tail.map((c) => c.openTime)).toEqual([7, 8, 9].map((h) => Date.UTC(2026, 9, 20, h)));
  });
  it('loadClosedBefore: T внутри свечи не включает формирующуюся', async () => {
    const v = await loadClosedBefore(fixtures, 'BTCUSDT', '1h', Date.UTC(2026, 9, 21, 5, 30), 5);
    expect(v.at(-1)!.openTime).toBe(Date.UTC(2026, 9, 21, 4));
    expect(v).toHaveLength(5);
  });
  it('loadMinutes: полный набор или null', async () => {
    const from = Date.UTC(2026, 9, 21, 8);
    expect(await loadMinutes(fixtures, 'BTCUSDT', from, from + 135 * 60_000)).toHaveLength(135);
    expect(await loadMinutes(fixtures, 'BTCUSDT', Date.UTC(2026, 8, 21), Date.UTC(2026, 8, 21, 1))).toBeNull();
  });
  it('cutoffOf: now - 2 суток по границе суток', () => {
    expect(cutoffOf(NOW)).toBe(Date.UTC(2026, 10, 1));
  });
});

describe('ArchiveLoader: кэш LRU и дедупликация', () => {
  const day = async (d: number): Promise<Candle[]> => fixtures.candles('BTCUSDT', '1h', d, d + DAY_MS);
  const make = (maxWeight: number, now = NOW) => {
    const get = vi.fn(async (_s: string, _tf: string, from: number, to: number) => (await fixtures.candles('BTCUSDT', '1h', from, to)) as Candle[]);
    const loader = new ArchiveLoader({ archive: { get } as unknown as ArchiveSource, now: () => now, maxWeight });
    return { get, loader };
  };
  const D20 = Date.UTC(2026, 9, 20);

  it('повторный запрос берётся из кэша; параллельные запросы делят один fetch', async () => {
    const { get, loader } = make(1000);
    // октябрь - не закрытый «месяц» относительно NOW? NOW в ноябре -> октябрь закрыт: целым куском
    const [a, b] = await Promise.all([loader.candles('BTCUSDT', '1h', D20, D20 + DAY_MS), loader.candles('BTCUSDT', '1h', D20, D20 + DAY_MS)]);
    expect(a).toEqual(await day(D20));
    expect(b).toEqual(a);
    expect(get).toHaveBeenCalledTimes(1);
    await loader.candles('BTCUSDT', '1h', D20, D20 + 3600_000);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('вес кэша ограничен: старые куски вытесняются', async () => {
    const { get, loader } = make(30, Date.UTC(2026, 9, 25)); // текущий месяц: куски по суткам; помещается один (24 свечи 1h)
    const D = (n: number) => Date.UTC(2026, 9, n);
    await loader.candles('BTCUSDT', '1h', D(20), D(20) + DAY_MS);
    await loader.candles('BTCUSDT', '1h', D(21), D(21) + DAY_MS);
    expect(loader.cacheWeight).toBeLessThanOrEqual(30);
    await loader.candles('BTCUSDT', '1h', D(20), D(20) + DAY_MS);
    expect(get).toHaveBeenCalledTimes(3); // первый кусок вытеснен и загружен заново
  });

  it('ошибка загрузки не кэшируется', async () => {
    const get = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue([]);
    const loader = new ArchiveLoader({ archive: { get } as unknown as ArchiveSource, now: () => NOW });
    await expect(loader.candles('BTCUSDT', '1h', D20, D20 + DAY_MS)).rejects.toThrow('boom');
    await expect(loader.candles('BTCUSDT', '1h', D20, D20 + DAY_MS)).resolves.toEqual([]);
    expect(get).toHaveBeenCalledTimes(2);
  });
});
