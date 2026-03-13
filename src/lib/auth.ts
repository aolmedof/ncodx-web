import type { User, AuthState } from '@/types';

const TOKEN_KEY = 'ncodx_token';
const USER_KEY = 'ncodx_user';

// 4 predefined users (fallback when no API)
const VALID_USERS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'arturo.olmedof@hotmail.com',
    password: 'Abc#123',
    user: {
      id: 'u1',
      name: 'Arturo Olmedof',
      full_name: 'Arturo Olmedof',
      email: 'arturo.olmedof@hotmail.com',
      role: 'admin',
      timezone: 'America/Mexico_City',
      language: 'es',
      company: 'NCODX',
      country: 'Mexico',
    },
  },
  {
    email: 'g.olmedof@gmail.com',
    password: 'Abc#123',
    user: {
      id: 'u2',
      name: 'Gerardo Olmedof',
      full_name: 'Gerardo Olmedof',
      email: 'g.olmedof@gmail.com',
      role: 'admin',
      timezone: 'America/Mexico_City',
      language: 'es',
      company: 'NCODX',
      country: 'Mexico',
    },
  },
  {
    email: 'olmedoflores@gmail.com',
    password: 'Abc#123',
    user: {
      id: 'u3',
      name: 'Olmedoflores',
      full_name: 'Olmedoflores',
      email: 'olmedoflores@gmail.com',
      role: 'user',
      timezone: 'America/Mexico_City',
      language: 'es',
      company: 'NCODX',
      country: 'Mexico',
    },
  },
  {
    email: 'anastasia888a@gmail.com',
    password: 'Abc#123',
    user: {
      id: 'u4',
      name: 'Anastasia',
      full_name: 'Anastasia',
      email: 'anastasia888a@gmail.com',
      role: 'user',
      timezone: 'America/Mexico_City',
      language: 'es',
      company: 'NCODX',
      country: 'Mexico',
    },
  },
];

export function login(email: string, password: string): AuthState {
  const found = VALID_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) throw new Error('Invalid credentials');
  const token = `ncodx_token_${Date.now()}_${found.user.id}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(found.user));
  return { user: found.user, token, isAuthenticated: true };
}

export async function loginWithApi(email: string, password: string): Promise<AuthState> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!BASE_URL) {
    return login(email, password);
  }
  try {
    const resp = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) throw new Error('Invalid credentials');
    const { token, user } = (await resp.json()) as { token: string; user: User };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user, token, isAuthenticated: true };
  } catch {
    // fallback to local
    return login(email, password);
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function getAuthState(): AuthState {
  const token = getToken();
  const user = getUser();
  return { token, user, isAuthenticated: !!token && !!user };
}
