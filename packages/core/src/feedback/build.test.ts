import { describe, expect, it } from 'vitest';
import type { ErrorCode, GradeError } from '../types';
import { buildFeedback, okFromOutcomes } from './build';
import { ERROR_SKILLS, ERROR_TEMPLATES_RU, OK_TEMPLATES_RU, PRINCIPLE_TEMPLATES_RU, VERDICT_TEMPLATES_RU, fillTemplate, flattenTemplates, skillForError } from './templates.ru';

const err = (code: ErrorCode, severity: 'minor' | 'major' = 'minor', extra: Partial<GradeError> = {}): GradeError => ({
  code,
  skill: 'swing',
  severity,
  ...extra,
});

describe('buildFeedback: 6 частей (FR-FB-02)', () => {
  it('верность + ошибки (3,4,5) по одному блоку на ошибку + принцип первой major-ошибки', () => {
    const fb = buildFeedback({
      module: 'market-structure',
      verdict: 'partial',
      score: 0.724,
      errors: [
        err('SWING_EXTRA', 'minor', { markIds: ['u1'], params: { side: 'high', time: 1, n: 5 } }),
        err('BOS_WICK_ONLY', 'major', { markIds: ['u2'] }),
        err('SWEEP_MISSED', 'major', { markIds: ['a3'] }),
      ],
      skillOutcomes: [{ skill: 'swing', correct: 3, total: 5 }],
    });
    expect(fb.verdict).toEqual({ templateKey: 'feedback.verdict.partial', code: null, params: { matched: 3, total: 5, score: 72 }, glyph: 'info' });
    expect(fb.mistakes.map((b) => b.templateKey)).toEqual([
      'feedback.SWING_EXTRA.mistake',
      'feedback.BOS_WICK_ONLY.mistake',
      'feedback.SWEEP_MISSED.mistake',
    ]);
    expect(fb.why.map((b) => b.templateKey)).toEqual(['feedback.SWING_EXTRA.why', 'feedback.BOS_WICK_ONLY.why', 'feedback.SWEEP_MISSED.why']);
    expect(fb.howTo.map((b) => b.code)).toEqual(['SWING_EXTRA', 'BOS_WICK_ONLY', 'SWEEP_MISSED']);
    expect(fb.mistakes[0]).toMatchObject({ code: 'SWING_EXTRA', markIds: ['u1'], params: { side: 'high', time: 1, n: 5 }, glyph: 'extra' });
    expect(fb.mistakes[2]!.glyph).toBe('miss');
    expect(fb.principle.templateKey).toBe('feedback.BOS_WICK_ONLY.principle'); // первая major, не minor SWING_EXTRA
    expect(fb.principle.code).toBe('BOS_WICK_ONLY');
    expect(fb.understood).toEqual([{ templateKey: 'feedback.ok.OK_SWING', code: 'OK_SWING', params: { count: 3, total: 5, tol: 2 }, glyph: 'match' }]);
  });
  it('без ошибок: принцип модуля', () => {
    for (const m of ['market-structure', 'price-action', 'challenge'] as const) {
      const fb = buildFeedback({ module: m, verdict: 'correct', score: 1, errors: [], ok: [{ code: 'OK_WAIT' }] });
      expect(fb.principle).toEqual({ templateKey: `feedback.principle.${m}`, code: null, glyph: 'info' });
      expect(fb.mistakes).toEqual([]);
      expect(fb.verdict.templateKey).toBe(m === 'challenge' ? 'feedback.verdict.challenge.correct' : 'feedback.verdict.plain.correct');
      expect(fb.understood[0]!.code).toBe('OK_WAIT');
    }
  });
  it('при равной severity принцип — первой ошибки', () => {
    const fb = buildFeedback({ module: 'price-action', verdict: 'incorrect', score: 0, errors: [err('PATTERN_EXTRA'), err('PATTERN_MISSED')] });
    expect(fb.principle.code).toBe('PATTERN_EXTRA');
  });
});

