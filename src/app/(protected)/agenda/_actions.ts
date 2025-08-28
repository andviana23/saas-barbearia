// Server Actions Agenda
'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: unknown;
}

// Schema básico (expandir depois)
export const CreateAppointmentSchema = z.object({
  profissional_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  inicio: z.string(),
  fim: z.string(),
  unidade_id: z.string().uuid(),
});

export async function createAppointmentAction(formData: FormData): Promise<ActionResult> {
  const supabase = createServerSupabase();
  const data = {
    profissional_id: formData.get('profissional_id'),
    cliente_id: formData.get('cliente_id'),
    inicio: formData.get('inicio'),
    fim: formData.get('fim'),
    unidade_id: formData.get('unidade_id'),
  };

  const parsed = CreateAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos', issues: parsed.error.issues };
  }

  const { data: inserted, error } = await supabase
    .from('appointments')
    .insert({
      profissional_id: parsed.data.profissional_id,
      cliente_id: parsed.data.cliente_id,
      inicio: parsed.data.inicio,
      fim: parsed.data.fim,
      unit_id: parsed.data.unidade_id,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: inserted };
}
