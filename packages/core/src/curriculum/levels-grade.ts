// Ступень 2 «Уровни»: оценка lv-strongest, lv-zone, lv-reaction (CURRICULUM_STAGES.md §3.4-§3.6).
import { inLevelZone, LEVEL_TOLERANCE_PCT } from '../pa/levels';
import type { GradeError, OkCode, SkillOutcome, UtcMs, Verdict, Candle } from '../types';
import type { ZoneChainResult } from './reaction';
import { rankStrength, zoneInfo, zoneShare, type LevelRole, type ZoneCand, type ZoneInfo, type ZoneSet } from './zone';

export const ZONE_EDGE_TOL_K = 0.1;
export const ZONE_EXTRA_HEIGHT_K = 1.0;
export const ROLE_TEXT_RU: Record<string, string> = { support: 'поддержка', resistance: 'сопротивление', inside: 'уровень внутри диапазона' };
export const EDGE_TEXT_RU = { near: 'ближний край', far: 'дальний край', both: 'оба края' } as const;

export interface LevelsRefCtx {
  set: ZoneSet;
  role: LevelRole | null;
  ref: ZoneCand;
  second: ZoneCand | null;
}

interface Graded {
  verdict: Verdict;
  score: number;
  errors: GradeError[];
  ok: { code: OkCode; params?: Record<string, string | number> }[];
  skillOutcomes: SkillOutcome[];
}

const outcome = (skill: 'pa-level' | 'level-zone' | 'level-reaction', correct: boolean): SkillOutcome[] => [{ skill, correct: correct ? 1 : 0, total: 1 }];

/** Попадание цены в уровень: допуск +-0.3% или внутри зоны (§3.4). */
export const hitZone = (u: number, z: ZoneCand): boolean => inLevelZone(u, z.level) || (z.bottom <= u && u <= z.top);

// ------------------------------------------------------------------ lv-strongest

export interface LvStrongestGrade extends Graded {
  detail: { userPrice: number; reference: ZoneInfo; second: ZoneInfo | null; hit: ZoneInfo | null; deviationPct: number; tolerancePct: number };
}

export function gradeLvStrongest(ctx: LevelsRefCtx, u: number): LvStrongestGrade {
  const { set, role, ref, second } = ctx;
  const dev = (Math.abs(u - ref.center) / ref.center) * 100;
  const detail = (hit: ZoneCand | null) => ({
    userPrice: u,
    reference: zoneInfo(ref),
    second: second ? zoneInfo(second) : null,
    hit: hit ? zoneInfo(hit) : null,
    deviationPct: dev,
    tolerancePct: LEVEL_TOLERANCE_PCT,
  });
  const base = (verdict: Verdict, score: number, errors: GradeError[], ok: Graded['ok'], hit: ZoneCand | null): LvStrongestGrade => ({
    verdict,
    score,
    errors,
    ok,
    skillOutcomes: outcome('pa-level', verdict === 'correct'),
    detail: detail(hit),
  });
  if (hitZone(u, ref)) return base('correct', 1, [], [{ code: 'OK_LEVEL', params: { tolPct: LEVEL_TOLERANCE_PCT, devPct: dev } }], ref);
  const others = rankStrength(set.zones.filter((z) => z !== ref), set.P);
  const same = others.find((z) => (role === null ? true : z.role === role) && hitZone(u, z));
  if (same) {
    return base(
      'partial',
      0.5,
      [{ code: 'LEVEL_NOT_STRONGEST', skill: 'pa-level', severity: 'minor', params: { user: u, ref: ref.center, refStrength: ref.strength, userStrength: same.strength, touches: ref.touches } }],
      [],
      same,
    );
  }
  const opp = role === null ? undefined : others.find((z) => z.role !== role && z.role !== 'inside' && hitZone(u, z));
  if (opp) {
    return base(
      'incorrect',
      0,
      [{ code: 'LEVEL_WRONG_TYPE', skill: 'pa-level', severity: 'major', params: { user: u, givenText: ROLE_TEXT_RU[opp.role]!, expectedText: ROLE_TEXT_RU[role!]!, close: set.P } }],
      [],
      opp,
    );
  }
  return base(
    'incorrect',
    0,
    [{ code: 'LEVEL_OFF_TOLERANCE', skill: 'pa-level', severity: 'major', params: { user: u, ref: ref.center, devPct: dev, tolPct: LEVEL_TOLERANCE_PCT, touches: ref.touches, low: ref.bottom, high: ref.top } }],
    [],
    null,
  );
}

// ------------------------------------------------------------------ lv-zone

export type ZoneClassCode = 'OK_ZONE' | 'ZONE_TOO_WIDE' | 'ZONE_EDGE_OFF' | 'LEVEL_NOT_STRONGEST' | 'LEVEL_WRONG_TYPE' | 'ZONE_OFF';

