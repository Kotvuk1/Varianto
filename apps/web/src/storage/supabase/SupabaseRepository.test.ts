import { describe, expect, it } from 'vitest';
import { runRepositoryContract, contractAttempt } from '../repositoryContract';
import { FakeSupabase } from './fakeSupabase';
import { attemptToRow } from './mappers';
import { SupabaseRepository } from './SupabaseRepository';

const U1 = '11111111-1111-1111-1111-111111111111';
const U2 = '22222222-2222-2222-2222-222222222222';

runRepositoryContract('SupabaseRepository (мок-клиент)', () => {
  const fake = new FakeSupabase(U1);
  return new SupabaseRepository(fake.asClient(), U1);
});

describe('SupabaseRepository: специфика', () => {
  it('данные разных пользователей изолированы (эмуляция RLS)', async () => {
    const fake = new FakeSupabase(U1);
    await new SupabaseRepository(fake.asClient(), U1).saveAttempt(contractAttempt());
    fake.userId = U2;
    expect(await new SupabaseRepository(fake.asClient(), U2).listAttempts({})).toEqual([]);
  });

  it('ошибка сервера пробрасывается, а не глотается', async () => {
    const fake = new FakeSupabase(U1);
    fake.failNext = 'attempts';
    await expect(new SupabaseRepository(fake.asClient(), U1).saveAttempt(contractAttempt())).rejects.toThrow('fail attempts');
  });

  it('читает больше одной страницы без limit', async () => {
    const fake = new FakeSupabase(U1);
    const repo = new SupabaseRepository(fake.asClient(), U1);
    for (let i = 0; i < 1005; i++) {
      fake.rows('attempts').push(attemptToRow(contractAttempt({ createdAt: i + 1, updatedAt: i + 1 }), U1));
    }
    expect(await repo.listAttempts({})).toHaveLength(1005);
  });
});
