'use client';

import { apiFetch } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';

type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string; device_type_id?: number; brand_id?: number };

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

  /* =========================
     LOAD INITIAL DATA
  ========================= */
  useEffect(() => {
    apiFetch('/api/device-types', { cache: 'no-store' })
      .then(r => r.json())
      .then(setDeviceTypes);

    apiFetch('/api/brands', { cache: 'no-store' })
      .then(r => r.json())
      .then(setBrands);
  }, []);

  /* =========================
     LOAD MODELS
  ========================= */
  const loadModels = useCallback(async (dtId: number, bId: number) => {
    try {
      const res = await apiFetch(
        `/api/models?device_type_id=${dtId}&brand_id=${bId}`,
        { cache: 'no-store' }
      );

      const data = await res.json();
      setModels([...data]); // 🔥 forza rerender
    } catch (e) {
      console.error('LOAD MODELS ERROR', e);
    }
  }, []);

  useEffect(() => {
    if (!deviceTypeId || !brandId) {
      setModels([]);
      return;
    }
    loadModels(deviceTypeId, brandId);
  }, [deviceTypeId, brandId, loadModels]);

/* =========================
   ADD MODEL (DEFINITIVO NO REFLASH)
========================= */
const addModel = async () => {
  if (!modelName || !deviceTypeId || !brandId) return;

  try {
    const res = await apiFetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: modelName,
        device_type_id: deviceTypeId,
        brand_id: brandId,
      }),
    });

    if (!res.ok) throw new Error();

    const newModel: Model = await res.json();

    // ✅ update diretto stato locale
    setModels(prev => [...prev, newModel]);

    setModelName('');
  } catch (e) {
    console.error(e);
  }
};
  /* =========================
     IMPORT SINGOLO
  ========================= */
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
    await loadModels(deviceTypeId, brandId);
  };

  /* =========================
     MULTI IMPORT
  ========================= */
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

   if (deviceTypeId && brandId) {
  await loadModels(deviceTypeId, brandId);
}
  };

  /* =========================
     EDIT
  ========================= */
  const startEdit = (m: Model) => {
    setEditingId(m.id);
    setEditingName(m.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    // 🔥 update immediato UI
    setModels(prev =>
      prev.map(m =>
        m.id === editingId ? { ...m, name: editingName } : m
      )
    );

    try {
      await apiFetch(`/api/models/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });

      setEditingId(null);
      setEditingName('');
    } catch (e) {
      console.error(e);
    }
  };

/* =========================
   DELETE (DEFINITIVO NO REFLASH)
========================= */
const remove = async (id: number) => {
  if (!confirm('Sei sicuro di eliminare questo modello?')) return;

  const backup = models;

  // ✅ sparisce subito
  setModels(prev => prev.filter(m => m.id !== id));

  try {
    const res = await apiFetch(`/api/models/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error();
  } catch (e) {
    console.error(e);
    // rollback in caso di errore
    setModels(backup);
  }
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
            setModels([]);
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