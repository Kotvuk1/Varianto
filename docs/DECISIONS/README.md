# Architecture Decision Records — Trading Lab

Формат: MADR-lite. Разделы: Статус, Контекст, Решение, Рассмотренные альтернативы, Последствия (при необходимости — Открытые вопросы).
Статусы: `предложено` -> `принято` -> `заменено ADR-NNNN` / `отклонено`. Принятый ADR не правится по существу: решение меняется новым ADR, который ссылается на старый.
Нумерация сквозная, имя файла `NNNN-kebab-case.md`. Главный документ — `docs/ARCHITECTURE.md`; ADR обосновывают его решения.

| ADR | Решение | Статус |
|---|---|---|
| [0001](0001-nextjs-typescript-monorepo.md) | Next.js 16 + TypeScript strict, pnpm monorepo, Vercel | принято |
| [0002](0002-lightweight-charts-custom-drawing-layer.md) | Lightweight Charts v5 + собственный слой разметки на Series Primitives | принято (подтверждено пользователем) |
| [0003](0003-live-data-from-browser.md) | Живые данные: браузер напрямую с fapi/fstream, fallback REST-polling | принято, проверка на M0 |
| [0004](0004-history-from-binance-archive.md) | История заданий: сервер читает архив data.binance.vision, CDN-кэш | принято |
| [0005](0005-stateless-signed-task-tokens.md) | Stateless-токены заданий (HMAC), будущее только на сервере, скрытая дата | принято, есть открытые вопросы |
| [0006](0006-timeframe-sync.md) | Нативные ТФ, инвариант агрегации 1m->1d, sliceAt | принято |
| [0007](0007-trade-resolution-drilldown.md) | Правила исхода Challenge: drill-down 1m -> aggTrades | принято, есть открытые вопросы |
| [0008](0008-local-first-repository.md) | IndexedDB (Dexie) за интерфейсом Repository, Supabase в M7 | принято |
| [0009](0009-deterministic-core-engine.md) | Общее детерминированное ядро, ALGO_VERSION, шаблонные разборы, ИИ позже | принято |

Связанные документы: `docs/API_CONTRACTS.md`, `docs/DATABASE_SCHEMA.md`.
