// Тестовый CandleLoader поверх реальных фикстур fixtures/ (data.binance.vision), без сети. Только для тестов (node:fs).
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Candle, Timeframe, UtcMs } from '@tl/core';
import { ArchiveError, mergeCandles, parseArchiveCsv } from '@tl/market-data';
import type { CandleLoader, RawAggTrade } from './sources';

const FIX = resolve(__dirname, '../../../../fixtures');

export class FixtureLoader implements CandleLoader {
  private readonly cache = new Map<string, Candle[]>();
  /** Счётчики вызовов (для проверки кэша/нагрузки в тестах). */
  calls = 0;

  private load(symbol: string, tf: Timeframe): Candle[] {
    const key = `${symbol}|${tf}`;
    let all = this.cache.get(key);
    if (!all) {
      all = [];
      const dir = resolve(FIX, 'klines', symbol, tf);
      let files: string[] = [];
      try {
        files = readdirSync(dir).filter((f) => f.endsWith('.csv'));
      } catch {
        files = [];
      }
      for (const f of files) all = mergeCandles(all, parseArchiveCsv(readFileSync(resolve(dir, f), 'utf8')));
      this.cache.set(key, all);
    }
    return all;
  }

  async candles(symbol: string, tf: Timeframe, from: UtcMs, to: UtcMs): Promise<Candle[]> {
    this.calls++;
    return this.load(symbol, tf).filter((c) => c.openTime >= from && c.openTime < to);
  }

  /** Реальные сделки 2026-10-20 (первые 3000 строк файла); за пределами покрытия - как недоступный архив. */
  async aggTrades(symbol: string, from: UtcMs, to: UtcMs): Promise<RawAggTrade[]> {
    const text = readFileSync(resolve(FIX, 'aggTrades', `${symbol}-aggTrades-2026-10-20.csv`), 'utf8');
    const rows: RawAggTrade[] = [];
    for (const line of text.split('\n')) {
      const p = line.split(',');
      if (p.length < 7 || p[0] === 'agg_trade_id') continue;
      rows.push({ id: Number(p[0]), price: Number(p[1]), time: Number(p[5]) });
    }
    if (rows.length === 0 || to > rows[rows.length - 1]!.time) throw new ArchiveError('not_found', 'fixture aggTrades do not cover the range');
    return rows.filter((r) => r.time >= from && r.time < to);
  }
}
