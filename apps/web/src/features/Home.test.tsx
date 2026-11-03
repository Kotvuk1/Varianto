import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Home } from './Home';

describe('Home', () => {
  it('показывает заголовок Trading Lab', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'Trading Lab' })).toBeTruthy();
  });
});
