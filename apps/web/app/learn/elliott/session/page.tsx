import { Suspense } from 'react';
import { ElliottSessionScreen } from '@/features/elliott/ElliottSessionScreen';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ElliottSessionScreen />
    </Suspense>
  );
}
