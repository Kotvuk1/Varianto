# «Спросить ИИ» (MiniMax)

Кнопка в разборе заданий. Объясняет уже готовый разбор; оценку выставляет алгоритм, ИИ её не меняет.
Работает только если на сервере задан `MINIMAX_API_KEY`. Без ключа: `GET /api/ai/status` возвращает `{enabled:false}`, кнопка скрыта, `POST /api/ai/explain` отвечает 404 `feature_disabled`.

## Источник (официальная документация MiniMax, прочитана 2026-11-07)
- Базовый URL международной платформы: `https://api.minimax.io/v1`; эндпоинт `POST /v1/chat/completions` (OpenAI-совместимый). Документация: https://platform.minimax.io/docs/api-reference/text-chat , https://platform.minimax.io/docs/guides/text-generation
- Имя модели в API: `MiniMax-M3.1-Flash` (конфиг `MINIMAX_MODEL`, это дефолт). Также есть `MiniMax-M3`.
- Авторизация: `Authorization: Bearer <API key>`.
- Ответ: `id`, `choices[0].message.content` (рассуждение отдельно в `reasoning_content`), `model` (модель, использованная запросом), `usage.{prompt_tokens,completion_tokens,total_tokens}`, `base_resp.status_code` (0 = успех).
- Flash всегда «думает»; отключить нельзя (HTTP 400). Мы ставим `reasoning_effort: "low"` и `max_completion_tokens: 3000`. `temperature`/`top_p` для этой модели не поддерживаются.
- Лимиты аккаунта: 200 RPM, 10 000 000 TPM (https://platform.minimax.io/docs/guides/rate-limits).
- Цена (https://platform.minimax.io/docs/pricing/overview): вход $0.15, выход $0.60 за 1M токенов.
- Ошибки (`base_resp.status_code`): 1002 rate limit, 1004/2049 неверный ключ, 1008 нет баланса, 2013 неверные параметры, 2022 модели нет. Сервер наружу отдаёт только общий `502 ai_unavailable`.

Не подтверждено документацией: точный формат тела HTTP-ошибок (не 200) для chat completions; размер баланса пробного периода; поведение `modelMismatch` при алиасах (если MiniMax вернёт другое написание имени, флаг сработает, это ложная тревога).

## Как подключить (с телефона)
1. Зарегистрируйтесь на международной платформе: https://platform.minimax.io (не minimaxi.com).
2. Пополните баланс: Billing, Balance (https://platform.minimax.io/user-center/payment/balance). Хватит $5.
3. Создайте ключ: Account Management, API Keys, Create new secret key (pay-as-you-go ключ; ключ M Plan другой). Скопируйте сразу.
4. Vercel: проект, Settings, Environment Variables, добавьте `MINIMAX_API_KEY`, включите Sensitive, окружения Production (и Preview при желании). Нажмите Save и сделайте Redeploy.
5. Необязательно: `MINIMAX_MODEL`, `AI_DAILY_LIMIT` (по умолчанию 100 вопросов в сутки на IP+cookie, плюс 10 в минуту), `MINIMAX_PRICE_IN`/`MINIMAX_PRICE_OUT` (USD за 1M).

Ключ живёт только в `process.env` сервера, не попадает в ответы и логи.

## Как проверить, что модель настоящая
- Под каждым ответом подпись «Ответ ИИ, модель: <model>»: значение берётся из поля `model` ответа MiniMax, не из нашего конфига.
- Если оно не совпало с `MINIMAX_MODEL`, ответ помечается `modelMismatch: true`, в UI появляется предупреждение, в логе сервера `[ai] model mismatch`.
- Лог Vercel (Logs, поиск `[ai]`): `requested`, `model`, `requestId`, `usage`, `costUsd`, и суммарно за сутки `[ai] day-total`. Текст вопросов не логируется. Сверьте `requestId` и расход токенов с Usage в консоли MiniMax.

## Стоимость (ориентир)
Запрос: ~1000-2000 токенов входа и ~500-1500 выхода (с рассуждением). По $0.15/$0.60 это около $0.0005-0.0015 за вопрос: 100 вопросов в день примерно $0.05-0.15. Лимит `AI_DAILY_LIMIT` защищает от перерасхода; счётчики в памяти инстанса, на serverless они приблизительные (жёсткий потолок задайте в консоли MiniMax).

## Приватность
Реальные даты и время из разбора на сервер не отправляются (клиент маскирует, сервер дополнительно вычищает), чтобы не раскрыть дату Challenge/Fib/Elliott до раскрытия. `taskToken` в запросе не используется: контекст передаётся в `attemptContext`.
