import { describe, expect, it } from 'vitest';
import { buildFeedback } from '../feedback/build';
import { ERROR_TEMPLATES_RU, fillTemplate, flattenTemplates, OK_TEMPLATES_RU, CUR_OUTCOME_TEXT_RU } from '../feedback/templates.ru';
import { formatFeedbackParams } from '../feedback/format';
import { mulberry32 } from '../rng';
import { candleProvider } from '../testing/provider';
import { btc1h, btc4h, visibleAt } from '../testing/cur';
import type { ErrorCode, Mark, ModuleId, OkCode, SkillOutcome, Verdict } from '../types';
import { gradeComboLevel, gradeComboSmc, playCombo, smcContext } from './combo';
import { htfClosedBefore, levelsContext, reactionOptions } from './generate';
import { gradeLvReaction, gradeLvStrongest, gradeLvZone } from './levels-grade';
import { gradeLimitEntry, type LimitOrder } from './limit';
import { resolveZoneChain, resolveZoneReaction } from './reaction';
import { limitFilled } from './rubric';
import { buildStopTakeRef, huntBlocks, playStopTake, scoreStopTake } from './stoptake';
import { gradeSwTrend, swingTrend, SW_TREND_OPTIONS } from './swings';
import { computeZones } from './zone';
import { readKlines } from '../testing/klines';

// Property-тест: каждый новый код ошибки и OK после подстановки реальных params не содержит «{…}» ни в одной части,
// включая вердикт; params приведены к строкам форматером UI (formatFeedbackParams).
const h1 = btc1h();
const h4 = btc4h();
const flat = flattenTemplates();
const seenErr = new Set<string>();
const seenOk = new Set<string>();
const bad: string[] = [];

interface Res {
  verdict: Verdict;
  score: number;
  errors: import('../types').GradeError[];
  ok?: { code: OkCode; params?: Record<string, string | number> }[];
  skillOutcomes: SkillOutcome[];
}
function check(mode: string, module: ModuleId, res: Res, verdictParams?: Record<string, string | number>, taskKind?: string): void {
  const fb = buildFeedback({ module, verdict: res.verdict, score: res.score, errors: res.errors, ...(res.ok ? { ok: res.ok } : {}), skillOutcomes: res.skillOutcomes, tickSize: 0.1, ...(verdictParams ? { verdictParams } : {}), ...(taskKind ? { taskKind } : {}) });
  for (const b of [fb.verdict, ...fb.understood, ...fb.mistakes, ...fb.why, ...fb.howTo, fb.principle]) {
    const tpl = flat[b.templateKey];
    if (tpl === undefined) {
      bad.push(`${mode}: нет шаблона ${b.templateKey}`);
      continue;
    }
    const text = fillTemplate(tpl, formatFeedbackParams(b.params, { tickSize: 0.1 }));
    if (/[{}]/.test(text)) bad.push(`${mode}:${b.templateKey}: ${text}`);
    if (/\bundefined\b|NaN|Infinity/.test(text)) bad.push(`${mode}:${b.templateKey}: ${text}`);
  }
  for (const e of res.errors) seenErr.add(e.code);
  for (const o of res.ok ?? []) seenOk.add(o.code);
}

const lim = (price: number, type: LimitOrder['type'], frontK: number | null = null): LimitOrder => ({ price, type, frontK });
const zm = (a: number, b: number): Mark => ({ id: 'z', kind: 'zone', anchors: [{ time: 0, price: a }, { time: 0, price: b }], scope: null, direction: null, author: 'user' });
const verdictParamsOf = (o: { kind: string } & Record<string, unknown>): Record<string, number | string> => {
  const key = o.kind as keyof typeof CUR_OUTCOME_TEXT_RU;
  const t = (o['exitTime'] ?? o['time'] ?? 0) as number;
  return { outcomeText: CUR_OUTCOME_TEXT_RU[key], outcomeTime: t, r: (o['rMultiple'] as number) ?? 0 };
};

