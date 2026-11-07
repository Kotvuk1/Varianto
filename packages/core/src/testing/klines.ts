// Загрузчик реальных фикстур (data.binance.vision) для тестов SMC. Только для тестов: использует node:fs.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Candle } from '../types';

export const FIXTURES_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../fixtures');

/** CSV klines (с заголовком или без) -> Candle[], все закрыты. rel — путь от fixtures/. */
export function readKlines(rel: string): Candle[] {
  const lines = readFileSync(resolve(FIXTURES_ROOT, rel), 'utf8').split('\n').filter((l) => l.trim() !== '');
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

export function readGolden<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(FIXTURES_ROOT, 'golden', name), 'utf8')) as T;
}

export const iso = (s: string): number => Date.parse(s);
