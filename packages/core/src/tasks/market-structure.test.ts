import { describe, expect, it } from 'vitest';
import { readKlines } from '../testing/klines';
import { analyzeStructure } from '../smc/analyze';
import { gaps } from '../smc/series';
import {
  MS_DEPTH,
  MS_MIN_WARMUP,
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

describe('параметры по сложности (§1.6, §13.2)', () => {
  it('N, окна и понятия', () => {
    expect(msParamsFor('easy')).toMatchObject({ nExt: 7, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
    expect(msParamsFor('medium')).toMatchObject({ nExt: 5, nInt: 3 });
    expect(msParamsFor('hard')).toMatchObject({ nExt: 5, nInt: 2 });
    expect(msWindowSize('easy')).toBe(120);
    expect(msWindowSize('medium')).toBe(150);
    expect(msWindowSize('hard')).toBe(150);
    expect(msConceptsFor('easy')).toEqual(['swing', 'structure-labels', 'bos', 'choch']);
    expect(msConceptsFor('hard')).toContain('order-block');
    expect(msConceptsFor('medium')).not.toContain('order-block');
  });

  it('focus сужает понятия; bos/choch идут вместе со swing; без структурного добавляется swing', () => {
    expect(msConceptsFor('hard', ['sweep'])).toEqual(['swing', 'sweep']);
    expect(msConceptsFor('hard', ['bos'])).toEqual(['swing', 'bos']);
    expect(msConceptsFor('hard', ['fvg', 'order-block'])).toEqual(['swing', 'fvg', 'order-block']);
    expect(msConceptsFor('hard', ['swing', 'fvg'])).toEqual(['swing', 'fvg']);
    expect(msConceptsFor('easy', ['order-block'])).toEqual(msConceptsFor('easy'));
    expect(msConceptsFor('medium', [])).toEqual(msConceptsFor('medium'));
  });

  it('инструменты соответствуют понятиям', () => {
    expect(msToolsFor(['swing', 'bos'])).toEqual(['swing-high', 'swing-low', 'bos']);
    expect(msToolsFor(msConceptsFor('hard'))).toContain('order-block');
  });
});

describe('selectMsMarkTask', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
    it(`${difficulty}: T на сетке 15m, видимый ряд закрыт и непрерывен, история >= 300, критерий выполнен`, () => {
      const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty, seed: 7 })!;
      expect(sel).not.toBeNull();
      expect(sel.T % TIMEFRAME_MS['15m']).toBe(0);
      expect(sel.visible.length).toBeLessThanOrEqual(MS_DEPTH['1h']);
      expect(sel.visible.every((c) => c.closed && c.closeTime < sel.T)).toBe(true);
      expect(gaps(sel.visible, '1h')).toEqual([]);
      const W = msWindowSize(difficulty);
      expect(sel.window).toEqual({ fromIndex: sel.visible.length - W, toIndex: sel.visible.length - 1 });
      expect(sel.window.fromIndex).toBeGreaterThanOrEqual(MS_MIN_WARMUP);
      expect(sel.scoped).toBe(difficulty !== 'easy');
      expect(archive[sel.visibleFrom]).toBe(sel.visible[0]);
      const r = analyzeStructure(sel.visible, sel.params);
      expect(meetsMsCriteria(r, sel.visible, sel.window, sel.criteria)).toBe(true);
      expect(['easy', 'medium', 'hard']).toContain(sel.criteria);
    });
  }

  it('easy: явный тренд (>= 2 внешних BOS одного направления, без CHoCH)', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'easy', seed: 3 })!;
    expect(sel.criteria).toBe('easy');
    const r = analyzeStructure(sel.visible, sel.params);
    const inW = r.events.filter((e) => e.scope === 'external' && e.breakIndex >= sel.window.fromIndex);
    expect(inW.filter((e) => e.kind === 'choch')).toHaveLength(0);
    expect(inW.filter((e) => e.kind === 'bos').length).toBeGreaterThanOrEqual(2);
  });

  it('детерминирован по seed; разные seed дают разные T', () => {
    const a = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    const b = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    expect(a).toEqual(b);
    const Ts = new Set([1, 2, 3, 4, 5].map((seed) => selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed })!.T));
    expect(Ts.size).toBeGreaterThan(1);
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
    expect(selectMsMarkTask({ candles: archive.slice(0, 430), tf: '1h', difficulty: 'easy', seed: 1, maxAttempts: 5 })).toBeNull();
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
      expect(bad.errors[0]!.params).toMatchObject({ template, given: wrongId, expected: q.correctOptionId });
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
