'use client';
import { Eye, EyeOff, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { BottomSheet, Button, IconButton } from '@/ui';
import { FeedbackView, GradeGlyph, GradeLegend, renderBlock } from '../../feedback';
import { cx, tx } from '../strings';
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

/** Разбор проверки: колонка 360 px справа на десктопе (график сужается), шторка (без скрима, график виден) на мобильном. */
export function CheckPanel({ result, open, onClose, showRef, onToggleRef, fmt, onFocusMarks }: CheckPanelProps) {
  const desktop = useDesktop();
  if (!result || !open) return null;
  const codes = result.grade.errors.map((e) => e.code).join(' ');
  const body = (
    <>
      <div className="border-b border-border pb-2" data-testid="check-verdict">
        <p className="text-base font-semibold">{cx.verdict(result.summary.matched, result.summary.total)}</p>
        <p className="mt-1 text-xs text-text-2">{cx.range}</p>
      </div>
      {/* Итог ядра («Верно: N из M эталона») не показываем: вердикт терминала считается по меткам пользователя. */}
      <FeedbackView
        feedback={result.feedback}
        fmtPrice={fmt}
        onFocusMarks={onFocusMarks}
        className="[&_[data-testid='fb-fb-verdict']]:hidden"
      />
      {result.missedBlocks.length > 0 && (
        <details className="border-t border-border py-2" data-testid="check-more">
          <summary className="min-h-11 cursor-pointer text-sm font-semibold leading-[44px]">{cx.more(result.missedBlocks.length)}</summary>
          <ul className="space-y-2">
            {result.missedBlocks.map((b, i) => (
              <li key={`${b.templateKey}-${i}`} className="flex items-start gap-2 text-sm">
                <GradeGlyph kind="miss" />
                {b.markIds?.length ? (
                  <button type="button" onClick={() => onFocusMarks(b.markIds!)} className="min-h-11 cursor-pointer text-left">
                    {renderBlock(b.templateKey, b.params, fmt)}
                  </button>
                ) : (
                  <span>{renderBlock(b.templateKey, b.params, fmt)}</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      <GradeLegend className="mt-2 border-t border-border pt-2" />
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
    <aside aria-label={tx.checkTitle} data-testid="check-panel" data-codes={codes} className="flex w-[360px] shrink-0 flex-col border-l border-border-strong bg-surface-1">
      <div className="flex items-center justify-between border-b border-border px-4">
        <h2 className="text-base font-semibold">{tx.checkTitle}</h2>
        <IconButton label={tx.closePanel} icon={<X size={20} strokeWidth={1.75} />} onClick={onClose} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{body}</div>
      <div className="border-t border-border p-3">{toggle}</div>
    </aside>
  );
}
