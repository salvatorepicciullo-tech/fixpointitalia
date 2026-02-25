'use client';

import { apiFetch } from '@/lib/apiFetch';
import { useEffect, useState, useRef } from 'react';

type Role = 'admin' | 'fixpoint';

export default function TopBar({ role }: { role: Role }) {
  const [count, setCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [user, setUser] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [shake, setShake] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  /* ======================
     LOAD USER SAFE SSR
  ====================== */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUser(localStorage.getItem('role') || '');
    }
  }, []);

  /* ======================
     LOAD NOTIFICATIONS
  ====================== */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const load = async () => {
      try {

        const urls =
          role === 'admin'
            ? ['/api/quotes', '/api/admin/valuations']
            : ['/api/fixpoint/quotes', '/api/fixpoint/valuations'];

        const results = await Promise.all(
          urls.map(async (u) => {
            const res = await apiFetch(u, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return [];
            return res.json();
          })
        );

        const [q, v] = results;

        const newQuotes = q.filter((i: any) => i.status === 'NEW').length;
        const newVals = v.filter((i: any) => i.status === 'NEW').length;

        const total = newQuotes + newVals;

        if (total > lastCount) {
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }

        setLastCount(total);
        setCount(total);
      } catch (err) {
        console.error(err);
      }
    };

    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [role, lastCount]);

  /* ======================
     CLICK OUTSIDE CLOSE
  ====================== */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (!userRef.current?.contains(e.target as Node)) {
        setShowUser(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href =
      role === 'admin' ? '/login' : '/fixpoint/login';
  };

  return (
    <div className="h-14 bg-white border-b flex items-center justify-end px-6 gap-6 relative">

      {/* 🔔 NOTIFICHE */}
      <div ref={notifRef} className="relative">
        <div
          onClick={() => setShowNotif(!showNotif)}
          className={`text-xl cursor-pointer transition ${
            shake ? 'animate-bounce' : ''
          }`}
        >
          🔔
        </div>

        {count > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}

        {showNotif && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-3 text-sm z-50">
            {count === 0 ? (
              <p className="text-gray-400">Nessuna notifica</p>
            ) : (
              <p className="text-gray-700">
                Hai {count} elementi nuovi
              </p>
            )}
          </div>
        )}
      </div>

      {/* 👤 USER MENU */}
      <div ref={userRef} className="relative">
        <div
          onClick={() => setShowUser(!showUser)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
            {user.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-600 capitalize">
            {user}
          </span>
        </div>

        {showUser && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg p-2 z-50">
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}