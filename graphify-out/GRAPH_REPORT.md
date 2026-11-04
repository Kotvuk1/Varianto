# Graph Report - Varianto  (2026-11-04)

## Corpus Check
- 394 files · ~210,443 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .csv 26, (none) 4, .example 1)

## Summary
- 2761 nodes · 7556 edges · 131 communities (124 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 211 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3dc6f171`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- market-structure.ts
- Repository
- terminal.helpers.ts
- API Contracts — Trading Lab
- live.test.ts
- with
- Architecture — Trading Lab
- 2. Карточки
- skills.ts
- market-data/package.json
- UtcMs
- TerminalScreen.tsx
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
- adapters.ts
- Candle
- features/feedback/index.ts
- fetch-fixtures.mjs
- grade.test.ts
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
- AppShell.tsx
- rules.ts
- build.ts
- TradingChart.tsx
- pa/index.ts
- TimeIndex
- TradingChart
- marks.ts
- useMarketData.ts
- params.ts
- tasks.ts
- ArchiveSource
- MarkSession.tsx
- archive.ts
- core/src/index.ts
- README.md
- SupabaseRepository.ts
- placeholders.test.ts
- schemas.ts
- AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)
- 13. Генерация заданий
- Settings
- normalize.ts
- Находки
- live.test.ts
- Candle
- screens.test.tsx
- ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`
- 4. Обязательные наборы тестов
- handlers.test.ts
- facts.ts
- smc/normalize.test.ts
- PRD — Trading Lab
- TaskSession.tsx
- 11. Контекст для PA «Контекст»
- 14. Challenge: эталон, оценка качества, WAIT, лимиты
- UtcMs
- 5. Тренд, BOS и CHoCH
- patterns.ts
- 3. Внешняя и внутренняя структура
- package.json
- 3. Внутренние HTTP API
- 1. Общие соглашения
- 7. Order Block
- web/AGENTS.md
- panels.tsx
- history/route.ts
- src/feedback/index.ts
- 12. `gradeMarks` — сравнение разметки
- sessionStore.ts
- Стратегия тестирования — Trading Lab
- DrawingPrimitive.ts
- 6. Внешние API Binance
- ref_vitest
- serialize.ts
- 5. Потоки данных
- @playwright/test
- PaContextBody.tsx
- 6. Liquidity sweep
- Query
- scripts
- dependencies
- criteria.ts
- ms.helpers.ts
- SupabaseRepository
- data/streak.test.ts
- ProgressScreen.tsx
- SettingsScreen.tsx
- fixtures
- 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)
- 4. Функциональные требования
- storage/index.ts
- 7. User Flows
- Подключение Supabase и Vercel (с телефона)
- scripts
- Mark
- 8. FVG (Fair Value Gap)
- 1. Обзор и цель продукта
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `Candle` - 90 edges
2. `Mark` - 83 edges
3. `UtcMs` - 79 edges
4. `react` - 71 edges
5. `TaskTimeframe` - 50 edges
6. `analyzeStructure()` - 45 edges
7. `cn()` - 44 edges
8. `Button()` - 36 edges
9. `TradingChart()` - 33 edges
10. `LocalRepository` - 33 edges

## Surprising Connections (you probably didn't know these)
- `P2` --references--> `GradeLegend()`  [INFERRED]
  docs/design/AUDIT.md → apps/web/src/features/feedback/GradeLegend.tsx
