import { describe, expect, it } from 'vitest';
import { readKlines } from '../testing/klines';
import { analyzeStructure } from '../smc/analyze';
import { buildAlgoMarkSet } from '../smc/marks';
import { gaps } from '../smc/series';
import {
  MS_DEPTH,
  MS_HARD_EXTRAS,
  MS_FOCUS_SMC,
  msWindowProfile,
  MS_MIN_WARMUP,
  MS_WINDOW_MIN,
  msQuestionWindow,
  msResolveFocus,
  buildMsQuestion,
  generateMsQuestion,
  gradeMsQuestion,
  meetsMsCriteria,
  msConceptsFor,
  msParamsFor,
  msToolsFor,
  msWindowSize,
  rebuildMsQuestion,
  selectMsMarkTask,
  selectMsQuestionTask,
  MS_QUESTION_TEMPLATES,
} from './market-structure';
import { TIMEFRAME_MS, type Difficulty } from '../types';

// Непрерывный реальный ряд: BTCUSDT 1h, 2026-08 + 2026-09 (1464 свечи)
const archive = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv'), ...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv')];

describe('параметры по ступеням и сложностям (CURRICULUM_STAGES.md §2.2, §9.1)', () => {
  it('ступень 5: N, окна и понятия', () => {
    expect(msParamsFor('easy')).toMatchObject({ nExt: 5, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
    expect(msParamsFor('medium')).toMatchObject({ nExt: 5, nInt: null });
    expect(msParamsFor('hard')).toMatchObject({ nExt: 5, nInt: 2 });
    expect(msWindowProfile('easy')).toEqual({ windowMin: 120, windowMax: 150, requiredMin: 2, requiredMax: 8 });
    expect(msWindowProfile('medium')).toEqual({ windowMin: 40, windowMax: 80, requiredMin: 3, requiredMax: 10 });
    expect(msWindowProfile('hard')).toEqual({ windowMin: 40, windowMax: 80, requiredMin: 4, requiredMax: 12 });
    expect(msQuestionWindow('easy')).toBe(150);
    expect(msQuestionWindow('hard')).toBe(150);
    expect(msConceptsFor('easy')).toEqual(['bos', 'choch']);
    expect(msConceptsFor('medium', ['sweep'])).toEqual(['bos', 'choch', 'sweep']);
    expect(msConceptsFor('hard', ['fvg'])).toEqual(['bos', 'choch', 'internal-external', 'fvg']);
    expect(msConceptsFor('hard')).toEqual(expect.arrayContaining(['order-block', 'sweep', 'fvg', 'internal-external']));
  });

  it('ступень 1: swing / swing + метки; N = 7, 7, 5; окна 60, 60, 70', () => {
    expect(msParamsFor('easy', 'swings')).toMatchObject({ nExt: 7, nInt: null });
    expect(msParamsFor('medium', 'swings')).toMatchObject({ nExt: 7, nInt: null });
    expect(msParamsFor('hard', 'swings')).toMatchObject({ nExt: 5, nInt: null });
    expect(msWindowSize('easy', 'swings')).toBe(60);
    expect(msWindowSize('medium', 'swings')).toBe(60);
    expect(msWindowSize('hard', 'swings')).toBe(70);
    expect(msConceptsFor('easy', undefined, 'swings')).toEqual(['swing']);
    expect(msConceptsFor('hard', undefined, 'swings')).toEqual(['swing', 'structure-labels']);
  });

  it('focus ступени 5: medium - одно понятие, hard - все выбранные; easy и ступень 1 - []', () => {
    expect(msResolveFocus('easy', ['sweep'], 1)).toEqual([]);
    expect(msResolveFocus('medium', ['fvg', 'sweep'], 1)).toHaveLength(1);
    expect(msResolveFocus('hard', ['fvg', 'bos'], 1)).toEqual(['fvg']);
    expect(msResolveFocus('hard', ['fvg', 'order-block'], 1)).toEqual(['order-block', 'fvg']);
    expect(msResolveFocus('hard', ['sweep'], 1, 'swings')).toEqual([]);
    const picks = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => msResolveFocus('hard', undefined, seed).join()));
    expect(picks.size).toBeGreaterThan(1);
    for (const p of picks) expect(MS_FOCUS_SMC).toContain(p as never);
    expect(msResolveFocus('hard', undefined, 3)).toEqual(msResolveFocus('hard', undefined, 3));
    expect(MS_HARD_EXTRAS).toContain('internal-external');
  });

  it('инструменты соответствуют понятиям', () => {
    expect(msToolsFor(['swing', 'bos'])).toEqual(['swing-high', 'swing-low', 'bos']);
    expect(msToolsFor(msConceptsFor('hard'))).toContain('order-block');
    expect(msToolsFor(msConceptsFor('easy', undefined, 'swings'))).toEqual(['swing-high', 'swing-low']);
    expect(msToolsFor(msConceptsFor('easy'))).toEqual(['bos', 'choch']);
  });
});

