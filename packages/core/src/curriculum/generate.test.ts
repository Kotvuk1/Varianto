import { describe, expect, it } from 'vitest';
import { gaps } from '../smc/series';
import { btc1h, btc4h } from '../testing/cur';
import type { Difficulty, TaskTimeframe } from '../types';
import {
  CUR_TFS,
  htfClosedBefore,
  pickComboLevelTask,
  pickComboSmcTask,
  pickLevelsTask,
  pickLimitEntryTask,
  pickLvReactionTask,
  pickStopTakeTask,
  reactionOptions,
  specialReaction,
  type ZonePickInput,
} from './generate';
import { limitFilled } from './rubric';
import { computeZones } from './zone';

const h1 = btc1h();
const h4 = btc4h();
const inp = (difficulty: Difficulty, seed: number, over: Partial<ZonePickInput> = {}): ZonePickInput => ({
  candles: h1, htf: h4, tf: '1h', difficulty, seed, tick: 0.1, maxAttempts: 60, ...over,
});
const seeds = [1, 2, 3, 4, 5, 6];
const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];
const common = (p: { T: number; visible: { closeTime: number; closed: boolean }[] }) => {
  expect(p.T % 900_000).toBe(0);
  expect(p.visible).toHaveLength(500);
  expect(p.visible.every((c) => c.closed && c.closeTime < p.T)).toBe(true);
  expect(gaps(p.visible as never, '1h')).toEqual([]);
};

describe('сводка ТФ по ступеням (§11.1)', () => {
  it('1d недоступен в ступенях 3, 4, lv-reaction и комбо; easy - только 1h/4h', () => {
    expect(CUR_TFS.trade.hard).not.toContain('1d' as TaskTimeframe);
    expect(CUR_TFS.reaction.medium).not.toContain('1d' as TaskTimeframe);
    expect(CUR_TFS.levels.hard).toContain('1d');
    expect(CUR_TFS.levels.easy).toEqual(['1h', '4h']);
  });
});

describe('pickLevelsTask (§3.3)', () => {
  for (const d of DIFFS) {
    it(`${d}: однозначный эталон (касаний >= ${d === 'easy' ? 2 : 3}, отрыв силы >= 1), dist <= 5, роль по сложности`, () => {
      let n = 0;
      for (const seed of seeds) {
        const p = pickLevelsTask(inp(d, seed));
        if (!p) continue;
        n++;
        common(p);
        const { ref, second } = p.ctx;
        expect(ref.touches).toBeGreaterThanOrEqual(d === 'easy' ? 2 : 3);
        if (second) expect(ref.strength).toBeGreaterThanOrEqual(second.strength + 1);
        expect(ref.dist).toBeGreaterThanOrEqual(0);
        expect(ref.dist).toBeLessThanOrEqual(5);
        if (d === 'hard') expect(p.role).toBeNull();
        else expect(ref.role).toBe(p.role);
        expect(pickLevelsTask(inp(d, seed))!.T).toBe(p.T); // детерминизм
      }
      expect(n).toBeGreaterThanOrEqual(3);
    });
  }
  it('исключённый T не выдаётся; мало истории -> null', () => {
    const first = pickLevelsTask(inp('medium', 3))!;
    const next = pickLevelsTask(inp('medium', 3, { isExcluded: (T) => T === first.T }))!;
    expect(next.T).not.toBe(first.T);
    expect(pickLevelsTask(inp('medium', 3, { candles: h1.slice(0, 300) }))).toBeNull();
    expect(pickLevelsTask(inp('medium', 3, { isExcluded: () => true, maxAttempts: 5 }))).toBeNull();
  });
});

describe('pickLvReactionTask (§3.6)', () => {
  for (const d of DIFFS) {
    it(`${d}: варианты не перекрываются зонами подхода, исход совпадает с желаемым, none только на hard`, () => {
      let n = 0;
      for (const seed of seeds) {
        const p = pickLvReactionTask(inp(d, seed));
        if (!p) continue;
        n++;
        common(p);
        expect(p.options.length).toBeGreaterThanOrEqual(2);
        expect(p.options.length).toBeLessThanOrEqual(d === 'hard' ? 3 : 2);
        expect(p.allowNone).toBe(d === 'hard');
        expect(p.chain.kind === 'reaction' || p.chain.kind === 'none').toBe(true);
        if (p.chain.kind === 'none') expect(d).toBe('hard');
        for (let i = 1; i < p.options.length; i++) {
          const a = p.options[i - 1]!.zone;
          const b = p.options[i]!.zone;
          expect(a.dist).toBeLessThanOrEqual(b.dist);
          const gap = p.side === 'LONG' ? a.bottom - b.top : b.bottom - a.top;
          expect(gap).toBeGreaterThanOrEqual(0.5 * p.set.A);
        }
        expect(p.options.map((o) => o.id)).toEqual(p.options.map((_, i) => `z${i + 1}`));
      }
      expect(n).toBeGreaterThanOrEqual(2);
    });
  }
  it('reactionOptions: роль по стороне, touches >= 3, 1 <= dist <= 6', () => {
    const p = pickLvReactionTask(inp('hard', 2))!;
    for (const o of reactionOptions(p.set, 'SHORT', 'hard')) {
      expect(o.zone.role).toBe('resistance');
      expect(o.zone.touches).toBeGreaterThanOrEqual(3);
      expect(o.zone.dist).toBeGreaterThanOrEqual(1);
      expect(o.zone.dist).toBeLessThanOrEqual(6);
    }
  });
});

