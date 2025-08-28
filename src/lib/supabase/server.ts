// src/lib/supabase/server.ts
import type { Database } from '@/types/database';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL/ANON_KEY no ambiente.');
}

/**
 * SERVER (SSR) — respeita RLS e LÊ COOKIES
 * Usado em Server Components, Server Actions e Pages
 */

/** SERVER (SSR) — respeita RLS e lê COOKIES
 * Usado em Server Components, Server Actions e Pages
 * Exportação única, sem instância global
 */
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method foi chamado de um Server Component.
          // Ignorar se houver middleware que atualiza sessão.
        }
      },
    },
  });
}
