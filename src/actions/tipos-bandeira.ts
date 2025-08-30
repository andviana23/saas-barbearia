'use server';

import { revalidateTag } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  createTipoBandeiraSchema,
  updateTipoBandeiraSchema,
  listTiposFilterSchema,
  type TipoBandeira,
  type ListTiposFilter,
} from '@/schemas/tipos';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Listar Bandeiras de Cartão
export async function getTiposBandeira(
  filter?: ListTiposFilter,
): Promise<ActionResult<TipoBandeira[]>> {
  try {
    const validatedFilter = listTiposFilterSchema.parse(filter || {});
    const supabase = createServerSupabase();

    let query = supabase
      .from('tipos_bandeira')
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
      error: error instanceof Error ? error.message : 'Erro ao buscar bandeiras de cartão',
    };
  }
}

// Criar Bandeira de Cartão
export async function createTipoBandeira(formData: FormData): Promise<ActionResult<TipoBandeira>> {
  try {
    const rawData = {
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      codigo: formData.get('codigo'),
      taxa_percentual: parseFloat(formData.get('taxa_percentual') as string) || 0,
      ativo: formData.get('ativo') === 'true',
      logo_url: formData.get('logo_url'),
      cor_primaria: formData.get('cor_primaria'),
      prefixo_cartao: formData.get('prefixo_cartao'),
      comprimento_cartao: parseInt(formData.get('comprimento_cartao') as string) || undefined,
    };

    const validatedData = createTipoBandeiraSchema.parse(rawData);
    const supabase = createServerSupabase();

    // Verificar se o código já existe
    const { data: existing } = await supabase
      .from('tipos_bandeira')
      .select('id')
      .eq('codigo', validatedData.codigo)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'Já existe uma bandeira com este código',
      };
    }

    // Obter próxima ordem
    const { data: lastOrder } = await supabase
      .from('tipos_bandeira')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1)
      .single();

    const novaOrdem = (lastOrder?.ordem || 0) + 1;

    const { data, error } = await supabase
      .from('tipos_bandeira')
      .insert({
        ...validatedData,
        ordem: novaOrdem,
      })
      .select()
      .single();

    if (error) throw error;

    revalidateTag('tipos-bandeira');
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar bandeira de cartão',
    };
  }
}

// Atualizar Bandeira de Cartão
export async function updateTipoBandeira(formData: FormData): Promise<ActionResult<TipoBandeira>> {
  try {
    const rawData = {
      id: formData.get('id'),
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      codigo: formData.get('codigo'),
      taxa_percentual: parseFloat(formData.get('taxa_percentual') as string) || 0,
      ativo: formData.get('ativo') === 'true',
      logo_url: formData.get('logo_url'),
      cor_primaria: formData.get('cor_primaria'),
      prefixo_cartao: formData.get('prefixo_cartao'),
      comprimento_cartao: parseInt(formData.get('comprimento_cartao') as string) || undefined,
      ordem: parseInt(formData.get('ordem') as string) || 0,
    };

    const validatedData = updateTipoBandeiraSchema.parse(rawData);
    const supabase = createServerSupabase();

    // Verificar se o código já existe em outro registro
    if (validatedData.codigo) {
      const { data: existing } = await supabase
        .from('tipos_bandeira')
        .select('id')
        .eq('codigo', validatedData.codigo)
        .neq('id', validatedData.id)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'Já existe uma bandeira com este código',
        };
      }
    }

    const { data, error } = await supabase
      .from('tipos_bandeira')
      .update(validatedData)
      .eq('id', validatedData.id)
      .select()
      .single();

    if (error) throw error;

    revalidateTag('tipos-bandeira');
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar bandeira de cartão',
    };
  }
}

// Deletar Bandeira de Cartão
export async function deleteTipoBandeira(id: string): Promise<ActionResult> {
  try {
    const supabase = createServerSupabase();

    // Verificar se está sendo usado
    const { data: transacoes } = await supabase
      .from('financeiro_mov')
      .select('id')
      .eq('bandeira_id', id)
      .limit(1);

    if (transacoes && transacoes.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir esta bandeira pois ela está sendo usada em transações',
      };
    }

    const { error } = await supabase.from('tipos_bandeira').delete().eq('id', id);

    if (error) throw error;

    revalidateTag('tipos-bandeira');
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir bandeira de cartão',
    };
  }
}
