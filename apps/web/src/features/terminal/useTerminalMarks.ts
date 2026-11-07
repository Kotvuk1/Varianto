'use client';
// Разметка терминала: на пару, видна на всех ТФ. Хранилище - Repository (IndexedDB), TODO(M7): аккаунт.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Mark, Symbol } from '@tl/core';
import { validateMarks } from '@/chart/drawing/serialize';
import { useRepository } from '@/storage/useRepository';

export function useTerminalMarks(symbol: Symbol | null) {
  const repo = useRepository();
  const [state, setState] = useState<{ symbol: Symbol | null; marks: Mark[] }>({ symbol: null, marks: [] });
  const current = useRef(state);
  const symRef = useRef(symbol);
  useLayoutEffect(() => {
    current.current = state;
    symRef.current = symbol;
  });

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    repo
      .getTerminalMarks(symbol)
      .then((m) => {
        if (!cancelled) setState({ symbol, marks: validateMarks(m).marks });
      })
      .catch(() => {
        if (!cancelled) setState({ symbol, marks: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [repo, symbol]);

  const setMarks = useCallback(
    (marks: Mark[]) => {
      const sym = current.current.symbol;
      if (!sym || sym !== symRef.current) return;
      const next = { symbol: sym, marks };
      current.current = next;
      setState(next);
      void repo.saveTerminalMarks(sym, marks).catch(() => undefined);
    },
    [repo],
  );

  // Пока метки другой пары не загружены, показываем пустой список (не чужие).
  const marks = state.symbol === symbol ? state.marks : [];
  return { marks, setMarks, loaded: state.symbol === symbol };
}
