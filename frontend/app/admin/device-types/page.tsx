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

  const [usedMap] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD SOLO AL MOUNT
  // ============================
  useEffect(() => {

    const load = async () => {

      const res = await apiFetch('/api/device-types',{
        cache:'no-store'
      });

      const data = await res.json();

      setItems(data);

    };

    load();

  }, []);

  // ============================
  // ADD DEFINITIVO
  // ============================
  const add = async () => {

    if(!name.trim()) return;

    setLoading(true);

    try{

      const res = await apiFetch('/api/device-types',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ name })
      });

      const newItem = await res.json();

      // 🔥 AGGIUNGE SUBITO SENZA RELOAD
      setItems(prev => [...prev,newItem]);

      setName('');

    }catch(e){
      console.error(e);
    }

    setLoading(false);
  };

  // ============================
  // START EDIT
  // ============================
  const startEdit = (d:DeviceType) => {
    setEditingId(d.id);
    setEditingName(d.name);
  };

  // ============================
  // SAVE EDIT DEFINITIVO
  // ============================
  const saveEdit = async () => {

    if(!editingId || !editingName.trim()) return;

    try{

      await apiFetch(`/api/device-types/${editingId}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ name:editingName })
      });

      setItems(prev =>
        prev.map(x =>
          x.id===editingId ? {...x,name:editingName}:x
        )
      );

      setEditingId(null);
      setEditingName('');

    }catch(e){
      console.error(e);
    }

  };

  // ============================
  // DELETE DEFINITIVO
  // ============================
  const remove = async(id:number)=>{

    if(!confirm('Sei sicuro?')) return;

    try{

      await apiFetch(`/api/device-types/${id}`,{
        method:'DELETE'
      });

      setItems(prev => prev.filter(x=>x.id!==id));

    }catch(e){
      console.error(e);
    }

  };

  // ============================
  // UI
  // ============================
  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">Tipi dispositivo</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Nuovo tipo dispositivo"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <button
          onClick={add}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading?'Salvataggio...':'Aggiungi'}
        </button>
      </div>

      <ul className="space-y-2">
        {items.map(d=>(
          <li key={d.id}
              className="border rounded px-4 py-2 bg-white flex justify-between items-center">

            {editingId===d.id ? (
              <div className="flex gap-2">
                <input
                  className="border px-2 py-1 rounded"
                  value={editingName}
                  onChange={(e)=>setEditingName(e.target.value)}
                />

                <button onClick={saveEdit}
                        className="bg-green-600 text-white px-2 py-1 rounded">
                  Salva
                </button>

                <button onClick={()=>setEditingId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded">
                  Annulla
                </button>
              </div>
            ):(
              <>
                <span>{d.name}</span>

                <div className="flex gap-3">
                  <button
                    onClick={()=>startEdit(d)}
                    className="text-blue-600 text-sm">
                    Modifica
                  </button>

                  <button
                    onClick={()=>remove(d.id)}
                    disabled={usedMap[d.id]}
                    className="text-red-600 text-sm">
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