# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 401 files · ~213,333 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2783 nodes · 7688 edges · 148 communities (140 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 216 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e7cde18b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- i18n/format.ts
- with
- Architecture — Trading Lab
- 2. Карточки
- progressLogic.ts
- market-data/package.json
- UtcMs
- Mark
- core/package.json
- compilerOptions
- Interview Summary — Trading Lab
- ui/index.ts
- compilerOptions
- Project Status — Trading Lab
- Skills Registry — Trading Lab
- touches
- chart-developer.md
- devops-security.md
- documentation-engineer.md
- hit.ts
- market-data-engineer.md
- qa-engineer.md
- technical-analyst.md
- uiux-designer.md
- DECISIONS/README.md
- PaFindBody.tsx
- Candle
- features/feedback/index.ts
- progress/streak.ts
- hit.ts
- token.ts
- 2. `detectSwings` — фрактальные swing
- .prettierrc.json
- e2e/tsconfig.json
- core/tsconfig.json
- market-data/tsconfig.json
- src/types.ts
- postcss.config.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- pnpm-workspace.yaml
- handlers.test.ts
- LAYOUTS — Trading Lab
- 2. Компоненты
- DESIGN — Trading Lab
- COPY — микрокопия Trading Lab
- check_tokens.py
- web/package.json
- skills.ts
- rules.ts
- 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)
- TradingChart.tsx
- levels.ts
- TimeIndex
- TradingChart
- src/types.ts
- useMarketData.ts
- params.ts
- placeholders.test.ts
- archive.test.ts
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- grade.ts
- schemas.ts
- challenge/api.ts
- 13. Генерация заданий
- Settings
- src/normalize.ts
- Находки
- live.test.ts
- tasks.ts
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- panels.tsx
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- facts.ts
- sessionStore.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- resolve.ts
- 5. Тренд, BOS и CHoCH
- patterns.ts
- ref_node_crypto
- package.json
- axis.ts
- 1. Общие соглашения
- 7. Order Block
- web/AGENTS.md
- reveal.ts
- history/route.ts
- src/feedback/index.ts
- hints.ts
- SessionActions
- Стратегия тестирования — Trading Lab
- DrawingPrimitive.ts
- 6. Внешние API Binance
- ref_vitest
- serialize.ts
- ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере
- @playwright/test
- Roadmap — Trading Lab
- 6. Liquidity sweep
- fetch-fixtures.mjs
- pa/index.ts
- Query
- SettingsScreen.tsx
- ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel
- scripts
- ProgressScreen.tsx
- ChallengeSession.tsx
- criteria.ts
- ms.helpers.ts
- sources.ts
- runCheck.ts
- build.ts
- ProgressScreen.tsx
- QA Report — финальная приёмка MVP Trading Lab (M8)
- useRepository
- 12. `gradeMarks` — сравнение разметки
- fixtures
- resolve.test.ts
- 4. Функциональные требования
- storage/index.ts
- 7. User Flows
- Подключение Supabase и Vercel (с телефона)
- TimeIndex
- Команда агентов — Trading Lab
- ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling
- controller.ts
- ADR-0007: Правила исхода сделки Challenge (drill-down)
- 3. Область продукта
- 16. Навыки и прогресс
- ADR-0004: История для заданий — сервер читает архив data.binance.vision
- ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt
- ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7
- sessionStore.test.ts
- vercel.json
- 5. Результат проверки и разбор
- 8. FVG (Fair Value Gap)

## God Nodes (most connected - your core abstractions)
1. `Candle` - 92 edges
2. `Mark` - 83 edges
3. `UtcMs` - 79 edges
4. `react` - 72 edges
5. `TaskTimeframe` - 50 edges
6. `cn()` - 46 edges
7. `analyzeStructure()` - 45 edges
8. `Button()` - 36 edges
9. `TradingChart()` - 33 edges
10. `LocalRepository` - 33 edges

