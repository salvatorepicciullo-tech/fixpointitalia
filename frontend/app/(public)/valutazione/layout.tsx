import type { ReactNode } from 'react';

export const metadata = {
  title: 'Valuta il tuo dispositivo | FixPoint',
  description:
    'Scopri subito il valore del tuo smartphone o dispositivo. Valutazione trasparente e immediata con FixPoint.',
};

export default function ValutazioneLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">

      {/* =======================
          HERO VALUTAZIONE
      ======================= */}
      <header className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-sky-500 text-white">
        {/* DECORAZIONI */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-32 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center space-y-6">
          <img
            src="/logo-fixpoint.png"
            alt="FixPoint"
            className="h-10 mx-auto"
          />

          <h1 className="text-4xl md:text-5xl font-extrabold">
            Valuta il tuo dispositivo
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-blue-100">
            Scopri in pochi passaggi il valore del tuo smartphone o dispositivo.
            Valutazione chiara, immediata e senza sorprese.
          </p>
        </div>
      </header>

      {/* =======================
          CONTENUTO PAGINA
      ======================= */}
      <main className="-mt-20 relative z-20">
        {children}
      </main>

      {/* =======================
          TRUST BAR
      ======================= */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '⚡', text: 'Valutazione immediata' },
            { icon: '🔒', text: 'Dati protetti' },
            { icon: '💶', text: 'Prezzi trasparenti' },
            { icon: '🏪', text: 'Centri certificati' },
          ].map((v, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-3xl">{v.icon}</div>
              <p className="font-medium text-gray-700">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =======================
          CTA FINALE
      ======================= */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Pronto a continuare?
          </h2>
          <p className="text-gray-600">
            Dopo la valutazione potrai scegliere il centro FixPoint più vicino a te.
          </p>
          <a
            href="/preventivo"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg transition"
          >
            Trova un centro FixPoint
          </a>
        </div>
      </section>

    </div>
  );
}
