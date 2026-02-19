'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type Stats = {
  total: number;
  new_count: number;
  assigned_count: number;
  done_count: number;
  total_amount: number;
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/api/stats/overview');
        if (!data) return;
        setStats(data);
      } catch (err) {
        console.error('Errore caricamento statistiche', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Caricamento statistiche…</div>;
  }

  if (!stats) {
    return <div className="text-red-600">Errore caricamento dati</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistiche</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Totale preventivi</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>

        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Nuovi</div>
          <div className="text-3xl font-bold">{stats.new_count}</div>
        </div>

        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Assegnati</div>
          <div className="text-3xl font-bold">{stats.assigned_count}</div>
        </div>

        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Completati</div>
          <div className="text-3xl font-bold">{stats.done_count}</div>
        </div>

        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-gray-500">Incasso totale</div>
          <div className="text-3xl font-bold">€ {stats.total_amount}</div>
        </div>
      </div>
    </div>
  );
}
