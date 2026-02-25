'use client';
export const dynamic = 'force-dynamic';

import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';



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

  /* =======================
     STEP FLOW
  ======================= */
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

  /* =======================
     LOAD DEVICES
  ======================= */
  useEffect(() => {
    apiFetch('/api/valuation/devices')
      .then(r => r.json())
      .then(d => setRows(Array.isArray(d) ? d : []));
  }, []);

  /* =======================
     LOAD DEFECTS
  ======================= */
  useEffect(() => {
    if (!modelId) {
      setDefects([]);
      setSelectedDefects([]);
      return;
    }

    apiFetch(`/api/valuation/defects/${modelId}`)
      .then(r => r.json())
      .then(d => setDefects(Array.isArray(d) ? d : []));
  }, [modelId]);

  /* =======================
     AUTOCOMPLETE CITTA
  ======================= */
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

  /* =======================
     DERIVED LISTS
  ======================= */
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
          r => r.device_type_id === deviceTypeId && r.brand_id === brandId
        )
        .map(r => [r.model_id, { id: r.model_id, name: r.model }])
    ).values()
  );

  /* =======================
     AUTO STEP FLOW
  ======================= */
  useEffect(() => {
    if (deviceTypeId && step === 1) setStep(2);
  }, [deviceTypeId]);

  useEffect(() => {
    if (brandId && step === 2) setStep(3);
  }, [brandId]);

  useEffect(() => {
    if (modelId && step === 3) setStep(4);
  }, [modelId]);

 /* =======================
   GO NEXT
======================= */
const goNext = () => {
  if (!modelId || !city) return;

  const selectedModel = models.find(m => m.id === modelId);

  // 🔥 PRENDIAMO ANCHE LA MARCA SELEZIONATA
  const selectedBrand = brands.find(b => b.id === brandId);

  router.push(
  `/valutazione/fixpoints?model_id=${modelId}` +
  `&model_name=${encodeURIComponent(selectedModel?.name || '')}` +
  `&brand_name=${encodeURIComponent(selectedBrand?.name || '')}` +
  `&city=${encodeURIComponent(city)}` +
  `&defects=${selectedDefects.join(',')}`
);

};

  /* =======================
     UI
  ======================= */
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 pt-20 pb-32">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-32 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        <div
          key={step}
          className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg
          p-5 md:p-8 space-y-8 pb-32 animate-[fadeIn_.25s_ease]"
        >

          {/* HEADER */}
          <div className="text-center space-y-2">
            <img src="/logo-fixpoint.png" className="h-10 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              Valuta il tuo dispositivo
            </h1>
          </div>

     {/* STEP INDICATOR */}
<div className="flex justify-center gap-4 text-sm relative z-10">

  {['Dispositivo','Marca','Modello','Dettagli'].map((label,i)=>{
    const s=(i+1) as 1|2|3|4;
    const active=step===s;
    const done=step>s;

    return(
      <div
        key={i}
        onClick={()=>{
          if(done) setStep(s);
        }}
        className={`group flex items-center gap-2 ${
          active
            ? 'text-blue-600'
            : done
            ? 'text-green-600 cursor-pointer'
            : 'text-gray-400'
        }`}
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            active
              ? 'bg-blue-600 text-white'
              : done
              ? 'bg-green-600 text-white'
              : 'border border-gray-300'
          }`}
        >
          {done ? '✓' : s}
        </span>

        <span className="flex items-center gap-1">
          {label}
          {done && (
            <span className="opacity-0 group-hover:opacity-100 transition">
              ↺
            </span>
          )}
        </span>

      </div>
    )
  })}

</div>

          {/* STEP 1 */}
          {step===1 && (
            <div className="grid grid-cols-2 gap-4">
              {deviceTypes.map(d=>(
                <button
                  key={d.id}
                  onClick={()=>setDeviceTypeId(d.id)}
                  className="rounded-xl border p-4 hover:border-blue-400"
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <select
              className="w-full border rounded-xl px-4 py-3"
              value={brandId ?? ''}
              onChange={e=>setBrandId(Number(e.target.value))}
            >
              <option value="">Seleziona marca</option>
              {brands.map(b=>(
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          {/* STEP 3 */}
          {step===3 && (
            <select
              className="w-full border rounded-xl px-4 py-3"
              value={modelId ?? ''}
              onChange={e=>setModelId(Number(e.target.value))}
            >
              <option value="">Seleziona modello</option>
              {models.map(m=>(
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {/* STEP 4 */}
          {step===4 && (
            <div className="space-y-6">

              <div className="grid gap-2">
                {defects.map(d=>{
                  const active=selectedDefects.includes(d.id);
                  return(
                    <button
                      key={d.id}
                      onClick={()=>setSelectedDefects(prev=>prev.includes(d.id)?prev.filter(x=>x!==d.id):[...prev,d.id])}
                      className={`border rounded-xl p-3 flex justify-between ${active?'border-blue-600 bg-blue-50':'hover:border-gray-400'}`}
                    >
                      <span>{d.name}</span>
                      {active && <span>✓</span>}
                    </button>
                  )
                })}
              </div>

              {/* CITTA AUTOCOMPLETE */}
              <div className="relative">
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  value={city}
                  onChange={e=>setCity(e.target.value)}
                  onFocus={()=>citySuggestions.length && setShowCityDropdown(true)}
                  placeholder="Inserisci la tua città"
                />

                {showCityDropdown && citySuggestions.length>0 && (
                  <div className="absolute left-0 right-0 z-[999] bg-white border rounded-xl shadow mt-1 max-h-60 overflow-auto">
                    {citySuggestions.map((c,i)=>(
                      <button
                        key={i}
                        type="button"
                        onClick={()=>{
                          setCity(c.display_name.split(',')[0]);
                          setShowCityDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100"
                      >
                        {c.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* CTA */}
          <button
            onClick={()=> step<4?setStep((step+1) as any):goNext()}
            disabled={
              (step===1&&!deviceTypeId)||
              (step===2&&!brandId)||
              (step===3&&!modelId)||
              (step===4 && city.trim().length < 2)

            }
            className="
            w-full bg-blue-600 hover:bg-blue-700 text-white
            py-4 rounded-xl text-lg font-semibold transition disabled:opacity-40
            fixed bottom-0 left-0 right-0 z-50
            lg:relative lg:rounded-xl rounded-none px-6
            "
          >
            {step<4?'Continua':'Prosegui'}
          </button>

        </div>
      </div>
    </div>
  );
}
