'use client';
import { useState, type ReactNode } from 'react';
import { glossary, guide, type TermDef } from '@/i18n/ru/guide';
import { BottomSheet, Button } from '@/ui';

const byAlias = new Map<string, TermDef>();
for (const t of glossary) for (const a of t.aliases) byAlias.set(a, t);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WORD = '(?<![\\p{L}\\p{N}_])';
const WORD_END = '(?![\\p{L}\\p{N}_])';
// Длинные варианты первыми: «R:R» раньше «R», «Swing High» раньше «Swing».
const pattern = new RegExp(
  `${WORD}(${[...byAlias.keys()].sort((a, b) => b.length - a.length).map(esc).join('|')})${WORD_END}`,
  'gu',
);

export type TermSegment = { text: string; term?: TermDef };

/** Разбивает строку на куски; известные термины SMC идут отдельными кусками с определением. */
export function splitTerms(text: string): TermSegment[] {
  const out: TermSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i) });
    out.push({ text: m[0], term: byAlias.get(m[0])! });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** Термин с пунктирным подчёркиванием: нажатие открывает определение. */
export function Term({ def, children }: { def: TermDef; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-testid="term"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        title={guide.term.open(def.title)}
        className="inline cursor-help p-0 align-baseline text-inherit underline decoration-dotted underline-offset-4"
      >
        {children}
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={def.title}
        height="medium"
        footer={
          <Button variant="secondary" className="w-full" onClick={() => setOpen(false)}>
            {guide.term.close}
          </Button>
        }
      >
        <p data-testid="term-def" className="text-base text-text-2">
          {def.def}
        </p>
      </BottomSheet>
    </>
  );
}

/** Строка с автоматически размеченными терминами. Не использовать внутри кнопок и ссылок. */
export function Annotated({ text }: { text: string }) {
  return (
    <>
      {splitTerms(text).map((s, i) => (s.term ? <Term key={i} def={s.term}>{s.text}</Term> : <span key={i}>{s.text}</span>))}
    </>
  );
}
