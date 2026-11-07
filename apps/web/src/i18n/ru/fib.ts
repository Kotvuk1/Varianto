// Тексты Fibonacci Playground (FIBONACCI.md §5-§7, §11). Термины SMC на английском с расшифровкой.
import type { FibConfluenceKey, FibReactionOption, FibTarget } from '@tl/core';

type Dir = 'bull' | 'bear';

export const fx = {
  title: 'Fibonacci Playground',
  subtitle: 'Сетка Фибоначчи на реальных свечах',
  card: { title: 'Fibonacci', modes: 'Построй сетку · Где реакция? · Цель по Extension' },
  types: { grid: 'Построй сетку', reaction: 'Где реакция?', extension: 'Цель по Extension' },
  typeHelp: {
    grid: 'Найдите импульс в подсвеченном окне и протяните по нему Retracement от начала к концу.',
    reaction: 'Сетка уже построена. Выберите уровень, от которого цена развернётся, и посмотрите, что было дальше.',
    extension: 'Постройте Extension по трём точкам A, B, C и выберите цель, до которой дойдёт движение.',
  },
  difficultyHelp: {
    easy: 'Чистый импульс, направление и подсказки (Equilibrium, OTE, Premium/Discount).',
    medium: 'Импульс без подсказок, больше уровней на выбор.',
    hard: 'Ловушки: начало предыдущей ноги, внутренние откаты, ложный конфлюэнс, глубокая реакция.',
  },
  hint: {
    grid: 'Протяните Fibonacci Retracement по последнему импульсу в подсвеченной области: первая точка — начало импульса, вторая — его конец.',
    gridDir: (d: Dir) => `Импульс направлен ${d === 'bull' ? 'вверх' : 'вниз'}.`,
    reaction: 'Сетка построена по последнему импульсу. Выберите уровень, от которого начнётся разворот коррекции, отметьте конфлюэнс и определите зону цены.',
    reactionTap: 'Уровень можно выбрать касанием по линии сетки на графике или кнопкой.',
    extension: 'Постройте Fibonacci Extension: A — начало импульса, B — его конец, C — конец коррекции. Затем выберите цель.',
    extensionDir: (d: Dir) => `Импульс направлен ${d === 'bull' ? 'вверх' : 'вниз'}.`,
    gridDetails: 'Допуск положения точек — 2 свечи. Сервер сам притягивает точки к high/low свечи: считается экстремум, а не тело.',
    reactionDetails:
      'Реакция — первый разворот коррекции не меньше порога по закрытию свечи. Конфлюэнс (OB, FVG, старый уровень) необязателен, но заявленное должно быть на графике.',
    extensionDetails:
      'Точки A и B оцениваются как у Retracement, C — экстремум коррекции. Цель считается достигнутой, пока цена не закрылась за точкой C.',
    windowNote: (n: number) => `Область оценки — последние ${n} свечей. Остальной график затемнён.`,
  },
  tool: { retracement: 'Фибо: коррекция', extension: 'Фибо: расширение' },
  reaction: {
    levelTitle: 'Уровень реакции',
    levelGroup: 'Уровень реакции',
    confTitle: 'Конфлюэнс на этом уровне',
    confHelp: 'Необязательно: отметьте только то, что действительно есть в зоне уровня.',
    pdTitle: 'Зона цены',
    pdQuestion: (price: string) => `Цена сейчас (${price}) в Premium или Discount диапазона импульса?`,
    accept: 'Принять',
    options: {
      '0.382': '0.382',
      '0.5': '0.5',
      '0.618': '0.618',
      '0.705': '0.705',
      '0.786': '0.786',
      ote: 'OTE',
      deep: 'Глубже 0.786',
    } satisfies Record<FibReactionOption, string>,
    optionHelp: { ote: 'OTE (Optimal Trade Entry, зона 0.62–0.79)' },
    conf: {
      'order-block': 'Order Block (OB)',
      fvg: 'FVG',
      level: 'Уровень',
    } satisfies Record<FibConfluenceKey, string>,
    pd: { premium: 'Premium', discount: 'Discount' },
    picked: (label: string) => `Выбран уровень: ${label}`,
    notAnOption: 'Этот уровень не входит в варианты ответа.',
  },
  extension: {
    targetTitle: 'Цель',
    targetGroup: 'Цель по Extension',
    targets: { '1': '1.0', '1.272': '1.272', '1.618': '1.618', none: 'Никакая' } satisfies Record<FibTarget, string>,
    targetHelp: { none: 'Цена не дойдёт ни до одного уровня до закрытия за C.' },
  },
  input: {
    noGrid: 'Протяните сетку: выберите инструмент «Фибо» и коснитесь двух точек — начала и конца импульса.',
    noExtension: 'Постройте Extension тремя касаниями: A, B и C.',
    noOption: 'Выберите уровень реакции.',
    noTarget: 'Выберите цель extension.',
    noPd: 'Определите, где цена: в Premium или Discount.',
  },
  replay: {
    title: 'Что было дальше',
    reactionEnd: 'Реакция определена',
    extensionEnd: 'Движение закончилось',
    hiddenDate: 'Дата скрыта до итога',
  },
  result: {
    scenario: (date: string) => `Сценарий: ${date}`,
    reaction: (given: string, correct: string) => `Ваш выбор: ${given} · Реакция от: ${correct}`,
    depth: (depth: string, price: string) => `Коррекция остановилась на ${price} (${depth} импульса)`,
    outcomeFail: 'Импульс сломан закрытием за точкой A',
    pd: (given: string, expected: string) => `Зона цены: ${given} · эталон ${expected}`,
    pdNone: 'Premium/Discount не оценивался',
    extension: (target: string, reached: string, x: string) => `Ваша цель: ${target} · Достигнуто: ${reached} (${x} от AB)`,
    marker: { reaction: 'Реакция', fail: 'Слом', invalidation: 'Закрытие за C', end: 'Конец окна' },
  },
  errors: { saveFailed: 'Не удалось сохранить попытку на этом устройстве: она не попадёт в прогресс.' },
} as const;

export type FibTypeKey = keyof typeof fx.types;