describe('selectMsMarkTask: ступень 5 (окно и число меток по профилю)', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
    for (const seed of [7, 8, 9]) {
      it(`${difficulty}/seed ${seed}: сетка 15m, закрытый непрерывный ряд, прогрев >= 300, метки и окно по профилю`, () => {
        const prof = msWindowProfile(difficulty);
        const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty, seed })!;
        expect(sel).not.toBeNull();
        expect(sel.stage).toBe('smc');
        expect(sel.T % TIMEFRAME_MS['15m']).toBe(0);
        expect(sel.visible.length).toBeLessThanOrEqual(MS_DEPTH['1h']);
        expect(sel.visible.every((c) => c.closed && c.closeTime < sel.T)).toBe(true);
        expect(gaps(sel.visible, '1h')).toEqual([]);
        expect(sel.windowSize).toBeGreaterThanOrEqual(prof.windowMin);
        expect(sel.windowSize).toBeLessThanOrEqual(prof.windowMax);
        expect(sel.window).toEqual({ fromIndex: sel.visible.length - sel.windowSize, toIndex: sel.visible.length - 1 });
        expect(sel.window.fromIndex).toBeGreaterThanOrEqual(MS_MIN_WARMUP);
        expect(sel.scoped).toBe(sel.concepts.includes('internal-external'));
        expect(archive[sel.visibleFrom]).toBe(sel.visible[0]);
        const r = analyzeStructure(sel.visible, sel.params);
        const required = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
        expect(required.length).toBe(sel.requiredCount);
        expect(required.length).toBeGreaterThanOrEqual(prof.requiredMin);
        expect(required.length).toBeLessThanOrEqual(prof.requiredMax);
        expect(meetsMsCriteria(r, sel.visible, sel.window, sel.criteria, sel.concepts, prof, 'smc')).toBe(true);
        expect(sel.concepts).toEqual(msConceptsFor(difficulty, sel.focus));
      });
    }
  }

  it('easy: только BOS/CHoCH внешнего слоя (swing и HH/LL как метки не оцениваются)', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'easy', seed: 3 })!;
    expect(sel.concepts).toEqual(['bos', 'choch']);
    expect(sel.tools).toEqual(['bos', 'choch']);
    expect(sel.focus).toEqual([]);
    const r = analyzeStructure(sel.visible, sel.params);
    const marks = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
    expect(marks.every((m) => (m.kind === 'bos' || m.kind === 'choch') && m.scope === 'external')).toBe(true);
  });

  it('medium: BOS/CHoCH + одно понятие focus, метка focus есть в эталоне; без внутреннего слоя', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 3 })!;
    expect(sel.concepts.slice(0, 2)).toEqual(['bos', 'choch']);
    expect(sel.focus).toHaveLength(1);
    expect(sel.scoped).toBe(false);
    const r = analyzeStructure(sel.visible, sel.params);
    const marks = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
    expect(marks.every((m) => m.scope === 'external' || m.scope === null)).toBe(true);
    expect(marks.some((m) => m.kind === 'bos' || m.kind === 'choch')).toBe(true);
    expect(marks.some((m) => m.kind === sel.focus[0])).toBe(true);
  });

  it('hard: внутренний слой и каждое понятие focus представлены в эталоне окна', () => {
    for (const focus of [['sweep'], ['order-block'], ['fvg']] as const) {
      const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'hard', seed: 5, focus: [...focus] })!;
      expect(sel).not.toBeNull();
      expect(sel.focus).toEqual(focus);
      expect(sel.scoped).toBe(true);
      const r = analyzeStructure(sel.visible, sel.params);
      const marks = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
      expect(marks.some((m) => m.kind === focus[0])).toBe(true);
      expect(marks.some((m) => m.scope === 'internal' && (m.kind === 'bos' || m.kind === 'choch'))).toBe(true);
    }
    const auto = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'hard', seed: 5 })!;
    expect(auto.focus).toHaveLength(1);
  });
});

