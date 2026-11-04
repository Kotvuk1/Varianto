import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { TaskIntro } from './TaskIntro';
import { useTaskIntro } from './useTaskIntro';

function Host() {
  const g = useTaskIntro('pa-context');
  return (
    <>
      <button onClick={g.show}>i</button>
      <TaskIntro introKey="pa-context" open={g.open} onClose={g.close} onNever={g.never} />
    </>
  );
}

describe('интро задания', () => {
  beforeEach(() => window.localStorage.clear());

  it('показывается при первом входе с тремя разделами', () => {
    render(<Host />);
    const intro = screen.getByTestId('task-intro');
    expect(intro.textContent).toContain('Что сделать');
    expect(intro.textContent).toContain('Как выглядит правильный ответ');
    expect(intro.textContent).toContain('Как оценивается');
  });

  it('«Понятно» закрывает, но при следующем входе интро снова показывается; (i) открывает повторно', async () => {
    const { unmount } = render(<Host />);
    await userEvent.click(screen.getByTestId('intro-ok'));
    expect(screen.queryByTestId('task-intro')).toBeNull();
    await userEvent.click(screen.getByText('i'));
    expect(screen.getByTestId('task-intro')).toBeTruthy();
    unmount();
    render(<Host />);
    expect(screen.getByTestId('task-intro')).toBeTruthy();
  });

  it('«Больше не показывать» сохраняется: новый вход без интро, но (i) работает', async () => {
    const { unmount } = render(<Host />);
    await userEvent.click(screen.getByTestId('intro-never'));
    expect(screen.queryByTestId('task-intro')).toBeNull();
    unmount();
    render(<Host />);
    expect(screen.queryByTestId('task-intro')).toBeNull();
    await userEvent.click(screen.getByText('i'));
    expect(screen.getByTestId('task-intro')).toBeTruthy();
  });

  it('недоступный localStorage не ломает интро', async () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('denied');
    };
    try {
      render(<Host />);
      expect(screen.getByTestId('task-intro')).toBeTruthy();
    } finally {
      Storage.prototype.getItem = orig;
    }
  });
});
