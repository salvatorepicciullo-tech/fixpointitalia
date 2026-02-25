'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

type Valuation = {
  id: number;
  model: string;
  city: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;

  max_value?: number;
  estimated_value?: number;
  final_value?: number;

  defects?: string;
};

export default function FixpointValuations() {
  const [items, setItems] = useState<Valuation[]>([]);

  /* ===============================
   LOAD VALUTAZIONI FIXPOINT
================================ */
const load = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await apiFetch(`/api/fixpoint/valuations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
  } catch (e) {
    console.error('Errore load valutazioni fixpoint', e);
  }
};

useEffect(() => {

  load(); // primo caricamento

  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      load();
    }
  }, 5000);

  return () => clearInterval(interval);

}, []);


  /* ===============================
   CAMBIO STATO (LIVE DB)
================================ */
const changeStatus = async (id: number, status: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await apiFetch(`/api/fixpoint/valuations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) return;

    // 🔥 IMPORTANTISSIMO: ricarica come preventivi
    load();

  } catch (e) {
    console.error('Errore cambio stato valuation', e);
  }
};
  /* ===============================
     RENDER
  ================================ */
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Valutazioni assegnate
      </h1>

      {items.length === 0 && (
        <div className="bg-white p-4 rounded shadow text-gray-600">
          Nessuna valutazione assegnata
        </div>
      )}

      {items.map(v => {
        const max = v.max_value ?? 0;
        const final = v.final_value ?? v.estimated_value ?? 0;
        const penalty = Math.max(0, max - final);

        /* ✅ PARSING DIFETTI */
        const defectList = v.defects
          ? v.defects.split(',').map(d => {
              const [name, penalty] = d.split('|');
              return { name, penalty };
            })
          : [];

        return (
          <div
            key={v.id}
            className={`group relative border rounded-2xl bg-white px-5 py-4 mb-4
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

            {/* INFO CLIENTE */}
            <div className="text-sm text-gray-600 space-y-1">
              <div>👤 {v.customer_name}</div>
              <div>📍 {v.city}</div>
              <div>✉️ {v.customer_email}</div>
              <div>📞 {v.customer_phone}</div>
            </div>

            {/* DETTAGLI VALUTAZIONE */}
            <div className="mt-3 text-sm bg-gray-50/70 border rounded-xl p-3">
              <div>Valore massimo: € {max}</div>
              <div>Penalità totali: - € {penalty}</div>
              <div className="font-semibold">
                Valore stimato: € {final}
              </div>

              {/* BADGE DIFETTI */}
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

            {/* STATO */}
            <div className="mt-3">
              <select
                className="border px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 transition"
                value={v.status}
                onChange={e => changeStatus(v.id, e.target.value)}
              >
                {v.status === 'NEW' && (
                  <>
                    <option value="NEW">Nuovo</option>
                    <option value="IN_CONTACT">Presa in carico</option>
                  </>
                )}

                {v.status === 'IN_CONTACT' && (
                  <>
                    <option value="IN_CONTACT">Presa in carico</option>
                    <option value="CLOSED">Chiusa</option>
                  </>
                )}

                {v.status === 'CLOSED' && (
                  <option value="CLOSED">Chiusa</option>
                )}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
