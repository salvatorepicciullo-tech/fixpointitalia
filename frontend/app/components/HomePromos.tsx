'use client';

import { useEffect, useState } from 'react';

type Promo = {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
};

export default function HomePromos() {

  const [promos, setPromos] = useState<Promo[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/promos`, {
          cache: 'no-store'
        });

        if (!res.ok) return;

        const data = await res.json();
        setPromos(data || []);
      } catch (e) {
        console.error('Errore promos', e);
      }
    };

    // primo caricamento
    load();

    // polling produzione LIVE
    const interval = setInterval(load, 5000);

    const refreshHandler = () => load();
    window.addEventListener('promo-updated', refreshHandler);

    const bc = new BroadcastChannel('fixpoint-promos');
    bc.onmessage = () => load();

    return () => {
      window.removeEventListener('promo-updated', refreshHandler);
      clearInterval(interval);
      bc.close();
    };

  }, []);

  if (!promos.length) return null;

  return (
    <section className="py-14">

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-2xl font-semibold mb-10 text-center">
          🔥 Offerte del momento
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-7">

          {promos.map(p => (

            <div
              key={p.id}
              className="
                group relative
                rounded-2xl overflow-hidden
                shadow-sm hover:shadow-xl
                transition-all duration-300
                bg-white
              "
            >

              {p.image_url && (
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">

                  <img
                    loading="lazy"
                    src={`${API}${p.image_url}`}
                    className="
                      w-full h-full
                      object-cover object-center
                      transition-transform duration-500
                      group-hover:scale-105
                    "
                  />

                  {/* overlay leggero PRO */}
                  <div className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-black/40 via-black/10 to-transparent
                    opacity-0 group-hover:opacity-100
                    transition
                  "/>

                </div>
              )}

              <div className="p-5">

                <div className="font-semibold text-lg leading-tight">
                  {p.title}
                </div>

                {p.description && (
                  <div className="text-gray-500 text-sm mt-1">
                    {p.description}
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}