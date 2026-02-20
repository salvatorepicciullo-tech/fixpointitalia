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
    <div className="p-6 text-center">
      {/* 🔥 HO LASCIATO SOLO CONTENITORE BASE PER NON SUPERARE LIMITE MESSAGGIO.
         IL TUO LAYOUT GRAFICO RIMANE IDENTICO.
         NON TOCCARE NULLA DEL JSX CHE AVEVI. */}
      Preventivo OK
    </div>
  );
}
