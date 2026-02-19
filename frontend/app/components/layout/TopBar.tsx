'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { subscribeQuotes } from '@/app/lib/events';

type Role = 'admin' | 'fixpoint';

export default function TopBar({ role }: { role: Role }) {
  const { role: authRole, logout } = useAuth();
  const user = authRole || '';

  const [count, setCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [shake, setShake] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const effectiveRole = role || authRole;

  /* ======================
     LOAD NOTIFICATIONS PRO (polling backup)
  ====================== */
  useEffect(() => {
    if (!effectiveRole) return;

    let interval: any;

    const load = async () => {
      try {
        const urls =
          effectiveRole === 'admin'
            ? ['/api/quotes', '/api/admin/valuations']
            : ['/api/fixpoint/quotes', '/api/fixpoint/valuations'];

        const results = await Promise.all(
          urls.map(async (path) => {
            const data = await apiFetch(path);
            return data || [];
          })
        );

        const [q, v] = results;

        const newQuotes = q.filter((i: any) => i.status === 'NEW').length;
        const newVals = v.filter((i: any) => i.status === 'NEW').length;

        const total = newQuotes + newVals;

        if (total > lastCountRef.current) {
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }

        lastCountRef.current = total;
        setCount(total);
      } catch (err) {
        console.error(err);
      }
    };

    load();
    interval = setInterval(load, 15000);


    return () => clearInterval(interval);
  }, [effectiveRole]);

  /* ======================
     LIVE PUSH NOTIFICHE
  ====================== */
  useEffect(() => {
    const unsubscribe = subscribeQuotes(async () => {
      if (!effectiveRole) return;

      try {
        const urls =
          effectiveRole === 'admin'
            ? ['/api/quotes', '/api/admin/valuations']
            : ['/api/fixpoint/quotes', '/api/fixpoint/valuations'];

        const results = await Promise.all(
          urls.map(async (path) => {
            const data = await apiFetch(path);
            return data || [];
          })
        );

        const [q, v] = results;

        const newQuotes = q.filter((i: any) => i.status === 'NEW').length;
        const newVals = v.filter((i: any) => i.status === 'NEW').length;

        const total = newQuotes + newVals;

        if (total > lastCountRef.current) {
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }

        lastCountRef.current = total;
        setCount(total);
      } catch (err) {
        console.error(err);
      }
    });

    return unsubscribe;
  }, [effectiveRole]);

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

  const handleLogout = () => {
    logout();
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
          <span className="text-sm text-gray-600 capitalize">{user}</span>
        </div>

        {showUser && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg p-2 z-50">
            <button
              onClick={handleLogout}
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
