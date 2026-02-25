'use client';

import { useRouter } from 'next/navigation';

export default function ConfermaPreventivoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">

        {/* ICONA SUCCESSO */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">
            ✓
          </div>
        </div>

        {/* TITOLO */}
        <h1 className="text-2xl font-bold text-gray-900">
          Preventivo inviato con successo
        </h1>

        {/* TESTO */}
        <p className="text-gray-600">
          La tua richiesta è stata inviata correttamente.
          Il centro FixPoint selezionato riceverà il preventivo
          e potrà contattarti a breve.
        </p>

        {/* INFO */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          Non hai nessun obbligo di accettare.
          Il preventivo è gratuito.
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={() => router.replace('/preventivo')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Nuovo preventivo
          </button>

          <button
            onClick={() => router.replace('/preventivo')}
            className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Torna alla home
          </button>
        </div>

      </div>
    </div>
  );
}