describe('okFromOutcomes', () => {
  it('сопоставление навыков и OkCode; нулевые исходы пропускаются', () => {
    const items = okFromOutcomes(
      [
        { skill: 'swing', correct: 2, total: 4 },
        { skill: 'structure-labels', correct: 1, total: 1 },
        { skill: 'bos', correct: 0, total: 2 },
        { skill: 'choch', correct: 1, total: 1 },
        { skill: 'sweep', correct: 1, total: 2 },
        { skill: 'order-block', correct: 1, total: 1 },
        { skill: 'fvg', correct: 2, total: 2 },
        { skill: 'internal-external', correct: 3, total: 3 },
        { skill: 'pa-star', correct: 1, total: 1 },
      ],
      2,
    );
    expect(items.map((i) => i.code)).toEqual(['OK_SWING', 'OK_LABEL', 'OK_CHOCH', 'OK_SWEEP', 'OK_OB', 'OK_FVG', 'OK_SCOPE', 'OK_PATTERN']);
    expect(items.find((i) => i.code === 'OK_PATTERN')!.params).toEqual({ pattern: 'Morning/Evening star (утренняя/вечерняя звезда)', count: 1, total: 1 });
  });
  it('OK_SCOPE только при полностью верном scope; навыки без OkCode пропускаются', () => {
    const items = okFromOutcomes([
      { skill: 'internal-external', correct: 1, total: 2 },
      { skill: 'challenge-entry', correct: 1, total: 1 },
      { skill: 'pa-level', correct: 1, total: 1 },
    ]);
    expect(items).toEqual([]);
  });
});

