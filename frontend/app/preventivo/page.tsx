'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

/* =======================
   API ROOT (🔥 FIX DEFINITIVO)
======================= */
const API = process.env.NEXT_PUBLIC_API_URL;

/* =======================
   TIPI
======================= */
type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };
type Repair = { id: number; name: string };

export default function PreventivoPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isOtherBrand, setIsOtherBrand] = useState(false);

  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [modelSearch, setModelSearch] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [repairIds, setRepairIds] = useState<number[]>([]);
  const [color, setColor] = useState('');
  const [city, setCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const modelInputRef = useRef<HTMLInputElement | null>(null);

  /* =======================
     LOAD BASE DATA
  ======================= */
  useEffect(() => {

    fetch(`${API}/api/device-types`)
      .then(r => r.json())
      .then(setDeviceTypes);

    fetch(`${API}/api/brands`)
      .then(r => r.json())
      .then(setBrands);

  }, []);

  /* =======================
     LOAD MODELS
  ======================= */
  useEffect(() => {
    if (deviceTypeId == null || brandId == null) {
      setModels([]);
      setModelId(null);
      setRepairIds([]);
      return;
    }

    fetch(`${API}/api/models?device_type_id=${deviceTypeId}&brand_id=${brandId}`)
      .then(r => r.json())
      .then(data => {
        setModels(Array.isArray(data) ? data : []);
      });

  }, [deviceTypeId, brandId]);

  /* =======================
     LOAD REPAIRS
  ======================= */
  useEffect(() => {

    if (!modelId) {
      setRepairs([]);
      return;
    }

    fetch(`${API}/api/model-repairs?model_id=${modelId}`)
      .then(r => r.json())
      .then(rows => {
        const mapped = rows.map((x:any) => ({
          id: x.repair_id,
          name: x.repair
        }));
        setRepairs(mapped);
      });

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
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&q=${city}`,
          { headers:{ 'Accept-Language':'it' } }
        );

        const data = await res.json();
        setCitySuggestions(data.slice(0,5));
        setShowCityDropdown(true);

      } catch {}
    },300);

    return () => clearTimeout(timeout);

  },[city]);

  /* =======================
     MODEL SEARCH ENGINE
  ======================= */
  const normalize = (str:string) =>
    str.toLowerCase().replace(/\s+/g,'');

  const search = normalize(modelSearch);

  const filteredModels = models
    .map(m => {
      const name = normalize(m.name);
      let score = 0;

      if(name.startsWith(search)) score += 120;
      if(name.includes(search)) score += 60;

      const nums = search.replace(/[^\d]/g,'');
      if(nums && name.includes(nums)) score += 25;
      if(name.length > 10) score += 5;

      return { ...m, score };
    })
    .filter(m => m.score > 0 || search.length === 0)
    .sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name))
    .slice(0,12);

  /* =======================
     TOGGLE RIPARAZIONE
  ======================= */
  const toggleRepair = (id:number) => {
    setRepairIds(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev,id]
    );
  };

  /* =======================
     NAVIGAZIONE FINALE
  ======================= */
  const goToFixpoints = () => {

    if (isOtherBrand) {
      if (!deviceTypeId || !brandId || !city) return;

      const selectedBrand = brands.find(b => b.id === brandId);

      const params = new URLSearchParams({
        deviceTypeId:String(deviceTypeId),
        brandId:String(brandId),
        city,
      });

      if(selectedBrand)
        params.set('brandName', selectedBrand.name);

      router.push(`/preventivo/fixpoints?${params.toString()}`);
      return;
    }

    if (!deviceTypeId || !brandId || !modelId || repairIds.length === 0 || !city)
      return;

    const selectedBrand = brands.find(b => b.id === brandId);
    const selectedModel = models.find(m => m.id === modelId);

    const params = new URLSearchParams({
      deviceTypeId:String(deviceTypeId),
      brandId:String(brandId),
      modelId:String(modelId),
      repairIds:repairIds.join(','),
      city,
    });

    if(selectedBrand) params.set('brandName',selectedBrand.name);
    if(selectedModel) params.set('modelName',selectedModel.name);
    if(color) params.append('color',color);

    router.push(`/preventivo/fixpoints?${params.toString()}`);
  };

  /* =======================
     UI
  ======================= */
 return (
  <div className="max-w-3xl mx-auto p-6 space-y-6">

    {/* STEP 1 — TIPO DISPOSITIVO */}
    {step === 1 && (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Seleziona dispositivo</h1>

        <select
          className="w-full border p-3 rounded"
          value={deviceTypeId ?? ''}
          onChange={(e) => {
            setDeviceTypeId(Number(e.target.value));
            setStep(2);
          }}
        >
          <option value="">Seleziona tipo</option>
          {deviceTypes.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
    )}

    {/* STEP 2 — BRAND */}
    {step === 2 && (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Seleziona marca</h1>

        <select
          className="w-full border p-3 rounded"
          value={brandId ?? ''}
          onChange={(e) => {
            const id = Number(e.target.value);
            setBrandId(id);

            const b = brands.find(x => x.id === id);
            setIsOtherBrand(b?.name.toLowerCase().includes('altra') ?? false);

            setStep(3);
          }}
        >
          <option value="">Seleziona marca</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
    )}

    {/* STEP 3 — MODELLO */}
    {step === 3 && !isOtherBrand && (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Seleziona modello</h1>

        <input
          ref={modelInputRef}
          className="w-full border p-3 rounded"
          placeholder="Cerca modello..."
          value={modelSearch}
          onChange={(e)=>{
            setModelSearch(e.target.value);
            setShowModelDropdown(true);
          }}
        />

        {showModelDropdown && (
          <div className="border rounded max-h-60 overflow-y-auto">
            {filteredModels.map(m => (
              <div
                key={m.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={()=>{
                  setModelId(m.id);
                  setModelSearch(m.name);
                  setShowModelDropdown(false);
                  setStep(4);
                }}
              >
                {m.name}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* STEP 4 — RIPARAZIONI */}
    {step === 4 && !isOtherBrand && (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Seleziona riparazioni</h1>

        <div className="grid grid-cols-2 gap-2">
          {repairs.map(r => (
            <button
              key={r.id}
              onClick={()=>toggleRepair(r.id)}
              className={`border p-2 rounded ${
                repairIds.includes(r.id)
                  ? 'bg-black text-white'
                  : ''
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* STEP FINALE — CITTA */}
    {(step === 4 || isOtherBrand) && (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Inserisci città</h1>

        <input
          className="w-full border p-3 rounded"
          value={city}
          onChange={(e)=>setCity(e.target.value)}
          placeholder="Città..."
        />

        {showCityDropdown && citySuggestions.length > 0 && (
          <div className="border rounded">
            {citySuggestions.map((c:any,idx)=>(
              <div
                key={idx}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={()=>{
                  setCity(c.display_name);
                  setShowCityDropdown(false);
                }}
              >
                {c.display_name}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={goToFixpoints}
          className="w-full bg-black text-white p-3 rounded"
        >
          Continua
        </button>
      </div>
    )}

  </div>
);
}
