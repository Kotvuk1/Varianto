import { describe, expect, it } from 'vitest';
import { dimSpans } from './highlight';

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
