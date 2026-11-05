import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIXTURES_ROOT, readGolden, readKlines } from '../testing/klines';
import type { Candle } from '../types';
import { FIB_ALGO_VERSION } from '../version';
import { resolveExtension } from './extension';
import { findImpulses } from './impulses';
import { classifyReaction, correctOptions, resolveReaction } from './reaction';

// Golden fixtures/golden/fib_*.golden.json: значения FIBONACCI.md §12.2 (вручную по реальным свечам Binance).
const FILES = readdirSync(resolve(FIXTURES_ROOT, 'golden')).filter((f) => f.startsWith('fib_') && f.endsWith('.golden.json'));
const ms = (iso: string) => Date.parse(iso);
const STEP = { '15m': 900_000, '1h': 3_600_000, '4h': 14_400_000 } as const;

function series(files: string[], tf: keyof typeof STEP): Candle[] {
  const raw = files.flatMap((f) => readKlines(f)).sort((a, b) => a.openTime - b.openTime);
  for (let i = 1; i < raw.length; i++) if (raw[i]!.openTime - raw[i - 1]!.openTime !== STEP[tf]) return raw.slice(0, i); // до первого пропуска архива
  return raw;
}

describe('golden fib_*: файлы и источники', () => {
  it('найдено 6 файлов; algoVersion = FIB_ALGO_VERSION; sha256 источников совпадает', () => {
    expect(FILES).toHaveLength(6);
    for (const f of FILES) {
      const g = readGolden<{ algoVersion: string; source: { path: string; sha256: string }[] }>(f);
      expect(g.algoVersion).toBe(FIB_ALGO_VERSION);
      for (const s of g.source) expect(createHash('sha256').update(readFileSync(resolve(FIXTURES_ROOT, s.path))).digest('hex')).toBe(s.sha256);
    }
  });
});

for (const f of FILES) {
  describe(`golden ${f.slice(0, 8)}`, () => {
    const g = readGolden<any>(f); // eslint-disable-line @typescript-eslint/no-explicit-any
    const c = series(g.source.map((s: { path: string }) => s.path), g.params.tf);
    const idx = (iso: string) => c.findIndex((x) => x.openTime === ms(iso));
    const scan = findImpulses(c, { nExt: g.params.nExt });

    it('findImpulses: принятые и отклонённые', () => {
      for (const e of g.expected.impulses) {
        const i = scan.impulses.find((x) => x.event.breakTime === ms(e.breakTime) && x.direction === e.direction);
        expect(i, `${e.eventKind} ${e.breakTime}`).toBeDefined();
        expect(i!.event.kind).toBe(e.eventKind);
        expect([i!.a.time, i!.a.price, i!.b.time, i!.b.price, i!.candles]).toEqual([ms(e.a.time), e.a.price, ms(e.b.time), e.b.price, e.candles]);
        expect(i!.rangeAtr).toBeCloseTo(e.rangeAtr, 3);
      }
      for (const e of g.expected.rejected) {
        expect(scan.rejected.find((x) => x.event.breakTime === ms(e.breakTime) && x.event.direction === e.direction)?.reason).toBe(e.reason);
      }
    });

    it('resolveReaction: исход, экстремум, глубина, класс, верные варианты', () => {
      for (const e of g.expected.reaction) {
        const a = idx(e.a);
        const b = idx(e.b);
        const bull = e.direction === 'bull';
        const A = bull ? c[a]!.low : c[a]!.high;
        const B = bull ? c[b]!.high : c[b]!.low;
        const o = resolveReaction({ candles: c, direction: e.direction, A, B, b, T: b + 5, limit: g.params.limitCandles });
        expect(o.kind).toBe(e.kind);
        expect(o.index).toBe(idx(e.index));
        if (e.extremeTime) {
          expect(o.extremeIndex).toBe(idx(e.extremeTime));
          expect(o.extremePrice).toBe(e.extremePrice);
          expect(o.depth).toBeCloseTo(e.depth, 4);
        }
        if (e.threshold) expect(o.threshold).toBeCloseTo(e.threshold, 4);
        const cls = classifyReaction(o);
        expect(cls.kind === 'level' ? cls.level : cls.kind).toBe(e.cls);
        expect(correctOptions(cls, o.depth)).toEqual(e.correctOptions);
      }
    });

    it('resolveExtension: достигнутая цель, xMax, максимум, инвалидация', () => {
      for (const e of g.expected.extension) {
        const [a, b, ci, te] = [e.a, e.b, e.c, e.Te].map(idx) as [number, number, number, number];
        const bull = e.direction === 'bull';
        const o = resolveExtension({
          candles: c, direction: e.direction, A: bull ? c[a]!.low : c[a]!.high, B: bull ? c[b]!.high : c[b]!.low, C: bull ? c[ci]!.low : c[ci]!.high, Te: te, limit: g.params.limitCandles,
        });
        expect(o.reached).toBe(e.reached);
        expect(o.xMax).toBeCloseTo(e.xMax, 3);
        expect(o.extremePrice).toBe(e.extremePrice);
        expect(o.extremeIndex).toBe(idx(e.extremeTime));
        expect(o.invalidationIndex).toBe(e.invalidationTime ? idx(e.invalidationTime) : null);
      }
    });
  });
}
