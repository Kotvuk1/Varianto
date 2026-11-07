import { describe, expect, it } from 'vitest';
import type { Candle } from '@tl/core';
import { guideBandParts, replayMarkerParts, replayMarkers } from './markers';

const H = 3_600_000;
const T0 = Date.UTC(2025, 0, 1);
// SYNTHETIC: пять свечей проигрывания для проверки привязки маркеров, не рыночные данные
const synthetic_candles: Candle[] = Array.from({ length: 5 }, (_, i) => ({
  openTime: T0 + i * H,
  closeTime: T0 + (i + 1) * H - 1,
  open: 100,
  high: 110 + i,
  low: 90 - i,
  close: 100,
  volume: 1,
  quoteVolume: 1,
  trades: 1,
  closed: true,
}));

describe('маркеры проигрывания отложенного ордера', () => {
  it('исполнение: на свече fillIndex по цене лимитки', () => {
    const m = replayMarkers({ candles: synthetic_candles, fillIndex: 2, limitPrice: 95 });
    expect(m).toEqual([{ kind: 'fill', time: T0 + 2 * H, price: 95 }]);
  });
  it('не исполнился: «ордер снят» на последней свече проигрывания (или exitIndex)', () => {
    expect(replayMarkers({ candles: synthetic_candles, fillIndex: null, limitPrice: 95 })).toEqual([{ kind: 'cancelled', time: T0 + 4 * H, price: 95 }]);
    expect(replayMarkers({ candles: synthetic_candles, fillIndex: null, exitIndex: 3, limitPrice: 95 })[0]).toMatchObject({ kind: 'cancelled', time: T0 + 3 * H });
  });
  it('stop hunt: маркер на свече выноса у стопа, рядом с исполнением', () => {
    const m = replayMarkers({ candles: synthetic_candles, fillIndex: 1, limitPrice: 95, stopHunt: { index: 3, sl: 88 } });
    expect(m.map((x) => x.kind)).toEqual(['fill', 'stop-hunt']);
    expect(m[1]).toEqual({ kind: 'stop-hunt', time: T0 + 3 * H, price: 88 });
  });
  it('индекс вне ряда игнорируется, пустой ряд - пустой результат', () => {
    expect(replayMarkers({ candles: synthetic_candles, fillIndex: 9, limitPrice: 95 })).toEqual([]);
    expect(replayMarkers({ candles: [], fillIndex: null, limitPrice: 95 })).toEqual([]);
  });
});

describe('геометрия маркеров', () => {
  // SYNTHETIC: линейная проекция
  const proj = { timeToX: (t: number) => ((t - T0) / H) * 10, xToTime: (x: number) => T0 + (x / 10) * H, priceToY: (p: number) => 500 - p, yToPrice: (y: number) => 500 - y, width: 400, height: 600 };
  it('три вида различаются формой и подписью', () => {
    const parts = (kind: 'fill' | 'cancelled' | 'stop-hunt') => replayMarkerParts([{ kind, time: T0 + 2 * H, price: 95 }], proj, String);
    const glyph = (k: 'fill' | 'cancelled' | 'stop-hunt') => (parts(k).find((p) => p.t === 'glyph') as { g: string }).g;
    expect(new Set([glyph('fill'), glyph('cancelled'), glyph('stop-hunt')]).size).toBe(3);
    const text = (k: 'fill' | 'cancelled' | 'stop-hunt') => (parts(k).find((p) => p.t === 'text') as { text: string }).text;
    expect(text('fill')).toBe('Исполнен · 95');
    expect(text('cancelled')).toBe('Ордер снят');
    expect(text('stop-hunt')).toBe('Stop hunt');
  });
  it('вне видимой области маркер не рисуется', () => {
    expect(replayMarkerParts([{ kind: 'fill', time: T0 + 500 * H, price: 95 }], proj, String)).toEqual([]);
  });
  it('полоса «полный балл»: на всю ширину между ценами, штриховка и подпись', () => {
    const parts = guideBandParts({ from: 100, to: 120 }, proj, 'Полный балл');
    expect(parts.find((p) => p.t === 'rect')).toMatchObject({ x1: 0, x2: 400, y1: 380, y2: 400, hatch: true });
    expect(parts.find((p) => p.t === 'text')).toMatchObject({ text: 'Полный балл' });
  });
  it('полоса задана в любом порядке границ', () => {
    expect(guideBandParts({ from: 120, to: 100 }, proj, 'x').find((p) => p.t === 'rect')).toMatchObject({ y1: 380, y2: 400 });
  });
});
