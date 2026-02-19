'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };
type Repair = { id: number; name: string };

type PriceRow = {
  id: number;
  repair_id: number;
  repair: string;
  price: number;
};

export default function PricesPage() {

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);

  const [priceMap, setPriceMap] = useState<Record<number,string>>({});
  const [savingId, setSavingId] = useState<number|null>(null);

  const [deviceTypeId,setDeviceTypeId]=useState<number|null>(null);
  const [brandId,setBrandId]=useState<number|null>(null);
  const [modelId,setModelId]=useState<number|null>(null);

  const [modelSearch,setModelSearch]=useState('');
  const [filteredModels,setFilteredModels]=useState<Model[]>([]);

  /* ================= BASE ================= */

  useEffect(()=>{
    const loadBase = async()=>{
      const dt = await apiFetch('/api/device-types');
      const br = await apiFetch('/api/brands');

      setDeviceTypes(dt || []);
      setBrands(br || []);
    };

    loadBase();
  },[]);

  useEffect(()=>{
    const loadRepairs = async()=>{
      const data = await apiFetch(`/api/repairs?device_type_id=${deviceTypeId ?? ''}`);
      setRepairs(data || []);
    };

    loadRepairs();
  },[deviceTypeId]);

  useEffect(()=>{
    if(!deviceTypeId || !brandId){
      setModels([]);
      setModelId(null);
      setModelSearch('');
      return;
    }

    const loadModels = async()=>{
      const data = await apiFetch(`/api/models?device_type_id=${deviceTypeId}&brand_id=${brandId}`);
      setModels(data || []);
      setFilteredModels(data || []);
    };

    loadModels();

  },[deviceTypeId,brandId]);

  useEffect(()=>{
    if(!modelSearch){
      setFilteredModels(models);
      return;
    }

    const q=modelSearch.toLowerCase();
    setFilteredModels(models.filter(m=>m.name.toLowerCase().includes(q)));

  },[modelSearch,models]);

  /* ================= LOAD LISTINO MODELLO ================= */

  const reloadPrices = async(id:number)=>{
    const rows = await apiFetch(`/api/model-repairs?model_id=${id}`);

    setPrices(rows || []);

    const map:Record<number,string> = {};
    (rows || []).forEach((r:PriceRow)=> map[r.repair_id]=String(r.price));
    setPriceMap(map);
  };

  useEffect(()=>{
    if(!modelId){
      setPrices([]);
      setPriceMap({});
      return;
    }

    reloadPrices(modelId);

  },[modelId]);

  /* ================= SAVE PRICE ================= */

  const savePrice = async(repairId:number)=>{
    if(!modelId) return;

    const value = priceMap[repairId];
    const price = Number(value);
    if(value==='' || isNaN(price)) return;

    setSavingId(repairId);

    await apiFetch('/api/model-repairs',{
      method:'POST',
      body:JSON.stringify({
        model_id:modelId,
        repair_id:repairId,
        price
      })
    });

    setTimeout(()=>setSavingId(null),500);
  };

  /* ================= DELETE MODEL_REPAIR ================= */

  const deleteRow = async(rowId:number)=>{
    if(!modelId) return;

    await apiFetch(`/api/model-repairs/${rowId}`,{
      method:'DELETE'
    });

    await reloadPrices(modelId);
  };

  /* ================= RENDER ================= */

  return(
    <div>

      <h1 className="text-2xl font-bold mb-6">Listino prezzi</h1>

      {/* SELECTOR */}
      <div className="flex gap-4 mb-6">

        <select
          className="border px-3 py-2 rounded"
          value={deviceTypeId ?? ''}
          onChange={e=>{
            setDeviceTypeId(e.target.value?Number(e.target.value):null);
            setBrandId(null);
            setModelId(null);
          }}
        >
          <option value="">Tipo dispositivo</option>
          {deviceTypes.map(d=>(
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={brandId ?? ''}
          disabled={!deviceTypeId}
          onChange={e=>{
            setBrandId(e.target.value?Number(e.target.value):null);
            setModelId(null);
            setModelSearch('');
          }}
        >
          <option value="">Marca</option>
          {brands.map(b=>(
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <div className="relative w-72">
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Cerca modello..."
            value={modelSearch}
            disabled={!deviceTypeId || !brandId}
            onChange={e=>{
              setModelSearch(e.target.value);
              setModelId(null);
            }}
          />

          {modelSearch && filteredModels.length>0 && (
            <div className="absolute z-20 bg-white border rounded shadow w-full max-h-60 overflow-auto">
              {filteredModels.map(m=>(
                <div
                  key={m.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={()=>{
                    setModelId(m.id);
                    setModelSearch(m.name);
                  }}
                >
                  {m.name}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* LISTINO MODELLO */}
      {modelId && (
        <div className="space-y-3">

         {repairs
          .sort((a,b)=>a.name.localeCompare(b.name))
          .map(r=>{

            const priceRow = prices.find(p=>p.repair_id===r.id);
            const empty = !priceMap[r.id];

            return(
              <div
                key={r.id}
                className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${
                  empty?'bg-red-50 border-red-200':'bg-white'
                }`}
              >

                <span className="font-medium">{r.name}</span>

                <div className="flex items-center gap-3">

                  <input
                    className="border px-3 py-2 rounded w-32"
                    placeholder="€"
                    value={priceMap[r.id] ?? ''}
                    onChange={e=>setPriceMap(prev=>({...prev,[r.id]:e.target.value}))}
                    onBlur={()=>savePrice(r.id)}
                  />

                  <button
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={()=>savePrice(r.id)}
                  >
                    Modifica
                  </button>

                  {priceRow && (
                    <button
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                      onClick={()=>deleteRow(priceRow.id)}
                    >
                      Elimina
                    </button>
                  )}

                  {savingId===r.id &&(
                    <span className="text-xs text-green-600 font-semibold">
                      Salvato
                    </span>
                  )}

                </div>

              </div>
            );

          })}

        </div>
      )}

    </div>
  );
}
