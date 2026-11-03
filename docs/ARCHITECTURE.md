# Architecture — Trading Lab

Статус: черновик v1 (Этап 3), 2026-11-03. Автор: оркестратор. Решения обоснованы в `docs/DECISIONS/` (ADR-0001…0009).

## 1. Ключевые ограничения, определяющие архитектуру

| # | Факт (проверен) | Следствие |
|---|---|---|
| C1 | `fapi.binance.com` / `fstream.binance.com` отвечают 451/недоступны из облака (США); с устройства пользователя работают, CORS `*` | Живые данные загружает **браузер** напрямую |
| C2 | `data.binance.vision` (официальный архив USDⓈ-M: klines всех ТФ, 1m, aggTrades) доступен с серверов, но **без CORS** | Историю для заданий читает **сервер** (Vercel Functions) |
| C3 | Задания не должны раскрывать будущее | Будущее сценария живёт только на сервере до момента решения |
| C4 | Авторизация — в конце (M7), синхронизация между устройствами появляется с ней | До M7 хранение **локальное (IndexedDB)** за интерфейсом репозитория |
| C5 | Только бесплатные тарифы (Vercel Hobby, Supabase Free) | Без своих серверов/БД для свечей; кэш на CDN Vercel и в браузере |
| C6 | Lightweight Charts не умеет рисовать/сохранять | Собственный слой разметки на Series Primitives |
| C7 | Правильность определяет детерминированный алгоритм | Единое чистое TS-ядро, общее для браузера и сервера, версионируемое |

## 2. Обзор

```
┌──────────────────────────── Browser (phone / laptop) ─────────────────────────────┐
│  Next.js UI (React)                                                               │
│   ├─ Terminal ── LiveFeed ──REST klines + WS kline──► fapi/fstream.binance.com    │
│   ├─ Modules (MS / PA / Challenge) ──fetch──► /api/* (same origin)                │
│   ├─ Chart: Lightweight Charts v5 + DrawingLayer (primitives, pointer/touch)      │
│   ├─ @tl/core (shared): candles, SMC, PA, grading, feedback templates             │
│   └─ Repository (IndexedDB now → Supabase at M7)                                  │
└───────────────────────────────────────────────────────────────────────────────────┘
                 │ /api/history, /api/tasks/*, /api/challenge/*
┌──────────────── Vercel Functions (Node runtime) ────────────────┐
│  ArchiveSource ──GET zip/CSV──► data.binance.vision (official)  │
│  @tl/core: aggregation checks, scenario generation, resolution  │
│  Signed task tokens (HMAC, secret in env)                       │
│  Cache-Control: immutable for closed periods → Vercel CDN       │
└──────────────────────────────────────────────────────────────────┘
                 │ (M7)
          Supabase: Auth (Google + magic link), Postgres + RLS
```

## 3. Репозиторий (pnpm monorepo)

```
apps/web/                 Next.js 16 (App Router, TypeScript strict)
  app/                    маршруты: /, /terminal, /learn/market-structure, /learn/price-action,
                          /learn/challenge, /progress, api/*
  src/features/           по модулю: terminal, market-structure, price-action, challenge, progress
  src/chart/              обёртка LWC + DrawingLayer + инструменты
  src/data/               LiveFeed (REST+WS), клиент /api
  src/storage/            Repository: LocalRepository (IndexedDB) / SupabaseRepository (M7)
  src/i18n/ru/            все тексты интерфейса и шаблоны разборов
packages/core/            чистый TS без DOM/Node API: domain-типы, свечи, SMC, PA, challenge, grading
packages/market-data/     Binance: нормализация kline, ArchiveSource (сервер), REST/WS (браузер)
fixtures/                 реальные свечи из data.binance.vision для тестов (с источником и датой)
e2e/                      Playwright
docs/
```
Владение: `packages/core` — Technical Analyst + Backend; `packages/market-data` — Market Data Engineer; `apps/web/src/chart` — Chart Developer; остальное `apps/web` — Frontend; `api/*` — Backend. Изменения в чужой зоне — только через оркестратора.

## 4. Домен и общие типы (`@tl/core`)

```ts
type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | string;     // задания: только первые три
type Timeframe = '1m' | '15m' | '1h' | '4h' | '1d';            // 1m — служебный
type UtcMs = number;                                            // всё время — UTC, мс; показ — локальное

interface Candle {
  openTime: UtcMs; closeTime: UtcMs;
  open: number; high: number; low: number; close: number;
  volume: number;          // базовый актив
  quoteVolume: number;
  trades: number;
  closed: boolean;         // false = незакрытая свеча
}
interface CandleSeries { symbol: Symbol; tf: Timeframe; source: 'binance-live' | 'binance-archive'; candles: Candle[] }
```
Правила нормализации (единый модуль `normalize`): сортировка по `openTime`; дубликаты — побеждает последняя полученная версия (для незакрытой) / закрытая; пропуски детектируются по шагу ТФ и **дозапрашиваются**, если не дозапросились — помечаются `gap`, свечи не выдумываются. Синтетика запрещена (`source` только binance-*).

