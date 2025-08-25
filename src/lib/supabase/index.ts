// Exports centralizados APENAS para clientes (browser)
// IMPORTANTE: Não importar server.ts aqui pois roda no cliente

export { supabase } from './client'

// Função helper para criar cliente Supabase (para compatibilidade)
import { supabase as clientSupabase } from './client'
export const createClient = () => {
  return clientSupabase
}

// Para Server Actions, importe diretamente de:
// import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server'

// Re-exports de tipos úteis do Supabase
export type {
  AuthUser,
  AuthSession,
  AuthError,
  PostgrestError,
  PostgrestResponse,
  RealtimeChannel,
} from '@supabase/supabase-js'
