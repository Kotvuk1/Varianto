// Статистика Challenge (ALGORITHMS §14.4, FR-PROG-04) из сохранённых попыток.
import type { Attempt } from '@/storage';

export interface ChallengeStats {
  positions: number;
  waits: number;
  /** Доля позиций с R > 0; null, если позиций нет. */
  winRate: number | null;
  avgR: number | null;
  waitCorrect: number | null;
  /** Накопленный результат в R по позициям в порядке времени. */
  curve: number[];
}

function waitCorrectOf(a: Attempt): boolean | null {
  const d = (a.grade as { detail?: { challenge?: { waitCorrect?: boolean | null } } }).detail;
  return d?.challenge?.waitCorrect ?? null;
}

export function sideOf(a: Attempt): string | null {
  const s = (a.answer as { side?: unknown } | null)?.side;
  return typeof s === 'string' ? s : null;
}

export function computeChallengeStats(attempts: readonly Attempt[]): ChallengeStats {
  const list = attempts.filter((a) => a.module === 'challenge').sort((x, y) => x.createdAt - y.createdAt);
  const pos = list.filter((a) => a.rMultiple !== null);
  const waits = list.filter((a) => sideOf(a) === 'WAIT');
  const rs = pos.map((a) => a.rMultiple as number);
  let acc = 0;
  const curve = rs.map((r) => (acc += r));
  return {
    positions: pos.length,
    waits: waits.length,
    winRate: pos.length ? rs.filter((r) => r > 0).length / pos.length : null,
    avgR: pos.length ? rs.reduce((s, r) => s + r, 0) / pos.length : null,
    waitCorrect: waits.length ? waits.filter((a) => waitCorrectOf(a) === true).length / waits.length : null,
    curve,
  };
}
