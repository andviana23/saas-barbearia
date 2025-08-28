'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActionResult, ValidationError } from '@/types';

const LancamentoSchema = z.object({
  descricao: z.string().min(2),
  valor: z.number().min(0),
  unidade_id: z.string().uuid(),
});

export async function criarLancamentoAction(formData: FormData): Promise<ActionResult> {
  const data = {
    descricao: formData.get('descricao'),
    valor: Number(formData.get('valor')),
    unidade_id: formData.get('unidade_id'),
  };
  const parsed = LancamentoSchema.safeParse(data);
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
    .from('lancamentos')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: inserted };
}

export async function listarLancamentosAction(unidadeId: string): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('unidade_id', unidadeId)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
