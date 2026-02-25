'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  // ⭐ PWA INSTALL
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  /* ===============================
     SCROLL HEADER
  =============================== */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ===============================
     BLOCCA SCROLL MENU MOBILE
  =============================== */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* ===============================
     PWA INSTALL LISTENER
  =============================== */
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () =>
      window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const linkClass = (path: string) =>
    `text-base font-medium transition ${
      pathname === path
        ? 'text-orange-500'
        : 'text-gray-800 hover:text-orange-500'
    }`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur shadow-sm' : 'bg-white'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* LOGO */}
          <Link href="/" className="flex items-center select-none">
            <img
              src="/logo-fixpoint.png"
              alt="FixPoint"
              draggable={false}
              className={`w-auto transition-all duration-300 ${
                scrolled ? 'h-14' : 'h-20'
              }`}
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/preventivo" className={linkClass('/preventivo')}>
              Preventivo
            </Link>

            <Link href="/valutazione" className={linkClass('/valutazione')}>
              Valutazione
            </Link>

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

        {/* ⭐ INSTALL APP DESKTOP */}
<button
  onClick={() => {
    if (showInstall) {
      installApp();
    } else {
      alert(
        "Per installare FixPoint:\n\n📱 iPhone: Condividi → Aggiungi alla schermata Home\n🤖 Android/PC: Menu browser → Installa App"
      );
    }
  }}
  className="hidden md:inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-base font-semibold transition shadow"
>
  Installa App
</button>

          {/* HAMBURGER MOBILE */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl select-none"
            aria-label="Apri menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* ================= MENU MOBILE ================= */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-20 right-0 w-72 bg-white shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/preventivo"
              className="block text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Preventivo
            </Link>

            <Link
              href="/valutazione"
              className="block text-lg font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Valutazione
            </Link>

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

          {/* ⭐ INSTALL APP MOBILE */}
<button
  onClick={() => {
    if (showInstall) {
      installApp();
    } else {
      alert(
        "Per installare FixPoint:\n\n📱 iPhone: Condividi → Aggiungi alla schermata Home\n🤖 Android: Menu browser → Installa App"
      );
    }
  }}
  className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-semibold transition w-full"
>
  Installa App
</button>
          </div>
        </div>
      )}
    </>
  );
}