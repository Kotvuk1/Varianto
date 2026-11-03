// Отображение результата анализа в Mark (ALGORITHMS §3.4) и сборка эталона для gradeMarks (§12.1).
import type {
  AlgoMarkSet,
  Fvg,
  Mark,
  MarkKind,
  OrderBlock,
  Scope,
  SkillId,
  StructureEvent,
  StructureResult,
  Swing,
  Sweep,
} from '../types';
import { allLayerSwings } from './analyze';

export type MarkClass =
  | 'swing'
  | 'label'
  | 'break'
  | 'sweep'
  | 'sweep-candidate'
  | 'ob'
  | 'fvg'
  | 'fvg-small';

export interface MarkItem {
  mark: Mark;
  cls: MarkClass;
  /** Ключевая свеча (индекс во входном массиве). */
  key: number;
  scope: Scope | null;
  /** Исходный объект. */
  src: Swing | StructureEvent | Sweep | OrderBlock | Fvg;
}

const mkId = (kind: MarkKind, scope: Scope | null, dir: string | null, time: number) =>
  `algo:${kind}:${scope ?? '-'}:${dir ?? '-'}:${time}`;

function swingMarks(s: Swing): MarkItem[] {
  const out: MarkItem[] = [];
  const kind: MarkKind = s.type === 'high' ? 'swing-high' : 'swing-low';
  const anchors = [{ time: s.time, price: s.price }];
  out.push({
    cls: 'swing',
    key: s.index,
    scope: s.scope,
    src: s,
    mark: { id: mkId(kind, s.scope, null, s.time), kind, anchors, scope: s.scope, direction: null, author: 'algo' },
  });
  if (s.label) {
    const lk = s.label.toLowerCase() as MarkKind;
    out.push({
      cls: 'label',
      key: s.index,
      scope: s.scope,
      src: s,
      mark: { id: mkId(lk, s.scope, null, s.time), kind: lk, anchors, scope: s.scope, direction: null, author: 'algo' },
    });
  }
  return out;
}

function eventMark(e: StructureEvent, r: StructureResult): MarkItem {
  const closeOf = r.closes?.[e.breakIndex];
  return {
    cls: 'break',
    key: e.breakIndex,
    scope: e.scope,
    src: e,
    mark: {
      id: mkId(e.kind, e.scope, e.direction, e.breakTime),
      kind: e.kind,
      anchors: [
        { time: e.brokenSwing.time, price: e.level },
        { time: e.breakTime, price: e.level },
      ],
      scope: e.scope,
      direction: e.direction,
      meta: { breakClose: closeOf ?? null },
      author: 'algo',
    },
  };
}

function sweepMark(s: Sweep, cls: 'sweep' | 'sweep-candidate'): MarkItem {
  const top = s.sweptSwings[0]!;
  const dir = s.side === 'high' ? 'bear' : 'bull';
  return {
    cls,
    key: s.index,
    scope: 'external',
    src: s,
    mark: {
      id: mkId('sweep', 'external', dir, s.time),
      kind: 'sweep',
      anchors: [
        { time: top.time, price: s.level },
        { time: s.time, price: s.wickExtreme },
      ],
      scope: 'external',
      direction: dir,
      meta: { side: s.side, sweptCount: s.sweptSwings.length },
      author: 'algo',
    },
  };
}

function endTimeOf(r: StructureResult, statusIndex: number | null): number {
  const i = statusIndex ?? r.times.length - 1;
  return r.times[i] ?? r.times[r.times.length - 1] ?? 0;
}

function obMark(o: OrderBlock, r: StructureResult): MarkItem {
  return {
    cls: 'ob',
    key: o.index,
    scope: 'external',
    src: o,
    mark: {
      id: mkId('order-block', 'external', o.direction, o.time),
      kind: 'order-block',
      anchors: [
        { time: o.time, price: o.top },
        { time: endTimeOf(r, o.status === 'fresh' ? null : o.statusIndex), price: o.bottom },
      ],
      scope: 'external',
      direction: o.direction,
      meta: {
        status: o.status,
        eventTime: o.event.breakTime,
        eventKind: o.event.kind,
        valid: o.valid,
        originTime: r.times[o.originIndex] ?? o.time,
      },
      author: 'algo',
    },
  };
}

