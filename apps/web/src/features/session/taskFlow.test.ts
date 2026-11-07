import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { LocalRepository } from '@/storage';
import type { TaskApi } from './api';
import { buildAttempt } from './attempt';
import { createTaskFlow } from './taskFlow';
import { TaskApiError, type GradeResultDto, type TaskEnvelope } from './types';

// SYNTHETIC: заглушки ответов API; проверяется жизненный цикл и сохранение, а не рыночные данные
const envelope = (id: string): TaskEnvelope => ({
  taskId: id, taskToken: 'secret-token-value', module: 'market-structure', difficulty: 'easy', symbol: 'BTCUSDT',
  algoVersion: 'v1', expiresAt: 1, decisionTime: 1000, series: {},
  payload: { kind: 'ms-question', tf: '1h', questionId: 'q', promptKey: 'k', promptParams: {}, options: [] },
});
const graded = (verdict: GradeResultDto['verdict']): GradeResultDto => ({
  taskId: 't1', module: 'market-structure', algoVersion: 'v1', verdict, score: 1,
  task: { module: 'market-structure', difficulty: 'easy', symbol: 'BTCUSDT', tf: '1h', taskKind: 'ms-question' },
  skillOutcomes: [{ skill: 'bos', correct: 1, total: 1 }], errors: [], reference: [],
  detail: { kind: 'ms-question', chosenOptionId: 'a', correctOptionId: 'a' },
  feedback: {} as never,
});
const answer = { kind: 'ms-question' as const, questionId: 'q', optionId: 'a' };

describe('buildAttempt', () => {
  it('сохраняет только публичные поля, без taskToken', () => {
    const a = buildAttempt({ envelope: envelope('t1'), answer, grade: graded('correct'), startedAt: 1000, now: 5000, id: 'x' });
    expect(a).toMatchObject({ id: 'x', module: 'market-structure', taskId: 't1', skills: ['bos'], correct: true, durationMs: 4000, algoVersion: 'v1' });
    expect(JSON.stringify(a)).not.toContain('secret-token-value');
  });
});

describe('taskFlow', () => {
  it('next -> grade -> попытка в репозитории, навыки и день обновлены', async () => {
    const repo = new LocalRepository(`flow-${Math.random()}`);
    const api: TaskApi = { next: vi.fn(async () => envelope('t1')), grade: vi.fn(async () => graded('correct')) };
    const flow = createTaskFlow({ api, repo, module: 'market-structure', body: () => ({ difficulty: 'easy', mode: 'question', tf: '1h' }) });
    await flow.getState().load();
    expect(flow.getState().phase).toBe('ready');
    await flow.getState().submit(answer);
    expect(flow.getState().phase).toBe('graded');
    expect(flow.getState().solved).toBe(1);
    expect(await repo.listAttempts({})).toHaveLength(1);
    expect((await repo.getSkillStats())[0]).toMatchObject({ skill: 'bos', attempts: 1 });
    const today = new Date();
    const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect((await repo.getDailyActivity(day, day))[0]?.tasksDone).toBe(1);
  });

  it('следующее задание исключает уже выданные', async () => {
    const repo = new LocalRepository(`flow-${Math.random()}`);
    let i = 0;
    const next = vi.fn(async () => envelope(`t${++i}`));
    const flow = createTaskFlow({ api: { next: next as unknown as TaskApi["next"], grade: vi.fn() }, repo, module: 'market-structure', body: () => ({ difficulty: 'easy', mode: 'mark', tf: '1h' }) });
    await flow.getState().load();
    await flow.getState().load();
    expect((next.mock.calls as unknown as [string, unknown][])[1]![1]).toMatchObject({ exclude: ['t1'] });
  });

  it('404 и 429 при next -> failed с типом ошибки; ошибка grade не теряет задание', async () => {
    const repo = new LocalRepository(`flow-${Math.random()}`);
    const api: TaskApi = {
      next: vi.fn().mockRejectedValueOnce(new TaskApiError('no-situation', 404)).mockResolvedValue(envelope('t1')),
      grade: vi.fn().mockRejectedValue(new TaskApiError('network', 0)),
    };
    const flow = createTaskFlow({ api, repo, module: 'market-structure', body: () => ({ difficulty: 'easy', mode: 'mark', tf: '1h' }) });
    await flow.getState().load();
    expect(flow.getState()).toMatchObject({ phase: 'failed', error: { kind: 'no-situation' } });
    await flow.getState().load();
    await flow.getState().submit(answer);
    expect(flow.getState()).toMatchObject({ phase: 'ready', gradeError: { kind: 'network' } });
    expect(await repo.listAttempts({})).toHaveLength(0);
  });
});