- `1. Принципы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts
- `6. Открытые вопросы` --references--> `localDay()`  [INFERRED]
  docs/DATABASE_SCHEMA.md → apps/web/src/i18n/format.ts
- `4.2 Типы ответа (`Answer`)` --references--> `Answer`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/server/schemas.ts
- `7. Интерфейс `Repository` (`ARCHITECTURE.md` §5.4)` --references--> `Repository`  [INFERRED]
  docs/API_CONTRACTS.md → apps/web/src/storage/types.ts

## Import Cycles
- 2-file cycle: `packages/core/src/candles/aggregate.ts -> packages/core/src/index.ts -> packages/core/src/candles/aggregate.ts`

## Communities (131 total, 7 thin omitted)

### Community 0 - "market-structure.ts"
Cohesion: 0.11
Nodes (40): mulberry32(), randInt(), atrAt(), buildMsQuestion(), checkMsWindow(), CORE_CONCEPTS, drawCandidate(), generateMsQuestion() (+32 more)

### Community 1 - "Repository"
Cohesion: 0.07
Nodes (19): Repository, graphify, Зона владения, Навыки, Обязательно прочитай перед работой, Отчёт, Правила, graphify (+11 more)

### Community 2 - "terminal.helpers.ts"
Cohesion: 0.17
Nodes (23): Box, candlePoint(), chartCandles(), coreLevels(), coreMarks(), drawAlgoMark(), drawTwoPoint(), findVisibleBos() (+15 more)

### Community 3 - "API Contracts — Trading Lab"
Cohesion: 0.13
Nodes (14): 1.1 Формат ошибки, 1.2 Заголовки кэша, 1. Общие соглашения, 2.2 Расширения контрактов (предложение — фиксируются при реализации в `@tl/core`), 2. Типы `@tl/core`, используемые в контрактах, 4.1 Шкала задания, 4.2 Типы ответа (`Answer`), 4. Шкала времени заданий и ответы (+6 more)

### Community 4 - "live.test.ts"
Cohesion: 0.12
Nodes (16): Frontend Developer, ADR-0003: Живые данные грузит браузер напрямую (REST + WS), fallback — REST-polling, Контекст, Последствия, Рассмотренные альтернативы, Решение, LiveFeed, archiveH1 (+8 more)

### Community 5 - "with"
Cohesion: 0.08
Nodes (26): runs-on, steps, GITHUB_TOKEN, jobs, check, secrets-scan, name, on (+18 more)

### Community 6 - "Architecture — Trading Lab"
Cohesion: 0.14
Nodes (14): 10. Развёртывание, 11. Риски, 1. Ключевые ограничения, определяющие архитектуру, 2. Обзор, 3. Репозиторий (pnpm monorepo), 4.1 Синхронизация таймфреймов, 4.2 Разметка (общая модель для пользователя и алгоритма), 4.3 Алгоритмы (детерминированные, версионируемые) (+6 more)

### Community 7 - "2. Карточки"
Cohesion: 0.12
Nodes (16): 1. Сводка, 2. Карточки, 3. Правила оркестрации, 4. Формат отчёта агента (до 15 строк), 5. Шаблон задания агенту, Backend Developer, Chart Developer, DevOps/Security Engineer (+8 more)

### Community 8 - "skills.ts"
Cohesion: 0.25
Nodes (13): accuracyOf(), applyOutcome(), FOCUS_SIZE, isEnoughData(), isOutcomeOk(), MIN_WEIGHT, OK_THRESHOLD, pickFocus() (+5 more)

### Community 9 - "market-data/package.json"
Cohesion: 0.11
Nodes (20): dependencies, fflate@^0.8.3, @tl/core@workspace:*, devDependencies, vitest@^4.1.12, @vitest/coverage-v8@^4.1.12, exports, ./archive (+12 more)

### Community 10 - "UtcMs"
Cohesion: 0.13
Nodes (12): DailyActivityRow, SkillStatRow, TerminalMarksRow, TradingLabDB, defaultSettings(), LocalRepository, LocalSnapshot, mark (+4 more)

### Community 11 - "TerminalScreen.tsx"
Cohesion: 0.09
Nodes (43): TerminalPage(), validateMarks(), FeedbackView(), renderBlock(), CheckPanel(), subscribe(), useDesktop(), normalizeSymbolInput() (+35 more)

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
Cohesion: 0.06
Nodes (52): Page(), csp, nextConfig, Status, LearnScreen(), MODULES, SessionLayoutProps, SHEET_PAD (+44 more)

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
Cohesion: 0.67
Nodes (4): 10.1 Алгоритм, 10.2 Эталон для «Проведи уровень», 10. `findLevels` — уровни поддержки/сопротивления, touches()

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
Cohesion: 0.07
Nodes (36): distToRectEdge(), distToSegment(), Hit, hitTest(), inside(), partScore(), geos(), synthetic_proj (+28 more)

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
Cohesion: 0.05
Nodes (32): ADR-0001: Next.js 16 + TypeScript strict, pnpm monorepo, Vercel, Контекст, Последствия, Рассмотренные альтернативы, Решение, ADR-0004: История для заданий — сервер читает архив data.binance.vision, Контекст, Последствия (+24 more)

### Community 29 - "adapters.ts"
Cohesion: 0.17
Nodes (20): MsMarkBody(), highlightMarks(), MsQuestionBody(), msMarkAnswer(), msQuestionAnswer(), AnswerList(), msToolGroups(), formatDateTime() (+12 more)

### Community 30 - "Candle"
Cohesion: 0.19
Nodes (20): AnswerInput, ChallengeAnswerBody, SessionState, ChallengeDetailDto, ChallengeGradeResult, ChallengeOutcomeDto, ChallengePayload, ChallengeTaskEnvelope (+12 more)

### Community 31 - "features/feedback/index.ts"
Cohesion: 0.27
Nodes (11): defaultFmt, FeedbackViewProps, Section(), GlyphKind, GradeGlyph(), LABEL, GradeLegend(), GradeLegendToggle() (+3 more)

### Community 32 - "fetch-fixtures.mjs"
Cohesion: 0.07
Nodes (29): dynamic, GET(), safeEqual(), ChallengeAttemptStat, challengeStats(), dailyProgress(), DayMap, DayRecord (+21 more)

### Community 33 - "grade.test.ts"
Cohesion: 0.08
Nodes (25): c4h, FIX, at(), candles, check(), Gold, GoldEvent, GoldSwing (+17 more)

### Community 34 - "token.ts"
Cohesion: 0.11
Nodes (28): ApiError, ApiErrorCode, ConfigError, ValidationIssue, nextTask(), toSeed(), b64(), derive() (+20 more)

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
Cohesion: 0.12
Nodes (41): 2.1 Из `ARCHITECTURE.md` §4 (дословно), golden/ - эталонные участки SMC (ALGORITHMS §18), PatternCheck, allSwingsMap, AnalyzeOptions, analyzeStructure(), EMPTY_LAYER, scopeOrder() (+33 more)

### Community 45 - "handlers.test.ts"
Cohesion: 0.15
Nodes (13): CH, challengeDeps(), grade(), Json, loader, mkDeps(), MS_MARK, MS_Q (+5 more)

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
Cohesion: 0.11
Nodes (24): devDependencies, fake-indexeddb@^6.2.7, jsdom@^26.0.0, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @testing-library/react@^16.0.0, @testing-library/user-event@^14.6.8, @types/react@^19.0.0 (+16 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.23
Nodes (13): metadata, plexMono, plexSans, RootLayout(), viewport, AppShell(), BottomTabs(), DesktopTabs() (+5 more)

### Community 53 - "rules.ts"
Cohesion: 0.13
Nodes (33): PointerKind, SWING_SIDE, Built, Gesture, Pending, PointerInput, PREVIEW_ID, normalizeMark() (+25 more)

### Community 54 - "build.ts"
Cohesion: 0.23
Nodes (19): CheckPanelProps, CheckResult, Core, 19. Расхождения с документами, ChallengeGrade, OK_BY_SKILL, FeedbackBlock, FeedbackInput (+11 more)

### Community 55 - "TradingChart.tsx"
Cohesion: 0.20
Nodes (13): OPEN_CANDLE_ALPHA, pricePrecision(), T0, tokens, toCandleData(), toVolumeData(), VOLUME_ALPHA, ChartTokens (+5 more)

### Community 56 - "pa/index.ts"
Cohesion: 0.08
Nodes (54): 12. Открытые вопросы, 18.2 Участки, 9.1 Состав (ответ на OQ-11), computeContext(), CONTEXT_STRUCTURE, ContextAnswer, ContextEvidence, ContextFactorAnswer (+46 more)

### Community 57 - "TimeIndex"
Cohesion: 0.11
Nodes (26): lightweight-charts@~5.2.1, lwcProjection(), snapAnchor(), SnapOptions, snapPriceToCandle(), synthetic_candles, T0, T0 (+18 more)

### Community 58 - "TradingChart"
Cohesion: 0.12
Nodes (16): constrainAnchors(), createMark(), DrawKind, DrawingController, bosMark, breakIdx, drag(), index (+8 more)

### Community 59 - "marks.ts"
Cohesion: 0.12
Nodes (23): algoOf(), ALL, candles, findAlgo(), P, r, window, allLayerSwings() (+15 more)

### Community 60 - "useMarketData.ts"
Cohesion: 0.12
Nodes (22): ARCHIVE_MIN_AGE_MS, ARCHIVE_SYMBOLS, archiveAllowed(), archivePageSize(), archiveWindow(), HISTORY_PAGE, PRESET_SYMBOLS, resolveSourceMode() (+14 more)

### Community 61 - "params.ts"
Cohesion: 0.12
Nodes (32): Page(), Page(), MsSetup(), PaSetup(), CommonFields(), SHORT, common(), Get (+24 more)

### Community 62 - "tasks.ts"
Cohesion: 0.10
Nodes (39): cutoffOf(), futureProviderFor(), buildChallenge(), buildMs(), buildPa(), ChReq, gradeChallengeTask(), gradeMsMark() (+31 more)

### Community 64 - "MarkSession.tsx"
Cohesion: 0.13
Nodes (30): decimalsForTick(), makePriceFormatter(), TICK_TABLE, tickSizeFor(), fmtOf(), countsFromGrade(), statesFromGrade(), AsideSection() (+22 more)

### Community 65 - "archive.ts"
Cohesion: 0.21
Nodes (11): AGG_TRADES_HEADER, AggTrade, ARCHIVE_BASE_URL, ArchiveFetch, ArchiveFileSpec, ArchiveSourceOptions, dayKey(), monthKey() (+3 more)

### Community 66 - "core/src/index.ts"
Cohesion: 0.16
Nodes (10): dynamic, GET(), fmt, t, aggregate(), SeriesByTf, sliceAt(), synthetic_hour() (+2 more)

### Community 67 - "README.md"
Cohesion: 0.12
Nodes (10): MVP, Roadmap — Trading Lab, v1.1 — Fibonacci Playground и Premium/Discount, v1.2 — Elliott Wave Lab, v2, Правила корректировки, Trading Lab, Документация (+2 more)

### Community 68 - "SupabaseRepository.ts"
Cohesion: 0.16
Nodes (27): @supabase/supabase-js@^2.118.0, chunks(), IMPORTED_USER_META, ImportOutcome, importSnapshot(), must(), recomputeDerived(), Row (+19 more)

### Community 69 - "placeholders.test.ts"
Cohesion: 0.07
Nodes (37): CheckOutcome, CheckState, CONCEPT_OF, conceptsFor(), RANGE_TAIL_CANDLES, runCheck(), algoMarks, candles (+29 more)

### Community 70 - "schemas.ts"
Cohesion: 0.09
Nodes (22): zod@^4.0.0, AnchorSchema, AnswerSchema, BUSINESS_CODES, ChallengeAnswer, difficulty, GradeRequest, MARK_KINDS (+14 more)

### Community 71 - "AUDIT — финальный дизайн-аудит Trading Lab (M8-UI)"
Cohesion: 0.20
Nodes (9): 1. Итог, 2. Находки, 3. Impeccable detect (по URL production-сборки), 4. Что проверено и ограничения, 5. Порядок исправления, AUDIT — финальный дизайн-аудит Trading Lab (M8-UI), P1, P2 (+1 more)

### Community 72 - "13. Генерация заданий"
Cohesion: 0.33
Nodes (6): 13.1 Общие правила, 13.2 Market Structure «Разметка» (поправка v1.1, `ALGO_VERSION 1.1.0`), 13.3 Market Structure «Вопрос», 13.4 Price Action, 13.5 Challenge, 13. Генерация заданий

### Community 73 - "Settings"
Cohesion: 0.11
Nodes (17): ImportReport, 1. Принципы, 2. Локальная схема: IndexedDB (Dexie), 3.1 RLS, 3. Схема Supabase Postgres (M7), 4.1 Порядок, 4.2 Правила по таблицам (идемпотентность по `id`, конфликты по `updated_at`), 4.3 Пересчёт производных данных (+9 more)

### Community 74 - "normalize.ts"
Cohesion: 0.16
Nodes (18): load(), klinesZip(), NOW, Served, zipOf(), ARCHIVE_KLINE_HEADER, Gap, num() (+10 more)

### Community 75 - "Находки"
Cohesion: 0.25
Nodes (8): 2. MEDIUM: обход rate limit через X-Forwarded-For (исправлено частично), 4. LOW: /api/cron/keepalive (открыто), 5. LOW: Supabase (повторное чтение 0001_init.sql), 6. LOW: заголовки/CSP (фактически curl на production-сборке), 7. LOW: токены (src/server/token.ts) - корректно, 8. Утечка даты Challenge, 9. Ввод, лимиты, XSS, хранилища, Находки

### Community 76 - "live.test.ts"
Cohesion: 0.09
Nodes (15): BINANCE_REST_BASE, BINANCE_WS_BASE, FetchKlinesOptions, LiveErrorCode, LiveFeedOptions, LiveFetch, MAX_KLINES_LIMIT, POLL_INTERVAL_MS (+7 more)

### Community 77 - "Candle"
Cohesion: 0.10
Nodes (24): ARCHIVE_START, ArchiveLoader, ArchiveLoaderOptions, CandleLoader, CHALLENGE_FUTURE_MS, ChallengeZone, Chunk, countClosedBefore() (+16 more)

### Community 78 - "screens.test.tsx"
Cohesion: 0.18
Nodes (16): wrap(), Providers(), APPEARANCE_STORAGE_KEY, themeInitScript, applyToDom(), CandleStyle, fromStoredCandle(), Probe() (+8 more)

### Community 79 - "ALGORITHMS — спецификация детерминированных алгоритмов `@tl/core`"
Cohesion: 0.15
Nodes (12): 16.1 Навыки, 16.2 Обновление точности, 16.3 Адаптивная подборка, 16. Навыки и прогресс, 18.1 Формат и процесс, 18.3 Что ещё размечается после утверждения (M4/M5), 18. Golden-тесты, 20. Спорные места и вопросы оркестратору (+4 more)

### Community 80 - "4. Обязательные наборы тестов"
Cohesion: 0.25
Nodes (8): 4.1 Инвариант агрегации таймфреймов, 4.2 `sliceAt(series, T)`, 4.3 Нормализация (`market-data`), 4.4 Golden-тесты SMC/PA, 4.5 `resolveTrade`, 4.6 Интеграционные тесты API, 4.7 Прочие unit-тесты, 4. Обязательные наборы тестов

### Community 81 - "handlers.test.ts"
Cohesion: 0.09
Nodes (34): dynamic, maxDuration, POST(), runtime, dynamic, maxDuration, POST(), runtime (+26 more)

### Community 82 - "facts.ts"
Cohesion: 0.06
Nodes (59): age(), CHALLENGE_STRUCTURE, ChallengeFacts, computeChallengeFacts(), FactsInput, HTF, intersects(), lastEventSince() (+51 more)

### Community 83 - "smc/normalize.test.ts"
Cohesion: 0.33
Nodes (4): cs, index, synthetic_rows, T0

### Community 84 - "PRD — Trading Lab"
Cohesion: 0.13
Nodes (15): 10. Приоритизация функций (MoSCoW), 11. План MVP, 2. Принципы продукта, 3.1 В MVP, 3.2 Вне MVP, 3.3 Требует исследования, 3.4 Технические риски, 3. Область продукта (+7 more)

### Community 85 - "TaskSession.tsx"
Cohesion: 0.15
Nodes (24): AnswerSessionProps, createTaskApi(), kindOf(), post(), TaskApi, buildAttempt(), BuildAttemptInput, saveTaskAttempt() (+16 more)

### Community 86 - "11. Контекст для PA «Контекст»"
Cohesion: 0.29
Nodes (7): 11.1 Формат ответа (ответ на OQ-16), 11.2 Задание, 11.3 Факторы (детерминированно, для бычьей модели; медвежья — зеркально), 11.4 Значимость (решение), 11.5 Оценка, 11.6 Генерация, 11. Контекст для PA «Контекст»

### Community 87 - "14. Challenge: эталон, оценка качества, WAIT, лимиты"
Cohesion: 0.29
Nodes (7): 14.1 Факты на момент T (`ChallengeFacts`), 14.2 Эталонная сторона `refSide`, 14.3 Оценка качества 0–100 (ответ на OQ-08), независимо от исхода, 14.4 Правильность, вердикт, лимиты, 14.5 Предикаты причин (`ReasonCode`, состав без изменений), 14.6 Подсказки (easy), 14. Challenge: эталон, оценка качества, WAIT, лимиты

### Community 88 - "UtcMs"
Cohesion: 0.08
Nodes (31): FIX, FixtureLoader, RawAggTrade, Draft, Решение, ChallengeSource, AggTrade, done() (+23 more)

### Community 89 - "5. Тренд, BOS и CHoCH"
Cohesion: 0.33
Nodes (6): 5.1 Общие правила, 5.2 Внешний слой — машина состояний с защищёнными уровнями, 5.3 Внутренний слой — «последний подтверждённый swing», 5.4 Что происходит после CHoCH, 5.5 Граничные случаи (проверены на реальных свечах), 5. Тренд, BOS и CHoCH

### Community 90 - "patterns.ts"
Cohesion: 0.15
Nodes (21): c4h, found, body(), bodyBottom(), bodyTop(), detectPatterns(), engulfing(), isBear() (+13 more)

### Community 91 - "3. Внешняя и внутренняя структура"
Cohesion: 0.50
Nodes (4): 3.1 Правило (решение), 3.2 Дедупликация, 3.3 Сигнатура `analyzeStructure`, 3. Внешняя и внутренняя структура

### Community 92 - "package.json"
Cohesion: 0.12
Nodes (21): devDependencies, eslint@^9.39.0, eslint-config-next@^16.0.0, @eslint/js@^9.39.0, @playwright/test@1.63.0, prettier@^3.6.0, @types/node@^22.0.0, typescript@~5.9.3 (+13 more)

### Community 93 - "3. Внутренние HTTP API"
Cohesion: 0.33
Nodes (6): 3.1 `GET /api/health`, 3.2 `GET /api/history`, 3.3 `POST /api/tasks/{module}/next`, 3.4 `POST /api/tasks/{module}/grade`, 3.5 Токен задания (`taskToken`), 3. Внутренние HTTP API

### Community 94 - "1. Общие соглашения"
Cohesion: 0.17
Nodes (12): c(), 1.1 Входные свечи, 1.2 Термины свечи, 1.3 ATR, 1.4 Детерминизм и числа, 1.5 ALGO_VERSION, 1.6 Параметры по сложностям (сводка), 1. Общие соглашения (+4 more)

### Community 95 - "7. Order Block"
Cohesion: 0.50
Nodes (4): 7.1 Определение (решение, ICT: «последняя противоположная свеча перед импульсом, сломавшим структуру»), 7.2 Статус (после свечи события `k`, по закрытым свечам), 7.3 Сигнатура, 7. Order Block

### Community 97 - "panels.tsx"
Cohesion: 0.08
Nodes (44): ChallengeSessionPage(), buildAttempt(), AxisTick, axisTicks(), relativeDuration(), relativeLabel(), STEPS, T (+36 more)

### Community 98 - "history/route.ts"
Cohesion: 0.11
Nodes (16): ARCHIVE_START_MS, dynamic, errorResponse(), GET(), ISSUE_CODES, querySchema, runtime, SYMBOLS (+8 more)

### Community 99 - "src/feedback/index.ts"
Cohesion: 0.06
Nodes (60): DIR, formatParam(), formatWhen(), KIND_KEYS, PCT_KEYS, placeOf(), PRICE_KEYS, R_KEYS (+52 more)

### Community 100 - "12. `gradeMarks` — сравнение разметки"
Cohesion: 0.15
Nodes (13): external(), selectHints(), time(), 12.1 Сигнатура (расширение `API_CONTRACTS.md`), 12.2 Ключевая свеча метки, 12.3 Группы сопоставления, 12.4 Совместимость и стоимость пары, 12.5 Матчинг (решение: DP по времени вместо венгерского) (+5 more)

### Community 101 - "sessionStore.ts"
Cohesion: 0.06
Nodes (29): ChallengeApiError, ChallengeErrorKind, fetchNext(), gradeChallenge(), kindOf(), post(), buildAnswer(), defaultLevels() (+21 more)

### Community 102 - "Стратегия тестирования — Trading Lab"
Cohesion: 0.20
Nodes (10): 10. Производительность, 1. Принципы, 2. Пирамида, 3. Фикстуры, 5. E2E (Playwright), 6. Визуальная проверка и доступность, 7. Критерии «готово» для вехи, 8. CI (GitHub Actions) (+2 more)

### Community 103 - "DrawingPrimitive.ts"
Cohesion: 0.17
Nodes (7): DrawingPrimitive, OpenCandleInfo, PrimitiveState, ZONE_KINDS, dimSpans(), HighlightRange, MarkState

### Community 104 - "6. Внешние API Binance"
Cohesion: 0.40
Nodes (5): status(), 6.1 REST: `GET https://fapi.binance.com/fapi/v1/klines` (браузер), 6.2 WebSocket: kline stream (браузер), 6.3 Архив data.binance.vision (сервер), 6. Внешние API Binance

