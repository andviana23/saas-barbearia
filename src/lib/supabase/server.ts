import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Verifica se estamos no servidor (Node.js) ou no cliente (browser)
const isServer = typeof window === 'undefined'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Só valida as variáveis no servidor
if (isServer && (!supabaseUrl || !supabaseServiceRoleKey)) {
  throw new Error('Missing Supabase server environment variables')
}

// No cliente, usar valores padrão para evitar erros
const serverUrl = isServer
  ? supabaseUrl
  : supabaseUrl || 'http://127.0.0.1:54321'
const serverKey = isServer ? supabaseServiceRoleKey : 'dummy-key'

/**
 * Cliente Supabase para uso no servidor (Server Actions)
 * Usa a service role key que bypassa RLS quando necessário
 * ATENÇÃO: Use apenas em Server Actions, nunca no cliente
 */
export const supabaseAdmin = createClient<Database>(serverUrl, serverKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'trato-server-admin',
    },
  },
})

/**
 * Cliente Supabase para uso no servidor respeitando RLS
 * Para operações que devem respeitar as políticas de segurança
 */
export const supabaseServer = createClient<Database>(
  serverUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'trato-server-rls',
      },
    },
  }
)

// Export padrão para compatibilidade com imports existentes
export const supabase = supabaseServer
