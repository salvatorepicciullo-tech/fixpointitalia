'use client';

import { useEffect, useState } from 'react';
import Section from '@/app/components/dashboard/Section';
import StatCard from '@/app/components/dashboard/StatCard';

type Quote = {
  id: number;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';
  price?: number;
};

type Valuation = {
  id: number;
  status: 'NEW' | 'IN_CONTACT' | 'CLOSED';
};

const API_URL = 'http://localhost:3001';

export default function FixPointDashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fixpoint_id = localStorage.getItem('fixpoint_id');

    if (!fixpoint_id) {
      console.warn('Fixpoint_id mancante');
      setLoading(false);
      return;
    }

    Promise.all([
      // 🔥 FIX PRINCIPALE: passiamo fixpoint_id
      fetch(`${API_URL}/api/fixpoint/quotes?fixpoint_id=${fixpoint_id}`),
      fetch(`${API_URL}/api/fixpoint/valuations`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([q, v]) => {
        if (q.ok) {
          const qData = await q.json();
          setQuotes(qData || []);
        }

        if (v.ok) {
          const vData = await v.json();
          setValuations(vData || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Caricamento…</div>;

  /* ======================
     CONTATORI
  ====================== */

  const countQuotes = (s?: Quote['status']) =>
    s ? quotes.filter(q => q.status === s).length : quotes.length;

  const countVal = (s?: Valuation['status']) =>
    s ? valuations.filter(v => v.status === s).length : valuations.length;

  // 🔥 Totale € preventivi chiusi (pronto per card futura)
  const closedTotal = quotes
    .filter(q => q.status === 'DONE')
    .reduce((sum, q) => sum + Number(q.price || 0), 0);

  return (
    <div className="space-y-12">

      <div>
        <h1 className="text-3xl font-bold">Dashboard FixPoint</h1>
        <p className="text-gray-500 mt-1">
          Panoramica centro assistenza
        </p>
      </div>

      {/* ======================
          PREVENTIVI
      ====================== */}
     <Section title="Preventivi">
  <StatCard title="Totali" value={countQuotes()} icon="📊" />

  <StatCard
    title="Nuovi"
    value={countQuotes('NEW')}
    icon="🆕"
    color="text-blue-600"
  />

  <StatCard
    title="In lavorazione"
    value={countQuotes('ASSIGNED') + countQuotes('IN_PROGRESS')}
    icon="🛠️"
    color="text-amber-600"
  />

  <StatCard
    title="Completati"
    value={countQuotes('DONE')}
    icon="✅"
    color="text-emerald-600"
  />

  {/* 🔥 NUOVA CARD TOTALE € */}
  <StatCard
    title="Totale incasso"
    value={`€ ${closedTotal}`}
    icon="💰"
    color="text-green-600"
  />
</Section>


      {/* ======================
          VALUTAZIONI
      ====================== */}
      <Section title="Valutazioni">
        <StatCard title="Totali" value={countVal()} icon="📱" />
        <StatCard
          title="Nuove"
          value={countVal('NEW')}
          icon="🆕"
          color="text-blue-600"
        />
        <StatCard
          title="In contatto"
          value={countVal('IN_CONTACT')}
          icon="📞"
          color="text-emerald-600"
        />
        <StatCard
          title="Chiuse"
          value={countVal('CLOSED')}
          icon="✔️"
          color="text-gray-600"
        />
      </Section>

    </div>
  );
}
