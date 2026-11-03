// Преобразование время (UTC мс) <-> логический индекс шкалы LWC (индекс свечи в массиве данных).
//
// Правило позиционирования (FR-DRAW-03, смена ТФ): openTime свечи i лежит ровно в центре бара (логический индекс i).
// Время между свечами интерполируется линейно между openTime соседних свечей: метка 15m-свечи 10:45 на графике 1H
// (свеча 10:00 = индекс i) ляжет в i + 0.75. В пропуске данных интерполяция идёт по реальным openTime соседних
// свечей, свечи не выдумываются. Справа от последней и слева от первой свечи - экстраполяция по шагу ТФ.

export class TimeIndex {
  constructor(
    /** openTime свечей по возрастанию. */
    readonly times: readonly number[],
    /** Шаг таймфрейма в мс. */
    readonly step: number,
  ) {}

  get length(): number {
    return this.times.length;
  }

  /** Индекс последней свечи с openTime <= t, либо -1. */
  private floorIndex(t: number): number {
    const a = this.times;
    let lo = 0;
    let hi = a.length - 1;
    let res = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (a[mid]! <= t) {
        res = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return res;
  }

  timeToLogical(t: number): number {
    const a = this.times;
    const n = a.length;
    if (n === 0) return 0;
    const i = this.floorIndex(t);
    if (i < 0) return (t - a[0]!) / this.step;
    if (i === n - 1) return i + (t - a[i]!) / this.step;
    return i + (t - a[i]!) / (a[i + 1]! - a[i]!);
  }

  logicalToTime(l: number): number {
    const a = this.times;
    const n = a.length;
    if (n === 0) return 0;
    if (l <= 0) return a[0]! + l * this.step;
    if (l >= n - 1) return a[n - 1]! + (l - (n - 1)) * this.step;
    const i = Math.floor(l);
    return a[i]! + (l - i) * (a[i + 1]! - a[i]!);
  }

  /** Индекс ближайшей свечи к логической позиции, в границах данных. */
  snapIndex(l: number): number {
    const n = this.times.length;
    if (n === 0) return 0;
    return Math.min(n - 1, Math.max(0, Math.round(l)));
  }

  /** openTime ближайшей свечи к времени t (якоря снапятся к openTime; вне данных - к крайней свече). */
  snapTime(t: number): number {
    if (this.times.length === 0) return t;
    return this.times[this.snapIndex(this.timeToLogical(t))]!;
  }
}
