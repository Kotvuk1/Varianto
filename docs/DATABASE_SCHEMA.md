# Database Schema — Trading Lab

Статус: черновик v1, 2026-11-03. Источник: `docs/ARCHITECTURE.md` C4, §5.4, §6; `docs/PRD.md` FR-PROG-*, FR-TERM-04/05, FR-AUTH-05/06, NFR-SEC-02; `docs/DECISIONS/0008-local-first-repository.md`. Типы TypeScript (`Attempt`, `SkillStat`, `Settings`, `DailyActivity`) — `docs/API_CONTRACTS.md`, раздел 7.
Метки: **(предложение)** — значение не зафиксировано в источниках; **(проверить)** — требует проверки. Открытые вопросы — раздел 6.

Решения пользователя, учтённые здесь: авторизация в конце (M7), до этого хранение в IndexedDB; гостевой режим отложен; дневная цель по умолчанию 10 заданий (настраивается); время хранится в UTC, показывается в локальном часовом поясе; мягкая серия дней.

## 1. Принципы

- Источник истины — **попытки** (`attempts`) и **разметка терминала**. Статистика навыков и дневная активность — производные, их можно пересчитать из попыток.
- Каждая запись (кроме `dailyActivity` в IndexedDB, у которой естественный ключ `day`) имеет `id` (UUID v4, генерируется клиентом) и `updatedAt` — для слияния и идемпотентного импорта.
- Модель данных сразу многопользовательская: в Postgres каждая строка принадлежит `user_id`; в IndexedDB `user_id` нет (локальные данные принадлежат устройству).
- Время: IndexedDB — `number` (UTC мс); Postgres — `timestamptz`. Дни для цели и серии — строка/дата `YYYY-MM-DD` по **локальному** часовому поясу на момент попытки (`localDay`).
- Дата реального сценария Challenge хранится в `attempts.task_token_payload` (раскрывается после разбора) как `reveal.decisionTime` и `reveal.shiftMs`.
- Свечи проигрывания (`replay`) в БД не хранятся.

## 2. Локальная схема: IndexedDB (Dexie)

База `trading-lab`. Версия схемы Dexie: **1** (`db.version(1)`). Изменения — только новыми версиями с `upgrade`-функцией; номер версии дублируется в `meta.schemaVersion`.

```ts
import Dexie, { Table } from 'dexie';

class TradingLabDB extends Dexie {
  attempts!: Table<AttemptRow, string>;
  skillStats!: Table<SkillStatRow, SkillId>;
  terminalMarks!: Table<TerminalMarksRow, string>;
  settings!: Table<SettingsRow, string>;
  dailyActivity!: Table<DailyActivityRow, string>;
  meta!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('trading-lab');
    this.version(1).stores({
      attempts:      'id, module, createdAt, [module+createdAt], localDay, updatedAt, *skills',
      skillStats:    'skill, updatedAt',
      terminalMarks: 'id, &symbol, updatedAt',
      settings:      'id, updatedAt',
      dailyActivity: 'day, updatedAt',
      meta:          'key',
    });
  }
}
```

Строка в Dexie-схеме перечисляет первичный ключ и индексы; остальные поля хранятся без индекса. `*skills` — multiEntry-индекс (фильтр по навыку). Булевы значения (`correct`) не индексируются (в IndexedDB булево не является допустимым ключом) — фильтр `correct` применяется в памяти после выборки по индексу.