export interface ZoneClassification {
  code: ZoneClassCode;
  /** Сопоставленный уровень: эталон, другой кандидат (LEVEL_NOT_STRONGEST) или противоположной роли. */
  other: ZoneCand | null;
  coversCore: boolean;
  share: number;
}

/** §3.5: класс нарисованной зоны [ub, ut] относительно эталона. */
export function classifyZone(ctx: LevelsRefCtx, ub: number, ut: number): ZoneClassification {
  const { set, role, ref } = ctx;
  const A = set.A;
  const tol = ZONE_EDGE_TOL_K * A;
  const H = ref.top - ref.bottom;
  const covers = ub <= ref.bottom + tol && ut >= ref.top - tol;
  const share = zoneShare(ub, ut, ref);
  if (covers) return { code: ut - ub <= H + ZONE_EXTRA_HEIGHT_K * A ? 'OK_ZONE' : 'ZONE_TOO_WIDE', other: ref, coversCore: true, share };
  if (share >= 0.5) return { code: 'ZONE_EDGE_OFF', other: ref, coversCore: false, share };
  const others = rankStrength(set.zones.filter((z) => z !== ref), set.P);
  const same = others.find((z) => (role === null ? true : z.role === role) && zoneShare(ub, ut, z) >= 0.5);
  if (same) return { code: 'LEVEL_NOT_STRONGEST', other: same, coversCore: false, share };
  const opp = role === null ? undefined : others.find((z) => z.role !== role && z.role !== 'inside' && zoneShare(ub, ut, z) >= 0.5);
  if (opp) return { code: 'LEVEL_WRONG_TYPE', other: opp, coversCore: false, share };
  return { code: 'ZONE_OFF', other: null, coversCore: false, share };
}

export interface LvZoneGrade extends Graded {
  detail: { user: { bottom: number; top: number }; reference: ZoneInfo; coversCore: boolean; sharePct: number; heightAtr: number; maxHeightAtr: number; hit: ZoneInfo | null };
  classification: ZoneClassification;
}

/** Ошибка/успех класса зоны в формате разбора (общая для lv-zone и комбо). */
export function zoneClassBlock(
  cls: ZoneClassification,
  ctx: LevelsRefCtx,
  ub: number,
  ut: number,
): { errors: GradeError[]; ok: Graded['ok'] } {
  const { set, role, ref } = ctx;
  const A = set.A;
  const H = ref.top - ref.bottom;
  const mid = (ub + ut) / 2;
  const sharePct = Math.round(cls.share * 100);
  const mk = (code: Exclude<ZoneClassCode, 'OK_ZONE'>, severity: 'minor' | 'major', params: Record<string, string | number>): GradeError => ({ code, skill: code === 'LEVEL_NOT_STRONGEST' || code === 'LEVEL_WRONG_TYPE' ? 'pa-level' : 'level-zone', severity, params });
  switch (cls.code) {
    case 'OK_ZONE':
      return { errors: [], ok: [{ code: 'OK_ZONE', params: { low: ref.bottom, high: ref.top, touches: ref.touches } }] };
    case 'ZONE_TOO_WIDE':
      return { errors: [mk('ZONE_TOO_WIDE', 'minor', { userLow: ub, userHigh: ut, height: ut - ub, maxHeight: H + ZONE_EXTRA_HEIGHT_K * A, low: ref.bottom, high: ref.top })], ok: [] };
    case 'ZONE_EDGE_OFF': {
      const tol = ZONE_EDGE_TOL_K * A;
      const lowMiss = !(ub <= ref.bottom + tol);
      const topMiss = !(ut >= ref.top - tol);
      const nearIsTop = ref.role === 'support';
      const edge = lowMiss && topMiss ? 'both' : (nearIsTop ? topMiss : lowMiss) ? 'near' : 'far';
      return { errors: [mk('ZONE_EDGE_OFF', 'minor', { userLow: ub, userHigh: ut, edgeText: EDGE_TEXT_RU[edge], low: ref.bottom, high: ref.top, sharePct })], ok: [] };
    }
    case 'LEVEL_NOT_STRONGEST':
      return { errors: [mk('LEVEL_NOT_STRONGEST', 'minor', { user: mid, ref: ref.center, refStrength: ref.strength, userStrength: cls.other!.strength, touches: ref.touches })], ok: [] };
    case 'LEVEL_WRONG_TYPE':
      return { errors: [mk('LEVEL_WRONG_TYPE', 'major', { user: mid, givenText: ROLE_TEXT_RU[cls.other!.role]!, expectedText: ROLE_TEXT_RU[role ?? ref.role]!, close: set.P })], ok: [] };
    default:
      return { errors: [mk('ZONE_OFF', 'major', { userLow: ub, userHigh: ut, low: ref.bottom, high: ref.top, touches: ref.touches })], ok: [] };
  }
}

