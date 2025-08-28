// Client-safe exports only
export { createBrowserSupabase, supabase } from './client';

// Admin client for server-only use
import type { Database } from '@/types/database';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** ADMIN (service role) — sem RLS, só no SERVER
 * Usado apenas em Server Actions para operações administrativas
 */
export function createAdminSupabase() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminSupabase() não pode ser usado no client.');
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY no ambiente do server.');
  }
  return createAdminClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
    global: { headers: { 'x-client-info': 'trato-server-admin' } },
  });
}
