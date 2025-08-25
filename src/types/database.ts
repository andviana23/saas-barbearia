// Tipos gerados automaticamente do banco Supabase
// Este arquivo será atualizado conforme o schema do banco

// Tipo para configurações JSON
export type ConfigRecord = Record<string, string | number | boolean | null>

// Tipo para regras de comissão
export type ComissaoRegra = Record<string, string | number | boolean | null>

// Tipo para preferências de cliente
export type ClientePreferencias = Record<
  string,
  string | number | boolean | null
>

export interface Database {
  public: {
    Tables: {
      unidades: {
        Row: {
          id: string
          nome: string
          cnpj: string | null
          endereco: string | null
          telefone: string | null
          email: string | null
          config: ConfigRecord
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          cnpj?: string | null
          endereco?: string | null
          telefone?: string | null
          email?: string | null
          config?: ConfigRecord
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cnpj?: string | null
          endereco?: string | null
          telefone?: string | null
          email?: string | null
          config?: ConfigRecord
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          nome: string
          email: string
          telefone: string | null
          unidade_default_id: string | null
          papel: 'admin' | 'gestor' | 'profissional' | 'recepcao'
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          email: string
          telefone?: string | null
          unidade_default_id?: string | null
          papel?: 'admin' | 'gestor' | 'profissional' | 'recepcao'
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          email?: string
          telefone?: string | null
          unidade_default_id?: string | null
          papel?: 'admin' | 'gestor' | 'profissional' | 'recepcao'
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profissionais: {
        Row: {
          id: string
          nome: string
          papel: string
          unidade_id: string
          ativo: boolean
          comissao_regra: ComissaoRegra | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          papel: string
          unidade_id: string
          ativo?: boolean
          comissao_regra?: ComissaoRegra | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          papel?: string
          unidade_id?: string
          ativo?: boolean
          comissao_regra?: ComissaoRegra | null
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefone: string | null
          preferencias: ClientePreferencias | null
          unidade_id: string
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email?: string | null
          telefone?: string | null
          preferencias?: ClientePreferencias | null
          unidade_id: string
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          preferencias?: ClientePreferencias | null
          unidade_id?: string
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      servicos: {
        Row: {
          id: string
          nome: string
          categoria: string | null
          preco: number
          duracao_min: number
          ativo: boolean
          unidade_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          categoria?: string | null
          preco: number
          duracao_min: number
          ativo?: boolean
          unidade_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          categoria?: string | null
          preco?: number
          duracao_min?: number
          ativo?: boolean
          unidade_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          cliente_id: string
          profissional_id: string
          unidade_id: string
          inicio: string
          fim: string
          status:
            | 'criado'
            | 'confirmado'
            | 'em_atendimento'
            | 'concluido'
            | 'cancelado'
            | 'faltou'
          total: number
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          profissional_id: string
          unidade_id: string
          inicio: string
          fim: string
          status?:
            | 'criado'
            | 'confirmado'
            | 'em_atendimento'
            | 'concluido'
            | 'cancelado'
            | 'faltou'
          total: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          profissional_id?: string
          unidade_id?: string
          inicio?: string
          fim?: string
          status?:
            | 'criado'
            | 'confirmado'
            | 'em_atendimento'
            | 'concluido'
            | 'cancelado'
            | 'faltou'
          total?: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments_servicos: {
        Row: {
          id: string
          appointment_id: string
          servico_id: string
          preco_aplicado: number
          duracao_aplicada: number
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          servico_id: string
          preco_aplicado: number
          duracao_aplicada: number
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          servico_id?: string
          preco_aplicado?: number
          duracao_aplicada?: number
          created_at?: string
        }
      }
      fila: {
        Row: {
          id: string
          unidade_id: string
          cliente_id: string
          status:
            | 'aguardando'
            | 'chamado'
            | 'em_atendimento'
            | 'concluido'
            | 'desistiu'
          prioridade: 'normal' | 'prioritaria' | 'urgente'
          posicao: number
          estimativa_min: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unidade_id: string
          cliente_id: string
          status?:
            | 'aguardando'
            | 'chamado'
            | 'em_atendimento'
            | 'concluido'
            | 'desistiu'
          prioridade?: 'normal' | 'prioritaria' | 'urgente'
          posicao: number
          estimativa_min?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unidade_id?: string
          cliente_id?: string
          status?:
            | 'aguardando'
            | 'chamado'
            | 'em_atendimento'
            | 'concluido'
            | 'desistiu'
          prioridade?: 'normal' | 'prioritaria' | 'urgente'
          posicao?: number
          estimativa_min?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      financeiro_mov: {
        Row: {
          id: string
          unidade_id: string
          tipo: 'entrada' | 'saida'
          valor: number
          origem: string
          referencia_id: string | null
          data_mov: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unidade_id: string
          tipo: 'entrada' | 'saida'
          valor: number
          origem: string
          referencia_id?: string | null
          data_mov: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unidade_id?: string
          tipo?: 'entrada' | 'saida'
          valor?: number
          origem?: string
          referencia_id?: string | null
          data_mov?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_unidade_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_unit_access: {
        Args: { unidade_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'gestor' | 'profissional' | 'recepcao'
      appointment_status:
        | 'criado'
        | 'confirmado'
        | 'em_atendimento'
        | 'concluido'
        | 'cancelado'
        | 'faltou'
      queue_status:
        | 'aguardando'
        | 'chamado'
        | 'em_atendimento'
        | 'concluido'
        | 'desistiu'
      queue_priority: 'normal' | 'prioritaria' | 'urgente'
      movimento_tipo: 'entrada' | 'saida'
    }
  }
  audit: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
