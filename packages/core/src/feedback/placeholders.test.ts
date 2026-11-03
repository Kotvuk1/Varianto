import { describe, expect, it } from 'vitest';
import { analyzeStructure } from '../smc/analyze';
import { buildAlgoMarkSet } from '../smc/marks';
import { gradeMarks } from '../grading/grade';
import { mulberry32 } from '../rng';
import { readKlines } from '../testing/klines';
import { ERROR_TEMPLATES_RU, fillTemplate, OK_TEMPLATES_RU } from './templates.ru';
import { buildFeedback } from './build';
import type { ErrorCode, Mark, SkillId, StructureParams } from '../types';

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
      for (const b of fb.understood) expect(fillTemplate(OK_TEMPLATES_RU[b.code as keyof typeof OK_TEMPLATES_RU], b.params)).not.toMatch(/\{\w*\}/);
    }
    expect([...missing].sort()).toEqual([]);
    expect(seen.size).toBeGreaterThan(12);
  });
});
