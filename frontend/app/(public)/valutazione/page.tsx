'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:3001';

type DeviceRow = {
  device_type_id: number;
  device_type: string;
  brand_id: number;
  brand: string;
  model_id: number;
  model: string;
};

type Defect = {
  id: number;
  name: string;
};

export default function ValutazionePage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);

  const [selectedDefects, setSelectedDefects] = useState<number[]>([]);

  const [city, setCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/valuation/devices`)
      .then(r => r.json())
      .then(d => setRows(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!modelId) {
      setDefects([]);
      setSelectedDefects([]);
      return;
    }

    fetch(`${API}/api/valuation/defects/${modelId}`)
      .then(r => r.json())
      .then(d => setDefects(Array.isArray(d) ? d : []));
  }, [modelId]);

  useEffect(() => {
    if (!city || city.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&q=${city}`
        );
        const data = await res.json();
        setCitySuggestions(data.slice(0, 5));
        setShowCityDropdown(true);
      } catch {}
    }, 300);

    return () => clearTimeout(timeout);
  }, [city]);

  const deviceTypes = Array.from(
    new Map(
      rows.map(r => [
        r.device_type_id,
        { id: r.device_type_id, name: r.device_type },
      ])
    ).values()
  );

  const brands = Array.from(
    new Map(
      rows
        .filter(r => r.device_type_id === deviceTypeId)
        .map(r => [r.brand_id, { id: r.brand_id, name: r.brand }])
    ).values()
  );

  const models = Array.from(
    new Map(
      rows
        .filter(
          r => r.device_type_id === deviceTypeId &&
               r.brand_id === brandId
        )
        .map(r => [r.model_id, { id: r.model_id, name: r.model }])
    ).values()
  );

  useEffect(() => { if (deviceTypeId && step === 1) setStep(2); }, [deviceTypeId]);
  useEffect(() => { if (brandId && step === 2) setStep(3); }, [brandId]);
  useEffect(() => { if (modelId && step === 3) setStep(4); }, [modelId]);

  const goNext = () => {
    if (!modelId || !city) return;

    const selectedModel = models.find(m => m.id === modelId);
    const selectedBrand = brands.find(b => b.id === brandId);

    router.push(
      `/valutazione/fixpoints?model_id=${modelId}` +
      `&model_name=${encodeURIComponent(selectedModel?.name || '')}` +
      `&brand_name=${encodeURIComponent(selectedBrand?.name || '')}` +
      `&city=${encodeURIComponent(city)}` +
      `&defects=${selectedDefects.join(',')}`
    );
  };

  return (
    <>
      {/* ================= FORM ================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 pt-20 pb-32">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-32 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start relative z-10">

          {/* CARD */}
          <div className="w-full max-w-3xl bg-white lg:rounded-2xl shadow-lg p-6 md:p-8 space-y-8 pb-32">

            <div className="text-center space-y-1 sticky top-0 bg-white/80 backdrop-blur py-2 border-b">
             <h1 className="text-3xl font-bold text-gray-900">
  Valuta il tuo dispositivo
</h1>

<p className="text-gray-600">
  Scopri il valore del tuo dispositivo in pochi passaggi
</p>

<div className="mt-3 text-sm text-gray-500 space-y-1">
  <div>⚡ Valutazione gratuita e immediata</div>
  <div>🔒 Nessun obbligo di vendita</div>
  <div>🏪 Solo centri certificati</div>
</div>
            </div>

            {/* Progress */}
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            {/* Step Indicator */}
           <div className="flex justify-between text-sm">
  {['Dispositivo','Marca','Modello','Dettagli'].map((label,i)=>{
    const s=(i+1) as 1|2|3|4;
    const active=step===s;
    const done=step>s;

    const canGo =
      (s === 1) ||
      (s === 2 && deviceTypeId) ||
      (s === 3 && deviceTypeId && brandId) ||
      (s === 4 && deviceTypeId && brandId && modelId);

    return(
      <div
        key={i}
        onClick={()=> {
          if (canGo) setStep(s);
        }}
        className={`flex items-center gap-2 ${
          canGo ? 'cursor-pointer' : 'cursor-not-allowed'
        } ${
          active?'text-black':
          done?'text-green-600':
          'text-gray-400'
        }`}
      >
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
          active?'bg-black text-white':
          done?'bg-green-600 text-white':
          'border border-gray-300'
        }`}>
          {done?'✓':s}
        </span>
        {label}
      </div>
    )
  })}
</div>

            {/* STEP CONTENT */}
            {step===1 && (
              <div className="grid grid-cols-2 gap-4">
                {deviceTypes.map(d=>(
                  <button
                    key={d.id}
                    onClick={()=>setDeviceTypeId(d.id)}
                    className="rounded-xl border p-4 hover:border-black hover:bg-gray-50 transition active:scale-95"
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}

            {step===2 && (
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={brandId ?? ''}
                onChange={e=>{
  const val = e.target.value ? Number(e.target.value) : null;
  setBrandId(val);
  setModelId(null);
}}
              >
                <option value="">Seleziona marca</option>
                {brands.map(b=>(
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}

            {step===3 && (
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={modelId ?? ''}
                onChange={e=>{
  const val = e.target.value ? Number(e.target.value) : null;
  setModelId(val);
}}
              >
                <option value="">Seleziona modello</option>
                {models.map(m=>(
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}

         {step===4 && (
  <div className="space-y-6">

    <div className="text-sm text-gray-500">
      Seleziona eventuali difetti per una valutazione più precisa.
    </div>

    <div className="grid gap-2">
      {defects.map(d=>{
        const active=selectedDefects.includes(d.id);
        return(
          <button
            key={d.id}
            onClick={()=>setSelectedDefects(prev=>prev.includes(d.id)?prev.filter(x=>x!==d.id):[...prev,d.id])}
            className={`border rounded-xl p-3 flex justify-between ${
              active?'border-black bg-gray-50':'hover:border-gray-400'
            }`}
          >
            {d.name}
            {active && '✓'}
          </button>
        )
      })}
    </div>

    <div className="relative">
      <input
        className="w-full border rounded-xl px-4 py-3"
        value={city}
        onChange={e => {
          setCity(e.target.value);
          setShowCityDropdown(true);
        }}
        placeholder="Inserisci la tua città"
      />

      {showCityDropdown && citySuggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {citySuggestions.map((s: any, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCity(s.display_name.split(',')[0]);
                setShowCityDropdown(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>

  </div>
)}

            <button
              onClick={()=> step<4?setStep((step+1) as any):goNext()}
             disabled={
  (step===1 && !deviceTypeId) ||
  (step===2 && !brandId) ||
  (step===3 && !modelId) ||
  (step===4 && city.trim().length<2)
}
              className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl text-lg font-semibold transition disabled:opacity-40 fixed bottom-0 left-0 right-0 lg:relative shadow-lg"
            >
              {step<4 ? 'Continua' : '🔥 Trova il miglior centro'}
            </button>

          </div>

         {/* HERO RIGHT SIDE */}
<div className="hidden lg:flex justify-center items-center relative">

  {/* Glow dietro */}
  <div className="absolute w-96 h-96 bg-gradient-to-tr from-green-200 to-blue-200 rounded-full blur-3xl opacity-40"></div>

  {/* Immagine */}
  <img
    src="/valuation-phone.png"
    alt="Valutazione dispositivo"
    className="relative w-[420px] drop-shadow-2xl"
  />

</div>

        </div>
      </div>

      {/* VANTAGGI */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          {[
            { icon:'⚡', title:'Valutazione immediata' },
            { icon:'€', title:'Miglior prezzo' },
            { icon:'🔒', title:'Pagamento sicuro' },
            { icon:'🏪', title:'Centri selezionati' },
          ].map((v,i)=>(
            <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl mb-3">{v.icon}</div>
              <p className="font-semibold">{v.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 MOSSE */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-4">
            Valutato in <span className="text-green-600">3 mosse</span>
          </h3>
          <p className="text-gray-600 mb-16">
            Processo semplice e trasparente
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step:'1', icon:'📱', title:'Seleziona dispositivo' },
              { step:'2', icon:'📝', title:'Indica condizioni' },
              { step:'3', icon:'💰', title:'Ricevi offerta' },
            ].map((s,i)=>(
              <div key={i} className="bg-white rounded-3xl shadow-lg p-8 relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  {s.step}
                </div>
                <div className="text-5xl mb-4">{s.icon}</div>
                <h4 className="font-semibold text-xl">{s.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}