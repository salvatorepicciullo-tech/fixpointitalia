'use client';

export default function DeviceSelector() {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4">

      <div className="font-semibold text-lg">
        Seleziona il dispositivo
      </div>

      <div className="grid grid-cols-4 gap-4">

        <select className="border rounded-xl px-3 py-2">
          <option>Marca</option>
          <option>Apple</option>
          <option>Samsung</option>
        </select>

        <select className="border rounded-xl px-3 py-2">
          <option>Modello</option>
        </select>

        <select className="border rounded-xl px-3 py-2">
          <option>Memoria</option>
        </select>

        <input
          placeholder="IMEI / Serial"
          className="border rounded-xl px-3 py-2"
        />
      </div>

      <button className="bg-orange-500 text-white px-5 py-2 rounded-xl font-semibold">
        Calcola valutazione
      </button>

    </div>
  );
}