### Community 105 - "ref_vitest"
Cohesion: 0.30
Nodes (4): contractAttempt(), contractMark, runRepositoryContract(), seedLocal()

### Community 106 - "serialize.ts"
Cohesion: 0.28
Nodes (7): anchor, KINDS, MARKS_FORMAT_VERSION, markSchema, parseMarks(), serializeMarks(), m

### Community 107 - "5. Потоки данных"
Cohesion: 0.40
Nodes (5): 5.1 Живые данные (терминал), 5.2 История для заданий (сервер), 5.3 Задания (stateless, без БД до M7), 5.4 Хранение (Repository), 5. Потоки данных

### Community 108 - "@playwright/test"
Cohesion: 0.19
Nodes (11): DATE_LEAK, lastCandleTime(), num(), openReasons(), projectPoint(), SESSION_URL(), startSession(), submitDecision() (+3 more)

### Community 109 - "PaContextBody.tsx"
Cohesion: 0.11
Nodes (34): Page(), Page(), MsSessionScreen(), HTF, PaContextBody(), Row(), YN, yn (+26 more)

### Community 110 - "6. Liquidity sweep"
Cohesion: 0.40
Nodes (5): 6.1 Определение (решение), 6.2 Несколько уровней за одну свечу, 6.3 Граничные случаи, 6.4 Сигнатура, 6. Liquidity sweep

