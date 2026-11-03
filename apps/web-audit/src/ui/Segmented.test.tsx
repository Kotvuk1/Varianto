import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Segmented } from './Segmented';

const OPTIONS = [
  { value: '15m', label: '15m' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H', disabled: true },
  { value: '1d', label: '1D' },
] as const;

function Harness({ onChange }: { onChange?: (v: string) => void }) {
  const [v, setV] = useState('1h');
  return (
    <Segmented
      label="Таймфрейм"
      options={OPTIONS}
      value={v}
      onChange={(x) => {
        onChange?.(x);
        setV(x);
      }}
    />
  );
}

describe('Segmented', () => {
  it('radiogroup с выбранным значением', () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Таймфрейм' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '1H' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: '15m' }).getAttribute('aria-checked')).toBe('false');
  });

  it('клик выбирает сегмент', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '1D' }));
    expect(onChange).toHaveBeenCalledWith('1d');
    expect(screen.getByRole('radio', { name: '1D' }).getAttribute('aria-checked')).toBe('true');
  });

  it('стрелки переключают, пропуская недоступные', async () => {
    render(<Harness />);
    screen.getByRole('radio', { name: '1H' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '1D' }).getAttribute('aria-checked')).toBe('true');
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: '1H' }).getAttribute('aria-checked')).toBe('true');
  });

  it('недоступный сегмент не выбирается', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '4H' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