### 4.1 Синхронизация таймфреймов
- Отображаемые ТФ берутся **нативными** у Binance (совпадение с биржей 1:1).
- Инвариант (тестируется): агрегация 1m → 15m → 1h → 4h → 1d совпадает с нативными свечами (O/H/L/C точно, объём с допуском округления).
- **Срез на момент T** (`sliceAt(series, T)`): все свечи с `closeTime < T` + для старших ТФ — частичная свеча, собранная из 1m в `[openTime, T)`, с `closed=false`. Это единственный способ показать «текущую» старшую свечу без будущего.
- Видимая область при переключении ТФ сохраняется по времени (центр и ширина в мс).

### 4.2 Разметка (общая модель для пользователя и алгоритма)
```ts
interface Anchor { time: UtcMs; price: number }
type MarkKind =
  | 'swing-high' | 'swing-low' | 'hh' | 'hl' | 'lh' | 'll'
  | 'bos' | 'choch' | 'sweep' | 'order-block' | 'fvg'
  | 'level' | 'hline' | 'trendline' | 'pattern' | 'position';
interface Mark {
  id: string; kind: MarkKind; anchors: Anchor[];         // 1..3 точки по типу
  scope: 'internal' | 'external' | null;                 // для структуры
  direction: 'bull' | 'bear' | null;
  meta?: Record<string, unknown>;                        // напр. patternType, sl/tp
  author: 'user' | 'algo';
}
```
Привязка к (время, цена), а не к пикселям → метки стабильны при зуме, смене ТФ и устройства.

### 4.3 Алгоритмы (детерминированные, версионируемые)
`ALGO_VERSION` хранится в каждой попытке, чтобы старые результаты оставались объяснимыми.
- `detectSwings(candles, {left, right})` — фрактал.
- `analyzeStructure(candles, params)` → внешняя/внутренняя структура, HH/HL/LH/LL, BOS/CHoCH (по **закрытию тела**), sweeps, OB, FVG.
- `detectPatterns(candles)` → 6 моделей PA.
- `findLevels(candles)` → зоны S/R по кластерам разворотов.
- `gradeMarks(user: Mark[], algo: Mark[], tolerance)` → совпадения/пропуски/лишние + коды ошибок.
- `resolveTrade(position, futureProvider)` → исход с drill-down 15m/1h/4h/1d → 1m → aggTrades.
- `buildFeedback(gradeResult)` → 6-частный разбор из шаблонов `i18n/ru/feedback/*` по кодам ошибок.
Точные параметры фиксирует Technical Analyst в `docs/specs/ALGORITHMS.md` (обязательно до реализации, M2).

## 5. Потоки данных

### 5.1 Живые данные (терминал)
1. `GET fapi/v1/klines?symbol&interval&limit≤1500` → нормализация → график.
2. WS `fstream.binance.com/stream?streams=<sym>@kline_<tf>` → обновление последней свечи (`k.x` = закрыта).
3. Переподключение с экспоненциальной задержкой; после переподключения — REST-догрузка с последнего `openTime` (закрывает пропуски).
4. Fallback: если WS не подключился за N с — опрос REST раз в 2–5 с, индикатор «режим опроса».
5. Прокрутка влево — догрузка истории пачками по 1500 (`endTime`).
6. Ошибка 451/сети — понятное сообщение, без подстановки данных.

### 5.2 История для заданий (сервер)
`ArchiveSource.get(symbol, tf, from, to)` → monthly zip для закрытых месяцев, daily zip для текущего → распаковка CSV → нормализация. Кэш: ответы `/api/history` за закрытые периоды — `Cache-Control: public, s-maxage=31536000, immutable`. Архив публикуется с задержкой ~1 день — задания строятся только по данным старше 2 суток.

