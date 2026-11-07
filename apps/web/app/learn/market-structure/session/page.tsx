import { Suspense } from 'react';
import { MsSessionScreen } from '@/features/market-structure/MsSessionScreen';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MsSessionScreen />
    </Suspense>
  );
}
