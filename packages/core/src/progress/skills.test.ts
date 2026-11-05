import { describe, expect, it } from 'vitest';
import {
  MIN_SAMPLE,
  WINDOW_N,
  accuracyOf,
  applyOutcome,
  generatorForSkill,
  isOutcomeOk,
  pickFocus,
  rankWeakSkills,
  shouldSuggestHarder,
  skillWeight,
  type SkillStat,
} from './skills';

const stat = (skill: SkillStat['skill'], oks: boolean[]): SkillStat => ({
  skill,
  attempts: oks.length,
  correct: oks.filter(Boolean).length,
  recent: oks.map((ok, i) => ({ t: i, ok })),
  accuracy: oks.length ? oks.filter(Boolean).length / oks.length : null,
  updatedAt: 0,
});

describe('исход навыка', () => {
  it('ok = correct/total >= 0.8', () => {
    expect(isOutcomeOk({ skill: 'swing', correct: 8, total: 10 })).toBe(true);
    expect(isOutcomeOk({ skill: 'swing', correct: 7, total: 10 })).toBe(false);
    expect(isOutcomeOk({ skill: 'bos', correct: 1, total: 1 })).toBe(true);
    expect(isOutcomeOk({ skill: 'bos', correct: 0, total: 1 })).toBe(false);
    expect(isOutcomeOk({ skill: 'bos', correct: 0, total: 0 })).toBe(false);
  });
});

describe('applyOutcome / accuracyOf', () => {
  it('пустое окно -> accuracy null', () => {
    expect(accuracyOf([])).toBeNull();
  });
  it('создаёт статистику и считает точность по окну', () => {
    let s = applyOutcome(undefined, { skill: 'sweep', correct: 1, total: 1 }, 10);
    expect(s.attempts).toBe(1);
    expect(s.correct).toBe(1);
    expect(s.accuracy).toBe(1);
    s = applyOutcome(s, { skill: 'sweep', correct: 0, total: 3 }, 20);
    expect(s.accuracy).toBe(0.5);
    expect(s.updatedAt).toBe(20);
  });
  it('окно ограничено N = 20, накопительные счётчики сохраняются', () => {
    let s: SkillStat | undefined;
    for (let i = 0; i < 25; i++) s = applyOutcome(s, { skill: 'fvg', correct: i < 5 ? 0 : 1, total: 1 }, i);
    expect(s!.recent).toHaveLength(WINDOW_N);
    expect(s!.attempts).toBe(25);
    expect(s!.correct).toBe(20);
    expect(s!.accuracy).toBe(1); // старые провалы вытеснены из окна
    expect(s!.recent[0]!.t).toBe(5);
  });
  it('не мутирует входной объект', () => {
    const s0 = stat('swing', [true]);
    const copy = JSON.parse(JSON.stringify(s0));
    applyOutcome(s0, { skill: 'swing', correct: 0, total: 1 }, 5);
    expect(s0).toEqual(copy);
  });
  it('исход другого навыка отклоняется', () => {
    expect(() => applyOutcome(stat('swing', [true]), { skill: 'bos', correct: 1, total: 1 }, 1)).toThrow('SKILL_MISMATCH');
  });
});

