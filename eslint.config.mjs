import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'graphify-out/**',
      '.claude/**',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals.map((c) => ({ ...c, files: ['apps/web/**/*.{ts,tsx,js,jsx,mjs}'] })),
  {
    settings: { next: { rootDir: 'apps/web' } },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    files: ['packages/core/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', 'window', 'document', 'process', 'Buffer'],
    },
  },
);
