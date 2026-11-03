import { describe, expect, it } from 'vitest';
import { readKlines } from '../testing/klines';
import { analyzeStructure } from '../smc/analyze';
import { buildAlgoMarkSet } from '../smc/marks';
import { gaps } from '../smc/series';
import {
  MS_DEPTH,
  MS_HARD_EXTRAS,
  MS_MIN_WARMUP,
  MS_REQUIRED_MAX,
  MS_REQUIRED_MIN,
  MS_WINDOW_MAX,
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

describe('параметры по сложности (§1.6, §13.2 v1.1)', () => {
  it('N, окна и понятия', () => {
    expect(msParamsFor('easy')).toMatchObject({ nExt: 7, nInt: null, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 });
    expect(msParamsFor('medium')).toMatchObject({ nExt: 5, nInt: 3 });
    expect(msParamsFor('hard')).toMatchObject({ nExt: 5, nInt: 2 });
    for (const d of ['easy', 'medium', 'hard'] as Difficulty[]) {
      expect(msWindowSize(d)).toBeGreaterThanOrEqual(MS_WINDOW_MIN);
      expect(msWindowSize(d)).toBeLessThanOrEqual(MS_WINDOW_MAX);
    }
    expect(msQuestionWindow('easy')).toBe(120);
    expect(msQuestionWindow('hard')).toBe(150);
    expect(msConceptsFor('easy')).toEqual(['swing']);
    expect(msConceptsFor('medium')).toEqual(['swing', 'structure-labels', 'bos', 'choch']);
    expect(msConceptsFor('hard')).toEqual(expect.arrayContaining(['order-block', 'sweep', 'fvg', 'internal-external']));
  });

  it('hard: focus выбирает дополнительные понятия; по умолчанию одно по seed; easy/medium focus игнорируют', () => {
    expect(msConceptsFor('hard', ['sweep'])).toEqual(['swing', 'structure-labels', 'bos', 'choch', 'sweep']);
    expect(msConceptsFor('hard', ['fvg', 'order-block'])).toEqual(['swing', 'structure-labels', 'bos', 'choch', 'order-block', 'fvg']);
    // внутренний слой: без HH/HL/LH/LL, чтобы уложиться в 12 меток
    expect(msConceptsFor('hard', ['internal-external'])).toEqual(['swing', 'bos', 'choch', 'internal-external']);
    expect(msConceptsFor('easy', ['order-block'])).toEqual(['swing']);
    expect(msConceptsFor('medium', ['sweep'])).toEqual(msConceptsFor('medium'));
    expect(msResolveFocus('easy', ['sweep'], 1)).toEqual([]);
    expect(msResolveFocus('hard', ['fvg', 'bos'], 1)).toEqual(['fvg']);
    const picks = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => msResolveFocus('hard', undefined, seed).join()));
    expect(picks.size).toBeGreaterThan(1);
    for (const p of picks) expect(MS_HARD_EXTRAS).toContain(p as never);
    expect(msResolveFocus('hard', undefined, 3)).toEqual(msResolveFocus('hard', undefined, 3));
  });

  it('инструменты соответствуют понятиям', () => {
    expect(msToolsFor(['swing', 'bos'])).toEqual(['swing-high', 'swing-low', 'bos']);
    expect(msToolsFor(msConceptsFor('hard'))).toContain('order-block');
    expect(msToolsFor(msConceptsFor('easy'))).toEqual(['swing-high', 'swing-low']);
  });
});

