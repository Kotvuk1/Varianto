// Генерация заданий (§8, §9): каталог кандидатов, сборка по seed, инварианты payload. Реальные свечи BTCUSDT 1h (май-сентябрь 2026).
import { describe, expect, it } from 'vitest';
import type { Candle } from '../types';
import { TIMEFRAME_MS } from '../types';
import { readKlines } from '../testing/klines';
import { atrOf } from './check';
import { contiguousRuns, ewCatalog, ewMakeTask, type EwPick } from './generate';
import { buildEwRef, EW_KIND_BY_DIFFICULTY, EW_SHAPES, EW_TFS, EW_VISIBLE, ewLimit, ewTaskPayload } from './ref';
import type { EwTaskKind } from './types';

const h1: Candle[] = ['05', '06', '07', '08', '09'].flatMap((m) => readKlines(`klines/BTCUSDT/1h/BTCUSDT-1h-2026-${m}.csv`));
const H = 3_600_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 16);
const picks = (kind: EwTaskKind, seed: number, relaxed = false): EwPick[] =>
  ewCatalog(h1, '1h', kind, relaxed).flatMap((e) => {
    const p = ewMakeTask(h1, '1h', e, seed, relaxed);
    return p ? [p] : [];
  });

describe('конфигурация (§8)', () => {
  it('kind определяется сложностью; ТФ и формы по таблице', () => {
    expect(EW_KIND_BY_DIFFICULTY).toEqual({ easy: 'ew-impulse', medium: 'ew-impulse-correction', hard: 'ew-scenario' });
    expect(EW_TFS['ew-impulse']).toEqual(['1h', '4h']);
    expect(EW_TFS['ew-impulse-correction']).toEqual(['15m', '1h', '4h']);
    expect(EW_SHAPES['ew-impulse']).toEqual(['impulse-6']);
    expect(EW_SHAPES['ew-impulse-correction']).toEqual(['impulse-6+correction']);
    expect(EW_SHAPES['ew-scenario']).toHaveLength(4);
    expect([ewLimit('15m'), ewLimit('1h'), ewLimit('4h')]).toEqual([96, 72, 60]);
  });
});

describe('каталог', () => {
  it('ряд непрерывен: пропусков в 1h BTC нет; contiguousRuns находит границы пропуска', () => {
    expect(contiguousRuns(h1, H)).toHaveLength(1);
    // SYNTHETIC: из реального ряда удалены 24 свечи (имитация пропуска архива), цены не изменялись
    const gapped = [...h1.slice(0, 1000), ...h1.slice(1024)];
    expect(contiguousRuns(gapped, H)).toEqual([[0, 1000], [1000, gapped.length]]);
  });
  it('записи упорядочены по времени, содержат только времена; easy/medium имеют точки эталона', () => {
    for (const kind of ['ew-impulse', 'ew-impulse-correction', 'ew-scenario'] as const) {
      const cat = ewCatalog(h1, '1h', kind);
      expect(cat.length).toBeGreaterThan(0);
      for (let i = 1; i < cat.length; i++) expect(cat[i]!.lastPivotTime).toBeGreaterThanOrEqual(cat[i - 1]!.lastPivotTime);
      if (kind === 'ew-scenario') expect(cat.every((e) => e.refTimes.length === 0)).toBe(true);
      else expect(cat.every((e) => e.refTimes.length === (kind === 'ew-impulse' ? 6 : 9))).toBe(true);
    }
  });
  it('ослабление easy (minGuides 2 -> 0) не сокращает каталог', () => {
    expect(ewCatalog(h1, '1h', 'ew-impulse', true).length).toBeGreaterThanOrEqual(ewCatalog(h1, '1h', 'ew-impulse', false).length);
  });
  it('инвариант префикса: записи, подтверждённые к T, одинаковы на ряду до T и на полном', () => {
    const cut = h1.findIndex((c) => iso(c.openTime) === '2026-07-20T00:00');
    const part = ewCatalog(h1.slice(0, cut), '1h', 'ew-impulse');
    const full = ewCatalog(h1, '1h', 'ew-impulse').filter((e) => e.confirmTime < h1[cut]!.openTime);
    expect(part.map((e) => e.refTimes)).toEqual(full.map((e) => e.refTimes));
  });
});