### Community 113 - "Query"
Cohesion: 0.09
Nodes (4): FakeSupabase, Query, Row, UNIQUE

### Community 116 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check:tokens, dev, format, lint, sync:tokens, test (+2 more)

### Community 118 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, dexie@^4.0.0, lucide-react@^1.66.0, next@^16.0.0, react@^19.0.0, react-dom@^19.0.0, @supabase/ssr@^0.12.7, @tl/core@workspace:* (+7 more)

### Community 119 - "criteria.ts"
Cohesion: 0.36
Nodes (13): body(), bottom(), dojiItems(), engulfItems(), finish(), insideItems(), Item, patternCheck() (+5 more)

### Community 120 - "ms.helpers.ts"
Cohesion: 0.35
Nodes (8): checkAndSeeResult(), nextThenHomeShowsDone(), openSession(), shot(), tapCandle(), solveOne(), chartBox(), selectTool()

### Community 121 - "SupabaseRepository"
Cohesion: 0.32
Nodes (3): iso(), must(), SupabaseRepository

### Community 122 - "data/streak.test.ts"
Cohesion: 0.43
Nodes (4): DayStat, prevDay(), softStreak(), done

### Community 124 - "ProgressScreen.tsx"
Cohesion: 0.06
Nodes (75): ChallengePage(), Page(), ChallengeHome(), DIFFS, recentLine(), StartTf, Stats(), TF_OPTIONS (+67 more)