## Surprising Connections (you probably didn't know these)
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `P1` --references--> `fmtPrice()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/progress/ErrorLog.tsx
- `1. Принципы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts
- `6. Открытые вопросы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (148 total, 8 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.10
Nodes (39): atrAt(), buildMsQuestion(), Candidate, checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion(), gradeMsQuestion() (+31 more)

### Community 1 - "Repository"
Cohesion: 0.06
Nodes (21): LocalRepository, SupabaseRepository, Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт (+13 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (24): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+16 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.11
Nodes (17): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next` (+9 more)

### Community 4 - "i18n/format.ts"
Cohesion: 0.14
Nodes (26): DIR, formatParam(), FORMATTERS(), formatWhen(), KIND_KEYS, placeOf(), TIME_KEYS, ErrorLog() (+18 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.11
Nodes (18): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+10 more)

### Community 7 - "2. Карточки"
Cohesion: 0.18
Nodes (11): 2. Карточки, Backend Developer, Chart Developer, DevOps/Security Engineer, Documentation Engineer, Frontend Developer, Market Data Engineer, Orchestrator (+3 more)

### Community 8 - "progressLogic.ts"
Cohesion: 0.15
Nodes (15): asCore(), avgQuality(), ErrorGroup, groupByModule(), hasEnoughData(), MODULE_ORDER, moduleAccuracies(), ModuleAccuracy (+7 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.12
Nodes (19): ArchiveLoaderOptions, DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalSnapshot, mark (+11 more)

### Community 11 - "Mark"
Cohesion: 0.07
Nodes (47): TerminalPage(), isScopedKind(), ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), normalizeSymbolInput(), PRESET_SYMBOLS (+39 more)

### Community 12 - "core/package.json"
Cohesion: 0.15
Nodes (14): devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, vitest, @vitest/coverage-v8, name, private (+6 more)

### Community 13 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+6 more)

### Community 14 - "Interview Summary — Trading Lab"
Cohesion: 0.14
Nodes (13): 1. Продукт и пользователь, 2. Модули и приоритеты, 3. Обратная связь и прогресс, 4. Интерфейс, 5. Рыночные данные, 6. Стек и инфраструктура, 7. Процесс, Interview Summary — Trading Lab (+5 more)

### Community 15 - "ui/index.ts"
Cohesion: 0.08
Nodes (45): ORDER, ResultSheet(), ResultSheetHeight, ResultSheetProps, SHEET_CLASS, SHEET_PAD, SessionLayoutProps, TaskHintProps (+37 more)

### Community 16 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, lib, paths, plugins, exclude (+3 more)

### Community 17 - "Project Status — Trading Lab"
Cohesion: 0.25
Nodes (7): Project Status — Trading Lab, Блокирующие проблемы, Доступность рыночных данных из контейнера (проверено curl), Завершённые этапы, Окружение (облачный контейнер Claude Code), Следующие действия, Текущие задачи

### Community 18 - "Skills Registry — Trading Lab"
Cohesion: 0.25
Nodes (7): Skills Registry — Trading Lab, Кандидаты — отложены до утверждения архитектуры, Отклонённые, Справочник: Public APIs, Уже доступные навыки окружения (не требуют установки), Установка в новом контейнере, Установленные инструменты

### Community 19 - "touches"
Cohesion: 0.50
Nodes (5): inside(), 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, touches()

### Community 20 - "chart-developer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 21 - "devops-security.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 22 - "documentation-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 23 - "hit.ts"
Cohesion: 0.10
Nodes (20): lightweight-charts@~5.2.1, geos(), synthetic_proj, T0, buildGeometry(), formatPrice, GeometryOptions, GLYPH_OFFSET (+12 more)

### Community 24 - "market-data-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 25 - "qa-engineer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 26 - "technical-analyst.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 27 - "uiux-designer.md"
Cohesion: 0.29
Nodes (6): graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила

### Community 28 - "DECISIONS/README.md"
Cohesion: 0.25
Nodes (5): ADR-0009: Детерминированное общее ядро @tl/core; разборы по шаблонам; ИИ позже, Контекст, Последствия, Рассмотренные альтернативы, Architecture Decision Records — Trading Lab

