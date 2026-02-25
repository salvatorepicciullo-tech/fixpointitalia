'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

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

  const city = params.get('city');

  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* =================================================
     🔥 GPS INTELLIGENTE REALE + FALLBACK
  ================================================== */
  useEffect(() => {

    if (!city) return;

    const loadFixpoints = async (lat:number, lng:number) => {

      try {

        const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/fixpoints/nearby?lat=${lat}&lng=${lng}`,
  {
    cache: 'no-store'
  }
);

        const data = await res.json();

        setFixpoints(Array.isArray(data) ? data : []);

        if (Array.isArray(data) && data.length > 0) {
          setSelected(data[0].id);
        }

      } catch(err) {

        console.error('Errore caricamento fixpoints', err);
        setFixpoints([]);

      } finally {

        setLoading(false);

      }
    };

    const fallbackCity = async () => {

      try {

        console.log('📍 fallback città');

        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
        );

        const geoData = await geo.json();

        if (!geoData.length) {
          setFixpoints([]);
          setLoading(false);
          return;
        }

        loadFixpoints(geoData[0].lat, geoData[0].lon);

      } catch(err) {

        console.log('Errore fallback città', err);
        setLoading(false);

      }
    };

    /* ===============================
       🚀 GPS INTELLIGENTE VERO
    =============================== */
    if ('geolocation' in navigator) {

      navigator.geolocation.getCurrentPosition(

        (pos) => {

          const { latitude, longitude, accuracy } = pos.coords;

          console.log('📍 GPS accuracy:', accuracy);

          // ⭐ SOLO SE PRECISO
          if (accuracy && accuracy < 2000) {

            console.log('📍 GPS reale usato');
            loadFixpoints(latitude, longitude);

          } else {

            console.log('📍 GPS poco preciso → fallback città');
            fallbackCity();
          }
        },

        () => {

          console.log('📍 GPS negato → fallback città');
          fallbackCity();

        },

        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0
        }
      );

    } else {

      fallbackCity();
    }

  }, [city]);

  /* =================================================
     CONTINUA
  ================================================== */
  const goNext = () => {

    if (!selected) return;

    const selectedFixpoint = fixpoints.find(f => f.id === selected);
    if (!selectedFixpoint) return;

    const qs = new URLSearchParams(params.toString());

    qs.set('fixpointId', String(selectedFixpoint.id));
    qs.set('fixpointName', selectedFixpoint.name);
    qs.set('otherBrand', params.get('otherBrand') || '');
    router.push(`/preventivo/riepilogo?${qs.toString()}`);
  };

  /* =================================================
     UI
  ================================================== */
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto text-center relative z-10">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Scegli il centro FixPoint più vicino a te
          </h1>

          <p className="text-lg text-gray-600">
            Mostriamo i centri più vicini alla tua posizione.
          </p>

        </div>
      </div>

      <div className="bg-white py-20 px-4">

        <div className="max-w-3xl mx-auto space-y-4">

          {loading && (
            <p className="text-center text-gray-500">
              Ricerca centri vicini…
            </p>
          )}

          {!loading && fixpoints.map(fp => {

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

          <div className="flex justify-end pt-6">
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
