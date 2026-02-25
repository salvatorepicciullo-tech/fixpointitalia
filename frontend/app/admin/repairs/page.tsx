'use client';
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react';

type Repair = {
  id: number;
  name: string;
  active: number;
};

type DeviceType = {
  id: number;
  name: string;
};

export default function RepairsPage() {
  const [items, setItems] = useState<Repair[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  /* =========================
     LOAD REPAIRS
  ========================= */
  const load = async () => {

    let url = '/api/repairs';

    if (deviceTypeId) {
      url += `?device_type_id=${deviceTypeId}`;
    }

    const res = await apiFetch(url);
    setItems(await res.json());
  };

  /* =========================
     LOAD DEVICE TYPES
  ========================= */
  useEffect(() => {
    apiFetch('/api/device-types')
      .then(r => r.json())
      .then(setDeviceTypes);
  }, []);

  /* =========================
     AUTO LOAD WHEN FILTER CHANGES
  ========================= */
  useEffect(() => {
    load();
  }, [deviceTypeId]);

  /* =========================
   ADD REPAIR
========================= */
const add = async () => {
  if (!name.trim()) return;

  // 🔥 obbliga selezione dispositivo (evita salvataggi invisibili)
  if (!deviceTypeId) {
    alert('Seleziona prima il tipo dispositivo');
    return;
  }

  await apiFetch('/api/repairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      device_type_id: deviceTypeId
    }),
  });

  setName('');
  load();
};


  /* =========================
     START EDIT
  ========================= */
  const startEdit = (r: Repair) => {
    setEditingId(r.id);
    setEditingName(r.name);
  };

  /* =========================
     SAVE EDIT
  ========================= */
  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    await apiFetch(`/api/repairs/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName }),
    });

    setEditingId(null);
    setEditingName('');
    load();
  };

  /* =========================
     DELETE
  ========================= */
  const remove = async (id: number) => {
    if (!confirm('Sei sicuro di eliminare questa riparazione?')) return;

    await apiFetch(`/api/repairs/${id}`, {
      method: 'DELETE',
    });

    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Riparazioni</h1>

      {/* 🔥 FILTRO DEVICE TYPE */}
      <div className="flex gap-2 mb-6 flex-wrap">

        <select
          className="border px-3 py-2 rounded"
          value={deviceTypeId ?? ''}
          onChange={e =>
            setDeviceTypeId(
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">Tutti i dispositivi</option>
          {deviceTypes.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Nuova riparazione"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          type="button"
          onClick={add}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Aggiungi
        </button>

      </div>

      {/* LISTA */}
      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="border rounded px-4 py-2 bg-white flex justify-between items-center"
          >
            {editingId === r.id ? (
              <div className="flex gap-2">
                <input
                  className="border px-2 py-1 rounded"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Salva
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-400 text-white px-2 py-1 rounded"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <>
                <span>{r.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(r)}
                    className="text-blue-600 text-sm"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="text-red-600 text-sm"
                  >
                    Elimina
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
