import { describe, expect, it } from 'vitest';
import { ClockOffsetEstimator, formatCountdown, remainingMs } from './countdown';

describe('formatCountdown', () => {
  it('0 и отрицательные значения - 00:00', () => {
    expect(formatCountdown(0, '15m')).toBe('00:00');
    expect(formatCountdown(-5000, '1h')).toBe('00:00');
    expect(formatCountdown(-1, '1d')).toBe('0:00:00');
  });
  it('59 секунд и округление вверх', () => {
    expect(formatCountdown(59_000, '15m')).toBe('00:59');
    expect(formatCountdown(58_001, '15m')).toBe('00:59');
    expect(formatCountdown(1, '15m')).toBe('00:01');
  });
  it('1 час: для 15m/1h - mm:ss до часа, затем h:mm:ss', () => {
    expect(formatCountdown(3_599_000, '1h')).toBe('59:59');
    expect(formatCountdown(3_600_000, '4h')).toBe('1:00:00');
    expect(formatCountdown(3 * 3_600_000 + 5_000, '4h')).toBe('3:00:05');
  });
  it('1 день: всегда h:mm:ss', () => {
    expect(formatCountdown(59_000, '1d')).toBe('0:00:59');
    expect(formatCountdown(86_400_000, '1d')).toBe('24:00:00');
  });
});

describe('remainingMs', () => {
  it('учитывает offset (серверное время = локальное + offset)', () => {
    expect(remainingMs(10_000, 4_000, 0)).toBe(6_000);
    expect(remainingMs(10_000, 4_000, 1_000)).toBe(5_000);
    expect(remainingMs(10_000, 4_000, -1_000)).toBe(7_000);
  });
  it('не уходит в минус', () => {
    expect(remainingMs(10_000, 10_000, 0)).toBe(0);
    expect(remainingMs(10_000, 15_000, 0)).toBe(0);
  });
});

describe('ClockOffsetEstimator', () => {
  it('без данных offset = 0', () => {
    expect(new ClockOffsetEstimator().offset()).toBe(0);
  });
  it('медиана последних N, выброс не влияет', () => {
    const e = new ClockOffsetEstimator(5);
    for (const [E, now] of [[1000, 0], [1010, 0], [5000, 0], [1020, 0], [1005, 0]] as const) e.addEvent(E, now);
    expect(e.offset()).toBe(1010);
  });
  it('окно ограничено N', () => {
    const e = new ClockOffsetEstimator(3);
    [100, 100, 100, 500, 500, 500].forEach((E) => e.addEvent(E, 0));
    expect(e.offset()).toBe(500);
  });
  it('четное число - среднее двух средних; Date-заголовок добавляется', () => {
    const e = new ClockOffsetEstimator(4);
    e.addEvent(10, 0);
    e.addEvent(20, 0);
    expect(e.offset()).toBe(15);
    e.addServerTime(2000, 0);
    expect(e.offset()).toBe(20);
  });
  it('игнорирует нечисловые', () => {
    const e = new ClockOffsetEstimator();
    e.addEvent(NaN, 0);
    expect(e.offset()).toBe(0);
  });
});
