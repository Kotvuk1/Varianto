'use client';

import { ru } from '@/i18n/ru';
import { ContinueBlock, HomeWeakSpots } from '../home/HomeBlocks';
import { DailyGoal } from '../progress/DailyGoal';
import { CourseSection } from './CourseSection';

const SECTION = 'border-b border-border py-4 lg:border-b-0';

/** Главная: раздел «Обучение» (LAYOUTS §1). Данные только из Repository, без выдуманных значений. */
export function LearnScreen() {
  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col px-4 pb-6 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:pt-4">
      <h1 className="sr-only">{ru.nav.learn}</h1>

      <ContinueBlock />

      <section aria-labelledby="weak-h" className={`${SECTION} order-3 lg:order-4 lg:col-span-3 lg:border-t`}>
        <h2 id="weak-h" className="mb-2 text-lg font-semibold">
          {ru.home.weakTitle}
        </h2>
        <HomeWeakSpots />
      </section>

      <section aria-labelledby="today-h" className={`${SECTION} order-4 lg:order-2 lg:col-span-1`}>
        <h2 id="today-h" className="sr-only">
          {ru.home.todayTitle}
        </h2>
        <DailyGoal />
      </section>

      <div className="order-2 lg:order-3 lg:col-span-3 lg:border-t lg:border-border">
        <CourseSection />
      </div>
    </div>
  );
}
