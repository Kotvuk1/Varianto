# API Contracts — Trading Lab

Статус: черновик v1, 2026-11-03. Источник истины: `docs/ARCHITECTURE.md` (§4, §5, §7); требования — `docs/PRD.md`; обоснования — `docs/DECISIONS/`.
Метки: **(предложение)** — значение не зафиксировано в источниках; **(проверить на M0)** — внешний факт, в котором нет уверенности или который требует проверки на устройстве/в окружении; **(расширение)** — дополнение к `ARCHITECTURE.md`, не противоречащее ему. Все открытые вопросы собраны в разделе 8.

Решения пользователя, учтённые в контрактах: дата Challenge раскрывается после разбора; время хранится в UTC, показывается в локальном часовом поясе; если SL и TP задеты в одной свече — drill-down на 1m, затем aggTrades; вход по закрытию последней видимой свечи, без комиссий; дневная цель 10 заданий (настраивается); авторизация в M7, до этого IndexedDB; гостевой режим отложен.

## 1. Общие соглашения

- Транспорт: JSON (`application/json; charset=utf-8`), same-origin; CORS-заголовки не выставляются. Маршруты — Next.js route handlers, Node runtime.
- Время: все поля времени — `UtcMs` (миллисекунды Unix, UTC). Исключение: в заданиях время на **шкале задания** (см. 4.1), у Challenge она сдвинута относительно реальной.
- Цены и объёмы в JSON — числа (не строки). Преобразование из строк Binance — в `normalize`.
- Валидация входа — `zod`, режим `.strict()` (лишние поля -> 400). Лимит размера тела `/api/tasks/*`: 64 КБ **(предложение)**, при превышении 413.
- Символы: задания — whitelist `BTCUSDT | ETHUSDT | SOLUSDT`; терминал (вне `/api`) — regex `^[A-Z0-9]{2,20}USDT$`.
- Модули: `market-structure`, `price-action`, `challenge`. Неизвестный `{module}` — 404.
- Тексты разборов на сервере не формируются: API возвращает коды и параметры шаблонов; строки подставляет UI из `src/i18n/ru` (см. раздел 8, п.3).

### 1.1 Формат ошибки

```ts
interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;                 // для логов/разработчика, не для показа пользователю
    details?: { issues?: ValidationIssue[]; retryAfterSec?: number };
  };
}
interface ValidationIssue { path: string; code: ValidationIssueCode; message: string }
```

| HTTP | `error.code` | Когда |
|---|---|---|
| 400 | `validation_failed` | Не прошла zod-схема или бизнес-проверка входа; `details.issues[]` с кодами из `ValidationIssueCode` |
| 401 | `invalid_token_signature` | MAC токена не совпал / токен повреждён / неизвестная версия `v` |
| 401 | `token_expired` | `exp` токена в прошлом |
| 404 | `not_found` | Неизвестный маршрут/модуль; нет данных за запрошенный период (файла нет в архиве) |
| 413 | `payload_too_large` | Тело больше лимита **(расширение)** |
| 429 | `rate_limited` | Превышен токен-бакет; заголовок `Retry-After` |
| 500 | `internal_error` | Необработанная ошибка (без деталей наружу) |
| 502 | `archive_unavailable` | Архив data.binance.vision недоступен, вернул 5xx/таймаут, неверный CSV-заголовок или контрольная сумма |

```ts
type ValidationIssueCode =
  | 'INVALID_TYPE' | 'OUT_OF_RANGE' | 'UNKNOWN_SYMBOL' | 'UNKNOWN_TIMEFRAME'
  | 'RANGE_NOT_ALIGNED' | 'RANGE_TOO_LARGE' | 'RANGE_TOO_RECENT'
  | 'SL_REQUIRED' | 'TP_REQUIRED' | 'SL_WRONG_SIDE' | 'TP_WRONG_SIDE'
  | 'ENTRY_MISMATCH' | 'WAIT_HAS_POSITION_FIELDS' | 'TOO_MANY_ITEMS' | 'TEXT_TOO_LONG';
```

`SL_WRONG_SIDE` / `TP_WRONG_SIDE` (FR-TC-08, FR-FB-09) возвращаются как ошибка валидации, попытка не оценивается и не записывается. Эти же коды входят в единый словарь кодов (раздел 5.3).

### 1.2 Заголовки кэша

| Маршрут | `Cache-Control` |
|---|---|
| `GET /api/history` (закрытый период) | `public, max-age=31536000, s-maxage=31536000, immutable` |
| `POST /api/tasks/*` | `no-store` |
| `GET /api/health` | `no-store` |
| Любая ошибка | `no-store` |

Rate limit (in-memory токен-бакет на инстанс, `ARCHITECTURE.md` §7): `/api/tasks/*` — 30 запросов/мин на IP **(предложение)**; `/api/history` — 120/мин **(предложение)**.

## 2. Типы `@tl/core`, используемые в контрактах

### 2.1 Из `ARCHITECTURE.md` §4 (дословно)

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

interface Anchor { time: UtcMs; price: number }
type MarkKind =
  | 'swing-high' | 'swing-low' | 'hh' | 'hl' | 'lh' | 'll'
  | 'bos' | 'choch' | 'sweep' | 'order-block' | 'fvg'
  | 'level' | 'hline' | 'trendline' | 'pattern' | 'position'
  | 'fib-retracement' | 'fib-extension'              // (новое, FIBONACCI.md §9.1): 2 и 3 якоря
  | 'ew-impulse' | 'ew-zigzag' | 'ew-flat';           // (новое, ELLIOTT.md §2.1): 3|5|6 якорей / 3 / 3
interface Mark {
  id: string; kind: MarkKind; anchors: Anchor[];         // 1..3 точки по типу; ew-impulse — 3, 5 или 6 (ELLIOTT.md §17 п.1)
  scope: 'internal' | 'external' | null;                 // для структуры
  direction: 'bull' | 'bear' | null;
  meta?: Record<string, unknown>;                        // напр. patternType, sl/tp
  author: 'user' | 'algo';
}
```
Функции ядра (сигнатуры уточняет `docs/specs/ALGORITHMS.md`): `detectSwings`, `analyzeStructure`, `detectPatterns`, `findLevels`, `gradeMarks(user: Mark[], algo: AlgoMarkSet, ctx: GradeContext)` (ALGORITHMS §12.1; прежняя форма `gradeMarks(user, algo, tolerance)` не хватала входов, см. ALGORITHMS §19 п.1), `resolveTrade(position, futureProvider)`, `buildFeedback(gradeResult)`, `normalize`, `sliceAt(series, T)`; константа `ALGO_VERSION = '1.0.0'` (ALGORITHMS §19 п.6).

Нормализация (`normalize`): сортировка по `openTime`; дубликаты — побеждает последняя версия (для незакрытой) / закрытая; пропуски дозапрашиваются, иначе помечаются `gap`; синтетика запрещена.

### 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`)

