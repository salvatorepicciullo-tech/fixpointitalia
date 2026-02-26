'use client';
import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

type Brand = {
  id: number;
  name: string;
  active: number;
};

export default function BrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const load = async () => {
    const res = await apiFetch('/api/brands');
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  // aggiunge
  const add = async () => {
    if (!name.trim()) return;

    await apiFetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    setName('');
    load();
  };

  // avvia modifica
  const startEdit = (item: Brand) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  // salva modifica
  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    await apiFetch(`/api/brands/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName, active: 1 }),
    });

    setEditingId(null);
    setEditingName('');
    load();
  };

  // elimina
  const remove = async (id: number) => {
    if (!confirm('Sei sicuro di eliminare questa marca?')) return;

    await apiFetch(`/api/brands/${id}`, {
      method: 'DELETE',
    });

    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marche</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Nuova marca"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={add}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Aggiungi
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((b) => (
          <li
            key={b.id}
            className="border rounded px-4 py-2 bg-white flex justify-between items-center"
          >
            {editingId === b.id ? (
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
                <span>{b.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(b)}
                    className="text-blue-600 text-sm"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => remove(b.id)}
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
