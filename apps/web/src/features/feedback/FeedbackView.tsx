import type { Feedback, FeedbackBlock } from '@tl/core';
import { fb } from '@/i18n/ru/feedback';
import { makePriceFormatter } from '@/chart/priceFormat';
import { Annotated } from '@/features/guide';
import { GradeGlyph } from './GradeGlyph';
import { placeOf, renderBlock } from './format';

export interface FeedbackViewProps {
  feedback: Feedback;
  /** Форматер цен символа; по умолчанию 2 знака. */
  fmtPrice?: (p: number) => string;
  /** Нажатие на ошибку с привязкой к меткам (например, показать на графике). */
  onFocusMarks?: (ids: string[]) => void;
  /** «N из M совпало»: число верных меток и размер эталона. */
  summary?: { matched: number; total: number };
  /** Содержимое «Итога» после основной строки: счётчики, модульная сводка. */
  verdictExtra?: React.ReactNode;
  /** После шести частей (например, легенда значков). */
  footer?: React.ReactNode;
  /** Не показывать раздел «Итог» (экран выводит свой вердикт, например терминал). */
  hideVerdict?: boolean;
  /** Свой текст блока раздела «Что понято верно» (терминал: без знаменателя эталона). */
  understoodText?: (b: FeedbackBlock) => string;
  className?: string;
}

const defaultFmt = makePriceFormatter(0.01);

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      data-testid={`fb-${id}`}
      className="border-b border-border py-3 last:border-b-0"
    >
      <h3 id={id} className="mb-1 text-sm font-semibold">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Разбор из 6 частей: итог, понято верно, ошибки, почему, как правильно, принцип (ALGORITHMS §17.1). */
export function FeedbackView({
  feedback,
  fmtPrice = defaultFmt,
  onFocusMarks,
  summary,
  hideVerdict,
  understoodText,
  verdictExtra,
  footer,
  className,
}: FeedbackViewProps) {
  const text = (b: FeedbackBlock) => renderBlock(b.templateKey, b.params, fmtPrice);
  const list = (blocks: FeedbackBlock[], testId: string, textOf: (b: FeedbackBlock) => string = text) => (
    <ul data-testid={testId} className="space-y-2">
      {blocks.map((b, i) => (
        <li key={`${b.templateKey}-${i}`} className="flex items-start gap-2 text-sm">
          <span className="mt-0.5 shrink-0">
            <GradeGlyph kind={b.glyph} />
          </span>
          {b.markIds?.length && onFocusMarks ? (
            <button
              type="button"
              onClick={() => onFocusMarks(b.markIds!)}
              className="min-h-11 cursor-pointer text-left"
            >
              {textOf(b)}
            </button>
          ) : (
            <span>
              <Annotated text={textOf(b)} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
  /** Одинаковые объяснения (по тексту) показываются один раз со списком мест. */
  const dedup = (blocks: FeedbackBlock[], testId: string) => {
    const groups = new Map<string, { block: FeedbackBlock; places: string[] }>();
    for (const b of blocks) {
      const t = text(b);
      const g = groups.get(t) ?? { block: b, places: [] };
      const pl = placeOf(b.params);
      if (pl && !g.places.includes(pl)) g.places.push(pl);
      groups.set(t, g);
    }
    return (
      <ul data-testid={testId} className="space-y-2">
        {[...groups.entries()].map(([t, g]) => (
          <li key={t} className="flex items-start gap-2 text-sm">
            <GradeGlyph kind="info" />
            <span>
              <Annotated text={t} />
              {g.places.length > 0 && (
                <span className="text-text-2">
                  {' '}
                  {fb.where}: {g.places.join(', ')}.
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    );
  };
  return (
    <div className={className} data-testid="feedback-view">
      {!hideVerdict && (
        <Section id="fb-verdict" title={fb.verdict}>
          <p className="text-sm font-medium">{text(feedback.verdict)}</p>
          {summary && (
            <p className="text-sm text-text-2" data-testid="fb-summary">
              {fb.summary(summary.matched, summary.total)}
            </p>
          )}
          {verdictExtra}
        </Section>
      )}
      <Section id="fb-understood" title={fb.understood}>
        {feedback.understood.length ? (
          list(feedback.understood, 'fb-understood-list', understoodText)
        ) : (
          <p className="text-sm text-text-2">{fb.noMatches}</p>
        )}
      </Section>
      <Section id="fb-mistakes" title={fb.mistakes}>
        {feedback.mistakes.length ? (
          list(feedback.mistakes, 'fb-mistakes-list')
        ) : (
          <p className="text-sm text-text-2">{fb.noMistakes}</p>
        )}
      </Section>
      <Section id="fb-why" title={fb.why}>
        {feedback.why.length ? (
          dedup(feedback.why, 'fb-why-list')
        ) : (
          <p className="text-sm text-text-2">—</p>
        )}
      </Section>
      <Section id="fb-howto" title={fb.howTo}>
        {feedback.howTo.length ? (
          dedup(feedback.howTo, 'fb-howto-list')
        ) : (
          <p className="text-sm text-text-2">—</p>
        )}
      </Section>
      <Section id="fb-principle" title={fb.principle}>
        <p className="text-sm">
          <Annotated text={text(feedback.principle)} />
        </p>
      </Section>
      {footer}
    </div>
  );
}
