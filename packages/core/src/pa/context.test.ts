import { describe, expect, it } from 'vitest';
import { loadKlines } from '../testing/fixtures-pa-challenge';
import type { Candle, OrderBlock } from '../types';
import {
  computeContext,
  gradeContext,
  htfClosedAt,
  isSignificant,
  obContainsExtreme,
  patternToMark,
  type ContextAnswer,
} from './context';
import { detectPatterns } from './patterns';

const c4h = loadKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const c15 = [...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-20.csv'), ...loadKlines('klines/BTCUSDT/15m/BTCUSDT-15m-2026-10-21.csv')];
const h1 = [...loadKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-20.csv'), ...loadKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-10-21.csv')];
const pats4h = detectPatterns(c4h);
const find = (list: typeof pats4h, type: string, last: number) => list.find((p) => p.type === type && p.lastIndex === last)!;
// Для 4h-ряда без файлов 1d старший ряд заменён самим 4h-рядом (правило htf(1d) = 1d: «тренд самого ряда») — данные реальные.
const htfSelf = (c: Candle[], last: number) => htfClosedAt(c, c[last]!.closeTime + 1);

describe('computeContext (реальные свечи BTCUSDT 4h 2026-09)', () => {
  it('pin-bar bull 09-28 08:00: sweep low 09-28 04:00 (уровень 82832.0), старший up -> значима', () => {
    const p = find(pats4h, 'pin-bar', 164);
    const r = computeContext(c4h, p, htfSelf(c4h, 164));
    expect(r.sweep).toBe(true);
    expect(r.evidence.sweep).toMatchObject({ side: 'low', level: 82832.0, time: Date.UTC(2026, 8, 28, 4) });
    expect(r.htfTrend).toBe('up');
    expect(r.significant).toBe(true);
    expect(r.direction).toBe('bull');
  });
  it('engulfing bull 09-11 12:00: sweep low 76151.9, но старший тренд down -> не значима (11.4)', () => {
    const p = find(pats4h, 'engulfing', 63);
    const r = computeContext(c4h, p, htfSelf(c4h, 63));
    expect(r.sweep).toBe(true);
    expect(r.evidence.sweep!.level).toBe(76151.9);
    expect(r.htfTrend).toBe('down');
    expect(r.significant).toBe(false);
  });
  it('sweep/keyLevel подтверждаются сырыми OHLC (15m, 2026-10-20/21)', () => {
    for (const p of detectPatterns(c15).filter((x) => x.direction !== null)) {
      const r = computeContext(c15, p, htfClosedAt(h1, c15[p.lastIndex]!.closeTime + 1));
      if (r.evidence.sweep) {
        const s = r.evidence.sweep;
        const c = c15[s.index]!;
        expect(s.index).toBeGreaterThanOrEqual(p.firstIndex - 2);
        expect(s.index).toBeLessThanOrEqual(p.lastIndex);
        expect(c15.some((x) => (s.side === 'low' ? x.low === s.level : x.high === s.level))).toBe(true);
        if (s.side === 'low') {
          expect(c.low).toBeLessThan(s.level);
          expect(c.close).toBeGreaterThanOrEqual(s.level);
        } else {
          expect(c.high).toBeGreaterThan(s.level);
          expect(c.close).toBeLessThanOrEqual(s.level);
        }
      }
      if (r.evidence.level) {
        const ext = p.direction === 'bull' ? Math.min(...c15.slice(p.firstIndex, p.lastIndex + 1).map((x) => x.low)) : Math.max(...c15.slice(p.firstIndex, p.lastIndex + 1).map((x) => x.high));
        expect(ext).toBeGreaterThanOrEqual(r.evidence.level.low * 0.997);
        expect(ext).toBeLessThanOrEqual(r.evidence.level.high * 1.003);
        expect(r.evidence.level.touches).toBeGreaterThanOrEqual(2);
      }
      expect(r.significant).toBe(isSignificant(p.direction!, r));
    }
  });
  it('не заглядывает вперёд: свечи после модели не влияют', () => {
    const p = find(pats4h, 'pin-bar', 164);
    expect(computeContext(c4h.slice(0, 165), p, htfSelf(c4h, 164))).toEqual(computeContext(c4h, p, htfSelf(c4h, 164)));
  });
  it('модель без направления отклоняется', () => {
    const doji = pats4h.find((p) => p.type === 'doji')!;
    expect(() => computeContext(c4h, doji, c4h)).toThrow('CONTEXT_NEEDS_DIRECTIONAL_PATTERN');
  });
  it('нет ATR у последней свечи -> ошибка', () => {
    expect(() => computeContext(c4h.slice(0, 8), { type: 'pin-bar', direction: 'bull', firstIndex: 7, lastIndex: 7, time: 0 }, c4h)).toThrow('CONTEXT_NO_ATR');
  });
});

