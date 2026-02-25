export async function apiFetch(path: string, options: RequestInit = {}) {
  const base =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}