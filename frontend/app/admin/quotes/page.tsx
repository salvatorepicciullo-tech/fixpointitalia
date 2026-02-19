'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';
import QuoteCard from '../../components/QuoteCard';
import { apiFetch } from '@/app/lib/api';
import { subscribeQuotes } from '@/app/lib/events';
import { notifyQuotesUpdate } from '@/app/lib/events';

/* =======================
   TIPI DATI
======================= */

type FixPoint = {
  id: number;
  name: string;
};

type QuoteStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';

type Quote = {
  id: number;
  created_at: string;
  status: QuoteStatus;
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

const STATUSES: QuoteStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'DONE'];

/* =======================
   UTILS
======================= */

function renderStatusBadge(status: QuoteStatus) {
  switch (status) {
    case 'DONE':
      return (
        <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">
          Chiuso
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">
          In lavorazione
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full tracking-wide bg-blue-200 text-blue-800">
          Assegnato
        </span>
      );
    case 'NEW':
    default:
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 rounded">
          Nuovo
        </span>
      );
  }
}

/* =======================
   PAGINA
======================= */

export default function QuotesAdminPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [fixpointFilter, setFixpointFilter] = useState('');

  const loadingRef = useRef(false);
  const previousIds = useRef<number[]>([]);
  const [newItems, setNewItems] = useState<number[]>([]);

  const searchParams = useSearchParams();
  const urlStatus = searchParams.get('status') ?? '';

  /* =======================
     LOAD DATI PRO
  ======================= */
  const load = async () => {
    try {
      const [q, f] = await Promise.all([
        apiFetch('/api/quotes'),
        apiFetch('/api/fixpoints')
      ]);

      const incoming = q || [];

      // 🔥 rileva nuovi preventivi
      const ids = incoming.map((i: any) => i.id);
      const diff = ids.filter((id: number) => !previousIds.current.includes(id));

      if (diff.length > 0 && previousIds.current.length > 0) {
        setNewItems(diff);
        setTimeout(() => setNewItems([]), 2000);
      }

      previousIds.current = ids;
      setItems(incoming);
      setFixpoints(f || []);
    } catch (err) {
      console.error('Errore caricamento preventivi admin', err);
    }
  };

  /* =======================
     REALTIME POLLING
  ======================= */
  // 🔥 load iniziale (senza polling)
useEffect(() => {
  load();
}, []);


  useEffect(() => {
    if (urlStatus && STATUSES.includes(urlStatus as QuoteStatus)) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  // 🔥 ascolta aggiornamenti live (Event Bus)
useEffect(() => {
  const unsubscribe = subscribeQuotes(() => {
    load();
  });

  return unsubscribe;
}, []);


  /* =======================
     FILTRI
  ======================= */

  const STATUS_ORDER: Record<QuoteStatus, number> = {
    NEW: 1,
    IN_PROGRESS: 2,
    ASSIGNED: 3,
    DONE: 4
  };
const filteredItems = useMemo(() => {
  return items
    .filter((q) => {
      if (statusFilter && q.status !== statusFilter) return false;
      if (fixpointFilter && String(q.fixpoint_id ?? '') !== fixpointFilter)
        return false;
      return true;
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}, [items, statusFilter, fixpointFilter]);

  /* =======================
     AZIONI ADMIN PRO
  ======================= */

  const assignFixpoint = async (quoteId: number, fixpointId: number) => {
   await apiFetch(`/api/quotes/${quoteId}/assign`, {
  method: 'PUT',
  body: JSON.stringify({ fixpoint_id: fixpointId })
});
notifyQuotesUpdate();
load();

  };

  const reopenQuote = async (quoteId: number) => {
   await apiFetch(`/api/admin/quotes/${quoteId}/reopen`, {
  method: 'PUT'
});
notifyQuotesUpdate();
load();

  };

  const deleteQuote = async (quoteId: number) => {
    const ok = window.confirm(
      'Sei sicuro di voler eliminare definitivamente questo preventivo?'
    );
    if (!ok) return;

    const res = await apiFetch(`/api/quotes/${quoteId}`, {
      method: 'DELETE'
    });

    if (!res) {
      alert('Errore durante eliminazione preventivo');
      return;
    }
    notifyQuotesUpdate();
    load();
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div>
      <div className="mb-6 flex items-center justify-between sticky top-0 z-10 bg-gray-50/80 backdrop-blur py-3">
        <h1 className="text-2xl font-semibold tracking-tight">Preventivi</h1>

        <p className="text-sm text-gray-500">
          Gestisci e assegna i preventivi ai FixPoint.
        </p>

        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-semibold">
          {filteredItems.length} preventivi
        </span>
      </div>

      {/* FILTRI */}
      <div className="flex gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded-xl bg-white hover:bg-gray-50 transition"
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
          className="border px-3 py-2 rounded-xl bg-white hover:bg-gray-50 transition"
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
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {filteredItems.map((q) => (
          <QuoteCard
            key={q.id}
            q={q}
            isNew={newItems.includes(q.id)} // 🔥 ANIMAZIONE LIVE
            fixpoints={fixpoints}
            assignFixpoint={assignFixpoint}
            reopenQuote={reopenQuote}
            deleteQuote={deleteQuote}
            renderStatusBadge={renderStatusBadge}
          />
        ))}
      </div>
    </div>
  );
}
