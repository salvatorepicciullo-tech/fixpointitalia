'use client';

import Sidebar from '@/app/components/layout/Sidebar';
import TopBar from '@/app/components/layout/TopBar';
import AuthGuard from '../components/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRole="admin">
      <div className="flex min-h-screen bg-gray-100">

        {/* SIDEBAR GLOBALE */}
        <Sidebar role="admin" />

        {/* AREA CONTENUTO */}
        <div className="flex-1 flex flex-col">

          {/* TOPBAR CON NOTIFICHE */}
          <TopBar role="admin" />

          {/* CONTENUTO PAGINE */}
          <main className="p-8">
            {children}
          </main>

        </div>
      </div>
    </AuthGuard>
  );
}
