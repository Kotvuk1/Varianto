import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElliottSetup } from './ElliottSetup';
import { ScenarioPanel } from './ScenarioPanel';

afterEach(cleanup);

describe('ElliottSetup', () => {
  it('три сложности; ТФ ограничены: на лёгком нет 15m, 1d нет нигде; выбор меняет ссылку', async () => {
    render(<ElliottSetup />);
    for (const t of ['Лёгкий', 'Средний', 'Сложный']) expect(screen.getByRole('radio', { name: new RegExp(t) })).toBeTruthy();
    const tf = screen.getByTestId('setup-tf');
    expect(within(tf).queryByRole('radio', { name: '15m' })).toBeNull();
    expect(within(tf).queryByRole('radio', { name: '1D' })).toBeNull();
    expect(screen.getByTestId('start-session').getAttribute('href')).toBe('/learn/elliott/session?difficulty=easy&tf=1h');
    await userEvent.click(within(tf).getByRole('radio', { name: '4H' }));
    await userEvent.click(screen.getByRole('radio', { name: /Сложный/ }));
    expect(screen.getByTestId('start-session').getAttribute('href')).toBe('/learn/elliott/session?difficulty=hard&tf=4h');
    expect(within(screen.getByTestId('setup-tf')).getByRole('radio', { name: '15m' })).toBeTruthy();
  });
});

function renderPanel(over: Partial<React.ComponentProps<typeof ScenarioPanel>> = {}) {
  const props: React.ComponentProps<typeof ScenarioPanel> = {
    primaryOptions: ['w3-next', 'w5-next', 'abc-next', 'trend-next'],
    primary: null,
    onPrimary: vi.fn(),
    alternative: null,
    onAlternative: vi.fn(),
    alternativeRequired: true,
    invalidation: null,
    onInvalidation: vi.fn(),
    disabled: false,
    ...over,
  };
  render(<ScenarioPanel {...props} />);
  return props;
}

describe('ScenarioPanel', () => {
  it('без основного сценария альтернативы не предлагаются', () => {
    renderPanel();
    expect(screen.getByTestId('alt-need-primary')).toBeTruthy();
    expect(screen.queryByTestId('option-correction-extends')).toBeNull();
  });
  it('альтернативы - только допустимые пары; на обязательном уровне нет «Без альтернативы»', () => {
    renderPanel({ primary: 'w5-next' });
    expect(screen.getByTestId('option-bc-next')).toBeTruthy();
    expect(screen.getByTestId('option-correction-extends')).toBeTruthy();
    expect(screen.queryByTestId('option-impulse-extends')).toBeNull();
    expect(screen.queryByTestId('option-none')).toBeNull();
  });
  it('на лёгком уровне есть «Без альтернативы», выбор уходит как null', async () => {
    const p = renderPanel({ primary: 'abc-next', alternativeRequired: false });
    expect(screen.getByTestId('option-impulse-extends')).toBeTruthy();
    await userEvent.click(screen.getByTestId('option-none'));
    expect(p.onAlternative).toHaveBeenCalledWith(null);
    await userEvent.click(screen.getByTestId('option-impulse-extends'));
    expect(p.onAlternative).toHaveBeenCalledWith('impulse-extends');
  });
  it('цена invalidation вводится числом; неверный ввод не отправляется', async () => {
    const p = renderPanel();
    await userEvent.type(screen.getByTestId('inv-input'), 'abc');
    await userEvent.click(screen.getByTestId('inv-set'));
    expect(p.onInvalidation).not.toHaveBeenCalled();
    await userEvent.clear(screen.getByTestId('inv-input'));
    await userEvent.type(screen.getByTestId('inv-input'), '65400,5');
    await userEvent.click(screen.getByTestId('inv-set'));
    expect(p.onInvalidation).toHaveBeenCalledWith(65400.5);
  });
  it('уровень с графика виден в поле', () => {
    renderPanel({ invalidation: 65482.7 });
    expect((screen.getByTestId('inv-input') as HTMLInputElement).value).toBe('65482.7');
  });
});
