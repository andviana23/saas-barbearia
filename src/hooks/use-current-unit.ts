'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { supabase } from '@/lib/supabase'

export interface Unidade {
  id: string
  nome: string
  endereco?: string
  telefone?: string
  email?: string
  ativa: boolean
  config?: Record<string, string | number | boolean | null>
}

export function useCurrentUnit() {
  const { user } = useAuth()
  const [currentUnit, setCurrentUnit] = useState<Unidade | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.unidade_default_id) {
      fetchCurrentUnit(user.unidade_default_id)
    } else {
      setLoading(false)
    }
  }, [user?.unidade_default_id])

  const fetchCurrentUnit = async (unidadeId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', unidadeId)
        .eq('ativa', true)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setCurrentUnit(data)
    } catch (err) {
      console.error('Erro ao buscar unidade atual:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const switchUnit = async (unidadeId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se o usuário tem acesso à unidade
      const { data: access, error: accessError } = await supabase
        .from('profiles')
        .select('unidade_default_id')
        .eq('id', user?.id)
        .eq('unidade_default_id', unidadeId)
        .single()

      if (accessError || !access) {
        throw new Error('Usuário não tem acesso a esta unidade')
      }

      // Atualizar perfil do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ unidade_default_id: unidadeId })
        .eq('id', user?.id)

      if (updateError) {
        throw updateError
      }

      // Buscar nova unidade
      await fetchCurrentUnit(unidadeId)

      return { success: true }
    } catch (err) {
      console.error('Erro ao trocar unidade:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const getUserUnits = async () => {
    try {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('unidades')
        .select('id, nome, ativa')
        .eq('ativa', true)
        .order('nome')

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Erro ao buscar unidades do usuário:', err)
      return []
    }
  }

  return {
    currentUnit,
    loading,
    error,
    switchUnit,
    getUserUnits,
    hasUnit: !!currentUnit,
  }
}
