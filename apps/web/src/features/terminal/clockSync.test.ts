import { describe, expect, it } from 'vitest';
import { ClockSync, eventTimeOf } from './clockSync';

describe('ClockSync', () => {
  it('без данных - 0', () => expect(new ClockSync().offset()).toBe(0));
  it('WS-событие приоритетнее Date-заголовка', () => {
    const s = new ClockSync();
    s.addDateHeader('Tue, 20 Oct 2026 10:00:00 GMT', Date.parse('Tue, 20 Oct 2026 10:00:10 GMT'));
    expect(s.offset()).toBe(-9500);
    s.addEvent(1_000_300, 1_000_000);
    expect(s.offset()).toBe(300);
  });
  it('игнорирует неверный Date', () => {
    const s = new ClockSync();
    s.addDateHeader('nope');
    s.addDateHeader(null);
    expect(s.offset()).toBe(0);
  });
  it('eventTimeOf читает E из WS-сообщения', () => {
    expect(eventTimeOf('{"e":"kline","E":1792454460000}')).toBe(1792454460000);
    expect(eventTimeOf('bad')).toBeNull();
  });
});
