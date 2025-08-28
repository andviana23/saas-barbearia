'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActionResult, ValidationError } from '@/types';

const RelatorioFiltroSchema = z.object({
  unidade_id: z.string().uuid(),
  periodo_inicio: z.string().optional(),
  periodo_fim: z.string().optional(),
});

export async function relatorioFinanceiroAction(input: unknown): Promise<ActionResult> {
  const parsed = RelatorioFiltroSchema.safeParse(input);
  if (!parsed.success) {
    const errors: ValidationError[] = parsed.error.errors.map((e) => ({
      field: e.path.join('.') || 'root',
      message: e.message,
      code: e.code,
    }));
    return { success: false, error: 'Dados inválidos', errors };
  }
  const supabase = createServerSupabase();
  void supabase; // placeholder até termos agregações
  return { success: true, data: { total: 0, filtros: parsed.data } };
}
