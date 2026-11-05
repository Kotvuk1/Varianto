'use client';
// Проигрывание будущего (как Challenge): шаг по таймеру, пауза, ×1/×4/×16, «До конца».
import { useCallback, useEffect, useState } from 'react';

export const REPLAY_SPEEDS = [1, 4, 16] as const;
export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number];
export const BASE_TICK_MS = 700;

/** Следующее число показанных свечей: не больше total. */
export const stepPlayed = (played: number, total: number): number => Math.min(total, played + 1);

export function useReplay(total: number, active: boolean) {
  const [played, setPlayed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(4);
  const done = !active || played >= total;
  useEffect(() => {
    if (!active || paused || played >= total) return;
    const id = setInterval(() => setPlayed((p) => stepPlayed(p, total)), BASE_TICK_MS / speed);
    return () => clearInterval(id);
  }, [active, paused, played, total, speed]);
  const skip = useCallback(() => setPlayed(total), [total]);
  return { played, paused, speed, done, setPaused, setSpeed, skip };
}
