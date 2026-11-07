import { describe, expect, it } from 'vitest';
import type { SkillOutcome } from '../types';
import { STAGES } from './stages';
import {
  COMBO_REQUIREMENTS,
  computeStageProgress,
  comboUnlock,
  recommendedStep,
  stageNextTask,
  type StageAttempt,
} from './stages';
import { applyOutcome, type SkillStat } from './skills';

const att = (module: string, t: number, outcomes: [string, number, number][]): StageAttempt => ({
  module,
  createdAt: t,
  grade: { skillOutcomes: outcomes.map(([skill, correct, total]) => ({ skill, correct, total }) as SkillOutcome) },
});
/** n попыток модуля с исходом навыка; ok = доля верных попыток по порядку. */
const run = (module: string, skill: string, n: number, okAt: (i: number) => boolean, t0 = 0): StageAttempt[] =>
  Array.from({ length: n }, (_, i) => att(module, t0 + i, [[skill, okAt(i) ? 1 : 0, 1]]));

describe('computeStageProgress (§10.3)', () => {
  it('нет попыток - not-started; 9 попыток при 100% - in-progress; 10 при 70% - passed; необратимо', () => {
    expect(computeStageProgress([])[3]).toMatchObject({ status: 'not-started', attempts: 0, accuracy: null, progress: 0 });
    const nine = computeStageProgress(run('limit-entry', 'limit-placement', 9, () => true))[3];
    expect(nine).toMatchObject({ status: 'in-progress', attempts: 9, passedAt: null });
    expect(nine.progress).toBeCloseTo(0.5 * 0.9 + 0.5, 9);
    const ten = computeStageProgress(run('limit-entry', 'limit-placement', 10, (i) => i < 7))[3];
    expect(ten).toMatchObject({ status: 'passed', attempts: 10, accuracy: 0.7, passedAt: 9, progress: 1 });
    // последующее падение точности не отзывает «пройдено»
    const later = computeStageProgress([...run('limit-entry', 'limit-placement', 10, (i) => i < 7), ...run('limit-entry', 'limit-placement', 20, () => false, 100)])[3];
    expect(later.status).toBe('passed');
    expect(later.passedAt).toBe(9);
    expect(later.accuracy).toBeLessThan(0.7);
  });
  it('точность 60% при 10 попытках - не пройдено', () => {
    const r = computeStageProgress(run('limit-entry', 'limit-placement', 10, (i) => i < 6))[3];
    expect(r.status).toBe('in-progress');
    expect(r.progress).toBeCloseTo(0.5 + 0.5 * (0.6 / 0.7), 9);
  });
  it('пол навыка: ключевой навык с >= 5 исходами и точностью < 50% блокирует «пройдено»', () => {
    const base = [
      ...run('stop-take', 'risk-reward', 10, (i) => i < 4),
      ...run('stop-take', 'stop-placement', 10, () => true, 100),
      ...run('stop-take', 'take-profit', 10, () => true, 200),
    ];
    // каждая попытка - один навык, поэтому считаем попытки (30), пул = 30 исходов, 24/30 = 0.8, но risk-reward 4/10 = 0.4 < 0.5
    const r = computeStageProgress(base)[4];
    expect(r.attempts).toBe(30);
    expect(r.accuracy).toBeCloseTo(24 / 30, 9);
    expect(r.status).toBe('in-progress');
    // меньше 5 исходов у слабого навыка - пол не действует
    const few = computeStageProgress([...run('stop-take', 'stop-placement', 10, () => true), ...run('stop-take', 'risk-reward', 4, () => false)])[4];
    expect(few.status).toBe('passed');
  });
  it('окно последних 20 исходов на навык; исход ok при correct/total >= 0.8', () => {
    const a = [att('limit-entry', 0, [['limit-placement', 4, 5]]), ...run('limit-entry', 'limit-placement', 9, () => true, 1)];
    expect(computeStageProgress(a)[3]).toMatchObject({ status: 'passed', accuracy: 1 });
    const b = [att('limit-entry', 0, [['limit-placement', 3, 5]]), ...run('limit-entry', 'limit-placement', 9, () => true, 1)];
    expect(computeStageProgress(b)[3].accuracy).toBeCloseTo(0.9, 9);
    const w = computeStageProgress(run('limit-entry', 'limit-placement', 30, (i) => i >= 10))[3];
    expect(w.sample).toBe(20);
    expect(w.accuracy).toBe(1);
  });
  it('старые попытки MS/PA засчитываются ступеням 1 и 2 (по ключевым навыкам); модуль без ключевого навыка не засчитывается', () => {
    const old = [
      ...run('market-structure', 'swing', 10, () => true),
      ...run('price-action', 'pa-level', 10, () => true, 100),
      att('market-structure', 200, [['bos', 1, 1]]),
      att('price-action', 201, [['pa-doji', 1, 1]]),
      att('challenge', 202, [['challenge-entry', 1, 1]]),
    ];
    const p = computeStageProgress(old);
    expect(p[1].status).toBe('passed');
    expect(p[2].status).toBe('passed');
    expect(p[5].attempts).toBe(1);
    expect(p[6].attempts).toBe(1);
    expect(p[3].attempts).toBe(0);
    // навык ступени 4 в попытке не того модуля не засчитывается
    expect(computeStageProgress([att('levels', 0, [['stop-placement', 1, 1]])])[4].attempts).toBe(0);
  });
  it('информационные навыки не входят в критерий', () => {
    const r = computeStageProgress(run('limit-entry', 'limit-fill', 20, () => true))[3];
    expect(r.attempts).toBe(0);
    expect(STAGES[3].info).toContain('limit-fill');
    expect(STAGES[2].info).toContain('level-reaction');
    expect(STAGES[7].info).toContain('fib-reaction');
  });
  it('мало данных: меньше 10 исходов в пуле', () => {
    expect(computeStageProgress(run('limit-entry', 'limit-placement', 3, () => true))[3].fewData).toBe(true);
  });
});

