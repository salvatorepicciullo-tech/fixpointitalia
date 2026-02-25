'use client';

export const dynamic = 'force-dynamic';

import { apiFetch } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClientePage() {
  const params = useSearchParams();
  const router = useRouter();

  const modelId = params.get('model_id');
  const city = params.get('city');
  const finalValue = params.get('final_value');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = modelId && city && name && email && phone;

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);

    await apiFetch('/api/valuations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: modelId,
        city,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      }),
    });

    setLoading(false);

    router.push('/valutazione/success');
  };

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-20">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 space-y-6">

        <h1 className="text-2xl font-bold text-center">I tuoi dati</h1>

        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <div><b>Città:</b> {city}</div>
          <div className="text-lg">
            <b>Valore stimato:</b>{' '}
            <span className="text-green-600 font-bold">{finalValue} €</span>
          </div>
        </div>

        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Nome e cognome"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Telefono"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={!canSubmit || loading}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold disabled:opacity-40"
        >
          {loading ? 'Invio in corso…' : 'Invia valutazione'}
        </button>

      </div>
    </div>
  );
}
