// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import { checkEwMarks, EW_ALT_ALLOWED, EW_ALTERNATIVE_OPTIONS, findWaveCandidates, type Candle, type Mark } from '@tl/core';
import { FixtureLoader } from '../../server/fixture-loader';
import {
  allowedAlternatives,
  ewAnswer,
  impliedFromMarks,
  invalidationOf,
  keepEwMarks,
  liveChecks,
  liveHints,
  parsePrice,
  reconcileAlternative,
  userEwMarks,
  type LiveCheck,
} from './adapters';

const mk = (id: string, kind: Mark['kind'], pts: { time: number; price: number }[], meta?: Mark['meta']): Mark => ({
  id, kind, anchors: pts, scope: null, direction: null, author: 'user', ...(meta ? { meta } : {}),
});
const pts = (n: number) => Array.from({ length: n }, (_, i) => ({ time: 1_000 + i, price: 10 + (i % 2) }));

describe('допустимые пары сценариев (ELLIOTT.md §6.2)', () => {
  it('для каждого основного - ровно список из таблицы, без самого основного', () => {
    for (const p of ['w3-next', 'w5-next', 'abc-next', 'trend-next'] as const) {
      expect(allowedAlternatives(p)).toEqual(EW_ALT_ALLOWED[p]);
      expect(allowedAlternatives(p)).not.toContain(p);
    }
    expect(allowedAlternatives('w5-next')).toEqual(['bc-next', 'correction-extends']);
    expect(allowedAlternatives('abc-next')).toEqual(['impulse-extends']);
    expect(allowedAlternatives(null)).toEqual([]);
  });
  it('все допустимые - из закрытого списка', () => {
    for (const list of Object.values(EW_ALT_ALLOWED)) for (const a of list) expect(EW_ALTERNATIVE_OPTIONS).toContain(a);
  });
  it('смена основного сбрасывает недопустимую альтернативу', () => {
    expect(reconcileAlternative('w5-next', 'bc-next')).toBe('bc-next');
    expect(reconcileAlternative('abc-next', 'bc-next')).toBeNull();
    expect(reconcileAlternative(null, 'correction-extends')).toBeNull();
    expect(reconcileAlternative('w3-next', null)).toBeNull();
  });
});

describe('keepEwMarks и выбор меток', () => {
  it('оставляет по одной последней метке каждого вида и помечает hline ролью', () => {
    const a = mk('a', 'ew-impulse', pts(6));
    const b = mk('b', 'ew-impulse', pts(6));
    const z = mk('z', 'ew-zigzag', pts(3));
    const f = mk('f', 'ew-flat', pts(3));
    const h1 = mk('h1', 'hline', pts(1));
    const h2 = mk('h2', 'hline', pts(1));
    const out = keepEwMarks([a, z, b, f, h1, h2]);
    expect(out.map((m) => m.id)).toEqual(['b', 'f', 'h2']);
    expect(out[2]!.meta?.role).toBe('ew-invalidation');
  });
  it('коррекция учитывается только при импульсе из 6 точек', () => {
    const z = mk('z', 'ew-zigzag', pts(3));
    expect(userEwMarks([mk('i', 'ew-impulse', pts(5)), z]).correction).toBeNull();
    expect(userEwMarks([mk('i', 'ew-impulse', pts(6)), z]).correction?.id).toBe('z');
    expect(userEwMarks([mk('i', 'ew-impulse', pts(2))]).impulse).toBeNull();
  });
  it('сценарий из разметки: 3 -> w3, 5 -> w5, 6 -> abc, 6 + коррекция -> trend', () => {
    expect(impliedFromMarks([mk('i', 'ew-impulse', pts(3))])).toBe('w3-next');
    expect(impliedFromMarks([mk('i', 'ew-impulse', pts(5))])).toBe('w5-next');
    expect(impliedFromMarks([mk('i', 'ew-impulse', pts(6))])).toBe('abc-next');
    expect(impliedFromMarks([mk('i', 'ew-impulse', pts(6)), mk('z', 'ew-flat', pts(3))])).toBe('trend-next');
    expect(impliedFromMarks([])).toBeNull();
  });
  it('invalidationOf и parsePrice', () => {
    expect(invalidationOf([mk('h', 'hline', [{ time: 1, price: 65400.5 }])])).toBe(65400.5);
    expect(invalidationOf([])).toBeNull();
    expect(parsePrice(' 65 400,5 ')).toBe(65400.5);
    expect(parsePrice('-1')).toBeNull();
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice('')).toBeNull();
  });
});

