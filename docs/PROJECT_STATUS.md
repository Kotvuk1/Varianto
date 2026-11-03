# Project Status — Trading Lab

Обновлено: 2026-11-03

## Завершённые этапы
- **Этап 0 — окружение и инструменты.** См. `docs/SKILLS_REGISTRY.md`.
- **Этап 1 — интервью проведено.** Резюме: `docs/INTERVIEW_SUMMARY.md` — **подтверждено пользователем**.
- **Этап 2 — PRD и ROADMAP** (`docs/PRD.md`, `docs/ROADMAP.md`) — написаны Documentation Engineer, проверены оркестратором; 22 открытых вопроса (раздел 12 PRD).

## Окружение (облачный контейнер Claude Code)
- Модель оркестратора: `claude-opus-5-5` (подтверждено через get_session).
- Субагенты: доступны (Agent tool: general-purpose, Explore, Plan, fork). Выбор модели для субагентов поддерживается (sonnet/haiku).
- Node 22.23.4, npm 10.9.9, pnpm 10.28.0, Python 3.13.18, uv 0.11.32, Docker 29.9.2, Git 2.43.0, Claude Code 2.1.316, Chromium + Playwright предустановлены.

## Доступность рыночных данных из контейнера (проверено curl)
| Endpoint | Результат |
|---|---|
| `fapi.binance.com` (USDⓈ-M REST) | **451 — гео-ограничение Binance** |
| `fstream.binance.com` (USDⓈ-M WebSocket) | **таймаут** |
| `data.binance.vision` (официальный архив USDⓈ-M klines) | 200 — доступен |
| `testnet.binancefuture.com` | 200 (тестнет, НЕ реальные рыночные данные) |
| `data-api.binance.vision` | 200 (только Spot — не наш инструмент) |

Это ограничение облачного контейнера разработки; доступность с сервера развёртывания и из браузера пользователя нужно уточнить (вопрос интервью).

- **Этап 3 — архитектура**: ARCHITECTURE.md, ADR-0001…0009, API_CONTRACTS.md, DATABASE_SCHEMA.md, TESTING_STRATEGY.md, AGENTS.md, `.claude/agents/` (9 агентов). Ждёт ревью пользователя.

## Текущие задачи
- Ревью PRD пользователем; решение по OQ-18 (авторизация раньше).

## Блокирующие проблемы
- Нет. OQ-04 (где генерируются сценарии при гео-блоке серверов) решается в архитектуре.

## Следующие действия
1. Этап 3 — архитектура и ADR.
2. Пользователь: подключить репозиторий к Vercel (до M0).
