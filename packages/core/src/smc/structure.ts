// Тренд, BOS и CHoCH: внешний слой (защищённые уровни, §5.2) и внутренний слой («последний swing», §5.3).
import type { Candle, LayerState, Scope, StructureEvent, Swing } from '../types';

export interface LayerRun {
  events: StructureEvent[];
  /** Состояние после обработки свечи k. */
  snapshots: LayerState[];
}

function makeEvent(
  kind: 'bos' | 'choch',
  direction: 'bull' | 'bear',
  scope: Scope,
  ref: Swing,
  k: number,
  c: Candle,
): StructureEvent {
  return {
    kind,
    direction,
    scope,
    level: ref.price,
    brokenSwing: { index: ref.index, time: ref.time, type: ref.type },
    breakIndex: k,
    breakTime: c.openTime,
  };
}

interface Range {
  from: number;
  to: number;
}

/** Внешний слой: машина состояний с защищёнными уровнями. */
export function runExternalLayer(candles: readonly Candle[], swings: readonly Swing[]): LayerRun {
  const events: StructureEvent[] = [];
  const snapshots: LayerState[] = [];
  let trend: LayerState['trend'] = 'none';
  let refHigh: Swing | null = null;
  let refLow: Swing | null = null;
  let refHighOrigin: Range | null = null;
  let refLowOrigin: Range | null = null;
  let bullRange: Range | null = null;
  let bearRange: Range | null = null;
  let lastEvent: StructureEvent | null = null;
  const confirmedHighs: Swing[] = [];
  const confirmedLows: Swing[] = [];
  let ptr = 0;

  const onHigh = (s: Swing) => {
    confirmedHighs.push(s);
    if (trend === 'down' && bearRange && bearRange.from < s.index && s.index <= bearRange.to) {
      if (refHigh === null || refHighOrigin !== bearRange || s.price > refHigh.price) {
        refHigh = s;
        refHighOrigin = bearRange;
      }
    } else if (trend === 'up') {
      if (refHigh === null || s.price > refHigh.price) refHigh = s;
    } else if (trend === 'none') {
      refHigh = s;
    } else if (refHigh === null) {
      refHigh = s;
    }
  };
  const onLow = (s: Swing) => {
    confirmedLows.push(s);
    if (trend === 'up' && bullRange && bullRange.from < s.index && s.index <= bullRange.to) {
      if (refLow === null || refLowOrigin !== bullRange || s.price < refLow.price) {
        refLow = s;
        refLowOrigin = bullRange;
      }
    } else if (trend === 'down') {
      if (refLow === null || s.price < refLow.price) refLow = s;
    } else if (trend === 'none') {
      refLow = s;
    } else if (refLow === null) {
      refLow = s;
    }
  };

  for (let k = 0; k < candles.length; k++) {
    const c = candles[k]!;
    while (ptr < swings.length && swings[ptr]!.confirmedIndex <= k) {
      const s = swings[ptr++]!;
      if (s.type === 'high') onHigh(s);
      else onLow(s);
    }
    let bull = refHigh !== null && c.close > (refHigh as Swing).price;
    let bear = refLow !== null && c.close < (refLow as Swing).price;
    if (bull && bear) {
      if (trend === 'up') bull = false;
      else bear = false;
    }
    if (bull) {
      const broken = refHigh as Swing;
      const ev = makeEvent(trend === 'down' ? 'choch' : 'bos', 'bull', 'external', broken, k, c);
      events.push(ev);
      lastEvent = ev;
      trend = 'up';
      refHigh = null;
      bullRange = { from: broken.index, to: k };
      let best: Swing | null = null;
      for (const s of confirmedLows) {
        if (broken.index < s.index && s.index <= k && (best === null || s.price < best.price)) best = s;
      }
      if (best) {
        refLow = best;
        refLowOrigin = bullRange;
      }
    } else if (bear) {
      const broken = refLow as Swing;
      const ev = makeEvent(trend === 'up' ? 'choch' : 'bos', 'bear', 'external', broken, k, c);
      events.push(ev);
      lastEvent = ev;
      trend = 'down';
      refLow = null;
      bearRange = { from: broken.index, to: k };
      let best: Swing | null = null;
      for (const s of confirmedHighs) {
        if (broken.index < s.index && s.index <= k && (best === null || s.price > best.price)) best = s;
      }
      if (best) {
        refHigh = best;
        refHighOrigin = bearRange;
      }
    }
    snapshots.push({ trend, refHigh, refLow, lastEvent });
  }
  return { events, snapshots };
}

/** Внутренний слой: всегда последний подтверждённый swing. */
export function runInternalLayer(candles: readonly Candle[], swings: readonly Swing[]): LayerRun {
  const events: StructureEvent[] = [];
  const snapshots: LayerState[] = [];
  let trend: LayerState['trend'] = 'none';
  let refHigh: Swing | null = null;
  let refLow: Swing | null = null;
  let lastEvent: StructureEvent | null = null;
  let ptr = 0;
  for (let k = 0; k < candles.length; k++) {
    const c = candles[k]!;
    while (ptr < swings.length && swings[ptr]!.confirmedIndex <= k) {
      const s = swings[ptr++]!;
      if (s.type === 'high') refHigh = s;
      else refLow = s;
    }
    let bull = refHigh !== null && c.close > (refHigh as Swing).price;
    let bear = refLow !== null && c.close < (refLow as Swing).price;
    if (bull && bear) {
      if (trend === 'up') bull = false;
      else bear = false;
    }
    if (bull) {
      const ev = makeEvent(trend === 'down' ? 'choch' : 'bos', 'bull', 'internal', refHigh as Swing, k, c);
      events.push(ev);
      lastEvent = ev;
      trend = 'up';
      refHigh = null;
    } else if (bear) {
      const ev = makeEvent(trend === 'up' ? 'choch' : 'bos', 'bear', 'internal', refLow as Swing, k, c);
      events.push(ev);
      lastEvent = ev;
      trend = 'down';
      refLow = null;
    }
    snapshots.push({ trend, refHigh, refLow, lastEvent });
  }
  return { events, snapshots };
}
