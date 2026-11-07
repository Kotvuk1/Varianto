import * as icons from 'lucide-react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Chip, ProgressBar, ToastProvider, useToast } from '.';

// Имена иконок из COMPONENTS.md §1, используемые в коде (PascalCase-формы lucide).
const USED = [
  'ChartCandlestick', 'BookOpen', 'ChartNoAxesColumn', 'Settings', 'X', 'ChevronDown', 'ChevronRight',
  'Check', 'Search', 'Minus', 'Plus', 'TriangleAlert', 'LoaderCircle',
];

describe('lucide-react', () => {
  it.each(USED)('иконка %s существует в установленной версии', (name) => {
    expect((icons as Record<string, unknown>)[name]).toBeTruthy();
  });
});

describe('Button', () => {
  it('aria-disabled блокирует клик, но остаётся в фокусе', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Проверить</Button>);
    const b = screen.getByRole('button', { name: 'Проверить' });
    await userEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
    expect(b.getAttribute('aria-disabled')).toBe('true');
    expect(b.hasAttribute('disabled')).toBe(false);
  });
  it('loading: aria-busy и блокировка', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Повторить</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });
});

describe('Chip', () => {
  it('переключается и показывает выбор', async () => {
    const onSelectedChange = vi.fn();
    render(<Chip selected={false} onSelectedChange={onSelectedChange}>BOS</Chip>);
    await userEvent.click(screen.getByRole('button', { name: 'BOS' }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });
});

describe('ProgressBar', () => {
  it('aria-значения ограничены диапазоном', () => {
    render(<ProgressBar value={15} max={10} label="Цель" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('10');
  });
});

describe('Toast', () => {
  afterEach(() => vi.useRealTimers());
  function Trigger() {
    const t = useToast();
    return <button onClick={() => t.show({ message: 'Метка удалена' })}>go</button>;
  }
  it('показывается и закрывается через 4 с', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ToastProvider><Trigger /></ToastProvider>);
    await userEvent.click(screen.getByText('go'));
    expect(screen.getByText('Метка удалена')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByText('Метка удалена')).toBeNull();
  });
});
