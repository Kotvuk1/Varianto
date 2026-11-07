import { Suspense } from 'react';
import { PaSessionScreen } from '@/features/price-action/PaSessionScreen';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaSessionScreen />
    </Suspense>
  );
}