describe('открытие комбо и рекомендация (§10.3, §20)', () => {
  const passedAll = (ids: number[]): StageAttempt[] => {
    const map: Record<number, [string, string]> = { 1: ['stage-swings', 'swing'], 2: ['levels', 'pa-level'], 3: ['limit-entry', 'limit-placement'], 4: ['stop-take', 'stop-placement'], 5: ['market-structure', 'bos'] };
    return ids.flatMap((id, k) => run(map[id]![0], map[id]![1], 10, () => true, k * 100));
  };
  it('требования: комбо уровня 2-3-4, SMC 3-4-5, Challenge 1-5', () => {
    expect(COMBO_REQUIREMENTS['combo-level-trade']).toEqual([2, 3, 4]);
    expect(COMBO_REQUIREMENTS['combo-smc-entry']).toEqual([3, 4, 5]);
    expect(COMBO_REQUIREMENTS.challenge).toEqual([1, 2, 3, 4, 5]);
  });
  it('открывается, когда пройдены все составные ступени; частично - закрыто с перечнем пройденных', () => {
    const none = comboUnlock('combo-level-trade', computeStageProgress([]));
    expect(none).toMatchObject({ open: false, passed: [], legacy: false });
    const two = comboUnlock('combo-level-trade', computeStageProgress(passedAll([2, 3])));
    expect(two).toMatchObject({ open: false, passed: [2, 3] });
    expect(comboUnlock('combo-level-trade', computeStageProgress(passedAll([2, 3, 4]))).open).toBe(true);
    expect(comboUnlock('combo-smc-entry', computeStageProgress(passedAll([2, 3, 4]))).open).toBe(false);
    expect(comboUnlock('combo-smc-entry', computeStageProgress(passedAll([3, 4, 5]))).open).toBe(true);
    expect(comboUnlock('challenge', computeStageProgress(passedAll([1, 2, 3, 4]))).open).toBe(false);
    expect(comboUnlock('challenge', computeStageProgress(passedAll([1, 2, 3, 4, 5]))).open).toBe(true);
  });
  it('Challenge сохраняется у тех, кто торговал до релиза курса', () => {
    const attempts = [att('challenge', 50, [['challenge-entry', 1, 1]])];
    const p = computeStageProgress(attempts);
    expect(comboUnlock('challenge', p, attempts)).toMatchObject({ open: true, legacy: true });
    expect(comboUnlock('challenge', p, attempts, 100)).toMatchObject({ open: true, legacy: true });
    expect(comboUnlock('challenge', p, attempts, 10)).toMatchObject({ open: false, legacy: false });
  });
  it('рекомендация: первая непройденная ступень; все пройдены - первое открытое комбо с < 10 попыток', () => {
    expect(recommendedStep(computeStageProgress([]))).toEqual({ kind: 'stage', id: 1 });
    const some = computeStageProgress(passedAll([1, 2]));
    expect(recommendedStep(some)).toEqual({ kind: 'stage', id: 3 });
    // все 1-8 пройдены
    const all: StageAttempt[] = [
      ...passedAll([1, 2, 3, 4, 5]),
      ...run('price-action', 'pa-engulfing', 10, () => true, 900),
      ...run('fibonacci', 'fib-anchor', 10, () => true, 1000),
      ...run('elliott', 'ew-impulse', 10, () => true, 1100),
    ];
    const p = computeStageProgress(all);
    expect(recommendedStep(p, all)).toEqual({ kind: 'combo', module: 'combo-level-trade' });
    const done = [...all, ...run('combo-level-trade', 'level-zone', 10, () => true, 2000)];
    expect(recommendedStep(computeStageProgress(done), done)).toEqual({ kind: 'combo', module: 'combo-smc-entry' });
    const fin = [...done, ...run('combo-smc-entry', 'fvg', 10, () => true, 3000), ...run('challenge', 'challenge-entry', 10, () => true, 4000)];
    expect(recommendedStep(computeStageProgress(fin), fin)).toBeNull();
  });
  it('внутри ступени: генератор самого слабого ключевого навыка; без статистики - первый без данных', () => {
    const stat = (skill: string, oks: boolean[]): SkillStat => oks.reduce<SkillStat | undefined>((s, ok, i) => applyOutcome(s, { skill: skill as never, correct: ok ? 1 : 0, total: 1 }, i), undefined)!;
    const stats = [stat('stop-placement', [true, true, true, true, true]), stat('take-profit', [false, false, true, false, false]), stat('risk-reward', [true, true, true, true, false])];
    const n = stageNextTask(4, stats);
    expect(n.skill).toBe('take-profit');
    expect(n.generator).toEqual({ module: 'stop-take' });
    expect(n.harder).toBe(false);
    expect(stageNextTask(2, []).skill).toBe('pa-level');
    expect(stageNextTask(2, []).generator).toEqual({ module: 'levels', taskType: 'lv-strongest' });
    expect(stageNextTask(2, [stat('pa-level', [true, true, true, true, true])]).skill).toBe('pa-level');
    const full = stat('pa-level', Array.from({ length: 20 }, () => true));
    expect(stageNextTask(2, [full]).harder).toBe(true);
  });
});
