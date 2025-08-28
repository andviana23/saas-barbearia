'use server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ActionResult } from '@/types';

export async function dashboardResumoAction(unidadeId: string): Promise<ActionResult> {
  const supabase = createServerSupabase();
  void supabase; // placeholder até implementar consultas
  return {
    success: true,
    data: { unidadeId, KPIs: { faturamentoMensal: 0, novosClientes: 0 } },
  };
}