### Community 126 - "SettingsScreen.tsx"
Cohesion: 0.16
Nodes (17): Page(), AsyncState, useAsync(), DailyProgress, useAttempts(), useDailyProgress(), useSkillStats(), useWeakSkills() (+9 more)

### Community 128 - "fixtures"
Cohesion: 0.50
Nodes (3): fixtures, recorded/ - записанные форматы API (fapi/fstream недоступны из облака, 451), Архивные CSV

### Community 129 - "17. Шаблоны разбора (источник `src/i18n/ru/feedback`)"
Cohesion: 0.40
Nodes (5): 17.1 Структура и ключи, 17.2 Верность и общие принципы, 17.3 Что понято верно (`OkCode`; новые помечены *), 17.4 Ошибки (части 3–6), 17. Шаблоны разбора (источник `src/i18n/ru/feedback`)

### Community 130 - "4. Функциональные требования"
Cohesion: 0.17
Nodes (12): 4.10 Авторизация (FR-AUTH), 4.11 Интерфейс (FR-UI), 4.1 Данные (FR-DATA), 4.2 График (FR-CHART), 4.3 Слой разметки (FR-DRAW), 4.4 Market Structure Analyzer (FR-MS), 4.5 Trading Challenge (FR-TC), 4.6 Price Action Trainer (FR-PA) (+4 more)

