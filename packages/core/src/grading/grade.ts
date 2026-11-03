// gradeMarks (ALGORITHMS §12): сопоставление разметки пользователя с эталоном. Чистая детерминированная функция.
import { TIMEFRAME_MS } from '../types';
import type {
  AlgoMarkSet,
  ErrorCode,
  GradeContext,
  GradeError,
  Mark,
  MarkGradeResult,
  SkillId,
  SkillOutcome,
  Verdict,
} from '../types';
import { candleIndexAt, inferTimeframe } from '../smc/series';

type Group =
  | 'SWING_H'
  | 'SWING_L'
  | 'LABEL_H'
  | 'LABEL_L'
  | 'BREAK'
  | 'SWEEP'
  | 'OB'
  | 'FVG'
  | `PATTERN:${string}`;

interface Entry {
  mark: Mark;
  group: Group;
  /** Границы ключевой свечи (для pattern — интервал, иначе lo == hi). */
  lo: number;
  hi: number;
  skill: SkillId;
}

const STRUCTURAL_GROUPS = new Set<Group>(['SWING_H', 'SWING_L', 'LABEL_H', 'LABEL_L', 'BREAK']);
const MAJOR = new Set<ErrorCode>([
  'SWING_MISSED',
  'BOS_MISSING',
  'CHOCH_MISSING',
  'SWEEP_MISSED',
  'OB_MISSED',
  'FVG_MISSED',
  'PATTERN_MISSED',
  'STRUCTURE_LABEL_MISSED',
  'BOS_WICK_ONLY',
  'SWEEP_IS_BREAK',
  'BOS_CHOCH_CONFUSED',
  'BOS_WRONG_DIRECTION',
  'CHOCH_WRONG_DIRECTION',
  'MARK_WRONG_DIRECTION',
  'PATTERN_WRONG_DIRECTION',
  'BOS_EXTRA',
  'CHOCH_EXTRA',
]);

const patternSkill = (t: string): SkillId =>
  (t === 'morning-star' || t === 'evening-star' ? 'pa-star' : `pa-${t}`) as SkillId;

function groupOf(m: Mark): Group | null {
  switch (m.kind) {
    case 'swing-high':
      return 'SWING_H';
    case 'swing-low':
      return 'SWING_L';
    case 'hh':
    case 'lh':
      return 'LABEL_H';
    case 'hl':
    case 'll':
      return 'LABEL_L';
    case 'bos':
    case 'choch':
      return 'BREAK';
    case 'sweep':
      return 'SWEEP';
    case 'order-block':
      return 'OB';
    case 'fvg':
      return 'FVG';
    case 'pattern': {
      const t = m.meta?.['patternType'];
      return typeof t === 'string' ? `PATTERN:${t}` : null;
    }
    default:
      return null;
  }
}

function skillOf(m: Mark, group: Group): SkillId {
  switch (group) {
    case 'SWING_H':
    case 'SWING_L':
      return 'swing';
    case 'LABEL_H':
    case 'LABEL_L':
      return 'structure-labels';
    case 'BREAK':
      return m.kind === 'bos' ? 'bos' : 'choch';
    case 'SWEEP':
      return 'sweep';
    case 'OB':
      return 'order-block';
    case 'FVG':
      return 'fvg';
    default:
      return patternSkill(group.slice('PATTERN:'.length));
  }
}

/** Понятия, при которых группа оценивается. */
function groupEvaluated(group: Group, concepts: readonly SkillId[], m: Mark): boolean {
  switch (group) {
    case 'BREAK':
      return concepts.includes('bos') || concepts.includes('choch');
    default:
      return concepts.includes(skillOf(m, group));
  }
}

const sev = (code: ErrorCode): 'minor' | 'major' => (MAJOR.has(code) ? 'major' : 'minor');

interface Penalty {
  code: ErrorCode;
  cost: number;
  skill: SkillId;
  params: Record<string, string | number>;
  /** true — ошибка scope (для internal-external). */
  scope?: boolean;
}

