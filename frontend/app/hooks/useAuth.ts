'use client';

import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawUser = localStorage.getItem('user');
    const rawRole = localStorage.getItem('role');

    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        setUser(null);
      }
    }

    setRole(rawRole);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return { user, role, logout };
}
