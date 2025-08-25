'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  nome?: string
  telefone?: string
  unidade_default_id?: string
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        nome: profile?.nome,
        telefone: profile?.telefone,
        unidade_default_id: profile?.unidade_default_id,
        role: profile?.role,
      })
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        await fetchUserProfile(data.user)
        router.push('/dashboard')
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<AuthUser>
  ) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData.nome,
            telefone: userData.telefone,
            unidade_default_id: userData.unidade_default_id,
          },
        },
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }

      setUser(null)
      setSession(null)
      router.push('/login')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  }
}
