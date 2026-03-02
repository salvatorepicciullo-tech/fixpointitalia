'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = 'http://localhost:3001';

export default function ModelValuationPage() {

  const { id } = useParams();
  const [token, setToken] = useState<string | null>(null);

  const [allDefects, setAllDefects] = useState<any[]>([]);
  const [modelPenalties, setModelPenalties] = useState<any[]>([]);
  const [newDefectName, setNewDefectName] = useState('');
  const [selectedDefect, setSelectedDefect] = useState('');
  const [selectedPenalty, setSelectedPenalty] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (!token || !id) return;

    loadData();

  }, [token, id]);

  const loadData = async () => {

    const d = await fetch(`${API_URL}/api/admin/defects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAllDefects(await d.json());

    const p = await fetch(`${API_URL}/api/admin/models/${id}/defect-penalties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setModelPenalties(await p.json());
  };

  const updatePenalty = (defectId: number, value: number) => {
    setModelPenalties(prev =>
      prev.map(p =>
        p.defect_id === defectId ? { ...p, penalty: value } : p
      )
    );
  };

  const removePenalty = async (defectId: number) => {

    await fetch(`${API_URL}/api/admin/models/${id}/defect-penalties/${defectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    loadData();
  };
const saveAll = async () => {

  const cleanPenalties = modelPenalties
    .filter(p => p.defect_id && !isNaN(p.penalty))
    .map(p => ({
      defect_id: Number(p.defect_id),
      penalty: Math.abs(Number(p.penalty))
    }));

  await fetch(`${API_URL}/api/admin/models/${id}/defect-penalties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      penalties: cleanPenalties
    })
  });

  await loadData();

  alert('Penalità salvate correttamente');
};
  const addExistingDefect = () => {

    if (!selectedDefect || !selectedPenalty) return;

    const exists = modelPenalties.find(p => p.defect_id == selectedDefect);
    if (exists) {
      alert('Difetto già presente');
      return;
    }

    const defectObj = allDefects.find(d => d.id == selectedDefect);

    setModelPenalties(prev => [
      ...prev,
      {
        defect_id: Number(selectedDefect),
        name: defectObj.name,
        penalty: Number(selectedPenalty)
      }
    ]);

    setSelectedDefect('');
    setSelectedPenalty('');
  };

  const createNewDefect = async () => {

    if (!newDefectName) return;

    await fetch(`${API_URL}/api/admin/defects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newDefectName })
    });

    setNewDefectName('');
    loadData();
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold">
        Configura penalità modello
      </h1>

      {/* LISTA PENALITÀ MODELLO */}
      <div className="bg-white rounded shadow p-6 space-y-4">

        {modelPenalties.map(p => (
          <div key={p.defect_id} className="flex justify-between items-center border-b pb-2">

            <span>{p.name}</span>

            <div className="flex items-center gap-3">

              <input
                type="number"
                className="border rounded px-2 py-1 w-24 text-right"
                value={p.penalty}
                onChange={(e) =>
                  updatePenalty(p.defect_id, Number(e.target.value))
                }
              />

              <button
                className="text-red-600 hover:underline"
                onClick={() => removePenalty(p.defect_id)}
              >
                Rimuovi
              </button>

            </div>

          </div>
        ))}

        <button
          onClick={saveAll}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Salva penalità
        </button>

      </div>

      {/* AGGIUNGI DIFETTO ESISTENTE */}
      <div className="bg-white rounded shadow p-6 space-y-3">

        <h2 className="font-semibold">Aggiungi difetto esistente</h2>

        <div className="flex gap-3">

          <select
            className="border rounded px-3 py-2"
            value={selectedDefect}
            onChange={e => setSelectedDefect(e.target.value)}
          >
            <option value="">Seleziona difetto</option>
            {allDefects.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Penalità €"
            className="border rounded px-3 py-2"
            value={selectedPenalty}
            onChange={e => setSelectedPenalty(e.target.value)}
          />

          <button
            onClick={addExistingDefect}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Aggiungi
          </button>

        </div>

      </div>

      {/* CREA NUOVO DIFETTO GLOBALE */}
      <div className="bg-white rounded shadow p-6 space-y-3">

        <h2 className="font-semibold">Crea nuovo difetto globale</h2>

        <div className="flex gap-3">

          <input
            type="text"
            placeholder="Nome difetto"
            className="border rounded px-3 py-2"
            value={newDefectName}
            onChange={e => setNewDefectName(e.target.value)}
          />

          <button
            onClick={createNewDefect}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Crea
          </button>

        </div>

      </div>

    </div>
  );
}