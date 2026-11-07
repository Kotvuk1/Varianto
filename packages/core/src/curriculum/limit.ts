// Ступень 3 «Лимитный вход»: оценка лимитного ордера (CURRICULUM_STAGES.md §5.3, §20: исполнение - проход цены на >= 1 тик).
import type { Candle, GradeError, OkCode, SkillOutcome, UtcMs, Verdict } from '../types';
import { resolveZoneReaction, BAND_K, type ZoneReaction } from './reaction';
import {
  FRONT_K_MAX,
  FRONT_K_MIN,
  PLACEMENT_SHARE,
  expectedLimitPrice,
  limitFilled,
  limitTypeOk,
  placementOf,
  type LimitType,
  type PlacementCode,
} from './rubric';
import { farEdge, nearEdge, type Side, type Zone } from './zone';

export interface LimitOrder {
  price: number;
  type: LimitType;
  frontK: number | null;
}

export interface CurPart {
  key: 'placement' | 'type' | 'fill' | 'price' | 'zone' | 'sl' | 'tp' | 'rr';
  score: number;
  max: number;
  code: GradeError['code'] | null;
}

export const LIMIT_TYPE_TEXT_RU: Record<LimitType, string> = {
  'near-edge': 'у ближнего края зоны',
  middle: 'в середине зоны',
  'far-edge': 'у дальнего края зоны',
  'front-run': 'с опережением края зоны',
};

/** Ошибка валидации ответа: `code` - код 400. */
export class CurValidationError extends Error {
  constructor(readonly code: string, message?: string) {
    super(message ?? code);
    this.name = 'CurValidationError';
  }
}

/** Валидация лимитки (§5.2, §11.3): сторона относительно P и согласованность type/frontK. */
export function validateLimitOrder(side: Side, P: number, o: LimitOrder): void {
  if (!Number.isFinite(o.price) || o.price <= 0) throw new CurValidationError('INVALID_TYPE');
  if (side === 'LONG' ? o.price >= P : o.price <= P) throw new CurValidationError('LIMIT_WRONG_SIDE');
  const frontOk = o.frontK !== null && o.frontK >= FRONT_K_MIN && o.frontK <= FRONT_K_MAX;
  if (o.type === 'front-run' ? !frontOk : o.frontK !== null) throw new CurValidationError('LIMIT_TYPE_INVALID');
}

export interface LimitFillInfo {
  /** Индекс свечи исполнения в ряду `c` (null - не исполнилась на (T, e]). */
  fill: number | null;
  /** Исполнение после e в пределах лимита (не засчитывается). */
  late: number | null;
}

export function findFill(c: readonly Candle[], from: number, to: number, side: Side, limit: number, tick: number): number | null {
  for (let j = from; j <= Math.min(to, c.length - 1); j++) if (limitFilled(c[j]!, side, limit, tick)) return j;
  return null;
}

export interface LimitEntryInput {
  side: Side;
  zone: Zone;
  A: number;
  tick: number;
  /** Ряд с будущим; T - индекс последней видимой свечи. */
  candles: readonly Candle[];
  T: number;
  limitCandles: number;
  order: LimitOrder;
  /** Реакция зоны (resolveZoneReaction); генерация гарантирует kind = 'reaction'. */
  reaction: ZoneReaction;
}

export interface LimitEntryDetail {
  limit: LimitOrder;
  depthAtr: number;
  parts: CurPart[];
  quality: number;
  fill: { time: UtcMs; candles: number } | null;
  lateFillTime: UtcMs | null;
  reaction: { t0Time: UtcMs; extreme: number; extremeTime: UtcMs; confirmTime: UtcMs; threshold: number };
  maeAtr: number | null;
  mfeAtr: number | null;
  gapAtr: number | null;
}

export interface LimitEntryGrade {
  verdict: Verdict;
  score: number;
  quality: number;
  parts: CurPart[];
  errors: GradeError[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  skillOutcomes: SkillOutcome[];
  detail: LimitEntryDetail;
  /** Окно проигрывания: индексы в `candles` (T, replayEnd], выход и исполнение. */
  replay: { from: number; to: number; exitIndex: number; fillIndex: number | null };
  verdictParams: { outcomeText: 'filled' | 'missed'; outcomeTime: UtcMs };
}

/** Цена входа q (§5.3): (B - L)/(B - m) для LONG, зеркально для SHORT; B - край зоны подхода. */
export function priceQuality(side: Side, zone: Zone, A: number, L: number, m: number): number {
  const zn = nearEdge(zone, side);
  const long = side === 'LONG';
  const B = long ? zn + BAND_K * A : zn - BAND_K * A;
  const denom = long ? B - m : m - B;
  const num = long ? B - L : L - B;
  if (!(denom > 0)) return num > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, num / denom));
}

/** Просадка/ход в плюс после исполнения (§5.3) в ATR. */
export function fillExcursions(c: readonly Candle[], side: Side, L: number, A: number, f: number, e: number, mfeEnd: number): { mae: number; mfe: number } {
  const long = side === 'LONG';
  let lo = Infinity;
  let hi = -Infinity;
  for (let j = f; j <= Math.min(e, c.length - 1); j++) {
    lo = Math.min(lo, c[j]!.low);
    hi = Math.max(hi, c[j]!.high);
  }
  let hi2 = -Infinity;
  let lo2 = Infinity;
  for (let j = f; j <= Math.min(mfeEnd, c.length - 1); j++) {
    hi2 = Math.max(hi2, c[j]!.high);
    lo2 = Math.min(lo2, c[j]!.low);
  }
  return long ? { mae: (L - lo) / A, mfe: (hi2 - L) / A } : { mae: (hi - L) / A, mfe: (L - lo2) / A };
}

