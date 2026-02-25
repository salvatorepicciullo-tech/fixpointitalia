'use client';
import { API } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/* =======================
   TIPI DATI
======================= */

type FixPoint = {
  id: number;
  name: string;
};

type Quote = {
  id: number;
  created_at: string;
  status: 'NEW' | 'ASSIGNED' | 'DONE';
  price: number;
  city: string;
  model: string;
  repair: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  fixpoint_id?: number | null;
  color?: string;
};

/* =======================
   COSTANTI
======================= */

const API_URL = API;
const STORAGE_KEY = 'admin_preventivi_filters';

const STATUSES: Quote['status'][] = ['NEW', 'ASSIGNED', 'DONE'];

const STATUS_STYLE: Record<Quote['status'], string> = {
  NEW: 'bg-gray-200 text-gray-800',
  ASSIGNED: 'bg-orange-200 text-orange-800',
  DONE: 'bg-green-200 text-green-800',
};

const STATUS_ORDER: Record<Quote['status'], number> = {
  NEW: 1,
  ASSIGNED: 2,
  DONE: 3,
};

const HIGH_PRICE = 150;

/* =======================
   UTILS
======================= */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('it-IT');

/* =======================
   COMPONENT
======================= */

export default function PreventiviAdminPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [fixpointFilter, setFixpointFilter] = useState('');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const urlStatus = searchParams.get('status') ?? '';

  /* =======================
     LOAD DATI
  ======================= */
  const load = async () => {
    try {
      const [qRes, fRes] = await Promise.all([
        fetch(`${API_URL}/api/quotes`),
        fetch(`${API_URL}/api/fixpoints`),
      ]);
      if (!qRes.ok || !fRes.ok) return;
      setItems(await qRes.json());
      setFixpoints(await fRes.json());
    } catch (err) {
      console.error('Errore caricamento preventivi admin', err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =======================
     RIPRISTINO FILTRI
  ======================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const f = JSON.parse(saved);
      setStatusFilter(f.status ?? '');
      setFixpointFilter(f.fixpoint ?? '');
      setSearch(f.search ?? '');
    }
  }, []);

  useEffect(() => {
    if (urlStatus && STATUSES.includes(urlStatus as Quote['status'])) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  /* =======================
     SALVATAGGIO FILTRI
  ======================= */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        status: statusFilter,
        fixpoint: fixpointFilter,
        search,
      })
    );
  }, [statusFilter, fixpointFilter, search]);

  /* =======================
     FILTRI + ORDINE
  ======================= */
  const filteredItems = items
    .filter((q) => {
      if (statusFilter && q.status !== statusFilter) return false;
      if (fixpointFilter && String(q.fixpoint_id ?? '') !== fixpointFilter)
        return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${q.customer_name} ${q.customer_email} ${q.city}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        (STATUS_ORDER[a.status] ?? 99) -
        (STATUS_ORDER[b.status] ?? 99)
    );

  /* =======================
     AZIONI ADMIN
  ======================= */

  const assignFixpoint = async (quoteId: number, fixpointId: number) => {
    setSavingId(quoteId);
    await fetch(`${API_URL}/api/quotes/${quoteId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixpoint_id: fixpointId }),
    });
    setItems((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? { ...q, fixpoint_id: fixpointId, status: 'ASSIGNED' }
          : q
      )
    );
    setSavingId(null);
  };

  const changeStatus = async (quoteId: number, status: Quote['status']) => {
    setSavingId(quoteId);
    await fetch(`${API_URL}/api/quotes/${quoteId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, role: 'admin' }),
    });
    setItems((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status } : q))
    );
    setSavingId(null);
  };

  const deleteQuote = async (quoteId: number) => {
    const ok = window.confirm(
      'Sei sicuro di voler eliminare definitivamente questo preventivo?'
    );
    if (!ok) return;
    const res = await fetch(`${API_URL}/api/quotes/${quoteId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert('Errore durante eliminazione preventivo');
      return;
    }
    setItems((prev) => prev.filter((q) => q.id !== quoteId));
  };

  const resetFilters = () => {
    setStatusFilter('');
    setFixpointFilter('');
    setSearch('');
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Preventivi</h1>
        <button
          onClick={resetFilters}
          className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
        >
          ♻️ Reset filtri
        </button>
      </div>

      {/* FILTRI */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tutti gli stati</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={fixpointFilter}
          onChange={(e) => setFixpointFilter(e.target.value)}
        >
          <option value="">Tutti i FixPoint</option>
          {fixpoints.map((f) => (
            <option key={f.id} value={String(f.id)}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          className="border px-3 py-2 rounded flex-1 min-w-[220px]"
          placeholder="Cerca cliente / email / città…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 && (
        <div className="text-gray-500 text-sm">
          Nessun preventivo trovato con i filtri selezionati
        </div>
      )}

      {/* LISTA */}
      <div className="space-y-4">
        {filteredItems.map((q) => {
          const locked = q.status === 'DONE';
          const highlight = q.price >= HIGH_PRICE;

          return (
            <div
              key={q.id}
              className={`border rounded bg-white p-4 ${
                highlight ? 'ring-2 ring-yellow-300' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">
                  {q.model}
                  {q.color ? ` (${q.color})` : ''} – {q.repair}
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded font-semibold ${
                    STATUS_STYLE[q.status]
                  }`}
                >
                  {q.status}
                </span>
              </div>

              <div className="text-sm text-gray-700">
                👤 {q.customer_name} – {q.customer_email}
              </div>

              {q.customer_phone && (
                <div className="text-sm">📞 {q.customer_phone}</div>
              )}

              <div className="text-sm">📍 {q.city}</div>

              <div className="font-bold mt-2">
                € {q.price}{' '}
                {highlight && (
                  <span className="text-xs text-yellow-700 ml-2">
                    ⭐ valore alto
                  </span>
                )}
              </div>

              <div className="flex gap-4 mt-4 items-center flex-wrap">
                <select
                  className="border px-2 py-1 rounded"
                  disabled={locked}
                  value={q.fixpoint_id ?? ''}
                  onChange={(e) =>
                    assignFixpoint(q.id, Number(e.target.value))
                  }
                >
                  <option value="">Assegna FixPoint</option>
                  {fixpoints.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <select
                  className="border px-2 py-1 rounded"
                  disabled={locked}
                  value={q.status}
                  onChange={(e) =>
                    changeStatus(q.id, e.target.value as Quote['status'])
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {savingId === q.id && (
                  <span className="text-xs text-blue-600">
                    Salvataggio…
                  </span>
                )}

                <button
                  onClick={() => deleteQuote(q.id)}
                  className="text-sm text-red-600 underline"
                >
                  Elimina
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Creato: {formatDate(q.created_at)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