| Таблица | PK | Индексы | Содержимое |
|---|---|---|---|
| `attempts` | `id` (UUID) | `module`, `createdAt`, `[module+createdAt]`, `localDay`, `updatedAt`, `*skills` | Попытка: `module`, `taskId`, `task` (расшифрованные параметры задания, включая `reveal`), `answer`, `grade` (без `replay`), `algoVersion`, `skills[]`, `correct`, `rMultiple`, `localDay`, `durationMs`, `createdAt`, `updatedAt` |
| `skillStats` | `skill` (`SkillId`) | `updatedAt` | Материализованный кэш: `attempts`, `correct`, `recent[]` (последние N исходов), `updatedAt`. Пересчитывается из `attempts`; обновляется в одной транзакции с `saveAttempt` |
| `terminalMarks` | `id` (UUID) | `&symbol` (уникальный), `updatedAt` | `symbol`, `marks: Mark[]`, `updatedAt`. Одна запись на пару (OQ-21 PRD открыт: на пару или на пару+ТФ). Метки в (время, цена), поэтому не привязаны к ТФ |
| `settings` | `id` (UUID, одна запись) | `updatedAt` | `Settings` (`theme`, `candleStyle`, `dailyGoal`, `lastTerminalSymbol`, `locale`) |
| `dailyActivity` | `day` (`YYYY-MM-DD`, естественный ключ) | `updatedAt` | `tasksDone`, `goal` (снимок цели на тот день), `updatedAt`. Пересчитывается из `attempts` |
| `meta` | `key` | — | `schemaVersion`, `deviceId`, `importedUserId` (кому уже импортировано, раздел 4) |

Операции репозитория → таблицы:
- `saveAttempt`: транзакция по `attempts`, `skillStats`, `dailyActivity`: вставка попытки (если `id` уже есть — игнор), обновление `skillStats` по `grade.skillOutcomes`, инкремент `dailyActivity[localDay].tasksDone` (снимок `goal` берётся из `settings.dailyGoal`, если записи на день ещё нет).
- `listAttempts(filter)`: выборка по `[module+createdAt]` / `createdAt` / `*skills`, остальное в памяти; сортировка по `createdAt`.
- `getSkillStats`: чтение `skillStats`, `accuracy` вычисляется по `recent`.
- `saveTerminalMarks(symbol, marks)`: `put` с заменой всей записи по `symbol` (новый `updatedAt`); `getTerminalMarks` — по уникальному индексу `symbol`.
- `getSettings` создаёт запись по умолчанию (`dailyGoal = 10`, `theme = 'dark'`, `candleStyle = 'blue-orange'`).

Размер: попытка с `answer` и `grade` порядка единиц КБ; при цели 10 заданий в день — порядка тысяч записей в год. Квоты IndexedDB браузера зависят от устройства (**проверить** на телефоне, в т. ч. Safari на iOS: возможна очистка данных неактивного сайта).

## 3. Схема Supabase Postgres (M7)

Миграция `supabase/migrations/0001_init.sql`. Расширения: `pgcrypto` не требуется (используется встроенная `gen_random_uuid()`). Клиент использует только anon-ключ; service-role в браузере не применяется (`ARCHITECTURE.md` §6).

