import { describe, expect, it } from 'vitest';
import type { Mark } from '@tl/core';
import { parseMarks, serializeMarks } from './serialize';

const m: Mark = {
  id: 'a',
  kind: 'bos',
  anchors: [
    { time: 1_700_000_000_000, price: 64210.5 },
    { time: 1_700_003_600_000, price: 64210.5 },
  ],
  scope: 'internal',
  direction: 'bull',
  meta: { note: 'x' },
  author: 'user',
};

describe('сериализация меток', () => {
  it('туда-обратно без потерь', () => {
    const r = parseMarks(serializeMarks([m]));
    expect(r.marks).toEqual([m]);
    expect(r.dropped).toBe(0);
  });
  it('хранит время и цену, а не пиксели', () => {
    const json = serializeMarks([m]);
    expect(json).toContain('"time":1700000000000');
    expect(json).not.toMatch(/"(x|y)":/);
  });
  it('битый JSON и чужая структура дают пустой список, а не исключение', () => {
    expect(parseMarks('{{').marks).toEqual([]);
    expect(parseMarks('{"v":1,"marks":"no"}').marks).toEqual([]);
  });
  it('невалидные метки отбрасываются и считаются', () => {
    const bad = { ...m, id: 'b', kind: 'unknown' };
    const noAnchor = { ...m, id: 'c', anchors: [] };
    const nan = { ...m, id: 'd', anchors: [{ time: 1, price: null }] };
    const r = parseMarks(JSON.stringify({ v: 1, marks: [m, bad, noAnchor, nan] }));
    expect(r.marks.map((x) => x.id)).toEqual(['a']);
    expect(r.dropped).toBe(3);
  });
});
