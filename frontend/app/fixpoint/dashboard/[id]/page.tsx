'use client';
import { apiFetch } from '@/lib/api'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

/* =======================
   TIPI
======================= */

type Quote = {
  id: number;
  model: string;
  repair: string;
  city: string;
  status: 'ASSIGNED' | 'DONE';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  created_at: string;
};

type Note = {
  id: number;
  content: string;
  author_role: 'admin' | 'fixpoint';
  created_at: string;
};

/* =======================
   COSTANTI
======================= */



/* =======================
   COMPONENT
======================= */

export default function FixPointQuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Quote | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD DATI
  ======================= */
  useEffect(() => {
    const load = async () => {
      try {
        // carica preventivo
      const res = await apiFetch(`/api/quotes/${id}`, {
  credentials: 'include',
});

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        setItem(data);

      // carica note
const notesRes = await apiFetch(
  `/api/quotes/${id}/notes`,
  { credentials: 'include' }
);
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData);
        }
      } catch (err) {
        console.error('Errore caricamento dettaglio FixPoint', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

 /* =======================
   AZIONI
======================= */

const markDone = async () => {
  if (!item) return;

  await apiFetch(`/api/quotes/${item.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status: 'DONE', role: 'fixpoint' }),
  });

  router.push('/fixpoint/dashboard');
};

const addNote = async () => {
  if (!newNote.trim() || !item) return;

  const res = await apiFetch(`/api/quotes/${item.id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content: newNote }),
  });

  if (!res.ok) return;

  const saved = await res.json();
  setNotes((prev) => [...prev, saved]);
  setNewNote('');
};
  /* =======================
     RENDER
  ======================= */

  if (loading) {
    return <div className="text-gray-500">Caricamento…</div>;
  }

  if (!item) {
    return <div className="text-red-600">Lavoro non trovato</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 underline"
      >
        ← Torna ai lavori
      </button>

      <div className="border rounded-xl bg-white p-6 space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {item.model} – {item.repair}
          </h1>

          <span
            className={`text-xs px-2 py-1 rounded ${
              item.status === 'DONE'
                ? 'bg-green-200 text-green-800'
                : 'bg-orange-200 text-orange-800'
            }`}
          >
            {item.status}
          </span>
        </div>

        {/* INFO */}
        <div className="text-gray-700">
          <strong>Città:</strong> {item.city}
        </div>

        <div className="text-gray-700">
          <strong>Creato il:</strong> {item.created_at}
        </div>

        <hr />

        {/* CLIENTE */}
        <div>
          <h2 className="font-semibold mb-2">Cliente</h2>
          <div>👤 {item.customer_name}</div>
          <div>📧 {item.customer_email}</div>
          {item.customer_phone && <div>📞 {item.customer_phone}</div>}
        </div>

        {/* AZIONE */}
        {item.status === 'ASSIGNED' && (
          <button
            onClick={markDone}
            className="mt-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Segna lavoro come completato
          </button>
        )}

        <hr />

        {/* NOTE */}
        <div className="space-y-4">
          <h2 className="font-semibold">Note interne</h2>

          {notes.length === 0 && (
            <div className="text-sm text-gray-500">
              Nessuna nota presente
            </div>
          )}

          <div className="space-y-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded text-sm ${
                  n.author_role === 'fixpoint'
                    ? 'bg-orange-100'
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {n.author_role.toUpperCase()} – {n.created_at}
                </div>
                {n.content}
              </div>
            ))}
          </div>

          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="Aggiungi una nota interna…"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />

          <button
            onClick={addNote}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Salva nota
          </button>
        </div>
      </div>
    </div>
  );
}
