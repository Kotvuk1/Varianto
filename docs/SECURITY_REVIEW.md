# Security Review (M8-SEC)

Дата: 2026-11-03. Роль: независимый Security Reviewer. Методика: security-review (trust boundaries, authN/Z, ввод, секреты, зависимости, заголовки).
Проверено на production-сборке (`next build` + `next start`, заголовки и поведение через curl), чтением исходников и SQL, `pnpm audit --prod`, поиском по `git log -p --all`.

## Сводка

| # | Severity | Находка | Статус |
|---|----------|---------|--------|
| 1 | high | Open redirect в `/auth/callback` через `next=/%09/evil.com` | исправлено |
| 2 | medium | `clientKey` брал первый (клиентский) элемент `X-Forwarded-For` | исправлено частично (см. ниже) |
| 3 | medium | `/api/history` без rate limit и без нижней границы `from` | открыто |
| 4 | low | Keepalive: сравнение секрета не в постоянном времени; RLS делает пинг "502" | открыто |
| 5 | low | Миграция: `jsonb`-поля клиента без ограничения размера | открыто |
| 6 | low | Нет HSTS в `next.config` (Vercel добавляет сам на `*.vercel.app`) | открыто |
| 7 | low | Минимальная длина `TASK_SIGNING_SECRET` 16; dev-ключ при NODE_ENV != production | открыто |
| 8 | info | Challenge: цены/форма свечей позволяют вычислить дату сопоставлением с историей | принято |

Critical: не найдено. Секретов в репозитории и истории нет.

## Находки

### 1. HIGH: open redirect в /auth/callback (исправлено)
Доказательство: `safeNextPath` отвергал `//` и `\`, но `new URL('/\t/evil.com', origin)` по WHATWG-парсеру удаляет TAB/CR/LF и даёт `https://evil.com/`. Проверено в Node: `/\t/evil.com`, `/\n/evil.com`, `/\r/evil.com` -> `https://evil.com/`. Эксплуатация: ссылка `/auth/callback?code=<валидный>&next=/%09/evil.com` после успешного входа уводит на чужой сайт (фишинг).
Фикс (`apps/web/src/auth/config.ts`): запрещены управляющие символы `\u0000-\u001f\u007f`; дополнительно итоговый URL разрешается относительно фиктивного origin и должен остаться на нём. Тесты добавлены в `config.test.ts` (TAB, LF, CR, NUL). Результат: 14/14.

### 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично)
Доказательство: 35 запросов к `/grade` с разными `X-Forwarded-For: 6.6.6.N` дали 35 ответов 400 без 429; с постоянным ключом 429 с 31-го. Дополнительно ротация ключей вытесняет чужие корзины (LRU на 5000).
Фикс (`apps/web/src/server/rate-limit.ts`): приоритет `x-real-ip` (перезаписывается Vercel), иначе последний элемент XFF (добавлен ближайшим прокси), иначе общий ключ. Тест обновлён. Остаточный риск: вне Vercel (прямой `next start` без прокси) заголовки клиентом не перезаписываются, обход возможен; на Vercel XFF/x-real-ip задаёт платформа. Лимит в памяти инстанса, на serverless он приблизительный (допущение ARCHITECTURE §7). Рекомендация: при реальной нагрузке Vercel Firewall rate limit (бесплатный тариф ограничен) или Upstash free.

### 3. MEDIUM: /api/history без лимита запросов (открыто)
Доказательство: `app/api/history/route.ts` не вызывает limiter; ответы кэшируются по уникальному query, поэтому перебор `from/to` обходит CDN и каждый раз лезет в data.binance.vision (до 5000 свечей, zip-загрузки). `from` не ограничен снизу (`from=0` валиден при выравнивании) -> заведомо 404-запросы к архиву. SSRF нет: символ и ТФ из enum, даты из числовой regex `^\d{1,15}$`, база URL константа `ARCHIVE_BASE_URL`, произвольный URL подставить нельзя.
Фикс (зона route handler, запрос оркестратору): общий `RateLimiter` из `getDeps()` перед парсингом; нижняя граница `from >= ARCHIVE_START` (2021-01-01); для ArchiveSource с `fetch` без редиректов (`redirect: 'error'`).

### 4. LOW: /api/cron/keepalive (открыто)
- `request.headers.get('authorization') !== \`Bearer ${secret}\`` не в постоянном времени (практическая эксплуатируемость низкая из-за сетевого шума). Фикс: `timingSafeEqual` по SHA-256 обеих строк.
- Без `CRON_SECRET`/Supabase env эндпоинт отвечает 204, пинг молча не работает: проверить настройку после деплоя.
- Миграция делает `revoke all ... from anon`, поэтому запрос с anon-ключом к `/rest/v1/profiles` вернёт 401/403, `res.ok === false` и cron получит 502 (БД при этом "просыпается"). Фикс: считать 401/403/200 успехом пинга, либо дёргать `/auth/v1/health` с apikey.
Проверено: без заголовка 401, с верным Bearer выполняется запрос.

### 5. LOW: Supabase (повторное чтение 0001_init.sql)
Хорошо: RLS включён на всех 6 таблицах; политики select/insert/update/delete `to authenticated` с `user_id = (select auth.uid())` и `with check`; `user_id default auth.uid()`; `revoke all from anon`; `security definer` функция `handle_new_user` с `set search_path = ''`; нет `service_role` в проекте (grep по коду и истории пуст).
Замечания: (а) `attempts.answer/grade/task_token_payload`, `terminal_marks.marks`, `settings.data` jsonb без `check (pg_column_size(...) < N)`: аутентифицированный пользователь может забить квоту 500 МБ Free; (б) клиент сам пишет `correct`/`r_multiple` (допустимо, данные личные, лидербордов нет). Фикс (а): ограничения размера отдельной миграцией 0002.

