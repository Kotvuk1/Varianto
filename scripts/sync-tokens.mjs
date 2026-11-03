// Источник истины токенов — docs/design/tokens.css. Копия в apps/web/src/styles/tokens.css.
// `pnpm sync:tokens` копирует файл; `pnpm check:tokens` (CI) падает, если копия расходится.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'docs/design/tokens.css');
const dst = resolve(root, 'apps/web/src/styles/tokens.css');

if (process.argv.includes('--check')) {
  let same = false;
  try {
    same = readFileSync(src, 'utf8') === readFileSync(dst, 'utf8');
  } catch {
    same = false;
  }
  if (!same) {
    console.error('tokens.css расходится с docs/design/tokens.css. Выполните: pnpm sync:tokens');
    process.exit(1);
  }
  console.log('tokens.css совпадает с docs/design/tokens.css');
} else {
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  console.log('Скопировано: docs/design/tokens.css -> apps/web/src/styles/tokens.css');
}
