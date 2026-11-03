import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { ru } from '@/i18n/ru';
import { Button } from '@/ui';

/** Пустое состояние: заголовок, текст, действие. Без иллюстраций и цвета. */
export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 py-2">
      <h3 className="text-base font-semibold">{title}</h3>
      {text && <p className="text-sm text-text-2">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Ошибка загрузки данных экрана: иконка, заголовок, причина и «Повторить». */
export function ErrorState({ title, text, onRetry }: { title?: string; text?: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2 py-2">
      <TriangleAlert size={24} strokeWidth={1.75} aria-hidden />
      <h3 className="text-lg font-semibold">{title ?? ru.states.errorTitle}</h3>
      <p className="text-sm text-text-2">{text ?? ru.states.errorText}</p>
      <Button variant="secondary" className="mt-2" onClick={onRetry}>
        {ru.actions.retry}
      </Button>
    </div>
  );
}

/** Скелетон строк списка (без анимации блеска). */
export function LoadingRows({ rows = 3, rowHeight = 'h-14' }: { rows?: number; rowHeight?: string }) {
  return (
    <div aria-busy="true" aria-label={ru.states.loading} className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`${rowHeight} rounded-sm bg-surface-2`} />
      ))}
    </div>
  );
}
