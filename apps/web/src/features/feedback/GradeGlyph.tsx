import { CircleCheck, CircleDashed, CircleX, Info } from 'lucide-react';
import { fb } from '@/i18n/ru/feedback';

export type GlyphKind = 'match' | 'miss' | 'extra' | 'info';

const LABEL: Record<GlyphKind, string> = { match: fb.match, miss: fb.missed, extra: fb.extra, info: fb.info };

/** Состояние различается формой и подписью (галочка / пунктирный круг / крест), не цветом. */
export function GradeGlyph({ kind, size = 20 }: { kind: GlyphKind; size?: number }) {
  const p = { size, strokeWidth: 1.75, 'aria-hidden': true } as const;
  const icon = kind === 'match' ? <CircleCheck {...p} /> : kind === 'miss' ? <CircleDashed {...p} /> : kind === 'extra' ? <CircleX {...p} /> : <Info {...p} />;
  return (
    <span className="inline-flex shrink-0 items-center" data-glyph={kind}>
      {icon}
      <span className="sr-only">{LABEL[kind]}</span>
    </span>
  );
}
