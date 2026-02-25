'use client';
import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

type DeviceType = {
  id: number;
  name: string;
  active: number;
};

export default function DeviceTypesPage() {
  const [items, setItems] = useState<DeviceType[]>([]);
  const [name, setName] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const [usedMap, setUsedMap] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ LOAD CORRETTO (NO REFRESH PAGINA)
  const load = async () => {
    try {
      const res = await apiFetch('/api/device-types');
      const data: DeviceType[] = await res.json();

      setItems([...data]);

      const usageEntries = await Promise.all(
        data.map(async (d) => {
          try {
            const r = await apiFetch(`/api/device-types/${d.id}/used`);
            if (!r.ok) return [d.id, false] as const;
            const info = await r.json();
            return [d.id, info.used] as const;
          } catch {
            return [d.id, false] as const;
          }
        })
      );

      const usageMap = Object.fromEntries(usageEntries);
      setUsedMap(usageMap);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ AGGIUNGI SENZA REFRESH
  const add = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await apiFetch('/api/device-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      setError('Errore durante il salvataggio');
      return;
    }

    const newItem = await res.json();

    setItems((prev) => [...prev, newItem]);
    setName('');
    setMessage('Tipo dispositivo aggiunto con successo');
  };

  // ✅ MODIFICA LIVE
  const startEdit = (item: DeviceType) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    const res = await apiFetch(`/api/device-types/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName, active: 1 }),
    });

    if (!res.ok) return;

    setItems((prev) =>
      prev.map((x) =>
        x.id === editingId ? { ...x, name: editingName } : x
      )
    );

    setEditingId(null);
    setEditingName('');
  };

  // ✅ ELIMINA LIVE
  const remove = async (id: number) => {
    if (!confirm('Sei sicuro di eliminare questo tipo dispositivo?')) return;

    const res = await apiFetch(`/api/device-types/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) return;

    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tipi dispositivo</h1>

      {message && (
        <div className="mb-4 text-green-700 bg-green-100 px-4 py-2 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Nuovo tipo dispositivo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={add}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Salvataggio...' : 'Aggiungi'}
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((d) => (
          <li
            key={d.id}
            className="border rounded px-4 py-2 bg-white flex justify-between items-center"
          >
            {editingId === d.id ? (
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
                <span>{d.name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(d)}
                    className="text-blue-600 text-sm"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => remove(d.id)}
                    disabled={usedMap[d.id]}
                    className={`text-sm ${
                      usedMap[d.id]
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600'
                    }`}
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