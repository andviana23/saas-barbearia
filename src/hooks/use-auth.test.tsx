import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './use-auth';

// Mock do módulo supabase client para controlar eventos de auth
jest.mock('@/lib/supabase/client', () => {
  interface Session {
    user?: { id: string; email?: string };
    [k: string]: unknown;
  }
  type Listener = (event: string, session: Session | null) => void;
  const listeners: Listener[] = [];
  let currentSession: Session | null = null;
  return {
    createBrowserSupabase: () => ({
      auth: {
        onAuthStateChange: (cb: Listener) => {
          listeners.push(cb);
          // Emular callback inicial sem sessão logo após registro
          setTimeout(() => cb('SIGNED_OUT', null), 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getSession: async () => ({ data: { session: currentSession } }),
        signInWithPassword: async ({ email }: { email: string; password: string }) => {
          currentSession = { user: { id: 'u1', email } };
          listeners.forEach((l) => l('SIGNED_IN', currentSession));
          return { data: { session: currentSession } };
        },
        signOut: async () => {
          currentSession = null;
          listeners.forEach((l) => l('SIGNED_OUT', null));
          return { error: null };
        },
        resetPasswordForEmail: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      }),
    }),
  };
});

describe('useAuth', () => {
  test('estado inicial inicia em INIT e depois SIGNED_OUT sem sessão', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.status).toBe('INIT');
    await waitFor(() => expect(result.current.status).toBe('SIGNED_OUT'));
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('signInWithPassword atualiza estado para SIGNED_IN e popula session', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('SIGNED_OUT'));
    await act(async () => {
      await result.current.signInWithPassword('user@test.com', 'pw');
    });
    expect(result.current.status).toBe('SIGNED_IN');
    expect(result.current.session?.user.email).toBe('user@test.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('signOut limpa sessão e user', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('SIGNED_OUT'));
    await act(async () => {
      await result.current.signInWithPassword('user2@test.com', 'pw');
    });
    expect(result.current.status).toBe('SIGNED_IN');
    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.status).toBe('SIGNED_OUT');
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  test('resetPassword retorna success true', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('SIGNED_OUT'));
    const resp = await result.current.resetPassword('mail@test.com');
    expect(resp.success).toBe(true);
  });
});
