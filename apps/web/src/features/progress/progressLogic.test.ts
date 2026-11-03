// SYNTHETIC: статистика навыков и попытки собраны вручную для проверки чистой логики (не рыночные данные).
import { describe, expect, it } from 'vitest';
import type { Attempt, SkillStat } from '@/storage';
import {
  avgQuality,
  buildErrorLog,
  groupByModule,
  recommend,
  selectFewData,
  selectWeak,
  trainTarget,
  trendOf,
} from './progressLogic';

const stat = (skill: string, oks: boolean[]): SkillStat => ({
  skill,
  attempts: oks.length,
  correct: oks.filter(Boolean).length,
  recent: oks.map((ok, i) => ({ t: i, ok })),
  accuracy: oks.length ? oks.filter(Boolean).length / oks.length : null,
  updatedAt: 0,
});
const ok = (xs: boolean[]) => xs.map((v) => ({ ok: v }));
const rep = (n: number, ok: boolean) => Array.from({ length: n }, () => ok);

describe('слабые места', () => {
  const stats = [
    stat('bos', [...rep(8, true), ...rep(2, false)]),
    stat('choch', [...rep(3, true), ...rep(5, false)]),
    stat('fvg', [true, false, false]),
    stat('swing', [...rep(5, true), ...rep(5, false)]),
  ];
  it('только навыки с >= 5 попытками, по возрастанию точности', () => {
    expect(selectWeak(stats).map((s) => s.skill)).toEqual(['choch', 'swing', 'bos']);
    expect(selectWeak(stats, 2).map((s) => s.skill)).toEqual(['choch', 'swing']);
  });
  it('навыки с малым окном отдельно', () => {
    expect(selectFewData(stats).map((s) => s.skill)).toEqual(['fvg']);
  });
  it('группировка по модулям, порядок MS / PA / Challenge', () => {
    const g = groupByModule([...stats, stat('pa-doji', rep(6, true)), stat('challenge-wait', rep(5, false))]);
    expect(g.map((x) => x.module)).toEqual(['market-structure', 'price-action', 'challenge']);
    expect(g[0]!.skills.map((s) => s.skill)).toEqual(['choch', 'swing', 'bos', 'fvg']);
  });
});

describe('тренд и тренировка', () => {
  it('тренд по половинам окна', () => {
    expect(trendOf(ok([...rep(4, false), ...rep(4, true)]))).toBe('up');
    expect(trendOf(ok([...rep(4, true), ...rep(4, false)]))).toBe('down');
    expect(trendOf(ok(rep(6, true)))).toBe('flat');
    expect(trendOf(ok(rep(3, true)))).toBeNull();
  });
  it('ссылки с focus для разных модулей', () => {
    expect(trainTarget(stat('choch', rep(6, false))).href).toBe('/learn/market-structure/session?mode=mark&difficulty=easy&focus=choch');
    expect(trainTarget(stat('pa-pin-bar', rep(6, false))).href).toBe('/learn/price-action/session?type=find-pattern&difficulty=easy&focus=pa-pin-bar');
    expect(trainTarget(stat('pa-level', rep(6, false))).href).toContain('type=draw-level');
    expect(trainTarget(stat('challenge-wait', rep(6, false))).href).toBe('/learn/challenge/session?difficulty=easy');
  });
  it('при точности >= 0.8 на полном окне сложность растёт', () => {
    expect(trainTarget(stat('bos', rep(20, true))).href).toContain('difficulty=medium');
  });
  it('рекомендация — слабейший навык; без попыток null', () => {
    expect(recommend([])).toBeNull();
    expect(recommend([stat('bos', rep(6, true)), stat('choch', rep(6, false))])?.skill.skill).toBe('choch');
    expect(recommend([stat('fvg', [true, false])])?.skill.skill).toBe('fvg');
  });
});

const attempt = (id: string, t: number, codes: string[], quality?: number): Attempt =>
  ({
    id,
    module: 'market-structure',
    taskId: id,
    task: {},
    answer: {},
    grade: {
      verdict: 'incorrect',
      errors: codes.map((code) => ({ code, params: { side: 'high' } })),
      feedback: { mistakes: codes.map((code) => ({ templateKey: `feedback.${code}.mistake`, code, params: { side: 'high' } })) },
      ...(quality === undefined ? {} : { quality }),
    },
    algoVersion: 'x',
    skills: [],
    correct: false,
    rMultiple: null,
    localDay: '2026-11-03',
    durationMs: null,
    createdAt: t,
    updatedAt: t,
  }) as Attempt;

describe('журнал ошибок', () => {
  it('группы по коду: число случаев, новые примеры первыми', () => {
    const log = buildErrorLog([
      attempt('a', 1, ['SWING_MISSED']),
      attempt('b', 2, ['SWING_MISSED', 'SWING_EXTRA']),
      attempt('c', 3, ['SWING_MISSED']),
      attempt('d', 4, ['SWING_MISSED']),
    ]);
    expect(log.map((g) => [g.code, g.count])).toEqual([['SWING_MISSED', 4], ['SWING_EXTRA', 1]]);
    expect(log[0]!.examples.map((e) => e.attempt.id)).toEqual(['d', 'c', 'b']);
    expect(log[0]!.examples[0]!.templateKey).toBe('feedback.SWING_MISSED.mistake');
  });
  it('пустые попытки дают пустой журнал', () => {
    expect(buildErrorLog([])).toEqual([]);
  });
  it('средняя оценка качества Challenge', () => {
    const c = (q: number) => ({ ...attempt('x', 1, [], q), module: 'challenge' as const });
    expect(avgQuality([c(60), c(80)])).toBe(70);
    expect(avgQuality([attempt('m', 1, [])])).toBeNull();
  });
});
