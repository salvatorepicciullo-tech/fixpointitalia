import { Suspense } from 'react';
import DettaglioClient from './DettaglioClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DettaglioClient />
    </Suspense>
  );
}
