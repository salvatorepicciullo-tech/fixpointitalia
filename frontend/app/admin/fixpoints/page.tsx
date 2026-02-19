'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/lib/api';

/* =====================================================
   TIPI
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

export default function FixPointsPage() {

  const [fixpoints, setFixpoints] = useState<FixPoint[]>([]);
  const [status, setStatus] =
    useState<'all' | 'active' | 'inactive'>('all');

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
     LOAD FIXPOINTS
  ===================================================== */
  useEffect(() => {
    fetchFixPoints();
  }, [status]);

  const fetchFixPoints = async () => {

    const qs = status === 'all' ? '' : `?status=${status}`;

    const data = await apiFetch(`/api/admin/fixpoints${qs}`);

    setFixpoints(data || []);
  };

  /* =====================================================
     CREATE
  ===================================================== */
  const createFixPoint = async () => {

    const res = await apiFetch('/api/admin/fixpoints', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (!res) {
      alert('Errore creazione FixPoint');
      return;
    }

    setShowCreateModal(false);
    setForm(emptyForm);
    fetchFixPoints();
  };

  /* =====================================================
     UPDATE
  ===================================================== */
  const updateFixPoint = async () => {

    const res = await apiFetch(`/api/fixpoints/${form.id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
    });

    if (!res) {
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
     TOGGLE
  ===================================================== */
  const toggleFixPoint = async (fp: FixPoint) => {

    const action = fp.active ? 'disable' : 'enable';

    await apiFetch(`/api/fixpoints/${fp.id}/${action}`, {
      method: 'PUT'
    });

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

    const data = await apiFetch(
      `/api/admin/users/${form.user_id}/reset-password`,
      { method: 'POST' }
    );

    if (!data) {
      alert('Errore reset password');
      return;
    }

    setNewPassword(data.password);
    setShowCredentials(true);
  };

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
        <h1 className="text-2xl font-semibold tracking-tight">
          FixPoint
        </h1>

        <button
          onClick={() => {
            setForm(emptyForm);
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Aggiungi FixPoint
        </button>
      </div>

      {/* FILTRI */}
      <div className="flex gap-2 mb-6">
        {['all','active','inactive'].map(s=>(
          <button
            key={s}
            onClick={()=>setStatus(s as any)}
            className={`px-3 py-1.5 border rounded-xl ${
              status===s
                ?'bg-blue-600 text-white border-blue-600'
                :'bg-white'
            }`}
          >
            {s==='all'?'Tutti':s==='active'?'Attivi':'Disattivi'}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {fixpoints.map(fp=>(
          <div
            key={fp.id}
            className={`group border rounded-2xl bg-white px-5 py-4
            ${fp.active?'border-l-4 border-l-green-500':'border-l-4 border-l-gray-300'}
            `}
          >
            <div className="flex justify-between mb-3">
              <div>
                <div className="font-semibold">{fp.name}</div>
                <div className="text-sm text-gray-500">📍 {fp.city}</div>
                {fp.email && <div className="text-sm">{fp.email}</div>}
              </div>

              <span className={`px-2 py-1 text-xs rounded-full ${
                fp.active?'bg-green-100':'bg-gray-200'
              }`}>
                {fp.active?'Attivo':'Disattivo'}
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button
                onClick={()=>openEditModal(fp)}
                className="text-blue-600 text-sm"
              >
                Modifica
              </button>

              <button
                onClick={()=>toggleFixPoint(fp)}
                className={fp.active?'text-red-600 text-sm':'text-green-600 text-sm'}
              >
                {fp.active?'Disattiva':'Attiva'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODALE EDIT ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Scheda FixPoint</h2>

            {form.id > 0 && (
              <a
                href={`/admin/fixpoints/${form.id}/brand-rules`}
                className="text-blue-600 underline text-sm"
              >
                ⚙️ Gestisci Percentuali Brand
              </a>
            )}

            <input className="input" value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})}
              placeholder="Ragione sociale"/>

            <input className="input" value={form.city}
              onChange={e=>setForm({...form,city:e.target.value})}
              placeholder="Città"/>

            <input className="input" value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              placeholder="Email"/>

            <button onClick={resetPassword} className="mt-3 text-sm underline">
              🔐 Reset password
            </button>

            {newPassword && (
              <div className="text-red-600 text-sm mt-2">
                Nuova password: {newPassword}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setShowEditModal(false)} className="border px-3 py-1 rounded">
                Annulla
              </button>

              <button onClick={updateFixPoint} className="bg-blue-600 text-white px-4 py-1 rounded">
                Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALE CREATE ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Nuovo FixPoint</h2>

            <input className="input" value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})}
              placeholder="Ragione sociale"/>

            <input className="input" value={form.city}
              onChange={e=>setForm({...form,city:e.target.value})}
              placeholder="Città"/>

            <input className="input" value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              placeholder="Email"/>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setShowCreateModal(false)} className="border px-3 py-1 rounded">
                Annulla
              </button>

              <button onClick={createFixPoint} className="bg-blue-600 text-white px-4 py-1 rounded">
                Crea FixPoint
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
