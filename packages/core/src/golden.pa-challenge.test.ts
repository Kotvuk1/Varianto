// Golden-тесты PA/Challenge (fixtures/golden/pa_*, challenge_*): точное сравнение с ожидаемым из JSON.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { computeChallengeFacts } from './challenge/facts';
import { resolveTrade, type FutureProvider } from './challenge/resolve';
import { computeContext, htfClosedAt } from './pa/context';
import { findLevels } from './pa/levels';
import { detectPatterns } from './pa/patterns';
import { loadAggTrades, loadKlines } from './testing/fixtures-pa-challenge';
import { ALGO_VERSION } from './version';

const FIX = resolve(dirname(fileURLToPath(import.meta.url)), '../../../fixtures');
const golden = (name: string) => JSON.parse(readFileSync(resolve(FIX, 'golden', name), 'utf8'));
const iso = (t: number) => new Date(t).toISOString().replace('.000Z', 'Z');
const sha = (rel: string) => createHash('sha256').update(readFileSync(resolve(FIX, rel))).digest('hex');
const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');

describe('golden: версия и источники', () => {
  it.each([
    'pa_GS-5.BTCUSDT-4h-2026-09.patterns.golden.json',
    'pa_GS-6.BTCUSDT-4h-2026-09.levels.golden.json',
    'pa_CTX-1.BTCUSDT-4h-2026-09.context.golden.json',
    'challenge_CH-1.BTCUSDT-4h-2026-09.refside.golden.json',
  ])('%s: algoVersion и sha256 CSV', (name) => {
    const g = golden(name);
    expect(g.algoVersion).toBe(ALGO_VERSION);
    expect(sha(`${g.source.csv}`)).toBe(g.source.sha256);
  });
  it('GS-10: algoVersion и sha256 всех источников', () => {
    const g = golden('challenge_GS-10.BTCUSDT-15m-2026-10-20.resolve-trade.golden.json');
    expect(g.algoVersion).toBe(ALGO_VERSION);
    for (const rel of g.source.csv) expect(sha(rel)).toBe(g.source.sha256[rel]);
  });
});

describe('golden: PA', () => {
  it('GS-5 detectPatterns', () => {
    const g = golden('pa_GS-5.BTCUSDT-4h-2026-09.patterns.golden.json');
    const got = detectPatterns(c4h).map((p) => ({ type: p.type, direction: p.direction, firstTime: iso(c4h[p.firstIndex]!.openTime), lastTime: iso(p.time) }));
    expect(got).toEqual(g.expected.instances);
    expect(got).toHaveLength(g.expected.count);
  });
  it('GS-6 findLevels', () => {
    const g = golden('pa_GS-6.BTCUSDT-4h-2026-09.levels.golden.json');
    const r = findLevels(c4h);
    expect(Math.round(r.width * 100) / 100).toBe(g.expected.width);
    expect(
      r.levels.map((l) => ({ center: Math.round(l.center * 100) / 100, low: l.low, high: l.high, touches: l.touches, type: l.type, lastTouch: iso(c4h[l.lastTouchIndex]!.openTime) })),
    ).toEqual(g.expected.levels);
  });
  it('CTX-1 computeContext', () => {
    const g = golden('pa_CTX-1.BTCUSDT-4h-2026-09.context.golden.json');
    for (const e of g.expected) {
      const p = detectPatterns(c4h).find((x) => x.type === e.pattern.type && iso(x.time) === e.pattern.lastTime)!;
      const r = computeContext(c4h, p, htfClosedAt(c4h, c4h[p.lastIndex]!.closeTime + 1));
      expect({ sweep: r.sweep, orderBlock: r.orderBlock, keyLevel: r.keyLevel, htfTrend: r.htfTrend, significant: r.significant, sweepLevel: r.evidence.sweep?.level ?? null, sweepTime: r.evidence.sweep ? iso(r.evidence.sweep.time) : null }).toEqual({
        sweep: e.sweep, orderBlock: e.orderBlock, keyLevel: e.keyLevel, htfTrend: e.htfTrend, significant: e.significant, sweepLevel: e.sweepLevel, sweepTime: e.sweepTime,
      });
    }
  });
});

describe('golden: Challenge', () => {
  it('CH-1 refSide', () => {
    const g = golden('challenge_CH-1.BTCUSDT-4h-2026-09.refside.golden.json');
    const idx = [41, 42, 82, 60];
    g.expected.forEach((e: { decisionTime: string; entry: number; trendTf: string; trendHtf: string; refSide: string; ref: unknown }, k: number) => {
      const s = c4h.slice(0, idx[k]! + 1);
      const f = computeChallengeFacts({ candles: s, tf: '4h', htf: s });
      expect({ decisionTime: iso(c4h[idx[k]!]!.closeTime + 1), entry: f.entry, trendTf: f.trendTf, trendHtf: f.trendHtf, refSide: f.refSide, ref: f.ref }).toEqual(e);
    });
  });
  it('GS-10 resolveTrade', async () => {
    const g = golden('challenge_GS-10.BTCUSDT-15m-2026-10-20.resolve-trade.golden.json');
    const c15 = [...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv'), ...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-21.csv')];
    const c1 = [...loadKlines('klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-20.csv'), ...loadKlines('klines/BTCUSDT/1m/BTCUSDT-1m-2026-10-21.csv')];
    const agg = loadAggTrades('aggTrades/BTCUSDT-aggTrades-2026-10-20.csv');
    const provider: FutureProvider = {
      candles: async (_tf, from, count) => c15.filter((c) => c.openTime >= from).slice(0, count),
      minute1: async (from, to) => c1.filter((c) => c.openTime >= from && c.openTime < to),
      aggTrades: async (m) => (m + 60_000 > agg[agg.length - 1]!.transactTime ? null : agg.filter((t) => t.transactTime >= m && t.transactTime < m + 60_000)),
    };
    const ms = (v: string | number) => (typeof v === 'number' ? v : Date.parse(v));
    for (const e of g.expected) {
      const r = await resolveTrade({ ...e.position, T: ms(e.position.T), tf: g.params.tf, limitCandles: g.params.limitCandles }, provider);
      expect(r.result, e.case).toBe(e.result);
      expect(r.method, e.case).toBe(e.method);
      expect(r.exitPrice, e.case).toBe(e.exitPrice);
      expect(r.exitTime, e.case).toBe(ms(e.exitTime));
      expect(r.rMultiple, e.case).toBeCloseTo(e.r, 9);
    }
  });
});
