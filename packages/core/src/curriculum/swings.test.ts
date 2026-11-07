import { describe, expect, it } from 'vitest';
import { btc1h, btc4h, curSetup, isoOf } from '../testing/cur';
import { readKlines } from '../testing/klines';
import { selectSwTrendTask, swingTrend, SW_MARK_TFS, SW_TREND_OPTIONS, SW_TREND_TFS, SW_TREND_WINDOW, swTrendHints, swTrendN } from './swings';
import type { Difficulty } from '../types';

describe('swingTrend (§2.3, SW-1)', () => {
  const c4 = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
  it('SW-1 N = 5: LH + LL -> down при тренде BOS up', () => {
    const r = swingTrend(c4, 5)!;
    expect(r.trend).toBe('down');
    expect(r.bosTrend).toBe('up');
    expect([r.lastHigh, r.prevHigh, r.lastLow, r.prevLow].map((s) => [isoOf(s.time), s.price, s.label])).toEqual([
      ['2026-09-29T12:00:00Z', 84554.9, 'LH'],
      ['2026-09-27T12:00:00Z', 85146.4, 'LH'],
      ['2026-09-28T12:00:00Z', 82500.1, 'LL'],
      ['2026-09-25T12:00:00Z', 83130.1, 'HL'],
    ]);
  });
  it('SW-1 N = 7: H1 85146.4 LH к 85224.0, L1 82500.1 LL к 82832.0', () => {
    const r = swingTrend(c4, 7)!;
    expect(r.trend).toBe('down');
    expect([r.lastHigh.price, r.lastHigh.label, r.prevHigh.price, r.lastLow.price, r.lastLow.label, r.prevLow.price]).toEqual([85146.4, 'LH', 85224, 82500.1, 'LL', 82832]);
  });
  it('HH + HL -> up; HH + LL (расширение) и LH + HL (сжатие) -> range; мало swing -> null', () => {
    // классификация по реальным окнам: перебираем срезы ряда, все три класса встречаются
    const h1 = btc1h();
    const seen = new Set<string>();
    for (let end = 400; end < h1.length; end += 7) {
      const r = swingTrend(h1.slice(Math.max(0, end - 300), end), 5);
      if (r) {
        seen.add(r.trend);
        const mixed = (r.lastHigh.label === 'HH') !== (r.lastLow.label === 'HL');
        if (r.trend === 'up') expect([r.lastHigh.label, r.lastLow.label]).toEqual(['HH', 'HL']);
        if (r.trend === 'down') expect([r.lastHigh.label, r.lastLow.label]).toEqual(['LH', 'LL']);
        if (mixed) expect(r.trend).toBe('range');
      }
    }
    expect([...seen].sort()).toEqual(['down', 'range', 'up']);
    expect(swingTrend(c4.slice(0, 20), 5)).toBeNull();
  });
});

describe('selectSwTrendTask (§2.3)', () => {
  const h1 = btc1h();
  for (const d of ['easy', 'medium', 'hard'] as Difficulty[]) {
    it(`${d}: N = ${swTrendN(d)}, свинги в окне ${SW_TREND_WINDOW}, детерминизм`, () => {
      for (const seed of [1, 2, 3]) {
        const sel = selectSwTrendTask({ candles: h1, tf: '1h', difficulty: d, seed })!;
        expect(sel).not.toBeNull();
        expect(sel.nExt).toBe(d === 'hard' ? 5 : 7);
        expect(sel.visible.every((c) => c.closeTime < sel.T)).toBe(true);
        for (const s of [sel.result.lastHigh, sel.result.prevHigh, sel.result.lastLow, sel.result.prevLow]) {
          expect(s.index).toBeGreaterThanOrEqual(sel.visible.length - SW_TREND_WINDOW);
        }
        expect(SW_TREND_OPTIONS).toContain(sel.result.trend);
        expect(selectSwTrendTask({ candles: h1, tf: '1h', difficulty: d, seed })!.T).toBe(sel.T);
      }
    });
  }
  it('балансировка: за 24 seed встречаются все три ответа', () => {
    const got = new Set<string>();
    for (let seed = 1; seed <= 24; seed++) got.add(selectSwTrendTask({ candles: h1, tf: '1h', difficulty: 'medium', seed })!.result.trend);
    expect(got.size).toBe(3);
  });
  it('hard: примерно половина заданий с расхождением тренда по свингам и BOS', () => {
    let differ = 0;
    const N = 20;
    for (let seed = 1; seed <= N; seed++) {
      const r = selectSwTrendTask({ candles: h1, tf: '1h', difficulty: 'hard', seed })!.result;
      if (r.trend !== r.bosTrend) differ++;
    }
    expect(differ / N).toBeGreaterThanOrEqual(0.4);
  });
  it('подсказки easy - swing окна без подписей и без будущего; таблицы ТФ', () => {
    const sel = selectSwTrendTask({ candles: h1, tf: '1h', difficulty: 'easy', seed: 4 })!;
    const hints = swTrendHints(sel.visible, sel.nExt);
    expect(hints.length).toBeGreaterThan(2);
    expect(hints.every((m) => (m.kind === 'swing-high' || m.kind === 'swing-low') && m.anchors[0]!.time <= sel.visible[sel.visible.length - 1]!.openTime)).toBe(true);
    expect(SW_TREND_TFS.easy).toEqual(['1h', '4h']);
    expect(SW_MARK_TFS.easy).toEqual(['1h', '4h', '1d']);
    expect(SW_MARK_TFS.hard).toContain('15m');
  });
  it('мало истории / всё исключено -> null', () => {
    expect(selectSwTrendTask({ candles: h1.slice(0, 200), tf: '1h', difficulty: 'easy', seed: 1 })).toBeNull();
    expect(selectSwTrendTask({ candles: h1, tf: '1h', difficulty: 'easy', seed: 1, isExcluded: () => true, maxAttempts: 5 })).toBeNull();
  });
  it('golden-подготовка curSetup использует тот же ряд', () => {
    expect(curSetup({ id: 'x', kind: 'sw-trend', symbol: 'BTCUSDT', tf: '4h', lastVisible: '2026-09-30T20:00:00Z', tick: 0.1, files: ['klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv'] }).visible).toHaveLength(180);
    expect(btc4h().length).toBeGreaterThan(300);
  });
});
