'use client';
import { Database, Menu, Settings, Trash2, TriangleAlert, WifiOff, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { Symbol, Timeframe } from '@tl/core';
import { TradingChart } from '@/chart/TradingChart';
import { ru } from '@/i18n/ru';
import { DesktopTabs } from '@/shell';
import { NAV_ITEMS } from '@/shell/routes';
import { Badge, BottomSheet, Button, IconButton, Segmented } from '@/ui';
import { normalizeSymbolInput, resolveSourceMode, TERMINAL_TIMEFRAMES, TF_LABEL } from './dataSource';
import { MarksPanel, markTitle } from './MarksPanel';
import { PairPicker } from './PairPicker';
import { errorCopy, tx } from './strings';
import { HOTKEYS, type TerminalTool } from './toolCatalog';
import { DesktopRail, MobileToolbar } from './ToolPalette';
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

  const data = useMarketData(symbol, tf, mode);
  const shownSymbol = data.series?.symbol ?? null;
  const { marks, setMarks } = useTerminalMarks(shownSymbol);

  const changeTool = useCallback((t: TerminalTool) => {
    setTool(t);
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') setTool('select');
      else if (HOTKEYS[e.key]) changeTool(HOTKEYS[e.key]!);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeTool]);

  const deleteMark = (id: string) => {
    setMarks(marks.filter((m) => m.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  };
  const selected = marks.find((m) => m.id === selectedId) ?? null;

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
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {statusBadge}
          <Link href="/settings" aria-label={ru.actions.settings} title={ru.actions.settings} className="flex size-11 items-center justify-center rounded-md hover:bg-surface-2">
            <Settings size={20} strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </header>

      {mode === 'archive' && (
        <div role="status" data-testid="archive-banner" className="flex h-8 shrink-0 items-center gap-2 bg-surface-2 px-3 text-sm text-text-1">
          <Database size={16} strokeWidth={1.75} aria-hidden />
          {tx.archiveBanner}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <DesktopRail tool={tool} onTool={changeTool} />
        <section className="relative min-w-0 flex-1 bg-bg" aria-label={tx.title}>
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
            />
          )}
          <div className="pointer-events-none absolute top-2 right-14 z-10 flex gap-2 lg:hidden">{statusBadge}</div>
          {(data.loading || data.loadingMore) && !blocking && (
            <div role="status" className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2">
              <Badge>{data.loading ? tx.loading : tx.loadingMore}</Badge>
            </div>
          )}
          {data.loading && !data.series && !data.error && (
            <div role="status" className="absolute inset-0 flex items-center justify-center text-sm text-text-2">
              {tx.loading}
            </div>
          )}
          {blocking && data.error && <ErrorBlock {...data.error} onRetry={data.reload} />}
          <div className="absolute bottom-10 left-2 z-10 flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-md border border-border bg-surface-1 pl-3 text-sm" data-testid="context-bar">
            {selected ? (
              <>
                <span className="font-medium">{markTitle(selected)}</span>
                <IconButton label={tx.deleteMark} icon={<Trash2 size={20} strokeWidth={1.75} />} onClick={() => deleteMark(selected.id)} />
                <IconButton label={tx.clearSelection} icon={<X size={20} strokeWidth={1.75} />} onClick={() => setSelectedId(null)} />
              </>
            ) : (
              <span className="py-2 pr-3 text-text-2">{tool === 'select' && marks.length === 0 ? tx.hint : tx.tools_[tool]}</span>
            )}
          </div>
        </section>
        <MarksPanel marks={marks} selectedId={selectedId} onSelect={(id) => { setTool('select'); setSelectedId(id); }} onDelete={deleteMark} />
      </div>

      <MobileToolbar tool={tool} onTool={changeTool} />

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