### Community 29 - "PaFindBody.tsx"
Cohesion: 0.17
Nodes (19): Page(), PaFindBody(), PaLevelBody(), PaSessionScreen(), impliedDirection(), keepSingleLevel(), levelPrice(), paContextAnswer() (+11 more)

### Community 30 - "Candle"
Cohesion: 0.17
Nodes (21): AnswerInput, ChallengeAnswerBody, SessionState, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto, ChallengePayload, ChallengeTaskEnvelope (+13 more)

### Community 31 - "features/feedback/index.ts"
Cohesion: 0.20
Nodes (16): errors, feedback, defaultFmt, FeedbackView(), Section(), renderBlock(), GlyphKind, GradeGlyph() (+8 more)

### Community 32 - "progress/streak.ts"
Cohesion: 0.18
Nodes (17): ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord, GOAL_DEFAULT, GOAL_MAX, GOAL_MIN (+9 more)

### Community 33 - "hit.ts"
Cohesion: 0.13
Nodes (19): distToRectEdge(), distToSegment(), Hit, hitTest(), partScore(), Tolerance, toleranceFor(), CHAR_W (+11 more)

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (26): zod@^4.0.0, ConfigError, b64(), derive(), getSigningSecret(), HeaderSchema, invalid(), keyCache (+18 more)

### Community 35 - "2. `detectSwings` — фрактальные swing"
Cohesion: 0.33
Nodes (6): 2.1 Сигнатура, 2.2 Определение, 2.3 Граничные случаи, 2.4 Кандидаты у правого края (`pendingSwings`), 2.5 Псевдокод, 2. `detectSwings` — фрактальные swing

### Community 36 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 37 - "e2e/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../tsconfig.base.json

### Community 38 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 39 - "market-data/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 40 - "src/types.ts"
Cohesion: 0.09
Nodes (50): 2.1 Из `ARCHITECTURE.md` §4 (дословно), Решение, golden/ - эталонные участки SMC (ALGORITHMS §18), PatternCheck, allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER (+42 more)

### Community 45 - "handlers.test.ts"
Cohesion: 0.16
Nodes (12): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+4 more)

### Community 46 - "LAYOUTS — Trading Lab"
Cohesion: 0.07
Nodes (29): 0.1 Навигация и уровни, 0.2 Зоны экрана 390x844, 0.3 Жесты и разметка (мобильный), 0. Общие правила, 1.1 Мобильный 390x844 (прокручивается; график не нужен), 1.2 Десктоп 1440x900, 1. Главная (раздел «Обучение»), 2.1 Мобильный 390x844 (+21 more)

### Community 47 - "2. Компоненты"
Cohesion: 0.09
Nodes (21): 0. Общее, 1.1 Инструменты разметки, 1.2 Остальные иконки, 1. Набор иконок: lucide-react, 2.10 ProgressBar, 2.11 Toast, 2.12 Tooltip / Hint, 2.13 FeedbackBlock (разбор) (+13 more)

### Community 48 - "DESIGN — Trading Lab"
Cohesion: 0.11
Nodes (17): 1. Принципы, 2.1 Токены, 2.2 Контраст текста (WCAG AA, порог 4.5:1), 2.3 Метки пользователя и алгоритма, 2.4 Проверка при дальтонизме, 2. Цвет, 3.1 Шрифт, 3.2 Шкала (+9 more)

### Community 49 - "COPY — микрокопия Trading Lab"
Cohesion: 0.12
Nodes (15): 10. Спецификации длины, 1. Навигация и разделы, 2. Кнопки и действия, 3. Заголовки, подписи, статусы, 4. Подсказки инструментов (Tooltip, десктоп; строка контекста, мобильный), 5.1 Пустые состояния, 5.2 Ошибки загрузки (блок на месте графика), 5.3 Офлайн и живые данные (+7 more)

