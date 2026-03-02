'use client';

import { useEffect, useState } from 'react';

/* =======================
   TIPI
======================= */
type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };
type Repair = { id: number; name: string; price: number };

export default function PreventivoPage() {
  /* =======================
     STATE
  ======================= */
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);

  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [color, setColor] = useState<string>('');
  const [repairId, setRepairId] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  // DATI CLIENTE
  const [city, setCity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  /* =======================
     FETCH INIZIALI
  ======================= */
  useEffect(() => {
    fetch('http://localhost:3001/api/device-types')
      .then(res => res.json())
      .then(setDeviceTypes);
  }, []);

  useEffect(() => {
    if (!deviceTypeId) return;
    fetch(`http://localhost:3001/api/brands`)
      .then(res => res.json())
      .then(setBrands);
  }, [deviceTypeId]);

  useEffect(() => {
    if (!brandId) return;
    fetch(
      `http://localhost:3001/api/models?device_type_id=${deviceTypeId}&brand_id=${brandId}`
    )
      .then(res => res.json())
      .then(setModels);
  }, [brandId, deviceTypeId]);

  useEffect(() => {
    if (!modelId) return;
    fetch(`http://localhost:3001/api/repairs`)
      .then(res => res.json())
      .then(setRepairs);
  }, [modelId]);

  useEffect(() => {
    if (!repairId) return;
    const selected = repairs.find(r => r.id === repairId);
    if (selected) setPrice(selected.price);
  }, [repairId, repairs]);

  /* =======================
     INVIO PREVENTIVO
  ======================= */
  const submitPreventivo = async () => {
    if (
      !modelId ||
      !repairId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !city
    ) {
      alert('Compila tutti i campi');
      return;
    }

    setSending(true);

    const res = await fetch('http://localhost:3001/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: modelId,
        repair_ids: [repairId],
        price,
        city,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      }),
    });

    setSending(false);

    if (!res.ok) {
      alert('Errore invio preventivo');
      return;
    }

    setSuccess(true);
  };

  /* =======================
     UI SUCCESS
  ======================= */
  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <h1>🎉 Preventivo inviato</h1>
        <p>
          Il tuo preventivo è stato registrato.
          <br />
          Verrai contattato da un centro FixPoint.
        </p>
      </div>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Calcola il tuo preventivo</h1>

      {/* STEP 1 */}
      <h2>1️⃣ Tipo dispositivo</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        {deviceTypes.map(d => (
          <button
            key={d.id}
            onClick={() => {
              setDeviceTypeId(d.id);
              setBrandId(null);
              setModelId(null);
              setRepairId(null);
              setPrice(null);
            }}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* STEP 2 */}
      {deviceTypeId && (
        <>
          <h2>2️⃣ Marca</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            {brands.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  setBrandId(b.id);
                  setModelId(null);
                  setRepairId(null);
                  setPrice(null);
                }}
              >
                {b.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* STEP 3 */}
      {brandId && (
        <>
          <h2>3️⃣ Modello</h2>
          <select onChange={e => setModelId(Number(e.target.value))}>
            <option value="">Seleziona modello</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* STEP 4 */}
      {modelId && (
        <>
          <h2>4️⃣ Colore (opzionale)</h2>
          <input
            type="text"
            placeholder="Es. Nero, Bianco"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </>
      )}

      {/* STEP 5 */}
      {modelId && (
        <>
          <h2>5️⃣ Riparazione</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            {repairs.map(r => (
              <button key={r.id} onClick={() => setRepairId(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* STEP 6 */}
      {price !== null && (
        <>
          <h2>💰 Prezzo stimato</h2>
          <p style={{ fontSize: 24, fontWeight: 'bold' }}>{price} €</p>

          {/* STEP 7 */}
          <h2>📋 Dati cliente</h2>
          <input placeholder="Città" onChange={e => setCity(e.target.value)} />
          <input placeholder="Nome e cognome" onChange={e => setCustomerName(e.target.value)} />
          <input placeholder="Email" onChange={e => setCustomerEmail(e.target.value)} />
          <input placeholder="Telefono" onChange={e => setCustomerPhone(e.target.value)} />

          {/* STEP 8 */}
          <button
            onClick={submitPreventivo}
            disabled={sending}
            style={{ marginTop: 16 }}
          >
            {sending ? 'Invio...' : 'Invia preventivo'}
          </button>
        </>
      )}
    </div>
  );
}
