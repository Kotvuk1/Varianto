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

describe('форматирование и дедупликация', () => {
  const fmt = (p: number) => `P${p}`;
  it('типы меток через словарь имён, цены через единый форматер', () => {
    const t = renderBlock('feedback.BOS_CHOCH_CONFUSED.mistake', { time: Date.UTC(2026, 9, 29, 20), given: 'bos', expected: 'choch' }, fmt);
    expect(t).toContain('отмечен BOS, а это CHoCH');
    const h = renderBlock('feedback.BOS_CHOCH_CONFUSED.howTo', { protected: 81155.4 }, fmt);
    expect(h).toContain('P81155.4');
    expect(h).not.toMatch(/\{\w+\}/);
  });

  it('«Почему так»: одинаковые объяснения - одна запись со списком мест', () => {
    const e: GradeError[] = [1, 2, 3].map((i) => ({
      code: 'BOS_CHOCH_CONFUSED' as const, skill: 'choch' as const, severity: 'major' as const,
      params: { time: Date.UTC(2026, 9, 29, 10 + i), given: 'bos', expected: 'choch', trend: 'бычий', protected: 100 },
    }));
    const f = buildFeedback({ module: 'market-structure', verdict: 'incorrect', score: 0.1, errors: e, skillOutcomes: [] });
    render(<FeedbackView feedback={f} summary={{ matched: 0, total: 3 }} />);
    expect(within(screen.getByTestId('fb-why-list')).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByTestId('fb-why-list').textContent).toContain('Где:');
    expect(screen.getByTestId('fb-summary').textContent).toBe('0 из 3 совпало');
    expect(screen.getByTestId('fb-fb-understood').textContent).toContain('Пока нет совпадений');
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
