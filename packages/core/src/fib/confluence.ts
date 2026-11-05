// Конфлюэнс уровня (FIBONACCI.md §6.5): OB / FVG / старый внешний swing в полосе варианта. Только данные до T.
import { analyzeStructure } from '../smc/analyze';
import { markItems } from '../smc/marks';
import type { Candle, Mark, StructureResult } from '../types';
import { FIB_OTE, fibLevelPrice } from './levels';
import { FIB_LEVEL_TOL } from './reaction';
import type { FibConfluenceKey, FibDirection, FibReactionOption } from './types';

export const FIB_CONFLUENCE_KEYS: readonly FibConfluenceKey[] = ['order-block', 'fvg', 'level'];
/** «Уровень» ищется среди внешних swing не старше этого числа свечей до T. */
export const FIB_LEVEL_LOOKBACK = 300;

export interface PriceBand {
  low: number;
  high: number;
}

/** Полоса варианта: уровень L - [price(L-0.04), price(L+0.04)]; ote - [price(0.62), price(0.79)]; deep - null. */
export function bandOf(A: number, B: number, option: FibReactionOption): PriceBand | null {
  if (option === 'deep') return null;
  const [r0, r1] = option === 'ote' ? [FIB_OTE.from, FIB_OTE.to] : [Number(option) - FIB_LEVEL_TOL, Number(option) + FIB_LEVEL_TOL];
  const p0 = fibLevelPrice(A, B, r0);
  const p1 = fibLevelPrice(A, B, r1);
  return { low: Math.min(p0, p1), high: Math.max(p0, p1) };
}

const overlaps = (lo: number, hi: number, band: PriceBand): boolean => lo <= band.high && hi >= band.low;

export interface ConfluenceCtx {
  direction: FibDirection;
  /** Индекс начала импульса. */
  aIndex: number;
  A: number;
  B: number;
}

/** Факторы по SMC-движку на `visible` = candles[0..T] (внешняя структура nExt). Создаётся один раз на задание. */
export class FibConfluence {
  private readonly r: StructureResult;
  private readonly n: number;

  constructor(
    visible: readonly Candle[],
    nExt: number,
    private readonly ctx: ConfluenceCtx,
  ) {
    this.n = visible.length;
    this.r = analyzeStructure(visible, { nExt, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
  }

  at(band: PriceBand | null): Record<FibConfluenceKey, boolean> {
    if (!band) return { 'order-block': false, fvg: false, level: false };
    const { direction, aIndex } = this.ctx;
    const ob = this.r.orderBlocks.some((o) => o.direction === direction && o.valid && o.status !== 'invalidated' && overlaps(o.bottom, o.top, band));
    const fvg = this.r.fvgs.some((f) => f.direction === direction && f.status !== 'filled' && overlaps(f.bottom, f.top, band));
    const level = this.r.swings.some(
      (s) => s.scope === 'external' && s.index < aIndex && s.index >= this.n - FIB_LEVEL_LOOKBACK && s.price >= band.low && s.price <= band.high,
    );
    return { 'order-block': ob, fvg, level };
  }

  /** Метки объектов, дающих конфлюэнс в полосе (OB, FVG, старый swing): для эталона разбора. */
  zoneMarks(band: PriceBand | null): Mark[] {
    if (!band) return [];
    const { direction, aIndex } = this.ctx;
    const out: Mark[] = [];
    for (const it of markItems(this.r)) {
      if (it.cls === 'ob') {
        const o = it.src as import('../types').OrderBlock;
        if (o.direction === direction && o.valid && o.status !== 'invalidated' && overlaps(o.bottom, o.top, band)) out.push(it.mark);
      } else if (it.cls === 'fvg') {
        const f = it.src as import('../types').Fvg;
        if (f.direction === direction && f.status !== 'filled' && overlaps(f.bottom, f.top, band)) out.push(it.mark);
      } else if (it.cls === 'swing') {
        const s = it.src as import('../types').Swing;
        if (s.scope === 'external' && s.index < aIndex && s.index >= this.n - FIB_LEVEL_LOOKBACK && s.price >= band.low && s.price <= band.high) out.push(it.mark);
      }
    }
    return out;
  }

  /** Факторы выбранного варианта (deep - все false). */
  atOption(option: FibReactionOption): Record<FibConfluenceKey, boolean> {
    return this.at(bandOf(this.ctx.A, this.ctx.B, option));
  }
}
