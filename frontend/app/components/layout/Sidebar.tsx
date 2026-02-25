'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Role = 'admin' | 'fixpoint';

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const adminMenu = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Tipi dispositivo', href: '/admin/device-types' },
    { label: 'Marche', href: '/admin/brands' },
    { label: 'Modelli', href: '/admin/models' },
    { label: 'Riparazioni', href: '/admin/repairs' },
    { label: 'Listino', href: '/admin/prices' },
    { label: 'FixPoint', href: '/admin/fixpoints' },
    { label: 'Preventivi', href: '/admin/quotes' },
    { label: 'Valutazioni', href: '/admin/valuations' },
    { label: 'Promo Homepage', href: '/admin/promos' },
    { label: 'Configura valutazioni', href: '/admin/valuations-config' },
  ];

  const fixpointMenu = [
    { label: 'Dashboard', href: '/fixpoint/dashboard' },
    { label: 'Preventivi', href: '/fixpoint/quotes' },
    { label: 'Valutazioni', href: '/fixpoint/valuations' },
 { label: 'Valutazione Rapida', href: '/fixpoint/quick-valuation' },
  ];

  const menu = role === 'admin' ? adminMenu : fixpointMenu;

  return (
    <aside className="w-64 bg-[#0b1727] text-white p-6">
      <h2 className="text-xl font-bold mb-8">
        {role === 'admin' ? 'FixPoint Admin' : 'FixPoint'}
      </h2>

      <nav className="flex flex-col gap-2 text-sm relative">
        {menu.map(item => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group"
            >
              {/* 🔵 ACTIVE LINE (stile Linear) */}
              <span
                className={`absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full transition-all duration-300
                ${
                  active
                    ? 'bg-blue-500 opacity-100'
                    : 'opacity-0 group-hover:opacity-40'
                }`}
              />

              {/* LABEL */}
              <div
                className={`
                px-2 py-1.5 rounded-md transition-all duration-200

                ${
                  active
                    ? 'text-blue-400 font-semibold'
                    : 'text-gray-400'
                }

                group-hover:text-white
                group-hover:bg-blue-500/10
                `}
              >
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
