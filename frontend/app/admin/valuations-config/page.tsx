'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };

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

  /* =======================
     LOAD BASE DATA
  ======================= */

  useEffect(() => {
    apiFetch('/api/device-types')
      .then(r => r.json())
      .then(setDeviceTypes);

    apiFetch('/api/brands')
      .then(r => r.json())
      .then(setBrands);
  }, []);

  useEffect(() => {
    if (!token) return;

    apiFetch('/api/admin/valuation-configs', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setConfigs);
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

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Dispositivo</th>
              <th className="text-left p-3">Marca</th>
              <th className="text-left p-3">Modello</th>
              <th className="text-right p-3">Valore</th>
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
                  <td className="p-3 text-right">€ {c.max_value}</td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

    </div>
  );
}