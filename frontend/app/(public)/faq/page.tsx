export default function FAQPage() {
  const faqs = [
    {
      question: "Come funziona la richiesta di preventivo?",
      answer:
        "Seleziona il tuo dispositivo, indica il problema riscontrato e trova il centro assistenza più vicino. Il preventivo è gratuito e non vincolante.",
    },
    {
      question: "Il preventivo è gratuito?",
      answer:
        "Sì, la richiesta di preventivo è completamente gratuita e senza alcun obbligo di accettazione.",
    },
    {
      question: "Quanto tempo richiede una riparazione?",
      answer:
        "La maggior parte delle riparazioni viene completata entro poche ore. I tempi possono variare in base al modello del dispositivo e alla disponibilità dei ricambi.",
    },
    {
      question: "Che tipo di ricambi vengono utilizzati?",
      answer:
        "I ricambi possono essere originali oppure compatibili di alta qualità, in base alla disponibilità o alla richiesta del cliente. La tipologia viene sempre comunicata in modo trasparente prima dell'intervento.",
    },
    {
      question: "È prevista una garanzia sui ricambi sostituiti?",
      answer:
        "Sì, sui ricambi sostituiti è prevista una garanzia di 3 mesi sul corretto funzionamento del componente installato.",
    },
    {
      question: "Cosa copre la garanzia di 3 mesi?",
      answer:
        "La garanzia copre eventuali difetti di funzionamento del ricambio installato. Non copre danni causati da urti, cadute, infiltrazioni di liquidi, manomissioni o utilizzo improprio del dispositivo.",
    },
    {
      question: "Cosa non è coperto dalla garanzia?",
      answer:
        "Non sono coperti danni accidentali successivi alla riparazione, rotture causate da cadute, danni da liquidi o interventi effettuati da terzi non autorizzati.",
    },
    {
      question: "Come funziona la valutazione del dispositivo?",
      answer:
        "Inserisci le informazioni richieste sul tuo dispositivo e ricevi una stima immediata del valore. Il processo è semplice, veloce e senza impegno.",
    },
    {
      question: "La valutazione è vincolante?",
      answer:
        "No, puoi decidere liberamente se accettare o meno la proposta ricevuta.",
    },
    {
      question: "FixPoint effettua direttamente le riparazioni?",
      answer:
        "FixPoint è una piattaforma che mette in contatto gli utenti con centri assistenza selezionati e qualificati presenti sul territorio.",
    },
    {
      question: "I miei dati personali sono al sicuro?",
      answer:
        "Sì. Tutte le informazioni vengono trattate nel rispetto della normativa vigente in materia di protezione dei dati personali.",
    },
    {
      question: "Posso annullare la richiesta?",
      answer:
        "Sì, puoi interrompere il processo in qualsiasi momento prima di confermare il servizio, senza alcun costo.",
    },
  ];

  return (
    <div className="bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-28">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
            Domande frequenti
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Tutto quello che devi sapere su preventivi, valutazioni e garanzie.
          </p>
        </div>

        {/* FAQ LIST */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group border border-gray-200 rounded-2xl p-6 transition hover:shadow-md"
            >
              <summary className="cursor-pointer text-lg font-medium text-gray-900 list-none flex justify-between items-center">
                {faq.question}
                <span className="ml-4 transition group-open:rotate-45 text-xl">
                  +
                </span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

      </section>
    </div>
  );
}