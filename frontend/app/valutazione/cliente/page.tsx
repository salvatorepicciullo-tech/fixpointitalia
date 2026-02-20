import { Suspense } from 'react';
import ClienteClient from './ClienteClient';

export default function Page() {
  return (
    <Suspense>
      <ClienteClient />
    </Suspense>
  );
}
