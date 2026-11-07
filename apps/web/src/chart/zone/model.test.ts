import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { isEntryLocked, isLimitMark, limitPrice, limitSideOf, nearestEdge, positionRisk, slBufferAtr, withDerivedMeta } from './model';

const m = (kind: Mark['kind'], meta?: Record<string, unknown>, prices: number[] = [100]): Mark => ({
  id: 'x',
  kind,
  anchors: prices.map((price) => ({ time: 1, price })),
  scope: null,
  direction: null,
  author: 'user',
  ...(meta ? { meta } : {}),
});

describe('лимитный ордер', () => {
  it('сторона по последней цене', () => {
    expect(limitSideOf(99, 100)).toBe('buy');
    expect(limitSideOf(101, 100)).toBe('sell');
  });
  it('распознаётся по hline + role limit; цена берётся из метки', () => {
    expect(isLimitMark(m('hline', { role: 'limit' }))).toBe(true);
    expect(isLimitMark(m('hline', { role: 'ew-invalidation' }))).toBe(false);
    expect(limitPrice([m('hline'), m('hline', { role: 'limit', side: 'buy' }, [77])])).toBe(77);
    expect(limitPrice([m('hline')])).toBeNull();
  });
  it('withDerivedMeta пересчитывает сторону лимитки и entry/sl/tp позиции', () => {
    expect(withDerivedMeta(m('hline', { role: 'limit', side: 'buy' }, [120]), 100).meta).toMatchObject({ side: 'sell' });
    const p = withDerivedMeta(m('position', { entryLocked: true }, [10, 8, 15]), null);
    expect(p.meta).toEqual({ entryLocked: true, entry: 10, sl: 8, tp: 15 });
    expect(isEntryLocked(p)).toBe(true);
  });
});

describe('R:R и риск', () => {
  it('long: RR = награда / риск', () => {
    expect(positionRisk(100, 90, 130)).toMatchObject({ side: 'long', rr: 3 });
  });
  it('short', () => {
    expect(positionRisk(100, 110, 85)).toMatchObject({ side: 'short', rr: 1.5 });
  });
  it('вырожденные и противоречивые позиции - null', () => {
    expect(positionRisk(100, 100, 120)).toBeNull();
    expect(positionRisk(100, 110, 120)).toBeNull();
    expect(positionRisk(100, 90, 100)).toBeNull();
  });
});

describe('запас стопа в ATR', () => {
  it('long: структура 100, стоп 98, ATR 4 -> 0.5; short зеркально', () => {
    expect(slBufferAtr('long', 98, 100, 4)).toBe(0.5);
    expect(slBufferAtr('short', 102, 100, 4)).toBe(0.5);
  });
  it('стоп внутри структуры - отрицательный запас; ATR недоступен - null', () => {
    expect(slBufferAtr('long', 101, 100, 4)).toBe(-0.25);
    expect(slBufferAtr('long', 98, 100, 0)).toBeNull();
  });
});

describe('nearestEdge', () => {
  it('ближайший край в допуске, иначе null', () => {
    expect(nearestEdge([10, 50], 48, 8)).toBe(1);
    expect(nearestEdge([10, 50], 30, 8)).toBeNull();
  });
});