```sql
-- Служебные функции -----------------------------------------------------------

-- updated_at: если клиент не менял значение — now(); значение из будущего ограничивается now() + 5 минут (защита LWW от кривых часов).
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.updated_at is not distinct from old.updated_at then
    new.updated_at := now();
  end if;
  new.updated_at := least(coalesce(new.updated_at, now()), now() + interval '5 minutes');
  return new;
end $$;

-- profiles ---------------------------------------------------------------------

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text,
  timezone        text,                                   -- IANA, например 'Europe/Moscow'; справочно
  local_import_at timestamptz,                            -- момент импорта локальных данных (раздел 4)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Профиль создаётся при регистрации пользователя.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- attempts ---------------------------------------------------------------------

create table public.attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade default auth.uid(),
  module             text not null check (module in ('market-structure', 'price-action', 'challenge')),
  task_id            text not null,
  task_token_payload jsonb not null,           -- RevealedTask: параметры задания, reveal.decisionTime/shiftMs
  answer             jsonb not null,           -- Answer
  grade              jsonb not null,           -- GradeResult без replay
  algo_version       text not null,
  skills             text[] not null default '{}',
  correct            boolean not null,         -- grade.verdict = 'correct'
  r_multiple         numeric(12, 4),           -- только challenge с позицией
  local_day          date not null,            -- локальный день попытки (для цели и серии)
  duration_ms        integer check (duration_ms is null or duration_ms >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index attempts_user_created_idx on public.attempts (user_id, created_at desc);
create index attempts_user_module_created_idx on public.attempts (user_id, module, created_at desc);
create index attempts_user_local_day_idx on public.attempts (user_id, local_day);
create index attempts_skills_gin_idx on public.attempts using gin (skills);

-- skill_stats (кэш, пересчитывается из attempts) ---------------------------------

create table public.skill_stats (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  skill      text not null,
  attempts   integer not null default 0 check (attempts >= 0),
  correct    integer not null default 0 check (correct >= 0 and correct <= attempts),
  recent     jsonb not null default '[]'::jsonb,       -- [{ "t": <ms>, "ok": <bool> }, ...] последние N исходов
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, skill)
);

-- terminal_marks ----------------------------------------------------------------

create table public.terminal_marks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  symbol     text not null check (symbol ~ '^[A-Z0-9]{2,20}USDT$'),
  marks      jsonb not null default '[]'::jsonb,       -- Mark[] (время/цена, не пиксели)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

-- settings ----------------------------------------------------------------------

create table public.settings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid() unique,
  data       jsonb not null,                           -- Settings (theme, candleStyle, dailyGoal, ...)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- daily_activity (кэш, пересчитывается из attempts; goal — снимок) ---------------

create table public.daily_activity (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  day        date not null,                            -- локальный день
  tasks_done integer not null default 0 check (tasks_done >= 0),
  goal       integer not null check (goal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

-- updated_at ---------------------------------------------------------------------

create trigger touch_profiles       before insert or update on public.profiles       for each row execute function public.touch_updated_at();
create trigger touch_attempts       before insert or update on public.attempts       for each row execute function public.touch_updated_at();
create trigger touch_skill_stats    before insert or update on public.skill_stats    for each row execute function public.touch_updated_at();
create trigger touch_terminal_marks before insert or update on public.terminal_marks for each row execute function public.touch_updated_at();
create trigger touch_settings       before insert or update on public.settings       for each row execute function public.touch_updated_at();
create trigger touch_daily_activity before insert or update on public.daily_activity for each row execute function public.touch_updated_at();
```

Замечания к DDL:
- Триггер `touch_updated_at` ограничивает только будущее; клиентское `updated_at` из прошлого сохраняется (нужно для импорта и LWW).
- `user_id ... default auth.uid()` упрощает вставки с клиента; политики `WITH CHECK` всё равно запрещают подставить чужой `user_id`.
- `attempts.grade` содержит `reference` и `feedback`; при необходимости уменьшить размер, убрать `feedback` (его можно пересобрать по кодам и `algo_version`) — **(предложение)**, решается на M7.
- Лимиты размера БД Supabase Free — **(проверить)** перед M7; при 10 заданиях в день рост линейный и небольшой.

### 3.1 RLS

RLS включается на всех таблицах; политики — для роли `authenticated`; анонимный доступ запрещён (гостевой режим отложен). `(select auth.uid())` вместо прямого вызова — чтобы значение вычислялось один раз на запрос.

