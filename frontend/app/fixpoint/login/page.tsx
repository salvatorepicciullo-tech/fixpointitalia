'use client';
import { apiFetch } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';



export default function FixPointLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenziali non valide');
        setLoading(false);
        return;
      }

      // 🚫 BLOCCO ADMIN E UTENTI NON FIXPOINT
      if (data.user.role !== 'fixpoint' || !data.user.fixpoint_id) {
        setError('Accesso riservato ai FixPoint');
        setLoading(false);
        return;
      }

      // ✅ SESSIONE
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('fixpoint_id', data.user.fixpoint_id);

      router.push('/fixpoint/dashboard');
    } catch (e) {
      console.error(e);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* 🔵 LOGO FIXPOINT PRO */}
        <div className="flex justify-center mb-6 animate-[fadeIn_.5s_ease]">
          <div className="flex items-center gap-3">

            <div
              className="
              w-10 h-10 rounded-full
              bg-blue-600 text-white
              flex items-center justify-center
              font-bold text-lg shadow-md
              animate-[logoSpinIn_.45s_ease]
              "
            >
              F
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              FixPoint
            </h1>

          </div>
        </div>

        <h2 className="text-center text-lg font-semibold mb-6">
          Accesso FixPoint
        </h2>

        <input
          className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && (
          <div className="text-red-600 text-sm mb-3 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full bg-blue-600 text-white py-2 rounded-lg
            hover:bg-blue-700 transition
            disabled:opacity-50
          "
        >
          {loading ? 'Accesso…' : 'Accedi'}
        </button>

      </div>
    </div>
  );
}
