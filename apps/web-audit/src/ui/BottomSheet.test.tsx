import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet';

function Harness({ modal = true, onClose }: { modal?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>открыть</button>
      <BottomSheet
        open={open}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        title="Разбор"
        modal={modal}
        footer={<button>Следующее задание</button>}
      >
        <p>содержимое</p>
      </BottomSheet>
    </>
  );
}

describe('BottomSheet', () => {
  it('закрыт: не в DOM', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('открывается как dialog с заголовком и фокусом на заголовке', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('открыть'));
    const dialog = screen.getByRole('dialog', { name: 'Разбор' });
    expect(dialog).toBeTruthy();
    expect(screen.getByText('содержимое')).toBeTruthy();
    expect(screen.getByText('Следующее задание')).toBeTruthy();
    expect(document.activeElement?.textContent).toBe('Разбор');
  });

  it('закрывается кнопкой, Esc и скримом; фокус возвращается на кнопку', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByText('открыть');

    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);

    await userEvent.click(opener);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(opener);
    await userEvent.click(screen.getByTestId('sheet-scrim'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('немодальная шторка не имеет скрима', async () => {
    render(<Harness modal={false} />);
    await userEvent.click(screen.getByText('открыть'));
    expect(screen.queryByTestId('sheet-scrim')).toBeNull();
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('false');
  });
});
