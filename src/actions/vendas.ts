'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { withValidation } from '@/lib/server-actions';
import {
  CreateVendaSchema,
  UpdateVendaSchema,
  CreateVendaItemSchema,
  type VendaFilterData,
} from '@/schemas';
import type { ActionResult } from '@/types';
import { baixarEstoqueProduto } from './produtos';

// Criar venda
export async function createVenda(formData: FormData): Promise<ActionResult> {
  const data = {
    cliente_id: formData.get('cliente_id') || undefined,
    profissional_id: formData.get('profissional_id') || undefined,
    valor_total: Number(formData.get('valor_total') || '0'),
    status: formData.get('status') || 'aberta',
    unit_id: formData.get('unidade_id'),
  };

  return withValidation(CreateVendaSchema, data, async (validatedData) => {
    const { data: venda, error } = await createServerSupabase()
      .from('vendas')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar venda: ${error.message}`);
    }

    revalidatePath('/vendas');
    return venda;
  });
}

// Atualizar venda
export async function updateVenda(id: string, formData: FormData): Promise<ActionResult> {
  const data = {
    cliente_id: formData.get('cliente_id') || undefined,
    profissional_id: formData.get('profissional_id') || undefined,
    valor_total: Number(formData.get('valor_total')),
    status: formData.get('status'),
  };

  return withValidation(UpdateVendaSchema, data, async (validatedData) => {
    const { data: venda, error } = await createServerSupabase()
      .from('vendas')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar venda: ${error.message}`);
    }

    revalidatePath('/vendas');
    revalidatePath(`/vendas/${id}`);
    return venda;
  });
}

// Adicionar item à venda
export async function addItemVenda(formData: FormData): Promise<ActionResult> {
  const data = {
    venda_id: formData.get('venda_id'),
    produto_id: formData.get('produto_id'),
    quantidade: Number(formData.get('quantidade')),
    preco_unitario: Number(formData.get('preco_unitario')),
  };

  return withValidation(CreateVendaItemSchema, data, async (validatedData) => {
    try {
      // Verificar se a venda existe e está aberta
      const { data: venda, error: vendaError } = await createServerSupabase()
        .from('vendas')
        .select('id, status')
        .eq('id', validatedData.venda_id)
        .single();

      if (vendaError || !venda) {
        throw new Error('Venda não encontrada');
      }

      if (venda.status !== 'aberta') {
        throw new Error('Não é possível adicionar itens a uma venda que não está aberta');
      }

      // Verificar se o produto existe
      const { data: produto, error: produtoError } = await createServerSupabase()
        .from('produtos')
        .select('id, estoque, ativo')
        .eq('id', validatedData.produto_id)
        .single();

      if (produtoError || !produto) {
        throw new Error('Produto não encontrado');
      }

      if (!produto.ativo) {
        throw new Error('Produto não está ativo');
      }

      if (produto.estoque < validatedData.quantidade) {
        throw new Error('Estoque insuficiente');
      }

      // Inserir item da venda
      const { data: item, error: itemError } = await createServerSupabase()
        .from('vendas_itens')
        .insert([validatedData])
        .select('*, produto:produtos(nome)')
        .single();

      if (itemError) {
        throw new Error(`Erro ao adicionar item: ${itemError.message}`);
      }

      // Baixar estoque do produto
      const estoqueResult = await baixarEstoqueProduto(
        validatedData.produto_id,
        validatedData.quantidade,
      );

      if (!estoqueResult.success) {
        // Se falhar ao baixar estoque, remover o item adicionado
        await createServerSupabase().from('vendas_itens').delete().eq('id', item.id);

        throw new Error(`Erro no controle de estoque: ${estoqueResult.error}`);
      }

      // Recalcular total da venda
      await recalcularTotalVenda(validatedData.venda_id);

      revalidatePath('/vendas');
      revalidatePath(`/vendas/${validatedData.venda_id}`);
      return item;
    } catch (error) {
      throw error;
    }
  });
}

