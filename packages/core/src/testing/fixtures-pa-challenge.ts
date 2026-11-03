// Тестовый загрузчик реальных фикстур (data.binance.vision) для PA/Challenge. Только для тестов: использует node:fs.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Candle } from '../index';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../fixtures');

export interface TestAggTrade {
  aggTradeId: number;
  price: number;
  transactTime: number;
}

/** CSV klines (с заголовком или без) -> Candle[]; все свечи закрыты (архив). */
export function loadKlines(rel: string): Candle[] {
  const lines = readFileSync(resolve(ROOT, rel), 'utf8').split('\n').filter((l) => l.trim() !== '');
  const out: Candle[] = [];
  for (const line of lines) {
    const p = line.split(',');
    if (p[0] === 'open_time') continue;
    out.push({
      openTime: Number(p[0]),
      open: Number(p[1]),
      high: Number(p[2]),
      low: Number(p[3]),
      close: Number(p[4]),
      volume: Number(p[5]),
      closeTime: Number(p[6]),
      quoteVolume: Number(p[7]),
      trades: Number(p[8]),
      closed: true,
    });
  }
  return out.sort((a, b) => a.openTime - b.openTime);
}

export function loadAggTrades(rel: string): TestAggTrade[] {
  const lines = readFileSync(resolve(ROOT, rel), 'utf8').split('\n').filter((l) => l.trim() !== '');
  const out: TestAggTrade[] = [];
  for (const line of lines) {
    const p = line.split(',');
    if (p[0] === 'agg_trade_id') continue;
    out.push({ aggTradeId: Number(p[0]), price: Number(p[1]), transactTime: Number(p[5]) });
  }
  return out;
}
