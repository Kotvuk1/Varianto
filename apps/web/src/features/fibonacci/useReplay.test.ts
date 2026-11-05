import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stepPlayed, useReplay } from './useReplay';

describe('проигрывание', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('шаг не выходит за число свечей', () => {
    expect(stepPlayed(2, 3)).toBe(3);
    expect(stepPlayed(3, 3)).toBe(3);
  });
  it('идёт по таймеру, пауза останавливает, «до конца» завершает', () => {
    const { result } = renderHook(() => useReplay(5, true));
    expect(result.current.played).toBe(0);
    act(() => void vi.advanceTimersByTime(700 / 4));
    expect(result.current.played).toBe(1);
    act(() => result.current.setPaused(true));
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current.played).toBe(1);
    expect(result.current.done).toBe(false);
    act(() => result.current.skip());
    expect(result.current.played).toBe(5);
    expect(result.current.done).toBe(true);
  });
  it('без активного проигрывания считается завершённым', () => {
    expect(renderHook(() => useReplay(5, false)).result.current.done).toBe(true);
  });
});
