'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Feedback, FeedbackBlock } from '@tl/core';
import { ai } from '@/i18n/ru/ai';
import { BottomSheet } from '@/ui/BottomSheet';
import { renderBlock } from './format';

export interface AiReply {
  answer: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  modelMismatch?: boolean;
}
interface Turn {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  mismatch?: boolean;
}
type Status = 'idle' | 'loading' | 'limit' | 'rate' | 'error';

let enabledCache: Promise<boolean> | undefined;
/** Включён ли ИИ на сервере (GET /api/ai/status); результат кэшируется на сессию. */
export function loadAiEnabled(): Promise<boolean> {
  enabledCache ??= fetch('/api/ai/status', { cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<{ enabled?: boolean }>) : { enabled: false }))
    .then((j) => j.enabled === true)
    .catch(() => false);
  return enabledCache;
}
/** Только для тестов. */
export function resetAiEnabledCache(): void {
  enabledCache = undefined;
}

const TIME_MASK = '[время скрыто]';
const MAX_HISTORY = 6;

/** Контекст для сервера: тексты разбора без абсолютных дат (реальное время скрыто до раскрытия). */
export function buildAttemptContext(feedback: Feedback, module: string, fmtPrice: (p: number) => string) {
  const text = (b: FeedbackBlock) => {
    const params: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(b.params ?? {})) params[k] = /time|ts$/i.test(k) && typeof v === 'number' ? TIME_MASK : v;
    return renderBlock(b.templateKey, params, fmtPrice);
  };
  const parts: [string, FeedbackBlock[]][] = [
    ['Итог', [feedback.verdict]],
    ['Верно', feedback.understood],
    ['Ошибки', feedback.mistakes],
    ['Почему', feedback.why],
    ['Как правильно', feedback.howTo],
    ['Принцип', [feedback.principle]],
  ];
  return {
    module,
    grade: {
      errors: feedback.mistakes.map((b) => b.templateKey).slice(0, 30),
      okCodes: feedback.understood.map((b) => b.templateKey).slice(0, 30),
    },
    feedback: parts.map(([t, bs]) => `${t}: ${bs.map(text).join(' | ') || '-'}`).join('\n').slice(0, 4000),
  };
}

export function AskAi({
  feedback,
  module,
  fmtPrice,
}: {
  feedback: Feedback;
  module: string;
  fmtPrice: (p: number) => string;
}) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  // История и статус привязаны к конкретному разбору: новый разбор начинает с чистого листа.
  const [st, setSt] = useState<{ fb: Feedback; turns: Turn[]; status: Status }>({ fb: feedback, turns: [], status: 'idle' });
  const cur = st.fb === feedback ? st : { fb: feedback, turns: [] as Turn[], status: 'idle' as Status };
  const { turns, status } = cur;
  const setTurns = (f: (t: Turn[]) => Turn[]) => setSt((p) => ({ ...(p.fb === feedback ? p : { fb: feedback, turns: [], status: 'idle' as Status }), turns: f(p.fb === feedback ? p.turns : []) }));
  const setStatus = (status: Status) => setSt((p) => ({ ...(p.fb === feedback ? p : { fb: feedback, turns: [], status: 'idle' as Status }), status }));
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void loadAiEnabled().then((v) => alive.current && setEnabled(v));
    return () => {
      alive.current = false;
    };
  }, []);
  if (!enabled) return null;

  const ask = async (question: string) => {
    const text = question.trim().slice(0, 500);
    if (!text || status === 'loading') return;
    const history = turns.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
    setTurns((t) => [...t, { role: 'user', content: text }]);
    setQ('');
    setStatus('loading');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptContext: buildAttemptContext(feedback, module, fmtPrice), question: text, history }),
      });
      if (!res.ok) {
        const code = ((await res.json().catch(() => null)) as { error?: { code?: string } } | null)?.error?.code;
        setStatus(code === 'daily_limit' ? 'limit' : code === 'rate_limited' ? 'rate' : 'error');
        return;
      }
      const r = (await res.json()) as AiReply;
      setTurns((t) => [...t, { role: 'assistant', content: r.answer, model: r.model, mismatch: r.modelMismatch }]);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const msg = status === 'limit' ? ai.limit : status === 'rate' ? ai.rateLimit : status === 'error' ? ai.error : null;
  return (
    <div className="py-3" data-testid="ask-ai">
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="ask-ai-open"
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm font-medium"
      >
        <Sparkles size={16} aria-hidden="true" />
        {ai.ask}
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={ai.title} height="full">
        <div className="space-y-3 text-sm" data-testid="ask-ai-panel">
          <ul className="space-y-2" aria-live="polite" data-testid="ask-ai-history">
            {turns.map((t, i) => (
              <li key={i} className={t.role === 'user' ? 'text-text-2' : ''}>
                <span className="font-semibold">{t.role === 'user' ? ai.you : ai.assistant}: </span>
                <span className="whitespace-pre-wrap">{t.content}</span>
                {t.role === 'assistant' && t.model !== undefined && (
                  <p className="mt-1 text-xs text-text-2" data-testid="ask-ai-signature">
                    {ai.signature(t.model || '?')}
                    {t.mismatch && <strong> {ai.mismatch}</strong>}
                  </p>
                )}
              </li>
            ))}
            {status === 'loading' && <li data-testid="ask-ai-loading">{ai.loading}</li>}
          </ul>
          {msg && (
            <p role="alert" data-testid="ask-ai-error" className="text-sm font-medium">
              {msg}
            </p>
          )}
          <div className="flex flex-wrap gap-2" role="group" aria-label={ai.quickLabel}>
            {ai.quick.map((x) => (
              <button
                key={x}
                type="button"
                disabled={status === 'loading' || status === 'limit'}
                onClick={() => void ask(x)}
                className="min-h-11 cursor-pointer rounded-md border border-border px-3 disabled:opacity-50"
              >
                {x}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(q);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={500}
              aria-label={ai.questionLabel}
              placeholder={ai.placeholder}
              data-testid="ask-ai-input"
              className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-transparent px-3"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'limit' || !q.trim()}
              data-testid="ask-ai-send"
              className="min-h-11 cursor-pointer rounded-md border border-border px-3 font-medium disabled:opacity-50"
            >
              {ai.send}
            </button>
          </form>
        </div>
      </BottomSheet>
    </div>
  );
}
