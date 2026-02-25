'use client';

import { useState } from "react";

export default function FaqPage() {

  const faqs = [
    {
      q: "Quanto dura la garanzia sulle riparazioni?",
      a: "Tutte le riparazioni FixPoint includono 12 mesi di garanzia sui componenti sostituiti e sul lavoro effettuato."
    },
    {
      q: "Utilizzate ricambi originali o compatibili?",
      a: "Utilizziamo ricambi originali quando disponibili e compatibili premium certificati per garantire prestazioni e affidabilità."
    },
    {
      q: "Cosa copre la garanzia?",
      a: "La garanzia copre eventuali difetti del componente sostituito o problemi legati alla riparazione. Non copre danni accidentali successivi."
    },
    {
      q: "Quanto tempo richiede una riparazione?",
      a: "Molte riparazioni vengono completate anche in giornata. Alcuni interventi possono richiedere più tempo in base al dispositivo."
    },
    {
      q: "Come funziona il preventivo online?",
      a: "Seleziona dispositivo e problema, ricevi un prezzo indicativo e prenota direttamente presso un centro FixPoint."
    },
    {
      q: "Quali metodi di pagamento accettate?",
      a: "Accettiamo contanti, carta di credito/debito e altri metodi disponibili presso il centro assistenza."
    },
    {
      q: "Devo prenotare prima di andare in negozio?",
      a: "Consigliato ma non obbligatorio. Prenotando riduci i tempi di attesa."
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">

      <h1 className="text-3xl font-semibold mb-4">
        Domande frequenti
      </h1>

      <p className="text-gray-500 mb-10">
        Tutto quello che devi sapere sulle riparazioni FixPoint, garanzia e servizi.
      </p>

      <div className="space-y-4">

        {faqs.map((faq, i) => {

          const open = openIndex === i;

          return (
            <div
              key={i}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >

              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900">
                  {faq.q}
                </span>

                <span className={`transition ${open ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {open && (
                <div className="px-6 pb-5 text-gray-600">
                  {faq.a}
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* ⭐ FUTURO CONTATTO WHATSAPP */}
      <div className="mt-14 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-2">
            Non trovi la risposta?
          </h2>
          <p className="text-gray-600 text-sm">
            Presto potrai contattarci direttamente su WhatsApp per assistenza live.
          </p>
        </div>
      </div>

    </section>
  );
}