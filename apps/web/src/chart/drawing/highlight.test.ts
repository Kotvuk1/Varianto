import { describe, expect, it } from 'vitest';
import { dimSpans, highlightColumns, labelTop } from './highlight';

describe('dimSpans', () => {
  it('затемняет слева и справа от окна', () => {
    expect(dimSpans(100, 300, 10, 400)).toEqual([{ x1: 0, x2: 95 }, { x1: 305, x2: 400 }]);
  });
  it('окно шире панели - затемнения нет', () => {
    expect(dimSpans(-50, 500, 10, 400)).toEqual([]);
  });
  it('окно целиком справа за панелью - вся панель затемнена слева', () => {
    expect(dimSpans(500, 700, 10, 400)).toEqual([{ x1: 0, x2: 400 }]);
  });
});

describe('highlightColumns', () => {
  const tx = (t: number) => t / 10;
  it('колонка шириной в шаг свечи вокруг центра, подпись сохраняется', () => {
    const r = highlightColumns([{ time: 1000, tone: 'focus', label: 'Pin bar' }], tx, 10, 400);
    expect(r).toEqual([{ x1: 95, x2: 105, cx: 100, tone: 'focus', time: 1000, label: 'Pin bar' }]);
  });
  it('минимальная ширина 6 px при плотном масштабе', () => {
    const [c] = highlightColumns([{ time: 1000, tone: 'ref' }], tx, 2, 400);
    expect(c!.x2 - c!.x1).toBe(6);
  });
  it('невидимые и нечисловые отбрасываются', () => {
    const r = highlightColumns(
      [{ time: -5000, tone: 'ref' }, { time: 9000, tone: 'ref' }, { time: NaN, tone: 'focus' }, { time: 200, tone: 'focus' }],
      tx,
      10,
      400,
    );
    expect(r.map((c) => c.time)).toEqual([200]);
  });
});

describe('labelTop', () => {
  it('над high с зазором', () => expect(labelTop(100, 140, 18, 300)).toBe(76));
  it('нет места сверху - под low', () => expect(labelTop(10, 50, 18, 300)).toBe(56));
  it('под low не уходит за низ панели', () => expect(labelTop(5, 295, 18, 300)).toBe(280));
});
