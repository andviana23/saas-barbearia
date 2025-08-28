'use server';

import { createAdminSupabase } from '@/lib/supabase';

interface EnsureProfileResult {
  success: boolean;
  error?: string;
  created?: boolean;
}

export async function ensureProfileForUser(
  userId: string,
  email?: string,
  nome?: string,
): Promise<EnsureProfileResult> {
  if (!userId) return { success: false, error: 'userId ausente' };

  const supabaseAdmin = createAdminSupabase();
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchErr) return { success: false, error: fetchErr.message };
  if (existing) return { success: true, created: false };

  const { error: insertErr } = await supabaseAdmin.from('profiles').insert([
    {
      user_id: userId,
      email: email ?? 'unknown@example.com',
      nome: nome ?? 'Usuário',
      ativo: true,
    },
  ] as unknown as never); // TODO: remover cast após ajustar types gerados

  if (insertErr) return { success: false, error: insertErr.message };
  return { success: true, created: true };
}
