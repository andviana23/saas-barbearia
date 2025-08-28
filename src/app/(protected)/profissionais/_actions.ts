'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActionResult, ValidationError } from '@/types';
import { withValidationSchema } from '@/lib/server-actions';

const ProfissionalSchema = z.object({
  nome: z.string().min(2),
  unidade_id: z.string().uuid(),
});
const ListSchema = z.object({ unidadeId: z.string().uuid() });

export async function createProfissionalAction(formData: FormData): Promise<ActionResult> {
  const data = { nome: formData.get('nome'), unidade_id: formData.get('unidade_id') };
  const parsed = ProfissionalSchema.safeParse(data);
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
    .from('profissionais')
    .insert(parsed.data)
    .select('*')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: inserted };
}

export const listProfissionaisAction = withValidationSchema(ListSchema, async ({ unidadeId }) => {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('profissionais')
    .select('*')
    .eq('unidade_id', unidadeId)
    .limit(200);
  if (error) throw new Error(error.message);
  return data;
});
