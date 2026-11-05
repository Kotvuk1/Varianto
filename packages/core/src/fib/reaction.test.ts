import { describe, expect, it } from 'vitest';
import { fibCandles, indexAtIso, type FibSeriesId } from '../testing/fib';
import {
  availableOptions,
  classifyReaction,
  correctOptions,
  levelScore,
  resolveReaction,
  type ReactionOutcome,
} from './reaction';
import type { FibDirection } from './types';

// Golden FG-1..FG-8 (FIBONACCI.md §12.2): исход resolveReaction от T = confirmedIndex = b + 5.
const LIMIT = { '15m': 96, '1h': 72, '4h': 60, '1d': 30 } as const;

interface Case {
  name: string;
  series: FibSeriesId;
  tf: keyof typeof LIMIT;
  dir: FibDirection;
  a: string;
  b: string;
  kind: ReactionOutcome['kind'];
  at: string;
  extremeAt: string;
  extremePrice: number;
  depth: number;
  thr?: number;
  cls: string;
  ok: string[];
}
const CASES: Case[] = [
  { name: 'FG-1 реакция 0.618/OTE', series: 'FG-1', tf: '4h', dir: 'bull', a: '2026-09-20T00:00', b: '2026-09-21T20:00', kind: 'reaction', at: '2026-09-27T04:00', extremeAt: '2026-09-24T08:00', extremePrice: 82832.0, depth: 0.6246, thr: 1782.2143, cls: '0.618', ok: ['0.618', 'ote'] },
  { name: 'FG-1 continuation (shallow)', series: 'FG-1', tf: '4h', dir: 'bull', a: '2026-09-15T16:00', b: '2026-09-19T12:00', kind: 'continuation', at: '2026-09-21T00:00', extremeAt: '2026-09-20T00:00', extremePrice: 80095.9, depth: 0.2617, cls: 'continuation', ok: [] },
  { name: 'FG-2 0.705 (зона пройдена до T)', series: 'FG-1', tf: '4h', dir: 'bear', a: '2026-09-06T20:00', b: '2026-09-08T12:00', kind: 'reaction', at: '2026-09-09T12:00', extremeAt: '2026-09-09T08:00', extremePrice: 79737.3, depth: 0.7279, thr: 1109.3464, cls: '0.705', ok: ['0.705', 'ote'] },
  { name: 'FG-2 слом -> deep', series: 'FG-1', tf: '4h', dir: 'bear', a: '2026-09-14T20:00', b: '2026-09-15T16:00', kind: 'fail', at: '2026-09-18T12:00', extremeAt: '', extremePrice: 0, depth: 0, cls: 'deep', ok: ['deep'] },
  { name: 'FG-3 0.705/OTE', series: 'FG-3', tf: '1h', dir: 'bear', a: '2026-10-02T08:00', b: '2026-10-02T18:00', kind: 'reaction', at: '2026-10-05T04:00', extremeAt: '2026-10-04T23:00', extremePrice: 2738.68, depth: 0.6924, thr: 30.9396, cls: '0.705', ok: ['0.705', 'ote'] },
  { name: 'FG-4 0.786/OTE', series: 'FG-4', tf: '4h', dir: 'bull', a: '2026-09-10T12:00', b: '2026-09-11T12:00', kind: 'reaction', at: '2026-09-14T16:00', extremeAt: '2026-09-13T12:00', extremePrice: 2460.3, depth: 0.7831, thr: 68.0614, cls: '0.786', ok: ['0.786', 'ote'] },
  { name: 'FG-5 слом -> deep', series: 'FG-4', tf: '4h', dir: 'bear', a: '2026-09-09T08:00', b: '2026-09-10T12:00', kind: 'fail', at: '2026-09-11T12:00', extremeAt: '', extremePrice: 0, depth: 0, cls: 'deep', ok: ['deep'] },
  { name: 'FG-5 фитиль за A без слома -> deep', series: 'FG-4', tf: '4h', dir: 'bear', a: '2026-09-11T12:00', b: '2026-09-15T16:00', kind: 'reaction', at: '2026-09-20T00:00', extremeAt: '2026-09-19T16:00', extremePrice: 2669.0, depth: 1.0097, thr: 72.924, cls: 'deep', ok: ['deep'] },
  { name: 'FG-6 deep (пройдены 0.618-0.786)', series: 'FG-6', tf: '15m', dir: 'bull', a: '2026-07-19T18:00', b: '2026-07-20T01:00', kind: 'reaction', at: '2026-07-20T08:00', extremeAt: '2026-07-20T06:30', extremePrice: 75.45, depth: 0.9327, thr: 0.7682, cls: 'deep', ok: ['deep'] },
  { name: 'FG-7 0.5 у границы допуска', series: 'FG-7', tf: '15m', dir: 'bear', a: '2026-07-16T15:15', b: '2026-07-16T17:45', kind: 'reaction', at: '2026-07-16T22:45', extremeAt: '2026-07-16T21:30', extremePrice: 76.04, depth: 0.4636, thr: 0.5154, cls: '0.5', ok: ['0.5'] },
  { name: 'FG-8 deep', series: 'FG-8', tf: '15m', dir: 'bear', a: '2026-08-10T20:30', b: '2026-08-11T07:15', kind: 'reaction', at: '2026-08-11T12:15', extremeAt: '2026-08-11T11:00', extremePrice: 76.35, depth: 0.8919, thr: 0.3118, cls: 'deep', ok: ['deep'] },
];

