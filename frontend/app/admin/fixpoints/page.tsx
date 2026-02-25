'use client';
import { apiFetch } from '@/lib/api';
/* =====================================================
   BLOCCO 0 – IMPORT
===================================================== */
import { useEffect, useState } from 'react';

/* =====================================================
   BLOCCO 1 – TIPI
===================================================== */
type FixPoint = {
  id: number;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  vat_number?: string;
  active: number;
  username?: string;
  user_id?: number;
};

/* =====================================================
   BLOCCO 2 – COMPONENTE PRINCIPALE
===================================================== */
export default function FixPointsPage() {

  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const emptyForm: FixPoint = {
    id: 0,
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    vat_number: '',
    active: 1,
    username: '',
    user_id: 0,
  };

  const [form, setForm] = useState<FixPoint>(emptyForm);

  const [showCredentials, setShowCredentials] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  /* =====================================================
     FETCH FIXPOINTS
  ===================================================== */
  useEffect(() => {
    fetchFixPoints();
  }, [status]);

  const fetchFixPoints = async () => {
    setLoading(true);
    const qs = status === 'all' ? '' : `?status=${status}`;
   const res = await apiFetch(`/api/admin/fixpoints${qs}`);
    const data = await res.json();
    setFixpoints(data);
    setLoading(false);
  };

  /* =====================================================
     CREATE FIXPOINT
  ===================================================== */
  const createFixPoint = async () => {
    const res = await apiFetch('/api/admin/fixpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert('Errore creazione FixPoint');
      return;
    }

    setShowCreateModal(false);
    setForm(emptyForm);
    fetchFixPoints();
  };

  /* =====================================================
     UPDATE FIXPOINT
  ===================================================== */
  const updateFixPoint = async () => {
   const res = await apiFetch(
  `/api/fixpoints/${form.id}`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  }
);

    if (!res.ok) {
      alert('Errore salvataggio FixPoint');
      return;
    }

    setShowEditModal(false);
    setShowCredentials(false);
    setNewPassword(null);
    setForm(emptyForm);
    fetchFixPoints();
  };

  /* =====================================================
     ATTIVA / DISATTIVA
  ===================================================== */
  const toggleFixPoint = async (fp: FixPoint) => {
    const action = fp.active ? 'disable' : 'enable';
   await apiFetch(
  `/api/fixpoints/${fp.id}/${action}`,
  { method: 'PUT' }
);
    fetchFixPoints();
  };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */
  const resetPassword = async () => {
    if (!form.user_id) {
      alert('Utente FixPoint non trovato');
      return;
    }

  const res = await apiFetch(
  `/api/admin/users/${form.user_id}/reset-password`,
  { method: 'POST' }
);

    const data = await res.json();

    if (!res.ok) {
      alert('Errore reset password');
      return;
    }

    setNewPassword(data.password);
    setShowCredentials(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */
  const openEditModal = (fp: FixPoint) => {
    setForm(fp);
    setShowEditModal(true);
    setShowCredentials(false);
    setNewPassword(null);
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">FixPoint</h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          + Aggiungi FixPoint
        </button>
      </div>

      {/* FILTRI */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'inactive'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s as any)}
            className={`px-3 py-1.5 border rounded-xl transition ${
              status === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Tutti' : s === 'active' ? 'Attivi' : 'Disattivi'}
          </button>
        ))}
      </div>

      {/* LISTA CARD ENTERPRISE */}
      <div className="space-y-4">
        {fixpoints.map(fp => (
          <div
            key={fp.id}
            className={`group relative border rounded-2xl bg-white px-5 py-4
            transition-all duration-200 hover:shadow-lg hover:-translate-y-[2px]
            ${fp.active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}
            `}
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-[15px]">{fp.name}</div>

                <div className="text-sm text-gray-500">📍 {fp.city}</div>

                {fp.email && (
                  <div className="text-sm text-gray-500">✉️ {fp.email}</div>
                )}
              </div>

              <span
                className={`px-2 py-1 text-xs rounded-full font-semibold ${
                  fp.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {fp.active ? 'Attivo' : 'Disattivo'}
              </span>
            </div>

            {/* AZIONI */}
            <div className="flex gap-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => openEditModal(fp)}
                className="text-blue-600 text-sm hover:underline"
              >
                Modifica
              </button>

              <button
                onClick={() => toggleFixPoint(fp)}
                className={fp.active ? 'text-red-600 text-sm' : 'text-green-600 text-sm'}
              >
                {fp.active ? 'Disattiva' : 'Attiva'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODALE SCHEDA FIXPOINT ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Scheda FixPoint</h2>
		{form.id > 0 && (
  <div className="mb-4">
    <a
      href={`/admin/fixpoints/${form.id}/brand-rules`}
      className="text-blue-600 underline text-sm"
    >
      ⚙️ Gestisci Percentuali Brand
    </a>
  </div>
)}

            <input className="input" placeholder="Ragione sociale" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Città" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="Indirizzo" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <input className="input" placeholder="Telefono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Partita IVA" value={form.vat_number} onChange={e => setForm({ ...form, vat_number: e.target.value })} />
            <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="text-blue-600 underline"
              >
                Credenziali
              </button>

              {showCredentials && (
                <div className="mt-2 text-sm">
                  <p><b>Username:</b> {form.email}</p>
                  <p><b>Password:</b> {newPassword ?? '********'}</p>
                  {newPassword && (
                    <p className="text-red-600 text-xs mt-1">
                      Copia ora la password, non sarà più visibile
                    </p>
                  )}
                  <button
                    onClick={resetPassword}
                    className="mt-2 text-sm text-orange-600 underline"
                  >
                    🔐 Reset password
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="border px-3 py-1 rounded"
              >
                Annulla
              </button>
              <button
                onClick={updateFixPoint}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
{/* ================= MODALE CREA FIXPOINT ================= */}
{showCreateModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded w-full max-w-lg">
      <h2 className="text-lg font-bold mb-4">Nuovo FixPoint</h2>

      <input className="input" placeholder="Ragione sociale"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input className="input" placeholder="Città"
        value={form.city}
        onChange={e => setForm({ ...form, city: e.target.value })}
      />

      <input className="input" placeholder="Indirizzo"
        value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
      />

      <input className="input" placeholder="Telefono"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />

      <input className="input" placeholder="Partita IVA"
        value={form.vat_number}
        onChange={e => setForm({ ...form, vat_number: e.target.value })}
      />

      <input className="input" placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setShowCreateModal(false)}
          className="border px-3 py-1 rounded"
        >
          Annulla
        </button>

        <button
          onClick={createFixPoint}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Crea FixPoint
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  );
}
