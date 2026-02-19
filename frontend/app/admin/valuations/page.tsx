'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

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
  useEffect(() => {
    const load = async () => {
      const data = await apiFetch('/api/admin/valuations');
      if (Array.isArray(data)) setItems(data);
      setLoading(false);
    };

    load();
  }, []);

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
        body: JSON.stringify({ status }),
      }
    );

    if (!res) {
      alert('Errore aggiornamento stato');
      return;
    }

    setItems(prev =>
      prev.map(v => (v.id === id ? { ...v, status } : v))
    );
  };

  /* =======================
     DELETE
  ======================= */
  const deleteValuation = async (id: number) => {

    const ok = confirm(
      'Eliminare definitivamente questa valutazione?'
    );
    if (!ok) return;

    const res = await apiFetch(
      `/api/admin/valuations/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!res) {
      alert('Errore eliminazione valutazione');
      return;
    }

    setItems(prev => prev.filter(v => v.id !== id));
  };

  /* =======================
     CREATE QUOTE
  ======================= */
  const createQuote = async (id: number) => {

    const data = await apiFetch(
      `/api/admin/valuations/${id}/create-quote`,
      {
        method: 'POST',
      }
    );

    if (!data) {
      alert('Errore creazione preventivo');
      return;
    }

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
            <div key={v.id} className="border rounded-2xl bg-white px-5 py-4">
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold">{v.model}</div>
                <div className="bg-blue-50 px-4 py-2 text-xl font-semibold text-blue-600 rounded-xl">
                  € {final}
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div>👤 {v.customer_name}</div>
                <div>📍 {v.city}</div>
                <div>✉️ {v.customer_email}</div>
                <div>📞 {v.customer_phone}</div>
              </div>

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
                  <option value="IN_CONTACT">Contattato</option>
                  <option value="CLOSED">Chiusa</option>
                </select>

                {v.status !== 'CLOSED' && (
                  <button
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm"
                    onClick={() => createQuote(v.id)}
                  >
                    Crea preventivo
                  </button>
                )}

                <button
                  className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-sm"
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
