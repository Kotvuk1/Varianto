// SYNTHETIC: попытки собраны вручную (разбор строится buildFeedback ядра) для проверки UI журнала.
import { buildFeedback } from '@tl/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LocalRepository, RepositoryProvider, type Attempt } from '@/storage';
import { ThemeProvider } from '@/theme';
import { ProgressScreen } from './ProgressScreen';

function attempt(i: number, ok: boolean): Attempt {
  const errors = ok ? [] : [{ code: 'SWING_MISSED' as const, skill: 'swing' as const, severity: 'major' as const, params: { side: 'high', time: 1_700_000_000_000, price: 100 } }];
  const outcomes = [{ skill: 'swing' as const, correct: ok ? 1 : 0, total: 1 }];
  const feedback = buildFeedback({ module: 'market-structure', verdict: ok ? 'correct' : 'incorrect', score: ok ? 1 : 0, errors, skillOutcomes: outcomes });
  return {
    id: `a${i}`, module: 'market-structure', taskId: `t${i}`, task: {}, answer: {},
    grade: { verdict: ok ? 'correct' : 'incorrect', errors, skillOutcomes: outcomes, feedback } as unknown as Attempt['grade'],
    algoVersion: 'x', skills: ['swing'], correct: ok, rMultiple: null, localDay: '2026-11-03', durationMs: null,
    createdAt: 1_700_000_000_000 + i * 1000, updatedAt: 1_700_000_000_000 + i * 1000,
  };
}

describe('ProgressScreen с данными', () => {
  it('слабые места, «мало данных», журнал и разбор', async () => {
    const repo = new LocalRepository('progress-screen-test');
    for (let i = 0; i < 6; i++) await repo.saveAttempt(attempt(i, i % 3 === 0));
    render(
      <RepositoryProvider repository={repo}>
        <ThemeProvider>
          <ProgressScreen />
        </ThemeProvider>
      </RepositoryProvider>,
    );
    const row = await screen.findByTestId('weak-row');
    expect(row.getAttribute('data-skill')).toBe('swing');
    expect(screen.getByTestId('train-skill').getAttribute('href')).toContain('focus=swing');
    const group = await screen.findByTestId('error-group');
    expect(group.textContent).toContain('4 случая');
    expect(group.textContent).toContain('Пропущенный Swing');
    expect(group.textContent).not.toMatch(/\d{2}:\d{2}/);
    expect(screen.getByTestId('module-accuracy').textContent).toContain('2 из 6 верно');
    expect(screen.getByTestId('module-accuracy').textContent).not.toContain('мало данных');
    await userEvent.click(group.querySelector('button')!);
    await userEvent.click((await screen.findAllByTestId('error-example'))[0]!);
    await waitFor(() => expect(screen.getByTestId('error-review')).toBeTruthy());
    expect(screen.getByTestId('feedback-view')).toBeTruthy();
  });

  it('до 5 попыток на навык: точность модуля и строка «мало данных»', async () => {
    const repo = new LocalRepository('progress-screen-few-test');
    for (let i = 0; i < 3; i++) await repo.saveAttempt(attempt(i, i === 0));
    render(
      <RepositoryProvider repository={repo}>
        <ThemeProvider>
          <ProgressScreen />
        </ThemeProvider>
      </RepositoryProvider>,
    );
    const acc = await screen.findByTestId('module-accuracy');
    expect(acc.textContent).toContain('33%');
    expect(acc.textContent).toContain('по навыкам — мало данных (3 из 5)');
    expect(screen.getByTestId('train-skill')).toBeTruthy();
  });
});
