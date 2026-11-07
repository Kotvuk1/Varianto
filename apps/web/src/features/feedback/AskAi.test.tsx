import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildFeedback, type GradeError } from '@tl/core';
import { FeedbackView } from './index';
import { resetAiEnabledCache } from './AskAi';

const errors: GradeError[] = [
  { code: 'BOS_CHOCH_CONFUSED', skill: 'choch', severity: 'major', markIds: ['m1'], params: { time: Date.UTC(2026, 9, 29, 20), given: 'bos', expected: 'choch' } },
];
const feedback = buildFeedback({ module: 'market-structure', verdict: 'partial', score: 0.5, errors, skillOutcomes: [] });

function mockFetch(enabled: boolean, explain: () => Response) {
  const f = vi.fn(async (...a: [string, RequestInit?]) => (a[0].endsWith('/status') ? Response.json({ enabled }) : explain()));
  vi.stubGlobal('fetch', f);
  return f;
}

beforeEach(() => resetAiEnabledCache());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('AskAi', () => {
  it('кнопки нет, если ИИ выключен', async () => {
    const f = mockFetch(false, () => Response.json({}));
    render(<FeedbackView feedback={feedback} />);
    await waitFor(() => expect(f).toHaveBeenCalled());
    expect(screen.queryByTestId('ask-ai-open')).toBeNull();
  });

  it('быстрый вопрос: ответ с подписью модели, без дат в запросе', async () => {
    const f = mockFetch(true, () => Response.json({ answer: 'Потому что CHoCH.', model: 'MiniMax-M3.1-Flash', usage: {} }));
    render(<FeedbackView feedback={feedback} />);
    await userEvent.click(await screen.findByTestId('ask-ai-open'));
    await userEvent.click(screen.getByRole('button', { name: 'Почему это ошибка?' }));
    expect(await screen.findByText('Потому что CHoCH.')).toBeTruthy();
    expect(screen.getByTestId('ask-ai-signature').textContent).toBe('Ответ ИИ, модель: MiniMax-M3.1-Flash. Оценку определяет алгоритм.');
    const call = f.mock.calls.find((c) => String(c[0]).endsWith('/explain'))!;
    const sent = String((call[1] as RequestInit).body);
    expect(sent).not.toMatch(/окт|29|20:00/);
    expect(JSON.parse(sent).question).toBe('Почему это ошибка?');
  });

  it('лимит исчерпан и ошибка показываются', async () => {
    mockFetch(true, () => Response.json({ error: { code: 'daily_limit' } }, { status: 429 }));
    render(<FeedbackView feedback={feedback} />);
    await userEvent.click(await screen.findByTestId('ask-ai-open'));
    await userEvent.click(screen.getByRole('button', { name: 'Объясни проще' }));
    expect((await screen.findByTestId('ask-ai-error')).textContent).toMatch(/Лимит/);
  });
});
