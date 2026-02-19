'use client';

import { useEffect, useState } from 'react';

/* =======================
   TIPI
======================= */
type QuoteStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

type Quote = {
  id: number;
  model: string;
  repair: string;
  city: string;
  price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: QuoteStatus;
};

const API_URL = 'http://localhost:3001';

/* =======================
   PAGINA
======================= */
export default function FixPointDashboardPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixpointId, setFixpointId] = useState<number | null>(null);

  /* =======================
     RECUPERO FIXPOINT_ID
  ======================= */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;

      const user = JSON.parse(raw);
      if (user?.fixpoint_id) {
        setFixpointId(user.fixpoint_id);
      }
    } catch (e) {
      console.error('Errore lettura user', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================
     LOAD PREVENTIVI
  ======================= */
  const load = async (fpId: number) => {
    setLoading(true);
    const res = await fetch(
      `${API_URL}/api/fixpoint/quotes?fixpoint_id=${fpId}`
    );
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    if (fixpointId) load(fixpointId);
  }, [fixpointId]);

  /* =======================
     UPDATE STATO
  ======================= */
  const updateStatus = async (id: number, status: 'IN_PROGRESS' | 'DONE') => {
    const res = await fetch(`${API_URL}/api/quotes/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Errore aggiornamento stato');
      return;
    }

    if (fixpointId) load(fixpointId);
  };

  /* =======================
     RENDER
  ======================= */
  if (loading) return <div>Caricamento…</div>;
  if (!fixpointId) return <div>FixPoint non riconosciuto</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">I tuoi lavori</h1>

      {items.length === 0 ? (
        <p>Nessun preventivo assegnato</p>
      ) : (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Dispositivo</th>
              <th className="p-2 text-left">Riparazione</th>
              <th className="p-2 text-left">Prezzo</th>
              <th className="p-2 text-left">Stato</th>
              <th className="p-2 text-left">Azioni</th>
            </tr>
          </thead>

          <tbody>
            {items.map(q => (
              <tr key={q.id} className="border-b">
                <td className="p-2">
                  <strong>{q.customer_name}</strong><br />
                  {q.customer_email}<br />
                  {q.customer_phone || '—'}
                </td>

                <td className="p-2">{q.model}</td>
                <td className="p-2">{q.repair}</td>
                <td className="p-2">€ {q.price}</td>

                <td className="p-2">
                  {q.status === 'DONE' ? (
                    <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">
                      Chiuso
                    </span>
                  ) : (
                    <select
                      value={q.status}
                      onChange={(e) =>
                        updateStatus(
                          q.id,
                          e.target.value as 'IN_PROGRESS' | 'DONE'
                        )
                      }
                    >
                      {q.status === 'NEW' && (
                        <option value="NEW" disabled>
                          Nuovo
                        </option>
                      )}
                      <option value="IN_PROGRESS">In lavorazione</option>
                      <option value="DONE">Chiuso</option>
                    </select>
                  )}
                </td>

                <td className="p-2">
                  <a
                    href={`${API_URL}/api/quotes/${q.id}/pdf`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Scarica PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
