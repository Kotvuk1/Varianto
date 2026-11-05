// Mark эталонных разметок Elliott (ELLIOTT.md §2.1): algo:ew-impulse|ew-zigzag|ew-flat:-:<dir>:<time>, hline invalidation.
import type { Mark } from '../types';
import { measure, sgOf, impulseGuides } from './measure';
import { countPoints } from './scenarios';
import type { WaveCount, WavePoint } from './types';

export const ewImpulseId = (dir: string, t0: number): string => `algo:ew-impulse:-:${dir}:${t0}`;
export const ewCorrectionId = (type: string, dir: string, tA: number): string => `algo:ew-${type}:-:${dir}:${tA}`;

const anchorsOf = (pts: readonly WavePoint[]) => pts.map((p) => ({ time: p.time, price: p.price }));

/** Метки разметки: импульс и (если есть) коррекция. У bc-next коррекции в метках нет (только точка A внутри импульса не показывается). */
export function countMarks(count: WaveCount, authorSuffix = ''): Mark[] {
  const sg = sgOf(count.direction);
  const pts = countPoints(count);
  const v = pts.map((p) => sg * p.price);
  const full = count.scenario === 'bc-next' ? v.slice(0, 6) : v;
  const m = measure(full);
  const idx = pts.map((p) => p.index);
  const out: Mark[] = [
    {
      id: ewImpulseId(count.direction, count.impulse[0]!.time) + authorSuffix,
      kind: 'ew-impulse',
      anchors: anchorsOf(count.impulse),
      scope: null,
      direction: count.direction,
      meta: {
        labels: count.impulse.map((p) => p.label),
        scenario: count.scenario,
        lengths: m.L,
        ratios: Object.fromEntries(
          Object.entries({ r2: m.r2, r3: m.r3, r4: m.r4, w5a: m.w5a, w5b: m.w5b }).filter(([, x]) => x !== null && Number.isFinite(x)),
        ),
        guides: impulseGuides(m, full.slice(0, count.impulse.length), idx.slice(0, count.impulse.length)).filter((g) => g.ok).map((g) => g.guide),
        extended3: m.extended3,
      },
      author: 'algo',
    },
  ];
  if (count.correction && count.scenario === 'trend-next') {
    const c = count.correction;
    out.push({
      id: ewCorrectionId(c.type, count.direction, c.points[0]!.time) + authorSuffix,
      kind: c.type === 'zigzag' ? 'ew-zigzag' : 'ew-flat',
      anchors: anchorsOf(c.points),
      scope: null,
      direction: count.direction,
      meta: {
        labels: c.points.map((p) => p.label),
        retrB: m.retrB,
        cBeyond: m.cBeyond,
        cLen: m.cLen,
      },
      author: 'algo',
    });
  }
  return out;
}

export function invalidationMark(price: number, time: number): Mark {
  return {
    id: 'algo:ew-invalidation',
    kind: 'hline',
    anchors: [{ time, price }],
    scope: null,
    direction: null,
    meta: { role: 'ew-invalidation', price },
    author: 'algo',
  };
}
