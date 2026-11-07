// Property-тест (ELLIOTT.md §16 п.8): ни один шаблон разбора EW_* / OK_EW_* / feedback.verdict.elliott.* после подстановки
// реальных параметров gradeElliott и checkEwMarks не содержит «{…}», undefined, NaN. Разметки мутируются случайно (mulberry32).
import { describe, expect, it } from 'vitest';
import { buildFeedback, fillTemplate, flattenTemplates, skillForError, ERROR_TEMPLATES_RU } from '../feedback';
import { mulberry32 } from '../rng';
import { ewCandles } from '../testing/elliott';
import type { Candle, ErrorCode, Mark } from '../types';
import { gradeElliott } from './grade';
import { checkEwMarks } from './terminal';
import type { ElliottAnswer, EwScenarioId, EwPrimaryScenario } from './types';
import { makeRef, type Pt } from './test-helpers';

const EW_ERRORS = (Object.keys(ERROR_TEMPLATES_RU) as ErrorCode[]).filter((c) => c.startsWith('EW_'));
const EW_OK = ['OK_EW_POINTS', 'OK_EW_RULES', 'OK_EW_GUIDES', 'OK_EW_EXTENDED3', 'OK_EW_CORRECTION', 'OK_EW_INVALIDATION', 'OK_EW_ALT'];
const ALL_ALT: EwScenarioId[] = ['w3-next', 'w5-next', 'abc-next', 'trend-next', 'bc-next', 'correction-extends', 'impulse-extends'];
const PRIMARY: EwPrimaryScenario[] = ['w3-next', 'w5-next', 'abc-next', 'trend-next'];

const flat = flattenTemplates();
const problems: string[] = [];
const seenErr = new Set<string>();
const seenOk = new Set<string>();