describe('ewMakeTask', () => {
  const easy = picks('ew-impulse', 7);
  const medium = picks('ew-impulse-correction', 7);
  const hardP = picks('ew-scenario', 7);

  it('есть задания всех сложностей; детерминизм по seed', () => {
    expect(easy.length).toBeGreaterThan(0);
    expect(medium.length).toBeGreaterThan(0);
    expect(hardP.length).toBeGreaterThan(0);
    const again = picks('ew-impulse', 7);
    expect(again.map((p) => p.T)).toEqual(easy.map((p) => p.T));
    expect(again.map((p) => p.params)).toEqual(easy.map((p) => p.params));
  });
  it('видимый ряд - 500 закрытых свечей до T; будущее - ровно limit свечей, непрерывно', () => {
    for (const p of [...easy, ...medium, ...hardP.slice(0, 10)]) {
      expect(p.visible).toHaveLength(EW_VISIBLE);
      expect(p.visible.every((c) => c.closed)).toBe(true);
      expect(p.visible[EW_VISIBLE - 1]!.openTime + H).toBe(p.T);
      expect(p.future).toHaveLength(72);
      expect(p.future[0]!.openTime).toBe(p.T);
      const all = [...p.visible, ...p.future];
      expect(contiguousRuns(all, H)).toHaveLength(1);
    }
  });
  it('эталон восстанавливается из запечатанных параметров (общий путь next и grade)', () => {
    for (const p of [...easy, ...medium, ...hardP.slice(0, 10)]) {
      const ref = buildEwRef(p.visible, p.params);
      expect(ref).not.toBeNull();
      expect(ref!.count.impulse.map((x) => x.time)).toEqual(p.ref.count.impulse.map((x) => x.time));
      expect(ref!.primary).toBe(p.ref.primary);
      expect(ref!.alternative).toBe(p.ref.alternative);
    }
  });
  it('payload: нет данных позже T, окно внутри видимого ряда, lastPivot подсвечен', () => {
    for (const p of [...easy, ...medium, ...hardP.slice(0, 10)]) {
      const t = ewTaskPayload(p.ref);
      const last = p.visible[p.visible.length - 1]!.openTime;
      expect(t.window.toTime).toBe(last);
      expect(t.window.fromTime).toBeLessThan(t.lastPivot.time);
      expect(t.lastPivot.time).toBeLessThanOrEqual(last);
      expect(JSON.stringify(t)).not.toContain(String(p.T));
      expect(t.primaryOptions).toHaveLength(4);
      expect(t.alternativeOptions).toHaveLength(7);
      expect(t.nPoint).toBe(5);
      expect(t.toleranceCandles).toBe(2);
      expect(t.limitCandles).toBe(72);
      expect(t.invalidationTolerance).toBeCloseTo(0.25 * atrOf(p.visible)[p.visible.length - 1]!, 9);
      expect(t.tools).toEqual(['ew-impulse', 'ew-zigzag', 'ew-flat', 'hline']);
    }
  });
  it('payload по сложностям: easy - directionHint, hints.liveRules, альтернатива необязательна', () => {
    const e = ewTaskPayload(easy[0]!.ref);
    expect(e).toMatchObject({ kind: 'ew-impulse', shapes: ['impulse-6'], alternativeRequired: false, hints: { liveRules: true } });
    expect(['bull', 'bear']).toContain(e.directionHint);
    const m = ewTaskPayload(medium[0]!.ref);
    expect(m).toMatchObject({ kind: 'ew-impulse-correction', alternativeRequired: true, directionHint: null });
    expect(m.hints).toBeUndefined();
    const h = ewTaskPayload(hardP[0]!.ref);
    expect(h).toMatchObject({ kind: 'ew-scenario', alternativeRequired: true, directionHint: null });
    expect(h.shapes).toHaveLength(4);
  });
  it('до T после последней точки цена не уходит за неё, триггеры не сработали', () => {
    for (const p of [...easy, ...medium, ...hardP.slice(0, 20)]) {
      const { lastPivot } = p.ref;
      for (let j = lastPivot.index + 1; j < p.visible.length; j++) {
        const c = p.visible[j]!;
        if (lastPivot.type === 'high') expect(c.high).toBeLessThanOrEqual(lastPivot.price);
        else expect(c.low).toBeGreaterThanOrEqual(lastPivot.price);
      }
    }
  });
  it('easy: P0 и P5 - крайние экстремумы окна; medium: P0; hard: >= 2 сценария с >= 5 точками или ослабление', () => {
    for (const p of easy) {
      const { impulse, direction } = p.ref.count;
      const win = p.visible.slice(p.visible.findIndex((c) => c.openTime === p.params.window.fromTime));
      const hi = Math.max(...win.map((c) => c.high));
      const lo = Math.min(...win.map((c) => c.low));
      if (direction === 'bull') {
        expect(impulse[0]!.price).toBe(lo);
        expect(impulse[5]!.price).toBe(hi);
      } else {
        expect(impulse[0]!.price).toBe(hi);
        expect(impulse[5]!.price).toBe(lo);
      }
    }
    for (const p of hardP) {
      const sc = Object.keys(p.ref.scan.byScenario).filter((k) => k !== 'w3-next');
      expect(sc.length).toBeGreaterThanOrEqual(2);
      expect(p.ref.scan.truncated).toBe(false);
      expect(p.ref.references.length).toBeLessThanOrEqual(3);
    }
  });
  it('окно: pad в [10, 30] свечей слева от точки 0 (easy/medium); hard - W в [80, 200] от T', () => {
    for (const p of [...easy, ...medium]) {
      const i0 = p.visible.findIndex((c) => c.openTime === p.ref.count.impulse[0]!.time);
      const from = p.visible.findIndex((c) => c.openTime === p.params.window.fromTime);
      expect(i0 - from).toBeGreaterThanOrEqual(10);
      expect(i0 - from).toBeLessThanOrEqual(30);
    }
    for (const p of hardP) {
      const from = p.visible.findIndex((c) => c.openTime === p.params.window.fromTime);
      expect(p.visible.length - 1 - from).toBeGreaterThanOrEqual(80);
      expect(p.visible.length - 1 - from).toBeLessThanOrEqual(200);
    }
  });
  it('разные seed дают разные T/окна не нарушая инвариантов', () => {
    const a = picks('ew-scenario', 1).map((p) => p.T);
    const b = picks('ew-scenario', 99).map((p) => p.T);
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    expect(a.join()).not.toBe(b.join());
  });

  it('отбраковка пропуска данных (§19): в видимом ряду или в будущем на лимит проигрывания', () => {
    const e = ewCatalog(h1, '1h', 'ew-impulse').find((x) => ewMakeTask(h1, '1h', x, 7))!;
    const base = ewMakeTask(h1, '1h', e, 7)!;
    expect(base).not.toBeNull();
    const iT = base.iT;
    // SYNTHETIC: удалена 1 реальная свеча (имитация пропуска архива, как 2026-10-28), цены остальных не менялись
    const cut = (k: number) => [...h1.slice(0, k), ...h1.slice(k + 1)];
    expect(ewMakeTask(cut(iT + 30), '1h', e, 7)).toBeNull(); // в будущем, внутри лимита 72
    expect(ewMakeTask(cut(iT - 100), '1h', e, 7)).toBeNull(); // в видимом ряду
    expect(ewMakeTask(cut(iT + 200), '1h', e, 7)).not.toBeNull(); // вне окон - не влияет
  });
  it('запись, чья точка отсутствует в ряду, даёт null', () => {
    const e = ewCatalog(h1, '1h', 'ew-impulse')[0]!;
    expect(ewMakeTask(h1.slice(2000), '1h', e, 7)).toBeNull();
  });
  it('ряд короче 500 свечей до T (начало архива) - null', () => {
    const e = ewCatalog(h1, '1h', 'ew-impulse')[0]!;
    const i = h1.findIndex((c) => c.openTime === e.lastPivotTime);
    expect(ewMakeTask(h1.slice(i - 100), '1h', e, 7)).toBeNull();
  });
  it('TIMEFRAME_MS согласован с шагом ряда', () => {
    expect(h1[1]!.openTime - h1[0]!.openTime).toBe(TIMEFRAME_MS['1h']);
  });
});
