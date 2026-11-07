import { describe, expect, it } from 'vitest';
import { ewBody, ewQuery, parseEwParams } from './params';

const get = (o: Record<string, string>) => (k: string) => o[k] ?? null;

describe('параметры Elliott', () => {
  it('значения по умолчанию', () => {
    expect(parseEwParams(get({}))).toEqual({ difficulty: 'easy', tf: '1h', symbol: null });
  });
  it('ТФ вне списка сложности заменяется: 15m на easy и 1d везде -> 1h', () => {
    expect(parseEwParams(get({ difficulty: 'easy', tf: '15m' })).tf).toBe('1h');
    expect(parseEwParams(get({ difficulty: 'hard', tf: '1d' })).tf).toBe('1h');
    expect(parseEwParams(get({ difficulty: 'medium', tf: '15m' })).tf).toBe('15m');
    expect(parseEwParams(get({ difficulty: 'easy', tf: '4h' })).tf).toBe('4h');
  });
  it('запрос и тело без focus и типа задания', () => {
    const p = parseEwParams(get({ difficulty: 'hard', tf: '4h', symbol: 'ETHUSDT', focus: 'ew-rules' }));
    expect(ewQuery(p)).toBe('difficulty=hard&tf=4h&symbol=ETHUSDT');
    expect(ewBody(p)).toEqual({ difficulty: 'hard', tf: '4h', symbol: 'ETHUSDT' });
  });
});
