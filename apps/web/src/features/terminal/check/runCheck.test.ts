import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analyzeStructure, msParamsFor, toMarks, type Candle, type Mark } from '@tl/core';
import { conceptsFor, RANGE_TAIL_CANDLES, runCheck } from './runCheck';

// Реальные свечи BTCUSDT 1h (data.binance.vision), сентябрь 2026.
const candles: Candle[] = readFileSync(resolve(process.cwd(), '../../fixtures/klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv'), 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((l) => {
    const [t, o, h, lo, c, v, ct, qv, n] = l.split(',').map(Number) as [number, number, number, number, number, number, number, number, number];
    return { openTime: t, closeTime: ct, open: o, high: h, low: lo, close: c, volume: v, quoteVolume: qv, trades: n, closed: true };
  });

const r = analyzeStructure(candles, msParamsFor('medium'), { tf: '1h' });
const algoMarks = toMarks(r);
const choch = algoMarks.find((m) => m.kind === 'choch' && m.scope === 'external' && m.anchors[0]!.time > candles[40]!.openTime)!;
const internalChoch = algoMarks.find((m) => m.kind === 'choch' && m.scope === 'internal')!;
const asUser = (m: Mark, kind: Mark['kind'] = m.kind): Mark => ({ ...m, id: 'u1', kind, scope: null, author: 'user' });

describe('понятия по меткам пользователя', () => {
  it('BOS и CHoCH оцениваются вместе', () => {
    expect(conceptsFor([{ ...choch, kind: 'bos' }]).sort()).toEqual(['bos', 'choch']);
    expect(conceptsFor([{ ...choch, kind: 'fvg' }])).toEqual(['fvg']);
  });
});

describe('runCheck на реальных свечах', () => {
  it('нет меток - причина no-marks', () => {
    expect(runCheck(candles, '1h', [])).toEqual({ ok: false, reason: 'no-marks' });
  });

  it('верный CHoCH совпадает с эталоном: состояние match, ошибок BOS_CHOCH_CONFUSED нет', () => {
    const o = runCheck(candles, '1h', [asUser(choch)]);
    expect(o.ok).toBe(true);
    if (!o.ok) return;
    expect(o.result.states['u1']).toBe('match');
    expect(o.result.grade.errors.map((e) => e.code)).not.toContain('BOS_CHOCH_CONFUSED');
  });

  it('BOS там, где алгоритм видит CHoCH: BOS_CHOCH_CONFUSED и 6 частей разбора', () => {
    const o = runCheck(candles, '1h', [asUser(choch, 'bos')]);
    expect(o.ok).toBe(true);
    if (!o.ok) return;
    const codes = o.result.grade.errors.map((e) => e.code);
    expect(codes).toContain('BOS_CHOCH_CONFUSED');
    const f = o.result.feedback;
    expect(f.verdict.templateKey).toMatch(/^feedback\.verdict\./);
    expect(f.mistakes.length).toBe(f.why.length);
    expect(f.mistakes.some((b) => b.code === 'BOS_CHOCH_CONFUSED')).toBe(true);
    expect(o.result.algoMarks.some((m) => m.id === choch.id)).toBe(true);
    // место совпало, но тип неверный: не «совпало» - метка пользователя лишняя, эталон пропущен
    expect(o.result.states['u1']).toBe('extra');
    expect(o.result.states[choch.id]).toBe('missed');
  });

  it('BOS на месте внутреннего CHoCH разбирается так же (internal допустим, но не обязателен)', () => {
    const o = runCheck(candles, '1h', [asUser(internalChoch, 'bos')]);
    if (!o.ok) throw new Error('ожидался результат');
    expect(o.result.grade.errors.map((e) => e.code)).toContain('BOS_CHOCH_CONFUSED');
    expect(o.result.grade.errors.map((e) => e.code)).not.toContain('SWING_MISSED');
  });

  it('вердикт по меткам пользователя: N из M ваших, пропуски эталона не входят в M', () => {
    const o = runCheck(candles, '1h', [asUser(choch)]);
    if (!o.ok) throw new Error('ожидался результат');
    expect(o.result.summary).toEqual({ matched: 1, total: 1 });
    expect(o.result.feedback.mistakes.every((b) => !/_MISS(ED|ING)$/.test(b.code ?? ''))).toBe(true);
  });

  it('учитываются только типы меток пользователя: при одном CHoCH нет пропусков swing', () => {
    const o = runCheck(candles, '1h', [asUser(choch)]);
    if (!o.ok) throw new Error('ожидался результат');
    expect(o.result.grade.errors.map((e) => e.code)).not.toContain('SWING_MISSED');
  });

  it('диапазон: от первой метки до последней + 3 свечи', () => {
    const o = runCheck(candles, '1h', [asUser(choch)]);
    if (!o.ok) throw new Error('ожидался результат');
    const w = o.result.window;
    const lastIdx = candles.findIndex((c) => c.openTime >= Math.max(...choch.anchors.map((x) => x.time)));
    expect(w.toIndex).toBe(lastIdx + RANGE_TAIL_CANDLES);
    expect(w.toIndex).toBeLessThan(candles.length - 1);
  });

  it('метка вдали от структуры - extra, эталон показан как missed', () => {
    const far = { ...asUser(choch, 'fvg'), anchors: [{ time: candles[100]!.openTime, price: candles[100]!.high }, { time: candles[110]!.openTime, price: candles[100]!.low }] };
    const o = runCheck(candles, '1h', [far]);
    if (!o.ok) throw new Error('ожидался результат');
    expect(['extra', undefined]).toContain(o.result.states['u1']);
    expect(o.result.window.fromIndex).toBe(100);
  });
});
