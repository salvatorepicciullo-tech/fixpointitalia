'use client';
import { API } from '@/lib/api';
import { useEffect, useState } from 'react';

const API_URL = API;

type Defect = {
  id: number;
  name: string;
};

export default function AdminDefectsPage() {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const [defects, setDefects] = useState<Defect[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  /* =======================
     LOAD DEFECTS
  ======================= */
  const loadDefects = async () => {
    if (!token) return;

    const res = await fetch(`${API_URL}/api/admin/defects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setDefects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadDefects();
  }, []);

  /* =======================
     CREATE DEFECT
  ======================= */
  const createDefect = async () => {
    if (!newName.trim() || !token) return;

    setLoading(true);

    await fetch(`${API_URL}/api/admin/defects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName.trim() }),
    });

    setNewName('');
    setLoading(false);
    loadDefects();
  };

  /* =======================
     DELETE DEFECT
  ======================= */
  const deleteDefect = async (id: number) => {
    if (!token) return;

    const ok = window.confirm('Eliminare questo difetto?');
    if (!ok) return;

    await fetch(`${API_URL}/api/admin/defects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadDefects();
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="space-y-8 max-w-3xl">

      <div>
        <h1 className="text-2xl font-semibold">Difetti</h1>
        <p className="text-sm text-gray-500">
          Gestione lista difetti globale (senza valori)
        </p>
      </div>

      {/* ADD DEFECT */}
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h2 className="font-medium">Nuovo difetto</h2>

        <div className="flex gap-3">
          <input
            className="border rounded px-4 py-2 flex-1"
            placeholder="Es. Schermo rotto"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />

          <button
            onClick={createDefect}
            disabled={loading || !newName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            + Aggiungi
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Nome difetto</th>
              <th className="text-right p-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {defects.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
                  Nessun difetto presente
                </td>
              </tr>
            ) : (
              defects.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-3">{d.name}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteDefect(d.id)}
                      className="text-red-600 text-sm"
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
