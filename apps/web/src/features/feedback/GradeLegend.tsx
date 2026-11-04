import { CircleHelp } from 'lucide-react';
import { fb } from '@/i18n/ru/feedback';
import { GradeGlyph } from './GradeGlyph';

/** Легенда состояний разметки: совпало / пропущено / лишнее. */
export function GradeLegend({ className }: { className?: string }) {
  const items = [
    { kind: 'match', title: fb.match, help: fb.matchHelp },
    { kind: 'miss', title: fb.missed, help: fb.missedHelp },
    { kind: 'extra', title: fb.extra, help: fb.extraHelp },
  ] as const;
  return (
    <ul aria-label={fb.legend} data-testid="grade-legend" className={className}>
      {items.map((i) => (
        <li key={i.kind} className="flex items-center gap-2 py-1 text-sm text-text-2">
          <GradeGlyph kind={i.kind} />
          <span>
            <span className="font-medium text-text-1">{i.title}</span>: {i.help}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Компактная легенда: свёрнута под значком «?», раскрывается по нажатию. */
export function GradeLegendToggle({ className }: { className?: string }) {
  return (
    <details data-testid="grade-legend-toggle" className={className}>
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-2">
        <CircleHelp size={20} strokeWidth={1.75} aria-hidden />
        {fb.legendToggle}
      </summary>
      <GradeLegend />
    </details>
  );
}
