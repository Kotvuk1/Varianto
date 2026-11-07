import { Suspense } from 'react';
import { ChallengeSession } from '@/features/challenge/ChallengeSession';

export default function ChallengeSessionPage() {
  return (
    <Suspense fallback={null}>
      <ChallengeSession />
    </Suspense>
  );
}
