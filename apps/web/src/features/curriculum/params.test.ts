import { describe, expect, it } from 'vitest';
import { allowedTfs, curBody, curQuery, parseCurParams } from './params';

const get = (q: string) => (k: string) => new URLSearchParams(q).get(k);

describe('параметры курса', () => {
  it('stage-swings: тип и tf из URL, недопустимый tf заменяется первым допустимым', () => {
    expect(parseCurParams('stage-swings', get('type=sw-trend&difficulty=easy&tf=15m'))).toMatchObject({ type: 'sw-trend', tf: '1h' });
    expect(parseCurParams('stage-swings', get('type=sw-mark&difficulty=medium&tf=15m'))).toMatchObject({ type: 'sw-mark', tf: '15m' });
  });
  it('limit-entry: tf необязателен, 1d недоступен, тела без taskType', () => {
    const p = parseCurParams('limit-entry', get('difficulty=medium&tf=1d'));
    expect(p.tf).toBeNull();
    expect(curBody(p)).toEqual({ difficulty: 'medium' });
    expect(allowedTfs('limit-entry', null, 'easy')).toEqual(['1h', '4h']);
    expect(curBody(parseCurParams('limit-entry', get('tf=4h')))).toEqual({ difficulty: 'easy', tf: '4h' });
  });
  it('levels: reaction без 1d; тело содержит taskType', () => {
    const p = parseCurParams('levels', get('type=lv-reaction&difficulty=hard&tf=1d'));
    expect(p.tf).toBe('15m');
    expect(curBody(p)).toEqual({ difficulty: 'hard', taskType: 'lv-reaction', tf: '15m' });
  });
  it('query round-trip', () => {
    const p = parseCurParams('levels', get('type=lv-zone&difficulty=medium&tf=4h&symbol=ETHUSDT'));
    expect(curQuery(p)).toBe('type=lv-zone&difficulty=medium&tf=4h&symbol=ETHUSDT');
  });
  it('неизвестный тип -> первый тип модуля', () => {
    expect(parseCurParams('levels', get('type=draw-level')).type).toBe('lv-strongest');
  });
});
