'use server';

import { revalidateTag } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  createTipoPagamentoSchema,
  updateTipoPagamentoSchema,
  listTiposFilterSchema,
  type TipoPagamento,
  type ListTiposFilter,
} from '@/schemas/tipos';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Listar Tipos de Pagamento
export async function getTiposPagamento(
  filter?: ListTiposFilter,
): Promise<ActionResult<TipoPagamento[]>> {
  try {
    const validatedFilter = listTiposFilterSchema.parse(filter || {});
    const supabase = createServerSupabase();

    let query = supabase
      .from('tipos_pagamento')
      .select('*')
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (validatedFilter.ativo !== undefined) {
      query = query.eq('ativo', validatedFilter.ativo);
    }

    if (validatedFilter.search) {
      query = query.or(
        `nome.ilike.%${validatedFilter.search}%,codigo.ilike.%${validatedFilter.search}%`,
      );
    }

    if (validatedFilter.limit && validatedFilter.offset !== undefined) {
      query = query.range(
        validatedFilter.offset,
        validatedFilter.offset + validatedFilter.limit - 1,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar tipos de pagamento',
    };
  }
}

// Criar Tipo de Pagamento
export async function createTipoPagamento(
  formData: FormData,
): Promise<ActionResult<TipoPagamento>> {
  try {
    const rawData = {
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      codigo: formData.get('codigo'),
      taxa_percentual: parseFloat(formData.get('taxa_percentual') as string) || 0,
      taxa_fixa: parseFloat(formData.get('taxa_fixa') as string) || 0,
      aceita_parcelamento: formData.get('aceita_parcelamento') === 'true',
      max_parcelas: parseInt(formData.get('max_parcelas') as string) || 1,
      requer_autorizacao: formData.get('requer_autorizacao') === 'true',
      ativo: formData.get('ativo') === 'true',
      icon: formData.get('icon'),
      cor: formData.get('cor'),
    };

    const validatedData = createTipoPagamentoSchema.parse(rawData);
    const supabase = createServerSupabase();

    // Verificar se o código já existe
    const { data: existing } = await supabase
      .from('tipos_pagamento')
      .select('id')
      .eq('codigo', validatedData.codigo)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'Já existe um tipo de pagamento com este código',
      };
    }

    // Obter próxima ordem
    const { data: lastOrder } = await supabase
      .from('tipos_pagamento')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1)
      .single();

    const novaOrdem = (lastOrder?.ordem || 0) + 1;

    const { data, error } = await supabase
      .from('tipos_pagamento')
      .insert({
        ...validatedData,
        ordem: novaOrdem,
      })
      .select()
      .single();

    if (error) throw error;

    revalidateTag('tipos-pagamento');
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar tipo de pagamento',
    };
  }
}

// Atualizar Tipo de Pagamento
export async function updateTipoPagamento(
  formData: FormData,
): Promise<ActionResult<TipoPagamento>> {
  try {
    const rawData = {
      id: formData.get('id'),
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      codigo: formData.get('codigo'),
      taxa_percentual: parseFloat(formData.get('taxa_percentual') as string) || 0,
      taxa_fixa: parseFloat(formData.get('taxa_fixa') as string) || 0,
      aceita_parcelamento: formData.get('aceita_parcelamento') === 'true',
      max_parcelas: parseInt(formData.get('max_parcelas') as string) || 1,
      requer_autorizacao: formData.get('requer_autorizacao') === 'true',
      ativo: formData.get('ativo') === 'true',
      icon: formData.get('icon'),
      cor: formData.get('cor'),
      ordem: parseInt(formData.get('ordem') as string) || 0,
    };

    const validatedData = updateTipoPagamentoSchema.parse(rawData);
    const supabase = createServerSupabase();

    // Verificar se o código já existe em outro registro
    if (validatedData.codigo) {
      const { data: existing } = await supabase
        .from('tipos_pagamento')
        .select('id')
        .eq('codigo', validatedData.codigo)
        .neq('id', validatedData.id)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'Já existe um tipo de pagamento com este código',
        };
      }
    }

    const { data, error } = await supabase
      .from('tipos_pagamento')
      .update(validatedData)
      .eq('id', validatedData.id)
      .select()
      .single();

    if (error) throw error;

    revalidateTag('tipos-pagamento');
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar tipo de pagamento',
    };
  }
}

// Deletar Tipo de Pagamento
export async function deleteTipoPagamento(id: string): Promise<ActionResult> {
  try {
    const supabase = createServerSupabase();

    // Verificar se está sendo usado
    const { data: transacoes } = await supabase
      .from('financeiro_mov')
      .select('id')
      .eq('tipo_pagamento_id', id)
      .limit(1);

    if (transacoes && transacoes.length > 0) {
      return {
        success: false,
        error:
          'Não é possível excluir este tipo de pagamento pois ele está sendo usado em transações',
      };
    }

    const { error } = await supabase.from('tipos_pagamento').delete().eq('id', id);

    if (error) throw error;

    revalidateTag('tipos-pagamento');
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir tipo de pagamento',
    };
  }
}

// Reordenar Tipos de Pagamento
export async function reorderTiposPagamento(
  items: { id: string; ordem: number }[],
): Promise<ActionResult> {
  try {
    const supabase = createServerSupabase();

    for (const item of items) {
      const { error } = await supabase
        .from('tipos_pagamento')
        .update({ ordem: item.ordem })
        .eq('id', item.id);

      if (error) throw error;
    }

    revalidateTag('tipos-pagamento');
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao reordenar tipos de pagamento',
    };
  }
}