### 6. LOW: заголовки/CSP (фактически curl на production-сборке)
Получены: CSP (connect-src ровно по ТЗ, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`; `X-Powered-By` отсутствует; `unsafe-eval` в production нет. Замечания: `script-src 'unsafe-inline'` (нужен inline-скрипту темы и Next без nonce; XSS-поверхность мала, пользовательский HTML нигде не рендерится); нет HSTS (на Vercel добавляется автоматически, на своём домене проверить); нет COOP/CORP (не критично).

### 7. LOW: токены (src/server/token.ts) - корректно
- Формат `v1.<header>.<sealed>.<mac>`; MAC = HMAC-SHA256 по `v1.h.s`, проверяется `timingSafeEqual` после проверки длины, до расшифровки и до JSON.parse (encrypt-then-MAC).
- AES-256-GCM: IV 12 байт из `randomBytes` на каждый токен (повтора нет), тег 16 байт, AAD = `v1.<header>` (подмена header ломает расшифровку).
- Ключи enc/mac/id разделены HKDF-SHA256 с разными `info`; соль константа (допустимо для высокоэнтропийного секрета).
- `exp` и `algoVersion` проверяются после аутентификации; header и sealed валидируются strict-схемами zod; неизвестная версия -> 401. Ошибки не различают причину (нет oracle). Токен привязан к модулю (проверка в gradeTask).
- Нет защиты от повторного использования токена в пределах 24 ч (stateless, ADR-0005): допустимо, т.к. grade раскрывает эталон только после ответа, а next-ответ эталона не содержит.
- Риски конфигурации: минимум 16 символов (рекомендовать >= 32, `openssl rand -base64 32`); вне `NODE_ENV=production` используется публичный DEV-ключ (на любом деплое с иным NODE_ENV токены подделываются). Фикс: падать при отсутствии секрета, если задан `VERCEL`/`VERCEL_ENV`.

### 8. Утечка даты Challenge
Проверено: открытый header токена содержит только module/symbol/difficulty/algoVersion/iat/exp; T, seed, shiftMs, params в зашифрованной части; `taskId` = HMAC(module|symbol|T), усечён до 96 бит, сетку T не перебрать без секрета; время свечей сдвинуто на целое число суток (offDays 1000-4000), `decisionTime` сдвинут; ответы `next`/`grade`/ошибки отдаются с `Cache-Control: no-store` (проверено curl). `exclude` ограничен (200 x 64). Остаточный риск (info): ценовой рисунок свечей и `entryPrice` позволяют определить дату сопоставлением с публичной историей BTC; для обучающего приложения принято.

### 9. Ввод, лимиты, XSS, хранилища
- zod strict везде, тело читается потоково с лимитом 64 КБ (413), `taskToken` <= 4096, marks <= 200, anchors <= 3, note <= 500; `meta: z.record(unknown)` ограничено общим размером тела.
- XSS: единственный `dangerouslySetInnerHTML` в `app/layout.tsx` рендерит константную строку `themeInitScript` (без пользовательских данных; ключ localStorage константа). `eval`/`new Function`/`innerHTML` в src не найдены. Подстановка параметров шаблонов разборов идёт через React-текст (экранирование по умолчанию).
- Хранилища: localStorage только `tl:appearance` (тема, стиль свечей; читается в try/catch, значения сверяются с белым списком); IndexedDB (Dexie `trading-lab`): попытки, статистика, разметка, настройки, без секретов и персональных данных; ключей Binance в проекте нет.
- Логи: `console.*` в серверном коде печатают только имя/сообщение ошибки и факт отсутствия секрета, значения секретов не логируются.
- Зависимости: `pnpm audit --prod` - No known vulnerabilities.
- Секреты: `.env`, `.env.*` в `.gitignore` (кроме `.env.example`, там пустые значения); в отслеживаемых файлах .env нет; поиск по `git log -p --all` (JWT `eyJ...`, `sk_live`, `AKIA`, `ghp_`, `sb_secret_`, `service_role`, PRIVATE KEY) нашёл только упоминание "service_role не копируйте" в документации. gitleaks в окружении не установлен; сканирование секретов в CI - зона DevOps (проверить наличие шага).
- Анон-ключ Supabase публичный по замыслу, защита обеспечивается RLS и revoke anon (п. 5).

## Внесённые правки
1. `apps/web/src/auth/config.ts` + `config.test.ts`: закрыт open redirect (п. 1).
2. `apps/web/src/server/rate-limit.ts` + `rate-limit.test.ts`: `clientKey` не доверяет первому XFF (п. 2).
Проверки: `npx vitest run src/auth/config.test.ts src/server` (54 + 14 passed), `npx tsc --noEmit` без ошибок, `next build` успешен.

## Запросы к оркестратору
Rate limit и нижняя граница `from` для `app/api/history`; `timingSafeEqual` и трактовка 401/403 в keepalive; миграция 0002 с ограничениями размера jsonb; шаг gitleaks в CI; падение при отсутствии секрета на Vercel независимо от NODE_ENV.
