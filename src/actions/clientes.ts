'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { withValidation } from '@/lib/server-actions';

import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  ImportClientCSVSchema,
  type ClientFilterData,
  type HistoricoClienteFilterData,
  type ImportClientCSVData,
} from '@/schemas';

// NOVOS IMPORTS - Tipos Centralizados para gradual migração
import {
  CreateClienteSchema,
  UpdateClienteSchema,
  type CreateClienteDTO,
  type UpdateClienteDTO,
  type Cliente,
} from '@/types';

import type { ActionResult } from '@/types';

// Tipos para estatísticas
type AgendamentoStats = {
  id: string;
  status: string;
  total: number;
  inicio: string;
};

type VendaStats = {
  valor_total: number;
  status: string;
  created_at: string;
};

// ====================================
// CRUD CLIENTES - VERSÃO NOVA COM TIPOS CENTRALIZADOS
// ====================================

// TODO: Migrar createCliente para usar CreateClienteSchema
// Exemplo de função com tipos centralizados:
export async function createClienteV2(data: CreateClienteDTO): Promise<ActionResult<Cliente>> {
  return withValidation(CreateClienteSchema, data, async (validatedData) => {
    const { data: cliente, error } = await createServerSupabase()
      .from('customers') // TODO: Migrar tabela para 'clientes'
      .insert([
        {
          name: validatedData.nome,
          email: validatedData.email,
          phone: validatedData.telefone,
          birth_date: validatedData.data_nascimento,
          notes: validatedData.observacoes,
          unit_id: validatedData.unidade_id,
          active: validatedData.ativo,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }

    revalidatePath('/clientes');
    return cliente;
  });
}

// ====================================
// CRUD CLIENTES - VERSÃO ATUAL (LEGADO)
// ====================================

// Criar cliente
export async function createCliente(formData: FormData): Promise<ActionResult> {
  const data = {
    name: formData.get('nome'),
    email: formData.get('email') || undefined,
    phone: formData.get('telefone'),
    birth_date: formData.get('data_nascimento') || undefined,
    notes: formData.get('observacoes') || undefined,
    unit_id: formData.get('unidade_id') || formData.get('unit_id'),
    active: formData.get('ativo') !== 'false', // Default true
  };

  return withValidation(CreateCustomerSchema, data, async (validatedData) => {
    // Verificar se já existe cliente com mesmo telefone na unidade
    const { data: clienteExistente, error: checkError } = await createServerSupabase()
      .from('customers')
      .select('id, name')
      .eq('phone', validatedData.phone)
      .eq('unit_id', validatedData.unit_id)
      .eq('active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar duplicação: ${checkError.message}`);
    }

    if (clienteExistente) {
      throw new Error(`Cliente "${clienteExistente.name}" já cadastrado com este telefone`);
    }

    const { data: cliente, error } = await createServerSupabase()
      .from('customers')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }

    revalidatePath('/clientes');
    return cliente;
  });
}

// Atualizar cliente
export async function updateCliente(id: string, formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    email: formData.get('email') || undefined,
    telefone: formData.get('telefone'),
    data_nascimento: formData.get('data_nascimento') || undefined,
    observacoes: formData.get('observacoes') || undefined,
    ativo: formData.get('ativo') === 'true',
  };

  return withValidation(UpdateCustomerSchema, data, async (validatedData) => {
    // Se telefone foi alterado, verificar duplicação
    if (validatedData.phone) {
      const { data: clienteExistente, error: checkError } = await createServerSupabase()
        .from('customers')
        .select('id, name, unit_id')
        .eq('phone', validatedData.phone)
        .neq('id', id)
        .eq('ativo', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar duplicação: ${checkError.message}`);
      }

      if (clienteExistente) {
        throw new Error(`Telefone já cadastrado para "${clienteExistente.name}"`);
      }
    }

    const { data: cliente, error } = await createServerSupabase()
      .from('customers')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }

    revalidatePath('/clientes');
    revalidatePath(`/clientes/${id}`);
    return cliente;
  });
}

// Deletar/Desativar cliente
export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    // Verificar se cliente existe
    const { data: cliente, error: fetchError } = await createServerSupabase()
      .from('customers')
      .select('id, nome')
      .eq('id', id)
      .single();

    if (fetchError || !cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se há agendamentos associados
    const { data: agendamentos, error: agendamentosError } = await createServerSupabase()
      .from('appointments')
      .select('id')
      .eq('cliente_id', id)
      .limit(1);

    if (agendamentosError) {
      throw new Error(`Erro ao verificar agendamentos: ${agendamentosError.message}`);
    }

    if (agendamentos && agendamentos.length > 0) {
      // Desativar em vez de deletar se houver agendamentos
      const { error: updateError } = await createServerSupabase()
        .from('customers')
        .update({ ativo: false })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Erro ao desativar cliente: ${updateError.message}`);
      }

      revalidatePath('/clientes');
      return {
        success: true,
        message: 'Cliente desativado (possui histórico de agendamentos)',
        data: { id, desativado: true },
      };
    }

    // Verificar se há vendas associadas
    const { data: vendas, error: vendasError } = await createServerSupabase()
      .from('sales')
      .select('id')
      .eq('cliente_id', id)
      .limit(1);

    if (vendasError) {
      throw new Error(`Erro ao verificar vendas: ${vendasError.message}`);
    }

    if (vendas && vendas.length > 0) {
      // Desativar se houver vendas
      const { error: updateError } = await createServerSupabase()
        .from('customers')
        .update({ ativo: false })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Erro ao desativar cliente: ${updateError.message}`);
      }

      revalidatePath('/clientes');
      return {
        success: true,
        message: 'Cliente desativado (possui histórico de vendas)',
        data: { id, desativado: true },
      };
    }

    // Deletar cliente se não houver histórico
    const { error: deleteError } = await createServerSupabase()
      .from('customers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Erro ao deletar cliente: ${deleteError.message}`);
    }

    revalidatePath('/clientes');
    return {
      success: true,
      message: 'Cliente deletado com sucesso',
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Listar clientes
export async function listClientes(filters: Partial<ClientFilterData> = {}): Promise<ActionResult> {
  try {
    // Fornecer valores padrão para propriedades obrigatórias
    const defaultFilters = {
      ...filters,
      page: filters.page ?? 0,
      limit: filters.limit ?? 10,
      order: filters.order ?? ('desc' as const),
    };

    let query = createServerSupabase()
      .from('customers')
      .select('*')
      .order(defaultFilters.sort || 'created_at', {
        ascending: defaultFilters.order === 'asc',
      });

    // Aplicar filtros
    if (filters.q) {
      // Busca por nome, telefone ou email
      query = query.or(
        `name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%,email.ilike.%${filters.q}%`,
      );
    }

    if (filters.ativo !== undefined) {
      query = query.eq('is_active', filters.ativo);
    }

    if (filters.unidade_id) {
      // Verificar se é um UUID válido antes de aplicar o filtro
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(filters.unidade_id)) {
        query = query.eq('unit_id', filters.unidade_id);
      } else {
        // Retornar lista vazia para unidade_id inválido
        return {
          success: true,
          data: {
            clientes: [],
            total: 0,
            page: defaultFilters.page,
            limit: defaultFilters.limit,
          },
        };
      }
    }

    if (filters.data_nascimento_inicio) {
      query = query.gte('birth_date', filters.data_nascimento_inicio);
    }

    if (filters.data_nascimento_fim) {
      query = query.lte('birth_date', filters.data_nascimento_fim);
    }

    if (filters.tem_email !== undefined) {
      if (filters.tem_email) {
        query = query.not('email', 'is', null);
      } else {
        query = query.is('email', null);
      }
    }

    // Paginação
    const offset = defaultFilters.page * defaultFilters.limit;
    query = query.range(offset, offset + defaultFilters.limit - 1);

    const { data: clientes, error, count } = await query;

    console.log('🐛 Debug listClientes:', {
      filters,
      clientesCount: clientes?.length || 0,
      totalCount: count,
      error,
      primeiroCliente: clientes?.[0],
    });

    if (error) {
      throw new Error(`Erro ao listar clientes: ${error.message}`);
    }

    // Mapear os campos do banco para os nomes esperados pelo frontend
    const clientesMapeados = (clientes || []).map((cliente: any) => ({
      ...cliente,
      nome: cliente.name,
      telefone: cliente.phone,
      ativo: cliente.is_active,
      data_nascimento: cliente.birth_date,
      unidade_id: cliente.unit_id,
    }));

    return {
      success: true,
      data: {
        clientes: clientesMapeados,
        total: count || 0,
        page: defaultFilters.page,
        limit: defaultFilters.limit,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Buscar cliente por ID
export async function getCliente(id: string): Promise<ActionResult> {
  try {
    const { data: cliente, error } = await createServerSupabase()
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ====================================
// HISTÓRICO DE ATENDIMENTOS
// ====================================

// Buscar histórico de atendimentos do cliente
export async function getHistoricoCliente(
  filters: HistoricoClienteFilterData,
): Promise<ActionResult> {
  try {
    // Fornecer valores padrão para propriedades obrigatórias
    const defaultFilters = {
      ...filters,
      page: filters.page ?? 0,
      limit: filters.limit ?? 10,
      order: filters.order ?? ('desc' as const),
    };

    let query = createServerSupabase()
      .from('appointments')
      .select(
        `
        *,
        profissional:profissionais(id, nome, papel),
        cliente:clientes(id, nome, telefone),

        servicos:appointments_servicos(
          *,
          servico:servicos(id, nome, preco, duracao_min)
        )
      `,
      )
      .eq('cliente_id', filters.cliente_id)
      .order(defaultFilters.sort || 'inicio', {
        ascending: defaultFilters.order === 'asc',
      });

    // Aplicar filtros
    if (filters.data_inicio) {
      query = query.gte('inicio', filters.data_inicio);
    }

    if (filters.data_fim) {
      query = query.lte('inicio', filters.data_fim);
    }

    if (filters.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Paginação
    const offset = defaultFilters.page * defaultFilters.limit;
    query = query.range(offset, offset + defaultFilters.limit - 1);

    const { data: historico, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return {
      success: true,
      data: {
        historico: historico || [],
        total: count || 0,
        page: defaultFilters.page,
        limit: defaultFilters.limit,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Estatísticas do cliente (resumo do histórico)
export async function getEstatisticasCliente(clienteId: string): Promise<ActionResult> {
  try {
    // Buscar totais de agendamentos
    const { data: totalAgendamentos, error: agendamentosError } = await createServerSupabase()
      .from('appointments')
      .select('id, status, total, inicio')
      .eq('cliente_id', clienteId);

    if (agendamentosError) {
      throw new Error(`Erro ao buscar agendamentos: ${agendamentosError.message}`);
    }

    // Buscar total em vendas
    const { data: totalVendas, error: vendasError } = await createServerSupabase()
      .from('sales')
      .select('valor_total, status, created_at')
      .eq('cliente_id', clienteId)
      .eq('status', 'paga');

    if (vendasError) {
      throw new Error(`Erro ao buscar vendas: ${vendasError.message}`);
    }

    // Calcular estatísticas
    const agendamentos = (totalAgendamentos || []) as AgendamentoStats[];
    const vendas = (totalVendas || []) as VendaStats[];

    const estatisticas = {
      total_agendamentos: agendamentos.length,
      agendamentos_concluidos: agendamentos.filter((a) => a.status === 'concluido').length,
      agendamentos_cancelados: agendamentos.filter((a) => a.status === 'cancelado').length,
      agendamentos_faltou: agendamentos.filter((a) => a.status === 'faltou').length,
      valor_total_servicos: agendamentos
        .filter((a) => a.status === 'concluido')
        .reduce((sum: number, a) => sum + (a.total || 0), 0),
      total_vendas: vendas.length,
      valor_total_vendas: vendas.reduce((sum: number, v) => sum + v.valor_total, 0),
      primeiro_agendamento:
        agendamentos.length > 0
          ? agendamentos.sort(
              (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
            )[0].inicio
          : null,
      ultimo_agendamento:
        agendamentos.length > 0
          ? agendamentos.sort(
              (a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime(),
            )[0].inicio
          : null,
    };

    return {
      success: true,
      data: estatisticas,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ====================================
// IMPORTAÇÃO CSV
// ====================================

// Processar importação de clientes via CSV
export async function processImportClientesCSV(
  csvData: ImportClientCSVData[],
  unidadeId: string,
): Promise<ActionResult> {
  try {
    const resultados = {
      sucessos: 0,
      erros: 0,
      duplicados: 0,
      detalhes: [] as Array<{
        linha: number;
        nome: string;
        status: 'sucesso' | 'erro' | 'duplicado';
        mensagem: string;
      }>,
    };

    for (let i = 0; i < csvData.length; i++) {
      const linha = i + 1;
      const dadosLinha = csvData[i];

      try {
        // Validar dados da linha
        const validatedData = ImportClientCSVSchema.parse(dadosLinha);

        // Verificar duplicação por telefone
        const { data: clienteExistente, error: checkError } = await createServerSupabase()
          .from('customers')
          .select('id, nome')
          .eq('telefone', validatedData.telefone)
          .eq('unit_id', unidadeId)
          .eq('ativo', true)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Erro ao verificar duplicação: ${checkError.message}`);
        }

        if (clienteExistente) {
          resultados.duplicados++;
          resultados.detalhes.push({
            linha,
            nome: validatedData.nome,
            status: 'duplicado',
            mensagem: `Telefone já cadastrado para "${clienteExistente.nome}"`,
          });
          continue;
        }

        // Preparar dados para inserção
        const dadosInsercao = {
          nome: validatedData.nome,
          telefone: validatedData.telefone,
          email: validatedData.email || null,
          data_nascimento: validatedData.data_nascimento || null,
          observacoes: validatedData.observacoes || null,
          unit_id: unidadeId,
          ativo: true,
        };

        // Inserir cliente
        const { error: insertError } = await createServerSupabase()
          .from('customers')
          .insert([dadosInsercao]);

        if (insertError) {
          throw new Error(`Erro ao inserir: ${insertError.message}`);
        }

        resultados.sucessos++;
        resultados.detalhes.push({
          linha,
          nome: validatedData.nome,
          status: 'sucesso',
          mensagem: 'Cliente importado com sucesso',
        });
      } catch (error) {
        resultados.erros++;
        resultados.detalhes.push({
          linha,
          nome: dadosLinha.nome || 'Nome inválido',
          status: 'erro',
          mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    revalidatePath('/clientes');

    return {
      success: true,
      data: resultados,
      message: `Importação concluída: ${resultados.sucessos} sucessos, ${resultados.erros} erros, ${resultados.duplicados} duplicados`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Buscar clientes por telefone (para evitar duplicação em tempo real)
export async function buscarClientePorTelefone(
  telefone: string,
  unidadeId: string,
): Promise<ActionResult> {
  try {
    const { data: cliente, error } = await createServerSupabase()
      .from('customers')
      .select('id, nome, telefone, email, ativo')
      .eq('telefone', telefone)
      .eq('unidadeId', unidadeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }

    return {
      success: true,
      data: cliente || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