describe('слабые места и подборка', () => {
  it('«мало данных» (<5) в конце; по возрастанию точности; при равенстве меньшее окно раньше', () => {
    const stats = [
      stat('swing', [true, true, true, true, true, true]), // 1.0
      stat('bos', [false, false, true, false, false]), // 0.2
      stat('choch', [true, false]), // мало данных
      stat('sweep', [true, true, false, false, true, false]), // 0.5, окно 6
      stat('fvg', [true, false, true, false, true]), // 0.6? 3/5
      stat('order-block', [true, false, true, false, false, false, true, false]), // 3/8 =0.375
    ];
    const ranked = rankWeakSkills(stats).map((r) => r.skill);
    expect(ranked).toEqual(['bos', 'order-block', 'sweep', 'fvg', 'swing', 'choch']);
    expect(MIN_SAMPLE).toBe(5);
  });
  it('равенство accuracy: меньшее окно раньше', () => {
    const a = stat('swing', [true, false, true, false, true, false]); // 0.5/6
    const b = stat('bos', [true, false, true, false, true, false, true, false]); // 0.5/8
    expect(rankWeakSkills([b, a]).map((r) => r.skill)).toEqual(['swing', 'bos']);
  });
  it('вес навыка: max(0.05, 1 - accuracy); мало данных -> 0.5', () => {
    expect(skillWeight(undefined)).toBe(0.5);
    expect(skillWeight(stat('swing', [true, false]))).toBe(0.5);
    expect(skillWeight(stat('swing', [true, true, true, true, true]))).toBe(0.05);
    expect(skillWeight(stat('swing', [false, false, false, false, false]))).toBe(1);
  });
  it('pickFocus: детерминирован по seed, без повторов, до 3, из переданных навыков', () => {
    const skills = ['swing', 'bos', 'choch', 'sweep', 'fvg'] as const;
    const stats = skills.map((s) => stat(s, [false, false, false, false, false]));
    const a = pickFocus(stats, [...skills], 11);
    expect(a).toEqual(pickFocus(stats, [...skills], 11));
    expect(new Set(a).size).toBe(a.length);
    expect(a).toHaveLength(3);
    expect(pickFocus(stats, ['swing', 'bos'], 3)).toHaveLength(2);
    expect(pickFocus([], [], 1)).toEqual([]);
  });
  it('pickFocus: сильный навык выбирается редко, слабый чаще', () => {
    const stats = [stat('swing', Array(10).fill(true)), stat('bos', Array(10).fill(false))];
    let first = 0;
    for (let seed = 0; seed < 200; seed++) if (pickFocus(stats, ['swing', 'bos'], seed, 1)[0] === 'bos') first++;
    expect(first).toBeGreaterThan(150);
  });
  it('предложение повысить сложность: accuracy >= 0.8 при полном окне', () => {
    expect(shouldSuggestHarder(stat('swing', Array(20).fill(true)))).toBe(true);
    expect(shouldSuggestHarder(stat('swing', Array(19).fill(true)))).toBe(false);
    expect(shouldSuggestHarder(stat('swing', [...Array(15).fill(true), ...Array(5).fill(false)]))).toBe(false);
  });
});

describe('навык -> генератор', () => {
  it('сопоставление по §16.3', () => {
    expect(generatorForSkill('swing')).toEqual({ module: 'market-structure', kind: 'ms' });
    expect(generatorForSkill('internal-external')).toEqual({ module: 'market-structure', kind: 'ms' });
    expect(generatorForSkill('pa-star')).toEqual({ module: 'price-action', taskType: 'find-pattern', targets: ['morning-star', 'evening-star'] });
    expect(generatorForSkill('pa-engulfing')).toEqual({ module: 'price-action', taskType: 'find-pattern', targets: ['engulfing'] });
    expect(generatorForSkill('pa-level')).toEqual({ module: 'price-action', taskType: 'draw-level' });
    expect(generatorForSkill('pa-context')).toEqual({ module: 'price-action', taskType: 'context' });
    expect(generatorForSkill('challenge-wait')).toEqual({ module: 'challenge', waitShare: 0.6 });
    expect(generatorForSkill('challenge-entry')).toEqual({ module: 'challenge' });
  });
});

describe('generatorForSkill: Fibonacci (FIBONACCI.md §10)', () => {
  it('fib-reaction и premium-discount -> reaction; fib-extension -> extension', () => {
    expect(generatorForSkill('fib-reaction')).toEqual({ module: 'fibonacci', taskType: 'reaction' });
    expect(generatorForSkill('premium-discount')).toEqual({ module: 'fibonacci', taskType: 'reaction' });
    expect(generatorForSkill('fib-extension')).toEqual({ module: 'fibonacci', taskType: 'extension' });
  });
  it('fib-anchor -> grid или extension (50/50 по seed, детерминированно)', () => {
    const kinds = Array.from({ length: 200 }, (_, i) => (generatorForSkill('fib-anchor', i + 1) as { taskType: string }).taskType);
    const grid = kinds.filter((k) => k === 'grid').length;
    expect(new Set(kinds)).toEqual(new Set(['grid', 'extension']));
    expect(grid).toBeGreaterThan(70);
    expect(grid).toBeLessThan(130);
    expect(generatorForSkill('fib-anchor', 5)).toEqual(generatorForSkill('fib-anchor', 5));
  });
});
