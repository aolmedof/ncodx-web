import { getToken, logout } from './auth';
import { API_BASE_URL } from './config';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    if (window.location.pathname !== '/signin') window.location.assign('/signin');
    throw new Error('Unauthorized');
  }

  const responseText = await response.text();
  if (!response.ok) {
    let message = responseText;
    try {
      const parsed = JSON.parse(responseText) as { error?: string };
      message = parsed.error ?? responseText;
    } catch {
      // Keep the plain-text response as the error message.
    }
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204 || !responseText) return undefined as T;
  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error('API returned an invalid JSON response');
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