describe('htfClosedAt', () => {
  it('частичная старшая свеча не участвует', () => {
    const T = h1[10]!.openTime + 30 * 60_000;
    const out = htfClosedAt(h1, T);
    expect(out[out.length - 1]!.openTime).toBe(h1[9]!.openTime);
    expect(htfClosedAt(h1.map((c) => ({ ...c, closed: false })), T)).toEqual([]);
  });
});

describe('значимость (11.4) и зона OB', () => {
  const f = (sweep: boolean, orderBlock: boolean, keyLevel: boolean, htfTrend: 'up' | 'down' | 'range') => ({ sweep, orderBlock, keyLevel, htfTrend });
  it('по тренду + зона -> значима; против тренда -> никогда', () => {
    expect(isSignificant('bull', f(true, false, false, 'up'))).toBe(true);
    expect(isSignificant('bull', f(false, false, false, 'up'))).toBe(false);
    expect(isSignificant('bull', f(true, true, true, 'down'))).toBe(false);
    expect(isSignificant('bear', f(false, false, true, 'down'))).toBe(true);
    expect(isSignificant('bear', f(true, true, true, 'up'))).toBe(false);
  });
  it('флэт: нужно >= 2 факторов', () => {
    expect(isSignificant('bull', f(true, false, false, 'range'))).toBe(false);
    expect(isSignificant('bull', f(true, false, true, 'range'))).toBe(true);
    expect(isSignificant('bear', f(true, true, true, 'range'))).toBe(true);
  });
  it('OB GS-4: бычий 09-17 20:00 [76210.0-76711.0], A=800: допуск 0.25A снизу', () => {
    const ob: Pick<OrderBlock, 'direction' | 'top' | 'bottom'> = { direction: 'bull', bottom: 76210.0, top: 76711.0 };
    expect(obContainsExtreme(ob, 76400, 800)).toBe(true);
    expect(obContainsExtreme(ob, 76010.0, 800)).toBe(true); // bottom - 200
    expect(obContainsExtreme(ob, 76009.9, 800)).toBe(false);
    expect(obContainsExtreme(ob, 76711.1, 800)).toBe(false);
  });
  it('OB медвежий: допуск 0.25A сверху', () => {
    const ob: Pick<OrderBlock, 'direction' | 'top' | 'bottom'> = { direction: 'bear', bottom: 79600.0, top: 80536.1 };
    expect(obContainsExtreme(ob, 80736.1, 800)).toBe(true);
    expect(obContainsExtreme(ob, 80737, 800)).toBe(false);
    expect(obContainsExtreme(ob, 79599, 800)).toBe(false);
  });
});

