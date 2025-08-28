// Tipos gerados automaticamente do banco Supabase
// Este arquivo será atualizado conforme o schema do banco

// Tipo para configurações JSON
export type ConfigRecord = Record<string, string | number | boolean | null>;

// Tipo para regras de comissão
export type ComissaoRegra = Record<string, string | number | boolean | null>;

// Tipo para preferências de cliente
export type ClientePreferencias = Record<string, string | number | boolean | null>;

export interface Database {
  public: {
    Tables: {
      /**
       * =====================================================================
       * LEGACY (PT) TABLES - manter temporariamente para refactor gradual
       * Cada uma será marcada como @deprecated e coexistirá com as versões EN.
       * =====================================================================
       */
      /** @deprecated usar `units` */
      unidades: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          endereco: string | null;
          telefone: string | null;
          email: string | null;
          config: ConfigRecord;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          endereco?: string | null;
          telefone?: string | null;
          email?: string | null;
          config?: ConfigRecord;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string | null;
          endereco?: string | null;
          telefone?: string | null;
          email?: string | null;
          config?: ConfigRecord;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string | null;
          unit_default_id: string | null;
          role: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string | null;
          unit_default_id?: string | null;
          role?: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          unit_default_id?: string | null;
          role?: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profissionais: {
        Row: {
          id: string;
          nome: string;
          papel: string;
          unidade_id: string;
          ativo: boolean;
          comissao_regra: ComissaoRegra | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          papel: string;
          unidade_id: string;
          ativo?: boolean;
          comissao_regra?: ComissaoRegra | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          papel?: string;
          unidade_id?: string;
          ativo?: boolean;
          comissao_regra?: ComissaoRegra | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clientes: {
        Row: {
          id: string;
          nome: string;
          email: string | null;
          telefone: string | null;
          preferencias: ClientePreferencias | null;
          unidade_id: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email?: string | null;
          telefone?: string | null;
          preferencias?: ClientePreferencias | null;
          unidade_id: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string | null;
          telefone?: string | null;
          preferencias?: ClientePreferencias | null;
          unidade_id?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      servicos: {
        Row: {
          id: string;
          nome: string;
          categoria: string | null;
          preco: number;
          duracao_min: number;
          ativo: boolean;
          unidade_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          categoria?: string | null;
          preco: number;
          duracao_min: number;
          ativo?: boolean;
          unidade_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          categoria?: string | null;
          preco?: number;
          duracao_min?: number;
          ativo?: boolean;
          unidade_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          cliente_id: string;
          profissional_id: string;
          unidade_id: string;
          inicio: string;
          fim: string;
          status: 'criado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'faltou';
          total: number;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          profissional_id: string;
          unidade_id: string;
          inicio: string;
          fim: string;
          status?:
            | 'criado'
            | 'confirmado'
            | 'em_atendimento'
            | 'concluido'
            | 'cancelado'
            | 'faltou';
          total: number;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          profissional_id?: string;
          unidade_id?: string;
          inicio?: string;
          fim?: string;
          status?:
            | 'criado'
            | 'confirmado'
            | 'em_atendimento'
            | 'concluido'
            | 'cancelado'
            | 'faltou';
          total?: number;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments_servicos: {
        Row: {
          id: string;
          appointment_id: string;
          servico_id: string;
          preco_aplicado: number;
          duracao_aplicada: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          servico_id: string;
          preco_aplicado: number;
          duracao_aplicada: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          servico_id?: string;
          preco_aplicado?: number;
          duracao_aplicada?: number;
          created_at?: string;
        };
      };
      fila: {
        Row: {
          id: string;
          unidade_id: string;
          cliente_id: string;
          status: 'aguardando' | 'chamado' | 'em_atendimento' | 'concluido' | 'desistiu';
          prioridade: 'normal' | 'prioritaria' | 'urgente';
          posicao: number;
          estimativa_min: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unidade_id: string;
          cliente_id: string;
          status?: 'aguardando' | 'chamado' | 'em_atendimento' | 'concluido' | 'desistiu';
          prioridade?: 'normal' | 'prioritaria' | 'urgente';
          posicao: number;
          estimativa_min?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unidade_id?: string;
          cliente_id?: string;
          status?: 'aguardando' | 'chamado' | 'em_atendimento' | 'concluido' | 'desistiu';
          prioridade?: 'normal' | 'prioritaria' | 'urgente';
          posicao?: number;
          estimativa_min?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financeiro_mov: {
        Row: {
          id: string;
          unidade_id: string;
          tipo: 'entrada' | 'saida';
          valor: number;
          origem: string;
          referencia_id: string | null;
          data_mov: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unidade_id: string;
          tipo: 'entrada' | 'saida';
          valor: number;
          origem: string;
          referencia_id?: string | null;
          data_mov: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unidade_id?: string;
          tipo?: 'entrada' | 'saida';
          valor?: number;
          origem?: string;
          referencia_id?: string | null;
          data_mov?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      /**
       * =====================================================================
       * NOVAS TABELAS (EN) - alvo final do schema
       * =====================================================================
       */
      units: {
        Row: {
          id: string;
          name: string;
          tax_id: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          config: ConfigRecord;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tax_id?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          config?: ConfigRecord;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tax_id?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          config?: ConfigRecord;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      professionals: {
        Row: {
          id: string;
          name: string;
          role: string;
          unit_id: string;
          active: boolean;
          commission_rule: ComissaoRegra | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          unit_id: string;
          active?: boolean;
          commission_rule?: ComissaoRegra | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          unit_id?: string;
          active?: boolean;
          commission_rule?: ComissaoRegra | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          preferences: ClientePreferencias | null;
          unit_id: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          preferences?: ClientePreferencias | null;
          unit_id: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          preferences?: ClientePreferencias | null;
          unit_id?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          price_cents: number;
          duration_minutes: number;
          active: boolean;
          unit_id: string;
          category_id?: string | null; // se existir
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          price_cents: number;
          duration_minutes: number;
          active?: boolean;
          unit_id: string;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          price_cents?: number;
          duration_minutes?: number;
          active?: boolean;
          unit_id?: string;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointment_services: {
        Row: {
          id: string;
          appointment_id: string;
          service_id: string;
          applied_price_cents: number;
          applied_duration_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          service_id: string;
          applied_price_cents: number;
          applied_duration_minutes: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          service_id?: string;
          applied_price_cents?: number;
          applied_duration_minutes?: number;
          created_at?: string;
        };
      };
      queue: {
        Row: {
          id: string;
          unit_id: string;
          customer_id: string;
          status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'abandoned';
          priority: 'normal' | 'priority' | 'urgent';
          position: number;
          estimated_wait_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          customer_id: string;
          status?: 'waiting' | 'called' | 'in_progress' | 'completed' | 'abandoned';
          priority?: 'normal' | 'priority' | 'urgent';
          position: number;
          estimated_wait_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          customer_id?: string;
          status?: 'waiting' | 'called' | 'in_progress' | 'completed' | 'abandoned';
          priority?: 'normal' | 'priority' | 'urgent';
          position?: number;
          estimated_wait_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_movements: {
        Row: {
          id: string;
          unit_id: string;
          type: 'income' | 'expense';
          amount_cents: number;
          source: string;
          reference_id: string | null;
          movement_date: string; // data_mov renomeado
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          type: 'income' | 'expense';
          amount_cents: number;
          source: string;
          reference_id?: string | null;
          movement_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          type?: 'income' | 'expense';
          amount_cents?: number;
          source?: string;
          reference_id?: string | null;
          movement_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      current_unidade_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_unit_access: {
        Args: { unidade_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'admin' | 'manager' | 'professional' | 'receptionist';
      appointment_status:
        | 'created'
        | 'confirmed'
        | 'in_progress'
        | 'completed'
        | 'cancelled'
        | 'no_show';
      queue_status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'abandoned';
      queue_priority: 'normal' | 'priority' | 'urgent';
      transaction_type: 'income' | 'expense';
      // Legacy enums (deprecated but kept for compatibility)
      /** @deprecated use user_role with English values */
      user_role_pt: 'admin' | 'gestor' | 'profissional' | 'recepcao';
      /** @deprecated use appointment_status with English values */
      appointment_status_pt:
        | 'criado'
        | 'confirmado'
        | 'em_atendimento'
        | 'concluido'
        | 'cancelado'
        | 'faltou';
      /** @deprecated use queue_status with English values */
      queue_status_pt: 'aguardando' | 'chamado' | 'em_atendimento' | 'concluido' | 'desistiu';
      /** @deprecated use queue_priority with English values */
      queue_priority_pt: 'normal' | 'prioritaria' | 'urgente';
      /** @deprecated use transaction_type */
      movimento_tipo: 'entrada' | 'saida';
    };
  };
  audit: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
