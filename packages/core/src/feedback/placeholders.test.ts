import { describe, expect, it } from 'vitest';
import { analyzeStructure } from '../smc/analyze';
import { buildAlgoMarkSet } from '../smc/marks';
import { gradeMarks } from '../grading/grade';
import { mulberry32 } from '../rng';
import { readKlines } from '../testing/klines';
import { ERROR_TEMPLATES_RU, fillTemplate, flattenTemplates, OK_TEMPLATES_RU } from './templates.ru';
import { gradeLevel, findLevels, computeContext, gradeContext, detectPatterns, patternToMark, htfClosedAt, buildPatternAlgoMarkSet, patternGradeContext } from '../pa';
import { buildMsQuestion, gradeMsQuestion, MS_QUESTION_TEMPLATES, selectMsMarkTask } from '../tasks';
import type { PatternType } from '../types';
import { fibCandles, indexAtIso, type FibSeriesId } from '../testing/fib';
import { checkFibMarks, gradeFibExtension, gradeFibGrid, gradeFibReaction, buildExtensionRef, buildGridRef, buildReactionRef } from '../fib';
import type { FibConfluenceKey, FibReactionOption, FibTarget } from '../fib';
import type { OkItem } from './types';
import { buildFeedback } from './build';
import type { ErrorCode, GradeError, Mark, SkillId, StructureParams } from '../types';

// Property-тест: ни один шаблон разбора после подстановки реальных параметров не содержит «{...}».
// Реальные свечи BTCUSDT 4h (сентябрь 2026); разметка мутируется случайно (сдвиги, смена типа, лишние, пропуски).
const candles = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
const P: StructureParams = { nExt: 5, nInt: 3, sweepHoldK: 3, fvgMinAtr: 0.5, obDisplacementAtr: 1.2 };
const r = analyzeStructure(candles, P);
const window = { fromIndex: 30, toIndex: candles.length - 1 };
const ALL: SkillId[] = ['swing', 'structure-labels', 'bos', 'choch', 'internal-external', 'sweep', 'fvg', 'order-block'];
const algo = buildAlgoMarkSet(r, { concepts: ALL, window });
const H4 = 4 * 3600_000;
const FLIP: Partial<Record<Mark['kind'], Mark['kind']>> = {
  bos: 'choch', choch: 'bos', 'swing-high': 'swing-low', 'swing-low': 'swing-high', hh: 'll', hl: 'lh', lh: 'hl', ll: 'hh', fvg: 'order-block', 'order-block': 'fvg', sweep: 'bos',
};

function mutate(seed: number): Mark[] {
  const rnd = mulberry32(seed);
  const out: Mark[] = [];
  for (const m of algo.required) {
    const x = rnd();
    if (x < 0.25) continue; // пропуск
    let u: Mark = { ...m, id: `u-${m.id}`, author: 'user', scope: rnd() < 0.3 ? (m.scope === 'internal' ? 'external' : 'internal') : m.scope };
    const y = rnd();
    if (y < 0.2) u = { ...u, kind: FLIP[m.kind] ?? m.kind };
    else if (y < 0.4) u = { ...u, anchors: u.anchors.map((a) => ({ ...a, time: a.time + (1 + Math.floor(rnd() * 5)) * H4 * (rnd() < 0.5 ? -1 : 1) })) };
    else if (y < 0.5) u = { ...u, direction: u.direction === 'bull' ? 'bear' : 'bull' };
    else if (y < 0.6) u = { ...u, anchors: u.anchors.map((a) => ({ ...a, price: a.price * (1 + 0.01 * (rnd() - 0.5) * 4) })) };
    out.push(u);
  }
  for (let i = 0; i < 3; i++) {
    const c = candles[window.fromIndex + Math.floor(rnd() * (candles.length - window.fromIndex - 3))]!;
    const kinds: Mark['kind'][] = ['swing-high', 'swing-low', 'bos', 'choch', 'sweep', 'fvg', 'order-block', 'hh', 'll'];
    const kind = kinds[Math.floor(rnd() * kinds.length)]!;
    const n = kind === 'bos' || kind === 'choch' || kind === 'sweep' || kind === 'fvg' || kind === 'order-block' ? 2 : 1;
    out.push({
      id: `x${seed}-${i}`, kind, scope: null, direction: rnd() < 0.5 ? 'bull' : 'bear', author: 'user',
      anchors: Array.from({ length: n }, (_, k) => ({ time: c.openTime + k * 3 * H4, price: k === 0 ? c.high : c.low })),
    });
  }
  return out;
}

