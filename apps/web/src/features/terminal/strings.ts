// Тексты терминала (COPY.md). TODO(интеграция): перенести в src/i18n/ru (зона Frontend Developer).
export const tx = {
  title: 'Терминал',
  pair: 'Пара',
  pairSearch: 'Поиск пары',
  pairNotFoundTitle: 'Пара не найдена',
  pairNotFoundText: 'Проверьте тикер, например BTCUSDT.',
  pairCustom: (s: string) => `Открыть ${s}`,
  timeframe: 'Таймфрейм',
  tools: 'Инструменты разметки',
  hint: 'Выберите инструмент и коснитесь графика.',
  hintNoMarks: 'Выберите инструмент и коснитесь графика.',
  marksPanel: 'Разметка',
  yours: (n: number) => `Ваши: ${n}`,
  marksEmpty: 'Меток нет',
  check: 'Проверить',
  checkFull: 'Проверить мою разметку',
  checkDisabled: 'Появится после M2: алгоритмы в разработке',
  deleteMark: 'Удалить',
  clearSelection: 'Снять выбор',
  panelClose: 'Свернуть панель',
  panelOpen: 'Показать панель',
  loading: 'Загружаю свечи…',
  loadingMore: 'Догружаю историю…',
  statusLive: 'Live',
  statusPolling: 'Опрос',
  statusConnecting: 'Подключение',
  statusNoLive: 'Нет живых данных',
  archiveBanner: 'Данные: архив Binance (не live)',
  details: 'Подробности',
  retry: 'Повторить',
  openCandle: 'Идёт',
  snap: 'Снап к OHLC',
  groups: { structure: 'Структура', zones: 'Зоны', lines: 'Линии' },
  tools_: {
    select: 'Выбор',
    eraser: 'Ластик',
    'swing-high': 'Swing High',
    'swing-low': 'Swing Low',
    hh: 'HH',
    hl: 'HL',
    lh: 'LH',
    ll: 'LL',
    bos: 'BOS',
    choch: 'CHoCH',
    sweep: 'Sweep',
    'order-block': 'OB',
    fvg: 'FVG',
    level: 'Уровень',
    hline: 'Горизонталь',
    trendline: 'Трендовая',
    position: 'Позиция',
  },
  menu: 'Открыть разделы',
  sections: 'Разделы',
} as const;

export interface ErrorCopy {
  title: string;
  text: string;
}

/** COPY.md §5.2. Код: HTTP-статус, 'network', 'bad_response', 'archive'. */
export function errorCopy(code: number | string | undefined): ErrorCopy {
  if (code === 451)
    return {
      title: 'Binance недоступен из вашей сети',
      text: 'Binance отклонил запрос (451): доступ ограничен для вашего региона или сети. Включите VPN или откройте Trading Lab в другой сети.',
    };
  if (code === 'network')
    return { title: 'Нет подключения к сети', text: 'Не удалось связаться с Binance. Проверьте интернет и повторите.' };
  if (code === 429)
    return { title: 'Слишком много запросов', text: 'Binance временно ограничил запросы. Подождите минуту и повторите.' };
  if (code === 'archive')
    return {
      title: 'Архив данных недоступен',
      text: 'Не удалось загрузить исторические свечи. Повторите; если ошибка остаётся, повторите позже.',
    };
  if (code === 'bad_response')
    return { title: 'Данные не прошли проверку', text: 'Свечи загружены с ошибкой формата. Повторите загрузку.' };
  if (typeof code === 'number' && code >= 500)
    return { title: 'Binance не отвечает', text: 'Сервер Binance не ответил вовремя. Это временно, повторите через минуту.' };
  return { title: 'Что-то пошло не так', text: 'Повторите действие. Если ошибка остаётся, перезагрузите страницу.' };
}
