'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import HomePromos from '@/app/components/HomePromos';

export default function HomePage() {

  /* ================= INSTALL APP ================= */
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e:any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
  };

  /* ================= RECENSIONI FAKE (poi google reali) ================= */
  const reviews = [
    "Riparazione velocissima! ⭐⭐⭐⭐⭐",
    "Preventivo preciso e chiaro ⭐⭐⭐⭐⭐",
    "Staff molto professionale ⭐⭐⭐⭐⭐",
    "Servizio super rapido ⭐⭐⭐⭐⭐",
    "Consigliatissimo ⭐⭐⭐⭐⭐",
  ];

  const [index,setIndex] = useState(0);

  useEffect(()=>{
    const i = setInterval(()=>{
      setIndex(prev => (prev+1)%reviews.length);
    },3000);
    return ()=>clearInterval(i);
  },[]);

  return (
    <div className="w-full">

      {/* ================= INSTALL APP BANNER ================= */}
      {deferredPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={installApp}
            className="bg-black text-white px-5 py-3 rounded-full shadow-xl animate-pulse"
          >
            📲 Installa FixPoint
          </button>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">

        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Ripara o valuta il tuo dispositivo in pochi minuti
          </h1>

          <p className="text-gray-500 mt-4 text-lg">
            Preventivi immediati, valutazioni rapide e centri certificati FixPoint in tutta Italia.
          </p>

          <div className="flex gap-4 mt-8 flex-wrap">

            <Link
              href="/preventivo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
            >
              Calcola Preventivo
            </Link>

            <Link
              href="/valutazione"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
            >
              Valuta Dispositivo
            </Link>

          </div>
        </div>
      </section>

      <HomePromos />

      {/* ================= PERCHÉ FIXPOINT ================= */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">

        <h2 className="text-3xl font-semibold">
          Tu chiedi, noi risolviamo.
        </h2>

        <p className="text-gray-500 mt-2 mb-10">
          Riparazioni rapide, sicure e trasparenti.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            ["⚡","Riparazione veloce","Pronta anche in 1 ora"],
            ["💶","Prezzo chiaro","Nessuna sorpresa finale"],
            ["🛡️","Garanzia 12 mesi","Componenti certificati"],
            ["👨‍🔧","Tecnici esperti","Centri verificati FixPoint"],
          ].map((c,i)=>(
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition text-center border">
              <div className="text-3xl mb-2">{c[0]}</div>
              <div className="font-semibold text-lg">{c[1]}</div>
              <div className="text-gray-500 text-sm mt-1">{c[2]}</div>
            </div>
          ))}
        </div>

      </section>

      {/* ================= COME FUNZIONA ================= */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-2">
            Riparato in 3 semplici passi
          </h2>

          <p className="text-gray-500 mb-10">
            Senza sorprese, tutto online.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition border">
              🔎 Calcola il preventivo
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition border">
              📅 Prenota la riparazione
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition border">
              📍 Passa in negozio
            </div>
          </div>

        </div>
      </section>

    {/* ================= RECENSIONI PRO ================= */}
<section className="max-w-6xl mx-auto px-6 py-16 text-center overflow-hidden">

  <h2 className="text-3xl font-semibold mb-10">
    ⭐ Recensioni clienti
  </h2>

  <div className="relative w-full overflow-hidden">

    <div className="flex gap-6 animate-scrollReviews">

      {[
        {name:"Marco R.",text:"Riparazione velocissima, consigliato!",stars:5},
        {name:"Giulia P.",text:"Preventivo chiaro e servizio top.",stars:5},
        {name:"Luca D.",text:"Staff super professionale.",stars:5},
        {name:"Francesca M.",text:"Telefono tornato come nuovo!",stars:5},
        {name:"Andrea T.",text:"Prezzi onesti e tempi rapidi.",stars:5},
      ].concat([
        {name:"Marco R.",text:"Riparazione velocissima, consigliato!",stars:5},
        {name:"Giulia P.",text:"Preventivo chiaro e servizio top.",stars:5},
        {name:"Luca D.",text:"Staff super professionale.",stars:5},
        {name:"Francesca M.",text:"Telefono tornato come nuovo!",stars:5},
        {name:"Andrea T.",text:"Prezzi onesti e tempi rapidi.",stars:5},
      ]).map((r,i)=>(

        <div key={i} className="min-w-[280px] bg-white rounded-2xl p-6 shadow-lg border text-left">

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
              {r.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-yellow-500 text-sm">
                {"⭐".repeat(r.stars)}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            {r.text}
          </p>

        </div>

      ))}

    </div>

  </div>

</section>

    </div>
  );
}