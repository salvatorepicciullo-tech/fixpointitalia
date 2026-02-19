import { Suspense } from 'react';
import RiepilogoClient from './RiepilogoClient';

export default function Page() {
  return (
    <Suspense>
      <RiepilogoClient />
    </Suspense>
  );
}
