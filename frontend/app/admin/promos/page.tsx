'use client';

import { useEffect, useState } from 'react';

type Promo = {
  id: number;
  title: string;
  image_url: string;
  active: number;
};

export default function AdminPromosPage() {

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [items, setItems] = useState<Promo[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= LOAD ================= */

  const load = async () => {
    if (!API || !token) return;

    try {
      const res = await fetch(`${API}/api/admin/promos`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (!res.ok) throw new Error('Load promos failed');

      const data = await res.json();
      setItems([...data]); // 🔥 forza render
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= ADD PROMO ================= */

  const addPromo = async () => {

    if (!file) {
      alert('Seleziona immagine');
      return;
    }

    if (!API || !token) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', file);

    try {
      const res = await fetch(`${API}/api/admin/promos/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const newPromo = await res.json();

      // 🔥 UPDATE LIVE ADMIN
      setItems(prev => [newPromo, ...prev]);

      // 🔥 UPDATE HOMEPAGE IN REALTIME
      window.dispatchEvent(new Event('promo-updated'));

      const bc = new BroadcastChannel('fixpoint-promos');
      bc.postMessage('updated');
      bc.close();

      setTitle('');
      setFile(null);

    } catch (e) {
      console.error(e);
      alert('Errore upload promo');
    }
  };

  /* ================= TOGGLE ================= */

  const toggle = async (id: number, active: number) => {

    if (!API || !token) return;

    try {
      await fetch(`${API}/api/admin/promos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: active ? 0 : 1 })
      });

      setItems(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, active: p.active ? 0 : 1 }
            : p
        )
      );

      window.dispatchEvent(new Event('promo-updated'));

    } catch (e) {
      console.error(e);
    }
  };

  /* ================= DELETE ================= */

  const remove = async (id: number) => {

    if (!API || !token) return;

    try {
      await fetch(`${API}/api/admin/promos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setItems(prev => prev.filter(p => p.id !== id));

      window.dispatchEvent(new Event('promo-updated'));

      const bc = new BroadcastChannel('fixpoint-promos');
      bc.postMessage('updated');
      bc.close();

    } catch (e) {
      console.error(e);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="max-w-4xl">

      <h1 className="text-2xl font-semibold mb-6">
        🔥 Promo Homepage PRO
      </h1>

      {/* CREATE */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 space-y-3">

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titolo promo"
          className="border px-4 py-2 rounded-xl w-full"
        />

        <input
          type="file"
          accept="image/*"
          onChange={e => {
            if (e.target.files?.[0])
              setFile(e.target.files[0]);
          }}
        />

        <button
          onClick={addPromo}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl"
        >
          Aggiungi Promo
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-4">
        {items.map(p => (

          <div
            key={p.id}
            className="flex gap-4 items-center bg-white border rounded-xl p-4"
          >

            {p.image_url && (
              <img
                src={`${API}${p.image_url}`}
                className="w-32 h-20 object-cover rounded-lg"
              />
            )}

            <div className="flex-1">
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-gray-400">
                {p.active ? 'Attiva' : 'Disattiva'}
              </div>
            </div>

            <button
              onClick={() => toggle(p.id, p.active)}
              className="bg-yellow-100 px-3 py-1 rounded"
            >
              Toggle
            </button>

            <button
              onClick={() => remove(p.id)}
              className="bg-red-100 px-3 py-1 rounded"
            >
              Elimina
            </button>

          </div>

        ))}
      </div>

    </div>
  );
}