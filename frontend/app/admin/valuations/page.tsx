'use client';

import { apiFetch } from '@/lib/api'
import { useEffect, useMemo, useState, useCallback } from 'react';

type ValuationStatus = 'NEW' | 'SEEN' | 'IN_CONTACT' | 'CLOSED';

type Valuation = {
  id: number;
  city: string;
  status: ValuationStatus;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  model: string;
  fixpoint?: string | null;
  max_value?: number;
  total_penalty?: number;
  defects?: string;
};



export default function AdminValuationsPage() {
  const [items, setItems] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] =
    useState<'ALL' | ValuationStatus>('ALL');
  const [filterCity, setFilterCity] =
    useState<'ALL' | string>('ALL');

  /* =======================
   LOAD DATA
======================= */
const load = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await apiFetch('/api/admin/valuations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    setItems(data || []);
  } catch (err) {
    console.error('Errore caricamento valutazioni', err);
  } finally {
    setLoading(false);
  }
}, []);
useEffect(() => {

  load(); // primo caricamento

  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      load();
    }
  }, 5000);

  return () => clearInterval(interval);

}, [load]);
  /* =======================
     UPDATE STATUS
  ======================= */
const updateStatus = async (
  id: number,
  status: ValuationStatus
) => {
  const res = await apiFetch(
    `/api/admin/valuations/${id}/status`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    alert('Errore aggiornamento stato');
    return;
  }

  setItems(prev =>
    prev.map(v => (v.id === id ? { ...v, status } : v))
  );
};  /* =======================
     DELETE
  ======================= */
const deleteValuation = async (id: number) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const res = await apiFetch(
    `/api/admin/valuations/${id}`,
    { method: 'DELETE' }
  );

  if (!res.ok) {
    alert('Errore eliminazione valutazione');
    return;
  }

  setItems(prev => prev.filter(v => v.id !== id));
};

  /* =======================
     CREATE QUOTE
  ======================= */
 const createQuote = async (id: number) => {
  const res = await apiFetch(
    `/api/admin/valuations/${id}/create-quote`,
    { method: 'POST' }
  );

  if (!res.ok) {
    alert('Errore creazione preventivo');
    return;
  }

  const data = await res.json();
  alert(`Preventivo creato (#${data.quote_id})`);

  setItems(prev =>
    prev.map(v =>
      v.id === id ? { ...v, status: 'CLOSED' } : v
    )
  );
};

  /* =======================
     FILTERS
  ======================= */
  const cities = useMemo(
    () => Array.from(new Set(items.map(i => i.city))).sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter(v => {
      if (filterStatus !== 'ALL' && v.status !== filterStatus)
        return false;
      if (filterCity !== 'ALL' && v.city !== filterCity)
        return false;
      return true;
    });
  }, [items, filterStatus, filterCity]);

  if (loading) return <p>Caricamento…</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Valutazioni
        </h1>
        <p className="text-sm text-gray-500">
          Gestisci le richieste di permuta.
        </p>
      </div>

      {/* FILTRI */}
      <div className="flex gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded-xl bg-white hover:bg-gray-50"
          value={filterStatus}
          onChange={e =>
            setFilterStatus(
              e.target.value as 'ALL' | ValuationStatus
            )
          }
        >
          <option value="ALL">Tutti gli stati</option>
          <option value="NEW">Nuove</option>
          <option value="SEEN">Viste</option>
          <option value="IN_CONTACT">Contattate</option>
          <option value="CLOSED">Chiuse</option>
        </select>

        <select
          className="border px-3 py-2 rounded-xl bg-white hover:bg-gray-50"
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
        >
          <option value="ALL">Tutte le città</option>
          {cities.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {filteredItems.map(v => {
          const final =
            (v.max_value || 0) - (v.total_penalty || 0);

          const defectList = v.defects
            ? v.defects.split(',').map(d => {
                const [name, penalty] = d.split('|');
                return { name, penalty };
              })
            : [];

          return (
            <div
              key={v.id}
              className={`group relative border rounded-2xl bg-white px-5 py-4
              transition-all duration-200 hover:shadow-lg hover:-translate-y-[2px]
              ${
                v.status === 'NEW'
                  ? 'border-l-4 border-l-blue-500'
                  : v.status === 'IN_CONTACT'
                  ? 'border-l-4 border-l-yellow-500'
                  : 'border-l-4 border-l-gray-400'
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-[15px]">
                  {v.model}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xl font-semibold text-blue-600">
                  € {final}
                </div>
              </div>

              {/* INFO */}
              <div className="text-sm text-gray-600 space-y-1">
                <div>👤 {v.customer_name}</div>
                <div>📍 {v.city}</div>
                <div>✉️ {v.customer_email}</div>
                <div>📞 {v.customer_phone}</div>

                <div className="mt-2">
                  FixPoint:{' '}
                  {v.fixpoint ? (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      {v.fixpoint}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                      Non assegnato
                    </span>
                  )}
                </div>
              </div>

              {/* BOX VALORE */}
              <div className="mt-3 text-sm bg-gray-50/70 border rounded-xl p-3">
                <div>Valore massimo: € {v.max_value || 0}</div>
                <div>
                  Penalità totali: - € {v.total_penalty || 0}
                </div>

                {defectList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {defectList.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                      >
                        {d.name} -€{d.penalty}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AZIONI */}
              <div className="flex gap-3 mt-4 items-center">
                <select
                  className="border px-3 py-1.5 rounded-xl bg-white"
                  value={v.status}
                  onChange={e =>
                    updateStatus(
                      v.id,
                      e.target.value as ValuationStatus
                    )
                  }
                >
                  <option value="NEW">Nuova</option>
                  <option value="SEEN">Vista</option>
                  <option value="IN_CONTACT">
                    Contattato
                  </option>
                  <option value="CLOSED">Chiusa</option>
                </select>

                {v.status !== 'CLOSED' && (
                  <button
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
                    onClick={() => createQuote(v.id)}
                  >
                    Crea preventivo
                  </button>
                )}

                <button
                  className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600"
                  onClick={() => deleteValuation(v.id)}
                >
                  Elimina
                </button>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Creato: {v.created_at}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