```ts
type ModuleId = 'market-structure' | 'price-action' | 'challenge' | 'fibonacci' | 'elliott'
  | 'stage-swings' | 'levels' | 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry';   // курс по ступеням: CURRICULUM_STAGES.md §11, ALGO_VERSION 2.0.0, CUR_ALGO_VERSION 1.0.0
// SkillId += 'swing-trend' | 'level-zone' | 'level-reaction' | 'limit-placement' | 'limit-fill' | 'stop-placement' | 'take-profit' | 'risk-reward'; MarkKind += 'zone' (2 якоря: верх, низ)
// Типы: packages/core/src/curriculum/{zone,limit,stoptake,combo,levels-grade,swings}.ts (ZoneInfo, LimitOrder, CurPart, ComboAnswer); API: apps/web/src/server/{schemas,curriculum}.ts   // 'fibonacci' (ALGO_VERSION 1.2.0), 'elliott' (новое, ALGO_VERSION 1.3.0, EW_ALGO_VERSION 1.0.0)
type TaskTimeframe = '15m' | '1h' | '4h' | '1d';               // FR-DATA-05
type TaskSymbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';           // FR-DATA-03
type Difficulty = 'easy' | 'medium' | 'hard';

// Модели PA: шесть (OQ-11 открыт). Молот/падающая звезда = pin-bar + direction; утренняя/вечерняя звезда — две модели.
type PatternType = 'engulfing' | 'pin-bar' | 'inside-bar' | 'doji' | 'morning-star' | 'evening-star';

// Начальный список навыков (привязка ошибок к навыкам, FR-FB-07, FR-PROG-01). Окончательный — ALGORITHMS.md.
type SkillId =
  | 'swing' | 'structure-labels' | 'bos' | 'choch' | 'internal-external'
  | 'sweep' | 'order-block' | 'fvg'
  | 'pa-engulfing' | 'pa-pin-bar' | 'pa-inside-bar' | 'pa-doji' | 'pa-star'
  | 'pa-level' | 'pa-context'
  | 'challenge-entry' | 'challenge-risk' | 'challenge-wait'
  | 'fib-anchor' | 'fib-reaction' | 'fib-extension' | 'premium-discount'   // (новое, FIBONACCI.md §10)
  | 'ew-impulse' | 'ew-correction' | 'ew-rules' | 'ew-invalidation';          // (новое, ELLIOTT.md §13)

type Verdict = 'correct' | 'partial' | 'incorrect';
```

## 3. Внутренние HTTP API

### 3.1 `GET /api/health`

Назначение: проверка живости деплоя и версий.

Запрос: query `deep?: '1'` — дополнительно проверить доступность архива (HEAD на небольшой известный файл, результат кэшируется в памяти на 60 с **(предложение)**).

```ts
interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;            // версия приложения (git sha / package version)
  algoVersion: string;        // ALGO_VERSION
  time: UtcMs;                // серверное время
  archive?: { reachable: boolean; checkedAt: UtcMs };   // только при deep=1
}
```
Ошибки: 429. `degraded` — приложение живо, но архив недоступен (HTTP остаётся 200). Кэш: `no-store`.

### 3.2 `GET /api/history`

Назначение: нормализованные свечи из архива data.binance.vision (ADR-0004). Используется сервером при генерации заданий и клиентом при разработке/тестах; терминал живых данных использует Binance напрямую (ADR-0003).

Query:
```ts
interface HistoryQuery {
  symbol: TaskSymbol;
  tf: Timeframe;              // включая служебный '1m'
  from: UtcMs;                // включительно, openTime первой свечи; выровнен по границе tf
  to: UtcMs;                  // исключительно, выровнен по границе tf; to > from
}
// Ограничения:
// - (to - from) / шаг(tf) <= 5000 свечей, иначе 400 RANGE_TOO_LARGE (предложение)
// - to <= now - 2 суток, иначе 400 RANGE_TOO_RECENT (ARCHITECTURE §5.2: данные старше 2 суток)
// - from/to не на границе tf -> 400 RANGE_NOT_ALIGNED (нужно для стабильного ключа CDN-кэша)
```

Ответ 200:
```ts
interface HistoryResponse {
  series: CandleSeries;                       // source: 'binance-archive', все closed=true
  gaps: { fromTime: UtcMs; toTime: UtcMs }[]; // найденные пропуски (если есть); свечи не выдумываются
}
```
Ошибки: 400 (`validation_failed`), 404 (нет данных за период, пара не найдена в архиве), 429, 502. Кэш: `public, max-age=31536000, s-maxage=31536000, immutable` (допустимо, т.к. `to` всегда старше 2 суток; архив для закрытых периодов считается неизменным — **проверить на M0**, как часто Binance перезаписывает файлы).

### 3.3 `POST /api/tasks/{module}/next`

Назначение: выдать задание. Сервер выбирает момент `T` (на сетке 15m), проверяет пригодность ситуации через `@tl/core` и возвращает **только прошлое**. Выбор момента — по `seed`, генерируемому сервером (токен хранит seed).

Путь: `module` ∈ `market-structure | price-action | challenge`.

Тело (общая часть — `ARCHITECTURE.md` §5.3; поля `focus`, `mode`, `taskType`, `tf` — **расширение**, необходимо для PRD FR-MS-01, FR-PA-01, FR-PROG-03):
```ts
interface NextBase {
  difficulty: Difficulty;
  symbol?: TaskSymbol;           // если нет — случайный из whitelist
  exclude?: string[];            // taskId ранее выданных заданий; max 200
  focus?: SkillId[];             // адаптивная подборка по слабым навыкам; max 5
}
type NextRequest =
  | (NextBase & { module: 'market-structure'; mode: 'mark' | 'question'; tf: TaskTimeframe })
  | (NextBase & { module: 'price-action'; taskType: 'find-pattern' | 'context'; tf: TaskTimeframe })   // 'draw-level' удалён (2.0.0): задание переехало в levels/lv-strongest
  | (NextBase & { module: 'challenge' })      // ТФ выбирается пользователем в UI; сервер отдаёт все четыре
  | (NextBase & { module: 'fibonacci'; taskType: 'grid' | 'reaction' | 'extension'; tf: TaskTimeframe });   // (новое) FIBONACCI.md §9.2; series — только запрошенный tf, 500 закрытых свечей (1d — 365)
  | (NextBase & { module: 'stage-swings'; taskType: 'sw-mark' | 'sw-trend'; tf: TaskTimeframe })        // (новое) CURRICULUM_STAGES.md §2; absolute
  | (NextBase & { module: 'levels'; taskType: 'lv-strongest' | 'lv-zone' | 'lv-reaction'; tf: TaskTimeframe })   // §3; lv-reaction — relative, без 1d
  | (NextBase & { module: 'limit-entry' | 'stop-take' | 'combo-level-trade' | 'combo-smc-entry'; tf?: TaskTimeframe })   // §5-§8; relative; tf из списка сложности (1d недоступен), иначе по seed; вне списка — 400 UNKNOWN_TIMEFRAME
  | (NextBase & { module: 'elliott'; tf?: TaskTimeframe });   // (новое) ELLIOTT.md §12.2; tf из списка сложности (easy 1h/4h, medium/hard 15m/1h/4h), иначе по seed (вне списка — 400 UNKNOWN_TIMEFRAME); kind задания определяется сложностью, focus на него не влияет (§19); series — только tf задания, 500 закрытых свечей
```
`module` в теле дублирует путь и должен совпадать с ним (иначе 400).

Ответ 200:
```ts
interface TaskEnvelope<P extends TaskPayload = TaskPayload> {
  taskId: string;                // непрозрачный id (хэш symbol+T); для exclude[]
  taskToken: string;             // см. 3.5
  module: ModuleId;
  difficulty: Difficulty;
  symbol: TaskSymbol;
  algoVersion: string;
  expiresAt: UtcMs;              // = exp токена
  timeline: { mode: 'relative' | 'absolute' };   // challenge, fib-reaction, fib-extension, elliott, lv-reaction, limit-entry, stop-take, комбо — 'relative'; fib-grid, sw-*, lv-strongest, lv-zone — 'absolute'
  decisionTime: UtcMs;           // T на шкале задания
  series: Partial<Record<TaskTimeframe, Candle[]>>;   // времена на шкале задания; closeTime < T, плюс частичная свеча старших ТФ (closed=false)
  payload: P;
}
```
Свечи: challenge — все четыре ТФ; market-structure — только запрошенный `tf`; price-action с `taskType: 'context'` — ряды `tf` и `htf(tf)` (старший ТФ: 15m→1h, 1h→4h, 4h→1d, 1d→1d; ALGORITHMS §11.2, §19 п.4), оба только закрытые свечи до `T`; прочие price-action задания — только `tf`. Глубина истории **(предложение)**: 500 свечей на ТФ, для `1d` — 365; фиксируется при реализации (OQ-19 PRD). Ни одна свеча не содержит данных позже `T`; частичная свеча старшего ТФ собрана из 1m в `[openTime, T)` (ADR-0006).

