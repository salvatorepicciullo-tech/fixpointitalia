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
      router.replace('/login');
      return;
    }

    // ❌ RUOLO SBAGLIATO
    if (allowedRole && role !== allowedRole) {
      router.replace('/login');
      return;
    }

    // ✅ OK
    setChecking(false);

  }, [allowedRole, router]);


  // 🔒 BLOCCA RENDER FINCHÉ NON VERIFICA
  if (checking) return null;

  return <>{children}</>;
}
