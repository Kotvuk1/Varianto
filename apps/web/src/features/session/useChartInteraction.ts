'use client';
import { useCallback, useState } from 'react';
import type { Mark } from '@tl/core';
import type { ControllerNotice } from '@/chart/interaction/controller';
import type { ToolId } from '@/chart/drawing/tools';

/** Состояние разметки на графике: инструмент, метки, выбор, предупреждение инструмента, фокус. */
export function useChartInteraction(initialTool: ToolId, transform?: (next: Mark[]) => Mark[]) {
  const [tool, setToolRaw] = useState<ToolId>(initialTool);
  const [marks, setMarksRaw] = useState<Mark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<ControllerNotice>({ step: 0, code: null });
  const [focus, setFocus] = useState<{ time: number; nonce: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const setTool = useCallback((t: ToolId) => {
    setToolRaw(t);
    setSelectedId(null);
    setNotice({ step: 0, code: null });
  }, []);

  const setMarks = useCallback(
    (next: Mark[]) => {
      setMarksRaw(transform ? transform(next) : next);
      setMessage(null);
    },
    [transform],
  );

  const deleteMark = useCallback((id: string) => {
    setMarksRaw((ms) => ms.filter((m) => m.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }, []);

  /** Центрирует график на первой найденной метке из ids. */
  const focusOn = useCallback((ids: string[], pool: readonly Mark[]) => {
    const m = pool.find((x) => ids.includes(x.id));
    if (!m) return;
    const first = m.anchors[0]!.time;
    const last = m.anchors[m.anchors.length - 1]!.time;
    setFocus((f) => ({ time: (first + last) / 2, nonce: (f?.nonce ?? 0) + 1 }));
  }, []);

  const focusAt = useCallback((time: number) => setFocus((f) => ({ time, nonce: (f?.nonce ?? 0) + 1 })), []);

  const selected = marks.find((m) => m.id === selectedId) ?? null;
  return { tool, setTool, marks, setMarks, selectedId, setSelectedId, selected, notice, setNotice, focus, focusOn, focusAt, deleteMark, message, setMessage };
}
