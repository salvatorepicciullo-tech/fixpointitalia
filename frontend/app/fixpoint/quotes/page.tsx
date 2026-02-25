'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ===============================
   TIPI
================================ */
type Quote = {
  id: number;
  model: string;
  repair: string;
  city: string;
  price: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';
  description?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
};

/* ===============================
   COMPONENTE
================================ */
export default function FixPointQuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /* ===============================
     FETCH PREVENTIVI (STABILE)
  ================================ */
  const fetchQuotes = async (silent = false) => {
    if (!silent) setLoading(true);

    const fixpointId = localStorage.getItem('fixpoint_id');
    const token = localStorage.getItem('token');

    if (!fixpointId || !token) {
      router.push('/fixpoint/login');
      return;
    }

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(
        `${API}/api/fixpoint/quotes?fixpoint_id=${fixpointId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      setQuotes(data || []);
    } catch (e) {
      console.error('Errore fetch preventivi', e);
    }

    if (!silent) setLoading(false);
  };

  /* ===============================
     INIT + LIVE POLLING (FIXED)
  ================================ */
  useEffect(() => {
    fetchQuotes(); // primo caricamento

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchQuotes(true); // aggiornamento silenzioso
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ===============================
     CAMBIO STATO
  ================================ */
  const changeStatus = async (quoteId: number, status: string) => {
    if (updatingId) return;

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/fixpoint/login');
      return;
    }

    setUpdatingId(quoteId);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(
        `${API}/api/quotes/${quoteId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || 'Errore aggiornamento stato');
        setUpdatingId(null);
        return;
      }

      fetchQuotes(true);
    } catch (e) {
      console.error(e);
      alert('Errore rete');
    }

    setUpdatingId(null);
  };

  /* ===============================
     DOWNLOAD PDF
  ================================ */
  const downloadPDF = (quoteId: number) => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    window.open(`${API}/api/quotes/${quoteId}/pdf`, '_blank');
  };

  /* ===============================
     LABEL STATO
  ================================ */
  const statusLabel = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'Nuovo';
      case 'IN_PROGRESS':
        return 'In lavorazione';
      case 'DONE':
        return 'Chiuso';
      default:
        return status;
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        I miei preventivi
      </h1>

      {loading && <p>Caricamento...</p>}

      {!loading && quotes.length === 0 && (
        <div className="bg-white p-4 rounded-xl border text-gray-600">
          Nessun preventivo assegnato
        </div>
      )}

      {!loading && quotes.length > 0 && (
        <div className="space-y-4">
          {quotes.map(q => (
            <div
              key={q.id}
              className={`border rounded-2xl bg-white px-5 py-4 shadow-sm
              ${
                q.status === 'ASSIGNED'
                  ? 'border-l-4 border-l-blue-500'
                  : q.status === 'IN_PROGRESS'
                  ? 'border-l-4 border-l-yellow-500'
                  : q.status === 'DONE'
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-[15px]">
                    {q.model && q.repair ? (
                      <>
                        {q.model} – {q.repair}
                      </>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-800 mt-2">
                        📝 {q.description}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-700">
                    👤 {q.customer_name}
                    {q.customer_email && (
                      <span className="text-gray-500"> – {q.customer_email}</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    📞 {q.customer_phone}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xl font-semibold text-blue-600">
                  € {q.price}
                </div>
              </div>

              <div className="mt-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    q.status === 'DONE'
                      ? 'bg-green-100 text-green-700'
                      : q.status === 'IN_PROGRESS'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {statusLabel(q.status)}
                </span>
              </div>

              <div className="flex gap-4 pt-3 border-t mt-3">
                <button
                  onClick={() => downloadPDF(q.id)}
                  className="text-blue-600 text-sm hover:underline cursor-pointer"
                >
                  📄 Scarica PDF
                </button>

                {q.status === 'ASSIGNED' && (
                  <button
                    onClick={() => changeStatus(q.id, 'IN_PROGRESS')}
                    className="text-yellow-600 text-sm hover:underline cursor-pointer"
                  >
                    ▶ In lavorazione
                  </button>
                )}

                {q.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => changeStatus(q.id, 'DONE')}
                    className="text-green-600 text-sm hover:underline cursor-pointer"
                  >
                    ✔ Chiudi lavoro
                  </button>
                )}

                {q.status === 'DONE' && (
                  <span className="text-xs text-gray-400">
                    completato
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Creato: {q.created_at}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}