'use client';
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';



type Defect = {
  id: number;
  name: string;
  penalty?: number;
};

export default function ModelValuationPage() {
  const params = useParams();
  const modelId = params.id as string;

  const [maxValue, setMaxValue] = useState<number>(0);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD BASE VALUE + DEFECTS
  ======================= */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/models/${modelId}/base-value`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/defects`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([baseValue, defects]) => {
        if (baseValue?.max_value) setMaxValue(baseValue.max_value);
        setDefects(defects.map((d: any) => ({ ...d, penalty: d.penalty || 0 })));
      })
      .finally(() => setLoading(false));
  }, [modelId]);

  /* =======================
     SAVE BASE VALUE
  ======================= */
  const saveBaseValue = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/models/${modelId}/base-value`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ max_value: maxValue }),
    });

    alert('Valore massimo salvato');
  };

  /* =======================
     SAVE DEFECT PENALTY
  ======================= */
  const savePenalty = async (defectId: number, penalty: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/models/${modelId}/defects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ defect_id: defectId, penalty }),
    });

    alert('Penalità salvata');
  };

  if (loading) return <p>Caricamento…</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Valutazione modello</h1>

      {/* =======================
          VALORE MASSIMO
      ======================= */}
      <div style={{ marginBottom: 24 }}>
        <h3>Valore massimo (€)</h3>
        <input
          type="number"
          value={maxValue}
          onChange={e => setMaxValue(Number(e.target.value))}
        />
        <button onClick={saveBaseValue} style={{ marginLeft: 8 }}>
          Salva
        </button>
      </div>

      {/* =======================
          DIFETTI
      ======================= */}
      <h3>Difetti e penalità</h3>

      {defects.map(d => (
        <div
          key={d.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ flex: 1 }}>{d.name}</span>
          <input
            type="number"
            placeholder="Penalità €"
            value={d.penalty}
            onChange={e =>
              setDefects(prev =>
                prev.map(p =>
                  p.id === d.id
                    ? { ...p, penalty: Number(e.target.value) }
                    : p
                )
              )
            }
          />
          <button onClick={() => savePenalty(d.id, d.penalty || 0)}>
            Salva
          </button>
        </div>
      ))}
    </div>
  );
}
