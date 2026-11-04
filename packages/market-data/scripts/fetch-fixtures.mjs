/* global fetch, console, process, Buffer */
// Воспроизводимое скачивание фикстур из data.binance.vision и сборка записанных форматов REST/WS.
// Запуск: node packages/market-data/scripts/fetch-fixtures.mjs <scratchDir>
// Каждый архив скачивается в отдельную пустую папку внутри <scratchDir>.
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const BASE = 'https://data.binance.vision/data/futures/um';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../fixtures');
const scratch = resolve(process.argv[2] ?? '.scratch-fixtures');
const AGG_LINES = 3001; // заголовок + 3000 строк
const day = '2026-10-20';
const day2 = '2026-10-21';

/** @type {{kind:'klines'|'aggTrades', period:'daily'|'monthly', symbol:string, tf?:string, date:string, excerpt?:number}[]} */
const items = [];
for (const d of [day, day2]) {
  for (const tf of ['1m', '15m', '1h', '4h']) items.push({ kind: 'klines', period: 'daily', symbol: 'BTCUSDT', tf, date: d });
}
items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '1d', date: '2026-10' });
items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '4h', date: '2026-09' });
items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '1d', date: '2020-01' }); // без заголовка
for (const symbol of ['ETHUSDT', 'SOLUSDT']) {
  for (const tf of ['1m', '1h']) items.push({ kind: 'klines', period: 'daily', symbol, tf, date: day });
}
// M2: фикстуры для golden GS-8/GS-9/GS-10 и htf (ALGORITHMS §20 п.9)
items.push({ kind: 'klines', period: 'daily', symbol: 'SOLUSDT', tf: '15m', date: '2026-08-09' });
for (const d of ['2026-08-04', '2026-08-24', '2026-10-19']) items.push({ kind: 'klines', period: 'daily', symbol: 'BTCUSDT', tf: '15m', date: d });
for (const d of ['2026-08', '2026-09']) items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '1d', date: d });
// непрерывные ряды для тестов генерации заданий (1h: 1464 свечи) и примеров §5.5/§7.1 (4h 2026-07/08)
for (const d of ['2026-08', '2026-09']) items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '1h', date: d });
for (const d of ['2026-07', '2026-08']) items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '4h', date: d });
// Fibonacci Playground: golden FG-1..FG-8 (docs/specs/FIBONACCI.md §12.1)
items.push({ kind: 'klines', period: 'monthly', symbol: 'BTCUSDT', tf: '4h', date: '2026-10' });
items.push({ kind: 'klines', period: 'monthly', symbol: 'ETHUSDT', tf: '1h', date: '2026-10' });
items.push({ kind: 'klines', period: 'monthly', symbol: 'ETHUSDT', tf: '4h', date: '2026-09' });
for (const d of ['2026-07-15', '2026-07-16', '2026-07-17', '2026-07-19', '2026-07-20', '2026-07-21', '2026-08-10', '2026-08-11', '2026-08-12'])
  items.push({ kind: 'klines', period: 'daily', symbol: 'SOLUSDT', tf: '15m', date: d });
items.push({ kind: 'aggTrades', period: 'daily', symbol: 'BTCUSDT', date: day, excerpt: AGG_LINES });

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const rows = [];
const downloadedAt = new Date().toISOString().slice(0, 10);

for (const it of items) {
  const name =
    it.kind === 'klines' ? `${it.symbol}-${it.tf}-${it.date}` : `${it.symbol}-aggTrades-${it.date}`;
  const path = it.kind === 'klines' ? `${it.period}/klines/${it.symbol}/${it.tf}` : `${it.period}/aggTrades/${it.symbol}`;
  const url = `${BASE}/${path}/${name}.zip`;
  const dir = join(scratch, name);
  mkdirSync(dir, { recursive: true });
  if (readdirSync(dir).length === 0) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    writeFileSync(join(dir, `${name}.zip`), Buffer.from(await res.arrayBuffer()));
    const cs = await (await fetch(`${url}.CHECKSUM`)).text();
    writeFileSync(join(dir, `${name}.zip.CHECKSUM`), cs);
    execFileSync('unzip', ['-o', '-q', join(dir, `${name}.zip`), '-d', join(dir, 'out')]);
  }
  const zipBuf = readFileSync(join(dir, `${name}.zip`));
  const zipSha = sha(zipBuf);
  const expected = readFileSync(join(dir, `${name}.zip.CHECKSUM`), 'utf8').split(/\s+/)[0];
  if (zipSha !== expected) throw new Error(`checksum mismatch ${name}`);
  let csv = readFileSync(join(dir, 'out', `${name}.csv`), 'utf8');
  if (it.excerpt) csv = csv.split('\n').slice(0, it.excerpt).join('\n') + '\n';
  const rel = it.kind === 'klines' ? `klines/${it.symbol}/${it.tf}/${name}.csv` : `aggTrades/${name}.csv`;
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), csv);
  rows.push({ rel, url, zipSha, csvSha: sha(Buffer.from(csv)), it, lines: csv.split('\n').length - 1 });
  console.log('ok', rel);
}

// ---- Записанные форматы API из реальных архивных свечей ----
const rec = join(root, 'recorded');
mkdirSync(rec, { recursive: true });
const readRows = (rel) =>
  readFileSync(join(root, rel), 'utf8').trim().split('\n').filter((l) => !l.startsWith('open_time')).map((l) => l.split(','));
