// Action Result Type - Padrão obrigatório para Server Actions
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: ValidationError[];
}

// Validation Error Type
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Action State para formulários
export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp?: number;
}

// Database Types - Base para Supabase/Neon
export interface Database {
  public: {
    Tables: {
      unidades: {
        Row: {
          id: string;
          nome: string;
          cnpj?: string;
          endereco?: string;
          telefone?: string;
          email?: string;
          ativo: boolean;
          config: Record<string, string | number | boolean | null>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string;
          endereco?: string;
          telefone?: string;
          email?: string;
          ativo?: boolean;
          config?: Record<string, string | number | boolean | null>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string;
          endereco?: string;
          telefone?: string;
          email?: string;
          ativo?: boolean;
          config?: Record<string, string | number | boolean | null>;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          email: string;
          telefone?: string;
          unidade_default_id?: string;
          papel: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          email: string;
          telefone?: string;
          unidade_default_id?: string;
          papel?: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          email?: string;
          telefone?: string;
          unidade_default_id?: string;
          papel?: 'admin' | 'gestor' | 'profissional' | 'recepcao';
          ativo?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility Types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
