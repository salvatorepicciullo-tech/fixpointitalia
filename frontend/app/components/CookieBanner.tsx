'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fixpoint_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('fixpoint_cookie_consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('fixpoint_cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-6 z-[9999] shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="text-sm md:text-base">
          Utilizziamo cookie tecnici per migliorare l’esperienza di navigazione. 
          Leggi la nostra{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </div>

        <div className="flex gap-3">
          <button
            onClick={reject}
            className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition"
          >
            Rifiuta
          </button>

          <button
            onClick={accept}
            className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Accetta
          </button>
        </div>

      </div>
    </div>
  );
}