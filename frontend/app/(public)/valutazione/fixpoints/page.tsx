'use client';
export const dynamic = 'force-dynamic';

import { apiFetch } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type FixPoint = {
  id: number;
  name: string;
  address?: string;
  city?: string;
  distance?: number;
};

export default function FixpointsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const modelName = params.get('model_name') || '';
  const brandName = params.get('brand_name') || '';
  const city = params.get('city');
  const color = params.get('color') || '';
  const repairIdsParam = params.get('repairIds');

  const repairIds = repairIdsParam
    ? repairIdsParam.split(',').map(Number)
    : [];

  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [repairNames, setRepairNames] = useState<string[]>([]);

  /* =======================
     LOAD FIXPOINTS
  ======================= */
  useEffect(() => {
    if (!city) return;

    const loadFixpoints = async () => {
      try {
        // geocoding città
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
        );

        const geoData = await geo.json();

        if (!geoData.length) {
          setFixpoints([]);
          return;
        }

        const lat = geoData[0].lat;
        const lng = geoData[0].lon;

        // API backend
       const res = await apiFetch(
  `/api/fixpoints/nearby?lat=${lat}&lng=${lng}`
);

        const data = await res.json();

        setFixpoints(Array.isArray(data) ? data : []);

        if (Array.isArray(data) && data.length > 0) {
          setSelected(data[0].id);
        }
      } catch (err) {
        console.error('Errore caricamento fixpoints', err);
        setFixpoints([]);
      } finally {
        setLoading(false);
      }
    };

    loadFixpoints();
  }, [city]);

  /* =======================
     LOAD REPAIR NAMES
  ======================= */
  useEffect(() => {
    if (repairIds.length === 0) return;

    apiFetch('/api/repairs')
      .then(r => r.json())
      .then((all: { id: number; name: string }[]) => {
        const names = all
          .filter(r => repairIds.includes(r.id))
          .map(r => r.name);

        setRepairNames(names);
      });
  }, [repairIds]);

  /* =======================
     CONTINUA
  ======================= */
  const goNext = () => {
    if (!selected) return;

    const selectedFixpoint = fixpoints.find(f => f.id === selected);
    if (!selectedFixpoint) return;

    const qs = new URLSearchParams(params.toString());

    qs.set('fixpointId', String(selectedFixpoint.id));
    qs.set('fixpointName', selectedFixpoint.name);

    router.push(`/valutazione/riepilogo?${qs.toString()}`);
  };

  /* =======================
     UI
  ======================= */
  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Scegli il centro FixPoint più vicino a te
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Seleziona il centro FixPoint dove desideri ricevere la valutazione del tuo dispositivo.
          </p>
        </div>
      </div>

      {/* CONTENUTO */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">

          <h1 className="text-2xl font-bold text-center">
            Seleziona il centro FixPoint che valuterà il tuo dispositivo
          </h1>

          {/* DISPOSITIVO */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-500 mb-1">
              Dispositivo selezionato
            </p>
            <p className="font-medium text-gray-800">
              {brandName} {modelName}
              {color && ` – ${color}`}
            </p>
          </div>

          {loading && (
            <p className="text-center text-gray-500">
              Ricerca centri vicini…
            </p>
          )}

          {!loading && fixpoints.length === 0 && (
            <p className="text-center text-red-500">
              Nessun centro disponibile nella tua città
            </p>
          )}

          {!loading && fixpoints.length > 0 && (
            <div className="space-y-4">
              {fixpoints.map(fp => {
                const active = selected === fp.id;

                return (
                  <button
                    key={fp.id}
                    onClick={() => setSelected(fp.id)}
                    className={`w-full rounded-2xl p-6 text-left transition flex items-center justify-between
                    ${active
                        ? 'bg-blue-50 border-2 border-blue-600 shadow'
                        : 'bg-white border border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* 🔐 Nome centro nascosto */}
                      <div className="font-semibold text-gray-900">
                        FixPoint Autorizzato
                      </div>

                      {fp.distance !== undefined && (
                        <div className="text-xs text-blue-600 mt-1">
                          📍 {Number(fp.distance).toFixed(1)} km da te
                        </div>
                      )}
                    </div>

                    {active && (
                      <div className="text-blue-600 font-semibold">
                        Selezionato
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-end pt-6 mt-6 border-t">
            <button
              onClick={goNext}
              disabled={!selected}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              Continua
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
