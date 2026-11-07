// Комбинированные модули: рубрики combo-level-trade и combo-smc-entry (CURRICULUM_STAGES.md §8).
import { analyzeStructure } from '../smc/analyze';
import { atr14 } from '../smc/series';
import { resolveLimitTrade, type LimitOutcome, type PendingOrder } from './limit-trade';
import { detectStopHunt, huntBlocks, TARGET_SOURCE_TEXT_RU, type StopHunt } from './stoptake';
import type { FutureProvider } from '../challenge/resolve';
import type { Candle, GradeError, Mark, OkCode, SkillId, SkillOutcome, UtcMs, Verdict } from '../types';
import { classifyZone, zoneClassBlock, type LevelsRefCtx, type ZoneClassCode } from './levels-grade';
import { CurValidationError, LIMIT_TYPE_TEXT_RU, type CurPart, type LimitOrder } from './limit';
import {
  TARGET_STRUCTURE,
  buildTargets,
  expectedLimitPrice,
  limitTypeOk,
  placementOf,
  rrOf,
  slBand,
  slClass,
  structurePoint,
  tpClass,
  type Placement,
  type Target,
  type TargetSet,
} from './rubric';
import { farEdge, zoneInfo, type Side, type Zone, type ZoneInfo } from './zone';

export interface ComboAnswer {
  zone: Mark;
  limit: LimitOrder;
  sl: number;
  tp: number;
}

export interface SmcPoiInfo {
  kind: 'order-block' | 'fvg';
  bottom: number;
  top: number;
  time: UtcMs;
  status: string;
}

/** Интервал [ub, ut] из метки `zone` (2 якоря); ошибка валидации ZONE_MARK_INVALID. */
export function zoneFromMark(m: Mark): { ub: number; ut: number } {
  const a = m.anchors;
  if (m.kind !== 'zone' || a.length !== 2) throw new CurValidationError('ZONE_MARK_INVALID');
  const [p, q] = [a[0]!.price, a[1]!.price];
  if (!Number.isFinite(p) || !Number.isFinite(q) || p === q || p <= 0 || q <= 0) throw new CurValidationError('ZONE_MARK_INVALID');
  return { ub: Math.min(p, q), ut: Math.max(p, q) };
}

/** Сторона зоны относительно P (§8.1): LONG - зона ниже цены. null - зона на цене. */
export function sideOfZone(ub: number, ut: number, P: number): Side | null {
  const mid = (ub + ut) / 2;
  return mid < P ? 'LONG' : mid > P ? 'SHORT' : null;
}

/** Валидация ответа комбо (§8.1, §11.3). Возвращает сторону сделки. */
export function validateCombo(sideGiven: Side | null, P: number, a: ComboAnswer, ub: number, ut: number): Side {
  const zs = sideOfZone(ub, ut, P);
  if (zs === null || (sideGiven !== null && zs !== sideGiven)) throw new CurValidationError('ZONE_SIDE_MISMATCH');
  const side = sideGiven ?? zs;
  if (side === 'LONG' ? a.limit.price >= P : a.limit.price <= P) throw new CurValidationError('LIMIT_WRONG_SIDE');
  const frontOk = a.limit.frontK !== null && a.limit.frontK >= 0.05 && a.limit.frontK <= 0.5;
  if (a.limit.type === 'front-run' ? !frontOk : a.limit.frontK !== null) throw new CurValidationError('LIMIT_TYPE_INVALID');
  if (side === 'LONG' ? a.sl >= a.limit.price : a.sl <= a.limit.price) throw new CurValidationError('SL_WRONG_SIDE');
  if (side === 'LONG' ? a.tp <= a.limit.price : a.tp >= a.limit.price) throw new CurValidationError('TP_WRONG_SIDE');
  return side;
}

const PLACEMENT_COMBO: Record<Placement['level'], number> = { full: 25, mid: 15, low: 6, zero: 0 };