function inspect(label: string, fb: ReturnType<typeof buildFeedback>, extra: Record<string, string | number> = {}) {
  const blocks = [fb.verdict, ...fb.understood, ...fb.mistakes, ...fb.why, ...fb.howTo, fb.principle];
  for (const b of blocks) {
    const tpl = flat[b.templateKey];
    if (tpl === undefined) {
      problems.push(`${label}: нет шаблона ${b.templateKey}`);
      continue;
    }
    const text = fillTemplate(tpl, { ...b.params, ...(b.templateKey.startsWith('feedback.verdict.elliott') ? extra : {}) });
    if (/[{}]/.test(text)) problems.push(`${label}:${b.templateKey}: ${text}`);
    if (/undefined|NaN|\[object|Infinity/.test(text)) problems.push(`${label}:${b.templateKey}: мусор: ${text}`);
  }
}

interface Setup {
  c: Candle[];
  tf: '1h' | '4h';
  kind: 'ew-impulse' | 'ew-impulse-correction' | 'ew-scenario';
  imp: Pt[];
  cor: Pt[] | null;
  made: ReturnType<typeof makeRef>;
}
const IMP1: Pt[] = [['2026-08-06T23:00', 'low'], ['2026-08-07T13:00', 'high'], ['2026-08-07T17:00', 'low'], ['2026-08-08T15:00', 'high'], ['2026-08-09T01:00', 'low'], ['2026-08-09T22:00', 'high']];
const sol = ewCandles('EW-1');
const btc3 = ewCandles('EW-3');
const IMP3: Pt[] = [['2026-06-08T15:00', 'high'], ['2026-06-09T00:00', 'low'], ['2026-06-09T05:00', 'high'], ['2026-06-09T16:00', 'low'], ['2026-06-09T20:00', 'high'], ['2026-06-10T09:00', 'low']];
const COR3: Pt[] = [['2026-06-10T15:00', 'high'], ['2026-06-10T22:00', 'low'], ['2026-06-11T11:00', 'high']];
const btc4 = ewCandles('EW-4');
const X: Pt[] = [['2026-08-01T16:00', 'low'], ['2026-08-09T20:00', 'high'], ['2026-08-14T12:00', 'low'], ['2026-08-25T00:00', 'high'], ['2026-08-26T12:00', 'low']];
const setups: Setup[] = [
  { c: sol, tf: '1h', kind: 'ew-impulse', imp: IMP1, cor: null, made: makeRef(sol, '1h', { kind: 'ew-impulse', nPivot: 7, T: '2026-08-10T05:00', windowFrom: '2026-08-06T10:00', dir: 'bull', points: IMP1 }) },
  { c: btc3, tf: '1h', kind: 'ew-impulse-correction', imp: IMP3, cor: COR3, made: makeRef(btc3, '1h', { kind: 'ew-impulse-correction', nPivot: 5, T: '2026-06-11T16:00', windowFrom: '2026-06-08T00:00', dir: 'bear', type: 'zigzag', points: [...IMP3, ...COR3] }) },
  { c: btc4, tf: '4h', kind: 'ew-scenario', imp: X, cor: null, made: makeRef(btc4, '4h', { kind: 'ew-scenario', nPivot: 5, T: '2026-08-27T08:00', windowFrom: 180, dir: 'bull', points: X }) },
];

/** Сдвиг точки на k свечей (в пределах видимого ряда), иногда с заменой стороны. */
function shifted(c: Candle[], visibleLen: number, p: Pt, k: number, flip: boolean): { time: number; price: number } {
  const i = Math.min(visibleLen - 1, Math.max(0, c.findIndex((x) => new Date(x.openTime).toISOString().slice(0, 16) === p[0]) + k));
  const side = flip ? (p[1] === 'low' ? 'high' : 'low') : p[1];
  return { time: c[i]!.openTime, price: c[i]![side] };
}

describe('шаблоны Elliott: нет неподставленных плейсхолдеров', () => {
  it('случайные мутации ответов (gradeElliott): 3 сложности x 500 попыток', () => {
    for (const [si, s] of setups.entries()) {
      const rnd = mulberry32(1000 + si);
      const vLen = s.made.visible.length;
      for (let t = 0; t < 500; t++) {
        const n = rnd() < 0.7 ? s.imp.length : rnd() < 0.5 ? 3 : Math.min(5, s.imp.length);
        const keep = s.imp.slice(0, n);
        const anchors = keep.map((p) => shifted(s.c, vLen, p, rnd() < 0.6 ? 0 : Math.floor(rnd() * 13) - 6, rnd() < 0.08));
        const withCorr = s.cor && n === 6 && rnd() < 0.8;
        const cAnchors = withCorr ? s.cor!.map((p) => shifted(s.c, vLen, p, rnd() < 0.6 ? 0 : Math.floor(rnd() * 9) - 4, rnd() < 0.05)) : null;
        const lastClose = s.made.visible[vLen - 1]!.close;
        const levels = [null, lastClose, lastClose * 1.01, lastClose * 0.99, anchors[0]!.price, anchors[Math.min(1, anchors.length - 1)]!.price, anchors[anchors.length - 1]!.price, s.made.ref.invTol];
        const mk = (kind: Mark['kind'], a: { time: number; price: number }[]): Mark => ({ id: `u${kind}`, kind, anchors: a, scope: null, direction: null, author: 'user' });
        const ans: ElliottAnswer = {
          kind: s.kind,
          impulse: mk('ew-impulse', anchors),
          correction: cAnchors ? mk(rnd() < 0.5 ? 'ew-zigzag' : 'ew-flat', cAnchors) : null,
          primary: rnd() < 0.5 ? (n === 3 ? 'w3-next' : n === 5 ? 'w5-next' : cAnchors ? 'trend-next' : 'abc-next') : PRIMARY[Math.floor(rnd() * 4)]!,
          alternative: rnd() < 0.2 ? null : ALL_ALT[Math.floor(rnd() * 7)]!,
          invalidation: levels[Math.floor(rnd() * levels.length)] ?? null,
        };
        let g;
        try {
          g = gradeElliott(s.made.ref, { candles: s.made.visible, tf: s.tf }, s.made.future, ans, { tickSize: 0.01 });
        } catch (e) {
          if ((e as Error).message === 'EW_ANCHOR_OUT_OF_RANGE') continue;
          throw e;
        }
        for (const e of g.errors) {
          seenErr.add(e.code);
          expect(skillForError(e.code, e.params)).toBe(e.skill);
        }
        for (const o of g.ok) seenOk.add(o.code);
        const fb = buildFeedback({ module: 'elliott', verdict: g.verdict, score: g.score, errors: g.errors, ok: g.ok, skillOutcomes: g.skillOutcomes, tickSize: 0.01, verdictParams: g.verdictParams });
        inspect(`s${si}#${t}`, fb);
        expect(g.score).toBeGreaterThanOrEqual(0);
        expect(g.score).toBeLessThanOrEqual(1);
        for (const so of g.skillOutcomes) {
          expect(so.total).toBeGreaterThanOrEqual(1);
          expect(so.correct).toBeGreaterThanOrEqual(0);
          expect(so.correct).toBeLessThanOrEqual(so.total);
        }
      }
    }
  });

  it('терминал (checkEwMarks): правила и рекомендации без сценария', () => {
    const fb = (ms: Mark[]) => checkEwMarks(btc3.slice(0, btc3.findIndex((x) => new Date(x.openTime).toISOString().startsWith('2026-06-11T16')) + 1), '1h', ms).feedback;
    const at = (t: string, side: 'low' | 'high') => { const x = btc3.find((y) => new Date(y.openTime).toISOString().startsWith(t))!; return { time: x.openTime, price: x[side] }; };
    const imp: Mark = { id: 'i', kind: 'ew-impulse', scope: null, direction: null, author: 'user', anchors: IMP3.map(([t, s]) => at(t, s)) };
    for (const kind of ['ew-zigzag', 'ew-flat'] as const) {
      const cor: Mark = { id: kind, kind, scope: null, direction: null, author: 'user', anchors: COR3.map(([t, s]) => at(t, s)) };
      const f = fb([imp, cor]);
      inspect(`terminal:${kind}`, f);
      for (const e of f.mistakes) if (e.code) seenErr.add(e.code);
      for (const o of f.understood) if (o.code) seenOk.add(o.code);
    }
  });

  it('целевые нарушения правил (реальные свечи): W3 не за W1, W4 в зоне W1, C не за A у zigzag, C коротка у flat', () => {
    const run = (si: number, imp: { time: number; price: number }[], cor: { time: number; price: number }[] | null, kind: Mark['kind'], primary: EwPrimaryScenario) => {
      const s = setups[si]!;
      const mk = (k: Mark['kind'], a: { time: number; price: number }[]): Mark => ({ id: `u${k}`, kind: k, anchors: a, scope: null, direction: null, author: 'user' });
      const g = gradeElliott(s.made.ref, { candles: s.made.visible, tf: s.tf }, s.made.future, {
        kind: s.kind, impulse: mk('ew-impulse', imp), correction: cor ? mk(kind, cor) : null, primary, alternative: 'correction-extends', invalidation: 1,
      });
      for (const e of g.errors) seenErr.add(e.code);
      for (const o of g.ok) seenOk.add(o.code);
      inspect(`targeted:${si}:${kind}`, buildFeedback({ module: 'elliott', verdict: g.verdict, score: g.score, errors: g.errors, ok: g.ok, skillOutcomes: g.skillOutcomes, tickSize: 0.1, verdictParams: g.verdictParams }));
      return g.errors.map((e) => e.code);
    };
    const pt = (c: Candle[], iso: string, side: 'low' | 'high') => { const x = c.find((y) => new Date(y.openTime).toISOString().startsWith(iso))!; return { time: x.openTime, price: x[side] }; };
    // W3 не за W1: точка 3 - первая свеча после точки 2 с high ниже конца wave 1
    const p1 = pt(btc4, '2026-08-09T20', 'high');
    const p2 = pt(btc4, '2026-08-14T12', 'low');
    const after = btc4.find((x) => x.openTime > p2.time + 4 * 4 * 3_600_000 && x.high < p1.price && x.high > p2.price)!;
    const nxt = btc4[btc4.indexOf(after) + 3]!;
    const w3 = run(2, [pt(btc4, '2026-08-01T16', 'low'), p1, p2, { time: after.openTime, price: after.high }, { time: nxt.openTime, price: nxt.low }], null, 'ew-zigzag', 'w5-next');
    expect(w3).toContain('EW_RULE_W3_NOT_BEYOND_W1');
    const w4 = run(2, [pt(btc4, '2026-08-14T12', 'low'), pt(btc4, '2026-08-21T08', 'high'), pt(btc4, '2026-08-23T04', 'low'), pt(btc4, '2026-08-25T00', 'high'), pt(btc4, '2026-08-26T12', 'low')], null, 'ew-zigzag', 'w5-next');
    expect(w4).toContain('EW_RULE_W4_OVERLAP');
    // коррекция с короткой C: C - первая свеча после B, чей high ниже конца A
    const imp3 = IMP3.map(([t, sd]) => pt(btc3, t, sd));
    const A = pt(btc3, '2026-06-10T15', 'high');
    const B = pt(btc3, '2026-06-10T22', 'low');
    const C = btc3.find((x) => x.openTime > B.time && x.high < A.price && x.high > B.price)!;
    const cor = [A, B, { time: C.openTime, price: C.high }];
    expect(run(1, imp3, cor, 'ew-zigzag', 'trend-next')).toContain('EW_ZIGZAG_C_NOT_BEYOND_A');
    expect(run(1, imp3, cor, 'ew-flat', 'trend-next')).toContain('EW_FLAT_C_TOO_SHORT');
  });

  it('итог: ни одного неподставленного плейсхолдера; все коды EW_* и OK_EW_* встретились', () => {
    expect(problems).toEqual([]);
    expect(EW_ERRORS).toHaveLength(20);
    expect(EW_ERRORS.filter((c) => !seenErr.has(c))).toEqual([]);
    expect(EW_OK.filter((c) => !seenOk.has(c))).toEqual([]);
  });
});
