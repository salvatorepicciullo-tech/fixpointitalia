'use client';
import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

type Quote = {
  id: number;
  created_at: string;
  status: string;
  price: number;
  city: string;
  model: string;
  repair: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
};

// SIMULAZIONE LOGIN FIXPOINT
const FIXPOINT_ID = 1;

export default function FixPointQuotesPage() {
  const [items, setItems] = useState<Quote[]>([]);

  const load = async () => {
    const res = await fetch(
      `/api/fixpoint/quotes/${FIXPOINT_ID}`
    );
    setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (quoteId: number, status: string) => {
    await apiFetch(`/api/quotes/${quoteId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, role: 'fixpoint' }),
    });

    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        I miei preventivi
      </h1>

      <div className="space-y-4">
        {items.map((q) => {
          const locked = q.status === 'CLOSED';

          return (
            <div key={q.id} className="border rounded bg-white p-4">
              <div className="flex justify-between mb-2">
                <div className="font-semibold">
                  {q.model} – {q.repair}
                </div>
                <div className="font-bold">€ {q.price}</div>
              </div>

              <div className="text-sm">
                👤 {q.customer_name} – {q.customer_email}
              </div>

              {q.customer_phone && (
                <div className="text-sm">📞 {q.customer_phone}</div>
              )}

              <div className="text-sm">📍 {q.city}</div>

              <div className="mt-4">
                <select
                  className="border px-2 py-1 rounded"
                  value={q.status}
                  disabled={locked}
                  onChange={(e) =>
                    changeStatus(q.id, e.target.value)
                  }
                >
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="READY">READY</option>
                </select>

                {locked && (
                  <span className="ml-3 text-red-600 text-sm font-semibold">
                    CHIUSO
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Creato: {q.created_at}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
