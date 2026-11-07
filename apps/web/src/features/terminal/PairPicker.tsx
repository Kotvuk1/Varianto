'use client';
import { ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import type { Symbol } from '@tl/core';
import { BottomSheet } from '@/ui';
import { normalizeSymbolInput, PRESET_SYMBOLS } from './dataSource';
import { tx } from './strings';

export function PairPicker({ value, onChange }: { value: Symbol; onChange: (s: Symbol) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toUpperCase();
  const list = PRESET_SYMBOLS.filter((s) => s.includes(q));
  const custom = normalizeSymbolInput(query);
  const showCustom = custom !== null && !(PRESET_SYMBOLS as readonly string[]).includes(custom);
  const pick = (s: Symbol) => {
    onChange(s);
    setOpen(false);
  };
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${tx.pair}: ${value}`}
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
        className="inline-flex h-11 cursor-pointer items-center gap-1 rounded-md px-2 text-sm font-medium hover:bg-surface-2"
      >
        <span className="tnum">{value}</span>
        <ChevronDown size={20} strokeWidth={1.75} aria-hidden />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={tx.pair} height="full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (custom) pick(custom);
            else if (list[0]) pick(list[0]);
          }}
          className="relative mb-2"
        >
          <Search size={20} strokeWidth={1.75} className="pointer-events-none absolute top-3 left-3 text-text-2" aria-hidden />
          <input
            autoFocus
            type="text"
            aria-label={tx.pairSearch}
            placeholder="BTCUSDT"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-sm border border-border-strong bg-surface-2 pr-3 pl-10 text-base"
          />
        </form>
        <ul role="listbox" aria-label={tx.pair}>
          {list.map((s) => (
            <li key={s} role="option" aria-selected={s === value}>
              <button type="button" onClick={() => pick(s)} className="flex h-12 w-full cursor-pointer items-center border-b border-border text-left text-sm font-medium hover:bg-surface-1">
                {s}
              </button>
            </li>
          ))}
          {showCustom && (
            <li role="option" aria-selected={false}>
              <button type="button" onClick={() => pick(custom!)} className="flex h-12 w-full cursor-pointer items-center border-b border-border text-left text-sm font-medium hover:bg-surface-1">
                {tx.pairCustom(custom!)}
              </button>
            </li>
          )}
        </ul>
        {list.length === 0 && !showCustom && (
          <div className="py-4">
            <p className="text-sm font-semibold">{tx.pairNotFoundTitle}</p>
            <p className="text-sm text-text-2">{tx.pairNotFoundText}</p>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
