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

  const navItems = [
    { name: 'Preventivo', href: '/preventivo' },
    { name: 'Valutazione', href: '/valutazione' },
    { name: 'Domande frequenti', href: '/faq' },
    { name: 'Contatti', href: '/contatti' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO → HOME */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo-fixpoint.png"
              alt="FixPoint"
              className="h-25 w-auto transition hover:opacity-80"
            />
          </Link>

          {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-10">

  <nav className="flex items-center gap-10">
    {navItems.map((item) => {
      const isActive = pathname === item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`relative text-sm font-medium transition ${
            isActive
              ? 'text-black'
              : 'text-gray-700 hover:text-black'
          }`}
        >
          {item.name}

          <span
            className={`absolute left-0 -bottom-1 h-[2px] bg-black transition-all duration-300 ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </Link>
      );
    })}
  </nav>

  {/* APP BUTTON */}
 <button
  onClick={() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }
  }}
  className="ml-4 px-4 py-2 border border-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
>
  📲 App
</button>

</div>

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

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-20 right-0 w-72 bg-white shadow-xl p-6 space-y-6 rounded-l-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-lg font-medium text-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}