describe('ewAnswer: состояние UI -> ElliottAnswer', () => {
  const base = { kind: 'ew-impulse-correction' as const, alternativeRequired: true, invalidation: 65400 as number | null };
  const marks = [mk('i', 'ew-impulse', pts(6)), mk('z', 'ew-zigzag', pts(3))];
  it('собирает ответ в форме контракта', () => {
    const r = ewAnswer({ ...base, marks, primary: 'trend-next', alternative: 'correction-extends' });
    expect(r).toEqual({
      answer: { kind: 'ew-impulse-correction', impulse: marks[0], correction: marks[1], primary: 'trend-next', alternative: 'correction-extends', invalidation: 65400 },
    });
  });
  it('недопустимая альтернатива не уходит на сервер', () => {
    const r = ewAnswer({ ...base, kind: 'ew-impulse', alternativeRequired: false, marks: [marks[0]!], primary: 'abc-next', alternative: 'bc-next' });
    expect('answer' in r && r.answer.alternative).toBeNull();
  });
  it('ошибки ввода по порядку: разметка, сценарий, альтернатива, уровень', () => {
    expect(ewAnswer({ ...base, marks: [], primary: null, alternative: null })).toEqual({ error: 'noImpulse' });
    expect(ewAnswer({ ...base, marks, primary: null, alternative: null })).toEqual({ error: 'noPrimary' });
    expect(ewAnswer({ ...base, marks, primary: 'trend-next', alternative: null })).toEqual({ error: 'noAlt' });
    expect(ewAnswer({ ...base, marks, primary: 'trend-next', alternative: 'correction-extends', invalidation: null })).toEqual({ error: 'noInv' });
  });
  it('на лёгком уровне альтернатива необязательна', () => {
    const r = ewAnswer({ ...base, kind: 'ew-impulse', alternativeRequired: false, marks: [marks[0]!], primary: 'abc-next', alternative: null });
    expect('answer' in r && r.answer.alternative).toBeNull();
  });
});

describe('мягкие подсказки правил (форматирование)', () => {
  // SYNTHETIC: проверка форматирования подсказок по заданным результатам проверки, без свечей
  const synthetic_check = (over: Partial<LiveCheck>): LiveCheck => ({ orderBroken: false, points: [], rules: [], guides: [], ...over });
  it('нарушение правила - первым, по названию правила; рекомендация - мягко', () => {
    const h = liveHints([
      synthetic_check({
        points: [{ label: '3', userTime: 1, time: 1, price: 1, offsetCandles: 0, extreme: true, swing: false }],
        rules: [{ rule: 'w4-overlap', ok: false, actual: 1, limit: 2 }, { rule: 'w2', ok: true, actual: 1, limit: 2 }],
        guides: [{ guide: 'w2-depth', ok: false, actual: 0.9, expected: '0.5–0.618' }],
      }),
    ]);
    expect(h.map((x) => x.id)).toEqual(['swing-3', 'rule-w4-overlap', 'guide-w2-depth']);
    expect(h.find((x) => x.id === 'rule-w4-overlap')!.tone).toBe('rule');
    expect(h.find((x) => x.id === 'guide-w2-depth')!.tone).toBe('soft');
  });
  it('нарушенный порядок скрывает остальное; несоответствие сценария - отдельная подсказка', () => {
    expect(liveHints([synthetic_check({ orderBroken: true })]).map((x) => x.id)).toEqual(['order']);
    expect(liveHints([], true).map((x) => x.id)).toEqual(['mismatch']);
  });
});

describe('мягкие подсказки на реальных свечах BTCUSDT 1h (data.binance.vision)', () => {
  let candles: Candle[] = [];
  let impulse: Mark;
  beforeAll(async () => {
    candles = await new FixtureLoader().candles('BTCUSDT', '1h', Date.UTC(2026, 4, 1), Date.UTC(2026, 9, 1));
    const c = findWaveCandidates(candles, { nPivot: 7, withCorrection: false, minSizeAtr: 6, minWaveAtr: 1, minGuides: 2 })[0];
    if (!c) throw new Error('нет кандидата в фикстурах');
    impulse = mk('u1', 'ew-impulse', c.count.impulse.map((p) => ({ time: p.time, price: p.price })));
  });
  it('эталонный импульс: правил нарушений нет', () => {
    const { results } = checkEwMarks(candles, '1h', [impulse]);
    const h = liveHints(liveChecks(results));
    expect(h.filter((x) => x.tone === 'rule')).toEqual([]);
  });
  it('точки в обратном порядке: подсказка про порядок', () => {
    const rev = { ...impulse, anchors: [...impulse.anchors].reverse() };
    const { results } = checkEwMarks(candles, '1h', [rev]);
    expect(liveHints(liveChecks(results)).some((x) => x.id === 'order')).toBe(true);
  });
  it('пять точек вместо шести: проверяется то, что уже поставлено', () => {
    const five = { ...impulse, anchors: impulse.anchors.slice(0, 5) };
    const { results } = checkEwMarks(candles, '1h', [five]);
    expect(results).toHaveLength(1);
    expect(liveHints(liveChecks(results)).filter((x) => x.tone === 'rule')).toEqual([]);
  });
});
