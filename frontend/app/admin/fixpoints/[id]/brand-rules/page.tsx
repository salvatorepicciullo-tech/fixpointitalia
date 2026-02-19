'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/app/lib/api';

type Brand = {
  id: number;
  name: string;
};

type Rule = {
  brand_id: number;
  price_percent: number;
};

export default function BrandRulesPage() {

  const params = useParams();
  const fixpointId = params.id;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [rules, setRules] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  /* =====================
     LOAD BRANDS + RULES
  ===================== */
  useEffect(() => {

    if (!fixpointId) return;

    const load = async () => {

      const brandsData = await apiFetch('/api/brands');
      const rulesData = await apiFetch(
        `/api/admin/fixpoints/${fixpointId}/brand-rules`
      );

      if (Array.isArray(brandsData)) {
        setBrands(brandsData);
      }

      if (Array.isArray(rulesData)) {
        const map: Record<number, number> = {};
        rulesData.forEach((r: Rule) => {
          map[r.brand_id] = r.price_percent;
        });
        setRules(map);
      }

      setLoading(false);
    };

    load();

  }, [fixpointId]);

  /* =====================
     UPDATE VALUE
  ===================== */
  function updateValue(brandId: number, value: number) {
    setRules(prev => ({
      ...prev,
      [brandId]: value
    }));
  }

  /* =====================
     SAVE RULE
  ===================== */
  async function saveRule(brandId: number) {

    await apiFetch(
      `/api/admin/fixpoints/${fixpointId}/brand-rules`,
      {
        method: 'POST',
        body: JSON.stringify({
          brand_id: brandId,
          price_percent: rules[brandId] || 0
        })
      }
    );

    alert('Regola salvata ✅');
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div style={{ padding: 20 }}>

      <h1>Percentuali Brand FixPoint</h1>

      {brands.map(b => (
        <div
          key={b.id}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 10,
            alignItems: 'center'
          }}
        >
          <div style={{ width: 200 }}>
            {b.name}
          </div>

          <input
            type="number"
            value={rules[b.id] || 0}
            onChange={e =>
              updateValue(b.id, Number(e.target.value))
            }
          />

          <button onClick={() => saveRule(b.id)}>
            Salva
          </button>
        </div>
      ))}

    </div>
  );
}