describe('resolveReaction + classifyReaction (golden)', () => {
  for (const k of CASES) {
    it(k.name, () => {
      const c = fibCandles(k.series);
      const a = indexAtIso(c, k.a + ':00Z');
      const b = indexAtIso(c, k.b + ':00Z');
      const bull = k.dir === 'bull';
      const A = bull ? c[a]!.low : c[a]!.high;
      const B = bull ? c[b]!.high : c[b]!.low;
      const T = b + 5;
      const o = resolveReaction({ candles: c, direction: k.dir, A, B, b, T, limit: LIMIT[k.tf] });
      expect(o.kind).toBe(k.kind);
      expect(o.index).toBe(indexAtIso(c, k.at + ':00Z'));
      expect(o.incomplete).toBe(false);
      if (k.extremeAt) {
        expect(o.extremeIndex).toBe(indexAtIso(c, k.extremeAt + ':00Z'));
        expect(o.extremePrice).toBe(k.extremePrice);
        expect(o.depth).toBeCloseTo(k.depth, 4);
      }
      if (k.thr) expect(o.threshold).toBeCloseTo(k.thr, 4);
      const cls = classifyReaction(o);
      expect(cls.kind === 'level' ? cls.level : cls.kind).toBe(k.cls);
      expect(correctOptions(cls, o.depth)).toEqual(k.ok);
    });
  }

  it('FG-1: слом закрытием за A проверяется раньше реакции и продолжения (одна свеча)', () => {
    const c = fibCandles('FG-1');
    const a = indexAtIso(c, '2026-09-20T00:00:00Z');
    const b = indexAtIso(c, '2026-09-21T20:00:00Z');
    const A = c[a]!.low;
    const B = c[b]!.high;
    const bumped = c.map((x, i) => (i === b + 6 ? { ...x, close: A - 1, high: B + 100, low: A - 5 } : x)); // SYNTHETIC: порядок проверок на одной свече
    const o = resolveReaction({ candles: bumped, direction: 'bull', A, B, b, T: b + 5, limit: 60 });
    expect(o.kind).toBe('fail');
    expect(o.index).toBe(b + 6);
  });

  it('timeout и incomplete: ряд короче T + limit', () => {
    const c = fibCandles('FG-1');
    const a = indexAtIso(c, '2026-09-20T00:00:00Z');
    const b = indexAtIso(c, '2026-09-21T20:00:00Z');
    const o = resolveReaction({ candles: c.slice(0, b + 8), direction: 'bull', A: c[a]!.low, B: c[b]!.high, b, T: b + 5, limit: 60 });
    expect(o.kind).toBe('timeout');
    expect(o.incomplete).toBe(true);
    expect(o.index).toBe(b + 7);
  });
});