```ts
type TaskPayload =
  | MsMarkTask | MsQuestionTask
  | PaFindTask | PaLevelTask | PaContextTask
  | ChallengeTask;

interface MsMarkTask {
  kind: 'ms-mark'; tf: TaskTimeframe;
  concepts: SkillId[];                    // что проверяется в задании (справка FR-MS-16)
  tools: MarkKind[];                      // доступные инструменты
  referenceKey: string;                   // ключ справки в i18n
}
interface MsQuestionTask {
  kind: 'ms-question'; tf: TaskTimeframe;
  questionId: string;
  promptKey: string; promptParams: Record<string, string | number>;
  options: { id: string; labelKey: string }[];
  highlight?: Anchor[];                   // подсвеченные места на графике
}
interface PaFindTask {
  kind: 'pa-find'; tf: TaskTimeframe;
  target: PatternType;                    // какую модель искать
  window: { fromTime: UtcMs; toTime: UtcMs };    // где искать
}
interface PaLevelTask {
  kind: 'pa-level'; tf: TaskTimeframe;
  levelType: 'support' | 'resistance';
  tolerancePct: number;                   // ~0.3 (FR-PA-03); точное значение — ALGORITHMS.md
}
interface PaContextTask {
  kind: 'pa-context'; tf: TaskTimeframe;
  pattern: Mark;                          // подсвеченная модель (author: 'algo', kind: 'pattern')
  factorOptions: ContextFactorKey[];      // перечень вариантов ответа — OQ-16, предварительно
}
interface ChallengeTask {
  kind: 'challenge';
  defaultTf: TaskTimeframe;
  entryPrice: number;                     // close последней видимой свечи (вход по закрытию, без комиссий)
  reasonOptions: ReasonCode[];            // список причин; состав — OQ-08
  timeLimitCandles: Record<TaskTimeframe, number>;   // лимит проигрывания (OQ-09)
  hints?: Mark[];                         // только на easy (FR-TC-18)
}
```

Ошибки: 400 (`validation_failed`), 404 (неизвестный модуль), 413, 429, 502 (архив недоступен при генерации). Кэш: `no-store`.

### 3.4 `POST /api/tasks/{module}/grade`

Назначение: проверить ответ. Сервер проверяет токен, восстанавливает ситуацию из архива, считает эталон через `@tl/core`, возвращает результат и разбор. Для Challenge — также будущие свечи и раскрытую дату.

Тело:
```ts
interface GradeRequest {
  taskToken: string;
  answer: Answer;                  // вариант, соответствующий модулю и kind задания
}
```
Ответ 200: `GradeResult` (раздел 5). Ошибки:
- 400 — схема; несоответствие `answer.kind` типу задания из токена; бизнес-проверки Challenge (`SL_REQUIRED`, `TP_REQUIRED`, `SL_WRONG_SIDE`, `TP_WRONG_SIDE`, `ENTRY_MISMATCH`, `WAIT_HAS_POSITION_FIELDS`, `TOO_MANY_ITEMS`, `TEXT_TOO_LONG`);
- 401 — `invalid_token_signature`, `token_expired`;
- 404, 413, 429;
- 502 — архив недоступен при восстановлении ситуации или при drill-down (ADR-0007).

Кэш: `no-store`.

### 3.5 Токен задания (`taskToken`)

```
v1.<header>.<sealed>.<mac>      // base64url-сегменты
```
- `header` — JSON с открытыми полями (клиент читает без расшифровки): `module`, `symbol`, `difficulty`, `algoVersion`, `iat`, `exp`; версия формата `v` — префикс токена.
- `sealed` — AES-256-GCM от `{ T, seed, shiftMs, tf?, params }` (**расширение**: шифрование `T`, чтобы не раскрывать дату; ADR-0005).
- `mac` — HMAC-SHA256 по `v1.<header>.<sealed>`; ключи выводятся из `TASK_SIGNING_SECRET` (env Vercel).
- Клиент трактует токен как непрозрачную строку; формат может измениться (`v`).
- `exp = iat + 24 ч` **(предложение)**.

## 4. Шкала времени заданий и ответы

### 4.1 Шкала задания
- `timeline.mode = 'absolute'`: времена в `series`, якорях и ответах — реальные `UtcMs`.
- `timeline.mode = 'relative'` (Challenge, Fibonacci `reaction` и `extension`, Elliott — дата скрыта, будущее проигрывается): все времена — `real − shiftMs`, где `shiftMs` секретный, кратен 1 суткам (сетка 4h/1d сохраняется). UI для Challenge не показывает дату (на оси — время суток или номера свечей; AC-08).
- Якоря в `answer` отправляются на шкале задания; сервер переводит в реальное время.
- После `grade` клиент получает `reveal.shiftMs` и `reveal.decisionTime` (реальное) и показывает дату в локальном часовом поясе. Все времена внутри `GradeResult` остаются на шкале задания (чтобы разметка ложилась на тот же график); реальное время = `time + reveal.shiftMs`.
- Для `fibonacci/grid`, `market-structure` и `price-action` режим по умолчанию `absolute` (скрывать ли дату — вопрос 8.6).

### 4.2 Типы ответа (`Answer`)

```ts
type Answer =
  | MsMarkAnswer | MsQuestionAnswer
  | PaFindAnswer | PaLevelAnswer | PaContextAnswer
  | ChallengeAnswer;

// market-structure
interface MsMarkAnswer     { kind: 'ms-mark';     marks: Mark[] }                    // author: 'user', max 100 меток (предложение), anchors 1..3
interface MsQuestionAnswer { kind: 'ms-question'; questionId: string; optionId: string }

// price-action
interface PaFindAnswer     { kind: 'pa-find';     marks: Mark[] }                    // kind: 'pattern', meta.patternType: PatternType, direction; anchors — свечи модели
interface PaLevelAnswer    { kind: 'pa-level';    price: number }                    // горизонтальный уровень; допуск считает сервер
interface PaContextAnswer  {
  kind: 'pa-context';
  factors: ContextFactorAnswer;
  significant: boolean;                                                              // модель значима в этом контексте?
}
type ContextFactorKey = 'sweep' | 'order-block' | 'key-level' | 'htf-trend';
interface ContextFactorAnswer {
  sweep: boolean; orderBlock: boolean; keyLevel: boolean;
  htfTrend: 'up' | 'down' | 'range';
}

// fibonacci (новое, FIBONACCI.md §9.2-§9.3; типы — packages/core/src/fib/types.ts)
type FibReactionOption = '0.382' | '0.5' | '0.618' | '0.705' | '0.786' | 'ote' | 'deep';
type FibConfluenceKey = 'order-block' | 'fvg' | 'level';
type FibTarget = '1' | '1.272' | '1.618' | 'none';
interface FibGridAnswer      { kind: 'fib-grid';      mark: Mark }                  // kind 'fib-retracement', author 'user', ровно 2 якоря [начало, конец]
interface FibReactionAnswer  { kind: 'fib-reaction';  option: FibReactionOption; confluence: FibConfluenceKey[]; pd: 'premium' | 'discount' | null }
interface FibExtensionAnswer { kind: 'fib-extension'; mark: Mark; target: FibTarget }   // kind 'fib-extension', ровно 3 якоря [A, B, C]
// validation (400, попытка не оценивается): FIB_ANCHORS_COUNT, FIB_ANCHOR_OUT_OF_RANGE, FIB_OPTION_UNAVAILABLE, FIB_CONFLUENCE_INVALID, FIB_PD_MISMATCH

// elliott (новое, ELLIOTT.md §9.5, §12.3; типы — packages/core/src/elliott/types.ts)
type EwTaskKind = 'ew-impulse' | 'ew-impulse-correction' | 'ew-scenario';          // easy | medium | hard
type EwPrimaryScenario = 'w3-next' | 'w5-next' | 'abc-next' | 'trend-next';
type EwScenarioId = EwPrimaryScenario | 'bc-next' | 'correction-extends' | 'impulse-extends';
interface ElliottAnswer {
  kind: EwTaskKind;                         // = kind задания
  impulse: Mark;                            // kind 'ew-impulse', author 'user', anchors 3 | 5 | 6 (0..5), время на шкале задания
  correction: Mark | null;                  // kind 'ew-zigzag' | 'ew-flat', anchors 3 (A, B, C); только при impulse из 6 точек и не на easy
  primary: EwPrimaryScenario;
  alternative: EwScenarioId | null;         // на easy необязательна
  invalidation: number | null;              // цена горизонтали
}
// validation (400, попытка не оценивается): EW_ANCHORS_COUNT, EW_ANCHOR_OUT_OF_RANGE (якорь вне window), EW_CORRECTION_WITHOUT_IMPULSE,
//   EW_SCENARIO_UNKNOWN, EW_SHAPE_NOT_ALLOWED (коррекция на easy), EW_INVALIDATION_INVALID (не конечное положительное число).
//   Неполная разметка (3/5 точек на easy, нет коррекции на medium) не 400, а EW_COUNT_INCOMPLETE в разборе.

// challenge
type ReasonCode =                                                                    // начальный список (OQ-08)
  | 'trend-continuation' | 'choch-reversal' | 'bos-confirmed' | 'sweep-reversal'
  | 'order-block-reaction' | 'fvg-fill' | 'level-reaction' | 'htf-alignment'
  | 'range-no-edge' | 'unclear-structure';
interface ChallengeAnswer {
  kind: 'challenge';
  side: 'LONG' | 'SHORT' | 'WAIT';
  tf: TaskTimeframe;                  // ТФ, на котором принято решение (определяет обход при resolveTrade)
  entry?: number;                     // обязателен для LONG/SHORT; должен совпасть с entryPrice задания (иначе 400 ENTRY_MISMATCH)
  sl?: number;                        // обязателен для LONG/SHORT
  tp?: number;                        // обязателен для LONG/SHORT
  reasons: ReasonCode[];              // 0..8
  note?: string;                      // <= 500 символов, выводится с экранированием (NFR-SEC-05)
}
```

