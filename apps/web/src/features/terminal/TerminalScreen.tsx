'use client';
import { Database, ListChecks, Menu, ScanSearch, Settings, TriangleAlert, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Mark, Symbol, Timeframe } from '@tl/core';
import type { ControllerNotice } from '@/chart/interaction/controller';
import { makePriceFormatter, tickSizeFor } from '@/chart/priceFormat';
import { TradingChart } from '@/chart/TradingChart';
import { ru } from '@/i18n/ru';
import { DesktopTabs } from '@/shell';
import { NAV_ITEMS } from '@/shell/routes';
import { Badge, BottomSheet, Button, IconButton, Segmented } from '@/ui';
import { normalizeSymbolInput, resolveSourceMode, TERMINAL_TIMEFRAMES, TF_LABEL } from './dataSource';
import { CheckPanel } from './check/CheckPanel';
import { runCheck, type CheckResult } from './check/runCheck';
import { InstructionBar } from './InstructionBar';
import { MarksSheet } from './MarksSheet';
import { PairPicker } from './PairPicker';
import { errorCopy, tx } from './strings';
import { HOTKEYS, type TerminalTool } from './toolCatalog';
import { DesktopRail, MobileToolbar } from './ToolPalette';
import { otherScope, useScope, useScopeHotkey } from './useScope';
import { useMarketData } from './useMarketData';
import { useTerminalMarks } from './useTerminalMarks';

const env = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE: process.env.NEXT_PUBLIC_ENABLE_ARCHIVE_SOURCE,
};

function ErrorBlock({ code, message, at, onRetry }: { code: number | string; message: string; at: number; onRetry: () => void }) {
  const c = errorCopy(code);
  const t = new Date(at);
  const host = code === 'archive' ? 'data.binance.vision' : 'fapi.binance.com';
  return (
    <div role="alert" data-testid="chart-error" className="absolute inset-0 z-20 flex items-center justify-center bg-bg p-4">
      <div className="max-w-sm">
        <TriangleAlert size={24} strokeWidth={1.75} aria-hidden className="mb-2 text-text-2" />
        <h2 className="text-lg font-semibold">{c.title}</h2>
        <p className="mt-1 text-sm text-text-2">{c.text}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={onRetry}>
            {tx.retry}
          </Button>
        </div>
        <details className="mt-3 text-sm text-text-2">
          <summary className="min-h-11 cursor-pointer leading-[44px]">{tx.details}</summary>
          <p className="tnum break-words">
            Код: {code} · Хост: {host} · {t.toLocaleTimeString('ru-RU')}
          </p>
          <p className="break-words">{message}</p>
        </details>
      </div>
    </div>
  );
}

