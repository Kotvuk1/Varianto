'use client';
// Живые подсказки правил: мягко, до отправки (только когда payload.hints.liveRules). Ничего не блокируют.
import { Info, TriangleAlert } from 'lucide-react';
import { ewx } from '@/i18n/ru/elliott';
import type { LiveHint } from './adapters';

export function LiveRules({ hints, hasCount }: { hints: readonly LiveHint[]; hasCount: boolean }) {
  if (!hasCount) return null;
  return (
    <section aria-label={ewx.live.title} data-testid="live-rules" aria-live="polite" className="space-y-1">
      <h3 className="text-sm font-semibold">{ewx.live.title}</h3>
      {hints.length === 0 ? (
        <p className="text-sm text-text-2" data-testid="live-ok">
          {ewx.live.allOk}
        </p>
      ) : (
        <ul className="space-y-1">
          {hints.map((h) => (
            <li key={h.id} data-testid="live-hint" data-tone={h.tone} className="flex items-start gap-2 text-sm text-text-2">
              {h.tone === 'rule' ? <TriangleAlert size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" /> : <Info size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />}
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
