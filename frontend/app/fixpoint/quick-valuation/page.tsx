'use client';
import { apiFetch } from '@/lib/api'
import { useState } from 'react';

type Defect = {
  label: string;
  penalty: number;
};

export default function FixpointQuickValuation() {

  /* ======================
     DATI BASE
  ====================== */

  const basePrice = 680;
  const sellPrice = 1230;

  const [defects, setDefects] = useState<Defect[]>([
    { label: 'Batteria sotto 85%', penalty: 50 },
    { label: 'Graffi schermo', penalty: 80 },
    { label: 'Scocca rovinata', penalty: 60 },
    { label: 'Difetti funzionali', penalty: 150 },
  ]);

  const [selected, setSelected] = useState<number[]>([]);

  /* ======================
     ENGINE SELEZIONE
  ====================== */

  const toggleDefect = (index:number) => {
    setSelected(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  /* ======================
     TRIANGOLINI PREZZO
  ====================== */

  const increasePenalty = (index:number) => {
    setDefects(prev =>
      prev.map((d,i)=>
        i === index ? { ...d, penalty:d.penalty + 10 } : d
      )
    );
  };

  const decreasePenalty = (index:number) => {
    setDefects(prev =>
      prev.map((d,i)=>
        i === index ? { ...d, penalty: Math.max(0, d.penalty - 10) } : d
      )
    );
  };

  const removeDefect = (index:number) => {
    setDefects(prev => prev.filter((_,i)=> i !== index));
    setSelected(prev => prev.filter(i => i !== index));
  };

  const addDefect = () => {
    const name = prompt('Nome difetto');
    if(!name) return;
    setDefects(prev => [...prev, { label:name, penalty:50 }]);
  };

  /* ======================
     CALCOLI LIVE
  ====================== */

  const totalPenalty = selected.reduce(
    (sum,i)=> sum + defects[i].penalty,
    0
  );

  const finalPrice = basePrice - totalPenalty;
  const margin = sellPrice - finalPrice;

  /* ======================
     SALVA + STAMPA
  ====================== */

  const saveValuationLive = async () => {

    const token = localStorage.getItem('token');

    const defectsString = selected
      .map(i => `${defects[i].label}|${defects[i].penalty}`)
      .join(',');

    if(token){
      await apiFetch('/api/fixpoint/quick-valuation',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          model:'iPhone 16 Pro',
          city:'—',
          customer_name:'',
          customer_email:'',
          customer_phone:'',
          max_value:basePrice,
          total_penalty:totalPenalty,
          defects:defectsString
        })
      });
    }

    window.print();
  };

  /* ======================
     UI
  ====================== */

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Valutazione Rapida
        </h1>
        <p className="text-sm text-gray-500">
          Tool interno FixPoint
        </p>
      </div>

      {/* DEVICE */}
      <div className="bg-white border rounded-2xl p-6 grid grid-cols-4 gap-4">
        <select className="border rounded-xl px-3 py-2"><option>Apple</option></select>
        <select className="border rounded-xl px-3 py-2"><option>iPhone 16 Pro</option></select>
        <select className="border rounded-xl px-3 py-2"><option>512GB</option></select>
        <input placeholder="IMEI" className="border rounded-xl px-3 py-2"/>
      </div>

      {/* PREZZI */}
      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded-2xl p-6 bg-orange-50">
          <div className="text-sm">Acquisto</div>
          <div className="text-3xl font-bold text-orange-600">€{basePrice}</div>
        </div>

        <div className="border rounded-2xl p-6 bg-green-50">
          <div className="text-sm">Vendita</div>
          <div className="text-3xl font-bold text-green-600">€{sellPrice}</div>
        </div>

        <div className="border rounded-2xl p-6">
          <div className="text-sm">Margine LIVE</div>
          <div className="text-3xl font-bold">€{margin}</div>
        </div>
      </div>

      {/* DIFETTI + RISULTATO */}
      <div className="grid grid-cols-2 gap-6">

        {/* DIFETTI */}
        <div className="bg-white border rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="font-semibold">Difetti</div>
            <button onClick={addDefect} className="text-sm bg-black text-white px-3 py-1 rounded-lg">
              + Aggiungi
            </button>
          </div>

          {defects.map((d,i)=>{
            const active = selected.includes(i);

            return(
              <div
                key={i}
                onClick={()=>toggleDefect(i)}
                className={`flex justify-between items-center border rounded-xl px-4 py-3 cursor-pointer transition
                ${active ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'}`}
              >
                <span>{d.label}</span>

                <div className="flex items-center gap-2">

                  {/* ▼ */}
                  <button
                    onClick={(e)=>{e.stopPropagation(); decreasePenalty(i);}}
                    className="w-6 h-6 rounded-md border flex items-center justify-center text-xs"
                  >▼</button>

                  <span className="text-orange-500 font-semibold w-14 text-right">
                    -€{d.penalty}
                  </span>

                  {/* ▲ */}
                  <button
                    onClick={(e)=>{e.stopPropagation(); increasePenalty(i);}}
                    className="w-6 h-6 rounded-md border flex items-center justify-center text-xs"
                  >▲</button>

                  {/* ❌ */}
                  <button
                    onClick={(e)=>{e.stopPropagation(); removeDefect(i);}}
                    className="ml-2 text-red-500"
                  >✕</button>

                </div>
              </div>
            )
          })}
        </div>

        {/* RISULTATO */}
        <div className="border rounded-2xl p-6 bg-green-50 space-y-4">
          <div className="text-sm">Prezzo ritiro LIVE</div>
          <div className="text-5xl font-bold text-green-600">€{finalPrice}</div>

          <div className="pt-4 border-t flex justify-between text-sm">
            <span>Penalità</span>
            <span className="text-orange-500 font-semibold">
              -€{totalPenalty}
            </span>
          </div>

          <button
            onClick={saveValuationLive}
            className="mt-4 bg-black text-white rounded-xl px-4 py-2"
          >
            🖨️ Stampa valutazione
          </button>
        </div>

      </div>
    </div>
  );
}
