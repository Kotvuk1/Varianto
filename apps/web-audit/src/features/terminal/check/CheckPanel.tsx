'use client';
import { Eye, EyeOff, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { BottomSheet, Button, IconButton } from '@/ui';
import { FeedbackView, GradeLegend } from '../../feedback';
import { tx } from '../strings';
import type { CheckResult } from './runCheck';

const Q = '(min-width: 1024px)';
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(Q);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const useDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(Q).matches,
    () => false,
  );

export interface CheckPanelProps {
  result: CheckResult | null;
  open: boolean;
  onClose: () => void;
  showRef: boolean;
  onToggleRef: () => void;
  fmt: (p: number) => string;
  onFocusMarks: (ids: string[]) => void;
}

/** Разбор проверки: боковой лист на десктопе, шторка (без скрима, график виден) на мобильном. */
export function CheckPanel({ result, open, onClose, showRef, onToggleRef, fmt, onFocusMarks }: CheckPanelProps) {
  const desktop = useDesktop();
  if (!result || !open) return null;
  const codes = result.grade.errors.map((e) => e.code).join(' ');
  const body = (
    <>
      <GradeLegend className="mb-2 border-b border-border pb-2" />
      <FeedbackView feedback={result.feedback} fmtPrice={fmt} onFocusMarks={onFocusMarks} summary={result.summary} />
      <p className="mt-2 text-xs text-text-2">{tx.checkNote}</p>
    </>
  );
  const toggle = (
    <Button size="sm" icon={showRef ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />} onClick={onToggleRef} data-testid="toggle-ref">
      {showRef ? tx.hideRef : tx.showRef}
    </Button>
  );
  if (!desktop) {
    return (
      <BottomSheet open onClose={onClose} title={tx.checkTitle} height="medium" modal={false} footer={toggle}>
        <div data-testid="check-panel" data-codes={codes}>{body}</div>
      </BottomSheet>
    );
  }
  return (
    <aside aria-label={tx.checkTitle} data-testid="check-panel" data-codes={codes} className="absolute top-0 right-0 bottom-0 z-30 flex w-[400px] max-w-full flex-col border-l border-border-strong bg-surface-1 shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4">
        <h2 className="text-base font-semibold">{tx.checkTitle}</h2>
        <IconButton label={tx.closePanel} icon={<X size={20} strokeWidth={1.75} />} onClick={onClose} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{body}</div>
      <div className="border-t border-border p-3">{toggle}</div>
    </aside>
  );
}