### 5.3 Задания (stateless, без БД до M7)
- `POST /api/tasks/{module}/next` `{difficulty, symbol?, exclude[]}` → сервер выбирает момент, проверяет, что ситуация подходит под тип/сложность (по `@tl/core`), возвращает **только прошлое** + `taskToken`.
- `taskToken` = HMAC-подписанный `{module, symbol, T, tf, difficulty, algoVersion, seed}` (секрет `TASK_SIGNING_SECRET`). Сервер не хранит состояние; всё восстанавливается из токена и архива.
- `POST /api/tasks/{module}/grade` `{taskToken, answer}` → проверка подписи → эталон через `@tl/core` → `GradeResult` + разбор + (Challenge) будущие свечи и раскрытая дата.
- Дата скрыта: клиент получает время свечей **сдвинутым** относительно скрытого якоря (относительная шкала), реальная дата — только в ответе `grade`.

### 5.4 Хранение (Repository)
```ts
interface Repository {
  saveAttempt(a: Attempt): Promise<void>; listAttempts(f: AttemptFilter): Promise<Attempt[]>;
  getSkillStats(): Promise<SkillStat[]>;
  saveTerminalMarks(symbol: Symbol, marks: Mark[]): Promise<void>; getTerminalMarks(symbol): Promise<Mark[]>;
  getSettings(): Promise<Settings>; saveSettings(s: Settings): Promise<void>;
}
```
До M7 — `LocalRepository` (IndexedDB, Dexie). M7 — `SupabaseRepository` + однократный импорт локальных данных при первом входе. Все записи имеют `id` (UUID) и `updatedAt` для слияния. Схема — `docs/DATABASE_SCHEMA.md`.

## 6. Авторизация (M7)
Supabase Auth: Google OAuth + magic link. `@supabase/ssr` в Next.js (cookies). RLS: каждая таблица `user_id = auth.uid()`. Клиент использует только anon-ключ; service-role ключ не используется в браузере никогда. Автопинг: Vercel Cron (Hobby: 1 раз/сутки) → лёгкий запрос к Supabase.

## 7. Безопасность
- Нет ключей Binance вообще. Секреты (`TASK_SIGNING_SECRET`, Supabase) — только env Vercel; `.env*` в `.gitignore`.
- Все входы `/api/*` валидируются `zod`; ограничение размера тела; символы — whitelist для заданий, regex `^[A-Z0-9]{2,20}USDT$` для терминала.
- Rate limit на `/api/tasks/*` (in-memory токен-бакет на инстанс; достаточно для одного пользователя).
- CSP: `connect-src 'self' https://fapi.binance.com wss://fstream.binance.com https://*.supabase.co`.
- Ответы `grade` не раскрывают параметры эталона сверх нужного для разбора.

## 8. Фронтенд
- Next.js App Router; интерактивные части — client components. Состояние: `zustand` (сессия задания, инструменты), серверные данные — `fetch` + простой кэш (без лишних библиотек).
- Стили: Tailwind v4 + CSS-переменные токенов (тёмная/светлая). Цвета свечей: синий/оранжевый, монохром — настройка; без red/green семантики.
- Mobile-first: график на весь экран, нижняя панель инструментов, разбор — bottom sheet. Pointer Events (касание/мышь единым кодом).
- Тексты — только из `src/i18n/ru`.

## 9. Тестирование (кратко; детали — `docs/TESTING_STRATEGY.md`)
- `@tl/core`: Vitest, TDD; фикстуры — реальные свечи из `data.binance.vision` (в репозитории, с указанием файла-источника). Golden-тесты на размеченных вручную участках (Technical Analyst).
- `market-data`: контракт-тесты нормализации (дубли, пропуски, незакрытая свеча, WS-сообщения, записанные заранее).
- API: интеграционные тесты route handlers с локальными архивными фикстурами.
- E2E: Playwright на мобильном и десктопном viewport; сеть Binance подменяется **записанными реальными ответами** (маркировка `fixture`).
- Визуальный контроль: скриншоты на этапах + Impeccable `audit/critique`.

## 10. Развёртывание
До подключения Vercel (решение пользователя — ближе к концу): проверка через `next build`, тесты и скриншоты Playwright, присылаемые пользователю. После подключения: превью на каждый PR, production из `main`. CI: GitHub Actions — lint, typecheck, unit, build, e2e.

## 11. Риски
| Риск | Митигация |
|---|---|
| WS Binance недоступен с телефона/сети пользователя | REST-polling fallback; проверка на первом деплое |
| Архив data.binance.vision меняет формат/недоступен | Нормализация с проверкой заголовков CSV; кэш CDN; понятная ошибка |
| Неоднозначность SMC-определений | Спецификация `ALGORITHMS.md` + golden-тесты + `ALGO_VERSION` |
| Производительность разметки на слабом телефоне | Primitives рисуют только видимое; лимит объектов; профилирование (M8) |
| Лимиты Vercel Hobby (время функции, объём) | Малые zip (daily/monthly), CDN-кэш, только нужный диапазон |
