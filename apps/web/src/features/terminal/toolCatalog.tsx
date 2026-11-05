import type { ReactNode } from 'react';
import {
  AlignVerticalSpaceAround,
  ArrowLeftRight,
  ArrowRightToLine,
  ArrowUpFromLine,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eraser,
  Minus,
  MousePointer2,
  MoveDiagonal,
  RectangleHorizontal,
  SeparatorHorizontal,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { ToolId } from '@/chart/drawing/tools';

const ic = { size: 24, strokeWidth: 1.75, 'aria-hidden': true } as const;
const svgProps = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
/** Сетка коррекции: уровни разной длины и диагональ импульса (форма, не цвет). */
const FibRetracementIcon = () => (
  <svg {...svgProps}>
    <path d="M3 5h18M3 10h18M3 15h18M3 20h18" />
    <path d="M6 20 18 5" strokeDasharray="2 2.5" />
  </svg>
);
/** Расширение: ножки A-B-C и уровни-цели справа. */
const FibExtensionIcon = () => (
  <svg {...svgProps}>
    <path d="M3 19 8 9l4 6" />
    <path d="M12 15h9M12 8h9M12 4h9" />
  </svg>
);
const txt = (t: string): ReactNode => <span className="text-sm leading-6 font-semibold">{t}</span>;

export const TOOL_ICON: Record<ToolId, ReactNode> = {
  select: <MousePointer2 {...ic} />,
  eraser: <Eraser {...ic} />,
  'swing-high': <ChevronUp {...ic} />,
  'swing-low': <ChevronDown {...ic} />,
  hh: txt('HH'),
  hl: txt('HL'),
  lh: txt('LH'),
  ll: txt('LL'),
  bos: <ArrowRightToLine {...ic} />,
  choch: <ArrowLeftRight {...ic} />,
  sweep: <ArrowUpFromLine {...ic} />,
  'order-block': <RectangleHorizontal {...ic} />,
  fvg: <AlignVerticalSpaceAround {...ic} />,
  level: <Minus {...ic} />,
  hline: <SeparatorHorizontal {...ic} />,
  trendline: <MoveDiagonal {...ic} />,
  position: <Crosshair {...ic} />,
  'fib-retracement': <FibRetracementIcon />,
  'fib-extension': <FibExtensionIcon />,
};

export type TerminalTool = keyof typeof TOOL_ICON;
export type GroupId = 'select' | 'structure' | 'breaks' | 'zones' | 'lines' | 'fib' | 'position';

export interface ToolGroup {
  id: GroupId;
  tools: readonly TerminalTool[];
  icon: ReactNode;
}

/** Семь групп рейки (ластик - отдельно внизу). Группы из одного инструмента не имеют flyout. */
export const GROUPS: readonly ToolGroup[] = [
  { id: 'select', tools: ['select'], icon: TOOL_ICON.select },
  { id: 'structure', tools: ['swing-high', 'swing-low', 'hh', 'hl', 'lh', 'll'], icon: <TrendingUp {...ic} /> },
  { id: 'breaks', tools: ['bos', 'choch', 'sweep'], icon: <Zap {...ic} /> },
  { id: 'zones', tools: ['order-block', 'fvg'], icon: <RectangleHorizontal {...ic} /> },
  { id: 'lines', tools: ['level', 'hline', 'trendline'], icon: <Minus {...ic} /> },
  { id: 'fib', tools: ['fib-retracement', 'fib-extension'], icon: <FibRetracementIcon /> },
  { id: 'position', tools: ['position'], icon: TOOL_ICON.position },
];

/** Мобильная панель: «Позиция» входит в веер «Линии», чтобы 6 элементов + «Проверить» поместились в 360 px. */
export const MOBILE_GROUPS: readonly ToolGroup[] = [
  GROUPS[0]!,
  GROUPS[1]!,
  GROUPS[2]!,
  GROUPS[3]!,
  { ...GROUPS[4]!, tools: ['level', 'hline', 'trendline', 'position'] },
  GROUPS[5]!,
];

export const groupOf = (t: ToolId | null, groups: readonly ToolGroup[] = GROUPS): GroupId | null =>
  groups.find((g) => (g.tools as readonly string[]).includes(t ?? ''))?.id ?? null;

/** Горячие клавиши десктопа. Esc - отмена (обрабатывается отдельно). */
export const HOTKEYS: Readonly<Record<string, TerminalTool>> = {
  v: 'select',
  e: 'eraser',
  b: 'bos',
  c: 'choch',
  f: 'fvg',
  o: 'order-block',
  l: 'level',
  t: 'trendline',
  g: 'fib-retracement',
};

export const HOTKEY_OF: Readonly<Partial<Record<TerminalTool, string>>> = Object.fromEntries(
  Object.entries(HOTKEYS).map(([k, t]) => [t, k.toUpperCase()]),
);