```sql
alter table public.profiles       enable row level security;
alter table public.attempts       enable row level security;
alter table public.skill_stats    enable row level security;
alter table public.terminal_marks enable row level security;
alter table public.settings       enable row level security;
alter table public.daily_activity enable row level security;

-- profiles: владелец определяется по id ------------------------------------------
create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete_own on public.profiles for delete to authenticated using (id = (select auth.uid()));

-- attempts ---------------------------------------------------------------------
create policy attempts_select_own on public.attempts for select to authenticated using (user_id = (select auth.uid()));
create policy attempts_insert_own on public.attempts for insert to authenticated with check (user_id = (select auth.uid()));
create policy attempts_update_own on public.attempts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy attempts_delete_own on public.attempts for delete to authenticated using (user_id = (select auth.uid()));

-- skill_stats ------------------------------------------------------------------
create policy skill_stats_select_own on public.skill_stats for select to authenticated using (user_id = (select auth.uid()));
create policy skill_stats_insert_own on public.skill_stats for insert to authenticated with check (user_id = (select auth.uid()));
create policy skill_stats_update_own on public.skill_stats for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy skill_stats_delete_own on public.skill_stats for delete to authenticated using (user_id = (select auth.uid()));

-- terminal_marks ---------------------------------------------------------------
create policy terminal_marks_select_own on public.terminal_marks for select to authenticated using (user_id = (select auth.uid()));
create policy terminal_marks_insert_own on public.terminal_marks for insert to authenticated with check (user_id = (select auth.uid()));
create policy terminal_marks_update_own on public.terminal_marks for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy terminal_marks_delete_own on public.terminal_marks for delete to authenticated using (user_id = (select auth.uid()));

-- settings ---------------------------------------------------------------------
create policy settings_select_own on public.settings for select to authenticated using (user_id = (select auth.uid()));
create policy settings_insert_own on public.settings for insert to authenticated with check (user_id = (select auth.uid()));
create policy settings_update_own on public.settings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy settings_delete_own on public.settings for delete to authenticated using (user_id = (select auth.uid()));

-- daily_activity ---------------------------------------------------------------
create policy daily_activity_select_own on public.daily_activity for select to authenticated using (user_id = (select auth.uid()));
create policy daily_activity_insert_own on public.daily_activity for insert to authenticated with check (user_id = (select auth.uid()));
create policy daily_activity_update_own on public.daily_activity for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy daily_activity_delete_own on public.daily_activity for delete to authenticated using (user_id = (select auth.uid()));
```

Тесты политик (NFR-SEC-02, AC-16): два пользователя; каждый видит и меняет только свои строки; подстановка чужого `user_id` в `INSERT`/`UPDATE` отклоняется; запрос без сессии возвращает пусто/ошибку. Индексы по `user_id` в начале составных ключей обслуживают предикаты политик.

## 4. Миграция локальных данных в Supabase при первом входе

Цель: перенести данные IndexedDB в аккаунт один раз, безопасно при повторе, не теряя более новые данные других устройств.

### 4.1 Порядок

1. После успешного входа `SupabaseRepository` читает `meta.importedUserId`. Если значение равно текущему `user_id` — импорт уже выполнен, шаг пропускается. Если пусто и локальных данных нет — пропуск. Если установлено для **другого** пользователя — локальные данные не импортируются (вопрос 6.4).
2. `LocalRepository.exportSnapshot()` собирает `{ attempts, terminalMarks, settings, dailyActivity }` (без `skillStats`: производная таблица).
3. Данные отправляются пачками (attempts — по 100 строк **(предложение)**) в RPC `import_local_snapshot(p jsonb)` (`security invoker`, т. е. RLS действует) либо upsert-запросами с теми же правилами.
4. После успеха: пересчёт производных данных на сервере/клиенте (4.3), запись `profiles.local_import_at = now()` и `meta.importedUserId = user_id`.
5. Локальные данные не удаляются автоматически; после успешного импорта `SupabaseRepository` становится единственной реализацией в рантайме, IndexedDB остаётся резервной копией до явной очистки пользователем (вопрос 6.2).

### 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`)

| Таблица | Ключ слияния | Правило |
|---|---|---|
| `attempts` | `id` | `insert ... on conflict (id) do nothing`. Попытки неизменяемы после создания, поэтому повтор безопасен и конфликт означает «уже есть» |
| `terminal_marks` | `(user_id, symbol)` | Локальный `id` может отличаться от серверного для той же пары. Конфликт по `(user_id, symbol)` решается целиком по `updated_at`: побеждает запись с большим значением; при равенстве — серверная. Метки не сливаются поэлементно (вопрос 6.5) |
| `settings` | `user_id` | Побеждает запись с большим `updated_at`; при равенстве — серверная |
| `daily_activity` | `(user_id, day)` | `tasks_done` всегда пересчитывается из `attempts` по `local_day` после слияния попыток (не суммируется и не берётся из строки); `goal` берётся из строки с большим `updated_at` |
| `skill_stats` | `(user_id, skill)` | Не импортируется; полностью пересчитывается из `attempts` (4.3) |

