import { Suspense } from 'react';
import { TerminalScreen } from '@/features/terminal/TerminalScreen';

export default function TerminalPage() {
  return (
    <Suspense fallback={null}>
      <TerminalScreen />
    </Suspense>
  );
}
