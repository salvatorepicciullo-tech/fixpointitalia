'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };
type Defect = { id: number; name: string };

type ConfigRow = {
  device_type: string;
  brand: string;
  model: string;
  brand_id: number;
  model_id: number;
  max_value: number;
};

export default function ValuationsConfigPage() {

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
  }, []);

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [configs, setConfigs] = useState<ConfigRow[]>([]);

  /* =======================
     FILTRI PRO
  ======================= */

  const [filterDevice, setFilterDevice] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
const [newDeviceType, setNewDeviceType] = useState('');
const [newBrand, setNewBrand] = useState('');
const [newModel, setNewModel] = useState('');
const [newMaxValue, setNewMaxValue] = useState('');
const [availableModels, setAvailableModels] = useState<any[]>([]);
  /* =======================
     LOAD BASE DATA
  ======================= */

  useEffect(() => {
    fetch(`${API_URL}/api/device-types`)
      .then(r => r.json())
      .then(setDeviceTypes);

    fetch(`${API_URL}/api/brands`)
      .then(r => r.json())
      .then(setBrands);
  }, []);

useEffect(() => {
  if (!newDeviceType || !newBrand) return;

  fetch(`${API_URL}/api/models?device_type_id=${newDeviceType}&brand_id=${newBrand}`)
    .then(r => r.json())
    .then(setAvailableModels);

}, [newDeviceType, newBrand]);



useEffect(() => {
  if (!token) return;

  fetch(`${API_URL}/api/admin/valuation-configs`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => {
      setConfigs(Array.isArray(data) ? data : []);
    });
}, [token]);


  /* =======================
     LISTE DINAMICHE FILTRO
  ======================= */

  const uniqueDevices = [...new Set(configs.map(c => c.device_type))];

  const uniqueBrands = [
    ...new Set(
      configs
        .filter(c => !filterDevice || c.device_type === filterDevice)
        .map(c => c.brand)
    ),
  ];

  const uniqueModels = [
    ...new Set(
      configs
        .filter(c =>
          (!filterDevice || c.device_type === filterDevice) &&
          (!filterBrand || c.brand === filterBrand)
        )
        .map(c => c.model)
    ),
  ];

  /* =======================
     FILTRO FINALE
  ======================= */

  const filteredConfigs = configs.filter(c => {

    if (filterDevice && c.device_type !== filterDevice) return false;
    if (filterBrand && c.brand !== filterBrand) return false;
    if (filterModel && c.model !== filterModel) return false;

    return true;
  });

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-semibold">Configurazione Valutazioni</h1>
        <p className="text-sm text-gray-500">
          Gestione valori e penalità dispositivi
        </p>
      </div>

      {/* 🔥 FILTRO DROPDOWN PRO */}
      <div className="bg-white rounded shadow p-4 grid md:grid-cols-3 gap-3">

        <select
          className="border rounded px-3 py-2"
          value={filterDevice}
          onChange={e => {
            setFilterDevice(e.target.value);
            setFilterBrand('');
            setFilterModel('');
          }}
        >
          <option value="">Tutti i dispositivi</option>
          {uniqueDevices.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={filterBrand}
          onChange={e => {
            setFilterBrand(e.target.value);
            setFilterModel('');
          }}
        >
          <option value="">Tutte le marche</option>
          {uniqueBrands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={filterModel}
          onChange={e => setFilterModel(e.target.value)}
        >
          <option value="">Tutti i modelli</option>
          {uniqueModels.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

      </div>


      {/* AGGIUNGI MODELLO ALLA VALUTAZIONE */}
<div className="bg-white rounded shadow p-4 space-y-3">

  <h2 className="font-semibold">Aggiungi modello alla valutazione</h2>

  <div className="grid md:grid-cols-4 gap-3">

    <select
      className="border rounded px-3 py-2"
      value={newDeviceType}
      onChange={e => {
        setNewDeviceType(e.target.value);
        setNewBrand('');
        setNewModel('');
      }}
    >
      <option value="">Dispositivo</option>
      {deviceTypes.map(d => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>

    <select
      className="border rounded px-3 py-2"
      value={newBrand}
      onChange={e => {
        setNewBrand(e.target.value);
        setNewModel('');
      }}
    >
      <option value="">Marca</option>
      {brands.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>

    <select
      className="border rounded px-3 py-2"
      value={newModel}
      onChange={e => setNewModel(e.target.value)}
    >
      <option value="">Modello</option>
      {availableModels.map(m => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>

    <input
      type="number"
      placeholder="Valore massimo €"
      className="border rounded px-3 py-2"
      value={newMaxValue}
      onChange={e => setNewMaxValue(e.target.value)}
    />

  </div>

  <button
    className="bg-blue-600 text-white px-4 py-2 rounded"
    onClick={async () => {

      if (!newModel || !newMaxValue) {
        alert('Compila tutti i campi');
        return;
      }

      await fetch(`${API_URL}/api/admin/models/${newModel}/base-value`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ max_value: Number(newMaxValue) })
      });

      // ricarica lista
      const r = await fetch(`${API_URL}/api/admin/valuation-configs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      setConfigs(Array.isArray(data) ? data : []);

      setNewDeviceType('');
      setNewBrand('');
      setNewModel('');
      setNewMaxValue('');

    }}
  >
    Aggiungi
  </button>

</div>


      {/* LISTA */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Dispositivo</th>
              <th className="text-left p-3">Marca</th>
              <th className="text-left p-3">Modello</th>
              <th className="text-right p-3">Valore</th>
              <th className="text-center p-3">Azioni</th>
            </tr>
          </thead>
          <tbody>

            {filteredConfigs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Nessuna configurazione trovata
                </td>
              </tr>
            ) : (
            filteredConfigs.map(c => (
  <tr key={c.model_id} className="border-t">
    <td className="p-3">{c.device_type}</td>
    <td className="p-3">{c.brand}</td>
    <td className="p-3">{c.model}</td>

    {/* PREZZO MODIFICABILE */}
    <td className="p-3 text-right">
      <input
        type="number"
        defaultValue={c.max_value}
        className="border rounded px-2 py-1 w-24 text-right"
        onBlur={async (e) => {
          const newValue = Number(e.target.value);

          await fetch(`${API_URL}/api/admin/models/${c.model_id}/base-value`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ max_value: newValue })
          });

        const r = await fetch(`${API_URL}/api/admin/valuation-configs`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await r.json();
setConfigs(Array.isArray(data) ? data : []);
        }}
      />
    </td>

   {/* COLONNA AZIONI */}
<td className="p-3 text-center space-x-3">

  <a
    href={`/admin/model-valuation/${c.model_id}`}
    className="text-blue-600 hover:underline"
  >
    Penalità
  </a>

  <button
    className="text-red-600 hover:underline"
    onClick={async () => {
      if (!confirm('Eliminare configurazione?')) return;

      await fetch(`${API_URL}/api/admin/models/${c.model_id}/valuation-config`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const r = await fetch(`${API_URL}/api/admin/valuation-configs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      setConfigs(Array.isArray(data) ? data : []);
    }}
  >
    Elimina
  </button>

</td>
  </tr>
))
            )}

          </tbody>
        </table>
      </div>

    </div>
  );
}
