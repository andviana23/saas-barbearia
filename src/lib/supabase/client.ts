import type { Database } from '@/types/database';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// Falhar explicitamente se variáveis não estiverem presentes (somente nuvem)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars ausentes');
}

/**
 * Cliente Supabase para uso no lado do cliente (Client Components)
 * Usa a chave anônima e respeita RLS (Row Level Security)
 * Baseado em @supabase/ssr para compatibilidade com Next.js App Router
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(supabaseUrl as string, supabaseAnonKey as string);
}

/**
 * Instância singleton do cliente Supabase para uso em Client Components
 * Use apenas em Client Components, hooks e código client-side
 */
export const supabase = createBrowserSupabase();