Правила zod-схемы Challenge (фрагмент, остальное по аналогии):
```ts
const ChallengeAnswer = z.object({
  kind: z.literal('challenge'),
  side: z.enum(['LONG', 'SHORT', 'WAIT']),
  tf: z.enum(['15m', '1h', '4h', '1d']),
  entry: z.number().positive().finite().optional(),
  sl: z.number().positive().finite().optional(),
  tp: z.number().positive().finite().optional(),
  reasons: z.array(ReasonCode).max(8),
  note: z.string().max(500).optional(),
}).strict().superRefine((a, ctx) => {
  if (a.side === 'WAIT') { /* entry/sl/tp запрещены -> WAIT_HAS_POSITION_FIELDS */ }
  else { /* sl, tp, entry обязательны; LONG: sl < entry < tp; SHORT: tp < entry < sl */ }
});
```
Проверка сторон: LONG — SL ниже входа, TP выше; SHORT — наоборот (FR-TC-08). `entry` сверяется с `entryPrice` из токена с допуском в один tick **(предложение)**.

### 4.3 Ответы курса (CURRICULUM_STAGES.md §11.3; схемы — apps/web/src/server/schemas.ts)

```ts
type Answer = /* … */
  | { kind: 'sw-mark'; marks: Mark[] }
  | { kind: 'sw-trend'; questionId: string; optionId: 'up' | 'down' | 'range' }
  | { kind: 'lv-strongest'; price: number }
  | { kind: 'lv-zone'; zone: Mark }                      // kind 'zone', 2 якоря
  | { kind: 'lv-reaction'; optionId: string }            // 'z1'…'z3' | 'none'
  | { kind: 'limit-entry'; limit: LimitOrder }           // { price, type: 'near-edge'|'middle'|'far-edge'|'front-run', frontK: number|null }
  | { kind: 'stop-take'; sl: number; tp: number }
  | { kind: 'combo-level-trade' | 'combo-smc-entry'; zone: Mark; limit: LimitOrder; sl: number; tp: number };
```
Validation 400: `ZONE_MARK_INVALID`, `ZONE_SIDE_MISMATCH`, `LIMIT_WRONG_SIDE`, `LIMIT_TYPE_INVALID`, `OPTION_UNKNOWN`, `SL_WRONG_SIDE`, `TP_WRONG_SIDE`. `GradeResult.replay` расширен `fillIndex?: number | null` (индекс исполнения лимитки в `replay.candles`). Исполнение лимитки — проход цены на ≥ 1 тик (§20). Шаблоны вердикта: `feedback.verdict.limit.*` (ступень 3), `feedback.verdict.trade.*` (ступень 4, комбо; параметры `score`, `outcomeText`, `outcomeTime`, `r`). Старые токены ALGO_VERSION 1.x отклоняются как `token_expired`.

## 5. Результат проверки и разбор

### 5.1 `GradeResult`

```ts
interface GradeResult {
  taskId: string;
  module: ModuleId;
  algoVersion: string;                       // ALGO_VERSION, использованная для эталона
  verdict: Verdict;
  score: number;                             // 0..1 по модулю; формула — ALGORITHMS.md (для Challenge качество — OQ-08)
  task: RevealedTask;                        // расшифрованные параметры задания (раскрывается после разбора)
  skillOutcomes: SkillOutcome[];             // вход для skill_stats
  errors: GradeError[];
  reference: Mark[];                         // эталонная разметка алгоритма (author: 'algo'), на шкале задания
  detail: ModuleDetail;
  feedback: Feedback;
  replay?: TaskReplay;                       // challenge и fibonacci (reaction, extension); тип ChallengeReplay переименован в TaskReplay
}

interface RevealedTask {
  module: ModuleId; difficulty: Difficulty; symbol: TaskSymbol; tf: TaskTimeframe | null;
  reveal: { decisionTime: UtcMs; shiftMs: number };     // реальная дата: time + shiftMs
  taskKind: TaskPayload['kind'];
}
interface SkillOutcome { skill: SkillId; correct: number; total: number }     // total >= 1
interface GradeError {
  code: ErrorCode;
  skill: SkillId;
  severity: 'minor' | 'major';
  markIds?: string[];                        // id меток пользователя/эталона, к которым относится ошибка
  params?: Record<string, string | number>;  // подстановки в шаблон
}

type ModuleDetail =
  | { kind: 'ms-mark' | 'pa-find'; marks: MarkGrade }
  | { kind: 'ms-question'; chosenOptionId: string; correctOptionId: string }
  | { kind: 'pa-level'; userPrice: number; referencePrice: number; deviationPct: number; tolerancePct: number }
  | { kind: 'pa-context'; expected: ContextFactorAnswer & { significant: boolean }; given: ContextFactorAnswer & { significant: boolean } }
  | { kind: 'challenge'; challenge: ChallengeDetail }
  | { kind: 'fib-grid' | 'fib-reaction' | 'fib-extension'; fib: FibDetail }   // (новое) FibDetail — FIBONACCI.md §9.3, packages/core/src/fib/types.ts
  | { kind: EwTaskKind; elliott: ElliottDetail };   // (новое) ELLIOTT.md §12.3, packages/core/src/elliott/types.ts; invalidation после ABC (trend-next) — точка C (§19), ruleRef 'P0' | 'P1' | 'P5' | 'C'

interface MarkGrade {
  matched: { userMarkId: string; algoMarkId: string; timeOffsetCandles: number; priceOffsetPct: number }[];
  missed: Mark[];                            // эталонные, которых нет у пользователя
  extra: Mark[];                             // лишние метки пользователя
  ignored: string[];                         // (новое) id меток пользователя, совпавших с допустимыми эталонами (заполненные FVG, инвалидированные OB, sweep-кандидаты у правого края) или вне окна оценки (ALGORITHMS §12.1, §12.2, §12.6; §19 п.2)
  toleranceCandles: number;                  // допуск по времени (±2, FR-MS-13; значение — ALGORITHMS §12.1)
}

interface ChallengeDetail {
  decisionCorrect: boolean;                  // решение верно по исходу + правилам структуры (FR-TC-22)
  waitCorrect: boolean | null;               // только для side = 'WAIT' (FR-TC-14)
  quality: { score: number; parts: { key: string; score: number }[] } | null;   // независимо от исхода; формула — OQ-08
  outcome: ChallengeOutcome | null;          // null для WAIT
}
interface ChallengeOutcome {
  side: 'LONG' | 'SHORT';
  entry: number; sl: number; tp: number;
  result: 'tp' | 'sl' | 'timeout';
  exitTime: UtcMs; exitPrice: number;        // на шкале задания
  rMultiple: number;                         // 1R = |entry - sl|; sl = -1; tp = +RR; timeout = по close последней свечи окна
  method: 'candle' | 'drill-1m' | 'drill-aggtrades' | 'conservative-sl' | 'timeout';   // ADR-0007
}
interface TaskReplay {
  tf: TaskTimeframe;
  candles: Candle[];                         // после T на шкале задания, до выхода (или окончания окна для WAIT)
  exitIndex: number | null;
}
```
Сохраняемая версия результата (`Attempt.grade`) — это `Omit<GradeResult, 'replay'>` (свечи проигрывания не хранятся).

