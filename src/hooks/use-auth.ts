'use client';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { SupabaseSession, ProfileData, SignInResponse } from '@/types/supabase-auth';
import { User } from '@supabase/supabase-js';

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
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('INIT');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    console.log('🔄 AuthProvider: Iniciando verificação de autenticação...');
    console.log('📊 Estado inicial:', { user, status, authLoading });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (cancelled) return;
      console.log('🔐 Auth state change:', s ? 'SIGNED_IN' : 'SIGNED_OUT');
      setSession(s);
      setStatus(s ? 'SIGNED_IN' : 'SIGNED_OUT');

      if (s?.user) {
        console.log('🔐 Usuário autenticado, buscando perfil...');
        // Buscar perfil antes de liberar o loading
        await fetchUserProfile(s.user);
      } else {
        console.log('🔐 Sem usuário autenticado');
        setUser(null);
      }
    });

    (async () => {
      try {
        console.log('🔍 Verificando sessão existente...');
        const { data } = await supabase.auth.getSession();
        console.log('📋 Sessão encontrada:', !!data.session);
        if (cancelled) return;

        setSession(data.session ?? null);
        setStatus(data.session ? 'SIGNED_IN' : 'SIGNED_OUT');

        if (data.session?.user) {
          console.log('👤 Usuário na sessão, buscando perfil...');
          // Buscar perfil antes de liberar o loading
          await fetchUserProfile(data.session.user);
        } else {
          console.log('❌ Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        if (!cancelled) setStatus('SIGNED_OUT');
      } finally {
        console.log('✅ Finalizando inicialização do auth');
        if (!cancelled) setAuthLoading(false); // só libera após o perfil carregar
      }
    })();

    return () => {
      cancelled = true;
      subscription?.subscription?.unsubscribe();
    };
  }, [supabase]);

  // Função pura para buscar perfil (SEM hooks)
  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('🔍 Buscando perfil para usuário:', authUser.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil (usando fallback mínimo):', error);
        // Fallback: ainda consideramos o usuário autenticado com dados mínimos
        setUser({ id: authUser.id, email: authUser.email || '' });
        return;
      }

      if (profile) {
        const profileData = profile as ProfileData;
        console.log('✅ Perfil encontrado:', profileData.name);
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          nome: profileData.name || undefined,
          telefone: profileData.phone || undefined,
          unidade_default_id: profileData.unit_default_id || undefined,
          role: profileData.role || undefined,
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

  const signInWithPassword = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      console.log('[useAuth] Tentando autenticar usuário:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('[useAuth] Erro na autenticação:', error);
        throw error;
      }

      console.log('[useAuth] Autenticação bem-sucedida');
      return {
        user: data.user,
        session: data.session as SupabaseSession,
      };
    } catch (error) {
      console.error('[useAuth] Erro ao fazer login:', error);
      throw error;
    }
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
