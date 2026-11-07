import { Suspense } from 'react';
import { CurSessionScreen } from '@/features/curriculum/CurSessionScreen';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CurSessionScreen module="limit-entry" />
    </Suspense>
  );
}
