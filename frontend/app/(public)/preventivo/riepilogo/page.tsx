'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type ModelRepair = {
  repair_id: number;
  repair: string;
  price: number;
};

export default function RiepilogoPage() {
  const router = useRouter();
  const params = useSearchParams();

  const modelId = params.get('modelId');
  const repairIdsParam = params.get('repairIds');
  const color = params.get('color');
  const city = params.get('city');
  const fixpointId = params.get('fixpointId');
  const brandName = params.get('brandName');
  const modelName = params.get('modelName');
const isOtherBrand = params.get('otherBrand') === '1';
  const distanceParam = params.get('distance');
const distance = distanceParam ? Number(distanceParam) : null;

  const repairIds = repairIdsParam
    ? repairIdsParam.split(',').map(Number)
    : [];

  const [repairs, setRepairs] = useState<ModelRepair[]>([]);
  const [total, setTotal] = useState(0);
  const [baseTotal, setBaseTotal] = useState(0);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
const [descrizione, setDescrizione] = useState('');
  const [telefono, setTelefono] = useState('');

  /* =======================
     LOAD PREZZI BASE
  ======================= */
  useEffect(() => {
    if (!modelId || repairIds.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model-repairs?model_id=${modelId}`)
      .then(r => r.json())
      .then((data: ModelRepair[]) => {
        const selected = data.filter(r =>
          repairIds.includes(r.repair_id)
        );

        setRepairs(selected);

        const base = selected.reduce((acc, r) => acc + r.price, 0);
        setBaseTotal(base);
      })
      .finally(() => setLoading(false));
  }, [modelId, repairIdsParam]);

  const repairNames = repairs.map(r => r.repair);

  /* =======================
     CALCOLO PREZZO BACKEND
  ======================= */
  useEffect(() => {
    if (!modelId || !fixpointId || repairIds.length === 0) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/calc-price?model_id=${modelId}&repair_ids=${repairIds.join(',')}&fixpoint_id=${fixpointId}`
    )
      .then(r => r.json())
      .then(data => {
        if (!data) return;

        setBaseTotal(Number(data.base || 0));
        setPercent(Number(data.percent || 0));
        setTotal(Number(data.final || 0));
      });
  }, [modelId, fixpointId, repairIdsParam]);

/* =======================
   SUBMIT PREVENTIVO (UX APP)
======================= */
const submitPreventivo = async () => {

  if (!nome || !cognome || !telefono) {
    alert('Compila tutti i campi obbligatori');
    return;
  }

  // 🚀 cambio pagina immediato
  router.push('/preventivo/conferma');

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: Number(modelId),
        repair_ids: repairIds,
        fixpoint_id: Number(fixpointId),
        city,
        price: total,

        customer_name: `${nome} ${cognome}`,
        customer_email: email || null,
        customer_phone: telefono,
        status: 'NEW',
      }),
      keepalive: true
    });
  } catch (err) {
    console.error('Errore invio preventivo', err);
  }
};
  /* =======================
     UI
  ======================= */
  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Riepilogo del tuo preventivo
          </h1>
          <p className="text-lg text-gray-600">
            Controlla i dettagli prima di inviare la richiesta.
          </p>
        </div>
      </div>

      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">

          {loading && (
            <p className="text-center text-gray-500">
              Calcolo in corso…
            </p>
          )}

          {!loading && (
            <>
              {/* =====================
                  CARD CENTRO PROTETTO
              ===================== */}
              <div className="bg-gray-50 border rounded-2xl p-5 flex justify-between items-center shadow-sm">
                <div>
                  <h2 className="font-semibold text-lg">
                    FixPoint Autorizzato
                  </h2>
                 <div className="text-sm text-gray-600">
  📍 Zona {city}
  {distance !== null && (
    <span className="text-blue-600 font-medium">
      {' '}– {distance.toFixed(1)} km da te
    </span>
  )}
</div>

                </div>

                <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                  Centro verificato
                </div>
              </div>

            {/* =====================
    DETTAGLI RIPARAZIONE
===================== */}
{!isOtherBrand && (
  <div className="bg-gray-50 rounded-2xl p-6 border space-y-4 shadow-sm">
    <h2 className="text-xl font-semibold">
      Dettagli riparazione
    </h2>

    <div className="space-y-2 text-sm">
      <div>📍 <strong>Città:</strong> {city}</div>
      <div>🏪 <strong>Centro:</strong> FixPoint Autorizzato</div>

      {brandName && modelName && (
        <div>
          📱 <strong>Dispositivo:</strong> {brandName} {modelName}
        </div>
      )}
    </div>

    <div className="bg-white border rounded-xl p-4">
      🔧 {repairNames.join(' + ')}
      {color && ` – ${color}`}
    </div>

    <div className="border-t pt-4 space-y-1 text-right">
      {percent !== 0 && (
        <div className="text-sm text-gray-400 line-through">
          € {baseTotal}
        </div>
      )}

      {percent !== 0 && (
        <div className="text-xs text-green-600">
          Offerta applicata dal centro ({percent}%)
        </div>
      )}

      <div className="text-2xl font-bold text-blue-600">
        € {total}
      </div>
    </div>
  </div>
)}
		

              {/* =====================
                  DATI CLIENTE
              ===================== */}
              <div className="bg-white border rounded-2xl shadow p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                  I tuoi dati
                </h2>
		
		{isOtherBrand && (
  <textarea
    placeholder="Descrivi il problema del dispositivo..."
    className="border rounded px-3 py-2 w-full"
    rows={4}
    value={descrizione}
    onChange={e => setDescrizione(e.target.value)}
  />
)}

                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Nome *"
                    className="border rounded px-3 py-2"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                  />
                  <input
                    placeholder="Cognome *"
                    className="border rounded px-3 py-2"
                    value={cognome}
                    onChange={e => setCognome(e.target.value)}
                  />
                </div>

                <input
                  placeholder="Email (opzionale)"
                  className="border rounded px-3 py-2 w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <input
                  placeholder="Telefono *"
                  className="border rounded px-3 py-2 w-full"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                />
              </div>

              {/* CTA */}
              <button
                onClick={submitPreventivo}
                disabled={!nome || !cognome || !telefono}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition disabled:opacity-40 shadow-md"
              >
                Invia preventivo
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
