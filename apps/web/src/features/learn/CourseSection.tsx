'use client';
// Список «Обучение»: 8 ступеней курса и блок комбинированных модулей с замками (UI-only).
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { STAGE_MIN_ATTEMPTS } from '@tl/core';
import { COMBO_TEXT, STAGE_TEXT, learnCourse as lc } from '@/i18n/ru/curriculum';
import { useRepository } from '@/storage';
import { Badge, ProgressBar } from '@/ui';
import { ErrorState, LoadingRows } from '../common/StateBlock';
import { useLiveData } from '../progress/useLiveData';
import { buildCourse, STAGE_HREF, type ComboView, type CourseView, type Remaining, type StageView } from './courseLogic';

const ROW = 'flex min-h-14 items-center justify-between gap-3 border-b border-border py-3';

function StageRow({ s }: { s: StageView }) {
  const t = STAGE_TEXT[s.id];
  const p = s.progress;
  return (
    <li data-testid={`stage-${s.id}`} data-status={p.status} data-recommended={s.recommended ? 'true' : 'false'}>
      <Link href={s.href} className={`${ROW} hover:bg-surface-1`}>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="tnum text-xs text-text-2">{lc.stageLabel(s.id)}</span>
            <span className="text-sm font-medium">{t.title}</span>
            {s.recommended && <Badge variant="outline" className="text-text-1">{lc.recommended}</Badge>}
            {p.status === 'passed' && <Badge icon={<CheckCircle2 size={14} strokeWidth={1.75} aria-hidden />}>{lc.passed}</Badge>}
          </span>
          <span className="text-xs text-text-2">{t.text}</span>
          {p.status === 'not-started' ? (
            <span className="text-xs text-text-2" data-testid={`stage-${s.id}-progress`}>{lc.notStarted}</span>
          ) : (
            <>
              <ProgressBar value={Math.round(p.progress * 100)} max={100} label={lc.barLabel(t.title)} size="sm" className="max-w-64" />
              <span className="tnum text-xs text-text-2" data-testid={`stage-${s.id}-progress`}>
                {lc.progressLine(p.attempts, STAGE_MIN_ATTEMPTS, p.accuracy, p.fewData)}
              </span>
            </>
          )}
        </span>
        <ChevronRight size={20} strokeWidth={1.75} aria-hidden className="shrink-0" />
      </Link>
    </li>
  );
}

export function remainText(r: Remaining): string {
  const title = STAGE_TEXT[r.stage].title;
  if (r.attemptsLeft > 0 && r.needAccuracy) return lc.remainBoth(r.stage, title, r.attemptsLeft, r.accuracy);
  if (r.attemptsLeft > 0) return lc.remainTask(r.stage, title, r.attemptsLeft);
  return lc.remainAcc(r.stage, title, r.accuracy);
}

function ComboRow({ c }: { c: ComboView }) {
  const t = COMBO_TEXT[c.module];
  const body = (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{t.title}</span>
        {c.recommended && <Badge variant="outline" className="text-text-1">{lc.recommended}</Badge>}
        {!c.open && <Badge icon={<Lock size={14} strokeWidth={1.75} aria-hidden />}>{lc.locked}</Badge>}
      </span>
      <span className="text-xs text-text-2">{t.text}</span>
      {c.open && c.legacy && <span className="text-xs text-text-2">{lc.legacyOpen}</span>}
      {!c.open && (
        <span className="text-xs text-text-2" data-testid={`combo-${c.module}-remaining`}>
          {lc.unlockTitle}
          <ul className="mt-0.5 list-disc pl-4">
            {c.remaining.map((r) => (
              <li key={r.stage}>{remainText(r)}</li>
            ))}
          </ul>
        </span>
      )}
    </span>
  );
  return (
    <li data-testid={`combo-${c.module}`} data-locked={c.open ? 'false' : 'true'}>
      {c.open ? (
        <Link href={c.href} className={`${ROW} hover:bg-surface-1`}>
          {body}
          <ChevronRight size={20} strokeWidth={1.75} aria-hidden className="shrink-0" />
        </Link>
      ) : (
        <div aria-disabled="true" className={`${ROW} text-text-2`}>
          {body}
        </div>
      )}
    </li>
  );
}

export function CourseLists({ course }: { course: CourseView }) {
  return (
    <>
      <section aria-labelledby="course-h" className="py-4">
        <h2 id="course-h" className="text-lg font-semibold">{lc.title}</h2>
        <p className="mb-2 text-sm text-text-2">{lc.hint}</p>
        <ul aria-label={lc.listLabel} className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {course.stages.map((s) => (
            <StageRow key={s.id} s={s} />
          ))}
        </ul>
      </section>
      <section aria-labelledby="combo-h" className="py-4">
        <h2 id="combo-h" className="text-lg font-semibold">{lc.comboTitle}</h2>
        <p className="mb-2 text-sm text-text-2">{lc.comboHint}</p>
        <ul className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {course.combos.map((c) => (
            <ComboRow key={c.module} c={c} />
          ))}
        </ul>
        <p className="mt-2 text-xs text-text-2">{lc.lockNote}</p>
      </section>
    </>
  );
}

/** Загрузка попыток из Repository; при ошибке ступени остаются доступными без отметок прогресса. */
export function CourseSection() {
  const repo = useRepository();
  const load = useCallback(async () => buildCourse(await repo.listAttempts({ order: 'asc' })), [repo]);
  const state = useLiveData(load);
  if (state.status === 'loading') return <div className="py-4"><LoadingRows /></div>;
  if (state.status === 'error') {
    return (
      <div className="py-4">
        <ErrorState title={lc.loadError} text={lc.loadErrorText} onRetry={state.reload} />
        <ul className="mt-2">
          {(Object.keys(STAGE_HREF) as unknown as (keyof typeof STAGE_HREF)[]).map((id) => (
            <li key={id}>
              <Link href={STAGE_HREF[id]} className={`${ROW} text-sm`}>
                {lc.stageLabel(id)} · {STAGE_TEXT[id].title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <CourseLists course={state.data} />;
}