Пример для `terminal_marks` (остальные таблицы — по аналогии):
```sql
insert into public.terminal_marks (id, user_id, symbol, marks, created_at, updated_at)
select (m->>'id')::uuid, auth.uid(), m->>'symbol', m->'marks',
       (m->>'created_at')::timestamptz, (m->>'updated_at')::timestamptz
from jsonb_array_elements(p->'terminal_marks') m
on conflict (user_id, symbol) do update
  set marks = excluded.marks, updated_at = excluded.updated_at
  where excluded.updated_at > public.terminal_marks.updated_at;
```
Повторный запуск того же снимка не меняет данные: строки с равным `updated_at` не обновляются. Функция начинается с проверки `auth.uid() is not null` и возвращает счётчики вставленных/обновлённых/пропущенных строк (`ImportReport`).

### 4.3 Пересчёт производных данных
- `skill_stats`: для каждого навыка — последние N исходов по `created_at` из `attempts.grade -> skillOutcomes` (определение — раздел 5.1), счётчики `attempts`/`correct` — по всем попыткам.
- `daily_activity.tasks_done`: `count(*)` попыток по `(user_id, local_day)`.

### 4.4 Ошибки и откат
Импорт выполняется транзакционно на пачку; при ошибке сети пачка повторяется (идемпотентно). Прогресс импорта в `meta.importProgress`. Частичный импорт допустим, повтор дособирает остаток. Недоступность Supabase не блокирует работу графика и заданий (NFR-REL-04): запись откладывается с уведомлением (очередь — вопрос 6.3).

## 5. Определения метрик прогресса

Все метрики вычисляются из `attempts` (и кэшей `skill_stats`, `daily_activity`) детерминированно; значения показываются нейтральным цветом (FR-PROG-12).

### 5.1 Точность навыка
- Исход навыка в попытке: из `grade.skillOutcomes` — запись `{ skill, correct, total }`; исход `ok = (correct / total >= 0.8)` (порог 0.8 — `ALGORITHMS.md` §19 п.3; при `total = 1` совпадает с прежним правилом `correct === total`). Попытка, не затронувшая навык, в его статистику не входит.
- **Окно: последние N = 20 исходов навыка** (**предложение**; окно и порог — OQ-12 PRD). `accuracy = число ok в окне / размер окна`.
- Показывается только при размере окна не менее `MIN_SAMPLE = 5` **(предложение)**; иначе статус «мало данных».
- Накопительные `attempts` и `correct` хранятся для справки и не участвуют в `accuracy`.
- Экран «Слабые места»: навыки по возрастанию `accuracy`; при равенстве — по меньшему размеру окна; «мало данных» — в конце списка. Для навыка доступен журнал ошибок: `attempts` с этим навыком и `grade.errors`.
- Адаптивная подборка (FR-PROG-03), **предложение**: вес навыка `w = 1 − accuracy`, для «мало данных» `accuracy = 0.5`; `focus` в `POST /api/tasks/{module}/next` формируется выборкой навыков пропорционально весам.
- Предложение повысить сложность: `accuracy ≥ 0.8` при полном окне (20 исходов) на текущей сложности **(предложение)**; предложение показывается не чаще раза за N попыток по навыку; автоматического понижения нет. Учитывать только попытки текущей сложности — **(предложение)**.

### 5.2 Дневная цель
- Единица: количество оценённых попыток (`Attempt`) за локальный день, независимо от верности и модуля (Market Structure, Price Action, Challenge; WAIT засчитывается). Отклонённые запросы (400) и проверки разметки в терминале не считаются.
- Цель по умолчанию — **10 заданий**, `settings.dailyGoal`, диапазон 1-100 **(предложение)**.
- Прогресс дня: `tasksDone / goal`; цель выполнена при `tasksDone ≥ goal`.
- `daily_activity.goal` — снимок цели на момент первой попытки дня; смена `dailyGoal` влияет на текущий и будущие дни, прошлые не пересчитываются.
- День определяется `localDay` попытки (локальная полночь устройства на момент попытки). При смене часового пояса прошлые дни не пересчитываются.

