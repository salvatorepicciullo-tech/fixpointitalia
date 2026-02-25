'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import TopBar from '@/app/components/layout/TopBar';
import Sidebar from '@/app/components/layout/Sidebar';

export default function FixPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isLogin = pathname === '/fixpoint/login';

  useEffect(() => {
    if (isLogin) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'fixpoint') {
      router.replace('/fixpoint/login');
    }
  }, [pathname]);

  /* 🔥 SE LOGIN → PAGINA PULITA */
  if (isLogin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {children}
      </div>
    );
  }

  /* 🔥 DASHBOARD NORMALE */
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar role="fixpoint" />

      <div className="flex-1 flex flex-col">
        <TopBar role="fixpoint" />

        <main className="p-8 relative z-0">

          {children}
        </main>
      </div>
    </div>
  );
}
