import { Suspense } from 'react';
import DettaglioClient from './DettaglioClient';

export default function Page() {
  return (
    <Suspense>
      <DettaglioClient />
    </Suspense>
  );
}
