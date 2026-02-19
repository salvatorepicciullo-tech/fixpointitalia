import { Suspense } from 'react';
import ConfermaClient from './ConfermaClient';

export default function Page() {
  return (
    <Suspense>
      <ConfermaClient />
    </Suspense>
  );
}