describe('шаблоны (ALGORITHMS §17)', () => {
  const flat = flattenTemplates();
  it('есть шаблоны для всех кодов ошибок и ok-кодов (полнота по типам)', () => {
    expect(Object.keys(ERROR_TEMPLATES_RU)).toHaveLength(90);
    expect(Object.keys(ERROR_SKILLS)).toHaveLength(90);
    expect(Object.keys(OK_TEMPLATES_RU)).toHaveLength(29);
    expect(Object.keys(VERDICT_TEMPLATES_RU)).toHaveLength(3);
    expect(Object.keys(PRINCIPLE_TEMPLATES_RU)).toHaveLength(5);
    expect(flat['feedback.BOS_WICK_ONLY.mistake']).toContain('{kind}');
    expect(Object.keys(flat)).toHaveLength(3 + 3 + 3 + 3 + 5 + 29 + 90 * 4);
  });
  it('каждый ключ buildFeedback существует в словаре', () => {
    const codes = Object.keys(ERROR_TEMPLATES_RU) as ErrorCode[];
    const fb = buildFeedback({ module: 'market-structure', verdict: 'incorrect', score: 0, errors: codes.map((c) => err(c)) });
    for (const b of [...fb.mistakes, ...fb.why, ...fb.howTo, fb.principle, fb.verdict]) expect(flat[b.templateKey]).toBeTruthy();
  });
  it('шаблоны без хардкода дат/цен; все плейсхолдеры — {латиница}', () => {
    for (const t of Object.values(flat)) {
      const holders = t.match(/\{[^}]*\}/g) ?? [];
      for (const h of holders) expect(h).toMatch(/^\{[A-Za-z]+\}$/);
    }
  });
  it('fillTemplate подставляет параметры, неизвестные оставляет', () => {
    expect(fillTemplate(flat['feedback.verdict.correct']!, { matched: 10, total: 11, score: 91 })).toBe('Верно: совпало 10 из 11 эталонных меток. Оценка 91% учитывает точность и лишние метки.');
    expect(fillTemplate('Пропущен {a} и {b}', { a: 1 })).toBe('Пропущен 1 и {b}');
    expect(fillTemplate('{a}')).toBe('{a}');
  });
  it('вердикт: «N из M совпало» основная, процент вторичен; не «0% совпадения» при частичных успехах', () => {
    const fb = buildFeedback({
      module: 'market-structure',
      verdict: 'incorrect',
      score: 0.04,
      errors: [],
      skillOutcomes: [
        { skill: 'swing', correct: 2, total: 6 },
        { skill: 'internal-external', correct: 2, total: 6 },
      ],
    });
    const text = fillTemplate(flat[fb.verdict.templateKey]!, fb.verdict.params);
    expect(text).toBe('Неверно: совпало 2 из 6 эталонных меток. Оценка 4% учитывает точность и лишние метки.');
    const plain = buildFeedback({ module: 'price-action', verdict: 'incorrect', score: 0, errors: [] });
    expect(fillTemplate(flat[plain.verdict.templateKey]!, plain.verdict.params)).not.toMatch(/\{|совпадения/);
  });
  it('D-01: лишние метки не входят в знаменатель «N из M»', () => {
    const fb = buildFeedback({
      module: 'market-structure',
      verdict: 'incorrect',
      score: 0,
      errors: [],
      skillOutcomes: [{ skill: 'swing', correct: 0, total: 6, extra: 1 }],
    });
    expect(fb.verdict.params).toMatchObject({ matched: 0, total: 5, score: 0 });
  });
  it('Challenge: вердикт по качеству, без «совпадения с эталоном»', () => {
    const fb = buildFeedback({ module: 'challenge', verdict: 'correct', score: 0.8, errors: [] });
    expect(fb.verdict.templateKey).toBe('feedback.verdict.challenge.correct');
    const text = fillTemplate(flat[fb.verdict.templateKey]!, fb.verdict.params);
    expect(text).toBe('Решение верное: качество 80 из 100.');
    expect(text).not.toMatch(/эталон/);
  });
  it('skillForError: фиксированные и параметрические навыки', () => {
    expect(skillForError('BOS_WICK_ONLY')).toBe('bos');
    expect(skillForError('PATTERN_MISSED', { pattern: 'evening-star' })).toBe('pa-star');
    expect(skillForError('PATTERN_EXTRA', { pattern: 'doji' })).toBe('pa-doji');
    expect(skillForError('PATTERN_WRONG_TYPE', { pattern: 'pin-bar' })).toBe('pa-pin-bar');
    expect(skillForError('PATTERN_WRONG_DIRECTION', { pattern: 'inside-bar' })).toBe('pa-inside-bar');
    expect(skillForError('PATTERN_MISSED')).toBe('pa-engulfing');
    expect(skillForError('MARK_WRONG_DIRECTION', { kind: 'fvg' })).toBe('fvg');
    expect(skillForError('MARK_WRONG_DIRECTION', { kind: 'order-block' })).toBe('order-block');
    expect(skillForError('MARK_WRONG_DIRECTION')).toBe('sweep');
    expect(skillForError('QUESTION_WRONG', { skill: 'choch' })).toBe('choch');
    expect(skillForError('QUESTION_WRONG')).toBe('bos');
  });
});

describe('вердикт fibonacci/elliott (FIBONACCI.md §11.1)', () => {
  it('fibonacci использует feedback.verdict.plain.* даже при наличии исходов навыков', () => {
    const fb = buildFeedback({ module: 'fibonacci', verdict: 'partial', score: 0.6, errors: [], skillOutcomes: [{ skill: 'fib-anchor', correct: 1, total: 2 }] });
    expect(fb.verdict.templateKey).toBe('feedback.verdict.plain.partial');
    expect(fb.verdict.params).toEqual({ score: 60 });
  });
  it('market-structure по-прежнему считает совпавшие метки', () => {
    const fb = buildFeedback({ module: 'market-structure', verdict: 'partial', score: 0.6, errors: [], skillOutcomes: [{ skill: 'swing', correct: 1, total: 2 }] });
    expect(fb.verdict.templateKey).toBe('feedback.verdict.partial');
  });
});