### Community 50 - "check_tokens.py"
Cohesion: 0.20
Nodes (7): cr(), de(), lab(), lin(), lum(), rgb(), sim()

### Community 51 - "web/package.json"
Cohesion: 0.06
Nodes (41): dependencies, dexie@^4.0.0, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.118.0, @tl/core@workspace:* (+33 more)

### Community 52 - "skills.ts"
Cohesion: 0.25
Nodes (13): accuracyOf(), applyOutcome(), FOCUS_SIZE, isEnoughData(), MIN_WEIGHT, OK_THRESHOLD, pickFocus(), rankWeakSkills() (+5 more)

### Community 53 - "rules.ts"
Cohesion: 0.16
Nodes (24): normalizeMark(), better(), BreakResult, clampIdx(), Direction, extreme(), FvgResult, isPivot() (+16 more)

### Community 54 - "17. Шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.20
Nodes (13): OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA, ChartTokens (+5 more)

### Community 56 - "levels.ts"
Cohesion: 0.18
Nodes (22): Core, GradeResultApi, 18.2 Участки, ChallengeGrade, FeedbackInput, ContextGrade, DEFAULT_LEVEL_PARAMS, findLevels() (+14 more)

### Community 57 - "TimeIndex"
Cohesion: 0.14
Nodes (27): lwcProjection(), ToolId, ControllerDeps, ControllerNotice, limitCandles(), defaultLogicalRange(), LogicalRange, logicalRangeFromWindow() (+19 more)

### Community 58 - "TradingChart"
Cohesion: 0.13
Nodes (13): DrawingController, bosMark, breakIdx, drag(), index, lvl, proj, pt() (+5 more)

