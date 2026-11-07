// Тексты Market Structure (COPY.md §7, ALGORITHMS §13). Термины SMC на английском с расшифровкой.
import { MS_FOCUS_SMC, msConceptsFor, msParamsFor, msWindowProfile, type Difficulty, type SkillId } from '@tl/core';
import { formatDateTime, plural } from '@/i18n/format';

export const msTx = {
  title: 'Market Structure',
  subtitle: 'Ступень 5. Структура рынка: BOS, CHoCH, sweep, Order Block, FVG.',
  modes: { mark: 'Разметка', question: 'Вопрос' },
  modeHelp: {
    mark: 'Размечайте структуру на графике, алгоритм сравнит с эталоном.',
    question: 'Быстрый вопрос по подсвеченному месту графика.',
  },
  sessionTitle: { mark: 'Разметка', question: 'Вопрос' },
  referenceToggle: 'Справка по заданию',
  referenceClose: 'Свернуть справку',
  question: 'Вопрос',
  answerGroup: 'Варианты ответа',
  answerHelpDesktop: 'Выберите вариант ответа и нажмите «Ответить».',
  highlightNote: 'Нужное место подсвечено линией на графике.',
} as const;

/** Что делать в задании (COPY §7), по понятиям. */
/** Короткие названия понятий для фразы задания («Отметьте … в подсвеченной области»). */
export const msConceptShort: Partial<Record<SkillId, string>> = {
  swing: 'Swing High и Swing Low',
  'structure-labels': 'HH, HL, LH и LL',
  bos: 'BOS',
  choch: 'CHoCH',
  'internal-external': 'внешнюю и внутреннюю структуру',
  sweep: 'Liquidity sweep',
  'order-block': 'Order Block',
  fvg: 'FVG',
};

