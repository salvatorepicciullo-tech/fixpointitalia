'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (path: string) =>
    `text-base font-medium transition ${
      pathname === path
        ? 'text-orange-500'
        : 'text-gray-800 hover:text-orange-500'
    }`;

  return (
    <>
      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 transition ${
          scrolled
            ? 'bg-white/90 backdrop-blur shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo-fixpoint.png"
              alt="FixPoint"
              className="h-20 w-auto"
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-15">
            <Link href="/centri" className={linkClass('/centri')}>
              Centri assistenza
            </Link>
            <Link href="/faq" className={linkClass('/faq')}>
              Domande frequenti
            </Link>
            <Link href="/contatti" className={linkClass('/contatti')}>
              Contatti
            </Link>
          </nav>

          {/* CTA DESKTOP */}
          <Link
            href="/preventivo"
            className="hidden md:inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-base font-semibold transition shadow"
          >
            Trova negozio
          </Link>

          {/* HAMBURGER MOBILE */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
            aria-label="Apri menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-20 right-0 w-72 bg-white shadow-xl p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <Link
              href="/centri"
              className="block text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Centri assistenza
            </Link>

            <Link
              href="/faq"
              className="block text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Domande frequenti
            </Link>

            <Link
              href="/contatti"
              className="block text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Contatti
            </Link>

            <Link
              href="/preventivo"
              className="block bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-xl font-semibold transition"
              onClick={() => setMenuOpen(false)}
            >
              Trova negozio
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
