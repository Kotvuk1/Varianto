'use client';
import { guide, type IntroKey } from '@/i18n/ru/guide';
import { BottomSheet, Button } from '@/ui';
import { Annotated } from './terms';

export interface TaskIntroProps {
  introKey: IntroKey;
  open: boolean;
  onClose: () => void;
  onNever: () => void;
}

/** Шторка-интро типа задания: что сделать, как выглядит верный ответ, как оценивается. */
export function TaskIntro({ introKey, open, onClose, onNever }: TaskIntroProps) {
  const t = guide.intros[introKey];
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t.title}
      height="full"
      footer={
        <div className="flex w-full flex-col gap-2 lg:flex-row-reverse">
          <Button variant="primary" size="lg" className="flex-1" onClick={onClose} data-testid="intro-ok">
            {guide.intro.ok}
          </Button>
          <Button variant="ghost" size="lg" className="flex-1" onClick={onNever} data-testid="intro-never">
            {guide.intro.never}
          </Button>
        </div>
      }
    >
      <div data-testid="task-intro" className="space-y-4 pb-2 text-sm">
        <section>
          <h3 className="mb-1 font-semibold">{guide.intro.whatTitle}</h3>
          <p className="text-text-2">
            <Annotated text={t.what} />
          </p>
        </section>
        <section>
          <h3 className="mb-1 font-semibold">{guide.intro.correctTitle}</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-text-2">
            {t.correct.map((c) => (
              <li key={c}>
                <Annotated text={c} />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 font-semibold">{guide.intro.gradedTitle}</h3>
          <p className="text-text-2">
            <Annotated text={t.graded} />
          </p>
        </section>
      </div>
    </BottomSheet>
  );
}
