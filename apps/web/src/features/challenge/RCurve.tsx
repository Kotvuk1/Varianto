// Кривая результата в R: простая линия нейтрального цвета, без красного/зелёного (DESIGN.md).
import { ch } from '@/i18n/ru/challenge';

const W = 320;
const H = 96;
const PAD = 8;

export function RCurve({ curve }: { curve: readonly number[] }) {
  if (curve.length === 0) return <p className="text-sm text-text-2">{ch.stats.curveEmpty}</p>;
  const pts = [0, ...curve];
  const lo = Math.min(...pts, 0);
  const hi = Math.max(...pts, 0);
  const span = hi - lo || 1;
  const x = (i: number) => PAD + (i / Math.max(1, pts.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - 2 * PAD);
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = curve[curve.length - 1]!;
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${ch.stats.curve}: ${curve.length}, ${last.toFixed(1)} R`}
        className="h-24 w-full text-text-1"
        data-testid="r-curve"
      >
        <line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke="var(--border-strong)" strokeDasharray="3 4" strokeWidth="1" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <figcaption className="text-xs text-text-2">{ch.stats.curve}</figcaption>
    </figure>
  );
}