describe('шаблоны курса: нет неподставленных плейсхолдеров', () => {
  it('sw-trend: все неверные ответы на реальных окнах', () => {
    const c4 = readKlines('klines/BTCUSDT/4h/BTCUSDT-4h-2026-09.csv');
    for (const n of [5, 7]) {
      const r = swingTrend(c4, n)!;
      for (const chosen of SW_TREND_OPTIONS) check(`sw-trend/${n}`, 'stage-swings', gradeSwTrend(r, chosen), undefined, 'sw-trend');
    }
  });

  it('lv-strongest / lv-zone / lv-reaction: ответы по всем классам', () => {
    for (const iso of ['2026-09-12T00:00:00Z', '2026-09-16T12:00:00Z']) {
      const v = visibleAt(h1, iso);
      const htf = htfClosedBefore(h4, v.T, 500);
      for (const role of ['resistance', 'support', null] as const) {
        const ctx = levelsContext(v.visible, htf, role, 'medium');
        if (!ctx) continue;
        const prices = [ctx.ref.center, ...ctx.set.zones.map((z) => z.center), ctx.set.P * 1.1, ctx.set.P * 0.9];
        for (const p of prices) check('lv-strongest', 'levels', gradeLvStrongest(ctx, p));
        const rnd = mulberry32(7);
        const ranges: [number, number][] = [[ctx.ref.bottom, ctx.ref.top], [ctx.ref.bottom - 600, ctx.ref.top + 600], [ctx.ref.bottom + ctx.set.A * 0.3, ctx.ref.top], [ctx.ref.bottom, ctx.ref.top - ctx.set.A * 0.3], [ctx.ref.bottom + ctx.set.A * 0.3, ctx.ref.top - ctx.set.A * 0.3], [ctx.set.P * 1.2, ctx.set.P * 1.21]];
        for (const z of ctx.set.zones) ranges.push([z.bottom, z.top]);
        for (let i = 0; i < 20; i++) {
          const a = ctx.set.P * (0.9 + rnd() * 0.2);
          ranges.push([a, a + ctx.set.A * rnd() * 2]);
        }
        for (const [a, b] of ranges) check('lv-zone', 'levels', gradeLvZone(ctx, a, b));
      }
    }
    for (const [iso, side] of [['2026-09-12T00:00:00Z', 'SHORT'], ['2026-09-09T12:00:00Z', 'LONG'], ['2026-09-16T00:00:00Z', 'SHORT']] as const) {
      const v = visibleAt(h1, iso);
      const set = computeZones(v.visible, htfClosedBefore(h4, v.T, 500))!;
      const options = reactionOptions(set, side, 'hard');
      const chain = resolveZoneChain(h1, v.iT, options.map((o) => o.zone), side, set.A, 72);
      for (const id of ['z1', 'z2', 'z3', 'none']) check('lv-reaction', 'levels', gradeLvReaction(options, chain, h1, id));
    }
  });

  it('limit-entry: случайные лимитные ордера на реальных реакциях', () => {
    const cases = [
      ['2026-09-12T00:00:00Z', 'SHORT', 79384.4, 79737.3],
      ['2026-09-16T12:00:00Z', 'SHORT', 77291.2, 77469.3],
      ['2026-09-09T12:00:00Z', 'LONG', 78133, 78314.9],
    ] as const;
    const types: LimitOrder['type'][] = ['near-edge', 'middle', 'far-edge', 'front-run'];
    for (const [iso, side, b, t] of cases) {
      const v = visibleAt(h1, iso);
      const set = computeZones(v.visible, htfClosedBefore(h4, v.T, 500))!;
      const zone = set.zones.find((z) => z.bottom === b && z.top === t)!;
      const reaction = resolveZoneReaction(h1, v.iT, zone, side, set.A, 72);
      const rnd = mulberry32(11);
      for (let i = 0; i < 80; i++) {
        const type = types[Math.floor(rnd() * 4)]!;
        const price = (side === 'LONG' ? b + (t - b) / 2 : b + (t - b) / 2) + (rnd() - 0.5) * set.A * 3;
        const g = gradeLimitEntry({ side, zone, A: set.A, tick: 0.1, candles: h1, T: v.iT, limitCandles: 72, order: lim(price, type, type === 'front-run' ? 0.05 + rnd() * 0.45 : null), reaction });
        check('limit-entry', 'limit-entry', { ...g, ok: g.ok }, g.verdictParams as never);
      }
    }
  });

  it('stop-take: случайные SL/TP, исходы и блоки stop hunt', async () => {
    const cases = [
      ['2026-09-12T00:00:00Z', 'SHORT', 79384.4, 79737.3],
      ['2026-09-26T00:00:00Z', 'SHORT', 84855, 85080],
      ['2026-09-15T00:00:00Z', 'LONG', 77208, 77427.4],
    ] as const;
    const p = candleProvider({ '1h': h1 });
    for (const [iso, side, b, t] of cases) {
      const v = visibleAt(h1, iso);
      const set = computeZones(v.visible, htfClosedBefore(h4, v.T, 500))!;
      const zone = set.zones.find((z) => z.bottom === b && z.top === t)!;
      const E = side === 'LONG' ? t : b;
      let f = -1;
      for (let j = v.iT + 1; j <= v.iT + 72; j++) if (limitFilled(h1[j]!, side, E, 0.1)) { f = j; break; }
      const ref = buildStopTakeRef(h1.slice(f - 499, f + 1), side, zone, E)!;
      const rnd = mulberry32(5);
      const dir = side === 'LONG' ? 1 : -1;
      for (let i = 0; i < 60; i++) {
        const sl = ref.Pl - dir * ref.A * (-0.6 + rnd() * 2.6);
        const tp = ref.Estar + dir * ref.A * (0.2 + rnd() * 6);
        if (side === 'LONG' ? sl >= Math.min(E, ref.closeF) : sl <= Math.max(E, ref.closeF)) continue;
        const sc = scoreStopTake(ref, sl, tp);
        const play = await playStopTake(ref, sl, tp, h1[f]!.closeTime + 1, '1h', 72, p);
        const blk = huntBlocks(side, sl, sc.slFull, play.hunt, ref);
        check('stop-take', 'stop-take', { ...sc, score: sc.quality / 100, errors: [...sc.errors, ...blk.errors], ok: [...sc.ok, ...blk.ok] }, verdictParamsOf({ kind: play.outcome.result, ...play.outcome }) as never);
      }
      // принудительный вынос ST-2: стоп по правилам (OK_STOP_HUNT_RULES) и без запаса (STOP_HUNTED)
      if (iso.startsWith('2026-09-26')) {
        for (const sl of [85142, 85100]) {
          const sc = scoreStopTake(ref, sl, 84160);
          const play = await playStopTake(ref, sl, 84160, h1[f]!.closeTime + 1, '1h', 72, p);
          const bl = huntBlocks(side, sl, sc.slFull, play.hunt, ref);
          check('stop-take/hunt', 'stop-take', { ...sc, score: sc.quality / 100, errors: [...sc.errors, ...bl.errors], ok: [...sc.ok, ...bl.ok] }, verdictParamsOf({ kind: 'sl', ...play.outcome }) as never);
        }
      }
    }
  });

  it('combo-level-trade и combo-smc-entry: случайные ответы и исходы', async () => {
    const rnd = mulberry32(3);
    const provider1 = candleProvider({ '1h': h1 });
    for (const [iso, side, role] of [['2026-09-12T00:00:00Z', 'SHORT', 'resistance'], ['2026-09-15T00:00:00Z', 'LONG', 'support'], ['2026-09-16T12:00:00Z', 'SHORT', 'resistance']] as const) {
      const v = visibleAt(h1, iso);
      const htf = htfClosedBefore(h4, v.T, 500);
      const ctx = levelsContext(v.visible, htf, role, 'medium')!;
      const set = ctx.set;
      const dir = side === 'LONG' ? 1 : -1;
      for (let i = 0; i < 40; i++) {
        const z = ctx.ref;
        const ub = z.bottom + (rnd() - 0.4) * set.A * 1.5;
        const ut = z.top + (rnd() - 0.4) * set.A * 1.5;
        const price = (side === 'LONG' ? z.top : z.bottom) - dir * (rnd() - 0.7) * set.A;
        const types: LimitOrder['type'][] = ['near-edge', 'middle', 'far-edge', 'front-run'];
        const type = types[Math.floor(rnd() * 4)]!;
        const sl = (side === 'LONG' ? z.bottom : z.top) - dir * (rnd() * 1.8 - 0.2) * set.A;
        const tp = price + dir * (0.3 + rnd() * 6) * set.A;
        const answer = { zone: zm(Math.min(ub, ut) - 1, Math.max(ub, ut) + 1), limit: lim(price, type, type === 'front-run' ? 0.2 : null), sl, tp };
        let g;
        try {
          g = gradeComboLevel(ctx, v.visible, answer, side);
        } catch {
          continue;
        }
        const play = await playCombo(g, { side, T: v.T, tf: '1h', limitCandles: 72, zone: { near: side === 'LONG' ? g.zone.top : g.zone.bottom, far: side === 'LONG' ? g.zone.bottom : g.zone.top }, A: set.A, P: set.P, tick: 0.1 }, answer, provider1);
        const o = play.outcome as unknown as { kind: string } & Record<string, unknown>;
        check('combo-level-trade', 'combo-level-trade', { ...g, score: g.quality / 100, errors: [...g.errors, ...play.blocks.errors], ok: [...g.ok, ...play.blocks.ok] }, verdictParamsOf(o) as never);
      }
    }
    const v4 = visibleAt(h4, '2026-10-06T00:00:00Z');
    const c = smcContext(v4.visible)!;
    const pois = [...c.trendPois, ...c.againstPois].filter((p) => p.top < c.P);
    for (const p of pois) {
      for (const slMul of [0.1, 0.5, 3]) {
        const answer = { zone: zm(p.bottom, p.top), limit: lim(p.top, 'near-edge'), sl: p.bottom - slMul * c.A, tp: p.top + 3 * c.A };
        const g = gradeComboSmc(c, v4.visible, answer);
        const play = await playCombo(g, { side: c.side, T: v4.T, tf: '4h', limitCandles: 60, zone: { near: g.zone.top, far: g.zone.bottom }, A: c.A, P: c.P, tick: 0.1 }, answer, candleProvider({ '4h': h4 }));
        check('combo-smc-entry', 'combo-smc-entry', { ...g, score: g.quality / 100, errors: [...g.errors, ...play.blocks.errors], ok: [...g.ok, ...play.blocks.ok] }, verdictParamsOf(play.outcome as never) as never);
      }
    }
    const off = gradeComboSmc(c, v4.visible, { zone: zm(83000, 83500), limit: lim(83500, 'near-edge'), sl: 82500, tp: 85000 });
    check('combo-smc-entry/off', 'combo-smc-entry', { ...off, score: off.quality / 100 }, { outcomeText: CUR_OUTCOME_TEXT_RU['not-filled'], outcomeTime: 0, r: 0 });
  });

  it('итог: ни одного неподставленного плейсхолдера, покрыты все новые коды', () => {
    expect(bad).toEqual([]);
    const NEW_ERR: ErrorCode[] = [
      'SWING_TREND_WRONG', 'ZONE_TOO_WIDE', 'ZONE_EDGE_OFF', 'ZONE_OFF', 'LEVEL_NOT_STRONGEST', 'LEVEL_WRONG_TYPE', 'LEVEL_OFF_TOLERANCE',
      'LEVEL_REACTION_BROKEN', 'LEVEL_REACTION_EARLIER', 'LEVEL_REACTION_FALSE_NONE',
      'LIMIT_FAR_FROM_ZONE', 'LIMIT_FRONT_TOO_FAR', 'LIMIT_DEEP_IN_ZONE', 'LIMIT_AT_FAR_EDGE', 'LIMIT_BEYOND_ZONE', 'LIMIT_TYPE_MISMATCH', 'LIMIT_NOT_FILLED',
      'SL_NO_BUFFER', 'SL_INSIDE_STRUCTURE', 'SL_TOO_WIDE', 'TP_NOT_AT_LEVEL', 'TP_BEYOND_TARGETS', 'RR_TOO_LOW', 'STOP_HUNTED', 'POI_OFF', 'POI_NOT_FRESH', 'TRADE_AGAINST_STRUCTURE',
    ];
    expect(NEW_ERR.filter((c) => !seenErr.has(c))).toEqual([]);
    const NEW_OK: OkCode[] = ['OK_SWING_TREND', 'OK_ZONE', 'OK_LEVEL_REACTION', 'OK_LIMIT_PLACEMENT', 'OK_LIMIT_FILLED', 'OK_TP_LEVEL', 'OK_STOP_HUNT_RULES', 'OK_POI', 'OK_LEVEL', 'OK_SL_PLACEMENT', 'OK_RR'];
    expect(NEW_OK.filter((c) => !seenOk.has(c))).toEqual([]);
    for (const c of NEW_ERR) expect(ERROR_TEMPLATES_RU[c]).toBeDefined();
    for (const c of NEW_OK) expect(OK_TEMPLATES_RU[c]).toBeDefined();
  });
});
