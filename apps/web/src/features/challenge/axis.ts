// Относительная ось времени Challenge: дата сценария скрыта (FR-TC-02, AC-08). Никаких абсолютных дат.
const M = 60_000;
const H = 60 * M;
const D = 24 * H;
const MINUS = '−';

const STEPS = [15 * M, 30 * M, H, 2 * H, 3 * H, 6 * H, 12 * H, D, 2 * D, 5 * D, 10 * D, 30 * D, 90 * D];

/** «−12ч», «−1ч 30м», «+4ч», «−5д»; 0 -> now. */
export function relativeLabel(t: number, decisionTime: number, now: string): string {
  const d = t - decisionTime;
  if (d === 0) return now;
  const sign = d < 0 ? MINUS : '+';
  return `${sign}${relativeDuration(Math.abs(d))}`;
}

/** Длительность без знака: «45м», «5ч 37м», «3д». */
export function relativeDuration(ms: number): string {
  if (ms < H) return `${Math.max(1, Math.round(ms / M))}м`;
  if (ms < 2 * D) {
    const h = Math.floor(ms / H);
    const m = Math.round((ms - h * H) / M);
    return m === 0 ? `${h}ч` : `${h}ч ${m}м`;
  }
  const d = Math.floor(ms / D);
  const h = Math.round((ms - d * D) / H);
  return h === 0 || h === 24 ? `${h === 24 ? d + 1 : d}д` : `${d}д ${h}ч`;
}

export interface AxisTick {
  x: number;
  label: string;
}

/** Метки по видимому окну: шаг подбирается из «круглых» относительных величин, привязка к моменту решения. */
export function axisTicks(
  win: { center: number; width: number },
  decisionTime: number,
  paneWidth: number,
  now: string,
  minGapPx = 72,
): AxisTick[] {
  if (!(win.width > 0) || !(paneWidth > 0)) return [];
  const from = win.center - win.width / 2;
  const want = Math.max(2, Math.floor(paneWidth / minGapPx));
  const step = STEPS.find((s) => win.width / s <= want) ?? STEPS[STEPS.length - 1]!;
  const first = decisionTime + Math.ceil((from - decisionTime) / step) * step;
  const out: AxisTick[] = [];
  for (let t = first; t <= from + win.width; t += step) {
    const x = ((t - from) / win.width) * paneWidth;
    if (x >= 24 && x <= paneWidth - 24) out.push({ x, label: relativeLabel(t, decisionTime, now) });
    if (out.length > 24) break;
  }
  return out;
}
