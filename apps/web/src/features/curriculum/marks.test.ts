import { describe, expect, it } from 'vitest';
import { defaultSlTp, fullScoreBand, planIssue, sideOfZone, structurePoint } from './marks';

// SYNTHETIC: чистая арифметика сторон и полос на искусственных числах (свечи не участвуют)
describe('марки и проверки сторон', () => {
  it('LONG: стоп ниже, тейк выше входа; нарушения', () => {
    expect(planIssue('LONG', 100, 95, 95, 95, 90, 110)).toBeNull();
    expect(planIssue('LONG', 100, 101, 101, 101, 90, 110)).toBe('limit-side');
    expect(planIssue('LONG', 100, 95, 95, 95, 96, 110)).toBe('sl-side');
    expect(planIssue('LONG', 100, 95, 95, 95, 90, 94)).toBe('tp-side');
  });
  it('SHORT зеркально', () => {
    expect(planIssue('SHORT', 100, 105, 105, 105, 110, 90)).toBeNull();
    expect(planIssue('SHORT', 100, 99, 99, 99, 110, 90)).toBe('limit-side');
    expect(planIssue('SHORT', 100, 105, 105, 105, 104, 90)).toBe('sl-side');
  });
  it('SL/TP по умолчанию: 1 и 2 ATR', () => {
    expect(defaultSlTp('LONG', 100, 2)).toEqual({ sl: 98, tp: 104 });
    expect(defaultSlTp('SHORT', 100, 2)).toEqual({ sl: 102, tp: 96 });
  });
  it('сторона по зоне и структурная точка', () => {
    expect(sideOfZone({ top: 90, bottom: 80 }, 100)).toBe('LONG');
    expect(sideOfZone({ top: 120, bottom: 110 }, 100)).toBe('SHORT');
    expect(structurePoint({ top: 90, bottom: 80 }, 'LONG', { high: 95, low: 78 })).toBe(78);
    expect(structurePoint({ top: 90, bottom: 80 }, 'LONG', { high: 95, low: 85 })).toBe(80);
  });
  it('полоса полного балла: от 0,3 ATR перед краем до 0,1 ATR внутрь', () => {
    expect(fullScoreBand({ top: 90, bottom: 80 }, 'LONG', 2)).toEqual({ from: 89.8, to: 90.6 });
    expect(fullScoreBand({ top: 120, bottom: 110 }, 'SHORT', 2)).toEqual({ from: 109.4, to: 110.2 });
  });
});