### 5.2 `Feedback` (6 частей, FR-FB-02)

```ts
interface Feedback {
  verdict: FeedbackBlock;              // 1. Верность
  understood: FeedbackBlock[];         // 2. Что понято верно
  mistakes: FeedbackBlock[];           // 3. Ошибки
  why: FeedbackBlock[];                // 4. Почему это ошибка
  howTo: FeedbackBlock[];              // 5. Как правильно
  principle: FeedbackBlock;            // 6. Принцип
}
interface FeedbackBlock {
  templateKey: string;                 // ключ шаблона в src/i18n/ru/feedback/*
  code: ErrorCode | OkCode | null;     // null для общих блоков
  params?: Record<string, string | number>;
  markIds?: string[];                  // подсветка меток на графике (FR-FB-06)
  glyph: 'match' | 'miss' | 'extra' | 'info';   // иконка/форма, не цвет (FR-FB-05)
}
type OkCode = 'OK_SWING' | 'OK_BOS' | 'OK_CHOCH' | 'OK_OB' | 'OK_FVG' | 'OK_LEVEL' | 'OK_PATTERN'
            | 'OK_CONTEXT' | 'OK_SL_PLACEMENT' | 'OK_WAIT'
            | 'OK_LABEL' | 'OK_SCOPE' | 'OK_SWEEP' | 'OK_HTF' | 'OK_RR'
            | 'OK_FIB_ANCHOR' | 'OK_FIB_EQUAL_EXTREME' | 'OK_FIB_REACTION' | 'OK_FIB_CONFLUENCE' | 'OK_PD' | 'OK_EXT_POINTS' | 'OK_EXT_TARGET'
            | 'OK_EW_POINTS' | 'OK_EW_RULES' | 'OK_EW_GUIDES' | 'OK_EW_EXTENDED3' | 'OK_EW_CORRECTION' | 'OK_EW_INVALIDATION' | 'OK_EW_ALT';   // Elliott (новое), ELLIOTT.md §14.2   // Fibonacci (новое), FIBONACCI.md §11.2   // OK_LABEL…OK_RR — (новое), ALGORITHMS §19 п.5
```
Элементы массивов `mistakes`, `why`, `howTo` соответствуют друг другу по `code` (один `GradeError` порождает по одному блоку в каждой из трёх частей).

### 5.3 Коды ошибок

Окончательный список: `ALGORITHMS.md` (§12.6, §14.3, §17; §19 п.5). Коды, помеченные (новое), добавлены спецификацией.

```ts
type ErrorCode =
  // Market Structure
  | 'SWING_MISSED' | 'SWING_EXTRA' | 'SWING_OFF_TOLERANCE' | 'SWING_UNCONFIRMED'          // SWING_UNCONFIRMED (новое)
  | 'STRUCTURE_LABEL_WRONG' | 'STRUCTURE_LABEL_MISSED' | 'STRUCTURE_LABEL_EXTRA'          // *_MISSED / *_EXTRA (новые)
  | 'BOS_WICK_ONLY' | 'BOS_MISSING' | 'BOS_WRONG_LEVEL'                                  // BOS_WICK_ONLY и BOS_WRONG_LEVEL применимы к CHoCH (params.kind = 'choch')
  | 'BOS_EXTRA' | 'BOS_WRONG_DIRECTION' | 'BOS_CHOCH_CONFUSED'                           // (новые)
  | 'CHOCH_MISSING' | 'CHOCH_WRONG_DIRECTION' | 'CHOCH_EXTRA'                             // CHOCH_EXTRA (новое)
  | 'INTERNAL_AS_EXTERNAL' | 'EXTERNAL_AS_INTERNAL'
  | 'SWEEP_MISSED' | 'SWEEP_IS_BREAK' | 'SWEEP_EXTRA'                                    // SWEEP_EXTRA (новое)
  | 'MARK_WRONG_DIRECTION'                                                               // (новое)
  | 'OB_WRONG_CANDLE' | 'OB_NO_DISPLACEMENT' | 'OB_WRONG_BOUNDS' | 'OB_MISSED' | 'OB_EXTRA'   // OB_WRONG_BOUNDS, OB_MISSED, OB_EXTRA (новые)
  | 'FVG_NOT_GAP' | 'FVG_WRONG_BOUNDS' | 'FVG_MISSED' | 'FVG_EXTRA'                       // FVG_MISSED, FVG_EXTRA (новые)
  | 'QUESTION_WRONG'                                                                     // (новое)
  // Price Action
  | 'PATTERN_WRONG_TYPE' | 'PATTERN_MISSED' | 'PATTERN_EXTRA' | 'PATTERN_WRONG_DIRECTION'
  | 'LEVEL_OFF_TOLERANCE' | 'LEVEL_NOT_STRONGEST' | 'LEVEL_WRONG_TYPE'                   // LEVEL_NOT_STRONGEST, LEVEL_WRONG_TYPE (новые)
  | 'CONTEXT_IGNORED_HTF' | 'CONTEXT_MISSED_SWEEP' | 'CONTEXT_MISSED_LEVEL' | 'CONTEXT_FALSE_POSITIVE'
  | 'CONTEXT_MISSED_OB' | 'CONTEXT_PHANTOM_FACTOR' | 'CONTEXT_FALSE_NEGATIVE'            // (новые)
  // Challenge
  | 'SL_WRONG_SIDE' | 'TP_WRONG_SIDE' | 'SL_INSIDE_STRUCTURE' | 'RR_TOO_LOW'
  | 'SL_TOO_WIDE'                                                                        // (новое)
  | 'TRADE_AGAINST_HTF' | 'TRADE_AGAINST_STRUCTURE' | 'TRADE_IN_RANGE'                   // TRADE_AGAINST_STRUCTURE (новое)
  | 'ENTRY_NO_POI'                                                                       // (новое)
  | 'WAIT_MISSED_SETUP' | 'REASON_MISMATCH'
  // Fibonacci (новое), FIBONACCI.md §11.3
  | 'FIB_WRONG_DIRECTION' | 'FIB_NOT_IMPULSE' | 'FIB_WRONG_ANCHOR_START' | 'FIB_WRONG_ANCHOR_END' | 'FIB_IMPULSE_UNCONFIRMED'
  | 'FIB_LEVEL_MISS' | 'FIB_DEEP_MISSED' | 'FIB_CONFLUENCE_WRONG' | 'FIB_PD_WRONG'
  | 'EXT_WRONG_DIRECTION' | 'EXT_WRONG_POINTS' | 'EXT_TARGET_MISS' | 'EXT_TARGET_CONSERVATIVE'
  // Elliott (новое), ELLIOTT.md §14.3
  | 'EW_WRONG_ORDER' | 'EW_POINT_NOT_EXTREME' | 'EW_POINT_NOT_SWING' | 'EW_COUNT_NOT_CURRENT' | 'EW_COUNT_INCOMPLETE'
  | 'EW_RULE_W2_BEYOND_W1' | 'EW_RULE_W3_NOT_BEYOND_W1' | 'EW_RULE_W3_SHORTEST' | 'EW_RULE_W4_OVERLAP'
  | 'EW_ZIGZAG_B_TOO_DEEP' | 'EW_ZIGZAG_C_NOT_BEYOND_A' | 'EW_FLAT_B_TOO_SHALLOW' | 'EW_FLAT_C_TOO_SHORT'
  | 'EW_GUIDE_MISS' | 'EW_SCENARIO_MISMATCH' | 'EW_INVALIDATION_WRONG' | 'EW_INVALIDATION_TOO_TIGHT'
  | 'EW_ALT_MISSING' | 'EW_ALT_SAME' | 'EW_ALT_INCONSISTENT';
```

