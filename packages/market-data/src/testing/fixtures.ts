// Тестовый помощник: чтение реальных фикстур из /fixtures (см. fixtures/README.md).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../fixtures/', import.meta.url));

export function fixtureText(rel: string): string {
  return readFileSync(root + rel, 'utf8');
}
export function fixtureJson<T = unknown>(rel: string): T {
  return JSON.parse(fixtureText(rel)) as T;
}
export function klinesCsvPath(symbol: string, tf: string, date: string): string {
  return `klines/${symbol}/${tf}/${symbol}-${tf}-${date}.csv`;
}