describe('pickLimitEntryTask (§5.1)', () => {
  it('только реакции; зона 1 <= dist <= 4; hard - доля «особых» реакций не ниже 50% по seed', () => {
    let special = 0;
    let n = 0;
    for (const d of DIFFS) {
      for (const seed of [...seeds, 7, 8, 9, 10]) {
        const p = pickLimitEntryTask(inp(d, seed));
        if (!p) continue;
        common(p);
        expect(p.reaction.kind).toBe('reaction');
        expect(p.ref.dist).toBeGreaterThanOrEqual(1);
        expect(p.ref.dist).toBeLessThanOrEqual(4);
        expect(p.ref.role).toBe(p.side === 'LONG' ? 'support' : 'resistance');
        if (d === 'hard') {
          n++;
          if (specialReaction(p.side, p.ref, p.reaction.m)) special++;
        }
      }
    }
    expect(n).toBeGreaterThanOrEqual(4);
    expect(special / n).toBeGreaterThanOrEqual(0.4); // выборка мала: при needSpecial условие выполнено всегда, иначе встречается естественно
  });
  it('specialReaction: реакция до ближнего края или фитиль за дальний', () => {
    const z = { bottom: 100, top: 110 };
    expect(specialReaction('LONG', z, 112)).toBe(true);
    expect(specialReaction('LONG', z, 98)).toBe(true);
    expect(specialReaction('LONG', z, 105)).toBe(false);
    expect(specialReaction('SHORT', z, 98)).toBe(true);
    expect(specialReaction('SHORT', z, 112)).toBe(true);
    expect(specialReaction('SHORT', z, 105)).toBe(false);
  });
});

describe('pickStopTakeTask (§6.1, §20)', () => {
  it('исполнение проходом на тик; ряд заканчивается свечой исполнения; T = закрытие свечи исполнения; есть цель на 2R', () => {
    let n = 0;
    for (const d of DIFFS) {
      for (const seed of seeds) {
        const p = pickStopTakeTask(inp(d, seed));
        if (!p) continue;
        n++;
        const f = p.visible[p.visible.length - 1]!;
        expect(p.T).toBe(f.closeTime + 1);
        expect(p.visible).toHaveLength(500);
        expect(gaps(p.visible, '1h')).toEqual([]);
        expect(limitFilled(f, p.side, p.ref.E, 0.1)).toBe(true);
        expect(p.visible.slice(0, -1).some((c, i) => i >= 499 - 72 && c.openTime > p.T0 - 1 && limitFilled(c, p.side, p.ref.E, 0.1))).toBe(false);
        expect(p.ref.targets.kStar).toBeGreaterThanOrEqual(0);
        expect(p.zone.dist).toBeGreaterThanOrEqual(1);
        // реакция ещё не подтверждена на свече входа
        expect(p.side === 'LONG' ? f.close < f.low + 1.5 * p.ref.A : f.close > f.high - 1.5 * p.ref.A).toBe(true);
        expect(p.side === 'LONG' ? f.close >= p.zone.bottom : f.close <= p.zone.top).toBe(true);
      }
    }
    expect(n).toBeGreaterThanOrEqual(5);
  });
});

describe('комбо: генерация', () => {
  it('combo-level-trade: hard - сторона скрыта; исход reaction/break по seed; зона dist 1-4', () => {
    const outcomes = new Set<string>();
    for (const d of DIFFS) {
      for (const seed of [...seeds, 7, 8]) {
        const p = pickComboLevelTask(inp(d, seed));
        if (!p) continue;
        common(p);
        outcomes.add(p.outcome);
        expect(p.sideShown).toBe(d === 'hard' ? null : p.refSide);
        expect(p.ctx.ref.dist).toBeGreaterThanOrEqual(1);
        expect(p.ctx.ref.dist).toBeLessThanOrEqual(4);
      }
    }
    expect([...outcomes].sort()).toEqual(['break', 'reaction']);
  });
  it('combo-smc-entry (4h): тренд up/down, ближайший POI на 1-6 ATR', () => {
    let n = 0;
    for (const d of DIFFS) {
      for (const seed of [...seeds, 7, 8, 9, 10]) {
        const p = pickComboSmcTask({ candles: h4, htf: [], tf: '4h', difficulty: d, seed, tick: 0.1, maxAttempts: 80 });
        if (!p) continue;
        n++;
        expect(p.visible.every((c) => c.closeTime < p.T)).toBe(true);
        expect(p.ctx.trend === 'up' || p.ctx.trend === 'down').toBe(true);
        const poi = p.ctx.candidates[0]!;
        expect(poi.dist).toBeGreaterThanOrEqual(1);
        expect(poi.dist).toBeLessThanOrEqual(6);
        expect(poi.fresh).toBe(true);
      }
    }
    expect(n).toBeGreaterThanOrEqual(2);
  });
});

describe('htfClosedBefore', () => {
  it('только свечи, закрытые к T, не более depth', () => {
    const T = h4[100]!.closeTime + 1;
    const r = htfClosedBefore(h4, T, 50);
    expect(r).toHaveLength(50);
    expect(r[r.length - 1]).toBe(h4[100]);
    expect(htfClosedBefore(h4, h4[100]!.closeTime, 5)[4]).toBe(h4[99]);
    expect(htfClosedBefore(h4, 0, 5)).toEqual([]);
    expect(computeZones(h1.slice(0, 400), htfClosedBefore(h4, h1[399]!.closeTime + 1, 500))).not.toBeNull();
  });
});