describe('шаблоны разбора: нет неподставленных плейсхолдеров', () => {
  const seen = new Set<ErrorCode>();
  const missing = new Set<string>();
  it('для всех ошибок gradeMarks на случайной разметке (реальные params)', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const user = mutate(seed);
      const res = gradeMarks(user, algo, { candles, window, concepts: ALL, toleranceCandles: 2, iouMin: 0.5, levelPricePct: 0.1, scoped: seed % 2 === 0 });
      const fb = buildFeedback({ module: 'market-structure', verdict: res.verdict, score: res.score, errors: res.errors, skillOutcomes: res.skillOutcomes });
      for (const e of res.errors) {
        seen.add(e.code);
        for (const part of ['mistake', 'why', 'howTo', 'principle'] as const) {
          for (const m of ERROR_TEMPLATES_RU[e.code][part].matchAll(/\{(\w*)\}/g)) if (e.params?.[m[1]!] === undefined) missing.add(`${e.code}.${part}:${m[1]}`);
        }
        const t = ERROR_TEMPLATES_RU[e.code];
        for (const part of ['mistake', 'why', 'howTo', 'principle'] as const) {
          const text = fillTemplate(t[part], e.params);
          void text;
        }
      }
      assertFilled('ms-mark/4h-all', 'market-structure', res);
      for (const b of fb.understood) expect(fillTemplate(OK_TEMPLATES_RU[b.code as keyof typeof OK_TEMPLATES_RU], b.params)).not.toMatch(/\{\w*\}/);
    }
    expect([...missing].sort()).toEqual([]);
    expect(seen.size).toBeGreaterThan(12);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Расширение: ВСЕ коды Market Structure и Price Action, по режиму задания, на реальных фикстурах.
const MS_PA_CODES = (Object.keys(ERROR_TEMPLATES_RU) as ErrorCode[]).filter(
  (c) => /^(SWING_|STRUCTURE_|BOS_|CHOCH_|INTERNAL_|EXTERNAL_|SWEEP_|MARK_|OB_|FVG_|QUESTION_|PATTERN_|LEVEL_|CONTEXT_)/.test(c),
);
const flat = flattenTemplates();
const seenAll = new Set<ErrorCode>();
const bad: string[] = [];

/** Все части шаблонов ошибки и блоки вердикта/«понято» после подстановки не содержат «{» (проверка именно текста). */
function assertFilled(mode: string, module: 'market-structure' | 'price-action', res: { verdict: 'correct' | 'partial' | 'incorrect'; score: number; errors: GradeError[]; skillOutcomes: import('../types').SkillOutcome[] }) {
  const fb = buildFeedback({ module, verdict: res.verdict, score: res.score, errors: res.errors, skillOutcomes: res.skillOutcomes });
  const blocks = [fb.verdict, ...fb.understood, ...fb.mistakes, ...fb.why, ...fb.howTo, fb.principle];
  for (const b of blocks) {
    const text = fillTemplate(flat[b.templateKey]!, b.params);
    if (/[{}]/.test(text)) bad.push(`${mode}:${b.templateKey}: ${text}`);
    if (/inside-bar|pin-bar|morning-star|evening-star|\bengulfing\b|\bdoji\b/.test(text.replace(/\((?:[^)]*)\)/g, ''))) bad.push(`${mode}:${b.templateKey}: код модели в тексте: ${text}`);
    if (/Неверно: 0%|\d+% совпадения/.test(text)) bad.push(`${mode}:${b.templateKey}: ${text}`);
  }
  for (const e of res.errors) seenAll.add(e.code);
}

describe('шаблоны: все коды MS и PA, по режимам, реальные данные', () => {
  it('MS «Разметка»: конфигурации easy/medium/hard (v1.1) на реальных заданиях, случайная разметка', () => {
    const archive = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv'), ...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv')];
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let seed = 1; seed <= 6; seed++) {
        const focus = difficulty === 'hard' ? (['sweep', 'order-block', 'fvg', 'internal-external'] as const)[seed % 4]! : undefined;
        const sel = selectMsMarkTask({ candles: archive, tf: '1h', difficulty, seed, ...(focus ? { focus: [focus] } : {}) });
        expect(sel).not.toBeNull();
        const a = buildAlgoMarkSet(analyzeStructure(sel!.visible, sel!.params, { tf: '1h' }), { concepts: sel!.concepts, window: sel!.window });
        const H1 = 3600_000;
        for (let k = 1; k <= 40; k++) {
          const rnd = mulberry32(seed * 1000 + k);
          const user: Mark[] = [];
          for (const m of a.required) {
            if (rnd() < 0.3) continue;
            let u: Mark = { ...m, id: `u-${m.id}`, author: 'user' };
            const y = rnd();
            if (y < 0.2) u = { ...u, kind: FLIP[m.kind] ?? m.kind };
            else if (y < 0.4) u = { ...u, anchors: u.anchors.map((x) => ({ ...x, time: x.time + (1 + Math.floor(rnd() * 5)) * H1 * (rnd() < 0.5 ? -1 : 1) })) };
            else if (y < 0.5) u = { ...u, direction: u.direction === 'bull' ? 'bear' : 'bull' };
            else if (y < 0.6) u = { ...u, scope: u.scope === 'internal' ? 'external' : 'internal' };
            user.push(u);
          }
          for (let i = 0; i < 2; i++) {
            const c = sel!.visible[sel!.window.fromIndex + Math.floor(rnd() * (sel!.windowSize - 3))]!;
            const kinds: Mark['kind'][] = ['swing-high', 'swing-low', 'bos', 'choch', 'sweep', 'fvg', 'order-block', 'hh', 'll'];
            const kind = kinds[Math.floor(rnd() * kinds.length)]!;
            const n = ['bos', 'choch', 'sweep', 'fvg', 'order-block'].includes(kind) ? 2 : 1;
            user.push({ id: `x${k}-${i}`, kind, scope: null, direction: rnd() < 0.5 ? 'bull' : 'bear', author: 'user',
              anchors: Array.from({ length: n }, (_, j) => ({ time: c.openTime + j * 3 * H1, price: j === 0 ? c.high : c.low })) });
          }
          const res = gradeMarks(user, a, { candles: sel!.visible, window: sel!.window, concepts: sel!.concepts, toleranceCandles: 2, iouMin: 0.5, levelPricePct: 0.1, scoped: sel!.scoped });
          assertFilled(`ms-mark/${difficulty}`, 'market-structure', res);
        }
      }
    }
  });

  it('MS «Вопрос»: QUESTION_WRONG для каждого шаблона и каждого неверного варианта', () => {
    const archive = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv'), ...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv')];
    const visible = archive.slice(400, 900);
    let built = 0;
    for (const template of MS_QUESTION_TEMPLATES) {
      for (let seed = 1; seed <= 30; seed++) {
        const q = buildMsQuestion(visible, 'medium', '1h', template, seed);
        if (!q) continue;
        built++;
        for (const o of q.options.filter((x) => x.id !== q.correctOptionId)) assertFilled(`ms-question/${template}`, 'market-structure', gradeMsQuestion(q, o.id));
      }
    }
    expect(built).toBeGreaterThan(MS_QUESTION_TEMPLATES.length);
  });

  const c4h = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
  const PTYPES: PatternType[] = ['engulfing', 'pin-bar', 'inside-bar', 'doji', 'morning-star', 'evening-star'];

  it('PA «Найди модель»: каждый тип модели, мутации (пропуск, сдвиг, другой тип, направление, лишние)', () => {
    const H4s = 4 * 3600_000;
    const all = detectPatterns(c4h);
    for (const target of PTYPES) {
      const window = { fromIndex: 20, toIndex: c4h.length - 1 };
      const a = buildPatternAlgoMarkSet(c4h, target, window);
      expect(a.required.length).toBeGreaterThan(0);
      const others = all.filter((p) => p.type !== target && p.lastIndex >= window.fromIndex);
      for (let seed = 1; seed <= 40; seed++) {
        const rnd = mulberry32(seed * 7 + PTYPES.indexOf(target));
        const user: Mark[] = [];
        for (const m of a.required) {
          const x = rnd();
          if (x < 0.25) continue;
          let u: Mark = { ...m, id: `u-${m.id}`, author: 'user' };
          if (x < 0.45) u = { ...u, direction: u.direction === 'bull' ? 'bear' : 'bull' };
          else if (x < 0.6) u = { ...u, anchors: u.anchors.map((q) => ({ ...q, time: q.time + 5 * H4s })) };
          user.push(u);
        }
        const o = others[Math.floor(rnd() * others.length)];
        if (o) user.push({ ...patternToMark(c4h, o), id: `o${seed}`, meta: { patternType: target }, author: 'user' }); // чужая форма под видом target
        const t = c4h[window.fromIndex + Math.floor(rnd() * 100)]!;
        user.push({ id: `e${seed}`, kind: 'pattern', anchors: [{ time: t.openTime, price: t.close }], scope: null, direction: 'bull', meta: { patternType: target }, author: 'user' });
        // модель другого типа ровно на эталонных свечах: PATTERN_WRONG_TYPE
        const other = PTYPES[(PTYPES.indexOf(target) + 1 + Math.floor(rnd() * 5)) % 6]!;
        const m0 = a.required[Math.floor(rnd() * a.required.length)]!;
        user.push({ ...m0, id: `w${seed}`, meta: { patternType: other }, author: 'user' });
        const res = gradeMarks(user, a, patternGradeContext(c4h, target, window));
        assertFilled(`pa-find/${target}`, 'price-action', res);
      }
    }
  });

  it('PA «Проведи уровень»: все исходы gradeLevel (поддержка/сопротивление, easy/medium/hard)', () => {
    const { levels } = findLevels(c4h);
    const P = c4h[c4h.length - 1]!.close;
    for (const type of ['support', 'resistance'] as const) {
      for (const d of ['easy', 'medium', 'hard'] as const) {
        const prices = [P * 0.9, P * 1.1, ...levels.map((l) => l.center), ...levels.map((l) => l.center * 1.01)];
        for (const price of prices) {
          let g;
          try { g = gradeLevel(c4h, type, price, d); } catch { continue; }
          assertFilled(`pa-level/${type}/${d}`, 'price-action', g);
        }
      }
    }
  });

  it('PA «Контекст»: все ответы gradeContext по реальным моделям', () => {
    const htfSelf = (last: number) => htfClosedAt(c4h, c4h[last]!.closeTime + 1);
    const pool = detectPatterns(c4h).filter((p) => p.direction !== null && ['engulfing', 'pin-bar', 'morning-star', 'evening-star'].includes(p.type) && p.firstIndex >= 1);
    expect(pool.length).toBeGreaterThan(5);
    for (const p of pool) {
      let ref;
      try { ref = computeContext(c4h, p, htfSelf(p.lastIndex)); } catch { continue; }
      for (let seed = 1; seed <= 12; seed++) {
        const rnd = mulberry32(seed * 31 + p.lastIndex);
        const given = { sweep: rnd() < 0.5, orderBlock: rnd() < 0.5, keyLevel: rnd() < 0.5, htfTrend: (['up', 'down', 'range'] as const)[Math.floor(rnd() * 3)]!, significant: rnd() < 0.5 };
        assertFilled('pa-context', 'price-action', gradeContext(ref, given, '1d'));
      }
    }
  });

  it('итог: ни одного неподставленного плейсхолдера и покрыты все коды MS/PA', () => {
    expect(bad).toEqual([]);
    const missing = MS_PA_CODES.filter((c) => !seenAll.has(c));
    expect(missing).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Fibonacci (FIBONACCI.md §11, §13 п.7): все коды FIB_* / EXT_* и OK_FIB_* / OK_PD / OK_EXT_* после подстановки реальных параметров
// golden-участков FG не содержат «{…}».
const FIB_ERROR_CODES: ErrorCode[] = [
  'FIB_WRONG_DIRECTION', 'FIB_NOT_IMPULSE', 'FIB_WRONG_ANCHOR_START', 'FIB_WRONG_ANCHOR_END', 'FIB_IMPULSE_UNCONFIRMED', 'FIB_LEVEL_MISS',
  'FIB_DEEP_MISSED', 'FIB_CONFLUENCE_WRONG', 'FIB_PD_WRONG', 'EXT_WRONG_DIRECTION', 'EXT_WRONG_POINTS', 'EXT_TARGET_MISS', 'EXT_TARGET_CONSERVATIVE',
];
const FIB_OK_CODES = ['OK_FIB_ANCHOR', 'OK_FIB_EQUAL_EXTREME', 'OK_FIB_REACTION', 'OK_FIB_CONFLUENCE', 'OK_PD', 'OK_EXT_POINTS', 'OK_EXT_TARGET'];

describe('шаблоны Fibonacci: нет неподставленных плейсхолдеров (реальные params golden FG)', () => {
  const seenErr = new Set<string>();
  const seenOk = new Set<string>();
  const problems: string[] = [];
  const flatAll = flattenTemplates();

  function check(label: string, r: { verdict: 'correct' | 'partial' | 'incorrect'; score: number; errors: GradeError[]; ok: OkItem[]; skillOutcomes: import('../types').SkillOutcome[] }) {
    const fb = buildFeedback({ module: 'fibonacci', verdict: r.verdict, score: r.score, errors: r.errors, ok: r.ok, skillOutcomes: r.skillOutcomes, tickSize: 0.01 });
    const blocks = [fb.verdict, ...fb.understood, ...fb.mistakes, ...fb.why, ...fb.howTo, fb.principle];
    for (const b of blocks) {
      const tpl = flatAll[b.templateKey];
      if (tpl === undefined) {
        problems.push(`${label}: нет шаблона ${b.templateKey}`);
        continue;
      }
      const text = fillTemplate(tpl, b.params);
      if (/[{}]/.test(text)) problems.push(`${label}:${b.templateKey}: ${text}`);
      if (/undefined|NaN|\[object/.test(text)) problems.push(`${label}:${b.templateKey}: мусор в тексте: ${text}`);
    }
    for (const e of r.errors) seenErr.add(e.code);
    for (const o of r.ok) seenOk.add(o.code);
  }

  const at = (c: import('../types').Candle[], iso: string) => indexAtIso(c, iso + ':00Z');
  const OPTIONS: FibReactionOption[] = ['0.382', '0.5', '0.618', '0.705', '0.786', 'ote', 'deep'];
  const CONF: FibConfluenceKey[][] = [[], ['order-block'], ['fvg'], ['level'], ['order-block', 'fvg', 'level']];
  const TARGETS: FibTarget[] = ['1', '1.272', '1.618', 'none'];

  it('«Построй сетку»: перебор начал и концов вокруг эталона (FG-1, FG-8) и перевёрнутых сеток', () => {
    for (const [id, tf, a, b, dir] of [
      ['FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', 'bull'], ['FG-8', '15m', '2026-08-10T20:30', '2026-08-11T07:15', 'bear'],
    ] as [FibSeriesId, '4h' | '15m', string, string, 'bull' | 'bear'][]) {
      const c = fibCandles(id);
      const bi = at(c, b);
      const ai = at(c, a);
      const T = bi + 15;
      const vis = c.slice(0, T + 1);
      const ref = buildGridRef(vis, { nExt: 5, aTime: c[ai]!.openTime, bTime: c[bi]!.openTime })!;
      const startSide = dir === 'bull' ? 'low' : 'high';
      const endSide = dir === 'bull' ? 'high' : 'low';
      for (let i0 = ai - 12; i0 <= ai + 12; i0 += 1) {
        for (const i1 of [bi - 12, bi - 6, bi - 3, bi, bi + 2, bi + 5, T, ai + 1]) {
          const mk = (x: number, y: number, s0: 'low' | 'high', s1: 'low' | 'high') => ({
            id: 'u', kind: 'fib-retracement' as const, scope: null, direction: null, author: 'user' as const,
            anchors: [{ time: c[x]!.openTime, price: c[x]![s0] }, { time: c[y]!.openTime, price: c[y]![s1] }],
          });
          for (const m of [mk(i0, i1, startSide, endSide), mk(i1, i0, endSide, startSide), mk(i0, i1, endSide, startSide)]) {
            check(`grid/${id}`, gradeFibGrid(ref, { candles: vis, tf }, { kind: 'fib-grid', mark: m }));
          }
        }
      }
    }
  });

  it('«Где реакция?»: все варианты x конфлюэнс x PD на golden-участках (easy/medium/hard)', () => {
    const cases: [FibSeriesId, '4h' | '1h' | '15m', string, string, 'easy' | 'medium' | 'hard'][] = [
      ['FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', 'medium'], ['FG-4', '4h', '2026-09-10T12:00', '2026-09-11T12:00', 'medium'],
      ['FG-4', '4h', '2026-09-09T08:00', '2026-09-10T12:00', 'hard'], ['FG-4', '4h', '2026-09-11T12:00', '2026-09-15T16:00', 'hard'],
      ['FG-3', '1h', '2026-10-02T08:00', '2026-10-02T18:00', 'easy'], ['FG-6', '15m', '2026-07-19T18:00', '2026-07-20T01:00', 'hard'],
      ['FG-7', '15m', '2026-07-16T15:15', '2026-07-16T17:45', 'medium'], ['FG-8', '15m', '2026-08-10T20:30', '2026-08-11T07:15', 'hard'],
    ];
    for (const [id, tf, a, b, d] of cases) {
      const c = fibCandles(id);
      const bi = at(c, b);
      const T = bi + 5;
      const ref = buildReactionRef(c.slice(0, T + 1), c.slice(T + 1), { nExt: 5, tf, evalDifficulty: d, aTime: c[at(c, a)]!.openTime, bTime: c[bi]!.openTime });
      expect(ref, `${id} ${a}`).not.toBeNull();
      for (const option of OPTIONS) for (const conf of CONF) for (const pd of ['premium', 'discount', null] as const) {
        check(`reaction/${id}/${option}`, gradeFibReaction(ref!, { candles: c.slice(0, T + 1), tf }, { kind: 'fib-reaction', option, confluence: option === 'deep' ? [] : conf, pd }));
      }
    }
  });

  it('«Цель по Extension»: все цели x смещения точек x направление (FG-2, FG-3, FG-8, FG-1)', () => {
    const cases: [FibSeriesId, '4h' | '1h' | '15m', string, string, string, string, 'bull' | 'bear'][] = [
      ['FG-1', '4h', '2026-09-06T20:00', '2026-09-08T12:00', '2026-09-09T08:00', '2026-09-09T16:00', 'bear'],
      ['FG-3', '1h', '2026-10-02T08:00', '2026-10-02T18:00', '2026-10-04T23:00', '2026-10-05T04:00', 'bear'],
      ['FG-8', '15m', '2026-08-10T20:30', '2026-08-11T07:15', '2026-08-11T11:00', '2026-08-11T12:15', 'bear'],
      ['FG-1', '4h', '2026-09-20T00:00', '2026-09-21T20:00', '2026-09-24T08:00', '2026-09-27T04:00', 'bull'],
    ];
    for (const [id, tf, a, b, cc, te, dir] of cases) {
      const c = fibCandles(id);
      const T = at(c, te);
      const ref = buildExtensionRef(c.slice(0, T + 1), c.slice(T + 1), { nExt: 5, tf, evalDifficulty: 'hard', aTime: c[at(c, a)]!.openTime, bTime: c[at(c, b)]!.openTime });
      expect(ref, id).not.toBeNull();
      const [ia, ib, ic] = [at(c, a), at(c, b), at(c, cc)];
      const s = dir === 'bull' ? (['low', 'high', 'low'] as const) : (['high', 'low', 'high'] as const);
      const flip = (side: 'low' | 'high') => (side === 'low' ? 'high' : 'low');
      for (const target of TARGETS) for (const dA of [0, 1, 6]) for (const dC of [0, 2, -9]) for (const wrongDir of [false, true]) {
        const pts = [ia + dA, ib, Math.max(0, ic + dC)].map((i, k) => ({ time: c[i]!.openTime, price: c[i]![wrongDir ? flip(s[k]!) : s[k]!] }));
        check(`extension/${id}/${target}`, gradeFibExtension(ref!, { candles: c.slice(0, T + 1), tf }, {
          kind: 'fib-extension', target, mark: { id: 'u', kind: 'fib-extension', scope: null, direction: null, author: 'user', anchors: pts },
        }));
      }
    }
  });

  it('терминал: checkFibMarks (FIB_NOT_IMPULSE, UNCONFIRMED, EXT_WRONG_POINTS)', () => {
    const c = fibCandles('FG-1');
    const k = (iso: string, side: 'low' | 'high') => ({ time: c[at(c, iso)]!.openTime, price: c[at(c, iso)]![side] });
    const m = (kind: 'fib-retracement' | 'fib-extension', ...anchors: { time: number; price: number }[]) => ({ id: 'u' + kind, kind, anchors, scope: null, direction: null, author: 'user' as const });
    const pend = c.slice(0, at(c, '2026-09-21T20:00') + 3);
    for (const [series, marks] of [
      [c.slice(0, at(c, '2026-09-27T04:00') + 1), [m('fib-retracement', k('2026-09-02T08:00', 'low'), k('2026-09-03T20:00', 'high')), m('fib-extension', k('2026-09-20T00:00', 'low'), k('2026-09-21T20:00', 'high'), k('2026-09-22T16:00', 'low'))]],
      [pend, [m('fib-retracement', k('2026-09-20T00:00', 'low'), k('2026-09-21T20:00', 'high'))]],
    ] as const) {
      const r = checkFibMarks(series, '4h', marks);
      check('terminal', { verdict: r.feedback.verdict.templateKey.endsWith('correct') ? 'correct' : 'partial', score: 0.5, errors: r.results.flatMap((x) => x.errors), ok: [], skillOutcomes: [] });
    }
  });

  it('итог: ни одного неподставленного плейсхолдера, покрыты все коды Fibonacci', () => {
    expect(problems).toEqual([]);
    expect(FIB_ERROR_CODES.filter((c) => !seenErr.has(c))).toEqual([]);
    expect(FIB_OK_CODES.filter((c) => !seenOk.has(c))).toEqual([]);
  });
});
