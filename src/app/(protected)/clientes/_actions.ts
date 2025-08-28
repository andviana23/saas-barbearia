'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { withValidationSchema } from '@/lib/server-actions';
import { ActionResult, ValidationError } from '@/types';

const ClienteSchema = z.object({
  nome: z.string().min(2),
  telefone: z.string().optional(),
  unidade_id: z.string().uuid(),
});
const ListSchema = z.object({ unidadeId: z.string().uuid() });

export async function createClienteAction(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    telefone: formData.get('telefone'),
    unidade_id: formData.get('unidade_id'),
  };
  const parsed = ClienteSchema.safeParse(data);
  if (!parsed.success) {
    const errors: ValidationError[] = parsed.error.errors.map((e) => ({
      field: e.path.join('.') || 'root',
      message: e.message,
      code: e.code,
    }));
    return { success: false, error: 'Dados inválidos', errors } as ActionResult;
  }
  const supabase = createServerSupabase();
  const { data: inserted, error } = await supabase
    .from('clientes')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: inserted };
}

export const listClientesAction = withValidationSchema(ListSchema, async ({ unidadeId }) => {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('unidade_id', unidadeId)
    .limit(200);
  if (error) throw new Error(error.message);
  return data;
});