describe('gradeContext (11.5)', () => {
  const p = find(pats4h, 'pin-bar', 164);
  const ref = computeContext(c4h, p, htfSelf(c4h, 164));
  const exp: ContextAnswer = { sweep: ref.sweep, orderBlock: ref.orderBlock, keyLevel: ref.keyLevel, htfTrend: ref.htfTrend, significant: ref.significant };

  it('все 5 верно -> correct, score 1, pa-context 5/5', () => {
    const g = gradeContext(ref, exp);
    expect(g.verdict).toBe('correct');
    expect(g.score).toBe(1);
    expect(g.errors).toEqual([]);
    expect(g.skillOutcomes).toEqual([{ skill: 'pa-context', correct: 5, total: 5 }]);
    expect(g.ok).toEqual([{ code: 'OK_CONTEXT', params: { count: 5, total: 5 } }]);
  });
  it('пропущен sweep, significant верно -> partial с CONTEXT_MISSED_SWEEP', () => {
    const g = gradeContext(ref, { ...exp, sweep: false });
    expect(g.verdict).toBe('partial');
    expect(g.score).toBe(0.8);
    expect(g.errors.map((e) => e.code)).toEqual(['CONTEXT_MISSED_SWEEP']);
    expect(g.errors[0]!.params).toMatchObject({ side: 'low', level: 82832.0 });
  });
  it('фантомные факторы и неверный старший тренд', () => {
    const g = gradeContext(ref, { ...exp, orderBlock: true, keyLevel: true, htfTrend: 'down' }, '1d');
    expect(g.errors.map((e) => e.code)).toEqual(['CONTEXT_PHANTOM_FACTOR', 'CONTEXT_PHANTOM_FACTOR', 'CONTEXT_IGNORED_HTF']);
    expect(g.errors[2]!.params).toMatchObject({ given: 'down', expected: 'up', htfTf: '1d' });
    expect(g.verdict).toBe('partial');
  });
  it('significant неверно -> incorrect; FALSE_NEGATIVE', () => {
    const g = gradeContext(ref, { ...exp, significant: false });
    expect(g.verdict).toBe('incorrect');
    expect(g.errors.map((e) => e.code)).toEqual(['CONTEXT_FALSE_NEGATIVE']);
    expect(g.errors[0]!.params).toMatchObject({ factors: 'sweep' });
  });
  it('FALSE_POSITIVE и пропуск OB/уровня из эталона (на синтетическом эталоне)', () => {
    // SYNTHETIC: эталон с OB и уровнем одновременно в реальных 4h-данных недоступен; поля берутся из реального OB GS-4
    const synthetic_ref = {
      ...ref,
      orderBlock: true,
      keyLevel: true,
      significant: false,
      htfTrend: 'down' as const,
      evidence: {
        ...ref.evidence,
        orderBlock: { bottom: 76210.0, top: 76711.0, time: Date.UTC(2026, 8, 17, 20) } as OrderBlock,
        level: { center: 79965, touches: 4 } as never,
      },
    };
    const g = gradeContext(synthetic_ref, { sweep: ref.sweep, orderBlock: false, keyLevel: false, htfTrend: 'down', significant: true });
    expect(g.errors.map((e) => e.code)).toEqual(['CONTEXT_MISSED_OB', 'CONTEXT_MISSED_LEVEL', 'CONTEXT_FALSE_POSITIVE']);
    expect(g.errors[2]!.params!.why).toContain('против старшего тренда');
    const flat = gradeContext({ ...synthetic_ref, direction: 'bull', htfTrend: 'range' }, { sweep: ref.sweep, orderBlock: true, keyLevel: true, htfTrend: 'range', significant: true });
    expect(flat.errors.map((e) => e.code)).toEqual(['CONTEXT_FALSE_POSITIVE']);
    expect(flat.errors[0]!.params!.why).toBe('Нет подтверждающего контекста');
  });
  it('все пять неверно -> score 0, нет OK', () => {
    const g = gradeContext(ref, { sweep: false, orderBlock: true, keyLevel: true, htfTrend: 'down', significant: false });
    expect(g.score).toBe(0);
    expect(g.ok).toEqual([]);
    expect(g.verdict).toBe('incorrect');
  });
});

describe('patternToMark', () => {
  it('якоря по свечам модели (time=openTime, price=close)', () => {
    const p = find(pats4h, 'morning-star', 0 + pats4h.find((x) => x.type === 'morning-star')!.lastIndex);
    const m = patternToMark(c4h, p);
    expect(m.kind).toBe('pattern');
    expect(m.anchors).toHaveLength(3);
    expect(m.anchors[0]).toEqual({ time: c4h[p.firstIndex]!.openTime, price: c4h[p.firstIndex]!.close });
    expect(m.meta).toEqual({ patternType: 'morning-star' });
    expect(m.author).toBe('algo');
    expect(m.direction).toBe('bull');
  });
});
