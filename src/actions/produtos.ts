'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { withValidation } from '@/lib/server-actions';
import { CreateProdutoSchema, UpdateProdutoSchema, type ProdutoFilterData } from '@/schemas';
import type { ActionResult } from '@/types';

// Criar produto
export async function createProduto(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    descricao: formData.get('descricao'),
    preco: Number(formData.get('preco')),
    estoque: Number(formData.get('estoque') || '0'),
    ativo: formData.get('ativo') === 'true',
    unit_id: formData.get('unidade_id'),
  };

  return withValidation(CreateProdutoSchema, data, async (validatedData) => {
    const { data: produto, error } = await createServerSupabase()
      .from('products')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }

    revalidatePath('/produtos');
    return produto;
  });
}

// Atualizar produto
export async function updateProduto(id: string, formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    descricao: formData.get('descricao'),
    preco: Number(formData.get('preco')),
    estoque: Number(formData.get('estoque')),
    ativo: formData.get('ativo') === 'true',
  };

  return withValidation(UpdateProdutoSchema, data, async (validatedData) => {
    const { data: produto, error } = await createServerSupabase()
      .from('products')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }

    revalidatePath('/produtos');
    revalidatePath(`/produtos/${id}`);
    return produto;
  });
}

// Deletar produto
export async function deleteProduto(id: string): Promise<ActionResult> {
  try {
    // Verificar se produto existe e não tem vendas associadas
    const { data: produto, error: fetchError } = await createServerSupabase()
      .from('products')
      .select('id, nome')
      .eq('id', id)
      .single();

    if (fetchError || !produto) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se há itens de venda associados
    const { data: vendasItens, error: vendasError } = await createServerSupabase()
      .from('vendas_itens')
      .select('id')
      .eq('produto_id', id)
      .limit(1);

    if (vendasError) {
      throw new Error(`Erro ao verificar vendas: ${vendasError.message}`);
    }

    if (vendasItens && vendasItens.length > 0) {
      // Desativar em vez de deletar se houver vendas
      const { error: updateError } = await createServerSupabase()
        .from('products')
        .update({ ativo: false })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Erro ao desativar produto: ${updateError.message}`);
      }

      revalidatePath('/produtos');
      return {
        success: true,
        message: 'Produto desativado (possui vendas associadas)',
        data: { id, desativado: true },
      };
    }

    // Deletar produto se não houver vendas
    const { error: deleteError } = await createServerSupabase()
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Erro ao deletar produto: ${deleteError.message}`);
    }

    revalidatePath('/produtos');
    return {
      success: true,
      message: 'Produto deletado com sucesso',
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Listar produtos
export async function listProdutos(
  filters: ProdutoFilterData = {
    page: 0,
    limit: 10,
    order: 'desc',
  },
): Promise<ActionResult> {
  try {
    let query = createServerSupabase()
      .from('products')
      .select('*')
      .order(filters.sort || 'created_at', {
        ascending: filters.order === 'asc',
      });

    // Aplicar filtros
    if (filters.q) {
      query = query.ilike('nome', `%${filters.q}%`);
    }

    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    if (filters.unidade_id) {
      query = query.eq('unidade_id', filters.unidade_id);
    }

    if (filters.preco_min !== undefined) {
      query = query.gte('preco', filters.preco_min);
    }

    if (filters.preco_max !== undefined) {
      query = query.lte('preco', filters.preco_max);
    }

    // Paginação
    const offset = filters.page * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: produtos, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao listar produtos: ${error.message}`);
    }

    return {
      success: true,
      data: {
        produtos: produtos || [],
        total: count || 0,
        page: filters.page,
        limit: filters.limit,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Buscar produto por ID
export async function getProduto(id: string): Promise<ActionResult> {
  try {
    const { data: produto, error } = await createServerSupabase()
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar produto: ${error.message}`);
    }

    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    return {
      success: true,
      data: produto,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Atualizar estoque do produto
export async function updateEstoqueProduto(id: string, novoEstoque: number): Promise<ActionResult> {
  try {
    if (novoEstoque < 0) {
      throw new Error('Estoque não pode ser negativo');
    }

    const { data: produto, error } = await createServerSupabase()
      .from('products')
      .update({ estoque: novoEstoque })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar estoque: ${error.message}`);
    }

    revalidatePath('/produtos');
    revalidatePath(`/produtos/${id}`);

    return {
      success: true,
      data: produto,
      message: 'Estoque atualizado com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Baixar estoque (usado em vendas)
export async function baixarEstoqueProduto(id: string, quantidade: number): Promise<ActionResult> {
  try {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    // Buscar produto atual
    const { data: produto, error: fetchError } = await createServerSupabase()
      .from('products')
      .select('estoque')
      .eq('id', id)
      .single();

    if (fetchError || !produto) {
      throw new Error('Produto não encontrado');
    }

    const novoEstoque = produto.estoque - quantidade;

    if (novoEstoque < 0) {
      throw new Error('Estoque insuficiente');
    }

    const { data: produtoAtualizado, error } = await createServerSupabase()
      .from('products')
      .update({ estoque: novoEstoque })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao baixar estoque: ${error.message}`);
    }

    revalidatePath('/produtos');

    return {
      success: true,
      data: produtoAtualizado,
      message: `Estoque reduzido em ${quantidade} unidade(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
