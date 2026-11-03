// Тексты терминала (COPY.md, FR-UI-03). Подключаются через features/terminal/strings.ts.
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
  marksPanel: 'Разметка',
  marksButton: (n: number) => `Разметка (${n})`,
  marksTitle: 'Разметка',
  marksEmpty: 'Меток нет',
  check: 'Проверить',
  checkFull: 'Проверить мою разметку',
  checkDisabled: 'Появится после M2: алгоритмы в разработке',
  deleteMark: 'Удалить',
  clearSelection: 'Снять выбор',
  loading: 'Загружаю свечи…',
  loadingMore: 'Догружаю историю…',
  statusLive: 'Live',
  statusPolling: 'Опрос',
  statusConnecting: 'Подключение',
  statusNoLive: 'Нет живых данных',
  archiveBanner: 'Данные: архив Binance (не live)',
  archiveBadge: 'Архив Binance · не live',
  details: 'Подробности',
  retry: 'Повторить',
  openCandle: 'Идёт',
  cancel: 'Отмена',
  groups: { select: 'Выбор', structure: 'Структура', breaks: 'Пробои', zones: 'Зоны', lines: 'Линии', position: 'Позиция' },
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
    'order-block': 'Order Block',
    fvg: 'FVG',
    level: 'Уровень',
    hline: 'Горизонталь',
    trendline: 'Трендовая',
    position: 'Позиция',
  },
  stripHint: 'Выберите инструмент и нажмите на график: метка встанет на свечу по правилам разметки.',
  stripExpand: 'Показать подсказку целиком',
  toolPrefix: (name: string) => `Инструмент: ${name}`,
  selectedPrefix: 'Выбрана метка',
  eraserHelp: 'нажмите на метку, чтобы удалить её',
  help: {
    'swing-high': 'нажмите рядом с вершиной: метка встанет на high свечи-экстремума',
    'swing-low': 'нажмите рядом с впадиной: метка встанет на low свечи-экстремума',
    hh: 'нажмите рядом с вершиной выше предыдущей: метка встанет на high',
    hl: 'нажмите рядом с впадиной выше предыдущей: метка встанет на low',
    lh: 'нажмите рядом с вершиной ниже предыдущей: метка встанет на high',
    ll: 'нажмите рядом с впадиной ниже предыдущей: метка встанет на low',
    bos: '1) нажмите на swing 2) нажмите на свечу, закрывшуюся за ним',
    choch: '1) нажмите на swing 2) нажмите на свечу, закрывшуюся за ним против тренда',
    sweep: 'нажмите на свечу, чей фитиль пробил ближайший swing, а закрытие осталось за уровнем',
    'order-block': 'нажмите на последнюю противоположную свечу перед импульсом',
    fvg: 'нажмите на среднюю свечу импульса: зона построится по разрыву между соседними',
    level: 'нажмите рядом с фитилем: уровень встанет на high/low',
    hline: 'нажмите рядом с фитилем: линия встанет на high/low',
    trendline: 'нажмите на две точки: линия привяжется к фитилям',
    position: 'нажмите: 1) вход 2) стоп 3) цель',
  },
  helpStep2: {
    bos: 'swing выбран. Теперь нажмите на свечу, закрывшуюся за ним',
    choch: 'swing выбран. Теперь нажмите на свечу, закрывшуюся за ним против тренда',
    trendline: 'точка 1 поставлена. Нажмите на вторую точку',
    position: 'вход задан. Нажмите: стоп, затем цель',
  },
  notice: {
    'bos-wick-only': 'Тело этой свечи не закрылось за уровнем',
    'no-fvg': 'Здесь нет FVG: фитили свечей i−1 и i+1 перекрываются',
    'fvg-unclosed': 'Свеча i+1 ещё не закрылась: FVG пока не подтверждён',
    'before-swing': 'Выберите свечу правее swing',
    'no-sweep': 'Здесь нет sweep: фитиль не пробивает ближайший swing',
    'sweep-is-break': 'Свеча закрылась за уровнем: это пробой, а не sweep',
  },
  dir: { up: 'вверх', down: 'вниз', bull: 'бычий', bear: 'медвежий', sweepHigh: 'по high', sweepLow: 'по low' },
  focusMark: 'Показать на графике',
  marksHelp: 'Нажмите на метку, чтобы показать её на графике.',
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
  if (code === 400) return { title: 'Пара не найдена', text: 'Проверьте тикер, например BTCUSDT.' };
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
