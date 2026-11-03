import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { buildFeedback, type GradeError } from '@tl/core';
import { FeedbackView, GradeLegend, renderBlock } from './index';

const errors: GradeError[] = [
  { code: 'BOS_CHOCH_CONFUSED', skill: 'choch', severity: 'major', markIds: ['m1'], params: { time: Date.UTC(2026, 9, 29, 20), given: 'bos', expected: 'choch' } },
];
const feedback = buildFeedback({ module: 'market-structure', verdict: 'partial', score: 0.5, errors, skillOutcomes: [{ skill: 'swing', correct: 2, total: 3 }] });

describe('FeedbackView', () => {
  it('показывает 6 частей разбора с текстами шаблонов ядра', () => {
    render(<FeedbackView feedback={feedback} />);
    for (const id of ['fb-fb-verdict', 'fb-fb-understood', 'fb-fb-mistakes', 'fb-fb-why', 'fb-fb-howto', 'fb-fb-principle']) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
    expect(screen.getByTestId('fb-fb-verdict').textContent).toContain('50%');
    expect(screen.getByTestId('fb-mistakes-list').textContent).not.toMatch(/\{\w+\}/); // плейсхолдеры подставлены
    expect(within(screen.getByTestId('fb-fb-understood')).getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('ошибка с метками кликабельна; состояние дано подписью, а не только иконкой', async () => {
    const onFocus = vi.fn();
    render(<FeedbackView feedback={feedback} onFocusMarks={onFocus} />);
    await userEvent.click(within(screen.getByTestId('fb-mistakes-list')).getByRole('button'));
    expect(onFocus).toHaveBeenCalledWith(['m1']);
    expect(within(screen.getByTestId('fb-mistakes-list')).getAllByText(/Лишнее|Пропущено/).length).toBeGreaterThan(0);
  });

  it('время и цены в параметрах форматируются UI', () => {
    const t = renderBlock('feedback.BOS_WRONG_LEVEL.mistake', { time: Date.UTC(2026, 9, 29, 20), kind: 'bos', given: 1, level: 81950 }, (p) => `P${p}`);
    expect(t).not.toContain(String(Date.UTC(2026, 9, 29, 20)));
  });
});

describe('GradeLegend', () => {
  it('три состояния с подписями', () => {
    render(<GradeLegend />);
    const l = screen.getByTestId('grade-legend');
    expect(l.textContent).toMatch(/Совпало/);
    expect(l.textContent).toMatch(/Пропущено/);
    expect(l.textContent).toMatch(/Лишнее/);
  });
});
