const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const REFRESH_URL = '/api/v1/tradepilot/auth/token/refresh/';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = fetch(`${BASE_URL}${REFRESH_URL}`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(r => r.ok)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  skipRefirectOn401 = false,
): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;

  const isFormData = options.body instanceof FormData;
  const baseHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };

  const res = await fetch(fullUrl, {
    ...options,
    credentials: 'include',
    headers: { ...baseHeaders, ...(options.headers as Record<string, string> | undefined) },
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retry = await fetch(fullUrl, {
        ...options,
        credentials: 'include',
        headers: { ...baseHeaders, ...(options.headers as Record<string, string> | undefined) },
      });
      if (!retry.ok) {
        const err: any = new Error(`HTTP error! status: ${retry.status}`);
        try { err.response = { status: retry.status, data: await retry.json() }; } catch {}
        throw err;
      }
      if (retry.status === 204) return undefined as T;
      return retry.json();
    }
    if (!skipRefirectOn401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    const err: any = new Error('Unauthorized');
    err.response = { status: 401, data: {} };
    throw err;
  }

  if (!res.ok) {
    const err: any = new Error(`HTTP error! status: ${res.status}`);
    try { err.response = { status: res.status, data: await res.json() }; } catch {}
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { BASE_URL };
