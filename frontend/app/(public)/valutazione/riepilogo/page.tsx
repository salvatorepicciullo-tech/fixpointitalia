'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = 'http://localhost:3001';

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
  const [selectedDate, setSelectedDate] = useState('');
const [selectedTime, setSelectedTime] = useState('');
const [minDate, setMinDate] = useState('');
const timeSlots = ["09:00", "11:00", "14:00", "16:00", "18:00"];

  /* ==========================
     LOAD DEFECT NAMES
  ========================== */
  useEffect(() => {
    fetch(`${API}/api/defects`)
      .then(r => r.json())
      .then(d => setAllDefects(Array.isArray(d) ? d : []));
  }, []);

  /* ==========================
     CALCOLO VALORE
  ========================== */
  useEffect(() => {
    if (!model_id) return;

    setLoading(true);

    fetch(`${API}/api/valuation/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: Number(model_id),
        defect_ids,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.max_value !== 'undefined') {
          setResult(data);
        } else {
          setResult(null);
        }
      })
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [model_id]);

  const selectedDefects = allDefects.filter(d =>
    defect_ids.includes(d.id)
  );

/* =======================
   FIX HYDRATION DATE
======================= */
useEffect(() => {
  const today = new Date().toISOString().split("T")[0];
  setMinDate(today);
}, []);



  /* ==========================
     INVIO
  ========================== */
  const sendValuation = async () => {

  if (!selectedDate || !selectedTime) {
  alert("Seleziona data e orario preferito");
  return;
}

const preferred_datetime = `${selectedDate}T${selectedTime}:00`;


    if (!model_id || !city) return;

    const res = await fetch(`${API}/api/valuations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: Number(model_id),
        city,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        defect_ids: defect_ids,
        preferred_datetime,
      }),
    });

    const data = await res.json();

    if (data.success) {
      // 🔥 EVENTO REALTIME ADMIN
      localStorage.setItem("valuations_updated", Date.now().toString());

      router.push('/valutazione/success');
    }
  };

  /* ==========================
     PROTEZIONE RENDER
  ========================== */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Caricamento riepilogo...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Errore nel calcolo della valutazione
      </div>
    );
  }

  /* ==========================
     UI
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
          <p>Valore massimo: <b>€ {result?.max_value ?? 0}</b></p>
          <p>Penalità totali: <b>- € {result?.total_penalty ?? 0}</b></p>
          <p className="text-lg mt-2">
            Valore stimato: <b>€ {result?.final_value ?? 0}</b>
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


      {/* DATA E ORARIO PREFERITO */}
<div className="mt-6">
  <h2 className="font-semibold mb-3">Data e orario preferito</h2>

  <input
    type="date"
    min={minDate}
    value={selectedDate}
    onChange={(e) => {
      setSelectedDate(e.target.value);
      setSelectedTime('');
    }}
    className="w-full border rounded-xl px-4 py-3 mb-4"
  />

  {selectedDate && (
    <div className="grid grid-cols-3 gap-3">
      {timeSlots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => setSelectedTime(slot)}
          className={`py-2 rounded border transition ${
            selectedTime === slot
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 hover:border-blue-600"
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  )}
</div>


        {/* CTA */}
       <button
  onClick={sendValuation}
  disabled={!name || !phone || !selectedDate || !selectedTime}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition disabled:opacity-40"
>
  Invia valutazione
</button>

      </div>
    </div>
  );
}