export function TerminalScreen() {
  const params = useSearchParams();
  const mode = resolveSourceMode(params.get('source'), env);
  const [symbol, setSymbol] = useState<Symbol>(() => normalizeSymbolInput(params.get('symbol') ?? '') ?? 'BTCUSDT');
  const [tf, setTf] = useState<Timeframe>(() => {
    const p = params.get('tf') as Timeframe | null;
    return p && TERMINAL_TIMEFRAMES.includes(p) ? p : '1h';
  });
  const [tool, setTool] = useState<TerminalTool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [marksOpen, setMarksOpen] = useState(false);
  const [notice, setNotice] = useState<ControllerNotice>({ step: 0, code: null });
  const [checked, setChecked] = useState<{ result: CheckResult; marks: Mark[]; key: string } | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);
  const [showRef, setShowRef] = useState(true);
  const [messageState, setMessageState] = useState<{ text: string; marks: Mark[] } | null>(null);
  const [focus, setFocus] = useState<{ time: number; nonce: number } | null>(null);

  const [scope, setScope] = useScope();
  useScopeHotkey(true, () => setScope(otherScope(scope)));
  const data = useMarketData(symbol, tf, mode);
  const shownSymbol = data.series?.symbol ?? null;
  const { marks, setMarks } = useTerminalMarks(shownSymbol);
  const fmt = useMemo(() => makePriceFormatter(tickSizeFor(shownSymbol ?? symbol)), [shownSymbol, symbol]);

  // Результат проверки относится к конкретной разметке и ряду: любое изменение его обнуляет.
  const seriesKey = data.series ? `${data.series.symbol}|${data.series.tf}` : '';
  const check = checked && checked.marks === marks && checked.key === seriesKey ? checked.result : null;
  const message = messageState && messageState.marks === marks ? messageState.text : null;

  const runCheckNow = () => {
    if (!data.series) return;
    const o = runCheck(data.series.candles, data.series.tf, marks, tickSizeFor(data.series.symbol));
    if (!o.ok) {
      setMessageState({ text: o.reason === 'no-candles' ? tx.checkNoCandles : tx.checkEmpty, marks });
      return;
    }
    setMessageState(null);
    setChecked({ result: o.result, marks, key: seriesKey });
    setShowRef(true);
    setCheckOpen(true);
  };

  const changeTool = useCallback((t: TerminalTool) => {
    setTool(t);
    setSelectedId(null);
    setNotice({ step: 0, code: null });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') {
        setTool('select');
        setNotice({ step: 0, code: null });
        return;
      }
      // по физической клавише: работает и в русской раскладке
      const letter = e.code.startsWith('Key') ? e.code.slice(3).toLowerCase() : e.key.toLowerCase();
      const t = HOTKEYS[letter];
      if (t) changeTool(t);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeTool]);

  const deleteMark = (id: string) => {
    setMarks(marks.filter((m) => m.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  };
  const selected = marks.find((m) => m.id === selectedId) ?? null;
  const focusMark = (m: Mark) => {
    setTool('select');
    setSelectedId(m.id);
    setMarksOpen(false);
    const first = m.anchors[0]!.time;
    const last = m.anchors[m.anchors.length - 1]!.time;
    setFocus((f) => ({ time: (first + last) / 2, nonce: (f?.nonce ?? 0) + 1 }));
  };

  const status = data.status;
  const statusBadge =
    mode === 'archive' ? null : status === 'live' ? (
      <Badge variant="outline">{tx.statusLive}</Badge>
    ) : status === 'polling' ? (
      <Badge variant="outline">{tx.statusPolling}</Badge>
    ) : status === 'error' ? (
      <Badge icon={<WifiOff size={12} strokeWidth={1.75} aria-hidden />}>{tx.statusNoLive}</Badge>
    ) : (
      <Badge>{tx.statusConnecting}</Badge>
    );
  // Компактный бейдж справа от выбора ТФ: на мобильном только иконка (полный текст в aria-label/title).
  const archiveBadge =
    mode === 'archive' ? (
      <span data-testid="archive-banner" role="status" title={tx.archiveBanner} aria-label={tx.archiveBanner} className="ml-1 shrink-0">
        <Badge variant="outline" icon={<Database size={12} strokeWidth={1.75} aria-hidden />} className="h-6">
          <span aria-hidden className="hidden lg:inline">
            {tx.archiveBadge}
          </span>
        </Badge>
      </span>
    ) : null;

  const blocking = data.error && (!data.series || data.series.symbol !== symbol || data.series.tf !== tf || !data.series.candles.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="terminal" data-source={mode}>
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface-1 px-2 lg:px-4">
        <IconButton label={tx.menu} icon={<Menu size={20} strokeWidth={1.75} />} className="lg:hidden" onClick={() => setMenuOpen(true)} />
        <Link href="/" className="mr-2 hidden text-base font-semibold whitespace-nowrap lg:block">
          {ru.appName}
        </Link>
        <DesktopTabs className="mr-4" />
        <PairPicker value={symbol} onChange={(s) => setSymbol(s)} />
        <div className="w-[184px] shrink-0 lg:w-60">
          <Segmented
            label={tx.timeframe}
            options={TERMINAL_TIMEFRAMES.map((v) => ({ value: v, label: TF_LABEL[v] }))}
            value={tf}
            onChange={setTf}
          />
        </div>
        {archiveBadge}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {statusBadge}
          <Button size="sm" icon={<ListChecks size={20} strokeWidth={1.75} />} onClick={() => setMarksOpen(true)} data-testid="marks-button">
            {tx.marksButton(marks.length)}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ScanSearch size={20} strokeWidth={1.75} />}
            title={tx.checkHint}
            data-testid="check-button"
            onClick={runCheckNow}
          >
            {tx.checkFull}
          </Button>
          <Link href="/settings" aria-label={ru.actions.settings} title={ru.actions.settings} className="flex size-11 items-center justify-center rounded-md hover:bg-surface-2">
            <Settings size={20} strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <DesktopRail tool={tool} onTool={changeTool} />
        <section className="relative flex min-w-0 flex-1 flex-col bg-bg" aria-label={tx.title}>
          <div className="relative z-10 flex shrink-0 items-center border-b border-border bg-surface-1 px-3">
            <InstructionBar
              tool={tool}
              step={notice.step}
              notice={notice.code}
              selected={selected}
              fmt={fmt}
              onCancel={() => changeTool('select')}
              onDelete={() => selected && deleteMark(selected.id)}
              onDeselect={() => setSelectedId(null)}
              message={message}
              allowScope
              scope={scope}
              onScope={setScope}
            />
            <button
              type="button"
              onClick={() => setMarksOpen(true)}
              data-testid="marks-button-mobile"
              aria-label={tx.marksButton(marks.length)}
              className="ml-1 inline-flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border border-border-strong px-2 text-sm font-medium lg:hidden"
            >
              <ListChecks size={20} strokeWidth={1.75} aria-hidden />
              <span className="tnum">
                {marks.length}
              </span>
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            {data.series && (
              <TradingChart
                series={data.series}
                marks={marks}
                tool={tool}
                onMarksChange={setMarks}
                selectedId={selectedId}
                onSelectedChange={setSelectedId}
                onRequestMoreHistory={(before) => {
                  if (data.hasMore) void data.loadMore(before);
                }}
                openCandleLabel={tx.openCandle}
                ariaLabel={`${data.series.symbol} ${TF_LABEL[data.series.tf]}`}
                onNotice={setNotice}
                focus={focus}
                readOnlyMarks={check && showRef ? check.algoMarks : undefined}
                markStates={check?.states}
                scope={scope}
              />
            )}
            <div className="pointer-events-none absolute top-2 right-14 z-10 lg:hidden">{statusBadge}</div>
            {(data.loading || data.loadingMore) && !blocking && (
              <div role="status" className="pointer-events-none absolute top-14 left-1/2 z-10 -translate-x-1/2 lg:top-2">
                <Badge>{data.loading ? tx.loading : tx.loadingMore}</Badge>
              </div>
            )}
            {data.loading && !data.series && !data.error && (
              <div role="status" className="absolute inset-0 flex items-center justify-center text-sm text-text-2">
                {tx.loading}
              </div>
            )}
            {blocking && data.error && <ErrorBlock {...data.error} onRetry={data.reload} />}
          </div>
        </section>
        <CheckPanel
          result={check}
          open={checkOpen}
          onClose={() => setCheckOpen(false)}
          showRef={showRef}
          onToggleRef={() => setShowRef((v) => !v)}
          fmt={fmt}
          onFocusMarks={(ids) => {
            const m = [...marks, ...(check?.algoMarks ?? [])].find((x) => ids.includes(x.id));
            if (m) setFocus((f) => ({ time: (m.anchors[0]!.time + m.anchors[m.anchors.length - 1]!.time) / 2, nonce: (f?.nonce ?? 0) + 1 }));
          }}
        />
      </div>

      <MobileToolbar tool={tool} onTool={changeTool} onCheck={runCheckNow} />

      <MarksSheet open={marksOpen} onClose={() => setMarksOpen(false)} marks={marks} selectedId={selectedId} fmt={fmt} onFocus={focusMark} onDelete={deleteMark} />

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={tx.sections} height="medium">
        <ul>
          {NAV_ITEMS.map((n) => (
            <li key={n.id}>
              <Link href={n.href} className="flex h-12 items-center border-b border-border text-sm font-medium">
                {ru.nav[n.id]}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/settings" className="flex h-12 items-center text-sm font-medium">
              {ru.actions.settings}
            </Link>
          </li>
        </ul>
      </BottomSheet>
    </div>
  );
}
