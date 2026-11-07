import { describe, expect, it } from 'vitest';
import { CONTEXT_FIELD_IDS, CONTEXT_HTF, viewForField } from './contextFlow';

describe('автопереключение ТФ в «Контексте»', () => {
  it('старший ТФ только на шаге «Тренд» (4-й из 5)', () => {
    expect(CONTEXT_FIELD_IDS.map(viewForField)).toEqual(['base', 'base', 'base', 'htf', 'base']);
    expect(CONTEXT_FIELD_IDS.indexOf('trend')).toBe(3);
  });
  it('старший ТФ по ALGORITHMS §11.2', () => {
    expect(CONTEXT_HTF).toEqual({ '15m': '1h', '1h': '4h', '4h': '1d', '1d': '1d' });
  });
});
