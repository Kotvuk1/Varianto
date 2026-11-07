// Интеграционный тест с реальным data.binance.vision. Запуск: NETWORK_TESTS=1 pnpm --filter @tl/market-data test
import { describe, expect, it } from 'vitest';
import { TIMEFRAME_MS } from '@tl/core';
import { ArchiveSource } from './archive';
import { findGaps } from './normalize';

describe.skipIf(!process.env.NETWORK_TESTS)('ArchiveSource: реальный data.binance.vision', () => {
  const src = new ArchiveSource({ verifyChecksum: true, now: () => Date.UTC(2026, 10, 3) });

  it('monthly 4h BTCUSDT 2026-09: скачивание, checksum, парсинг, без пропусков', async () => {
    const from = Date.UTC(2026, 8, 1);
    const to = Date.UTC(2026, 9, 1);
    const c = await src.get('BTCUSDT', '4h', from, to);
    expect(c).toHaveLength(30 * 6);
    expect(c[0]?.openTime).toBe(from);
    expect(c.at(-1)?.closeTime).toBe(to - 1);
    expect(findGaps(c, '4h', { from, to })).toEqual([]);
    expect(c.every((x) => x.closed && x.high >= x.low && x.closeTime - x.openTime === TIMEFRAME_MS['4h'] - 1)).toBe(true);
  }, 60_000);

  it('daily aggTrades: потоковое чтение начала файла реального 14-МБ архива', async () => {
    const from = Date.UTC(2026, 9, 20, 0, 0);
    const trades = await src.getAggTrades('BTCUSDT', from, from + 60_000);
    expect(trades.length).toBeGreaterThan(100);
    expect(trades.every((t) => t.time >= from && t.time < from + 60_000 && t.price > 0)).toBe(true);
  }, 60_000);
});
