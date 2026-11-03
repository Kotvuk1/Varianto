'use client';
import { ChevronDown, ChevronLeft, ChevronUp, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ss } from '@/i18n/ru/session';
import { BottomSheet, Button, IconButton, cn, type SheetHeight } from '@/ui';
import { useIsDesktop } from './useIsDesktop';

export interface TaskHintProps {
  /** Одна строка задания. */
  text: string;
  /** Раскрывается по [i]: определение, окно оценки. */
  details?: ReactNode;
  /** Длинный текст (вопрос): переносится, не обрезается. */
  wrap?: boolean;
}

/** Справка над графиком: одна строка + раскрытие (LAYOUTS §3.1, COPY §7). */
export function TaskHint({ text, details, wrap = false }: TaskHintProps) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid="task-hint" className="shrink-0 border-b border-border bg-surface-1 px-3">
      <div className="flex min-h-11 items-center gap-1">
        <p data-testid="task-text" className={cn('min-w-0 flex-1 py-2 text-sm leading-5', open || wrap ? '' : 'truncate')} title={text}>
          {text}
        </p>
        {details && (
          <IconButton
            label={ss.referenceToggle}
            aria-expanded={open}
            icon={<Info size={20} strokeWidth={1.75} />}
            onClick={() => setOpen((o) => !o)}
            data-testid="task-hint-toggle"
          />
        )}
      </div>
      {open && details && <div className="space-y-2 pb-3 text-sm text-text-2">{details}</div>}
    </div>
  );
}

export interface SessionLayoutProps {
  backHref: string;
  title: string;
  subtitle: string;
  counter: string;
  hint?: ReactNode;
  /** Строка-инструкция инструмента (задания с разметкой). */
  instruction?: ReactNode;
  chart: ReactNode;
  /** Десктоп: рейка инструментов слева. */
  rail?: ReactNode;
  /** Мобильный: нижняя панель (инструменты + «Проверить» или варианты ответа). */
  bottom?: ReactNode;
  /** Десктоп: правая панель до проверки (ответы, кнопка «Проверить»). */
  aside?: ReactNode;
  /** Разбор: показывается, когда он есть (шторка на мобильном, правая панель на десктопе). */
  result?: {
    body: (sheetControls: ReactNode) => ReactNode;
    footer: ReactNode;
  } | null;
}

const SHEET_PAD: Record<SheetHeight, string> = { peek: '120px', medium: '50dvh', full: '50dvh' };

/** Общий каркас сессии задания: шапка, справка, график, панели; разбор - bottom sheet / боковой лист (LAYOUTS §3, §4). */
export function SessionLayout({ backHref, title, subtitle, counter, hint, instruction, chart, rail, bottom, aside, result }: SessionLayoutProps) {
  const desktop = useIsDesktop();
  const [height, setHeight] = useState<SheetHeight>('medium');
  const sheet = !desktop && result;

  const toggle = () => setHeight((h) => (h === 'peek' ? 'medium' : 'peek'));
  const sheetControls = (
    <Button
      size="md"
      variant="ghost"
      icon={height === 'peek' ? <ChevronUp size={20} strokeWidth={1.75} /> : <ChevronDown size={20} strokeWidth={1.75} />}
      onClick={toggle}
      data-testid="sheet-toggle"
    >
      {height === 'peek' ? ss.expandSheet : ss.collapseSheet}
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="session" data-graded={result ? 'true' : 'false'}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface-1 px-1 lg:px-3">
        <Link href={backHref} aria-label={ss.back} title={ss.back} className="flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-surface-2">
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
          {title}
          <span className="font-normal text-text-2"> · {subtitle}</span>
        </h1>
        <span data-testid="task-counter" className="tnum shrink-0 pr-2 text-sm text-text-2">
          {counter}
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        {desktop && rail}
        <section className="relative flex min-w-0 flex-1 flex-col bg-bg">
          {hint}
          {instruction && <div className="relative z-10 flex shrink-0 items-center border-b border-border bg-surface-1 px-3">{instruction}</div>}
          <div className="relative min-h-0 flex-1" style={sheet ? { paddingBottom: SHEET_PAD[height] } : undefined}>
            {chart}
          </div>
          {!desktop && !result && bottom}
        </section>
        {desktop && (
          <aside aria-label={ss.resultTitle} className="flex w-[360px] shrink-0 flex-col border-l border-border bg-surface-1">
            {result ? (
              <>
                <h2 className="shrink-0 border-b border-border px-4 py-3 text-lg font-semibold">{ss.resultTitle}</h2>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{result.body(null)}</div>
                <div className="flex shrink-0 gap-2 border-t border-border p-3">{result.footer}</div>
              </>
            ) : (
              aside
            )}
          </aside>
        )}
      </div>

      {sheet && (
        <BottomSheet open onClose={() => setHeight('peek')} title={ss.resultTitle} height={height} modal={false} footer={height === 'peek' ? undefined : result.footer}>
          {height === 'peek' ? (
            <div className="flex flex-wrap gap-2">
              {result.footer}
              {sheetControls}
            </div>
          ) : (
            result.body(sheetControls)
          )}
        </BottomSheet>
      )}
    </div>
  );
}