function fvgMark(f: Fvg, r: StructureResult, cls: 'fvg' | 'fvg-small'): MarkItem {
  return {
    cls,
    key: f.middleIndex - 1,
    scope: null,
    src: f,
    mark: {
      id: mkId('fvg', null, f.direction, f.firstTime),
      kind: 'fvg',
      anchors: [
        { time: f.firstTime, price: f.top },
        { time: endTimeOf(r, f.status === 'filled' ? f.statusIndex : null), price: f.bottom },
      ],
      scope: null,
      direction: f.direction,
      meta: { status: f.status, middleTime: f.middleTime, size: f.size },
      author: 'algo',
    },
  };
}

/** Все объекты анализа в виде Mark с классом и ключевой свечой. Дубликаты id отбрасываются. */
export function markItems(r: StructureResult): MarkItem[] {
  const items: MarkItem[] = [];
  for (const s of r.swings) items.push(...swingMarks(s));
  for (const e of r.events) items.push(eventMark(e, r));
  for (const s of r.sweeps) items.push(sweepMark(s, 'sweep'));
  for (const s of r.sweepCandidates) items.push(sweepMark(s, 'sweep-candidate'));
  for (const o of r.orderBlocks) items.push(obMark(o, r));
  for (const f of r.fvgs) items.push(fvgMark(f, r, 'fvg'));
  for (const f of r.smallFvgs) items.push(fvgMark(f, r, 'fvg-small'));
  const seen = new Set<string>();
  return items.filter((it) => {
    const k = `${it.cls}|${it.mark.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export interface IndexWindow {
  fromIndex: number;
  toIndex: number;
}

/** Marks результата анализа (без кандидатов и малых FVG), опционально в окне по ключевой свече. */
export function toMarks(r: StructureResult, window?: IndexWindow): Mark[] {
  return markItems(r)
    .filter((it) => it.cls !== 'sweep-candidate' && it.cls !== 'fvg-small')
    .filter((it) => !window || (it.key >= window.fromIndex && it.key <= window.toIndex))
    .map((it) => it.mark);
}

const KIND_CONCEPT: Record<MarkClass, SkillId | null> = {
  swing: 'swing',
  label: 'structure-labels',
  break: null, // bos/choch — по kind
  sweep: 'sweep',
  'sweep-candidate': 'sweep',
  ob: 'order-block',
  fvg: 'fvg',
  'fvg-small': 'fvg',
};

function conceptOf(it: MarkItem): SkillId | null {
  if (it.cls === 'break') return it.mark.kind === 'bos' ? 'bos' : 'choch';
  return KIND_CONCEPT[it.cls];
}

/** Эталон для gradeMarks: required / tolerated по понятиям и окну (§12.1, §12.6). */
export function buildAlgoMarkSet(
  r: StructureResult,
  opts: { concepts: SkillId[]; window: IndexWindow },
): AlgoMarkSet {
  const { concepts, window } = opts;
  const withInternal = concepts.includes('internal-external');
  const required: Mark[] = [];
  const tolerated: Mark[] = [];
  for (const it of markItems(r)) {
    const concept = conceptOf(it);
    if (!concept || !concepts.includes(concept)) continue;
    if (it.key < window.fromIndex || it.key > window.toIndex) continue;
    if (it.scope === 'internal' && !withInternal) continue;
    if (it.cls === 'ob') {
      const o = it.src as OrderBlock;
      if (!o.valid) continue;
      (o.status === 'invalidated' ? tolerated : required).push(it.mark);
    } else if (it.cls === 'fvg') {
      const f = it.src as Fvg;
      (f.status === 'filled' ? tolerated : required).push(it.mark);
    } else if (it.cls === 'fvg-small' || it.cls === 'sweep-candidate') {
      tolerated.push(it.mark);
    } else {
      required.push(it.mark);
    }
  }

  const all = allLayerSwings(r);
  const closes = r.closes;
  const cache = new Map<number, Swing[]>();
  const refsAt = (k: number): Swing[] => {
    const hit = cache.get(k);
    if (hit) return hit;
    const live = all.filter((s) => {
      if (s.confirmedIndex >= k) return false;
      for (let j = s.confirmedIndex + 1; j < k; j++) {
        const cl = closes[j]!;
        if (s.type === 'high' ? cl > s.price : cl < s.price) return false;
      }
      return true;
    });
    cache.set(k, live);
    return live;
  };

  return {
    required,
    tolerated,
    aux: {
      sweepsCandidates: r.sweepCandidates,
      obCandidates: r.orderBlocks.filter((o) => !o.valid),
      pending: r.pendingSwings,
      smallFvgs: r.smallFvgs,
      refsAt,
    },
    params: r.params,
  };
}
