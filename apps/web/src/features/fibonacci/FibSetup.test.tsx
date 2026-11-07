import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FibSetup } from './FibSetup';

describe('FibSetup', () => {
  it('три типа заданий; выбор меняет ссылку «Начать»', async () => {
    render(<FibSetup />);
    for (const t of ['Построй сетку', 'Где реакция?', 'Цель по Extension']) expect(screen.getByRole('radio', { name: new RegExp(t) })).toBeTruthy();
    const start = screen.getByTestId('start-session');
    expect(start.getAttribute('href')).toBe('/learn/fibonacci/session?type=grid&difficulty=easy&tf=1h');
    await userEvent.click(screen.getByRole('radio', { name: /Цель по Extension/ }));
    expect(screen.getByTestId('start-session').getAttribute('href')).toContain('type=extension');
  });
});
