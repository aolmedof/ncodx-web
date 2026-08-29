import type { User, AuthState } from '@/types';
import { API_BASE_URL, DEMO_AUTH_ENABLED } from './config';

const TOKEN_KEY = 'ncodx_token';
const USER_KEY = 'ncodx_user';
const listeners = new Set<() => void>();

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
  if (!DEMO_AUTH_ENABLED) throw new Error('Demo authentication is disabled');
  const found = VALID_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) throw new Error('Invalid credentials');
  const token = `ncodx_token_${Date.now()}_${found.user.id}`;
  return setSession(found.user, token);
}

function setSession(user: User, token: string): AuthState {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  authState = { user, token, isAuthenticated: true };
  emitChange();
  return authState;
}

function normalizeApiUser(raw: Record<string, unknown>): User {
  const optionalString = (value: unknown): string | undefined =>
    typeof value === 'string' && value ? value : undefined;
  const role = raw.role === 'admin' ? 'admin' : 'user';
  const locale = raw.locale === 'en' || raw.language === 'en' ? 'en' : 'es';
  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    name: String(raw.name ?? raw.fullName ?? raw.full_name ?? raw.email ?? ''),
    full_name: String(raw.fullName ?? raw.full_name ?? raw.name ?? ''),
    role,
    timezone: String(raw.timezone ?? 'UTC'),
    language: locale,
    avatar: optionalString(raw.avatarUrl ?? raw.avatar),
    phone: optionalString(raw.phone),
    company: optionalString(raw.company),
    tax_id: optionalString(raw.taxId ?? raw.tax_id),
    address: optionalString(raw.address),
    city: optionalString(raw.city),
    state: optionalString(raw.state),
    country: optionalString(raw.country),
    zip_code: optionalString(raw.zipCode ?? raw.zip_code),
    bank_name: optionalString(raw.bankName ?? raw.bank_name),
    bank_account: optionalString(raw.bankAccount ?? raw.bank_account),
    bank_routing: optionalString(raw.bankRouting ?? raw.bank_routing),
    payment_method: optionalString(raw.paymentMethod ?? raw.payment_method),
    paypal_email: optionalString(raw.paypalEmail ?? raw.paypal_email),
  };
}

export async function loginWithApi(email: string, password: string): Promise<AuthState> {
  if (!API_BASE_URL) {
    return login(email, password);
  }
  const resp = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error('Invalid credentials');
  const payload = (await resp.json()) as { token: string; user: Record<string, unknown> };
  return setSession(normalizeApiUser(payload.user), payload.token);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  authState = { user: null, token: null, isAuthenticated: false };
  emitChange();
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
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  authState = { user, token: authState.token, isAuthenticated: !!authState.token };
  emitChange();
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function getAuthState(): AuthState {
  return authState;
}

function readAuthState(): AuthState {
  const token = getToken();
  const user = getUser();
  return { token, user, isAuthenticated: !!token && !!user };
}

function emitChange(): void {
  listeners.forEach(listener => listener());
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let authState = readAuthState();

window.addEventListener('storage', (event) => {
  if (event.key === TOKEN_KEY || event.key === USER_KEY || event.key === null) {
    authState = readAuthState();
    emitChange();
  }
});
