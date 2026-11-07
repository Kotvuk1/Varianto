import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evalCurGolden, type CurGolden } from './testing/cur';
import { FIXTURES_ROOT, readGolden } from './testing/klines';
import { CUR_ALGO_VERSION } from './version';

// Golden fixtures/golden/cur_*.golden.json: участки docs/specs/CURRICULUM_STAGES.md §14 на реальных свечах Binance.
// Ответы пользователя (`inputs`) - тестовые входы, не рыночные данные. ST-2 и ST-3 пересчитаны по решениям §20.
const FILES = readdirSync(resolve(FIXTURES_ROOT, 'golden')).filter((f) => f.startsWith('cur_') && f.endsWith('.golden.json'));

describe('golden cur_*: файлы и источники', () => {
  it('найдено 17 участков §14.2; algoVersion = CUR_ALGO_VERSION; sha256 источников совпадает', () => {
    expect(FILES).toHaveLength(17);
    for (const f of FILES) {
      const g = readGolden<{ algoVersion: string; source: { path: string; sha256: string }[] }>(f);
      expect(g.algoVersion).toBe(CUR_ALGO_VERSION);
      for (const s of g.source) expect(createHash('sha256').update(readFileSync(resolve(FIXTURES_ROOT, s.path))).digest('hex')).toBe(s.sha256);
    }
  });
});

for (const f of FILES) {
  describe(`golden ${f.slice(0, f.indexOf('.'))}`, () => {
    const g = readGolden<CurGolden>(f);
    it('вычисление совпадает с expected (после округления до 4 знаков)', async () => {
      expect(await evalCurGolden(g)).toEqual(g.expected);
    });
  });
}
