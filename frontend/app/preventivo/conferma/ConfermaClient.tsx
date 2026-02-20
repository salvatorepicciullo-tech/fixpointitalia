'use client';
export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Quote = {
  id: number;
  model?: string;
  repair?: string;
  price?: number;
  city?: string;
  fixpoint_name?: string;
};

export default function ConfermaPreventivoPage() {

  const router = useRouter();
  const params = useSearchParams();
  const quoteId = params.get('quoteId');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  const API = process.env.NEXT_PUBLIC_API_URL;

  /* =======================
     LOAD QUOTE DAL DB
  ======================= */
  useEffect(() => {

    if (!quoteId) {
      setLoading(false);
      return;
    }

    fetch(`${API}/api/quotes/${quoteId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.id) setQuote(data);
      })
      .catch(err => console.error('Errore fetch quote:', err))
      .finally(() => setLoading(false));

  }, [quoteId, API]);

  /* =======================
     COUNTDOWN UX PRO
  ======================= */
  useEffect(() => {

    if (!quoteId) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);

  }, [quoteId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-[fadeIn_.4s_ease]">

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

        {loading && (
          <p className="text-gray-500 text-sm">
            Stiamo preparando i dettagli…
          </p>
        )}

        {/* CARD DETTAGLI LIVE */}
        {!loading && quote && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 border">

            {quote.fixpoint_name && (
              <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                Centro assegnato
              </div>
            )}

            {quote.model && (
              <div>📱 <strong>Dispositivo:</strong> {quote.model}</div>
            )}

            {quote.repair && (
              <div>🔧 <strong>Riparazioni:</strong> {quote.repair}</div>
            )}

            {quote.city && (
              <div>📍 {quote.city}</div>
            )}

            {quote.price !== undefined && (
              <div className="text-xl font-bold text-blue-600 mt-2">
                Totale € {quote.price}
              </div>
            )}

          </div>
        )}

        {/* TESTO */}
        <p className="text-gray-600 text-sm">
          Il centro FixPoint selezionato riceverà il preventivo e potrà contattarti a breve.
        </p>

        {/* COUNTDOWN UX */}
        {countdown > 0 && (
          <div className="text-xs text-gray-400">
            Puoi tornare alla home tra {countdown}s
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3">

          {quoteId && (
            <a
              href={`${API}/api/quotes/${quoteId}/pdf`}
              target="_blank"
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
            >
              Scarica PDF Preventivo
            </a>
          )}

          <button
            onClick={() => router.push('/preventivo')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Nuovo preventivo
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Torna alla home
          </button>

        </div>

      </div>
    </div>
  );
}
