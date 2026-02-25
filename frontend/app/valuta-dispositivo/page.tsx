'use client';

import { useState } from 'react';

type Defect = {
  label: string;
  penalty: number;
};

export default function QuickValuationTool() {

  /* ==========================
     VALORI BASE (demo)
     dopo li collegheremo API
  ========================== */

  const basePrice = 680;
  const sellPrice = 1230;

  const defects: Defect[] = [
    { label: 'Batteria sotto 85%', penalty: 50 },
    { label: 'Graffi schermo', penalty: 80 },
    { label: 'Scocca rovinata', penalty: 60 },
    { label: 'Difetti funzionali', penalty: 150 },
  ];

  const [selected, setSelected] = useState<number[]>([]);

  /* ==========================
     TOGGLE DIFETTI
  ========================== */

  const toggleDefect = (index: number) => {
    setSelected(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  /* ==========================
     CALCOLO LIVE
  ========================== */

  const totalPenalty = selected.reduce(
    (sum, i) => sum + defects[i].penalty,
    0
  );

  const finalPrice = basePrice - totalPenalty;
  const margin = sellPrice - finalPrice;

  /* ==========================
     UI
  ========================== */

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Valutazione rapida dispositivo
        </h1>
        <p className="text-sm text-gray-500">
          Tool interno FixPoint — aggiornamento LIVE
        </p>
      </div>

      {/* SELEZIONE DEVICE */}
      <div className="bg-white border rounded-2xl p-6 space-y-4">
        <div className="font-semibold text-lg">
          Seleziona dispositivo
        </div>

        <div className="grid grid-cols-4 gap-4">
          <select className="border rounded-xl px-3 py-2">
            <option>Apple</option>
          </select>

          <select className="border rounded-xl px-3 py-2">
            <option>iPhone 16 Pro</option>
          </select>

          <select className="border rounded-xl px-3 py-2">
            <option>512GB</option>
          </select>

          <input
            placeholder="IMEI / Serial"
            className="border rounded-xl px-3 py-2"
          />
        </div>
      </div>

      {/* PREZZI */}
      <div className="grid grid-cols-3 gap-6">

        <div className="border rounded-2xl p-6 bg-orange-50">
          <div className="text-sm text-gray-600">Prezzo acquisto</div>
          <div className="text-3xl font-bold text-orange-600">
            €{basePrice}
          </div>
        </div>

        <div className="border rounded-2xl p-6 bg-green-50">
          <div className="text-sm text-gray-600">Prezzo vendita</div>
          <div className="text-3xl font-bold text-green-600">
            €{sellPrice}
          </div>
        </div>

        <div className="border rounded-2xl p-6">
          <div className="text-sm text-gray-600">Margine LIVE</div>
          <div className="text-3xl font-bold">
            €{margin}
          </div>
        </div>

      </div>

      {/* PENALITA + RISULTATO */}
      <div className="grid grid-cols-2 gap-6">

        {/* DIFETTI */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div className="font-semibold text-lg">
            Difetti (LIVE)
          </div>

          {defects.map((d, i) => {

            const active = selected.includes(i);

            return (
              <div
                key={i}
                onClick={() => toggleDefect(i)}
                className={`flex justify-between items-center border rounded-xl px-4 py-3 cursor-pointer transition
                ${active ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'}
                `}
              >
                <span>{d.label}</span>
                <span className="text-orange-500 font-semibold">
                  -€{d.penalty}
                </span>
              </div>
            );
          })}
        </div>

        {/* RISULTATO */}
        <div className="border rounded-2xl p-6 bg-green-50 space-y-4">
          <div className="text-sm text-gray-600">
            Prezzo di ritiro LIVE
          </div>

          <div className="text-5xl font-bold text-green-600">
            €{finalPrice}
          </div>

          <div className="pt-4 border-t flex justify-between text-sm">
            <span>Penalità totali</span>
            <span className="font-semibold text-orange-500">
              -€{totalPenalty}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
