import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Annotated, splitTerms } from './terms';

const terms = (s: string) => splitTerms(s).filter((x) => x.term).map((x) => x.text);

describe('splitTerms', () => {
  it('находит известные термины, длинные раньше коротких', () => {
    expect(terms('Был Liquidity sweep перед Order Block, а не FVG')).toEqual(['Liquidity sweep', 'Order Block', 'FVG']);
    expect(terms('Swing High и Swing Low; HH, HL, LH, LL')).toEqual(['Swing High', 'Swing Low', 'HH', 'HL', 'LH', 'LL']);
    expect(terms('R:R 1:3, результат +2.0 R, WAIT')).toEqual(['R:R', 'R', 'WAIT']);
    expect(terms('BOS, CHoCH, iBOS, Pin bar, Inside bar, Doji, Engulfing, Morning star, Evening star')).toHaveLength(9);
  });
  it('не трогает части слов и кириллицу', () => {
    expect(terms('ROBOT BOSS Rate Ручка')).toEqual([]);
  });
  it('сохраняет исходный текст целиком', () => {
    const s = 'Отметьте BOS и CHoCH (смена) в области.';
    expect(splitTerms(s).map((x) => x.text).join('')).toBe(s);
  });
});

describe('Term', () => {
  it('нажатие открывает определение из словаря', async () => {
    render(<Annotated text="Был Liquidity sweep?" />);
    await userEvent.click(screen.getByTestId('term'));
    expect(screen.getByTestId('term-def').textContent).toContain('забирает стопы');
  });
});
