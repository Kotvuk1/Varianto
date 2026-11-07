import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/health', () => {
  it('возвращает status ok и algoVersion', async () => {
    const res = GET();
    expect(await res.json()).toEqual({ status: 'ok', algoVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/) });
  });
});