| Код | Навык (`SkillId`) | Смысл |
|---|---|---|
| `SWING_MISSED` / `SWING_EXTRA` | `swing` | Пропущен эталонный swing / лишний |
| `SWING_OFF_TOLERANCE` | `swing` | Отметка дальше допуска ±N свечей |
| `STRUCTURE_LABEL_WRONG` | `structure-labels` | Неверно HH/HL/LH/LL |
| `BOS_WICK_ONLY` | `bos` | Пробой фитилём, тело не закрылось за уровнем (FR-MS-07) |
| `BOS_MISSING` / `BOS_WRONG_LEVEL` | `bos` | BOS не отмечен / отмечен от другого уровня |
| `CHOCH_MISSING` | `choch` | CHoCH не отмечен |
| `CHOCH_WRONG_DIRECTION` | `choch` | Направление не соответствует смене структуры |
| `INTERNAL_AS_EXTERNAL` / `EXTERNAL_AS_INTERNAL` | `internal-external` | Перепутаны внутренняя и внешняя структура |
| `SWEEP_MISSED` | `sweep` | Не замечено снятие ликвидности |
| `SWEEP_IS_BREAK` | `sweep` | Принят sweep за BOS (или наоборот): закрытие тела за уровнем |
| `OB_WRONG_CANDLE` | `order-block` | OB отмечен не на той свече |
| `OB_NO_DISPLACEMENT` | `order-block` | Нет импульса (displacement) после зоны |
| `FVG_NOT_GAP` | `fvg` | Отмечена область без разрыва между свечами 1 и 3 |
| `FVG_WRONG_BOUNDS` | `fvg` | Границы FVG неверны |
| `PATTERN_WRONG_TYPE` | `pa-*` по типу | Модель распознана как другая |
| `PATTERN_MISSED` / `PATTERN_EXTRA` | `pa-*` | Пропущена / лишняя модель |
| `PATTERN_WRONG_DIRECTION` | `pa-*` | Неверное направление (бычья/медвежья) |
| `LEVEL_OFF_TOLERANCE` | `pa-level` | Уровень за допуском ~0.3% (FR-PA-03) |
| `CONTEXT_IGNORED_HTF` | `pa-context` | Не учтён тренд старшего ТФ |
| `CONTEXT_MISSED_SWEEP` / `CONTEXT_MISSED_LEVEL` | `pa-context` | Не замечен sweep / ключевой уровень рядом с моделью |
| `CONTEXT_FALSE_POSITIVE` | `pa-context` | Значимой названа модель без подтверждающего контекста |
| `SL_WRONG_SIDE` / `TP_WRONG_SIDE` | `challenge-risk` | Стоп/тейк с неправильной стороны от входа (в API — validation issue, 400) |
| `SL_INSIDE_STRUCTURE` | `challenge-risk` | Стоп внутри структуры, а не за значимым swing |
| `RR_TOO_LOW` | `challenge-risk` | Соотношение риск/прибыль ниже порога (значение — ALGORITHMS.md) |
| `SWING_UNCONFIRMED` (новое) | `swing` | Swing отмечен на свече, которая ещё не подтверждена фракталом |
| `STRUCTURE_LABEL_MISSED` / `STRUCTURE_LABEL_EXTRA` (новые) | `structure-labels` | Пропущена / лишняя метка HH/HL/LH/LL |
| `BOS_EXTRA` / `BOS_WRONG_DIRECTION` (новые) | `bos` | Лишний BOS / BOS в неверном направлении |
| `BOS_CHOCH_CONFUSED` (новое) | `bos`, `choch` | Перепутаны BOS и CHoCH на одной свече |
| `CHOCH_EXTRA` (новое) | `choch` | Лишний CHoCH |
| `SWEEP_EXTRA` (новое) | `sweep` | Лишний sweep: за фитилём нет подтверждённого внешнего swing |
| `MARK_WRONG_DIRECTION` (новое) | по `params.kind` | Направление метки BREAK, SWEEP, OB или FVG не совпадает с эталоном |
| `OB_WRONG_BOUNDS` (новое) | `order-block` | Границы OB неверны (IoU ценовых интервалов < 0.5) |
| `OB_MISSED` / `OB_EXTRA` (новые) | `order-block` | Пропущен / лишний OB |
| `FVG_MISSED` / `FVG_EXTRA` (новые) | `fvg` | Пропущен / лишний FVG |
| `QUESTION_WRONG` (новое) | по шаблону | Неверный ответ в вопросе (`ms-question`) |
| `LEVEL_NOT_STRONGEST` / `LEVEL_WRONG_TYPE` (новые) | `pa-level` | Отмечен слабее эталонного уровень того же типа / уровень другого типа |
| `CONTEXT_MISSED_OB` / `CONTEXT_PHANTOM_FACTOR` / `CONTEXT_FALSE_NEGATIVE` (новые) | `pa-context` | Не замечен OB / назван фактор, которого нет / модель названа незначимой при подтверждённом контексте |
| `SL_TOO_WIDE` (новое) | `challenge-risk` | Stop Loss дальше защищённого уровня более чем на 1.5 ATR |
| `TRADE_AGAINST_STRUCTURE` (новое) | `challenge-entry` | Сделка против структуры рабочего ТФ |
| `ENTRY_NO_POI` (новое) | `challenge-entry` | Вход вне зоны интереса (OB, FVG, защищённый уровень) |
| `TRADE_AGAINST_HTF` | `challenge-entry` | Вход против тренда старшего ТФ без обоснования |
| `TRADE_IN_RANGE` | `challenge-entry` | Позиция во флэте, где корректен WAIT |
| `WAIT_MISSED_SETUP` | `challenge-wait` | WAIT при наличии валидной точки входа |
| `REASON_MISMATCH` | `challenge-entry` | Выбранные причины не соответствуют распознанной структуре |
| `FIB_WRONG_DIRECTION` | `fib-anchor` | Сетка протянута от конца импульса к началу |
| `FIB_NOT_IMPULSE` | `fib-anchor` | Сетка построена не на импульсе задания (коррекция, предыдущая нога, шум) |
| `FIB_WRONG_ANCHOR_START` / `FIB_WRONG_ANCHOR_END` | `fib-anchor` | Начало / конец сетки вне допуска ±2 свечи |
| `FIB_IMPULSE_UNCONFIRMED` | `fib-anchor` | Конец импульса ещё не подтверждён swing (терминал) |
| `FIB_LEVEL_MISS` / `FIB_DEEP_MISSED` | `fib-reaction` | Выбран не тот уровень реакции / пропущена глубокая реакция или слом |
| `FIB_CONFLUENCE_WRONG` | `fib-reaction` | Заявлен конфлюэнс, которого нет в зоне |
| `FIB_PD_WRONG` | `premium-discount` | Premium/Discount определён неверно |
| `EXT_WRONG_DIRECTION` | `fib-anchor` | Extension построен в обратную сторону |
| `EXT_WRONG_POINTS` | `fib-anchor` (A, B) / `fib-extension` (C) | Точка A, B или C вне допуска |
| `EXT_TARGET_MISS` / `EXT_TARGET_CONSERVATIVE` | `fib-extension` | Цель не достигнута / достигнута, но рынок дошёл дальше |
| `EW_WRONG_ORDER`, `EW_COUNT_NOT_CURRENT`, `EW_COUNT_INCOMPLETE` | `ew-impulse` | Точки не по порядку / разметка не доведена до текущей точки / неполная форма |
| `EW_POINT_NOT_EXTREME`, `EW_POINT_NOT_SWING`, `EW_GUIDE_MISS` | `ew-impulse` (0–5) / `ew-correction` (A–C; по `params.label` и `params.guide`) | Точка не экстремум волны / не внешний swing N=5 / рекомендация Фибоначчи не выполнена |
| `EW_RULE_W2_BEYOND_W1`, `EW_RULE_W3_NOT_BEYOND_W1`, `EW_RULE_W3_SHORTEST`, `EW_RULE_W4_OVERLAP` | `ew-rules` | Нарушено нерушимое правило импульса (блокирует: verdict incorrect, score ≤ 0.4) |
| `EW_ZIGZAG_B_TOO_DEEP`, `EW_ZIGZAG_C_NOT_BEYOND_A`, `EW_FLAT_B_TOO_SHALLOW`, `EW_FLAT_C_TOO_SHORT` | `ew-correction` | Нарушено правило типа коррекции (блокирует) |
| `EW_SCENARIO_MISMATCH`, `EW_INVALIDATION_WRONG`, `EW_INVALIDATION_TOO_TIGHT`, `EW_ALT_MISSING`, `EW_ALT_SAME`, `EW_ALT_INCONSISTENT` | `ew-invalidation` | Сценарий / уровень invalidation / альтернатива |

