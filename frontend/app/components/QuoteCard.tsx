'use client';

type QuoteStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';

type FixPoint = {
  id: number;
  name: string;
};

type Quote = {
  id: number;
  created_at: string;
  status: QuoteStatus;
  price: number;
  city: string;
  model: string;
  repair: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  fixpoint_id?: number | null;
  color?: string;
  description?: string;
};

type Props = {
  q: Quote;
  fixpoints: FixPoint[];
  assignFixpoint: (id: number, fixpointId: number) => void;
  reopenQuote: (id: number) => void;
  deleteQuote: (id: number) => void;
  renderStatusBadge: (status: QuoteStatus) => React.ReactNode;
};

export default function QuoteCard({
  q,
  fixpoints,
  assignFixpoint,
  reopenQuote,
  deleteQuote,
  renderStatusBadge
}: Props) {
  const highValue = q.price >= 100;

  return (
    <div
      className={`group relative border rounded-2xl bg-white px-5 py-4
      transition-all duration-300 ease-out
      ${q.status === 'NEW' ? 'bg-blue-50/40' : ''}
      ${highValue ? 'ring-1 ring-yellow-300' : ''}
      hover:shadow-lg hover:-translate-y-[2px] hover:border-gray-300 hover:ring-1 hover:ring-gray-200
      ${
        q.status === 'NEW'
          ? 'border-l-4 border-l-blue-500'
          : q.status === 'ASSIGNED'
          ? 'border-l-4 border-l-yellow-500'
          : q.status === 'IN_PROGRESS'
          ? 'border-l-4 border-l-orange-500'
          : 'border-l-4 border-l-gray-400'
      }`}
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1">
          <div className="font-semibold text-[15px] flex items-center gap-2">
            {q.status === 'NEW' && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            )}
            {q.model}
            {q.color ? ` (${q.color})` : ''} – {q.repair}
          </div>
        </div>

        <div className="text-right">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-2xl font-semibold text-blue-600 tracking-tight">
            € {q.price}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-700">
        👤 {q.customer_name} – {q.customer_email}
      </div>

      {q.customer_phone && (
        <div className="text-sm">📞 {q.customer_phone}</div>
      )}

      <div className="text-sm">📍 {q.city}</div>
{q.description && (
  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700 border border-blue-100">
    📝 {q.description}
  </div>
)}


      <div className="mt-3">{renderStatusBadge(q.status)}</div>

      <div className="flex gap-2 mt-4 items-center flex-wrap pt-3 border-t opacity-0 group-hover:opacity-100 transition duration-200">
        <select
          className="border px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 transition"
          disabled={q.status === 'DONE'}
          value={q.fixpoint_id ?? ''}
          onChange={(e) => assignFixpoint(q.id, Number(e.target.value))}
        >
          <option value="">Assegna FixPoint</option>
          {fixpoints.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        {q.status === 'DONE' && (
          <button
            onClick={() => reopenQuote(q.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition"
            title="Riapri preventivo"
          >
            🔓
          </button>
        )}

        <button
          onClick={() => deleteQuote(q.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition"
          title="Elimina"
        >
          🗑️
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Creato: {q.created_at}
      </div>
    </div>
  );
}
