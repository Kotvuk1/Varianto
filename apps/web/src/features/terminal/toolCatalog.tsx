import type { ReactNode } from 'react';
import {
  AlignVerticalSpaceAround,
  ArrowRightToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  ChevronUp,
  Eraser,
  Minus,
  MousePointer2,
  MoveDiagonal,
  RectangleHorizontal,
  SeparatorHorizontal,
  TrendingUp,
} from 'lucide-react';
import type { ToolId } from '@/chart/drawing/tools';

const ic = { size: 24, strokeWidth: 1.75, 'aria-hidden': true } as const;
const txt = (t: string): ReactNode => <span className="text-sm leading-6 font-semibold">{t}</span>;

export const TOOL_ICON: Record<Exclude<ToolId, 'position'>, ReactNode> = {
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
};

export type TerminalTool = keyof typeof TOOL_ICON;
export type GroupId = 'structure' | 'zones' | 'lines';

export const GROUPS: readonly { id: GroupId; tools: readonly TerminalTool[]; icon: ReactNode }[] = [
  { id: 'structure', tools: ['swing-high', 'swing-low', 'hh', 'hl', 'lh', 'll', 'bos', 'choch'], icon: <TrendingUp {...ic} /> },
  { id: 'zones', tools: ['sweep', 'order-block', 'fvg'], icon: <RectangleHorizontal {...ic} /> },
  { id: 'lines', tools: ['level', 'hline', 'trendline'], icon: <Minus {...ic} /> },
];

export const groupOf = (t: ToolId | null): GroupId | null => GROUPS.find((g) => (g.tools as readonly string[]).includes(t ?? ''))?.id ?? null;

/** Горячие клавиши десктопа (COMPONENTS 1.1). */
export const HOTKEYS: Record<string, TerminalTool> = {
  v: 'select',
  s: 'swing-high',
  S: 'swing-low',
  h: 'hh',
  b: 'bos',
  c: 'choch',
  w: 'sweep',
  o: 'order-block',
  f: 'fvg',
  l: 'level',
  g: 'hline',
  t: 'trendline',
  e: 'eraser',
};