### Community 59 - "src/types.ts"
Cohesion: 0.08
Nodes (37): ChallengeFacts, PoiInfo, algoOf(), ALL, at(), candles, findAlgo(), P (+29 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.22
Nodes (12): archiveWindow(), HISTORY_PAGE, SourceMode, appendCandle(), ArchiveHttpError, DataStatus, fetchArchive(), LoadError (+4 more)

### Community 61 - "params.ts"
Cohesion: 0.06
Nodes (57): AppError(), Page(), Page(), Page(), NotFound(), csp, nextConfig, MsMarkBody() (+49 more)

### Community 62 - "placeholders.test.ts"
Cohesion: 0.15
Nodes (12): algo, ALL, bad, candles, flat, FLIP, MS_PA_CODES, mutate() (+4 more)

### Community 63 - "archive.test.ts"
Cohesion: 0.24
Nodes (9): load(), klinesZip(), NOW, Served, zipOf(), fixtureJson(), fixtureText(), klinesCsvPath() (+1 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.14
Nodes (30): HTF, PaContextBody(), Row(), YN, yn, ContextFactors, countsFromGrade(), AsideSection() (+22 more)

### Community 65 - "archive.ts"
Cohesion: 0.21
Nodes (11): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSourceOptions, dayKey(), monthKey() (+3 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.16
Nodes (10): dynamic, GET(), aggregate(), SeriesByTf, sliceAt(), synthetic_hour(), synthetic_m1(), TIMEFRAME_MS (+2 more)

### Community 67 - "README.md"
Cohesion: 0.22
Nodes (4): Trading Lab, Документация, Запуск, Структура

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.16
Nodes (24): chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row, runFirstSignInImport() (+16 more)

### Community 69 - "grade.ts"
Cohesion: 0.20
Nodes (16): kindName(), Entry, gradeMarks(), Group, groupEvaluated(), groupOf(), iou(), MAJOR (+8 more)

### Community 70 - "schemas.ts"
Cohesion: 0.07
Nodes (45): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+37 more)

### Community 71 - "challenge/api.ts"
Cohesion: 0.29
Nodes (6): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post()

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.11
Nodes (17): ImportReport, DailyActivity, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+9 more)

### Community 74 - "src/normalize.ts"
Cohesion: 0.22
Nodes (12): ArchiveError, ArchiveErrorCode, ARCHIVE_KLINE_HEADER, findGaps(), Gap, num(), parseArchiveCsv(), ParseArchiveOptions (+4 more)

### Community 75 - "Находки"
Cohesion: 0.11
Nodes (22): getDeps(), getHistoryLimiter(), rateFromEnv(), HandlerDeps, clientKey(), RateDecision, RateLimiter, RateLimiterOptions (+14 more)

### Community 76 - "live.test.ts"
Cohesion: 0.07
Nodes (28): BINANCE_REST_BASE, BINANCE_WS_BASE, binanceInterval(), FetchKlinesOptions, LiveErrorCode, LiveFeed, LiveFeedError, LiveFeedOptions (+20 more)

### Community 77 - "tasks.ts"
Cohesion: 0.11
Nodes (41): cutoffOf(), floorTo(), futureProviderFor(), loadClosedBefore(), buildChallenge(), buildMs(), buildPa(), ChReq (+33 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.11
Nodes (29): metadata, plexMono, plexSans, RootLayout(), viewport, wrap(), AppShell(), BottomTabs() (+21 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.18
Nodes (10): 15. `resolveTrade` (ADR-0007, уточнения), 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 19. Расхождения с документами, 20. Спорные места и вопросы оркестратору, 4.1 Правило, 4.2 Граничные случаи (+2 more)

### Community 80 - "panels.tsx"
Cohesion: 0.22
Nodes (16): blockerKey(), DecisionPanel(), errorCopy(), PriceField(), buildAnswer(), defaultLevels(), formatRR(), parsePrice() (+8 more)

### Community 81 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 82 - "facts.ts"
Cohesion: 0.06
Nodes (51): age(), CHALLENGE_STRUCTURE, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince(), poiFor() (+43 more)

### Community 83 - "sessionStore.ts"
Cohesion: 0.22
Nodes (7): Side, atrOf(), INITIAL, Phase, SessionStore, Speed, SPEEDS

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Приоритизация функций (MoSCoW), 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта, 2. Принципы продукта, 5. Нефункциональные требования (+6 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.10
Nodes (39): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+31 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "resolve.ts"
Cohesion: 0.21
Nodes (11): AggTrade, done(), FutureProvider, Hit, Position, priceHits(), ResolutionMethod, resolveTrade() (+3 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "patterns.ts"
Cohesion: 0.15
Nodes (22): 9.1 Состав (ответ на OQ-11), 9.3 Выход, 9.4 Проверенные примеры (BTCUSDT 4h 2026-09, GS-5), 9. Свечные модели Price Action (`detectPatterns`), body(), bodyBottom(), bodyTop(), detectPatterns() (+14 more)

### Community 91 - "ref_node_crypto"
Cohesion: 0.32
Nodes (3): dynamic, GET(), safeEqual()

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "axis.ts"
Cohesion: 0.43
Nodes (6): AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T

### Community 94 - "1. Общие соглашения"
Cohesion: 0.22
Nodes (9): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+1 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "reveal.ts"
Cohesion: 0.16
Nodes (14): partMax(), ResultView(), DIR_RU, formatScenarioDate(), localizeParam(), POI_RU, resolutionNote(), revealFeedback() (+6 more)

### Community 98 - "history/route.ts"
Cohesion: 0.12
Nodes (15): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+7 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.14
Nodes (28): decimalsOf(), DIRECTION_RU, displayValue(), formatFeedbackParams(), normalizeParams(), PARAM_KINDS, ParamFormatters, ParamKind (+20 more)

### Community 100 - "hints.ts"
Cohesion: 0.21
Nodes (9): external(), selectHints(), time(), 12.4 Совместимость и стоимость пары, 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3.4 Отображение в `Mark` (общая модель `ARCHITECTURE.md` §4.2) (+1 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.12
Nodes (17): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA (+9 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.36
Nodes (6): OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightRange, MarkState

### Community 104 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 105 - "ref_vitest"
Cohesion: 0.21
Nodes (8): contractAttempt(), contractMark, runRepositoryContract(), FakeSupabase, Row, UNIQUE, seedLocal(), @supabase/supabase-js

### Community 106 - "serialize.ts"
Cohesion: 0.14
Nodes (14): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m, validateMarks() (+6 more)

### Community 107 - "ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере"
Cohesion: 0.29
Nodes (6): ADR-0005: Stateless-задания с подписанными токенами; будущее только на сервере, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы, Решение

### Community 108 - "@playwright/test"
Cohesion: 0.18
Nodes (12): DATE_LEAK, expandResult(), lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession() (+4 more)

### Community 109 - "Roadmap — Trading Lab"
Cohesion: 0.29
Nodes (6): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 111 - "fetch-fixtures.mjs"
Cohesion: 0.09
Nodes (12): downloadedAt, items, m1, rec, root, rows, scratch, table (+4 more)

### Community 112 - "pa/index.ts"
Cohesion: 0.08
Nodes (52): buildHints(), DEFAULT_TFS, HTF, meetsDifficulty(), pickChallengeScenario(), tail(), ADR-0006, computeContext() (+44 more)

### Community 114 - "SettingsScreen.tsx"
Cohesion: 0.17
Nodes (11): Page(), Page(), Page(), LearnScreen(), MODULES, ProgressScreen(), CANDLE_OPTIONS, DAILY_GOAL_MAX (+3 more)

### Community 115 - "ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel"
Cohesion: 0.33
Nodes (5): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 117 - "ProgressScreen.tsx"
Cohesion: 0.18
Nodes (29): EmptyState(), ErrorState(), LoadingRows(), ContinueBlock(), HomeWeakSpots(), DailyGoal(), ModuleAccuracy(), canTrain() (+21 more)

### Community 118 - "ChallengeSession.tsx"
Cohesion: 0.11
Nodes (24): ChallengeSessionPage(), decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), buildAttempt(), ChallengeSession(), FOCUS_SKILLS (+16 more)

### Community 119 - "criteria.ts"
Cohesion: 0.24
Nodes (17): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+9 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.35
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox(), selectTool()

### Community 121 - "sources.ts"
Cohesion: 0.08
Nodes (29): FIX, FixtureLoader, deps(), fixtures, flaky(), NOW, post(), ARCHIVE_START (+21 more)

### Community 122 - "runCheck.ts"
Cohesion: 0.15
Nodes (16): FeedbackViewProps, CheckPanelProps, CheckOutcome, CheckResult, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES (+8 more)

### Community 123 - "build.ts"
Cohesion: 0.29
Nodes (9): attempt(), block(), buildFeedback(), glyphOf(), matchedOf(), OK_BY_SKILL, okFromOutcomes(), PATTERN_NAMES_RU (+1 more)

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.16
Nodes (19): ChallengePage(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS, RCurve() (+11 more)

### Community 125 - "QA Report — финальная приёмка MVP Trading Lab (M8)"
Cohesion: 0.25
Nodes (7): 1. Сводка, 2. Таблица AC, 3. Ключевые инварианты, 4. Производительность (headless Chromium, software rendering, CPU throttling 4x), 6. Бэклог оркестратора, 7. Не удалось проверить, QA Report — финальная приёмка MVP Trading Lab (M8)

### Community 126 - "useRepository"
Cohesion: 0.20
Nodes (13): DayStat, prevDay(), softStreak(), done, AsyncState, DailyProgress, useAttempts(), useDailyProgress() (+5 more)

### Community 127 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.25
Nodes (8): 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.5 Матчинг (решение: DP по времени вместо венгерского), 12.6 Классификация после матчинга, 12.7 Счёт, вердикт, навыки, 12.8 Пример AC-07 на реальных данных (GS-1), 12. `gradeMarks` — сравнение разметки

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "resolve.test.ts"
Cohesion: 0.22
Nodes (6): agg, c1, c15, T0, T1, loadAggTrades()

### Community 130 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 131 - "storage/index.ts"
Cohesion: 0.11
Nodes (29): dynamic, GET(), dynamic, Page(), @supabase/ssr@^0.12.7, AuthContext, AuthRepositoryProvider(), AuthState (+21 more)

### Community 132 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 134 - "TimeIndex"
Cohesion: 0.09
Nodes (14): DrawingPrimitive, snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0, TimeIndex (+6 more)

### Community 135 - "Команда агентов — Trading Lab"
Cohesion: 0.29
Nodes (6): 1. Сводка, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Команда агентов — Trading Lab, Правило graphify (включается в каждый промпт агента, исследующего код)

### Community 136 - "ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling"
Cohesion: 0.33
Nodes (5): ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 137 - "controller.ts"
Cohesion: 0.15
Nodes (19): PointerKind, constrainAnchors(), createMark(), DrawKind, FULL_WIDTH_KINDS, isDrawKind(), MarkExtra, RAY_RIGHT_KINDS (+11 more)

### Community 138 - "ADR-0007: Правила исхода сделки Challenge (drill-down)"
Cohesion: 0.40
Nodes (5): ADR-0007: Правила исхода сделки Challenge (drill-down), Контекст, Открытые вопросы (закрыты: `docs/specs/ALGORITHMS.md`), Последствия, Рассмотренные альтернативы

### Community 139 - "3. Область продукта"
Cohesion: 0.40
Nodes (5): 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта

### Community 140 - "16. Навыки и прогресс"
Cohesion: 0.50
Nodes (4): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс

### Community 141 - "ADR-0004: История для заданий — сервер читает архив data.binance.vision"
Cohesion: 0.33
Nodes (5): ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 142 - "ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt"
Cohesion: 0.33
Nodes (5): ADR-0006: Синхронизация таймфреймов — нативные ТФ, инвариант агрегации, sliceAt, Контекст, Последствия, Рассмотренные альтернативы, Решение

### Community 143 - "ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7"
Cohesion: 0.33
Nodes (5): ADR-0008: Local-first хранилище за интерфейсом Repository; Supabase в M7, Контекст, Открытые вопросы, Последствия, Рассмотренные альтернативы

### Community 144 - "sessionStore.test.ts"
Cohesion: 0.50
Nodes (4): candle(), series, task, Решение

### Community 146 - "5. Результат проверки и разбор"
Cohesion: 0.50
Nodes (4): 5.1 `GradeResult`, 5.2 `Feedback` (6 частей, FR-FB-02), 5.3 Коды ошибок, 5. Результат проверки и разбор

### Community 147 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 987 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `serialize.ts` to `Repository`, `terminal.helpers.ts`, `TimeIndex`, `controller.ts`, `UtcMs`, `Mark`, `hit.ts`, `PaFindBody.tsx`, `Candle`, `hit.ts`, `handlers.test.ts`, `rules.ts`, `levels.ts`, `TimeIndex`, `TradingChart`, `src/types.ts`, `params.ts`, `placeholders.test.ts`, `MarkSession.tsx`, `SupabaseRepository.ts`, `grade.ts`, `tasks.ts`, `facts.ts`, `TaskSession.tsx`, `1. Общие соглашения`, `hints.ts`, `DrawingPrimitive.ts`, `ref_vitest`, `pa/index.ts`, `ChallengeSession.tsx`, `runCheck.ts`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10365853658536585 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `src/types.ts` to `market-structure.ts`, `resolve.test.ts`, `TimeIndex`, `controller.ts`, `UtcMs`, `sessionStore.test.ts`, `Candle`, `handlers.test.ts`, `rules.ts`, `TradingChart.tsx`, `levels.ts`, `TimeIndex`, `TradingChart`, `src/types.ts`, `useMarketData.ts`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `src/normalize.ts`, `live.test.ts`, `tasks.ts`, `facts.ts`, `TaskSession.tsx`, `resolve.ts`, `patterns.ts`, `6. Внешние API Binance`, `pa/index.ts`, `criteria.ts`, `sources.ts`, `runCheck.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._