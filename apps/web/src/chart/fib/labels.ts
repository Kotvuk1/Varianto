// Раскладка подписей без наложений: жадно по приоритету; важные (<= NUDGE_MAX) сдвигаются по вертикали,
// остальные скрываются при коллизии. Чистая геометрия, без canvas.
import type { MarkGeometry, Part } from '../drawing/layout';

export const NUDGE_MAX = 2.5;
/** Подписи, которые остаются даже при неустранимой коллизии (уровни 0, 0.5, 0.618, 1 и выбранный); P/D при нехватке места скрывается. */
const FORCE_MAX = 2;

export interface LabelItem {
  key: string;
  /** Центр плашки. */
  x: number;
  y: number;
  w: number;
  prio: number;
  /** Неподвижное препятствие (чужие подписи): ставится первым, не скрывается. */
  fixed?: boolean;
}

const hit = (a: { x: number; y: number; w: number }, b: { x: number; y: number; w: number }, h: number) =>
  Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < h;

/** key -> итоговый центр (или null, если подпись скрыта). */
export function layoutLabels(items: readonly LabelItem[], h: number): Map<string, { x: number; y: number } | null> {
  const out = new Map<string, { x: number; y: number } | null>();
  const placed: LabelItem[] = [];
  const order = [...items].sort((a, b) => Number(!!b.fixed) - Number(!!a.fixed) || a.prio - b.prio);
  for (const it of order) {
    if (it.fixed) {
      placed.push(it);
      out.set(it.key, { x: it.x, y: it.y });
      continue;
    }
    const offsets = it.prio <= NUDGE_MAX ? [0, -h, h, -2 * h, 2 * h] : [0];
    const ok = offsets.find((dy) => !placed.some((p) => hit({ x: it.x, y: it.y + dy, w: it.w }, p, h)));
    if (ok === undefined) {
      if (it.prio <= FORCE_MAX) {
        placed.push(it);
        out.set(it.key, { x: it.x, y: it.y });
      } else out.set(it.key, null);
      continue;
    }
    const p = { ...it, y: it.y + ok };
    placed.push(p);
    out.set(it.key, { x: p.x, y: p.y });
  }
  return out;
}

const REMOVABLE_KINDS = new Set(['level', 'hline']);

/**
 * Раскладка подписей всех меток вместе (сетки пользователя и эталона, ценовые плашки линий).
 * Подписи сеток (с prio) двигаются/скрываются; ценовые плашки level/hline уступают сеткам; прочие подписи неподвижны.
 */
export function resolveLabelCollisions(geos: readonly MarkGeometry[], h: number, tw: (p: Extract<Part, { t: 'text' }>) => number): MarkGeometry[] {
  const items: LabelItem[] = [];
  geos.forEach((g, gi) =>
    g.parts.forEach((p, pi) => {
      if (p.t !== 'text') return;
      const key = `${gi}:${pi}`;
      const fib = p.prio !== undefined;
      const removable = !fib && REMOVABLE_KINDS.has(g.mark.kind);
      items.push({ key, x: p.x, y: p.y, w: tw(p), prio: fib ? p.prio! : removable ? 3.5 : 0, fixed: !fib && !removable });
    }),
  );
  if (!items.some((i) => !i.fixed)) return [...geos];
  const res = layoutLabels(items, h);
  return geos.map((g, gi) => {
    if (!g.parts.some((p) => p.t === 'text' && (p.prio !== undefined || REMOVABLE_KINDS.has(g.mark.kind)))) return g;
    const parts: Part[] = [];
    g.parts.forEach((p, pi) => {
      if (p.t !== 'text') return void parts.push(p);
      const r = res.get(`${gi}:${pi}`);
      if (r === undefined) return void parts.push(p);
      if (r !== null) parts.push(r.x === p.x && r.y === p.y ? p : { ...p, x: r.x, y: r.y });
    });
    return { ...g, parts };
  });
}
