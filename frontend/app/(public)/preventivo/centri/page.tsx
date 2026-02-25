'use client';

export const dynamic = 'force-dynamic';
import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* =======================
   TIPI
======================= */
type FixPoint = {
  id: number;
  name: string;
  address?: string;
  city?: string;
};

export default function CentriPage() {
  const router = useRouter();
  const params = useSearchParams();

  /* =======================
     PARAMS DAL PREVENTIVO
  ======================= */
  const deviceTypeId = params.get('deviceTypeId');
  const brandId = params.get('brandId');
  const modelId = params.get('modelId');
  const repairIds = params.get('repairIds');
  const color = params.get('color');
  const city = params.get('city');

  /* =======================
     STATE
  ======================= */
  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [selectedFixpoint, setSelectedFixpoint] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /* =======================
     LOAD FIXPOINTS
  ======================= */
  useEffect(() => {
    if (!city) return;

    setLoading(true);

    apiFetch(`/api/fixpoints?city=${city}`)
      .then(r => r.json())
      .then(data => {
        setFixpoints(Array.isArray(data) ? data : []);
      })
      .catch(() => setFixpoints([]))
      .finally(() => setLoading(false));
  }, [city]);

  /* =======================
     INVIO PREVENTIVO
  ======================= */
  const submitQuote = async () => {
    if (
      !deviceTypeId ||
      !brandId ||
      !modelId ||
      !repairIds ||
      !city ||
      !selectedFixpoint
    ) {
      return;
    }

    setSending(true);

    try {
      const res = await apiFetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_type_id: Number(deviceTypeId),
          brand_id: Number(brandId),
          model_id: Number(modelId),
          repair_ids: repairIds.split(',').map(Number),
          color: color || null,
          city,
          fixpoint_id: selectedFixpoint,
          status: 'NEW',
        }),
      });

      if (!res.ok) throw new Error('Errore invio preventivo');

      // 👉 pagina conferma (la creiamo dopo)
      router.push('/preventivo/conferma');
    } catch (err) {
      alert('Errore durante l’invio del preventivo');
    } finally {
      setSending(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Seleziona il centro di assistenza
        </h1>

        {loading && (
          <p className="text-center text-gray-500">Caricamento centri…</p>
        )}

        {!loading && fixpoints.length === 0 && (
          <p className="text-center text-red-500">
            Nessun centro disponibile nella tua città
          </p>
        )}

        <div className="space-y-3">
          {fixpoints.map(fp => {
            const active = selectedFixpoint === fp.id;

            return (
              <button
                key={fp.id}
                onClick={() => setSelectedFixpoint(fp.id)}
                className={`w-full border rounded p-4 text-left ${
                  active
                    ? 'border-blue-600 bg-blue-50'
                    : 'hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">{fp.name}</div>
                {fp.address && (
                  <div className="text-sm text-gray-600">{fp.address}</div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={submitQuote}
          disabled={!selectedFixpoint || sending}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:opacity-40"
        >
          {sending ? 'Invio in corso…' : 'Invia preventivo'}
        </button>

      </div>
    </div>
  );
}
