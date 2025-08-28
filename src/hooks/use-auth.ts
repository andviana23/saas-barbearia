'use client';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';

type AuthStatus = 'INIT' | 'SIGNED_OUT' | 'SIGNED_IN';

export interface AuthUser {
  id: string;
  email: string;
  nome?: string;
  telefone?: string;
  unidade_default_id?: string;
  role?: string;
}

export function useAuth() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('INIT');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const { data: subscription } = supabase.auth.onAuthStateChange((_e, s) => {
      if (cancelled) return;
      setSession(s);
      setStatus(s ? 'SIGNED_IN' : 'SIGNED_OUT');

      if (s?.user) {
        // Buscar perfil em background, sem bloquear
        fetchUserProfile(s.user).catch((err) =>
          console.warn('Background profile fetch failed:', err),
        );
      } else {
        setUser(null);
      }
    });

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        setSession(data.session ?? null);
        setStatus(data.session ? 'SIGNED_IN' : 'SIGNED_OUT');

        if (data.session?.user) {
          // Buscar perfil em background, não bloqueia boot
          fetchUserProfile(data.session.user).catch((err) =>
            console.warn('Profile fetch failed:', err),
          );
        }
      } catch (_) {
        if (!cancelled) setStatus('SIGNED_OUT');
      } finally {
        if (!cancelled) setAuthLoading(false); // sempre solta
      }
    })();

    return () => {
      cancelled = true;
      subscription?.subscription?.unsubscribe();
    };
  }, [supabase]);

  // Função pura para buscar perfil (SEM hooks)
  // authUser vem do supabase; tipagem mínima para evitar any profundo
  const fetchUserProfile = async (authUser: { id: string; email?: string | null }) => {
    try {
      console.log('🔍 Buscando perfil para usuário:', authUser.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, phone, unit_default_id, role')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar perfil (usando fallback mínimo):', error);
        // Fallback: ainda consideramos o usuário autenticado com dados mínimos
        setUser({ id: authUser.id, email: authUser.email || '' });
        return;
      }

      if (profile) {
        console.log('✅ Perfil encontrado:', (profile as any).name);
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          nome: (profile as any).name,
          telefone: (profile as any).phone,
          unidade_default_id: (profile as any).unit_default_id,
          role: (profile as any).role,
        });
      } else {
        console.log('⚠️ Perfil não encontrado. Usando dados mínimos do auth user:', authUser.id);
        // Fallback quando não existe registro em profiles
        setUser({ id: authUser.id, email: authUser.email || '' });
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar perfil:', error);
      // Não limpa user em caso de erro de perfil - mantém autenticação
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  // Stub simples de resetPassword (envia magic link do Supabase)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  };

  return {
    session,
    user,
    status,
    authLoading,
    signInWithPassword,
    signOut,
    resetPassword,
    // Compatibilidade com código existente
    loading: authLoading,
    isAuthenticated: !!session?.user,
    signIn: signInWithPassword,
  };
}
