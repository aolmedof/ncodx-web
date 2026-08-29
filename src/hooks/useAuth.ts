import { useCallback, useSyncExternalStore } from 'react';
import { getAuthState, loginWithApi, logout, subscribeAuth } from '@/lib/auth';

export function useAuth() {
  const state = useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);

  const signIn = useCallback(async (email: string, password: string) => {
    return loginWithApi(email, password);
  }, []);

  const signOut = useCallback(() => {
    logout();
  }, []);

  return { ...state, signIn, signOut };
}