describe('selectMsMarkTask (v1.1: окно 40-80, 4-12 меток)', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
    for (const seed of [7, 8, 9]) {
      it(`${difficulty}/seed ${seed}: сетка 15m, закрытый непрерывный ряд, прогрев >= 300, 4-12 меток в окне 40-80`, () => {
        const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty, seed })!;
        expect(sel).not.toBeNull();
        expect(sel.T % TIMEFRAME_MS['15m']).toBe(0);
        expect(sel.visible.length).toBeLessThanOrEqual(MS_DEPTH['1h']);
        expect(sel.visible.every((c) => c.closed && c.closeTime < sel.T)).toBe(true);
        expect(gaps(sel.visible, '1h')).toEqual([]);
        expect(sel.windowSize).toBeGreaterThanOrEqual(MS_WINDOW_MIN);
        expect(sel.windowSize).toBeLessThanOrEqual(msWindowSize(difficulty));
        expect(sel.window).toEqual({ fromIndex: sel.visible.length - sel.windowSize, toIndex: sel.visible.length - 1 });
        expect(sel.window.fromIndex).toBeGreaterThanOrEqual(MS_MIN_WARMUP);
        expect(sel.scoped).toBe(sel.concepts.includes('internal-external'));
        expect(archive[sel.visibleFrom]).toBe(sel.visible[0]);
        const r = analyzeStructure(sel.visible, sel.params);
        const required = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
        expect(required.length).toBe(sel.requiredCount);
        expect(required.length).toBeGreaterThanOrEqual(MS_REQUIRED_MIN);
        expect(required.length).toBeLessThanOrEqual(MS_REQUIRED_MAX);
        expect(meetsMsCriteria(r, sel.visible, sel.window, sel.criteria, sel.concepts)).toBe(true);
        expect(sel.concepts).toEqual(msConceptsFor(difficulty, sel.focus));
      });
    }
  }

  it('easy: только swing-high/swing-low внешнего слоя', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'easy', seed: 3 })!;
    expect(sel.concepts).toEqual(['swing']);
    expect(sel.tools).toEqual(['swing-high', 'swing-low']);
    expect(sel.focus).toEqual([]);
    const r = analyzeStructure(sel.visible, sel.params);
    const marks = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
    expect(marks.every((m) => (m.kind === 'swing-high' || m.kind === 'swing-low') && m.scope === 'external')).toBe(true);
  });

  it('medium: внешняя структура (swing, метки, BOS/CHoCH), без внутренней; есть хотя бы один BOS/CHoCH', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 3 })!;
    expect(sel.concepts).toEqual(['swing', 'structure-labels', 'bos', 'choch']);
    expect(sel.scoped).toBe(false);
    const r = analyzeStructure(sel.visible, sel.params);
    const marks = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
    expect(marks.every((m) => m.scope === 'external')).toBe(true);
    expect(marks.some((m) => m.kind === 'bos' || m.kind === 'choch')).toBe(true);
  });

  it('hard: focus явный, каждое понятие focus представлено в эталоне окна', () => {
    for (const focus of [['sweep'], ['order-block'], ['fvg'], ['internal-external']] as const) {
      const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'hard', seed: 5, focus: [...focus] })!;
      expect(sel).not.toBeNull();
      expect(sel.focus).toEqual(focus);
      const r = analyzeStructure(sel.visible, sel.params);
      const marks = buildAlgoMarkSet(r, { concepts: sel.concepts, window: sel.window }).required;
      const f = focus[0];
      if (f === 'internal-external') expect(marks.some((m) => m.scope === 'internal' && (m.kind === 'bos' || m.kind === 'choch'))).toBe(true);
      else expect(marks.some((m) => m.kind === f)).toBe(true);
    }
    const auto = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'hard', seed: 5 })!;
    expect(auto.focus).toHaveLength(1);
  });

  it('детерминирован по seed; разные seed дают разные T', () => {
    const a = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    const b = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    expect(a).toEqual(b);
    const Ts = new Set([1, 2, 3, 4, 5].map((seed) => selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed })!.T));
    expect(Ts.size).toBeGreaterThan(1);
  });

  it('meetsMsCriteria: меньше 4 или больше 12 меток - отказ', () => {
    const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: 'medium', seed: 11 })!;
    const r = analyzeStructure(sel.visible, sel.params);
    const n = sel.visible.length;
    expect(meetsMsCriteria(r, sel.visible, { fromIndex: n - 3, toIndex: n - 1 }, 'easy', ['swing'])).toBe(false);
    expect(meetsMsCriteria(r, sel.visible, { fromIndex: n - 300, toIndex: n - 1 }, 'easy', ['swing', 'structure-labels'])).toBe(false);
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
