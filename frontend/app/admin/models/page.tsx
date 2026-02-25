'use client';

import { apiFetch } from '@/lib/api';
import { API } from '@/lib/api';
import { useEffect, useState } from 'react';

type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };

export default function ModelsPage() {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelName, setModelName] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    apiFetch('/api/device-types')
      .then(r => r.json())
      .then(setDeviceTypes);

    apiFetch('/api/brands')
      .then(r => r.json())
      .then(setBrands);
  }, []);

 const loadModels = async (dtId: number, bId: number) => {
  const res = await apiFetch(`/api/models?device_type_id=${dtId}&brand_id=${bId}`);
  setModels(await res.json());
};

  useEffect(() => {
    if (!deviceTypeId || !brandId) {
      setModels([]);
      return;
    }
    loadModels(deviceTypeId, brandId);
  }, [deviceTypeId, brandId]);

  const addModel = async () => {
    if (!modelName || !deviceTypeId || !brandId) return;

    await apiFetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: modelName,
        device_type_id: deviceTypeId,
        brand_id: brandId,
      }),
    });

    setModelName('');
    loadModels(deviceTypeId, brandId);
  };

  // IMPORT SINGOLO (ANTI DUPLICATI)
  const importModelsFromFile = async () => {
    if (!importFile || !deviceTypeId || !brandId) return;

    setImporting(true);

    const text = await importFile.text();

    const lines = text
      .split('\n')
      .map(l => l.replace('name', '').trim())
      .filter(Boolean);

    const existingNames = new Set(
      models.map(m => m.name.toLowerCase().trim())
    );

    let inserted = 0;
    let skipped = 0;

    for (const name of lines) {
      const clean = name.toLowerCase().trim();

      if (existingNames.has(clean)) {
        skipped++;
        continue;
      }

      await apiFetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          device_type_id: deviceTypeId,
          brand_id: brandId,
        }),
      });

      existingNames.add(clean);
      inserted++;
    }

    setImportFile(null);
    setImporting(false);

    alert(`Import completato ✅\nNuovi: ${inserted}\nDuplicati: ${skipped}`);
    loadModels(deviceTypeId, brandId);
  };

  // 🔥 IMPORT MULTI BRAND AUTOMATICO
  const detectBrandId = (fileName: string) => {
    const name = fileName.toLowerCase();
    const found = brands.find(b =>
      name.includes(b.name.toLowerCase())
    );
    return found ? found.id : null;
  };

  const importModelsFromFiles = async () => {
    if (!deviceTypeId || importFiles.length === 0) return;

    setImporting(true);

    let inserted = 0;
    let skipped = 0;

    const existingNames = new Set(
      models.map(m => m.name.toLowerCase().trim())
    );

    for (const file of importFiles) {
      const autoBrandId = detectBrandId(file.name);
      if (!autoBrandId) continue;

      const text = await file.text();

      const lines = text
        .split('\n')
        .map(l => l.replace('name', '').trim())
        .filter(Boolean);

      for (const name of lines) {
        const clean = name.toLowerCase().trim();

        if (existingNames.has(clean)) {
          skipped++;
          continue;
        }

        await apiFetch('/api/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            device_type_id: deviceTypeId,
            brand_id: autoBrandId,
          }),
        });

        existingNames.add(clean);
        inserted++;
      }
    }

    setImportFiles([]);
    setImporting(false);

  alert(`Import MULTI 🚀\nNuovi: ${inserted}\nDuplicati: ${skipped}`);

// 🔥 reload solo se brand selezionato manualmente
if (deviceTypeId && brandId) {
  loadModels(deviceTypeId, brandId);
}
};


  const startEdit = (m: Model) => {
    setEditingId(m.id);
    setEditingName(m.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    await apiFetch(`/api/models/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName }),
    });

    setEditingId(null);
    setEditingName('');
    if (deviceTypeId && brandId) loadModels(deviceTypeId, brandId);
  };

  const remove = async (id: number) => {
    if (!confirm('Sei sicuro di eliminare questo modello?')) return;

    await apiFetch(`/api/models/${id}`, {
      method: 'DELETE',
    });

    if (deviceTypeId && brandId) loadModels(deviceTypeId, brandId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modelli</h1>

      <div className="flex gap-4 mb-6 flex-wrap">

        <select
          className="border px-3 py-2 rounded"
          value={deviceTypeId ?? ''}
          onChange={e => {
            const val = e.target.value;
            setDeviceTypeId(val === '' ? null : parseInt(val));
            setBrandId(null);
          }}
        >
          <option value="">Tipo dispositivo</option>
          {deviceTypes.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={brandId ?? ''}
          onChange={e => {
            const val = e.target.value;
            setBrandId(val === '' ? null : parseInt(val));
          }}
          disabled={!deviceTypeId}
        >
          <option value="">Marca</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <input
          className="border px-3 py-2 rounded"
          placeholder="Nome modello"
          value={modelName}
          onChange={e => setModelName(e.target.value)}
          disabled={!deviceTypeId || !brandId}
        />

        <button
          onClick={addModel}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!modelName || !deviceTypeId || !brandId}
        >
          Aggiungi
        </button>

        {/* IMPORT SINGOLO */}
        <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer">
          Seleziona file
          <input
            type="file"
            accept=".txt,.csv"
            className="hidden"
            onChange={e => setImportFile(e.target.files?.[0] || null)}
            disabled={!deviceTypeId || !brandId}
          />
        </label>

        <button
          onClick={importModelsFromFile}
          className="bg-purple-600 text-white px-4 py-2 rounded"
          disabled={!importFile || importing}
        >
          {importing ? 'Importazione...' : 'Importa lista'}
        </button>

        {/* 🔥 IMPORT MULTI BRAND */}
       <div className="flex flex-col gap-2">

  <label className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 transition w-fit">
    Seleziona file multipli
    <input
      type="file"
      multiple
      accept=".txt,.csv"
      className="hidden"
      onChange={e =>
        setImportFiles(Array.from(e.target.files || []))
      }
    />
  </label>

  {/* 🔥 LISTA FILE SELEZIONATI */}
  {importFiles.length > 0 && (
    <div className="bg-gray-100 border rounded p-3 text-sm">
      <div className="font-semibold mb-1">
        File pronti per import:
      </div>

      {importFiles.map((f, i) => (
        <div key={i} className="text-green-700">
          ✔ {f.name}
        </div>
      ))}
    </div>
  )}

  <button
    onClick={importModelsFromFiles}
    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 active:scale-95 transition w-fit"
    disabled={importFiles.length === 0 || importing}
  >
    {importing ? 'Importazione...' : 'IMPORT MULTI-BRAND'}
  </button>

</div>

      </div>

      <ul className="space-y-2">
        {models.map(m => (
          <li key={m.id} className="border rounded px-4 py-2 bg-white flex justify-between">
            {editingId === m.id ? (
              <div className="flex gap-2">
                <input
                  className="border px-2 py-1 rounded"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                />
                <button onClick={saveEdit} className="bg-green-600 text-white px-2 py-1 rounded">Salva</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Annulla</button>
              </div>
            ) : (
              <>
                <span>{m.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(m)} className="text-blue-600 text-sm">Modifica</button>
                  <button onClick={() => remove(m.id)} className="text-red-600 text-sm">Elimina</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
