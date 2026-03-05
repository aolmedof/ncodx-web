import type { User, AuthState } from '@/types';

const TOKEN_KEY = 'ncodx_token';
const USER_KEY = 'ncodx_user';

const DEMO_USER: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@ncodx.com',
  avatar: undefined,
  role: 'admin',
  timezone: 'Europe/Madrid',
  language: 'es',
};

export function login(email: string, password: string): AuthState {
  if (email === 'demo@ncodx.com' && password === 'password123') {
    const token = `ncodx_fake_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
    return { user: DEMO_USER, token, isAuthenticated: true };
  }
  throw new Error('Invalid credentials');
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

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function getAuthState(): AuthState {
  const token = getToken();
  const user = getUser();
  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
  };
}
