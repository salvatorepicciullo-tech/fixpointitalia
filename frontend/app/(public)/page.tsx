import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white">

  {/* HERO */}
<section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
  <div className="max-w-6xl mx-auto px-6 pt-36 pb-28 text-center">

    <div className="inline-block mb-6 px-4 py-2 text-sm bg-black text-white rounded-full">
      Piattaforma digitale per riparazioni & valutazioni
    </div>

    <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 leading-tight">
      Ripara o Valuta il tuo Smartphone
      <br />
      <span className="text-black">in meno di 2 minuti</span>
    </h1>

    <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto">
      Preventivo immediato online. Senza impegno.
      Assistenza qualificata vicino a te.
    </p>

    <div className="mt-6 text-sm text-gray-500">
      ⭐ 4.9 su Google • 320+ recensioni verificate • Processo 100% digitale
    </div>

  </div>
</section>

      {/* SEZIONE SCELTA PRINCIPALE */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid gap-10 md:grid-cols-2">





        {/* PREVENTIVO */}
<Link
  href="/preventivo"
  className="group relative rounded-3xl p-12 bg-white border border-gray-200 shadow-md hover:shadow-2xl hover:border-black transition-all duration-500 hover:-translate-y-2 transition-all duration-500 hover:-translate-y-2"
>
  <div className="space-y-6">
    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold">
      🔧
    </div>

    <h2 className="text-3xl font-semibold text-gray-900">
      Calcola il Preventivo
    </h2>

    <p className="text-gray-600 text-lg leading-relaxed">
      Scopri il prezzo della riparazione in meno di 2 minuti
      e trova il centro assistenza più vicino a te.
    </p>

    <span className="inline-block pt-4 text-black font-medium group-hover:underline">
      Calcola il Preventivo →
    </span>
  </div>
</Link>



         {/* VALUTAZIONE */}
<Link
  href="/valutazione"
  className="group relative rounded-3xl p-12 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
>
  <div className="space-y-6">
    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold">
      💰
    </div>

    <h2 className="text-3xl font-semibold text-gray-900">
      Valuta il tuo Dispositivo
    </h2>

    <p className="text-gray-600 text-lg leading-relaxed">
      Ricevi una stima immediata del valore del tuo dispositivo
      usato in pochi semplici passaggi.
    </p>

    <span className="inline-block pt-4 text-black font-medium group-hover:underline">
      Scopri Quanto Vale →
    </span>
  </div>
</Link>

        </div>
      </section>


    {/* COME FUNZIONA */}
<section className="py-20 bg-white border-t border-gray-100">
  <div className="max-w-6xl mx-auto px-6 text-center">

    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
      Come funziona
    </h2>

    <div className="mt-16 grid md:grid-cols-3 gap-12">

      <div>
        <div className="text-4xl mb-4">📱</div>
        <h3 className="text-xl font-semibold text-gray-900">
          1. Seleziona il dispositivo
        </h3>
        <p className="mt-3 text-gray-600">
          Scegli modello e servizio in modo semplice e guidato.
        </p>
      </div>

      <div>
        <div className="text-4xl mb-4">⚡</div>
        <h3 className="text-xl font-semibold text-gray-900">
          2. Ricevi prezzo immediato
        </h3>
        <p className="mt-3 text-gray-600">
          Ottieni subito un preventivo o una valutazione trasparente.
        </p>
      </div>

      <div>
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-xl font-semibold text-gray-900">
          3. Completa in sicurezza
        </h3>
        <p className="mt-3 text-gray-600">
          Vieni in centro o attendi il contatto del nostro team.
        </p>
      </div>

    </div>
  </div>
</section>


      {/* SEZIONE VANTAGGI */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Perché scegliere FixPoint
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Un servizio pensato per offrire qualità, trasparenza e velocità.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">

            <div>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900">
                Riparazioni rapide
              </h3>
              <p className="mt-3 text-gray-600">
                Centri assistenza selezionati per garantire tempi brevi e
                interventi professionali.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900">
                Sicurezza e affidabilità
              </h3>
              <p className="mt-3 text-gray-600">
                I tuoi dati e il tuo dispositivo sono sempre gestiti con la
                massima attenzione.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900">
                Supporto dedicato
              </h3>
              <p className="mt-3 text-gray-600">
                Assistenza continua durante tutto il processo di preventivo
                o valutazione.
              </p>
            </div>

          </div>
        </div>
      </section>

     {/* RECENSIONI */}
<section className="py-28 bg-white overflow-hidden">
  <div className="max-w-6xl mx-auto px-6">

    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
        Cosa dicono i nostri clienti
      </h2>

      <div className="mt-4 flex justify-center items-center gap-2 text-yellow-500 text-xl">
        ★★★★★
        <span className="text-gray-700 text-base ml-2">
          4.9 su 5 · 320 recensioni Google
        </span>
      </div>
    </div>

    <div className="relative w-full overflow-hidden">

      <div className="review-track flex gap-8">

        {/* BLOCCO RECENSIONI */}
        {[
          {
            text: "Servizio velocissimo e personale molto professionale. In meno di un’ora avevo il telefono riparato.",
            name: "Marco R."
          },
          {
            text: "Valutazione chiara e pagamento rapido. Esperienza molto positiva.",
            name: "Giulia S."
          },
          {
            text: "Finalmente un servizio serio per riparazioni affidabili.",
            name: "Andrea M."
          },
          {
            text: "Processo semplice e intuitivo. Consigliatissimo.",
            name: "Luca T."
          }
        ].concat([
          {
            text: "Servizio velocissimo e personale molto professionale. In meno di un’ora avevo il telefono riparato.",
            name: "Marco R."
          },
          {
            text: "Valutazione chiara e pagamento rapido. Esperienza molto positiva.",
            name: "Giulia S."
          },
          {
            text: "Finalmente un servizio serio per riparazioni affidabili.",
            name: "Andrea M."
          },
          {
            text: "Processo semplice e intuitivo. Consigliatissimo.",
            name: "Luca T."
          }
        ]).map((review, i) => (
          <div
            key={i}
            className="review-card flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] border border-gray-200 rounded-2xl p-8 shadow-md bg-white hover:shadow-xl transition duration-300"
          >
            <p className="text-gray-600 leading-relaxed">
              “{review.text}”
            </p>
            <div className="mt-6 font-semibold text-gray-900">
  {review.name}
</div>
<div className="text-yellow-500 text-sm mt-1">
  ★★★★★
</div>
          </div>
        ))}

      </div>

    </div>

  </div>
</section>

     {/* CTA FINALE */}
<section className="bg-black text-white py-24">
  <div className="max-w-4xl mx-auto px-6 text-center">

    <div className="text-sm uppercase tracking-widest text-gray-400 mb-6">
      Pronto a iniziare?
    </div>

    <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
      Scopri subito quanto costa riparare
      <br className="hidden md:block" />
      o quanto vale il tuo dispositivo
    </h2>

    <p className="mt-6 text-gray-300 text-lg max-w-2xl mx-auto">
      Processo semplice, digitale e senza impegno.
      Ricevi una risposta immediata in meno di 2 minuti.
    </p>

    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">

      <Link
        href="/preventivo"
        className="bg-white text-black px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 transition duration-300"
      >
        Calcola il Preventivo
      </Link>

      <Link
        href="/valutazione"
        className="border border-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-black transition duration-300"
      >
        Valuta il tuo Dispositivo
      </Link>

    </div>

    <div className="mt-8 text-sm text-gray-500">
      Nessun obbligo • Nessun pagamento online • Centro assistenza certificato
    </div>

  </div>
</section>

    </div>
  );
}