### Community 131 - "storage/index.ts"
Cohesion: 0.13
Nodes (25): dynamic, GET(), dynamic, Page(), AuthContext, AuthRepositoryProvider(), AuthState, DISABLED (+17 more)

### Community 132 - "7. User Flows"
Cohesion: 0.25
Nodes (8): 7.1 Первый вход, 7.2 Сессия Market Structure (режим «Разметка»), 7.3 Trading Challenge: от выбора до разбора, 7.4 Price Action «Контекст», 7.5 Терминал с проверкой разметки, 7.6 Просмотр «Слабых мест», 7.7 Продолжение на другом устройстве, 7. User Flows

### Community 133 - "Подключение Supabase и Vercel (с телефона)"
Cohesion: 0.18
Nodes (10): 1. Проект Supabase, 2. Применить миграцию (создать таблицы), 3. Ключи Supabase, 4. Вход через Google, 5. Redirect URL в Supabase, 6. Vercel, 7. Проверка на телефоне, Если что-то не работает (+2 more)

### Community 135 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 137 - "Mark"
Cohesion: 0.12
Nodes (27): FULL_WIDTH_KINDS, isDrawKind(), isScopedKind(), MarkExtra, RAY_RIGHT_KINDS, TOOL_DEFS, ToolDef, ToolId (+19 more)