Шаблоны Elliott: `feedback.verdict.elliott.<verdict>` с параметрами `score`, `outcomeText`, `outcomeTime` (время свечи исхода, на шкале задания; форматирует UI); в терминале (`checkEwMarks`) вердикт `feedback.verdict.plain.*`. Имена параметров шаблонов — латиница без цифр (`pZero…pFive`, `lenOne/lenThree/lenFive`, `depthTwo`).

## 6. Внешние API Binance

Используются только публичные эндпоинты; ключи не нужны (FR-DATA-16). Статус «проверено» означает, что факт установлен в этом проекте (curl 2026-11-03 к архиву; для fapi/fstream проверка из контейнера невозможна — 451/таймаут). Остальное — по знанию документации Binance, где не уверен, помечено.

### 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер)

| Параметр | Обязателен | Описание |
|---|---|---|
| `symbol` | да | Например `BTCUSDT` |
| `interval` | да | `1m`, `15m`, `1h`, `4h`, `1d` (также `3m`, `5m`, `30m`, `2h`, `6h`, `8h`, `12h`, `3d`, `1w`, `1M`) |
| `startTime` | нет | мс UTC; фильтр по `openTime` (включительность границ — проверить на M0) |
| `endTime` | нет | мс UTC; то же |
| `limit` | нет | по умолчанию 500, максимум 1500 |

Без `startTime`/`endTime` возвращаются последние свечи. Ответ — массив массивов (цены и объёмы строками):

```
[
  [ 1499040000000,      // 0  openTime (мс)
    "0.01634790",       // 1  open
    "0.80000000",       // 2  high
    "0.01575800",       // 3  low
    "0.01577100",       // 4  close
    "148976.11427815",  // 5  volume (base asset)
    1499644799999,      // 6  closeTime (мс) = openTime + шаг - 1
    "2434.19055334",    // 7  quoteVolume
    308,                // 8  number of trades
    "1756.87402397",    // 9  taker buy base volume
    "28.46694368",      // 10 taker buy quote volume
    "0"                 // 11 ignore
  ]
]
```
Значения-примеры — из документации Binance, не реальный BTCUSDT. Маппинг в `Candle`: `[0]->openTime`, `[1..4]->open/high/low/close`, `[5]->volume`, `[6]->closeTime`, `[7]->quoteVolume`, `[8]->trades`; `closed = closeTime < serverNow` (последний элемент ответа может быть незакрытой свечой). Для `serverNow` при расхождении часов использовать `GET /fapi/v1/time` -> `{ "serverTime": <мс> }` **(проверить на M0)**.

Ошибки: тело `{ "code": <число, например -1121>, "msg": "..." }`; HTTP 429 (лимит, заголовок `Retry-After`), 418 (бан IP после игнорирования 429); 451 — гео-ограничение (наблюдалось из контейнера). Вес запроса зависит от `limit` (для `limit` 1000-1500 вес выше, чем для 500) и учитывается в лимите на IP (порядка 2400/мин) **(проверить на M0)**.

Список контрактов для поиска пары в терминале: `GET /fapi/v1/exchangeInfo` -> `symbols[]` с `symbol`, `contractType` (`PERPETUAL`), `status` (`TRADING`), `quoteAsset` **(проверить на M0 набор полей)**.

### 6.2 WebSocket: kline stream (браузер)

- Подключение (одиночный): `wss://fstream.binance.com/ws/<symbol в нижнем регистре>@kline_<interval>`, например `btcusdt@kline_1h`.
- Подключение (комбинированный): `wss://fstream.binance.com/stream?streams=btcusdt@kline_1h/ethusdt@kline_1h`; сообщения обёрнуты: `{ "stream": "btcusdt@kline_1h", "data": { ...событие... } }`. `ARCHITECTURE.md` §5.1 использует формат `/stream?streams=`.
- **Проверить на M0:** актуальность URL (Binance может менять маршруты WS USDⓈ-M), частота обновлений (порядка 250 мс), лимит времени жизни соединения (около 24 ч — требуется переподключение), максимум подписок на соединение, ping/pong.

Сообщение (событие):
```json
{
  "e": "kline",
  "E": 1638747660000,
  "s": "BTCUSDT",
  "k": {
    "t": 1638747660000, "T": 1638747719999,
    "s": "BTCUSDT", "i": "1m",
    "f": 100, "L": 200,
    "o": "0.0010", "c": "0.0020", "h": "0.0025", "l": "0.0015",
    "v": "1000", "n": 100,
    "x": false,
    "q": "1.0000", "V": "500", "Q": "0.500", "B": "123456"
  }
}
```
Поля `k`: `t` openTime, `T` closeTime, `s` symbol, `i` interval, `f`/`L` first/last trade id, `o/c/h/l` open/close/high/low (строки), `v` volume (base), `n` число сделок, **`x` — свеча закрыта (`true`) или нет**, `q` quote volume, `V`/`Q` taker buy base/quote volume, `B` ignore. Значения — пример из документации. Маппинг: `t->openTime`, `T->closeTime`, `o/h/l/c`, `v->volume`, `q->quoteVolume`, `n->trades`, `x->closed`. Сообщение с `x: true` финализирует свечу; следующее сообщение открывает новый `t`. Дубликат того же `t` заменяет предыдущую версию.

### 6.3 Архив data.binance.vision (сервер)

Все пути — под `https://data.binance.vision/data/futures/um/` (USDⓈ-M). Проверено curl 2026-11-03:

| Данные | Путь |
|---|---|
| klines, месяц | `monthly/klines/<SYMBOL>/<interval>/<SYMBOL>-<interval>-<YYYY>-<MM>.zip` |
| klines, день | `daily/klines/<SYMBOL>/<interval>/<SYMBOL>-<interval>-<YYYY>-<MM>-<DD>.zip` |
| aggTrades, день | `daily/aggTrades/<SYMBOL>/<SYMBOL>-aggTrades-<YYYY>-<MM>-<DD>.zip` |
| aggTrades, месяц | `monthly/aggTrades/<SYMBOL>/<SYMBOL>-aggTrades-<YYYY>-<MM>.zip` (путь по аналогии; для drill-down используется daily; **проверить на M0**) |
| Контрольная сумма | к любому файлу добавить `.CHECKSUM`: одна строка `<sha256>  <имя файла>.zip` |

