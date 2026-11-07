# Подключение Supabase и Vercel (с телефона)

Пока вы ничего не подключили, приложение работает как раньше: данные хранятся на устройстве, кнопок входа нет. Все шаги ниже бесплатные. Ничего платного не включайте.

Что понадобится: аккаунт GitHub с этим репозиторием, почта, Google-аккаунт. Удобнее открывать сайты в браузере телефона в режиме «Версия для ПК».

## 1. Проект Supabase

1. Откройте supabase.com, нажмите Start your project, войдите через GitHub.
2. New project. Название любое, например `trading-lab`. Придумайте пароль базы и сохраните его в менеджере паролей (в приложение он не нужен). Регион выберите ближайший. План Free.
3. Дождитесь, пока проект создастся (1–2 минуты).

## 2. Применить миграцию (создать таблицы)

1. В проекте: слева SQL Editor, затем New query.
2. Откройте в репозитории файл `supabase/migrations/0001_init.sql` (на GitHub: кнопка Raw, затем выделить всё и скопировать).
3. Вставьте текст в SQL Editor и нажмите Run. Должно появиться Success. Ошибки быть не должно; если есть, пришлите текст ошибки.
4. Проверка: слева Table Editor. Должны быть таблицы `profiles`, `attempts`, `skill_stats`, `terminal_marks`, `settings`, `daily_activity`, у каждой пометка RLS включён.

## 3. Ключи Supabase

Project Settings, затем API (или Data API). Понадобятся два значения:
- Project URL (вида `https://abcd.supabase.co`) станет `NEXT_PUBLIC_SUPABASE_URL`.
- anon public key (длинная строка, начинается с `eyJ`) станет `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Ключ `service_role` не копируйте никуда и никому не показывайте: приложению он не нужен.

## 4. Вход через Google

1. Откройте console.cloud.google.com, создайте проект, затем APIs & Services, OAuth consent screen: тип External, название и почта поддержки, сохранить.
2. Credentials, Create credentials, OAuth client ID, тип Web application.
3. В Authorized redirect URIs вставьте адрес из Supabase: Authentication, Sign In / Providers, Google, строка Callback URL (вида `https://abcd.supabase.co/auth/v1/callback`). Создайте клиент.
4. Скопируйте Client ID и Client Secret в Supabase: Authentication, Sign In / Providers, Google, включите Enable и вставьте оба значения, Save.
5. Вход по ссылке из письма (magic link) включён по умолчанию (провайдер Email).

## 5. Redirect URL в Supabase

Authentication, URL Configuration:
- Site URL: адрес вашего сайта на Vercel (после шага 6), например `https://trading-lab.vercel.app`.
- Redirect URLs: добавьте `https://trading-lab.vercel.app/auth/callback` (ваш адрес вместо примера) и для проверок на компьютере `http://localhost:3000/auth/callback`.

Если адрес сайта изменился, обновите оба поля.

## 6. Vercel

1. Откройте vercel.com, войдите через GitHub (план Hobby, бесплатный).
2. Add New, Project, выберите репозиторий, Import.
3. Root Directory: `apps/web`. Если Vercel предложит Framework Preset, выберите Next.js. Остальное по умолчанию.
4. Прежде чем нажимать Deploy, откройте Environment Variables и добавьте (для Production и Preview):

| Имя | Что это | Откуда взять |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Адрес вашего проекта Supabase | шаг 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный ключ Supabase (доступ ограничен правилами RLS) | шаг 3 |
| `TASK_SIGNING_SECRET` | Секрет подписи заданий: без него сервер не выдаст ни одного задания | сгенерировать, см. ниже |
| `CRON_SECRET` | Пароль для ежедневного «будильника» Supabase (бесплатный проект засыпает после недели без запросов) | сгенерировать, см. ниже |

Как сгенерировать секрет без компьютера: откройте любой генератор паролей (в менеджере паролей телефона), длина 40+ символов, буквы и цифры. С компьютера: `openssl rand -base64 32` (для `TASK_SIGNING_SECRET`) и `openssl rand -hex 32` (для `CRON_SECRET`). Секреты нигде не публикуйте и не отправляйте в чат.

5. Deploy. Production собирается из ветки `main`: пока Pull Request с кодом не влит в `main`, рабочий сайт будет пустым, а превью-сайт Pull Request (ссылка в самом PR) — рабочим. Влейте PR (кнопка Merge в GitHub), и production соберётся автоматически. Через пару минут появится адрес сайта. Вернитесь к шагу 5 и впишите его в Supabase.
6. Ежедневный пинг настроен в `apps/web/vercel.json` (раз в сутки, 06:00 UTC); Vercel сам подставляет `CRON_SECRET`. Проверка: Vercel, проект, Settings, Cron Jobs должен показывать `/api/cron/keepalive`.

Если вы меняете переменные позже, нажмите Redeploy: значения подставляются при сборке.

## 7. Проверка на телефоне

1. Откройте адрес сайта. Раздел Терминал: график BTCUSDT должен показать живые свечи, цена должна обновляться. Если вместо данных ошибка, откройте `<адрес>/api/health`: должно быть `{"status":"ok",...}`.
2. Откройте `<адрес>/auth/sign-in`. Должны быть кнопка Google и поле почты. Если страница не найдена, переменные Supabase не заданы или нужен Redeploy.
3. Войдите. Решите одно задание и откройте Прогресс: в Supabase, Table Editor, `attempts` должна появиться строка.
4. Если до входа вы уже решали задания на этом устройстве, они перенесутся в аккаунт при первом входе автоматически (один раз, повтор безопасен). Копия на устройстве остаётся.
5. Выход: на странице `/auth/sign-in` кнопка Выйти.

## Если что-то не работает

- «Не удалось войти» после Google: проверьте Redirect URI в Google Cloud (шаг 4.3) и Redirect URLs в Supabase (шаг 5).
- Ссылка из письма открывается, но вход не завершён: открывайте письмо в том же браузере, где запрашивали ссылку.
- Проект Supabase «на паузе»: Supabase, Restore project. Затем проверьте, что cron в Vercel включён.
- Живые данные Binance не грузятся в вашем регионе: сообщите, сервер Vercel подберёт другой регион функций.

## Проверка миграции (для разработчика)

Локальная проверка таблиц и RLS на чистом Postgres:

```
docker run -d --name tlpg -e POSTGRES_PASSWORD=pw postgres:16
docker exec -i tlpg psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/00_stub_supabase.sql
docker exec -i tlpg psql -U postgres -v ON_ERROR_STOP=1 < supabase/migrations/0001_init.sql
docker exec -i tlpg psql -U postgres < supabase/tests/rls.test.sql   # в конце: RLS TESTS PASSED
```

`00_stub_supabase.sql` создаёт заглушки ролей и `auth.uid()`; в проект Supabase его применять нельзя.
