'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActionResult, ValidationError } from '@/types';

const ProdutoSchema = z.object({
  nome: z.string().min(2),
  preco: z.number().min(0),
  unidade_id: z.string().uuid(),
});

export async function createProdutoAction(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    preco: Number(formData.get('preco')),
    unidade_id: formData.get('unidade_id'),
  };
  const parsed = ProdutoSchema.safeParse(data);
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
    .from('produtos')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: inserted };
}

export async function listProdutosAction(unidadeId: string): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('unidade_id', unidadeId)
    .limit(200);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
