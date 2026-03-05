import { useState, useCallback } from 'react';
import { login, logout, getAuthState } from '@/lib/auth';
import type { AuthState } from '@/types';

export function useAuth() {
  const [state, setState] = useState<AuthState>(getAuthState);

  const signIn = useCallback(async (email: string, password: string) => {
    const newState = login(email, password);
    setState(newState);
    return newState;
  }, []);

  const signOut = useCallback(() => {
    logout();
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return { ...state, signIn, signOut };
}