export function msFocusTask(focus: readonly SkillId[], required?: number): string {
  const names = focus.map((c) => msConceptShort[c]).filter((x): x is string => !!x);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}` : (names[0] ?? '');
  const n = required ? `: ожидается ${required} ${plural(required, ['метка', 'метки', 'меток'])}` : '';
  return `Отметьте ${list} в подсвеченной области${n}.`;
}

export const msConceptTask: Partial<Record<SkillId, { name: string; task: string; term: string }>> = {
  swing: {
    name: 'Swing High / Swing Low',
    task: 'Отметьте все Swing High и Swing Low на графике.',
    term: 'Swing (свинг) — локальный экстремум: свеча, максимум (минимум) которой выше (ниже) соседних слева и справа.',
  },
  'structure-labels': {
    name: 'HH / HL / LH / LL',
    task: 'Подпишите структуру: HH, HL, LH или LL.',
    term: 'HH, HL, LH, LL (Higher High, Higher Low, Lower High, Lower Low) — каждый новый свинг выше или ниже предыдущего того же типа.',
  },
  bos: {
    name: 'BOS',
    task: 'Отметьте свечи, где произошёл BOS. Считается закрытие тела, не фитиль.',
    term: 'BOS (Break of Structure, слом структуры) — закрытие тела свечи за последним свингом по направлению тренда.',
  },
  choch: {
    name: 'CHoCH',
    task: 'Отметьте свечу, где структура сменила характер. Считается закрытие тела.',
    term: 'CHoCH (Change of Character, смена характера) — закрытие тела свечи за последним свингом против тренда.',
  },
  'internal-external': {
    name: 'Internal / External',
    task: 'Внешняя структура образована крупными свингами, внутренняя — мелкими внутри них. Отмечайте оба слоя.',
    term: 'Внешняя (external) и внутренняя (internal) структура — крупные и мелкие свинги соответственно.',
  },
  sweep: {
    name: 'Liquidity sweep',
    task: 'Отметьте свечу, которая собрала ликвидность.',
    term: 'Liquidity sweep (сбор ликвидности) — цена выходит за экстремум фитилём, забирает стопы и возвращается под уровень.',
  },
  'order-block': {
    name: 'Order Block',
    task: 'Выделите Order Block, с которого начался импульс.',
    term: 'Order Block (OB, ордерблок) — последняя противоположная свеча перед импульсом, сломавшим структуру.',
  },
  fvg: {
    name: 'FVG',
    task: 'Выделите FVG — разрыв между свечами.',
    term: 'FVG (Fair Value Gap, имбаланс) — разрыв между тенями первой и третьей из трёх свечей, не перекрытый второй.',
  },
};

const reference = {
  easy: 'Лёгкий уровень: только внешняя структура, BOS и CHoCH. Отмечайте то, что видно по закрытию тела свечи, фитиль пробоем не считается.',
  medium: 'Средний уровень: к BOS и CHoCH добавляется одно понятие из Liquidity sweep, Order Block, FVG. Проверьте, где прокол фитилём, а где закрытие тела.',
  hard: 'Сложный уровень: внешняя и внутренняя структура и несколько понятий SMC, в графике есть ложные пробои. Отличайте Liquidity sweep (фитиль) от BOS и CHoCH (закрытие тела).',
} as const;

export const msReference = (key: string): string => {
  const d = key.replace('ms.reference.', '') as keyof typeof reference;
  return reference[d] ?? '';
};

type P = Record<string, string | number> | undefined;
/** «2 мая, 14:00»: месяц в родительном падеже, время в локальном поясе. */
export const formatDateTimeRu = formatDateTime;
const fmtTime = (t: unknown) => (typeof t === 'number' ? formatDateTimeRu(t) : '');
const fmtNum = (v: unknown) => (typeof v === 'number' ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(v ?? ''));

/** Ключи вопросов и вариантов, которые отдаёт сервер (ALGORITHMS §13.3). */
export function msQuestionText(key: string, params?: P): string {
  switch (key) {
    case 'ms.q.trend.prompt':
      return 'Какой сейчас внешний тренд по структуре (последний BOS/CHoCH)?';
    case 'ms.q.trend.up':
      return 'Восходящий';
    case 'ms.q.trend.down':
      return 'Нисходящий';
    case 'ms.q.trend.range':
      return 'Боковик (диапазон)';
    case 'ms.q.breakType.prompt':
      return `Что произошло на подсвеченной свече (${fmtTime(params?.time)})?`;
    case 'ms.q.breakType.bos':
      return 'BOS (слом структуры по тренду)';
    case 'ms.q.breakType.choch':
      return 'CHoCH (смена характера)';
    case 'ms.q.breakType.sweep':
      return 'Liquidity sweep (сбор ликвидности)';
    case 'ms.q.wickOrBody.prompt':
      return `Подсвечен уровень ${fmtNum(params?.level)}. Пробит ли он на свече ${fmtTime(params?.time)}?`;
    case 'ms.q.wickOrBody.body':
      return 'Да: тело закрылось за уровнем (BOS или CHoCH)';
    case 'ms.q.wickOrBody.wick':
      return 'Нет: только фитиль, закрытие осталось по эту сторону';
    case 'ms.q.protected.prompt':
      return params?.trend === 'up'
        ? 'Тренд восходящий. Какой уровень его защищает: закрытие тела ниже него будет CHoCH?'
        : 'Тренд нисходящий. Какой уровень его защищает: закрытие тела выше него будет CHoCH?';
    case 'ms.q.protected.option':
      return fmtNum(params?.price);
    default:
      return key;
  }
}

/**
 * Описание сложности ступени 5 строится из таблицы ядра (msConceptsFor / msParamsFor / msWindowProfile), а не хардкодится:
 * изменение таблицы на сервере отражается в тексте без правки UI.
 */
export function msDifficultyHelp(d: Difficulty): string {
  const concepts = msConceptsFor(d, [], 'smc');
  const base = concepts.filter((c) => !MS_FOCUS_SMC.includes(c));
  const focus = concepts.filter((c) => MS_FOCUS_SMC.includes(c));
  const name = (c: SkillId) => msConceptShort[c] ?? c;
  const list = (xs: readonly SkillId[]) => xs.map(name).join(', ');
  const w = msWindowProfile(d, 'smc');
  const p = msParamsFor(d, 'smc');
  const parts = [list(base)];
  if (d === 'medium') parts.push(`плюс одно понятие из: ${list(MS_FOCUS_SMC)}`);
  else if (focus.length) parts.push(`плюс: ${list(MS_FOCUS_SMC)}`);
  const windowText = w.windowMin === w.windowMax ? `${w.windowMax}` : `${w.windowMin}-${w.windowMax}`;
  return `${parts.join(', ')}. Окно ${windowText} свечей, свинги N = ${p.nExt}${p.nInt ? ` и ${p.nInt}` : ''}.`;
}
