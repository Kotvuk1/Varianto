import { describe, expect, it } from 'vitest';
import { isTimeParam, type Feedback } from '@tl/core';
import { plainVerdict, revealFeedback, shiftTimeParams, storableGrade } from './reveal';
import { formatParam } from '../feedback/format';

const SHIFT = 86_400_000 * 1200;
const block = (params: Record<string, string | number>) => ({ code: 'X', templateKey: 'k', params }) as never;

describe('isTimeParam: ключи времени разбора Fibonacci', () => {
  it('time и *Time — время, остальное нет', () => {
    for (const k of ['time', 'userTime', 'refStartTime', 'reactionTime', 'cTime', 'maxTime', 'endTime', 'brokenTime']) expect(isTimeParam(k)).toBe(true);
    for (const k of ['timeout', 'cPrice', 'depth', 'tol', 'offset']) expect(isTimeParam(k)).toBe(false);
  });
  it('форматтер UI форматирует любой *Time как дату, а не как цену', () => {
    const fmtPrice = (p: number) => `P${p}`;
    const t = Date.UTC(2026, 8, 21, 8);
    expect(String(formatParam('refStartTime', t, fmtPrice))).not.toMatch(/^P/);
    expect(String(formatParam('refStartTime', t, fmtPrice))).toMatch(/2026|21/);
    expect(formatParam('cPrice', 87385.1, fmtPrice)).toBe('P87385.1');
  });
});

describe('реальные времена в разборе', () => {
  it('сдвигает только времена', () => {
    expect(shiftTimeParams({ userTime: 10, cPrice: 5, depth: 0.5, name: 'x' }, SHIFT)).toEqual({ userTime: 10 + SHIFT, cPrice: 5, depth: 0.5, name: 'x' });
    const p = { time: 1 };
    expect(shiftTimeParams(p, 0)).toBe(p);
  });
  it('разбор переводится в реальное время по всем блокам', () => {
    const f = { verdict: block({}), understood: [block({ endTime: 5 })], mistakes: [block({ cTime: 7, cPrice: 9 })], why: [], howTo: [], principle: block({}) } as unknown as Feedback;
    const r = revealFeedback(f, SHIFT);
    expect(r.understood[0]!.params).toEqual({ endTime: 5 + SHIFT });
    expect(r.mistakes[0]!.params).toEqual({ cTime: 7 + SHIFT, cPrice: 9 });
    expect(revealFeedback(f, 0)).toBe(f);
  });
  it('в попытку не попадают свечи проигрывания', () => {
    const g = { verdict: 'correct' as const, score: 1, feedback: { verdict: block({}), understood: [], mistakes: [], why: [], howTo: [], principle: block({}) } as unknown as Feedback, replay: { candles: [1] }, task: { reveal: { shiftMs: 0 } } };
    expect('replay' in storableGrade(g)).toBe(false);
  });
});

describe('итог без счёта меток', () => {
  it('заменяет шаблон «совпало N из M» на plain с процентами', () => {
    const f = { verdict: { templateKey: 'feedback.verdict.partial', code: null, params: { matched: 1, total: 3, score: 50 } }, understood: [], mistakes: [], why: [], howTo: [], principle: block({}) } as unknown as Feedback;
    const r = plainVerdict(f, 'partial', 0.5);
    expect(r.verdict.templateKey).toBe('feedback.verdict.plain.partial');
    expect(r.verdict.params).toEqual({ score: 50 });
    expect(plainVerdict(r, 'partial', 0.5)).toBe(r);
  });
});