const toRest = (c) => [Number(c[0]), c[1], c[2], c[3], c[4], c[5], Number(c[6]), c[7], Number(c[8]), c[9], c[10], c[11]];
writeFileSync(join(rec, 'rest-klines-BTCUSDT-1h-2026-10-20.json'), JSON.stringify(readRows(`klines/BTCUSDT/1h/BTCUSDT-1h-${day}.csv`).map(toRest)) + '\n');
writeFileSync(join(rec, 'rest-klines-BTCUSDT-1m-2026-10-20-first120.json'), JSON.stringify(readRows(`klines/BTCUSDT/1m/BTCUSDT-1m-${day}.csv`).slice(0, 120).map(toRest)) + '\n');
const toWs = (c, symbol, i, x) => ({
  e: 'kline', E: Number(c[6]) + 1, s: symbol,
  k: { t: Number(c[0]), T: Number(c[6]), s: symbol, i, o: c[1], c: c[4], h: c[2], l: c[3], v: c[5], n: Number(c[8]), x, q: c[7], V: c[9], Q: c[10], B: c[11] },
});
const m1 = readRows(`klines/BTCUSDT/1m/BTCUSDT-1m-${day}.csv`).slice(0, 4);
const ws = [];
for (const [idx, c] of m1.entries()) {
  if (idx === 3) ws.push(toWs(c, 'BTCUSDT', '1m', false)); // последняя - как незакрытая (снимок)
  else ws.push(toWs(c, 'BTCUSDT', '1m', true));
}
writeFileSync(join(rec, 'ws-kline-BTCUSDT-1m-2026-10-20.json'), JSON.stringify(ws, null, 1) + '\n');

// ---- README ----
const table = rows
  .map((r) => `| \`${r.rel}\` | ${r.url} | ${r.it.symbol} | ${r.it.tf ?? '-'} | ${r.it.date}${r.it.excerpt ? ` (первые ${r.lines - 1} строк данных)` : ''} | ${downloadedAt} | \`${r.csvSha}\` | \`${r.zipSha}\` |`)
  .join('\n');
const readme = `# fixtures

Все свечи в этой папке - реальные данные data.binance.vision (USDⓈ-M futures). Синтетики нет.
Генерируется скриптом \`node packages/market-data/scripts/fetch-fixtures.mjs <scratchDir>\` (скачивает каждый архив в отдельную папку, сверяет .CHECKSUM, распаковывает CSV, пересобирает \`recorded/\` и этот файл).

## Архивные CSV

SHA-256 CSV - хэш файла в этой папке; SHA-256 zip - хэш исходного архива (совпадает с .CHECKSUM Binance).
Особенности: \`BTCUSDT-1d-2020-01.csv\` - старый месяц **без строки заголовка** (проверено: формат без заголовка встречается до 2021-12 включительно, с заголовком - с 2022-03).
\`aggTrades/*.csv\` - только начало реального дневного файла (экономия размера, исходный zip около 14 МБ).

| Файл | URL | Symbol | ТФ | Период | Скачано | SHA-256 CSV | SHA-256 zip |
|---|---|---|---|---|---|---|---|
${table}

## golden/ - эталонные участки SMC (ALGORITHMS §18)

\`golden/*.golden.json\` - ожидаемые значения GS-1..GS-4b, GS-7..GS-9 для \`analyzeStructure\`/\`detectSwings\`/\`detectSweeps\`: значения перенесены из \`docs/specs/ALGORITHMS.md\` §18.2 (получены Technical Analyst вручную по OHLC), а не сгенерированы кодом. Поля: \`algoVersion\`, \`source\` (CSV + SHA-256), \`params\`, \`expected\`, \`rationale\`. Время - ISO UTC (\`openTime\` свечи). Тесты: \`packages/core/src/smc/golden.*.test.ts\`. Изменение golden без смены \`ALGO_VERSION\` запрещено. SHA-256 дневного CSV SOLUSDT/BTCUSDT 15m отличается от значений в спецификации (там хэши месячных архивов): файлы здесь - дневные архивы, чьи zip сверены с \`.CHECKSUM\`.
Дополнительные непрерывные ряды для тестов генерации заданий (\`BTCUSDT-1h-2026-08/09\`, 1464 свечи) и примеров ALGORITHMS §5.5/§7.1 (\`BTCUSDT-4h-2026-07/08\`).
Fibonacci (docs/specs/FIBONACCI.md §12): \`golden/fib_FG-*\` - значения перенесены из спецификации (Technical Analyst, вручную по OHLC); ряды: \`BTCUSDT-4h-2026-09/10\`, \`ETHUSDT-1h-2026-10\`, \`ETHUSDT-4h-2026-09\`, \`SOLUSDT-15m-2026-07-15..21\`, \`SOLUSDT-15m-2026-08-09..12\`.

## recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451)

Это **реальные архивные свечи**, переупакованные в точный формат ответов Binance; выдуманных цен нет.

- \`rest-klines-BTCUSDT-1h-2026-10-20.json\`, \`rest-klines-BTCUSDT-1m-2026-10-20-first120.json\` - формат \`GET /fapi/v1/klines\`: массив массивов (время числом, цены/объёмы строками) из CSV \`${'BTCUSDT-1h-'}${day}\` и \`BTCUSDT-1m-${day}\`.
- \`ws-kline-BTCUSDT-1m-2026-10-20.json\` - массив из 4 событий \`kline\` (первые 4 минуты дня). Первые три с \`x:true\`; четвёртое - с \`x:false\` (значения финальной свечи используются как снимок незакрытой; реальные промежуточные снимки в архиве не хранятся). Поля \`f\`/\`L\` (id сделок) отсутствуют в архиве и опущены; \`E\` = \`closeTime + 1\` (условно).
`;
writeFileSync(join(root, 'README.md'), readme);
copyFileSync(join(root, 'README.md'), join(scratch, 'README.copy.md'));
console.log('done');