### 5.3 Мягкая серия дней
День «выполнен», если `tasksDone ≥ goal` этого дня. Правило: одиночный пропуск не обнуляет серию и не увеличивает её; два пропуска подряд обнуляют. Текущий день, пока цель не достигнута, не считается пропуском.

```ts
function softStreak(days: Map<string, { tasksDone: number; goal: number }>, today: string, firstDay: string) {
  const met = (d: string) => { const x = days.get(d); return !!x && x.tasksDone >= x.goal; };
  let streak = met(today) ? 1 : 0;
  let misses = 0;
  for (let d = prevDay(today); d >= firstDay; d = prevDay(d)) {
    if (met(d)) { streak++; misses = 0; }
    else if (++misses >= 2) break;
  }
  const atRisk = !met(today) && !met(prevDay(today));   // вчера пропущено и сегодня цель ещё не выполнена
  return { streak, atRisk };
}
```
Пример AC-15: выполнено дни 1, 2, 3, пропущен день 4, выполнен день 5 -> серия 4 (пропуск не обнулил). Дни 1, 2, 3, пропущены 4 и 5 -> к дню 6 (если цель дня 6 не выполнена) серия равна 0; в день 5 она ещё жива (день 5 не завершён). `firstDay` — день первой попытки. Наибольшая серия вычисляется тем же правилом по скользящему окну.
Лимит одиночных пропусков (неограниченное число изолированных против одного за 7 дней) — вопрос 6.7.

### 5.4 Статистика Challenge (FR-PROG-04)
- Позиции: попытки Challenge с `side ≠ WAIT`.
- Win rate = доля позиций с `rMultiple > 0` (таймаут с положительным R считается выигрышем) **(предложение)**.
- Средний R = среднее `rMultiple` по позициям (SL = -1, TP = +RR, таймаут — по закрытию окна).
- Доля верных WAIT = число попыток WAIT с `waitCorrect = true` / число попыток WAIT.
- Срезы: по сложности и по паре — по требованию; значения только нейтральным цветом.

## 6. Открытые вопросы

1. **Хранение `skill_stats`:** таблица-кэш (как в DDL) против SQL view/функции над `attempts`. Принята таблица как источник для быстрого экрана «Слабые места»; пересчёт гарантирует согласованность.
2. **Судьба IndexedDB после M7** и ручной экспорт/импорт JSON до M7 (страховка от очистки данных браузером).
3. **Очередь отложенной записи** при недоступном Supabase (NFR-REL-04).
4. **Другой пользователь на том же устройстве:** импорт локальных данных только в первый аккаунт (предложение); как поступать со вторым.
5. **Конфликты терминальной разметки:** LWW на пару теряет правки при одновременной работе на двух устройствах; поэлементное слияние требует tombstone-записей об удалении меток. Решение отложено.
6. **Разметка терминала на пару или пару+ТФ** (OQ-21 PRD): схема предполагает на пару (метки в время/цена).
7. **Лимит одиночных пропусков в серии:** в определении любое число изолированных пропусков прощается; альтернатива — один пропуск за скользящие 7 дней.
8. **Дневная цель:** учитывать ли проверки разметки в терминале и повторы того же сценария; сейчас — нет.
9. **Статистика и `algoVersion`:** исходы разных версий алгоритма смешиваются; фильтр или сброс окна при смене версии не определены.
10. **Поле `grade.feedback` в БД:** хранить целиком или пересобирать по кодам (размер строки).
11. **Окно N = 20, `MIN_SAMPLE = 5`, порог 0.8 и правило повышения сложности** — предложения (OQ-12 PRD).
12. **Часовой пояс:** `localDay` фиксируется на момент попытки; дедупликация дней при путешествиях не определена.
13. **Лимиты Supabase Free** (размер БД, письма magic link — OQ-22 PRD) — проверить перед M7.
