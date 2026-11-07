import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { keepSingleLevel, msMarkAnswer, paContextAnswer, paFindAnswer, lvStrongestAnswer, statesFromGrade, toPatternMarks } from './adapters';

// SYNTHETIC: минимальные метки для проверки преобразований; рыночные данные не нужны
const H = 3_600_000;
const mk = (id: string, kind: Mark['kind'], time: number, price = 100): Mark => ({
  id, kind, anchors: [{ time, price }], scope: null, direction: null, author: 'user',
});

describe('адаптеры ответа', () => {
  it('ms-mark: передаёт только метки пользователя', () => {
    const algo: Mark = { ...mk('a', 'bos', 1), author: 'algo' };
    const a = msMarkAnswer([mk('u1', 'swing-high', 1), algo]);
    expect(a.kind).toBe('ms-mark');
    expect(a.marks.map((m) => m.id)).toEqual(['u1']);
  });

  it('ms-mark: scope меток передаётся в ответ', () => {
    const m: Mark = { ...mk('u2', 'bos', 1), scope: 'internal' };
    const a = msMarkAnswer([m, { ...mk('u3', 'choch', 2), scope: 'external' }]);
    expect(a.marks.map((x) => x.scope)).toEqual(['internal', 'external']);
  });

  it('pa-level: цена последнего уровня; без уровня null', () => {
    expect(lvStrongestAnswer([])).toBeNull();
    expect(lvStrongestAnswer([mk('l1', 'level', 1, 10), mk('l2', 'level', 2, 20)])).toEqual({ kind: 'lv-strongest', price: 20 });
  });

  it('keepSingleLevel оставляет только последний уровень', () => {
    const out = keepSingleLevel([mk('l1', 'level', 1), mk('x', 'swing-low', 2), mk('l2', 'level', 3)]);
    expect(out.map((m) => m.id)).toEqual(['x', 'l2']);
  });

  it('pa-context: копирует факторы', () => {
    expect(paContextAnswer({ sweep: true, orderBlock: false, keyLevel: true, htfTrend: 'up' }, true)).toEqual({
      kind: 'pa-context',
      factors: { sweep: true, orderBlock: false, keyLevel: true, htfTrend: 'up' },
      significant: true,
    });
  });

  it('toPatternMarks: касание превращается в pattern с типом задания', () => {
    const out = toPatternMarks([mk('t1', 'swing-high', 10 * H)], 'pin-bar', '1h');
    expect(out[0]).toMatchObject({ id: 't1', kind: 'pattern', meta: { patternType: 'pin-bar' }, author: 'user' });
  });

  it('toPatternMarks: соседнее касание дополняет многосвечную модель, не создаёт лишнюю', () => {
    const first = toPatternMarks([mk('t1', 'swing-high', 10 * H)], 'engulfing', '1h');
    const out = toPatternMarks([...first, mk('t2', 'swing-high', 11 * H)], 'engulfing', '1h');
    expect(out).toHaveLength(1);
    expect(out[0]!.anchors.map((a) => a.time)).toEqual([10 * H, 11 * H]);
  });

  it('toPatternMarks: однослойная модель (doji) — соседи отдельные; повтор той же свечи игнорируется', () => {
    const a = toPatternMarks([mk('t1', 'swing-high', 10 * H), mk('t2', 'swing-high', 11 * H), mk('t3', 'swing-high', 11 * H)], 'doji', '1h');
    expect(a.map((m) => m.id)).toEqual(['t1', 't2']);
  });

  it('paFindAnswer: направление — из названия или выбора пользователя', () => {
    const marks = toPatternMarks([mk('t1', 'swing-high', 10 * H)], 'engulfing', '1h');
    expect(paFindAnswer(marks, 'engulfing', 'bear').marks[0]!.direction).toBe('bear');
    expect(paFindAnswer(marks, 'morning-star', 'bear').marks[0]!.direction).toBe('bull');
    expect(paFindAnswer(marks, 'doji', 'bear').marks[0]!.direction).toBeNull();
  });

  it('statesFromGrade: совпавшие, пропущенные, лишние', () => {
    const states = statesFromGrade({
      detail: {
        kind: 'ms-mark',
        marks: {
          matched: [{ userMarkId: 'u1', algoMarkId: 'a1', timeOffsetCandles: 0, priceOffsetPct: 0 }],
          missed: [mk('a2', 'bos', 1)],
          extra: [mk('u2', 'bos', 2)],
          ignored: [],
          toleranceCandles: 2,
        },
      },
    });
    expect(states).toEqual({ u1: 'match', a1: 'match', a2: 'missed', u2: 'extra' });
  });
});
