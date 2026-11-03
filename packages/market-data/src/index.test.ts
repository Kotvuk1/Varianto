import { describe, expect, it } from 'vitest';
import { ALGO_VERSION } from '@tl/core';
import * as md from './index';

describe('@tl/market-data smoke', () => {
  it('модуль загружается и видит @tl/core', () => {
    expect(md).toBeDefined();
    expect(ALGO_VERSION).toBe('0.1.0');
  });
});
