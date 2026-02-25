import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 mt-32">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo-fixpoint.png" className="h-20" />
            <span className="font-bold text-white text-lg">
              
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Riparazioni rapide, sicure e trasparenti.
          </p>
        </div>

        {/* LINK */}
        <div>
          <h4 className="font-semibold text-white mb-3">
            Servizi
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/preventivo">Preventivo</Link></li>
            <li><Link href="/centri">Centri assistenza</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">
            Supporto
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq">Domande frequenti</Link></li>
            <li><Link href="/contatti">Contatti</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">
            Legale
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Privacy Policy</li>
            <li>Termini e condizioni</li>
          </ul>
        </div>

      </div>

      <div className="text-center text-sm text-gray-500 mt-12">
        © {new Date().getFullYear()} FixPoint. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
