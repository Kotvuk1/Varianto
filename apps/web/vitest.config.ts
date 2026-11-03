import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'jsdom', include: ['{app,src}/**/*.test.{ts,tsx}'] },
});
