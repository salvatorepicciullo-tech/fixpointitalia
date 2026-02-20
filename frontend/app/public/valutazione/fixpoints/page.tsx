import { Suspense } from 'react';
import FixpointsClient from './FixpointsClient';

export default function Page() {
  return (
    <Suspense>
      <FixpointsClient />
    </Suspense>
  );
}
