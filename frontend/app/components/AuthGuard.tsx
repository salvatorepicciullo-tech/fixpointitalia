'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'fixpoint';
};

export default function AuthGuard({ children, allowedRole }: Props) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // ❌ NON LOGGATO
    if (!token) {
      router.replace('/fixpoint/login');
      return;
    }

    // ❌ RUOLO SBAGLIATO
    if (allowedRole && role !== allowedRole) {
      router.replace('/fixpoint/login');
      return;
    }

    // ✅ OK
    setChecking(false);
  }, [allowedRole, router]);

  if (checking) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}