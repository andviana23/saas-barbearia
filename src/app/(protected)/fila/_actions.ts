'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActionResult, ValidationError } from '@/types';

const FilaEntradaSchema = z.object({
  cliente_id: z.string().uuid(),
  unidade_id: z.string().uuid(),
});

export async function entrarFilaAction(formData: FormData): Promise<ActionResult> {
  const data = { cliente_id: formData.get('cliente_id'), unidade_id: formData.get('unidade_id') };
  const parsed = FilaEntradaSchema.safeParse(data);
  if (!parsed.success) {
    const errors: ValidationError[] = parsed.error.errors.map((e) => ({
      field: e.path.join('.') || 'root',
      message: e.message,
      code: e.code,
    }));
    return { success: false, error: 'Dados inválidos', errors };
  }
  const supabase = createServerSupabase();
  const { data: inserted, error } = await supabase
    .from('queue')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: inserted };
}

export async function listarFilaAction(unidadeId: string): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('queue')
    .select('*')
    .eq('unidade_id', unidadeId)
    .order('created_at');
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
