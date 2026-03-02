export default function ContattiPage() {
  return (
    <div className="bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-28">

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
            Contatti
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Hai bisogno di assistenza o informazioni? Il nostro team è a tua disposizione.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* INFO */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Email
              </h3>
              <p className="text-gray-600">
                info@fixpointitalia.com
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Assistenza clienti
              </h3>
              <p className="text-gray-600">
                Rispondiamo entro 24 ore lavorative.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Orari
              </h3>
              <p className="text-gray-600">
                Lun - Ven: 9:00 - 18:00
              </p>
            </div>
          </div>

          {/* FORM */}
          <form className="space-y-6 border border-gray-200 p-8 rounded-2xl shadow-sm">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Messaggio
              </label>
              <textarea
                rows={4}
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Invia messaggio
            </button>

          </form>

        </div>

      </section>
    </div>
  );
}