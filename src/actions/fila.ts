'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { withValidation } from '@/lib/server-actions';
import {
  CreateFilaSchema,
  UpdateFilaSchema,
  ChamarProximoFilaSchema,
  RemoverFilaSchema,
  EstimativaEsperaSchema,
  type FilaFilterData,
  type FilaStatsData,
} from '@/schemas';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

// =====================================================
// SERVER ACTIONS PARA SISTEMA DE FILA (EP8)
// =====================================================

/**
 * Adicionar cliente à fila
 */
export async function addToQueue(formData: FormData): Promise<ActionResult> {
  return withValidation(CreateFilaSchema, formData, async (data) => {
    const supabase = createServerSupabase();

    try {
      // 1. Verificar se o cliente já está na fila ativa
      const { data: existingQueue, error: checkError } = await supabase
        .from('fila')
        .select('id, status')
        .eq('unit_id', data.unidade_id)
        .eq('cliente_id', data.cliente_id)
        .in('status', ['aguardando', 'chamado', 'em_atendimento'])
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar fila: ${checkError.message}`);
      }

      if (existingQueue) {
        return {
          success: false,
          error: 'Cliente já está na fila ativa',
        };
      }

      // 2. Obter próxima posição disponível
      const { data: nextPosition, error: positionError } = await supabase.rpc(
        'get_next_queue_position',
        { p_unidade_id: data.unidade_id },
      );

      if (positionError) {
        throw new Error(`Erro ao obter posição: ${positionError.message}`);
      }

      // 3. Calcular estimativa de espera baseada na posição
      const estimativaMin = data.estimativa_min || Math.max(15, nextPosition * 20);

      // 4. Inserir na fila
      const { data: newQueueItem, error: insertError } = await supabase
        .from('fila')
        .insert({
          unidade_id: data.unidade_id,
          cliente_id: data.cliente_id,
          status: 'aguardando',
          prioridade: data.prioridade,
          posicao: nextPosition,
          estimativa_min: estimativaMin,
        })
        .select(
          `
          id,
          unidade_id,
          cliente_id,
          status,
          prioridade,
          posicao,
          estimativa_min,
          created_at,
          clientes!inner(nome, telefone)
        `,
        )
        .single();

      if (insertError) {
        throw new Error(`Erro ao adicionar à fila: ${insertError.message}`);
      }

      revalidatePath('/fila');
      return {
        success: true,
        data: newQueueItem,
        message: 'Cliente adicionado à fila com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

/**
 * Atualizar item da fila
 */
export async function updateQueueItem(formData: FormData): Promise<ActionResult> {
  return withValidation(UpdateFilaSchema, formData, async (data) => {
    const supabase = createServerSupabase();

    try {
      const { data: updatedItem, error } = await supabase
        .from('fila')
        .update({
          ...(data.status && { status: data.status }),
          ...(data.prioridade && { prioridade: data.prioridade }),
          ...(data.estimativa_min !== undefined && {
            estimativa_min: data.estimativa_min,
          }),
          ...(data.observacoes && { observacoes: data.observacoes }),
        })
        .eq('id', data.id)
        .select(
          `
          id,
          unidade_id,
          cliente_id,
          status,
          prioridade,
          posicao,
          estimativa_min,
          updated_at,
          clientes!inner(nome, telefone)
        `,
        )
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar fila: ${error.message}`);
      }

      revalidatePath('/fila');
      return {
        success: true,
        data: updatedItem,
        message: 'Item da fila atualizado com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

/**
 * Chamar próximo cliente da fila
 */
export async function callNextFromQueue(formData: FormData): Promise<ActionResult> {
  return withValidation(ChamarProximoFilaSchema, formData, async (data) => {
    const supabase = createServerSupabase();

    try {
      // 1. Buscar próximo cliente na fila (maior prioridade, menor posição)
      const { data: nextClient, error: selectError } = await supabase
        .from('fila')
        .select(
          `
          id,
          unidade_id,
          cliente_id,
          status,
          prioridade,
          posicao,
          estimativa_min,
          clientes!inner(nome, telefone)
        `,
        )
        .eq('unit_id', data.unidade_id)
        .eq('status', 'aguardando')
        .order('prioridade', { ascending: false })
        .order('posicao', { ascending: true })
        .limit(1)
        .single();

      if (selectError) {
        if (selectError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Não há clientes aguardando na fila',
          };
        }
        throw new Error(`Erro ao buscar próximo cliente: ${selectError.message}`);
      }

      // 2. Atualizar status para 'chamado'
      const { data: updatedItem, error: updateError } = await supabase
        .from('fila')
        .update({
          status: 'chamado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', nextClient.id)
        .select(
          `
          id,
          unidade_id,
          cliente_id,
          status,
          prioridade,
          posicao,
          estimativa_min,
          updated_at,
          clientes!inner(nome, telefone)
        `,
        )
        .single();

      if (updateError) {
        throw new Error(`Erro ao chamar cliente: ${updateError.message}`);
      }

      revalidatePath('/fila');
      return {
        success: true,
        data: updatedItem,
        message: `Cliente ${(updatedItem.clientes as { nome: string; telefone: string }[])[0]?.nome} chamado para atendimento`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

/**
 * Iniciar atendimento do cliente chamado
 */
export async function startService(formData: FormData): Promise<ActionResult> {
  const data = {
    id: formData.get('id') as string,
  };

  if (!data.id) {
    return {
      success: false,
      error: 'ID da fila é obrigatório',
    };
  }

  const supabase = createServerSupabase();

  try {
    const { data: updatedItem, error } = await supabase
      .from('fila')
      .update({
        status: 'em_atendimento',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .eq('status', 'chamado')
      .select(
        `
        id,
        unidade_id,
        cliente_id,
        status,
        prioridade,
        posicao,
        estimativa_min,
        updated_at,
        clientes!inner(nome, telefone)
      `,
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Cliente não está mais na fila ou não foi chamado',
        };
      }
      throw new Error(`Erro ao iniciar atendimento: ${error.message}`);
    }

    revalidatePath('/fila');
    return {
      success: true,
      data: updatedItem,
      message: `Atendimento iniciado para ${(updatedItem.clientes as { nome: string; telefone: string }[])[0]?.nome}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Finalizar atendimento
 */
export async function finishService(formData: FormData): Promise<ActionResult> {
  const data = {
    id: formData.get('id') as string,
  };

  if (!data.id) {
    return {
      success: false,
      error: 'ID da fila é obrigatório',
    };
  }

  const supabase = createServerSupabase();

  try {
    const { data: updatedItem, error } = await supabase
      .from('fila')
      .update({
        status: 'concluido',
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .eq('status', 'em_atendimento')
      .select(
        `
        id,
        unidade_id,
        cliente_id,
        status,
        prioridade,
        posicao,
        estimativa_min,
        updated_at,
        clientes!inner(nome, telefone)
      `,
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Cliente não está mais em atendimento',
        };
      }
      throw new Error(`Erro ao finalizar atendimento: ${error.message}`);
    }

    revalidatePath('/fila');
    return {
      success: true,
      data: updatedItem,
      message: `Atendimento finalizado para ${(updatedItem.clientes as { nome: string; telefone: string }[])[0]?.nome}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Remover cliente da fila
 */
export async function removeFromQueue(formData: FormData): Promise<ActionResult> {
  return withValidation(RemoverFilaSchema, formData, async (data) => {
    const supabase = createServerSupabase();

    try {
      // 1. Verificar se o item existe e pode ser removido
      const { data: queueItem, error: selectError } = await supabase
        .from('fila')
        .select(
          `
          id,
          unidade_id,
          cliente_id,
          status,
          clientes!inner(nome, telefone)
        `,
        )
        .eq('id', data.id)
        .single();

      if (selectError) {
        throw new Error(`Item da fila não encontrado: ${selectError.message}`);
      }

      // 2. Remover da fila (soft delete ou hard delete dependendo da regra de negócio)
      const { error: deleteError } = await supabase.from('fila').delete().eq('id', data.id);

      if (deleteError) {
        throw new Error(`Erro ao remover da fila: ${deleteError.message}`);
      }

      // 3. Reorganizar posições se necessário (opcional - pode ser feito via trigger)
      // Por enquanto, vamos apenas remover o item

      revalidatePath('/fila');
      return {
        success: true,
        data: queueItem,
        message: `Cliente ${queueItem.clientes[0]?.nome || 'Desconhecido'} removido da fila`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

/**
 * Listar itens da fila com filtros
 */
export async function listQueueItems(filters: FilaFilterData): Promise<ActionResult> {
  const supabase = createServerSupabase();

  try {
    let query = supabase.from('fila').select(`
        id,
        unidade_id,
        cliente_id,
        status,
        prioridade,
        posicao,
        estimativa_min,
        created_at,
        updated_at,
        clientes!inner(nome, telefone, email)
      `);

    // Aplicar filtros
    if (filters.unidade_id) {
      query = query.eq('unit_id', filters.unidade_id);
    }

    if (filters.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.prioridade && filters.prioridade.length > 0) {
      query = query.in('prioridade', filters.prioridade);
    }

    if (filters.busca) {
      query = query.or(
        `clientes.nome.ilike.%${filters.busca}%,clientes.telefone.ilike.%${filters.busca}%`,
      );
    }

    // Aplicar ordenação
    switch (filters.ordenacao) {
      case 'posicao_asc':
        query = query.order('posicao', { ascending: true });
        break;
      case 'posicao_desc':
        query = query.order('posicao', { ascending: false });
        break;
      case 'prioridade_desc':
        query = query
          .order('prioridade', { ascending: false })
          .order('posicao', { ascending: true });
        break;
      case 'criado_desc':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('posicao', { ascending: true });
    }

    // Aplicar paginação
    const offset = (filters.page - 1) * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: items, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar fila: ${error.message}`);
    }

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Obter status atual da fila
 */
export async function getQueueStatus(unidadeId: string): Promise<ActionResult> {
  const supabase = createServerSupabase();

  try {
    const { data: status, error } = await supabase
      .from('fila')
      .select(
        `
        id,
        status,
        prioridade,
        posicao,
        estimativa_min,
        clientes!inner(nome, telefone)
      `,
      )
      .eq('unit_id', unidadeId)
      .in('status', ['aguardando', 'chamado', 'em_atendimento'])
      .order('prioridade', { ascending: false })
      .order('posicao', { ascending: true });

    if (error) {
      throw new Error(`Erro ao obter status da fila: ${error.message}`);
    }

    // Calcular estatísticas
    const stats = {
      aguardando: status.filter((item: { status: string }) => item.status === 'aguardando').length,
      chamado: status.filter((item: { status: string }) => item.status === 'chamado').length,
      em_atendimento: status.filter((item: { status: string }) => item.status === 'em_atendimento')
        .length,
      total_ativo: status.length,
      proximo: status.find((item: { status: string }) => item.status === 'aguardando'),
    };

    return {
      success: true,
      data: {
        items: status,
        stats,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Calcular estimativa de espera para um cliente
 */
export async function calculateWaitTime(formData: FormData): Promise<ActionResult> {
  return withValidation(EstimativaEsperaSchema, formData, async (data) => {
    const supabase = createServerSupabase();

    try {
      // 1. Buscar posição atual do cliente na fila
      const { data: queueItem, error: selectError } = await supabase
        .from('fila')
        .select('posicao, prioridade, estimativa_min')
        .eq('unit_id', data.unidade_id)
        .eq('cliente_id', data.cliente_id)
        .eq('status', 'aguardando')
        .single();

      if (selectError) {
        if (selectError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Cliente não está na fila',
          };
        }
        throw new Error(`Erro ao buscar posição: ${selectError.message}`);
      }

      // 2. Calcular estimativa baseada na posição e prioridade
      let estimativaMin = queueItem.estimativa_min || 20; // 20 min por cliente como padrão

      // Ajustar por prioridade
      if (queueItem.prioridade === 'urgente') {
        estimativaMin = Math.max(10, estimativaMin * 0.5);
      } else if (queueItem.prioridade === 'prioritaria') {
        estimativaMin = Math.max(15, estimativaMin * 0.7);
      }

      // 3. Calcular tempo total de espera
      const tempoEspera = (queueItem.posicao - 1) * estimativaMin;

      return {
        success: true,
        data: {
          posicao: queueItem.posicao,
          prioridade: queueItem.prioridade,
          estimativa_por_cliente: estimativaMin,
          tempo_espera_minutos: tempoEspera,
          tempo_espera_horas: Math.ceil(tempoEspera / 60),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });
}

/**
 * Obter estatísticas da fila
 */
export async function getQueueStats(filters: FilaStatsData): Promise<ActionResult> {
  const supabase = createServerSupabase();

  try {
    let query = supabase.from('fila').select(`
        id,
        status,
        prioridade,
        created_at,
        clientes!inner(nome)
      `);

    if (filters.unidade_id) {
      query = query.eq('unit_id', filters.unidade_id);
    }

    // Aplicar filtro de período
    const now = new Date();
    let startDate: Date;

    switch (filters.periodo) {
      case 'hoje':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'semana':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    query = query.gte('created_at', startDate.toISOString());

    const { data: items, error } = await query;

    if (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }

    // Calcular estatísticas
    const stats = {
      total: items.length,
      por_status: {
        aguardando: items.filter((item: { status: string }) => item.status === 'aguardando').length,
        chamado: items.filter((item: { status: string }) => item.status === 'chamado').length,
        em_atendimento: items.filter((item: { status: string }) => item.status === 'em_atendimento')
          .length,
        concluido: items.filter((item: { status: string }) => item.status === 'concluido').length,
        desistiu: items.filter((item: { status: string }) => item.status === 'desistiu').length,
      },
      por_prioridade: {
        normal: items.filter((item: { prioridade: string }) => item.prioridade === 'normal').length,
        prioritaria: items.filter(
          (item: { prioridade: string }) => item.prioridade === 'prioritaria',
        ).length,
        urgente: items.filter((item: { prioridade: string }) => item.prioridade === 'urgente')
          .length,
      },
      periodo: filters.periodo,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
