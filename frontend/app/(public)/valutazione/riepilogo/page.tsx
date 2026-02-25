'use client';
export const dynamic = 'force-dynamic';
import { apiFetch } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';



type CalcResult = {
  max_value: number;
  total_penalty: number;
  final_value: number;
};

type Defect = {
  id: number;
  name: string;
};

export default function RiepilogoPage() {
  const router = useRouter();
  const params = useSearchParams();

  const model_id = params.get('model_id');
  const city = params.get('city') || '';
  const defectsParam = params.get('defects') || '';
  const model_name = params.get('model_name') || 'Dispositivo';

  const defect_ids = defectsParam
    ? defectsParam.split(',').map(Number)
    : [];

  const [result, setResult] = useState<CalcResult | null>(null);
  const [allDefects, setAllDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  /* ==========================
     LOAD DEFECT NAMES
  ========================== */
  useEffect(() => {
    apiFetch('/api/defects')
      .then(r => r.json())
      .then(d => setAllDefects(Array.isArray(d) ? d : []));
  }, []);

  /* ==========================
     CALCOLO VALORE
  ========================== */
  useEffect(() => {
    if (!model_id) return;

    apiFetch('/api/valuation/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: Number(model_id),
        defect_ids,
      }),
    })
      .then(r => r.json())
      .then(data => {
        setResult(data);
        setLoading(false);
      });
  }, [model_id]);

  const selectedDefects = allDefects.filter(d =>
    defect_ids.includes(d.id)
  );

  /* ==========================
     INVIO
  ========================== */
  const sendValuation = async () => {
    if (!model_id || !city) return;

    const res = await apiFetch('/api/valuations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: Number(model_id),
        city,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        defect_ids: defect_ids,
      }),
    });

    const data = await res.json();

    if (data.success) {
      router.push('/valutazione/success'); // ✅ percorso corretto
    }
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Caricamento riepilogo...
      </div>
    );
  }

  /* ==========================
     UI FIXPOINT STYLE
  ========================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 py-10">

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Riepilogo valutazione
        </h1>

        {/* DISPOSITIVO */}
        <div className="border rounded-xl p-4 bg-gray-50 text-sm">
          <p><b>Dispositivo:</b> {model_name}</p>
          <p><b>Città:</b> {city}</p>
        </div>

        {/* DIFETTI */}
        {selectedDefects.length > 0 && (
          <div className="border rounded-xl p-4">
            <p className="font-medium mb-2">Difetti selezionati</p>
            {selectedDefects.map(d => (
              <div key={d.id}>• {d.name}</div>
            ))}
          </div>
        )}

        {/* VALORE */}
        <div className="border rounded-xl p-4 bg-blue-50">
          <p>Valore massimo: <b>€ {result.max_value}</b></p>
          <p>Penalità totali: <b>- € {result.total_penalty}</b></p>
          <p className="text-lg mt-2">
            Valore stimato: <b>€ {result.final_value}</b>
          </p>
        </div>

        {/* DATI CLIENTE */}
        <div>
          <h2 className="font-semibold mb-3">Dati cliente</h2>

          <input
            className="w-full border rounded-xl px-4 py-3 mb-3"
            placeholder="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            className="w-full border rounded-xl px-4 py-3 mb-3"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Telefono"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {/* CTA */}
        <button
          onClick={sendValuation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition"
        >
          Invia valutazione
        </button>

      </div>
    </div>
  );
}
