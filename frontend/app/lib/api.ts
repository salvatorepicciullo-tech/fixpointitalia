const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';




// 🔥 cache richieste in corso (anti-duplicate fetch)
const pendingRequests: Record<string, Promise<any> | undefined> = {};


export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  try {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;

    const key = `${url}-${options.method || 'GET'}`;

    // 🔥 se richiesta già in corso, riusa la stessa promise
    if (pendingRequests[key]) {
      return pendingRequests[key];
    }

    const request = fetch(`${API}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/login';
          }
          return null;
        }

        return res.json().catch(() => null);
      })
      .finally(() => {
        delete pendingRequests[key];
      });

    pendingRequests[key] = request;

    return request;
  } catch (err) {
    console.error('API ERROR:', err);
    return null;
  }
}