describe('классы исходов (§6.3)', () => {
  const r = (depth: number, kind: ReactionOutcome['kind'] = 'reaction') => classifyReaction({ kind, depth });
  it('границы допуска ±0.04 включительно и промежутки between', () => {
    expect(r(0.342)).toEqual({ kind: 'level', level: '0.382' });
    expect(r(0.422)).toEqual({ kind: 'level', level: '0.382' });
    expect(r(0.43)).toEqual({ kind: 'between' });
    expect(r(0.46)).toEqual({ kind: 'level', level: '0.5' });
    expect(r(0.55)).toEqual({ kind: 'between' });
    expect(r(0.578)).toEqual({ kind: 'level', level: '0.618' });
    expect(r(0.661)).toEqual({ kind: 'between' });
    expect(r(0.665)).toEqual({ kind: 'level', level: '0.705' });
    expect(r(0.7455)).toEqual({ kind: 'between' });
    expect(r(0.746)).toEqual({ kind: 'level', level: '0.786' });
    expect(r(0.826)).toEqual({ kind: 'level', level: '0.786' });
    expect(r(0.8261)).toEqual({ kind: 'deep' });
    expect(r(0.3)).toEqual({ kind: 'shallow' });
    expect(r(1.2)).toEqual({ kind: 'deep' });
  });
  it('верные варианты: ote только при 0.62 <= r <= 0.79', () => {
    expect(correctOptions(r(0.619), 0.619)).toEqual(['0.618']);
    expect(correctOptions(r(0.62), 0.62)).toEqual(['0.618', 'ote']);
    expect(correctOptions(r(0.79), 0.79)).toEqual(['0.786', 'ote']);
    expect(correctOptions(r(0.795), 0.795)).toEqual(['0.786']);
    expect(correctOptions({ kind: 'continuation' }, 0.5)).toEqual([]);
  });
});

describe('levelScore (§6.6)', () => {
  const out = (depth: number) => ({ kind: 'reaction' as const, depth });
  it('FG-4: 0.705 при эталоне 0.786 - соседний (0.5), ote верен (1)', () => {
    const o = out(0.7831);
    const cls = classifyReaction(o);
    expect(levelScore('0.786', cls, o)).toBe(1);
    expect(levelScore('ote', cls, o)).toBe(1);
    expect(levelScore('0.705', cls, o)).toBe(0.5);
    expect(levelScore('0.5', cls, o)).toBe(0);
    expect(levelScore('deep', cls, o)).toBe(0.5);
  });
  it('ote у границ: r в [0.578, 0.62) и (0.79, 0.826] - 0.5; вне - 0', () => {
    for (const [r, want] of [[0.6, 0.5], [0.81, 0.5], [0.5, 0]] as const) {
      const o = out(r);
      expect(levelScore('ote', classifyReaction(o), o)).toBe(want);
    }
  });
  it('deep: 0.786 соседний (FG-5), 0.618 нет', () => {
    const o = { kind: 'fail' as const, depth: 0.9 };
    const cls = classifyReaction(o);
    expect(levelScore('deep', cls, o)).toBe(1);
    expect(levelScore('0.786', cls, o)).toBe(0.5);
    expect(levelScore('0.618', cls, o)).toBe(0);
    expect(levelScore('ote', cls, o)).toBe(0);
  });
});

describe('availableOptions (§6.1)', () => {
  it('FG-1 dT=0.3162: все уровни и ote (medium)', () => {
    expect(availableOptions(0.3162, 'medium')).toEqual(['0.382', '0.5', '0.618', '0.705', '0.786', 'ote']);
  });
  it('FG-4 dT=0.6146: 0.705, 0.786, ote', () => {
    expect(availableOptions(0.6146, 'medium')).toEqual(['0.705', '0.786', 'ote']);
  });
  it('FG-5 dT=0.6733 hard: 0.786 и deep; без ote', () => {
    expect(availableOptions(0.6733, 'hard')).toEqual(['0.786', 'deep']);
  });
  it('FG-6 dT=0.5577: 0.618…0.786, ote; deep только на hard', () => {
    expect(availableOptions(0.5577, 'easy')).toEqual(['0.618', '0.705', '0.786', 'ote']);
    expect(availableOptions(0.5577, 'hard')).toEqual(['0.618', '0.705', '0.786', 'ote', 'deep']);
  });
});