### Community 143 - "8. FVG (Fair Value Gap)"
Cohesion: 0.50
Nodes (4): 8.1 Определение, 8.2 Заполнение, 8.3 Сигнатура, 8. FVG (Fair Value Gap)

### Community 144 - "1. Обзор и цель продукта"
Cohesion: 0.40
Nodes (5): 1.1 Что это, 1.2 Цель, 1.3 Целевой пользователь, 1.4 Модули, 1. Обзор и цель продукта

## Knowledge Gaps
- **13 isolated node(s):** `ADR-0008`, `ADR-0007`, `ADR-0006`, `ADR-0005`, `ADR-0005` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 986 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Mark` connect `Mark` to `terminal.helpers.ts`, `UtcMs`, `TerminalScreen.tsx`, `hit.ts`, `adapters.ts`, `Candle`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `build.ts`, `pa/index.ts`, `TimeIndex`, `TradingChart`, `marks.ts`, `params.ts`, `tasks.ts`, `MarkSession.tsx`, `core/src/index.ts`, `SupabaseRepository.ts`, `placeholders.test.ts`, `facts.ts`, `smc/normalize.test.ts`, `TaskSession.tsx`, `1. Общие соглашения`, `panels.tsx`, `12. `gradeMarks` — сравнение разметки`, `DrawingPrimitive.ts`, `ref_vitest`, `serialize.ts`, `PaContextBody.tsx`, `SupabaseRepository`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Mark` (e.g. with `Контекст` and `Последствия`) actually correct?**
  _`Mark` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0008`, `ADR-0007`, `ADR-0006` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `market-structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Why does `Candle` connect `UtcMs` to `market-structure.ts`, `live.test.ts`, `Mark`, `Candle`, `grade.test.ts`, `src/types.ts`, `handlers.test.ts`, `rules.ts`, `TradingChart.tsx`, `pa/index.ts`, `TimeIndex`, `TradingChart`, `useMarketData.ts`, `params.ts`, `tasks.ts`, `ArchiveSource`, `MarkSession.tsx`, `archive.ts`, `core/src/index.ts`, `placeholders.test.ts`, `normalize.ts`, `live.test.ts`, `Candle`, `facts.ts`, `smc/normalize.test.ts`, `TaskSession.tsx`, `patterns.ts`, `sessionStore.ts`, `6. Внешние API Binance`, `criteria.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `UtcMs` (e.g. with `1. Общие соглашения` and `4.1 Шкала задания`) actually correct?**
  _`UtcMs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Repository` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._