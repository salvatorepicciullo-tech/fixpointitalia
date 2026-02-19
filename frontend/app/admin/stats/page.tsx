'use client';

import { useEffect, useState } from 'react';

/* =========================
   TYPES
========================= */
type Stats = {
  total: number;
  new_count: number;
  assigned_count: number;
  done_count: number;
  total_amount: number;

  valuations_total: number;
  valuations_new: number;
  valuations_contact: number;
  valuations_closed: number;
};

/* =========================
   CONFIG
========================= */
const API_URL = 'http://192.168.3.2:3001';


/* =========================
   PAGE
========================= */
export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats/overview`);
        if (!res.ok) return;
        setStats(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="text-gray-500">Caricamento…</div>;
  if (!stats) return <div className="text-red-600">Errore dati</div>;

  return (
    <div className="space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Admin
        </h1>
        <p className="text-gray-500 mt-1">
          Panoramica generale sistema
        </p>
      </div>

      {/* PREVENTIVI */}
      <Section title="Preventivi">
        <StatCard title="Totale" value={stats.total} icon="📊" />
        <StatCard title="Nuovi" value={stats.new_count} icon="🆕" color="text-blue-600" />
        <StatCard title="Assegnati" value={stats.assigned_count} icon="🛠️" color="text-amber-600" />
        <StatCard title="Completati" value={stats.done_count} icon="✅" color="text-emerald-600" />
        <StatCard title="Incasso" value={`€ ${stats.total_amount}`} icon="💰" />
      </Section>

      {/* VALUTAZIONI */}
      <Section title="Valutazioni">
        <StatCard title="Totali" value={stats.valuations_total} icon="📱" />
        <StatCard title="Nuove" value={stats.valuations_new} icon="🆕" color="text-blue-600" />
        <StatCard title="In contatto" value={stats.valuations_contact} icon="📞" color="text-emerald-600" />
        <StatCard title="Chiuse" value={stats.valuations_closed} icon="✔️" color="text-gray-600" />
      </Section>

      {/* 🔥 WIDGET VALUTAZIONE RAPIDA */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="font-semibold mb-3">
          Valutazioni rapide
        </div>

        <div className="flex gap-3 flex-wrap">
          <a
            href="/fixpoint/quick-valuation"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            🔥 Apri tool rapido
          </a>

          <a
            href="/admin/valuations"
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 transition"
          >
            📊 Gestisci valutazioni
          </a>
        </div>
      </div>

    </div>
  );
}

/* =========================
   SECTION WRAPPER
========================= */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {children}
      </div>
    </div>
  );
}

/* =========================
   STAT CARD FINAL
========================= */
function StatCard({
  title,
  value,
  icon,
  color = 'text-gray-900',
}: {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}) {
  return (
    <div
      className="
      bg-white border rounded-2xl p-6
      shadow-sm hover:shadow-lg
      transition-all duration-200
      hover:-translate-y-1
      flex flex-col gap-2
    "
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>

      <div className={`text-4xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}
