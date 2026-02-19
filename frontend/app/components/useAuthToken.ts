'use client';

import { useEffect, useState } from 'react';

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 🔥 legge il ruolo salvato
    const role = localStorage.getItem('role');

    // 🔥 prende il token giusto in base al ruolo
    const savedToken =
      role === 'admin'
        ? localStorage.getItem('admin_token')
        : localStorage.getItem('fixpoint_token');

    setToken(savedToken);
  }, []);

  return token;
}