Интервалы в путях: `1m`, `15m`, `1h`, `4h`, `1d`. Внутри zip — один CSV с тем же именем (`.csv`). Наблюдения:
- Первая строка CSV — заголовок (проверено для klines и aggTrades). Парсер обязан сверять заголовок и падать с `archive_unavailable` при несовпадении (риск формата, `ARCHITECTURE.md` §11).
- Время — миллисекунды (проверено для USDⓈ-M). Для другого рынка/периода единицы могут отличаться — не предполагать, проверять длину значения.
- Публикация с задержкой: файл за 2026-11-02 на 2026-11-03 03:08 UTC отсутствовал (404), за 2026-11-01 — был; месячный файл за октябрь 2026 существовал. Отсюда правило «задания только по данным старше 2 суток». Расписание публикации **проверить на M0**.
- Сервер архива поддерживает HTTP Range (проверено запросом диапазона). Размер daily aggTrades BTCUSDT за 2026-10-20: около 14 МБ (zip). Zip с одним deflate-потоком не допускает произвольного доступа к середине файла: нужен потоковый разбор с ранней остановкой.
- Без CORS, поэтому только с сервера.

CSV klines (12 колонок, порядок как в REST):
```
open_time,open,high,low,close,volume,close_time,quote_volume,count,taker_buy_volume,taker_buy_quote_volume,ignore
```
Маппинг: `open_time->openTime`, `close_time->closeTime`, `volume->volume`, `quote_volume->quoteVolume`, `count->trades`, все `closed = true`. Колонки `taker_*`, `ignore` не используются.

CSV aggTrades (7 колонок):
```
agg_trade_id,price,quantity,first_trade_id,last_trade_id,transact_time,is_buyer_maker
```
Для `resolveTrade`: `transact_time` (мс) задаёт порядок, затем `agg_trade_id`; используется `price`.

## 7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)

```ts
interface Repository {
  saveAttempt(a: Attempt): Promise<void>; listAttempts(f: AttemptFilter): Promise<Attempt[]>;
  getSkillStats(): Promise<SkillStat[]>;
  saveTerminalMarks(symbol: Symbol, marks: Mark[]): Promise<void>; getTerminalMarks(symbol): Promise<Mark[]>;
  getSettings(): Promise<Settings>; saveSettings(s: Settings): Promise<void>;
}
```

Типы, на которые ссылается интерфейс (**предложение**, согласованы с `docs/DATABASE_SCHEMA.md`; в `ARCHITECTURE.md` не определены). Все записи — `id` (UUID) и `updatedAt` для слияния:

```ts
interface Attempt {
  id: string;                          // UUID v4, создаётся на клиенте
  module: ModuleId;
  taskId: string;
  task: RevealedTask;                  // task_token_payload в БД
  answer: Answer;
  grade: Omit<GradeResult, 'replay'>;
  algoVersion: string;
  skills: SkillId[];                   // навыки, затронутые заданием
  correct: boolean;                    // grade.verdict === 'correct'
  rMultiple: number | null;            // только challenge с позицией
  localDay: string;                    // 'YYYY-MM-DD' в локальном поясе на момент попытки
  durationMs: number | null;
  createdAt: UtcMs; updatedAt: UtcMs;
}
interface AttemptFilter {
  module?: ModuleId; skill?: SkillId; correct?: boolean;
  fromTime?: UtcMs; toTime?: UtcMs; limit?: number; offset?: number;
  order?: 'asc' | 'desc';              // по createdAt, по умолчанию desc
}
interface SkillStat {
  skill: SkillId;
  attempts: number;                    // всего учтённых исходов
  correct: number;
  recent: { t: UtcMs; ok: boolean }[]; // последние N исходов, N = 20 (предложение)
  accuracy: number | null;             // correct окна / размер окна; null при пустом окне
  updatedAt: UtcMs;
}
interface Settings {
  id: string; updatedAt: UtcMs;
  theme: 'dark' | 'light';             // dark по умолчанию (FR-UI-04)
  candleStyle: 'blue-orange' | 'mono'; // FR-CHART-06/07
  dailyGoal: number;                   // заданий в день, по умолчанию 10
  lastTerminalSymbol: Symbol;          // по умолчанию 'BTCUSDT'
  locale: 'ru';
}
```

Расширения интерфейса для M7 и прогресса (**предложение**, в `ARCHITECTURE.md` §5.4 отсутствуют):
```ts
interface RepositoryExtensions {
  getDailyActivity(fromDay: string, toDay: string): Promise<DailyActivity[]>;
  exportSnapshot(): Promise<LocalSnapshot>;                  // для импорта при первом входе
  importSnapshot(s: LocalSnapshot): Promise<ImportReport>;   // SupabaseRepository; идемпотентно, см. DATABASE_SCHEMA.md
}
interface DailyActivity { day: string; tasksDone: number; goal: number }
```
Определения метрик (точность навыка, серия, дневная цель) — `docs/DATABASE_SCHEMA.md`, раздел 5.

## 8. Открытые вопросы

1. **Шифрование `T` в токене.** `ARCHITECTURE.md` §5.3 описывает токен как HMAC-подписанный `{module, symbol, T, ...}`; открытый `T` раскрывает дату Challenge. Контракт добавляет шифрование `T` (расширение; ADR-0005). Подтвердить.
2. **Расширения тела `next`:** `mode`, `taskType`, `tf`, `focus` (нужны для FR-MS-01, FR-PA-01, FR-PROG-03) отсутствуют в `ARCHITECTURE.md` §5.3. Подтвердить.
3. **Где формируются строки разбора.** `buildFeedback` в §4.3 строит разбор по шаблонам `i18n/ru/feedback/*`, но `@tl/core` не должен знать UI-ресурсы. Контракт: API возвращает ключи шаблонов и параметры, UI подставляет текст. Подтвердить; альтернатива — шаблоны внутри `core`.
4. **Диаграмма `ARCHITECTURE.md` §2** упоминает `/api/challenge/*`, §5.3 — `/api/tasks/challenge/*`. В контракте принят §5.3.
5. **Доступность `/api/history` для клиента.** Теоретически клиент может перебором найти по форме свечей реальную дату Challenge-сценария. Для одного владельца риск принимается; при многопользовательском режиме (v2) закрыть маршрут для клиента или добавить проверку.
6. **Скрытие даты в Market Structure и Price Action.** По умолчанию `absolute`. Подтвердить, что скрывать нужно только в Challenge.
7. **Повторный `grade` по одному токену** (peek будущего Challenge, переоценка): без серверного состояния не предотвращается; см. ADR-0005. Политика для старой `algoVersion` в токене не определена.
8. **Недоступность aggTrades при drill-down:** решено — консервативный SL с пометкой `conservative-sl` (ADR-0007).
9. **Состав `ReasonCode`, `ContextFactorKey`, формула качества Challenge, лимиты времени** — OQ-08, OQ-09, OQ-16 PRD; в контракте приведены предварительные значения.
10. **`PatternType`:** шесть моделей закладываются как `engulfing, pin-bar, inside-bar, doji, morning-star, evening-star` (OQ-11 PRD).
11. **Глубина истории в `next`** (500 свечей/ТФ, 1d — 365) и размер ответа challenge (четыре ряда) — подтвердить замером на M0.
12. **Rate limit и TTL токена** (30/мин, 24 ч) — значения-предложения.
13. **Терминальная проверка разметки** («Проверить мою разметку») выполняется в браузере через `@tl/core`; сохраняется ли она как `Attempt` (модуль `terminal`) — не определено, в `ModuleId` не включена.
14. **Факты Binance, помеченные «проверить на M0»:** границы `startTime`/`endTime`, веса и лимиты REST, актуальный URL и ограничения WS, `exchangeInfo`, расписание публикации архива, путь monthly aggTrades, частота перезаписи архивных файлов.
