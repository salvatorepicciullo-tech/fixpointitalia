export const API = process.env.NEXT_PUBLIC_API_URL as string;

export const apiFetch = (path: string, options: RequestInit = {}) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  return fetch(`${API}${path}`, {
    ...options,
    cache: 'no-store', // 🔥 DISABILITA CACHE NEXT.JS
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};