export function gradeLvZone(ctx: LevelsRefCtx, ub: number, ut: number): LvZoneGrade {
  const cls = classifyZone(ctx, ub, ut);
  const { ref, set } = ctx;
  const H = ref.top - ref.bottom;
  const blk = zoneClassBlock(cls, ctx, ub, ut);
  const verdict: Verdict = cls.code === 'OK_ZONE' ? 'correct' : cls.code === 'LEVEL_WRONG_TYPE' || cls.code === 'ZONE_OFF' ? 'incorrect' : 'partial';
  return {
    verdict,
    score: verdict === 'correct' ? 1 : verdict === 'partial' ? 0.5 : 0,
    errors: blk.errors,
    ok: blk.ok,
    skillOutcomes: outcome('level-zone', verdict === 'correct'),
    classification: cls,
    detail: {
      user: { bottom: ub, top: ut },
      reference: zoneInfo(ref),
      coversCore: cls.coversCore,
      sharePct: Math.round(cls.share * 100),
      heightAtr: (ut - ub) / set.A,
      maxHeightAtr: (H + ZONE_EXTRA_HEIGHT_K * set.A) / set.A,
      hit: cls.other && cls.code !== 'ZONE_OFF' ? zoneInfo(cls.other) : null,
    },
  };
}

// ------------------------------------------------------------------ lv-reaction

export interface ReactionOption {
  id: string;
  zone: ZoneCand;
}

export interface LvReactionGrade extends Graded {
  detail: {
    chosen: string;
    correct: string;
    options: (ZoneInfo & { id: string; status: 'reaction' | 'broken' | 'untouched'; eventTime: UtcMs | null })[];
    extreme: { price: number; time: UtcMs } | null;
  };
}

/** Верный ответ по исходу цепочки: z{k+1} при реакции, `none` при пробое всех зон. */
export const correctReactionId = (chain: Pick<ZoneChainResult, 'kind' | 'k'>): string => (chain.kind === 'reaction' ? `z${chain.k + 1}` : 'none');

export function gradeLvReaction(options: readonly ReactionOption[], chain: ZoneChainResult, candles: readonly Candle[], chosen: string): LvReactionGrade {
  const correct = correctReactionId(chain);
  const ok = chosen === correct;
  const idx = (id: string) => options.findIndex((o) => o.id === id);
  const brokenAt = new Map(chain.broken.map((b) => [b.k, b.index]));
  const optInfo = options.map((o, i) => ({
    ...zoneInfo(o.zone),
    id: o.id,
    status: (chain.kind === 'reaction' && chain.k === i ? 'reaction' : brokenAt.has(i) ? 'broken' : 'untouched') as 'reaction' | 'broken' | 'untouched',
    eventTime: chain.kind === 'reaction' && chain.k === i ? candles[chain.e]!.openTime : brokenAt.has(i) ? candles[brokenAt.get(i)!]!.openTime : null,
  }));
  const rz = chain.kind === 'reaction' ? options[chain.k]!.zone : null;
  const extreme = chain.kind === 'reaction' && chain.mIndex >= 0 ? { price: chain.m, time: candles[chain.mIndex]!.openTime } : null;
  const detail = { chosen, correct, options: optInfo, extreme };
  if (ok) {
    return {
      verdict: 'correct',
      score: 1,
      errors: [],
      ok: rz ? [{ code: 'OK_LEVEL_REACTION', params: { low: rz.bottom, high: rz.top, extreme: chain.m, reactionTime: candles[chain.e]!.openTime } }] : [],
      skillOutcomes: outcome('level-reaction', true),
      detail,
    };
  }
  const errors: GradeError[] = [];
  const fail = (code: GradeError['code'], params: Record<string, string | number>) => errors.push({ code, skill: 'level-reaction', severity: 'major', params });
  const reactionText = rz ? { low: rz.bottom, high: rz.top, extreme: chain.m, reactionTime: candles[chain.e]!.openTime } : null;
  if (chosen === 'none') {
    fail('LEVEL_REACTION_FALSE_NONE', reactionText ?? {});
  } else {
    const j = idx(chosen);
    const g = options[j]!.zone;
    if (brokenAt.has(j)) {
      fail('LEVEL_REACTION_BROKEN', {
        givenLow: g.bottom,
        givenHigh: g.top,
        breakTime: candles[brokenAt.get(j)!]!.openTime,
        close: candles[brokenAt.get(j)!]!.close,
        expectedText: chain.kind === 'reaction' ? 'реакцию дала другая зона' : 'ни одна зона не удержала цену',
      });
    } else {
      fail('LEVEL_REACTION_EARLIER', { givenLow: g.bottom, givenHigh: g.top, ...(reactionText ?? {}) });
    }
  }
  return { verdict: 'incorrect', score: 0, errors, ok: [], skillOutcomes: outcome('level-reaction', false), detail };
}