export interface ZonePart {
  score: number;
  max: 20;
  code: GradeError['code'] | null;
  errors: GradeError[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  /** Навык части zone: level-zone / order-block / fvg. */
  skill: SkillId;
}

export interface PlanInput {
  side: Side;
  /** Сопоставленная зона Zu. */
  zone: Zone;
  A: number;
  P: number;
  visible: readonly Candle[];
  answer: ComboAnswer;
  zonePart: ZonePart;
  /** Дополнительная структурная точка (SMC): защищённый уровень тренда, если дальше Pl. */
  altPl?: number | null;
}

export interface ComboScore {
  parts: CurPart[];
  quality: number;
  verdict: Verdict;
  rr: number;
  errors: GradeError[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  skillOutcomes: SkillOutcome[];
  targets: Target[];
  Pl: number;
  slBand: [number, number];
  slFull: boolean;
}

/** Рубрика процесса комбо 0-100: zone 20, placement 25, type 5, sl 20, tp 18, rr 12 (§8.1). */
export function scoreTradePlan(inp: PlanInput): ComboScore {
  const { side, zone, A, answer, zonePart } = inp;
  const L = answer.limit.price;
  const long = side === 'LONG';
  const errors: GradeError[] = [...zonePart.errors];
  const ok = [...zonePart.ok];
  const parts: CurPart[] = [{ key: 'zone', score: zonePart.score, max: 20, code: zonePart.code }];

  const place = placementOf(side, zone, A, L);
  const placementScore = PLACEMENT_COMBO[place.level];
  parts.push({ key: 'placement', score: placementScore, max: 25, code: place.code });
  if (place.code) {
    errors.push({
      code: place.code,
      skill: 'limit-placement',
      severity: place.code === 'LIMIT_BEYOND_ZONE' || place.code === 'LIMIT_FAR_FROM_ZONE' ? 'major' : 'minor',
      params: { price: L, near: long ? zone.top : zone.bottom, far: farEdge(zone, side), offsetAtr: -place.depth, depthAtr: place.depth },
    });
  }
  const typeOk = limitTypeOk(side, zone, A, L, answer.limit.type, answer.limit.frontK);
  parts.push({ key: 'type', score: typeOk ? 5 : 0, max: 5, code: typeOk ? null : 'LIMIT_TYPE_MISMATCH' });
  const typeText = LIMIT_TYPE_TEXT_RU[answer.limit.type];
  if (!typeOk) {
    errors.push({
      code: 'LIMIT_TYPE_MISMATCH',
      skill: 'limit-placement',
      severity: 'minor',
      params: { price: L, typeText, expected: expectedLimitPrice(side, zone, A, answer.limit.type, answer.limit.frontK) },
    });
  }
  if (!place.code && typeOk) ok.push({ code: 'OK_LIMIT_PLACEMENT', params: { price: L, typeText } });

  // sl: Pl = Zf(Zu); для SMC полный балл и в полосе защищённого уровня тренда
  const Pl = structurePoint(side, zone);
  let slc = slClass(side, answer.sl, Pl, A);
  let levelUsed = Pl;
  if (slc !== 'OK_SL_PLACEMENT' && inp.altPl !== undefined && inp.altPl !== null && (long ? inp.altPl < Pl : inp.altPl > Pl)) {
    if (slClass(side, answer.sl, inp.altPl, A) === 'OK_SL_PLACEMENT') {
      slc = 'OK_SL_PLACEMENT';
      levelUsed = inp.altPl;
    }
  }
  const slScore = slc === 'OK_SL_PLACEMENT' ? 20 : slc === 'SL_INSIDE_STRUCTURE' ? 0 : 10;
  parts.push({ key: 'sl', score: slScore, max: 20, code: slc === 'OK_SL_PLACEMENT' ? null : slc });
  if (slc === 'OK_SL_PLACEMENT') ok.push({ code: 'OK_SL_PLACEMENT', params: { level: levelUsed } });
  else {
    errors.push({
      code: slc,
      skill: 'stop-placement',
      severity: slc === 'SL_INSIDE_STRUCTURE' ? 'major' : 'minor',
      params: { sl: answer.sl, level: Pl, bufferAtr: long ? (Pl - answer.sl) / A : (answer.sl - Pl) / A },
    });
  }

  // tp: E = E* = limit, видимый ряд на T
  const set: TargetSet = buildTargets(inp.visible, side, L, L, A, Pl);
  const tc = tpClass(side, answer.tp, set, A);
  const tpScore = tc === null ? 8 : tc.code === 'OK_TP_LEVEL' ? 18 : tc.code === 'TP_NOT_AT_LEVEL' ? 8 : 0;
  parts.push({ key: 'tp', score: tpScore, max: 18, code: tc && tc.code !== 'OK_TP_LEVEL' ? tc.code : null });
  if (tc?.code === 'OK_TP_LEVEL') {
    ok.push({ code: 'OK_TP_LEVEL', params: { tp: answer.tp, target: tc.nearest.price, sourceText: TARGET_SOURCE_TEXT_RU[tc.nearest.source] } });
  } else if (tc) {
    const t = tc.code === 'TP_BEYOND_TARGETS' ? tc.last : tc.nearest;
    errors.push({
      code: tc.code,
      skill: 'take-profit',
      severity: tc.code === 'TP_BEYOND_TARGETS' ? 'major' : 'minor',
      params: { tp: answer.tp, target: t.price, sourceText: TARGET_SOURCE_TEXT_RU[t.source], firstTarget: tc.first.price },
    });
  }

  const rr = rrOf(L, answer.sl, answer.tp);
  const rrScore = rr >= 2 ? 12 : rr >= 1.5 ? 6 : 0;
  parts.push({ key: 'rr', score: rrScore, max: 12, code: rr < 1.5 ? 'RR_TOO_LOW' : null });
  if (rr >= 2) ok.push({ code: 'OK_RR', params: { rr } });
  else if (rr < 1.5) errors.push({ code: 'RR_TOO_LOW', skill: 'risk-reward', severity: 'minor', params: { rr } });

  const quality = parts.reduce((s, p) => s + p.score, 0);
  const verdict: Verdict =
    zonePart.score === 20 && placementScore === 25 && typeOk && slScore === 20 && tpScore === 18 && rrScore >= 6 ? 'correct' : quality >= 50 ? 'partial' : 'incorrect';
  return {
    parts,
    quality,
    verdict,
    rr,
    errors,
    ok,
    skillOutcomes: [
      { skill: zonePart.skill, correct: zonePart.score === 20 ? 1 : 0, total: 1 },
      { skill: 'limit-placement', correct: placementScore === 25 && typeOk ? 1 : 0, total: 1 },
      { skill: 'stop-placement', correct: slScore === 20 ? 1 : 0, total: 1 },
      { skill: 'take-profit', correct: tpScore === 18 ? 1 : 0, total: 1 },
      { skill: 'risk-reward', correct: rrScore >= 6 ? 1 : 0, total: 1 },
    ],
    targets: set.targets,
    Pl: levelUsed,
    slBand: slBand(side, levelUsed, A),
    slFull: slScore === 20,
  };
}

// ------------------------------------------------------------------ combo-level-trade

export interface ComboLevelGrade extends ComboScore {
  side: Side;
  matched: ZoneInfo;
  zone: Zone;
  classification: ZoneClassCode;
}

const ZONE_POINTS: Record<ZoneClassCode, number> = {
  OK_ZONE: 20,
  ZONE_TOO_WIDE: 10,
  ZONE_EDGE_OFF: 10,
  LEVEL_NOT_STRONGEST: 10,
  LEVEL_WRONG_TYPE: 0,
  ZONE_OFF: 0,
};

/** Оценка combo-level-trade (§8.1) без исхода. `sideGiven = null` - hard: сторону задаёт зона. */
export function gradeComboLevel(ctx: LevelsRefCtx, visible: readonly Candle[], answer: ComboAnswer, sideGiven: Side | null): ComboLevelGrade {
  const { ub, ut } = zoneFromMark(answer.zone);
  const side = validateCombo(sideGiven, ctx.set.P, answer, ub, ut);
  const cls = classifyZone(ctx, ub, ut);
  const blk = zoneClassBlock(cls, ctx, ub, ut);
  const matched = cls.code === 'LEVEL_WRONG_TYPE' || cls.code === 'ZONE_OFF' || !cls.other ? ctx.ref : cls.other;
  const zonePart: ZonePart = {
    score: ZONE_POINTS[cls.code],
    max: 20,
    code: cls.code === 'OK_ZONE' ? null : cls.code,
    errors: blk.errors,
    ok: blk.ok,
    skill: 'level-zone',
  };
  const sc = scoreTradePlan({ side, zone: { bottom: matched.bottom, top: matched.top }, A: ctx.set.A, P: ctx.set.P, visible, answer, zonePart });
  return { ...sc, side, matched: zoneInfo(matched), zone: { bottom: matched.bottom, top: matched.top }, classification: cls.code };
}

// ------------------------------------------------------------------ combo-smc-entry

export interface PoiCand extends SmcPoiInfo {
  direction: 'bull' | 'bear';
  /** fresh OB / open FVG. */
  fresh: boolean;
}

export interface SmcContext {
  trend: 'up' | 'down';
  side: Side;
  A: number;
  P: number;
  trendPois: PoiCand[];
  againstPois: PoiCand[];
  /** Fresh POI тренда, ближайшие к цене первыми, с расстоянием до ближнего края в ATR (>= 0). */
  candidates: (PoiCand & { dist: number })[];
  protectedLevel: number | null;
  lastEvent: string;
}

/** Контекст SMC-входа на T (§8.2): тренд внешней структуры N = 5 и POI; null - тренда нет или ATR не определён. */
export function smcContext(visible: readonly Candle[]): SmcContext | null {
  const n = visible.length;
  const A = atr14(visible)[n - 1];
  if (n < 20 || A === null || A === undefined || !(A > 0)) return null;
  const st = analyzeStructure(visible, TARGET_STRUCTURE);
  const ext = st.state.external;
  if (ext.trend === 'none') return null;
  const P = visible[n - 1]!.close;
  const side: Side = ext.trend === 'up' ? 'LONG' : 'SHORT';
  const dir = ext.trend === 'up' ? 'bull' : 'bear';
  const pois: PoiCand[] = [];
  for (const o of st.orderBlocks) {
    pois.push({ kind: 'order-block', bottom: o.bottom, top: o.top, time: o.time, status: !o.valid ? 'no-displacement' : o.status, direction: o.direction, fresh: o.valid && o.status === 'fresh' });
  }
  for (const f of st.fvgs) {
    pois.push({ kind: 'fvg', bottom: f.bottom, top: f.top, time: f.middleTime, status: f.status, direction: f.direction, fresh: f.status === 'open' });
  }
  const trendPois = pois.filter((p) => p.direction === dir);
  const againstPois = pois.filter((p) => p.direction !== dir);
  const dist = (p: PoiCand) => (side === 'LONG' ? (P - p.top) / A : (p.bottom - P) / A);
  const candidates = trendPois
    .filter((p) => p.fresh)
    .map((p) => ({ ...p, dist: dist(p) }))
    .filter((p) => p.dist >= 0)
    .sort((a, b) => a.dist - b.dist || b.time - a.time);
  const e = ext.lastEvent;
  return {
    trend: ext.trend,
    side,
    A,
    P,
    trendPois,
    againstPois,
    candidates,
    protectedLevel: (ext.trend === 'up' ? ext.refLow : ext.refHigh)?.price ?? null,
    lastEvent: e ? `${e.kind === 'bos' ? 'BOS' : 'CHoCH'} ${e.direction}` : 'нет',
  };
}

const iouInterval = (a0: number, a1: number, b0: number, b1: number): number => {
  const inter = Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  const union = Math.max(a1, b1) - Math.min(a0, b0);
  return union > 0 ? inter / union : 0;
};

export const KIND_TEXT_RU: Record<SmcPoiInfo['kind'], string> = { 'order-block': 'Order Block', fvg: 'FVG' };
export const POI_STATUS_TEXT_RU: Record<string, string> = {
  mitigated: 'отработан (цена возвращалась в зону)',
  invalidated: 'инвалидирован закрытием за зоной',
  'no-displacement': 'без displacement',
  partial: 'частично заполнен',
  filled: 'заполнен',
};

export interface ComboSmcGrade extends ComboScore {
  side: Side;
  matched: SmcPoiInfo;
  zone: Zone;
  poiCode: 'OK_POI' | 'POI_NOT_FRESH' | 'TRADE_AGAINST_STRUCTURE' | 'POI_OFF';
}

/** Оценка combo-smc-entry (§8.2) без исхода. Сторона сделки - направление тренда. */
export function gradeComboSmc(ctx: SmcContext, visible: readonly Candle[], answer: ComboAnswer): ComboSmcGrade {
  const { ub, ut } = zoneFromMark(answer.zone);
  const side = validateCombo(ctx.side, ctx.P, answer, ub, ut);
  const match = (list: readonly PoiCand[]) => list.find((p) => iouInterval(ub, ut, p.bottom, p.top) >= 0.5) ?? null;
  const fresh = match(ctx.trendPois.filter((p) => p.fresh));
  const against = fresh ? null : match(ctx.againstPois);
  const stale = fresh || against ? null : match(ctx.trendPois.filter((p) => !p.fresh));
  const nearest = ctx.candidates[0] ?? ctx.trendPois[0];
  if (!nearest) throw new Error('NO_POI');
  const errors: GradeError[] = [];
  const ok: ZonePart['ok'] = [];
  let score = 0;
  let poiCode: ComboSmcGrade['poiCode'] = 'POI_OFF';
  let matched: PoiCand = nearest;
  if (fresh) {
    score = 20;
    poiCode = 'OK_POI';
    matched = fresh;
    ok.push({ code: 'OK_POI', params: { kindText: KIND_TEXT_RU[fresh.kind], low: fresh.bottom, high: fresh.top } });
  } else if (against) {
    poiCode = 'TRADE_AGAINST_STRUCTURE';
    errors.push({
      code: 'TRADE_AGAINST_STRUCTURE',
      skill: 'challenge-entry',
      severity: 'major',
      params: { side: ctx.side === 'LONG' ? 'SHORT' : 'LONG', trendTf: ctx.trend, lastEvent: ctx.lastEvent, level: ctx.protectedLevel ?? 'нет' },
    });
  } else if (stale) {
    score = 8;
    poiCode = 'POI_NOT_FRESH';
    matched = stale;
    errors.push({
      code: 'POI_NOT_FRESH',
      skill: stale.kind,
      severity: 'minor',
      params: { kindText: KIND_TEXT_RU[stale.kind], low: stale.bottom, high: stale.top, statusText: POI_STATUS_TEXT_RU[stale.status] ?? stale.status },
    });
  } else {
    errors.push({
      code: 'POI_OFF',
      skill: nearest.kind,
      severity: 'major',
      params: { userLow: ub, userHigh: ut, kindText: KIND_TEXT_RU[nearest.kind], low: nearest.bottom, high: nearest.top },
    });
  }
  const zonePart: ZonePart = { score, max: 20, code: poiCode === 'OK_POI' ? null : poiCode, errors, ok, skill: matched.kind };
  const sc = scoreTradePlan({
    side,
    zone: { bottom: matched.bottom, top: matched.top },
    A: ctx.A,
    P: ctx.P,
    visible,
    answer,
    zonePart,
    altPl: ctx.protectedLevel,
  });
  return {
    ...sc,
    side,
    matched: { kind: matched.kind, bottom: matched.bottom, top: matched.top, time: matched.time, status: matched.status },
    zone: { bottom: matched.bottom, top: matched.top },
    poiCode,
  };
}

// ------------------------------------------------------------------ исход

export interface ComboPlay {
  outcome: LimitOutcome;
  hunt: StopHunt;
  blocks: { errors: GradeError[]; ok: ComboScore['ok'] };
}

/** Проигрывание ордера через resolveLimitTrade, stop hunt и его блоки (§7, §8.1: исход в оценку не входит). */
export async function playCombo(
  sc: Pick<ComboScore, 'slFull' | 'Pl'>,
  order: Omit<PendingOrder, 'limit' | 'sl' | 'tp'>,
  answer: ComboAnswer,
  provider: FutureProvider,
): Promise<ComboPlay> {
  const outcome = await resolveLimitTrade({ ...order, limit: answer.limit.price, sl: answer.sl, tp: answer.tp }, provider);
  let hunt: StopHunt = { hunted: false, candle: null };
  if (outcome.kind === 'sl') {
    const future = (await provider.candles(order.tf, order.T, order.limitCandles)).filter((c) => c.closed && c.openTime >= order.T).slice(0, order.limitCandles);
    hunt = detectStopHunt(order.side, answer.sl, answer.tp, outcome, future);
  }
  const blocks = huntBlocks(order.side, answer.sl, sc.slFull, hunt, { Pl: sc.Pl, A: order.A });
  return { outcome, hunt, blocks };
}