describe('selectMsMarkTask: ступень 1 «Свинги» (sw-mark)', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
    it(`${difficulty}: 4-12 меток в окне <= ${msWindowSize(difficulty, 'swings')}; medium/hard: есть {HH, LH} и {HL, LL}`, () => {
      const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty, seed: 4, stage: 'swings' })!;
      expect(sel).not.toBeNull();
      expect(sel.stage).toBe('swings');
      expect(sel.windowSize).toBeLessThanOrEqual(msWindowSize(difficulty, 'swings'));
      expect(sel.windowSize).toBeGreaterThanOrEqual(MS_WINDOW_MIN);
      expect(sel.concepts).toEqual(msConceptsFor(difficulty, undefined, 'swings'));
      expect(sel.scoped).toBe(false);
      const r = analyzeStructure(sel.visible, sel.params);
      const required = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
      expect(required.length).toBe(sel.requiredCount);
      expect(required.length).toBeGreaterThanOrEqual(4);
      expect(required.length).toBeLessThanOrEqual(12);
      if (difficulty !== 'easy' && sel.criteria !== 'easy') {
        expect(required.some((m) => m.kind === 'hh' || m.kind === 'lh')).toBe(true);
        expect(required.some((m) => m.kind === 'hl' || m.kind === 'll')).toBe(true);
      }
    });
  }
});

describe('selectMsMarkTask: общее', () => {
  it('детерминирован по seed; разные seed дают разные T', () => {
    const a = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    const b = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    expect(a).toEqual(b);
    const Ts = new Set([1, 2, 3, 4, 5].map((seed) => selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed })!.T));
    expect(Ts.size).toBeGreaterThan(1);
  });

  it('meetsMsCriteria: меньше минимума или больше максимума меток - отказ', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'hard', seed: 11 })!;
    const r = analyzeStructure(sel.visible, sel.params);
    const n = sel.visible.length;
    const prof = msWindowProfile('hard');
    expect(meetsMsCriteria(r, sel.visible, { fromIndex: n - 3, toIndex: n - 1 }, 'easy', ['bos', 'choch'], prof)).toBe(false);
    expect(meetsMsCriteria(r, sel.visible, { fromIndex: n - 300, toIndex: n - 1 }, 'easy', ['bos', 'choch'], prof)).toBe(false);
  });

  it('исключения: isExcluded и maxT учитываются', () => {
    const first = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'easy', seed: 5 })!;
    const next = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'easy', seed: 5, isExcluded: (T) => T === first.T })!;
    expect(next.T).not.toBe(first.T);
    const maxT = archive[archive.length - 1]!.closeTime + 1 - 3 * 86_400_000;
    const capped = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 5, maxT })!;
    expect(capped.T).toBeLessThanOrEqual(maxT);
    expect(capped.visible[capped.visible.length - 1]!.closeTime).toBeLessThan(maxT);
  });

  it('мало истории -> null; пропуск в ряду отбраковывается', () => {
    expect(selectMsMarkTask({ candles: archive.slice(0, 300), tf: '1h', difficulty: 'easy', seed: 1 })).toBeNull();
    expect(selectMsMarkTask({ candles: archive.slice(0, 350), tf: '1h', difficulty: 'easy', seed: 1, maxAttempts: 5 })).toBeNull();
    // реальный ряд с вырезанным куском (пропуск не выдумывается): каждое окно, перекрывающее дыру, отбраковывается
    const holed = [...archive.slice(0, 700), ...archive.slice(710)];
    const sel = selectMsMarkTask({ candles: holed, tf: '1h', difficulty: 'medium', seed: 9 })!;
    expect(gaps(sel.visible, '1h')).toEqual([]);
    // T в ещё формирующейся свече: последняя видимая свеча закрыта до T
    expect(sel.visible[sel.visible.length - 1]!.closeTime + 1).toBeLessThanOrEqual(sel.T);
  });

  it('все T исключены или критерий недостижим за лимит попыток -> null', () => {
    expect(selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'hard', seed: 2, isExcluded: () => true, maxAttempts: 20 })).toBeNull();
  });
});

