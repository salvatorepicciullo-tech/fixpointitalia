'use client';

import { useState } from 'react';

export default function ContattiPage() {

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [message,setMessage] = useState('');

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState(false);

  const sendMail = async () => {

    if(!name || !email || !message) return;

    // 🔵 validazione email reale
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if(!emailValid){
      setError(true);
      return;
    }

    try{

      setLoading(true);
      setError(false);

      const res = await fetch(`${API}/api/contact`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          name,
          email,
          phone,
          message
        })
      });

      if(!res.ok){
        throw new Error('Errore invio');
      }

      setSuccess(true);

      setName('');
      setEmail('');
      setPhone('');
      setMessage('');

    }catch(err){
      console.log(err);
      setError(true);
    }finally{
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white px-4 py-20 min-h-screen">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Contattaci
          </h1>
          <p className="text-gray-600">
            Hai bisogno di informazioni? Scrivici e ti risponderemo il prima possibile.
          </p>
        </div>

        {/* CARD CONTATTI */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-6 border">

          <div className="text-sm text-gray-500">
            📧 info@fixpointitalia.com
          </div>

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Nome e Cognome"
            value={name}
            onChange={e=>setName(e.target.value)}
          />

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Telefono (opzionale)"
            value={phone}
            onChange={e=>setPhone(e.target.value)}
          />

          <textarea
            rows={5}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Scrivi il tuo messaggio..."
            value={message}
            onChange={e=>setMessage(e.target.value)}
          />

          <button
            onClick={sendMail}
            disabled={loading || !name || !email || !message}
            className="
            w-full bg-blue-600 hover:bg-blue-700 text-white
            py-4 rounded-xl font-semibold transition disabled:opacity-40
            "
          >
            {loading ? 'Invio in corso...' : 'Invia messaggio'}
          </button>

        </div>

      </div>

      {/* POPUP SUCCESS */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">

          <div className="bg-white rounded-2xl p-8 max-w-sm text-center space-y-4 shadow-xl">

            <div className="text-4xl">✅</div>

            <h2 className="text-xl font-semibold">
              Messaggio inviato correttamente
            </h2>

            <p className="text-gray-600 text-sm">
              Grazie per aver contattato FixPoint.
              Ti risponderemo il prima possibile all'indirizzo indicato.
            </p>

            <button
              onClick={()=>setSuccess(false)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Chiudi
            </button>

          </div>

        </div>
      )}

      {/* POPUP ERRORE */}
      {error && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">

          <div className="bg-white rounded-2xl p-8 max-w-sm text-center space-y-4 shadow-xl">

            <div className="text-4xl">⚠️</div>

            <h2 className="text-xl font-semibold">
              Errore invio messaggio
            </h2>

            <p className="text-gray-600 text-sm">
              Controlla i dati inseriti oppure riprova tra qualche secondo.
            </p>

            <button
              onClick={()=>setError(false)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Chiudi
            </button>

          </div>

        </div>
      )}

    </section>
  );
}