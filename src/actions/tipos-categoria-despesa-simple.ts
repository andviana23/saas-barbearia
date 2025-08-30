'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase-server';

export async function getTiposCategoriasDespesa() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('tipos_categoria_despesa')
      .select('*')
      .eq('tipo', 'despesa')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias de despesa:', error);
      return { success: false, error: 'Erro ao buscar categorias de despesa' };
    }

    return {
      success: true,
      data: data || [],
      total: data?.length || 0,
    };
  } catch (error) {
    console.error('Erro interno:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function createTipoCategoriasDespesa(formData: FormData) {
  try {
    const supabase = createClient();

    const data = {
      codigo: formData.get('codigo') as string,
      nome: formData.get('nome') as string,
      descricao: (formData.get('descricao') as string) || null,
      cor: (formData.get('cor_primaria') as string) || '#1976d2',
      icon: (formData.get('icone') as string) || null,
      categoria_pai_id: (formData.get('parent_id') as string) || null,
      ordem: parseInt(formData.get('ordem') as string) || 0,
      ativo: formData.get('ativo') === 'true',
      obrigatoria: formData.get('obrigatoria') === 'true',
      centro_custo: (formData.get('centro_custo') as string) || null,
      limite_mensal: formData.get('limite_mensal')
        ? parseFloat(formData.get('limite_mensal') as string)
        : null,
      tipo: 'despesa',
    };

    // Verificar código único
    const { data: existing } = await supabase
      .from('tipos_categoria_despesa')
      .select('id')
      .eq('codigo', data.codigo)
      .eq('tipo', 'despesa')
      .single();

    if (existing) {
      return { success: false, error: 'Código já existe' };
    }

    // Inserir
    const { data: newRecord, error } = await supabase
      .from('tipos_categoria_despesa')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      return { success: false, error: 'Erro ao criar categoria de despesa' };
    }

    revalidateTag('tipos-categoria-despesa');
    return { success: true, data: newRecord };
  } catch (error) {
    console.error('Erro interno:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updateTipoCategoriasDespesa(formData: FormData) {
  try {
    const supabase = createClient();

    const id = formData.get('id') as string;
    if (!id) {
      return { success: false, error: 'ID é obrigatório' };
    }

    const data = {
      codigo: formData.get('codigo') as string,
      nome: formData.get('nome') as string,
      descricao: (formData.get('descricao') as string) || null,
      cor: (formData.get('cor_primaria') as string) || '#1976d2',
      icon: (formData.get('icone') as string) || null,
      categoria_pai_id: (formData.get('parent_id') as string) || null,
      ordem: parseInt(formData.get('ordem') as string) || 0,
      ativo: formData.get('ativo') === 'true',
      obrigatoria: formData.get('obrigatoria') === 'true',
      centro_custo: (formData.get('centro_custo') as string) || null,
      limite_mensal: formData.get('limite_mensal')
        ? parseFloat(formData.get('limite_mensal') as string)
        : null,
    };

    // Verificar se existe
    const { data: existing } = await supabase
      .from('tipos_categoria_despesa')
      .select('*')
      .eq('id', id)
      .eq('tipo', 'despesa')
      .single();

    if (!existing) {
      return { success: false, error: 'Categoria não encontrada' };
    }

    // Verificar código único (exceto próprio registro)
    const { data: duplicate } = await supabase
      .from('tipos_categoria_despesa')
      .select('id')
      .eq('codigo', data.codigo)
      .eq('tipo', 'despesa')
      .neq('id', id)
      .single();

    if (duplicate) {
      return { success: false, error: 'Código já existe' };
    }

    // Atualizar
    const { data: updated, error } = await supabase
      .from('tipos_categoria_despesa')
      .update(data)
      .eq('id', id)
      .eq('tipo', 'despesa')
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar:', error);
      return { success: false, error: 'Erro ao atualizar categoria' };
    }

    revalidateTag('tipos-categoria-despesa');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Erro interno:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function deleteTipoCategoriasDespesa(id: string) {
  try {
    const supabase = createClient();

    // Verificar se existe
    const { data: existing } = await supabase
      .from('tipos_categoria_despesa')
      .select('*')
      .eq('id', id)
      .eq('tipo', 'despesa')
      .single();

    if (!existing) {
      return { success: false, error: 'Categoria não encontrada' };
    }

    // Verificar se tem filhos
    const { data: children } = await supabase
      .from('tipos_categoria_despesa')
      .select('id')
      .eq('categoria_pai_id', id)
      .eq('tipo', 'despesa');

    if (children && children.length > 0) {
      return { success: false, error: 'Não é possível excluir categoria que possui subcategorias' };
    }

    // Deletar
    const { error } = await supabase
      .from('tipos_categoria_despesa')
      .delete()
      .eq('id', id)
      .eq('tipo', 'despesa');

    if (error) {
      console.error('Erro ao deletar:', error);
      return { success: false, error: 'Erro ao deletar categoria' };
    }

    revalidateTag('tipos-categoria-despesa');
    return { success: true };
  } catch (error) {
    console.error('Erro interno:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
