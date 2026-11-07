import { describe, expect, it } from 'vitest';
import { PARAM_KINDS, formatFeedbackParams, normalizeParams, roundByTick } from './format';
import { flattenTemplates, fillTemplate, ERROR_TEMPLATES_RU, OK_TEMPLATES_RU } from './templates.ru';

describe('normalizeParams', () => {
  it('округляет цены по tickSize, проценты и R до 2 знаков', () => {
    const p = normalizeParams({ size: 969.6999999999971, devPct: 0.20344834672530776, rr: 2.0000000000000338, k: 1.2000000000000002, sl: 2323.4000000001, touches: 3 }, 0.1);
    expect(p).toEqual({ size: 969.7, devPct: 0.2, rr: 2, k: 1.2, sl: 2323.4, touches: 3 });
  });
  it('по умолчанию 2 знака', () => {
    expect(normalizeParams({ close: 1.23456789 }).close).toBe(1.23);
  });
  it('roundByTick', () => {
    expect(roundByTick(0.30000000000000004, 0.01)).toBe(0.3);
    expect(roundByTick(70612.8123, 0.5)).toBe(70613);
  });
});

describe('formatFeedbackParams', () => {
  const fmt = { formatPrice: (n: number) => `P${n}`, formatPercent: (n: number) => `${n}pct`, formatR: (n: number) => `${n}R` };
  it('применяет форматеры и словари', () => {
    const out = formatFeedbackParams({ given: 'up', expected: 'down', htfTf: '4h', sl: 5, devPct: 0.2, rr: 2, side: 'LONG', lastEvent: 'BOS bull', time: 1700000000000, level: 'нет' }, fmt);
    expect(out).toMatchObject({ given: 'восходящий', expected: 'нисходящий', htfTf: '4H', sl: 'P5', devPct: '0.2pct', rr: '2R', side: 'лонг', lastEvent: 'BOS бычий', level: 'нет' });
    expect(out.time).toBe('1700000000000');
  });
  it('SL-шаблон без англ. enum и сырых float', () => {
    const t = ERROR_TEMPLATES_RU.SL_INSIDE_STRUCTURE.mistake;
    expect(fillTemplate(t, formatFeedbackParams({ sl: 2323.4, level: 2282.7 }, fmt))).toBe('Стоп P2323.4 стоит внутри структуры: он должен быть за защищённым уровнем P2282.7.');
  });
  it('шаблоны не содержат up/down/4h после подстановки', () => {
    const s = fillTemplate(ERROR_TEMPLATES_RU.CONTEXT_IGNORED_HTF.mistake + OK_TEMPLATES_RU.OK_HTF, formatFeedbackParams({ given: 'up', expected: 'down', htfTf: '4h', htfTrend: 'up' }));
    expect(s).not.toMatch(/\b(up|down|4h)\b/);
  });
  it('без форматеров — дефолт: 2 знака, не более 2 знаков после точки', () => {
    const out = formatFeedbackParams({ devPct: 0.20344834672530776, rr: 2.0000000000000338, size: 969.6999999999971 });
    expect(out).toEqual({ devPct: '0.2', rr: '2', size: '969.7' });
  });
});

describe('property: нет чисел с > 4 знаками после разделителя', () => {
  it('все шаблоны при float-мусоре в params', () => {
    const junk: Record<string, number> = {};
    for (const k of Object.keys(PARAM_KINDS)) junk[k] = 969.6999999999971 / 3.1;
    const params = formatFeedbackParams(junk, { tickSize: 0.1 });
    for (const t of Object.values(flattenTemplates())) {
      expect(fillTemplate(t, params)).not.toMatch(/\d+[.,]\d{5,}/);
    }
  });
});
