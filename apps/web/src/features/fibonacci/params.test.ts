import { describe, expect, it } from 'vitest';
import { fibBody, fibQuery, parseFibParams } from './params';

const from = (q: string) => {
  const sp = new URLSearchParams(q);
  return parseFibParams((k) => sp.get(k));
};

describe('параметры Fibonacci', () => {
  it('значения по умолчанию при мусоре в URL', () => {
    expect(from('type=zzz&difficulty=hardest&tf=5m')).toMatchObject({ type: 'grid', difficulty: 'easy', tf: '1h', symbol: null });
  });
  it('туда и обратно', () => {
    const p = from('type=extension&difficulty=hard&tf=4h&symbol=ETHUSDT');
    expect(p).toMatchObject({ type: 'extension', difficulty: 'hard', tf: '4h', symbol: 'ETHUSDT' });
    expect(from(fibQuery(p))).toEqual(p);
  });
  it('тело next: taskType и необязательная пара', () => {
    expect(fibBody(from('type=reaction&tf=15m'))).toEqual({ difficulty: 'easy', tf: '15m', taskType: 'reaction' });
    expect(fibBody(from('type=grid&symbol=SOLUSDT'))).toMatchObject({ taskType: 'grid', symbol: 'SOLUSDT' });
  });
});
