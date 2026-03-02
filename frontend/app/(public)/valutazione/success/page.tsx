'use client';

import { useRouter } from 'next/navigation';

export default function SuccessPage() {

  const router = useRouter();

  return (
    <div className="
      min-h-screen
      bg-gradient-to-b from-blue-50 via-sky-50 to-white
      flex items-center justify-center
      px-4 py-16
    ">

      <div className="
        max-w-xl w-full
        bg-white rounded-3xl shadow-xl
        p-8 text-center space-y-6
        animate-[fadeIn_.25s_ease]
      ">

        {/* ICONA SUCCESSO */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <span className="text-green-600 text-5xl">✓</span>
        </div>

        {/* TITOLO */}
        <h1 className="text-3xl font-bold text-gray-800">
          Valutazione inviata con successo
        </h1>

        {/* TESTO */}
        <p className="text-gray-600">
          Abbiamo ricevuto la tua richiesta.
          <br />
          Un centro FixPoint analizzerà la valutazione e potrà contattarti a breve.
        </p>

        {/* INFO BOX */}
        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
          Non hai nessun obbligo di accettare. La valutazione è gratuita.
        </div>

        {/* BOTTONI */}
        <div className="space-y-3 pt-2">

          <button
            onClick={() => router.push('/valutazione')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition"
          >
            Nuova valutazione
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full border rounded-xl py-4 text-gray-700 hover:bg-gray-50 transition"
          >
            Torna alla home
          </button>

        </div>

      </div>
    </div>
  );
}
