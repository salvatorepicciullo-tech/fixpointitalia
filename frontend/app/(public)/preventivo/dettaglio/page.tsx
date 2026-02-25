'use client';
import { apiFetch } from '@/lib/api';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DettaglioPreventivoPage() {
  const router = useRouter();
  const params = useSearchParams();

  /* =======================
     PARAMS DAL FLUSSO
  ======================= */
  const modelId = params.get('modelId');
  const repairIds = params.get('repairIds');
  const fixpointId = params.get('fixpointId');
  const fixpointName = params.get('fixpointName');
  const city = params.get('city');
  const total = params.get('total');
const brandName = params.get('brandName');
const modelName = params.get('modelName');
const repairNames = params.get('repairNames');
const originalPrice = params.get('originalPrice');


  /* =======================
     STATE CLIENTE
  ======================= */
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sending, setSending] = useState(false);

  /* =======================
     SUBMIT
  ======================= */
  const submitOrder = async () => {
    if (
      !modelId ||
      !repairIds ||
      !fixpointId ||
      !city ||
      !total ||
      !nome ||
      !cognome ||
      !telefono
    ) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    setSending(true);

    try {
      const res = await apiFetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: Number(modelId),
          repair_ids: repairIds.split(',').map(Number),
          fixpoint_id: Number(fixpointId),
          price: Number(total),
          city,
          customer_name: `${nome} ${cognome}`,
          customer_email: email || null,
          customer_phone: telefono,
          status: 'NEW',
        }),
      });

      if (!res.ok) throw new Error('Errore invio');

      router.push('/preventivo/conferma');
    } catch (err) {
      alert('Errore durante l’invio del preventivo');
    } finally {
      setSending(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Riepilogo preventivo
        </h1>

        {/* INFO */}
        <div className="text-sm text-gray-700 space-y-1">
  <div><strong>Città:</strong> {city}</div>
  <div><strong>Centro selezionato:</strong> {fixpointName}</div>

  {brandName && modelName && (
    <div><strong>Dispositivo:</strong> {brandName} {modelName}</div>
  )}

  {repairNames && (
    <div><strong>Riparazioni:</strong> {repairNames}</div>
  )}

  {originalPrice && (
    <div className="text-gray-400 line-through">
      Prezzo base: € {originalPrice}
    </div>
  )}

  <div className="text-lg font-semibold">
    Totale: € {total}
  </div>
</div>


        <hr />

        {/* DATI CLIENTE */}
        <div className="space-y-4">
          <h2 className="font-semibold">Dati cliente</h2>

          <div className="flex gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nome *"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Cognome *"
              value={cognome}
              onChange={e => setCognome(e.target.value)}
            />
          </div>

          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="Email (opzionale)"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Telefono *"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
          />
        </div>

        {/* CTA */}
        <button
          onClick={submitOrder}
          disabled={sending}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-40"
        >
          {sending ? 'Invio…' : 'Invia preventivo'}
        </button>

      </div>
    </div>
  );
}
