'use client';

import { ChevronDown, Search, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { ru } from '@/i18n/ru';
import { BottomSheet } from './BottomSheet';
import { cn } from './cn';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export interface SelectProps {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  /** Значение задано извне (задание): статичный текст без стрелки. */
  readOnly?: boolean;
  className?: string;
}

/** Выбор из списка в шторке/диалоге с поиском. */
export function Select({ label, options, value, onChange, searchPlaceholder, emptyTitle, readOnly, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const listId = useId();
  const current = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => (o.label + ' ' + (o.hint ?? '')).toLowerCase().includes(q)) : options;
  }, [options, query]);

  if (readOnly) {
    return <span className={cn('inline-flex h-11 min-w-28 items-center px-2 text-sm font-medium', className)}>{current?.label ?? value}</span>;
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${label}: ${current?.label ?? value}`}
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
        className={cn(
          'inline-flex h-11 min-w-28 cursor-pointer items-center justify-between gap-2 rounded-md px-3 text-sm font-medium hover:bg-surface-2',
          className,
        )}
      >
        <span className="tnum">{current?.label ?? value}</span>
        <ChevronDown size={20} strokeWidth={1.75} aria-hidden />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={label} height="full">
        <div className="relative mb-2">
          <Search size={20} strokeWidth={1.75} className="pointer-events-none absolute top-3 left-3 text-text-2" aria-hidden />
          <input
            autoFocus
            type="text"
            inputMode="search"
            aria-label={searchPlaceholder ?? label}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-sm border border-border-strong bg-surface-2 pr-11 pl-10 text-base"
          />
          {query && (
            <button
              type="button"
              aria-label={ru.actions.clearSearch}
              onClick={() => setQuery('')}
              className="absolute top-0 right-0 flex size-11 cursor-pointer items-center justify-center"
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <p className="py-4 text-sm text-text-2">{emptyTitle}</p>
        ) : (
          <ul id={listId} role="listbox" aria-label={label}>
            {filtered.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="flex h-12 w-full cursor-pointer flex-col justify-center border-b border-border text-left hover:bg-surface-1"
                >
                  <span className="text-sm font-medium">{o.label}</span>
                  {o.hint && <span className="text-xs text-text-2">{o.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </>
  );
}
