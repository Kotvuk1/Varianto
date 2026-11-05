import { Suspense } from 'react';
import { FibSessionScreen } from '@/features/fibonacci/FibSessionScreen';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FibSessionScreen />
    </Suspense>
  );
}