const PLACEMENT_MAJOR: Partial<Record<PlacementCode, true>> = { LIMIT_BEYOND_ZONE: true, LIMIT_FAR_FROM_ZONE: true };

/** Оценка ответа ступени 3, §5.3. */
export function gradeLimitEntry(inp: LimitEntryInput): LimitEntryGrade {
  const { side, zone, A, tick, candles: c, T, limitCandles, order, reaction } = inp;
  const L = order.price;
  const zn = nearEdge(zone, side);
  const errors: GradeError[] = [];
  const ok: LimitEntryGrade['ok'] = [];
  const parts: CurPart[] = [];
  const e = reaction.e;
  const place = placementOf(side, zone, A, L);
  const placementScore = 40 * PLACEMENT_SHARE[place.level];
  parts.push({ key: 'placement', score: placementScore, max: 40, code: place.code });
  const typeText = LIMIT_TYPE_TEXT_RU[order.type];
  if (place.code) {
    const depth = Math.abs(place.depth);
    const params: Record<string, string | number> = { price: L, near: zn, far: farEdge(zone, side), offsetAtr: -place.depth, depthAtr: place.depth };
    void depth;
    errors.push({ code: place.code, skill: 'limit-placement', severity: PLACEMENT_MAJOR[place.code] ? 'major' : 'minor', params });
  }
  const typeOk = limitTypeOk(side, zone, A, L, order.type, order.frontK);
  parts.push({ key: 'type', score: typeOk ? 10 : 0, max: 10, code: typeOk ? null : 'LIMIT_TYPE_MISMATCH' });
  if (!typeOk) {
    errors.push({
      code: 'LIMIT_TYPE_MISMATCH',
      skill: 'limit-placement',
      severity: 'minor',
      params: { price: L, typeText, expected: expectedLimitPrice(side, zone, A, order.type, order.frontK) },
    });
  }

  const f = findFill(c, T + 1, e, side, L, tick);
  const late = f === null ? findFill(c, e + 1, T + limitCandles, side, L, tick) : null;
  const long = side === 'LONG';
  const m = reaction.m;
  parts.push({ key: 'fill', score: f !== null ? 25 : 0, max: 25, code: f !== null ? null : 'LIMIT_NOT_FILLED' });
  const q = f !== null ? priceQuality(side, zone, A, L, m) : 0;
  parts.push({ key: 'price', score: 25 * q, max: 25, code: null });
  const gap = long ? (m - L) / A : (L - m) / A;
  if (f === null) {
    errors.push({
      code: 'LIMIT_NOT_FILLED',
      skill: 'limit-fill',
      severity: 'major',
      params: { price: L, extreme: m, extremeTime: c[reaction.mIndex]!.openTime, gapAtr: gap, reactionTime: c[e]!.openTime },
    });
  }
  const quality = parts.reduce((s, p) => s + p.score, 0);
  const hasMajor = errors.some((x) => x.severity === 'major');
  const verdict: Verdict = quality >= 75 && !hasMajor ? 'correct' : quality >= 50 ? 'partial' : 'incorrect';

  const mfeEnd = Math.min(e + 10, T + limitCandles);
  const ex = f !== null ? fillExcursions(c, side, L, A, f, e, mfeEnd) : null;
  if (place.code === null && typeOk) ok.push({ code: 'OK_LIMIT_PLACEMENT', params: { price: L, typeText } });
  if (f !== null && ex) {
    ok.push({ code: 'OK_LIMIT_FILLED', params: { fillTime: c[f]!.openTime, fillCandles: f - T, maeAtr: ex.mae, mfeAtr: ex.mfe } });
  }
  const skillOutcomes: SkillOutcome[] = [
    { skill: 'limit-placement', correct: placementScore === 40 && typeOk ? 1 : 0, total: 1 },
    { skill: 'limit-fill', correct: f !== null ? 1 : 0, total: 1 },
  ];
  return {
    verdict,
    score: quality / 100,
    quality,
    parts,
    errors,
    ok,
    skillOutcomes,
    detail: {
      limit: order,
      depthAtr: place.depth,
      parts,
      quality,
      fill: f !== null ? { time: c[f]!.openTime, candles: f - T } : null,
      lateFillTime: late !== null ? c[late]!.openTime : null,
      reaction: {
        t0Time: c[reaction.t0]!.openTime,
        extreme: m,
        extremeTime: c[reaction.mIndex]!.openTime,
        confirmTime: c[e]!.openTime,
        threshold: long ? m + 1.5 * A : m - 1.5 * A,
      },
      maeAtr: ex ? ex.mae : null,
      mfeAtr: ex ? ex.mfe : null,
      gapAtr: f === null ? gap : null,
    },
    replay: { from: T + 1, to: mfeEnd, exitIndex: e, fillIndex: f },
    verdictParams: { outcomeText: f !== null ? 'filled' : 'missed', outcomeTime: f !== null ? c[f]!.openTime : c[e]!.openTime },
  };
}

/** Разрешает реакцию зоны ступени 3 по ряду с будущим. */
export function limitReaction(c: readonly Candle[], T: number, zone: Zone, side: Side, A: number, limit: number): ZoneReaction {
  return resolveZoneReaction(c, T, zone, side, A, limit);
}
