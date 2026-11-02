# Skills Registry — Trading Lab

Последнее обновление: 2026-11-02 (Этап 0).
Все установки сделаны в **области проекта** (`.claude/settings.json`, `.claude/skills/`), чтобы они сохранялись в репозитории: облачный контейнер эфемерный.

## Установленные инструменты

| Навык / инструмент | Источник | Версия | Назначение | Ответственный агент | Вызов | Безопасность |
|---|---|---|---|---|---|---|
| Superpowers (плагин) | github.com/obra/superpowers (marketplace `superpowers-dev`) | 7.0.1 (commit 2ce8aa1) | Методология: brainstorming, writing-plans, subagent-driven-development, TDD, systematic-debugging, code review, verification-before-completion | Оркестратор (методология), все разработчики (TDD/debugging), QA (verification) | `/superpowers:<skill>`, например `/superpowers:writing-plans` | Хук SessionStart только добавляет текст скилла `using-superpowers` в контекст. Сеть/секреты не использует. Официальный marketplace `claude-plugins-official` в этом окружении не зарегистрирован, поэтому установлен из репозитория автора. |
| Impeccable (плагин) | github.com/pbakaus/impeccable | 4.8.0 (commit 9fadc41) | Дизайн-качество UI: critique, audit, polish, typeset, adapt, harden, animate и др. (24 команды), детектор AI-шаблонов (62 правила) | UI/UX Designer, Frontend Developer | `/impeccable <command> <target>`; CLI `npx impeccable detect src/` | Хуки SessionStart/PostToolUse(Edit\|Write)/Stop запускают локальный движок-линтер, таймаут 5 с. Движок скачивается один раз в `~/.impeccable/bin/`. |
| Graphify (CLI + скилл) | github.com/Graphify-Labs/graphify, PyPI `graphifyy` | 0.9.101 | Граф знаний кодовой базы: `query`, `path`, `explain`, `update` | Оркестратор, все агенты при исследовании кода | `/graphify .`; `graphify update .`; `graphify query "..."` | AST-режим работает без API-ключей (проверено на тестовом TS-коде: 731 узел, 2162 ребра). Хуки PreToolUse нестрогие (без `--strict`), обёрнуты в `command -v graphify ... \|\| true`, чтобы не ломать сессии, где CLI не установлен. Ключи Gemini/Google НЕ передаются. |
| Agent Skills CLI | npm `skills` (github.com/vercel-labs/skills) | latest через `npx` (commit 77cfce8) | Поиск/установка/обновление навыков | Оркестратор | `npx skills find <q>`, `npx skills add <owner/repo@skill>`, `npx skills list` | Глобально не устанавливается, запускается через `npx`. |

### Установка в новом контейнере
Плагины подтянутся из `.claude/settings.json` автоматически. Graphify CLI нужно поставить вручную: `uv tool install graphifyy`.

## Уже доступные навыки окружения (не требуют установки)

| Навык | Назначение | Агент |
|---|---|---|
| `anthropic-skills:grilling` | Глубокое интервью (аналог `/grill-me`) — используется на Этапе 1 | Оркестратор |
| `engineering:architecture`, `engineering:system-design` | ADR, проектирование | Оркестратор |
| `engineering:testing-strategy`, `anthropic-skills:playwright-pro` | Стратегия тестов, E2E | QA Engineer |
| `anthropic-skills:senior-backend`, `anthropic-skills:senior-frontend` | Профильная разработка | Backend / Frontend |
| `security-review`, `engineering:code-review` | Аудит безопасности, ревью | Security Reviewer, QA |
| `dataviz`, `design:accessibility-review` | Визуализация, доступность | Chart Developer, UI/UX |
| `engineering:documentation` | Документация | Documentation Engineer |

## Кандидаты — отложены до утверждения архитектуры

| Кандидат | Причина отложить |
|---|---|
| `tradingview/lightweight-charts@lightweight-charts` (официальный, 1.5K установок) | Полезен, если ADR выберет Lightweight Charts. Ставить после решения по графической библиотеке. |
| `fastapi/fastapi@fastapi` (официальный) | Только если backend = FastAPI. |
| `vercel-labs/agent-skills@vercel-react-best-practices` | Только если frontend = React/Next.js. |
| `jeffallan/claude-skills@websocket-engineer` | Оценить после выбора стека. |

## Отклонённые

| Кандидат | Причина |
|---|---|
| `mattpocock/skills@grill-me` | Дублирует уже доступный `grilling`. |
| `binance/binance-skills-hub@*` | Ориентированы на торговлю с API-ключами (ордера, платежи). Trading Lab использует только публичные рыночные данные — лишние права и риск. |
| Навыки «fibonacci-trading», «elliott-wave» от малоизвестных авторов (2–444 установки) | Низкое доверие, логика ТА будет проверяться Technical Analyst по первоисточникам. |

## Справочник: Public APIs
github.com/public-apis/public-apis — только справочник. Возможные резервные источники (не подключены): CoinGecko (без ключа), CryptoCompare. Основной источник остаётся Binance USDⓈ-M Futures.