// Remover item da venda
export async function removeItemVenda(itemId: string): Promise<ActionResult> {
  try {
    // Buscar item para pegar os dados antes de remover
    const { data: item, error: itemError } = await createServerSupabase()
      .from('vendas_itens')
      .select('*, venda:vendas(status)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      throw new Error('Item não encontrado');
    }

    if (item.venda?.status !== 'aberta') {
      throw new Error('Não é possível remover itens de uma venda que não está aberta');
    }

    // Remover item
    const { error: deleteError } = await createServerSupabase()
      .from('vendas_itens')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      throw new Error(`Erro ao remover item: ${deleteError.message}`);
    }

    // Devolver estoque (reverter a baixa)
    const { data: produto, error: produtoError } = await createServerSupabase()
      .from('produtos')
      .select('estoque')
      .eq('id', item.produto_id)
      .single();

    if (!produtoError && produto) {
      await createServerSupabase()
        .from('produtos')
        .update({ estoque: produto.estoque + item.quantidade })
        .eq('id', item.produto_id);
    }

    // Recalcular total da venda
    await recalcularTotalVenda(item.venda_id);

    revalidatePath('/vendas');
    revalidatePath(`/vendas/${item.venda_id}`);

    return {
      success: true,
      message: 'Item removido com sucesso',
      data: { id: itemId },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Finalizar venda
export async function finalizarVenda(vendaId: string): Promise<ActionResult> {
  try {
    // Verificar se venda existe e está aberta
    const { data: venda, error: vendaError } = await createServerSupabase()
      .from('vendas')
      .select('id, status, valor_total')
      .eq('id', vendaId)
      .single();

    if (vendaError || !venda) {
      throw new Error('Venda não encontrada');
    }

    if (venda.status !== 'aberta') {
      throw new Error('Venda já foi finalizada');
    }

    if (venda.valor_total <= 0) {
      throw new Error('Venda não pode ser finalizada sem itens');
    }

    // Atualizar status para 'paga'
    const { data: vendaFinalizada, error: updateError } = await createServerSupabase()
      .from('vendas')
      .update({ status: 'paga' })
      .eq('id', vendaId)
      .select('*, vendas_itens(*, produto:produtos(nome))')
      .single();

    if (updateError) {
      throw new Error(`Erro ao finalizar venda: ${updateError.message}`);
    }

    revalidatePath('/vendas');
    revalidatePath(`/vendas/${vendaId}`);

    return {
      success: true,
      message: 'Venda finalizada com sucesso',
      data: vendaFinalizada,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Cancelar venda
export async function cancelarVenda(vendaId: string): Promise<ActionResult> {
  try {
    // Buscar venda e seus itens
    const { data: venda, error: vendaError } = await createServerSupabase()
      .from('vendas')
      .select('*, vendas_itens(*)')
      .eq('id', vendaId)
      .single();

    if (vendaError || !venda) {
      throw new Error('Venda não encontrada');
    }

    if (venda.status === 'cancelada') {
      throw new Error('Venda já foi cancelada');
    }

    // Devolver estoque de todos os itens
    for (const item of venda.vendas_itens || []) {
      const { data: produto, error: produtoError } = await createServerSupabase()
        .from('produtos')
        .select('estoque')
        .eq('id', item.produto_id)
        .single();

      if (!produtoError && produto) {
        await createServerSupabase()
          .from('produtos')
          .update({ estoque: produto.estoque + item.quantidade })
          .eq('id', item.produto_id);
      }
    }

    // Atualizar status da venda
    const { data: vendaCancelada, error: updateError } = await createServerSupabase()
      .from('vendas')
      .update({ status: 'cancelada' })
      .eq('id', vendaId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erro ao cancelar venda: ${updateError.message}`);
    }

    revalidatePath('/vendas');
    revalidatePath(`/vendas/${vendaId}`);

    return {
      success: true,
      message: 'Venda cancelada com sucesso',
      data: vendaCancelada,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Listar vendas
export async function listVendas(
  filters: VendaFilterData = {
    page: 0,
    limit: 10,
    order: 'desc',
  },
): Promise<ActionResult> {
  try {
    let query = createServerSupabase()
      .from('vendas')
      .select(
        `
        *,
        cliente:clientes(nome),
        profissional:profissionais(nome),
        vendas_itens(*, produto:produtos(nome))
      `,
      )
      .order(filters.sort || 'created_at', {
        ascending: filters.order === 'asc',
      });

    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.unidade_id) {
      query = query.eq('unidade_id', filters.unidade_id);
    }

    if (filters.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    if (filters.data_inicio) {
      query = query.gte('created_at', filters.data_inicio);
    }

    if (filters.data_fim) {
      query = query.lte('created_at', filters.data_fim);
    }

    // Paginação
    const offset = filters.page * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: vendas, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao listar vendas: ${error.message}`);
    }

    return {
      success: true,
      data: {
        vendas: vendas || [],
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

// Buscar venda por ID
export async function getVenda(id: string): Promise<ActionResult> {
  try {
    const { data: venda, error } = await createServerSupabase()
      .from('vendas')
      .select(
        `
        *,
        cliente:clientes(id, nome, email, telefone),
        profissional:profissionais(id, nome),
        vendas_itens(
          *,
          produto:produtos(id, nome, preco)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar venda: ${error.message}`);
    }

    if (!venda) {
      throw new Error('Venda não encontrada');
    }

    return {
      success: true,
      data: venda,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Função auxiliar para recalcular total da venda
async function recalcularTotalVenda(vendaId: string) {
  const { data: itens, error } = await createServerSupabase()
    .from('vendas_itens')
    .select('subtotal')
    .eq('venda_id', vendaId);

  if (!error && itens) {
    const total = itens.reduce(
      (acc: number, item: { subtotal: number | string }) => acc + Number(item.subtotal),
      0,
    );

    await createServerSupabase().from('vendas').update({ valor_total: total }).eq('id', vendaId);
  }
}