describe('вопросы режима «Вопрос»', () => {
  const visible = archive.slice(400, 900);

  for (const template of MS_QUESTION_TEMPLATES) {
    it(`${template}: детерминирован, rebuild совпадает, верный ответ оценивается`, () => {
      let built = null;
      for (let seed = 1; seed <= 40 && !built; seed++) built = buildMsQuestion(visible, 'medium', '1h', template, seed);
      expect(built).not.toBeNull();
      const q = built!;
      expect(q.template).toBe(template);
      expect(q.options.map((o) => o.id)).toContain(q.correctOptionId);
      const seed = Number(q.questionId.split(':')[1]);
      expect(buildMsQuestion(visible, 'medium', '1h', template, seed)).toEqual(q);
      expect(rebuildMsQuestion(visible, 'medium', '1h', q.questionId)).toEqual(q);
      const good = gradeMsQuestion(q, q.correctOptionId);
      expect(good).toMatchObject({ verdict: 'correct', score: 1, errors: [] });
      expect(good.skillOutcomes).toEqual([{ skill: q.skill, correct: 1, total: 1 }]);
      const wrongId = q.options.find((o) => o.id !== q.correctOptionId)!.id;
      const bad = gradeMsQuestion(q, wrongId);
      expect(bad.verdict).toBe('incorrect');
      expect(bad.errors[0]).toMatchObject({ code: 'QUESTION_WRONG', skill: q.skill, severity: 'major' });
      expect(bad.errors[0]!.params).toMatchObject({ template, givenId: wrongId, expectedId: q.correctOptionId })
      expect(typeof bad.errors[0]!.params!['given']).toMatch(/string|number/)
      expect(String(bad.errors[0]!.params!['explain'])).not.toMatch(/\{/);
      expect(bad.detail).toEqual({ kind: 'ms-question', chosenOptionId: wrongId, correctOptionId: q.correctOptionId });
    });
  }

  it('trend: верный ответ совпадает с состоянием внешнего слоя', () => {
    const q = buildMsQuestion(visible, 'hard', '1h', 'trend', 1)!;
    const t = analyzeStructure(visible, msParamsFor('hard')).state.external.trend;
    expect(q.correctOptionId).toBe(t === 'none' ? 'range' : t);
  });

  it('wick-or-body: ответ «body» только для реального закрытия за уровнем', () => {
    let bodies = 0;
    let wicks = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const q = buildMsQuestion(visible, 'medium', '1h', 'wick-or-body', seed);
      if (!q) continue;
      const c = visible.find((x) => x.openTime === q.highlight![1]!.time)!;
      const level = q.highlight![1]!.price;
      const beyond = q.highlight![0]!.price === level && (c.close > level || c.close < level);
      if (q.correctOptionId === 'body') {
        bodies++;
        expect(beyond).toBe(true);
      } else {
        wicks++;
        expect((c.high > level && c.close <= level) || (c.low < level && c.close >= level)).toBe(true);
      }
    }
    expect(bodies).toBeGreaterThan(0);
    expect(wicks).toBeGreaterThan(0);
  });

  it('protected: верный вариант — защищённый уровень тренда, три различных цены', () => {
    const r = analyzeStructure(visible, msParamsFor('medium'));
    for (let seed = 1; seed <= 20; seed++) {
      const q = buildMsQuestion(visible, 'medium', '1h', 'protected', seed);
      if (!q) continue;
      const prices = q.options.map((o) => o.labelParams!['price'] as number);
      expect(new Set(prices).size).toBe(3);
      const st = r.state.external;
      const prot = st.trend === 'up' ? st.refLow! : st.refHigh!;
      expect(q.options.find((o) => o.id === q.correctOptionId)!.labelParams!['price']).toBe(prot.price);
    }
  });

  it('generateMsQuestion: focus выбирает шаблон; невалидный questionId -> null', () => {
    const q = generateMsQuestion(visible, 'medium', '1h', 4, ['sweep'])!;
    expect(q.template).toBe('break-type');
    expect(q.skill).toMatch(/^(bos|choch|sweep)$/);
    const any = generateMsQuestion(visible, 'medium', '1h', 4)!;
    expect(MS_QUESTION_TEMPLATES).toContain(any.template);
    expect(rebuildMsQuestion(visible, 'medium', '1h', 'nonsense')).toBeNull();
    expect(rebuildMsQuestion(visible, 'medium', '1h', 'unknown:5')).toBeNull();
    expect(generateMsQuestion(visible.slice(0, 20), 'medium', '1h', 4, ['choch'])).toBeNull();
    expect(buildMsQuestion(visible.slice(0, 20), 'medium', '1h', 'protected', 1)).toBeNull();
  });

  it('selectMsQuestionTask: T на сетке, вопрос строится, детерминизм', () => {
    const a = selectMsQuestionTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 21 })!;
    expect(a.T % TIMEFRAME_MS['15m']).toBe(0);
    expect(a.question.options.length).toBeGreaterThanOrEqual(2);
    expect(selectMsQuestionTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 21 })).toEqual(a);
    expect(selectMsQuestionTask({ candles: archive.slice(0, 100), tf: '1h', difficulty: 'medium', seed: 21 })).toBeNull();
  });
});