const priceRange = (m: Mark): [number, number] => {
  const ps = m.anchors.map((a) => a.price);
  return [Math.min(...ps), Math.max(...ps)];
};
function iou(a: Mark, b: Mark): number {
  const [l1, h1] = priceRange(a);
  const [l2, h2] = priceRange(b);
  const inter = Math.max(0, Math.min(h1, h2) - Math.max(l1, l2));
  const union = Math.max(h1, h2) - Math.min(l1, l2);
  return union === 0 ? 1 : inter / union;
}

export function gradeMarks(user: readonly Mark[], algo: AlgoMarkSet, ctx: GradeContext): MarkGradeResult {
  const candles = ctx.candles;
  const tfName = inferTimeframe(candles);
  const step = tfName ? TIMEFRAME_MS[tfName] : candles[0] ? candles[0].closeTime - candles[0].openTime + 1 : 1;
  const idx = (t: number) => candleIndexAt(candles, t, step);
  const { fromIndex, toIndex } = ctx.window;
  const tol = ctx.toleranceCandles;
  const n = algo.params?.nExt;

  const entryOf = (m: Mark): Entry | null => {
    const group = groupOf(m);
    if (!group || m.anchors.length === 0) return null;
    const times = m.anchors.map((a) => a.time);
    let lo: number;
    let hi: number;
    switch (group) {
      case 'BREAK':
      case 'SWEEP':
        lo = hi = idx(m.anchors[m.anchors.length - 1]!.time);
        break;
      case 'OB':
      case 'FVG':
        lo = hi = idx(Math.min(...times));
        break;
      default:
        if (group.startsWith('PATTERN:')) {
          lo = idx(Math.min(...times));
          hi = idx(Math.max(...times));
        } else lo = hi = idx(m.anchors[0]!.time);
    }
    return { mark: m, group, lo, hi, skill: skillOf(m, group) };
  };
  const inWindow = (e: Entry) =>
    e.lo >= 0 &&
    e.hi >= 0 &&
    (e.group.startsWith('PATTERN:') ? e.lo <= toIndex && e.hi >= fromIndex : e.lo >= fromIndex && e.lo <= toIndex);

  // ---- разбор меток ----
  const ignored: string[] = [];
  const userEntries: Entry[] = [];
  for (const m of user) {
    const e = entryOf(m);
    if (!e || !groupEvaluated(e.group, ctx.concepts, m) || !inWindow(e)) ignored.push(m.id);
    else userEntries.push(e);
  }
  const algoEntries: Entry[] = [];
  for (const m of algo.required) {
    const e = entryOf(m);
    if (e && groupEvaluated(e.group, ctx.concepts, m) && inWindow(e)) algoEntries.push(e);
  }
  const toleratedEntries: Entry[] = [];
  for (const m of algo.tolerated) {
    const e = entryOf(m);
    if (e) toleratedEntries.push(e);
  }
  const byOrder = (a: Entry, b: Entry) => a.lo - b.lo || (a.mark.id < b.mark.id ? -1 : a.mark.id > b.mark.id ? 1 : 0);

  const compat = (u: Entry, a: Entry) =>
    u.group.startsWith('PATTERN:') ? u.lo <= a.hi && a.lo <= u.hi : Math.abs(u.lo - a.lo) <= tol;

  // ---- штрафы пары ----
  const penalties = (u: Entry, a: Entry): Penalty[] => {
    const out: Penalty[] = [];
    const um = u.mark;
    const am = a.mark;
    const tm = candles[a.lo]?.openTime ?? 0;
    if (ctx.scoped && STRUCTURAL_GROUPS.has(a.group)) {
      const us = um.scope ?? 'external';
      if (am.scope && us !== am.scope) {
        out.push({
          code: us === 'external' ? 'INTERNAL_AS_EXTERNAL' : 'EXTERNAL_AS_INTERNAL',
          cost: 3,
          skill: 'internal-external',
          params: { time: tm, scope: am.scope, ...(n !== undefined ? { nExt: n } : {}), ...(algo.params?.nInt != null ? { nInt: algo.params.nInt } : {}) },
          scope: true,
        });
      }
    }
    if ((a.group === 'LABEL_H' || a.group === 'LABEL_L') && um.kind !== am.kind) {
      out.push({
        code: 'STRUCTURE_LABEL_WRONG',
        cost: 3,
        skill: 'structure-labels',
        params: { time: tm, given: um.kind.toUpperCase(), expected: am.kind.toUpperCase(), price: am.anchors[0]!.price },
      });
    }
    if (a.group === 'BREAK' && um.kind !== am.kind) {
      out.push({
        code: 'BOS_CHOCH_CONFUSED',
        cost: 3,
        skill: 'choch',
        params: { time: tm, given: um.kind, expected: am.kind },
      });
    }
    const dirApplies =
      a.group === 'BREAK' ||
      a.group === 'SWEEP' ||
      a.group === 'OB' ||
      a.group === 'FVG' ||
      (a.group.startsWith('PATTERN:') && a.group !== 'PATTERN:doji' && a.group !== 'PATTERN:inside-bar');
    if (dirApplies && um.direction !== am.direction) {
      const code: ErrorCode =
        a.group === 'BREAK'
          ? am.kind === 'bos'
            ? 'BOS_WRONG_DIRECTION'
            : 'CHOCH_WRONG_DIRECTION'
          : a.group.startsWith('PATTERN:')
            ? 'PATTERN_WRONG_DIRECTION'
            : 'MARK_WRONG_DIRECTION';
      out.push({
        code,
        cost: 5,
        skill: a.skill,
        params: { time: tm, given: um.direction ?? 'none', expected: am.direction ?? 'none', kind: am.kind },
      });
    }
    if (a.group === 'BREAK' && um.anchors.length > 0) {
      const brokenIdx = idx(am.anchors[0]!.time);
      const ua = um.anchors[0]!;
      const level = am.anchors[0]!.price;
      if (Math.abs(idx(ua.time) - brokenIdx) > 2 && (Math.abs(ua.price - level) / level) * 100 > ctx.levelPricePct) {
        out.push({
          code: 'BOS_WRONG_LEVEL',
          cost: 2,
          skill: a.skill,
          params: { time: tm, kind: am.kind, given: ua.price, level, refTime: am.anchors[0]!.time },
        });
      }
    }
    if ((a.group === 'OB' || a.group === 'FVG') && iou(um, am) < ctx.iouMin) {
      const [lo, hi] = priceRange(am);
      out.push({
        code: a.group === 'OB' ? 'OB_WRONG_BOUNDS' : 'FVG_WRONG_BOUNDS',
        cost: 2,
        skill: a.skill,
        params: { time: tm, low: lo, high: hi, iou: Math.round(iou(um, am) * 100) },
      });
    }
    return out;
  };
  const pairCost = (u: Entry, a: Entry): number => {
    const delta = u.group.startsWith('PATTERN:') ? 0 : Math.abs(u.lo - a.lo);
    return 10 * delta + penalties(u, a).reduce((s, p) => s + p.cost, 0);
  };

  // ---- DP-сопоставление внутри групп ----
  const groups = new Set<Group>([...userEntries.map((e) => e.group), ...algoEntries.map((e) => e.group)]);
  interface Pair {
    u: Entry;
    a: Entry;
    pens: Penalty[];
  }
  const pairs: Pair[] = [];
  let unmatchedU: Entry[] = [];
  const unmatchedA: Entry[] = [];
  for (const g of [...groups].sort()) {
    const U = userEntries.filter((e) => e.group === g).sort(byOrder);
    const A = algoEntries.filter((e) => e.group === g).sort(byOrder);
    const m = U.length;
    const k = A.length;
    const np: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(k + 1).fill(0));
    const nc: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(k + 1).fill(0));
    const choice: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(k + 1).fill(0)); // 1 match, 2 skipAlgo, 3 skipUser
    for (let i = m; i >= 0; i--) {
      for (let j = k; j >= 0; j--) {
        if (i === m && j === k) continue;
        let bp = -1;
        let bc = 0;
        let bch = 0;
        const consider = (p: number, c: number, ch: number) => {
          if (p > bp || (p === bp && c < bc)) {
            bp = p;
            bc = c;
            bch = ch;
          }
        };
        if (i < m && j < k && compat(U[i]!, A[j]!)) consider(1 + np[i + 1]![j + 1]!, pairCost(U[i]!, A[j]!) + nc[i + 1]![j + 1]!, 1);
        if (j < k) consider(np[i]![j + 1]!, nc[i]![j + 1]!, 2);
        if (i < m) consider(np[i + 1]![j]!, nc[i + 1]![j]!, 3);
        np[i]![j] = bp;
        nc[i]![j] = bc;
        choice[i]![j] = bch;
      }
    }
    let i = 0;
    let j = 0;
    while (i < m || j < k) {
      const ch = choice[i]![j]!;
      if (ch === 1) {
        pairs.push({ u: U[i]!, a: A[j]!, pens: penalties(U[i]!, A[j]!) });
        i++;
        j++;
      } else if (ch === 2) {
        unmatchedA.push(A[j]!);
        j++;
      } else {
        unmatchedU.push(U[i]!);
        i++;
      }
    }
  }

  // ---- допустимые эталоны: непарные метки пользователя рядом с ними уходят в ignored ----
  unmatchedU = unmatchedU.filter((u) => {
    const tolerated = toleratedEntries.some((t) => t.group === u.group && compat(u, t));
    if (tolerated) ignored.push(u.mark.id);
    return !tolerated;
  });

  const errors: (GradeError & { key: number; ord: number })[] = [];
  let ord = 0;
  const addErr = (code: ErrorCode, skill: SkillId, key: number, ids: string[], params: Record<string, string | number>) =>
    errors.push({ code, skill, severity: sev(code), markIds: ids, params, key, ord: ord++ });

  for (const p of pairs) for (const pen of p.pens) addErr(pen.code, pen.skill, p.a.lo, [p.u.mark.id, p.a.mark.id], pen.params);

  const timeOf = (i: number) => candles[i]?.openTime ?? 0;

  // ---- пары «рядом, но вне допуска» (swing |Δ|<=4, OB |Δ|<=6): одна ошибка на пару ----
  const pairNear = (
    groupsList: Group[],
    maxDelta: number,
    sameDirection: boolean,
    make: (u: Entry, a: Entry, delta: number) => void,
  ) => {
    for (const g of groupsList) {
      const us = unmatchedU.filter((e) => e.group === g);
      const as = unmatchedA.filter((e) => e.group === g);
      const cand: { u: Entry; a: Entry; d: number }[] = [];
      for (const u of us)
        for (const a of as) {
          const d = Math.abs(u.lo - a.lo);
          if (d <= maxDelta && (!sameDirection || u.mark.direction === a.mark.direction)) cand.push({ u, a, d });
        }
      cand.sort((x, y) => x.d - y.d || x.u.lo - y.u.lo || x.a.lo - y.a.lo);
      const usedU = new Set<Entry>();
      const usedA = new Set<Entry>();
      for (const c of cand) {
        if (usedU.has(c.u) || usedA.has(c.a)) continue;
        usedU.add(c.u);
        usedA.add(c.a);
        make(c.u, c.a, c.u.lo - c.a.lo);
      }
      nearHandledU = new Set([...nearHandledU, ...usedU]);
      nearHandledA = new Set([...nearHandledA, ...usedA]);
    }
  };
  let nearHandledU = new Set<Entry>();
  let nearHandledA = new Set<Entry>();
  pairNear(['SWING_H', 'SWING_L'], 4, false, (u, a, d) =>
    addErr('SWING_OFF_TOLERANCE', 'swing', a.lo, [u.mark.id, a.mark.id], {
      time: timeOf(u.lo), refTime: timeOf(a.lo), offset: d, tol,
    }),
  );
  pairNear(['OB'], 6, true, (u, a) =>
    addErr('OB_WRONG_CANDLE', 'order-block', a.lo, [u.mark.id, a.mark.id], {
      time: timeOf(u.lo),
      refTime: timeOf(a.lo),
      dir: a.mark.direction ?? 'none',
      eventKind: String(a.mark.meta?.['eventKind'] ?? ''),
      eventTime: Number(a.mark.meta?.['eventTime'] ?? 0),
    }),
  );

  // ---- extra / missed по таблице 12.6 ----
  const restU = unmatchedU.filter((u) => !nearHandledU.has(u));
  const restA = unmatchedA.filter((a) => !nearHandledA.has(a));
  const wickOnlyKeys = new Set<number>();
  const sweepIsBreakKeys: number[] = [];
  const algoBreaks = algo.required.map(entryOf).filter((e): e is Entry => e !== null && e.group === 'BREAK');
  const wickParams = (u: Entry): { level: number } | null => {
    const k = u.lo;
    const c = candles[k];
    if (!c) return null;
    const bull = u.mark.direction !== 'bear';
    const bear = u.mark.direction !== 'bull';
    let level: number | null = null;
    for (const s of algo.aux.refsAt(k)) {
      if (bull && s.type === 'high' && c.high > s.price && c.close <= s.price && (level === null || s.price > level)) level = s.price;
      if (bear && s.type === 'low' && c.low < s.price && c.close >= s.price && (level === null || s.price < level)) level = s.price;
    }
    return level === null ? null : { level };
  };
  // extra, порядок: сначала BREAK (для BOS_WICK_ONLY / SWEEP_IS_BREAK зависимостей), затем остальное
  const extraOrder = [...restU].sort((x, y) => (x.group === 'BREAK' ? 0 : 1) - (y.group === 'BREAK' ? 0 : 1) || x.lo - y.lo);
  const otherTypePattern = (u: Entry) =>
    [...algo.required, ...algo.tolerated].map(entryOf).find(
      (e): e is Entry => e !== null && e.group.startsWith('PATTERN:') && e.group !== u.group && u.lo <= e.hi && e.lo <= u.hi,
    );
  const fvgGapExists = (u: Entry): boolean => {
    for (let m = u.lo - 1; m <= u.lo + 2; m++) {
      if (m < 1 || m + 1 >= candles.length) continue;
      const a = candles[m - 1]!;
      const b = candles[m + 1]!;
      if (u.mark.direction !== 'bear' && b.low > a.high) return true;
      if (u.mark.direction !== 'bull' && b.high < a.low) return true;
    }
    return false;
  };
  for (const u of extraOrder) {
    const um = u.mark;
    const ids = [um.id];
    const tm = timeOf(u.lo);
    switch (u.group) {
      case 'SWING_H':
      case 'SWING_L': {
        const type = u.group === 'SWING_H' ? 'high' : 'low';
        const pending = algo.aux.pending.some((s) => s.type === type && s.index === u.lo);
        addErr(pending ? 'SWING_UNCONFIRMED' : 'SWING_EXTRA', 'swing', u.lo, ids, { time: tm, side: type, ...(n !== undefined ? { n } : {}) });
        break;
      }
      case 'LABEL_H':
      case 'LABEL_L':
        addErr('STRUCTURE_LABEL_EXTRA', 'structure-labels', u.lo, ids, { time: tm, given: um.kind.toUpperCase() });
        break;
      case 'BREAK': {
        const wick = wickParams(u);
        const c = candles[u.lo];
        if (wick) {
          wickOnlyKeys.add(u.lo);
          addErr('BOS_WICK_ONLY', u.skill, u.lo, ids, { kind: um.kind, time: tm, close: c?.close ?? 0, level: wick.level });
        } else {
          addErr(um.kind === 'bos' ? 'BOS_EXTRA' : 'CHOCH_EXTRA', u.skill, u.lo, ids, { kind: um.kind, time: tm });
        }
        break;
      }
      case 'SWEEP': {
        const dir = um.direction;
        const [first, last] = [um.anchors[0], um.anchors[um.anchors.length - 1]];
        const sideHigh = dir ? dir === 'bear' : first && last && um.anchors.length > 1 ? last.price > first.price : null;
        const br = algoBreaks.find(
          (b) =>
            Math.abs(b.lo - u.lo) <= 2 &&
            (sideHigh === null || (sideHigh ? b.mark.direction === 'bull' : b.mark.direction === 'bear')),
        );
        if (br) {
          sweepIsBreakKeys.push(u.lo);
          addErr('SWEEP_IS_BREAK', 'sweep', u.lo, [um.id, br.mark.id], { time: tm, kind: br.mark.kind, level: br.mark.anchors[0]!.price });
        } else addErr('SWEEP_EXTRA', 'sweep', u.lo, ids, { time: tm, k: algo.params?.sweepHoldK ?? 3 });
        break;
      }
      case 'OB': {
        const cand = algo.aux.obCandidates.some((o) => Math.abs(o.index - u.lo) <= 2);
        addErr(cand ? 'OB_NO_DISPLACEMENT' : 'OB_EXTRA', 'order-block', u.lo, ids, { time: tm, k: algo.params?.obDisplacementAtr ?? 1.2 });
        break;
      }
      case 'FVG':
        addErr(fvgGapExists(u) ? 'FVG_EXTRA' : 'FVG_NOT_GAP', 'fvg', u.lo, ids, { time: tm });
        break;
      default: {
        const other = otherTypePattern(u);
        const given = u.group.slice('PATTERN:'.length);
        if (other) {
          addErr('PATTERN_WRONG_TYPE', u.skill, u.lo, [um.id, other.mark.id], {
            time: tm, given, expected: other.group.slice('PATTERN:'.length),
          });
        } else addErr('PATTERN_EXTRA', u.skill, u.lo, ids, { time: tm, pattern: given });
      }
    }
  }
  for (const a of restA) {
    const am = a.mark;
    const ids = [am.id];
    const tm = timeOf(a.lo);
    switch (a.group) {
      case 'SWING_H':
      case 'SWING_L':
        addErr('SWING_MISSED', 'swing', a.lo, ids, {
          time: tm, side: a.group === 'SWING_H' ? 'high' : 'low', price: am.anchors[0]!.price, ...(n !== undefined ? { n } : {}),
        });
        break;
      case 'LABEL_H':
      case 'LABEL_L':
        addErr('STRUCTURE_LABEL_MISSED', 'structure-labels', a.lo, ids, { time: tm, expected: am.kind.toUpperCase() });
        break;
      case 'BREAK':
        if (!sweepIsBreakKeys.some((k) => Math.abs(k - a.lo) <= 2)) {
          addErr(am.kind === 'bos' ? 'BOS_MISSING' : 'CHOCH_MISSING', a.skill, a.lo, ids, {
            kind: am.kind, dir: am.direction ?? 'none', time: tm, close: candles[a.lo]?.close ?? 0, level: am.anchors[0]!.price,
          });
        }
        break;
      case 'SWEEP':
        if (!wickOnlyKeys.has(a.lo)) {
          addErr('SWEEP_MISSED', 'sweep', a.lo, ids, {
            time: tm, wick: am.anchors[am.anchors.length - 1]!.price, level: am.anchors[0]!.price,
            close: candles[a.lo]?.close ?? 0, k: algo.params?.sweepHoldK ?? 3,
          });
        }
        break;
      case 'OB':
        addErr('OB_MISSED', 'order-block', a.lo, ids, {
          time: tm, dir: am.direction ?? 'none', low: priceRange(am)[0], high: priceRange(am)[1],
          eventKind: String(am.meta?.['eventKind'] ?? ''), eventTime: Number(am.meta?.['eventTime'] ?? 0),
        });
        break;
      case 'FVG':
        addErr('FVG_MISSED', 'fvg', a.lo, ids, {
          time: tm, dir: am.direction ?? 'none', low: priceRange(am)[0], high: priceRange(am)[1],
          size: Number(am.meta?.['size'] ?? 0), status: String(am.meta?.['status'] ?? ''),
        });
        break;
      default:
        addErr('PATTERN_MISSED', a.skill, a.lo, ids, { time: tm, pattern: a.group.slice('PATTERN:'.length) });
    }
  }
  errors.sort((x, y) => x.key - y.key || x.ord - y.ord);

  // ---- счёт ----
  const pairWeight = (p: Pair) => (p.pens.length === 0 ? 1 : 0.5);
  const okPairs = pairs.filter((p) => p.pens.length === 0);
  const sumW = pairs.reduce((s, p) => s + pairWeight(p), 0);
  const extraAll = [...restU, ...[...nearHandledU]];
  const denom = algoEntries.length + extraAll.length;
  const score = denom === 0 ? 1 : sumW / denom;
  const hasMajor = errors.some((e) => e.severity === 'major');
  const verdict: Verdict = score >= 0.85 && !hasMajor ? 'correct' : score >= 0.5 ? 'partial' : 'incorrect';

  // ---- навыки ----
  const tot = new Map<SkillId, { correct: number; total: number }>();
  const bump = (s: SkillId, field: 'correct' | 'total') => {
    const cur = tot.get(s) ?? { correct: 0, total: 0 };
    cur[field]++;
    tot.set(s, cur);
  };
  for (const a of algoEntries) bump(a.skill, 'total');
  for (const u of extraAll) bump(u.skill, 'total');
  for (const p of okPairs) bump(p.a.skill, 'correct');
  if (ctx.scoped) {
    for (const p of pairs) {
      if (!STRUCTURAL_GROUPS.has(p.a.group)) continue;
      bump('internal-external', 'total');
      if (!p.pens.some((x) => x.scope)) bump('internal-external', 'correct');
    }
  }
  const skillOutcomes: SkillOutcome[] = [...tot.entries()]
    .filter(([, v]) => v.total >= 1)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([skill, v]) => ({ skill, correct: v.correct, total: v.total }));

  const sortedPairs = [...pairs].sort((x, y) => x.u.lo - y.u.lo || (x.u.mark.id < y.u.mark.id ? -1 : 1));
  const keyOrd = (a: Entry, b: Entry) => a.lo - b.lo || (a.mark.id < b.mark.id ? -1 : a.mark.id > b.mark.id ? 1 : 0);
  return {
    matched: sortedPairs.map((p) => ({
      userMarkId: p.u.mark.id,
      algoMarkId: p.a.mark.id,
      timeOffsetCandles: p.u.group.startsWith('PATTERN:') ? 0 : p.u.lo - p.a.lo,
      priceOffsetPct:
        (Math.abs(p.u.mark.anchors[0]!.price - p.a.mark.anchors[0]!.price) / Math.abs(p.a.mark.anchors[0]!.price)) * 100,
    })),
    missed: unmatchedA.sort(keyOrd).map((e) => e.mark),
    extra: extraAll.sort(keyOrd).map((e) => e.mark),
    toleranceCandles: tol,
    ignored,
    errors: errors.map((e) => ({ code: e.code, skill: e.skill, severity: e.severity, markIds: e.markIds, params: e.params })),
    skillOutcomes,
    score,
    verdict,
    okPairs: okPairs.map((p) => ({ userMarkId: p.u.mark.id, algoMarkId: p.a.mark.id, skill: p.a.skill })),
  };
}

