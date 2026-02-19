'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/app/lib/api';

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');

const submit = async () => {
setError('');

```
if (!email || !password) {
  setError('Inserisci email e password');
  return;
}

try {
  const data = await apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!data) {
    setError('Credenziali non valide');
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('role', data.user.role);
  localStorage.setItem('fixpoint_id', data.user.fixpoint_id ?? '');

  if (data.user.role === 'admin') {
    router.push('/admin');
    return;
  }

  if (data.user.role === 'fixpoint') {
    router.push('/fixpoint/dashboard');
    return;
  }

  setError('Ruolo non riconosciuto');
} catch (err) {
  console.error(err);
  setError('Errore di connessione');
}
```

};

return ( <div className="min-h-screen flex items-center justify-center bg-gray-100"> <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

```
    <div className="flex justify-center mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
          F
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          FixPoint
        </h1>
      </div>
    </div>

    <h2 className="text-center text-lg font-semibold mb-6">
      Accesso piattaforma
    </h2>

    {error && (
      <div className="mb-4 text-sm text-red-600 text-center">
        {error}
      </div>
    )}

    <input
      className="border w-full px-3 py-2 rounded-lg mb-3"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      className="border w-full px-3 py-2 rounded-lg mb-4"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      onClick={submit}
      className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Accedi
   
    </button>

  </div>
</div>

);
}
