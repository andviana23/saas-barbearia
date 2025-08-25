'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'
import { withValidation } from '@/lib/server-actions'
import {
  CreateClientSchema,
  UpdateClientSchema,
  ImportClientCSVSchema,
  type ClientFilterData,
  type HistoricoClienteFilterData,
  type ImportClientCSVData,
} from '@/schemas'
import type { ActionResult } from '@/types'

// ====================================
// CRUD CLIENTES
// ====================================

// Criar cliente
export async function createCliente(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    email: formData.get('email') || undefined,
    telefone: formData.get('telefone'),
    data_nascimento: formData.get('data_nascimento') || undefined,
    observacoes: formData.get('observacoes') || undefined,
    unidade_id: formData.get('unidade_id'),
    ativo: formData.get('ativo') !== 'false', // Default true
  }

  return withValidation(CreateClientSchema, data, async (validatedData) => {
    // Verificar se já existe cliente com mesmo telefone na unidade
    const { data: clienteExistente, error: checkError } = await supabaseServer
      .from('clientes')
      .select('id, nome')
      .eq('telefone', validatedData.telefone)
      .eq('unidade_id', validatedData.unidade_id)
      .eq('ativo', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar duplicação: ${checkError.message}`)
    }

    if (clienteExistente) {
      throw new Error(
        `Cliente "${clienteExistente.nome}" já cadastrado com este telefone`
      )
    }

    const { data: cliente, error } = await supabaseServer
      .from('clientes')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar cliente: ${error.message}`)
    }

    revalidatePath('/clientes')
    return cliente
  })
}

// Atualizar cliente
export async function updateCliente(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    email: formData.get('email') || undefined,
    telefone: formData.get('telefone'),
    data_nascimento: formData.get('data_nascimento') || undefined,
    observacoes: formData.get('observacoes') || undefined,
    ativo: formData.get('ativo') === 'true',
  }

  return withValidation(UpdateClientSchema, data, async (validatedData) => {
    // Se telefone foi alterado, verificar duplicação
    if (validatedData.telefone) {
      const { data: clienteExistente, error: checkError } = await supabaseServer
        .from('clientes')
        .select('id, nome, unidade_id')
        .eq('telefone', validatedData.telefone)
        .neq('id', id)
        .eq('ativo', true)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar duplicação: ${checkError.message}`)
      }

      if (clienteExistente) {
        throw new Error(
          `Telefone já cadastrado para "${clienteExistente.nome}"`
        )
      }
    }

    const { data: cliente, error } = await supabaseServer
      .from('clientes')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar cliente: ${error.message}`)
    }

    revalidatePath('/clientes')
    revalidatePath(`/clientes/${id}`)
    return cliente
  })
}

// Deletar/Desativar cliente
export async function deleteCliente(id: string): Promise<ActionResult> {
  try {
    // Verificar se cliente existe
    const { data: cliente, error: fetchError } = await supabaseServer
      .from('clientes')
      .select('id, nome')
      .eq('id', id)
      .single()

    if (fetchError || !cliente) {
      throw new Error('Cliente não encontrado')
    }

    // Verificar se há agendamentos associados
    const { data: agendamentos, error: agendamentosError } =
      await supabaseServer
        .from('appointments')
        .select('id')
        .eq('cliente_id', id)
        .limit(1)

    if (agendamentosError) {
      throw new Error(
        `Erro ao verificar agendamentos: ${agendamentosError.message}`
      )
    }

    if (agendamentos && agendamentos.length > 0) {
      // Desativar em vez de deletar se houver agendamentos
      const { error: updateError } = await supabaseServer
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id)

      if (updateError) {
        throw new Error(`Erro ao desativar cliente: ${updateError.message}`)
      }

      revalidatePath('/clientes')
      return {
        success: true,
        message: 'Cliente desativado (possui histórico de agendamentos)',
        data: { id, desativado: true },
      }
    }

    // Verificar se há vendas associadas
    const { data: vendas, error: vendasError } = await supabaseServer
      .from('vendas')
      .select('id')
      .eq('cliente_id', id)
      .limit(1)

    if (vendasError) {
      throw new Error(`Erro ao verificar vendas: ${vendasError.message}`)
    }

    if (vendas && vendas.length > 0) {
      // Desativar se houver vendas
      const { error: updateError } = await supabaseServer
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id)

      if (updateError) {
        throw new Error(`Erro ao desativar cliente: ${updateError.message}`)
      }

      revalidatePath('/clientes')
      return {
        success: true,
        message: 'Cliente desativado (possui histórico de vendas)',
        data: { id, desativado: true },
      }
    }

    // Deletar cliente se não houver histórico
    const { error: deleteError } = await supabaseServer
      .from('clientes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error(`Erro ao deletar cliente: ${deleteError.message}`)
    }

    revalidatePath('/clientes')
    return {
      success: true,
      message: 'Cliente deletado com sucesso',
      data: { id },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Listar clientes
export async function listClientes(
  filters: Partial<ClientFilterData> = {}
): Promise<ActionResult> {
  try {
    // Fornecer valores padrão para propriedades obrigatórias
    const defaultFilters = {
      ...filters,
      page: filters.page ?? 0,
      limit: filters.limit ?? 10,
      order: filters.order ?? ('desc' as const),
    }

    let query = supabaseServer
      .from('clientes')
      .select(
        `
        *,
        unidade:unidades(id, nome)
      `
      )
      .order(defaultFilters.sort || 'created_at', {
        ascending: defaultFilters.order === 'asc',
      })

    // Aplicar filtros
    if (filters.q) {
      // Busca por nome, telefone ou email
      query = query.or(
        `nome.ilike.%${filters.q}%,telefone.ilike.%${filters.q}%,email.ilike.%${filters.q}%`
      )
    }

    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo)
    }

    if (filters.unidade_id) {
      query = query.eq('unidade_id', filters.unidade_id)
    }

    if (filters.data_nascimento_inicio) {
      query = query.gte('data_nascimento', filters.data_nascimento_inicio)
    }

    if (filters.data_nascimento_fim) {
      query = query.lte('data_nascimento', filters.data_nascimento_fim)
    }

    if (filters.tem_email !== undefined) {
      if (filters.tem_email) {
        query = query.not('email', 'is', null)
      } else {
        query = query.is('email', null)
      }
    }

    // Paginação
    const offset = defaultFilters.page * defaultFilters.limit
    query = query.range(offset, offset + defaultFilters.limit - 1)

    const { data: clientes, error, count } = await query

    if (error) {
      throw new Error(`Erro ao listar clientes: ${error.message}`)
    }

    return {
      success: true,
      data: {
        clientes: clientes || [],
        total: count || 0,
        page: defaultFilters.page,
        limit: defaultFilters.limit,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Buscar cliente por ID
export async function getCliente(id: string): Promise<ActionResult> {
  try {
    const { data: cliente, error } = await supabaseServer
      .from('clientes')
      .select(
        `
        *,
        unidade:unidades(id, nome)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar cliente: ${error.message}`)
    }

    if (!cliente) {
      throw new Error('Cliente não encontrado')
    }

    return {
      success: true,
      data: cliente,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// ====================================
// HISTÓRICO DE ATENDIMENTOS
// ====================================

// Buscar histórico de atendimentos do cliente
export async function getHistoricoCliente(
  filters: HistoricoClienteFilterData
): Promise<ActionResult> {
  try {
    // Fornecer valores padrão para propriedades obrigatórias
    const defaultFilters = {
      ...filters,
      page: filters.page ?? 0,
      limit: filters.limit ?? 10,
      order: filters.order ?? ('desc' as const),
    }

    let query = supabaseServer
      .from('appointments')
      .select(
        `
        *,
        profissional:profissionais(id, nome, papel),
        cliente:clientes(id, nome, telefone),
        unidade:unidades(id, nome),
        servicos:appointments_servicos(
          *,
          servico:servicos(id, nome, preco, duracao_min)
        )
      `
      )
      .eq('cliente_id', filters.cliente_id)
      .order(defaultFilters.sort || 'inicio', {
        ascending: defaultFilters.order === 'asc',
      })

    // Aplicar filtros
    if (filters.data_inicio) {
      query = query.gte('inicio', filters.data_inicio)
    }

    if (filters.data_fim) {
      query = query.lte('inicio', filters.data_fim)
    }

    if (filters.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Paginação
    const offset = defaultFilters.page * defaultFilters.limit
    query = query.range(offset, offset + defaultFilters.limit - 1)

    const { data: historico, error, count } = await query

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`)
    }

    return {
      success: true,
      data: {
        historico: historico || [],
        total: count || 0,
        page: defaultFilters.page,
        limit: defaultFilters.limit,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Estatísticas do cliente (resumo do histórico)
export async function getEstatisticasCliente(
  clienteId: string
): Promise<ActionResult> {
  try {
    // Buscar totais de agendamentos
    const { data: totalAgendamentos, error: agendamentosError } =
      await supabaseServer
        .from('appointments')
        .select('id, status, total, inicio')
        .eq('cliente_id', clienteId)

    if (agendamentosError) {
      throw new Error(
        `Erro ao buscar agendamentos: ${agendamentosError.message}`
      )
    }

    // Buscar total em vendas
    const { data: totalVendas, error: vendasError } = await supabaseServer
      .from('vendas')
      .select('valor_total, status, created_at')
      .eq('cliente_id', clienteId)
      .eq('status', 'paga')

    if (vendasError) {
      throw new Error(`Erro ao buscar vendas: ${vendasError.message}`)
    }

    // Calcular estatísticas
    const agendamentos = totalAgendamentos || []
    const vendas = totalVendas || []

    const estatisticas = {
      total_agendamentos: agendamentos.length,
      agendamentos_concluidos: agendamentos.filter(
        (a) => a.status === 'concluido'
      ).length,
      agendamentos_cancelados: agendamentos.filter(
        (a) => a.status === 'cancelado'
      ).length,
      agendamentos_faltou: agendamentos.filter((a) => a.status === 'faltou')
        .length,
      valor_total_servicos: agendamentos
        .filter((a) => a.status === 'concluido')
        .reduce((sum, a) => sum + (a.total || 0), 0),
      total_vendas: vendas.length,
      valor_total_vendas: vendas.reduce((sum, v) => sum + v.valor_total, 0),
      primeiro_agendamento:
        agendamentos.length > 0
          ? agendamentos.sort(
              (a, b) =>
                new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
            )[0].inicio
          : null,
      ultimo_agendamento:
        agendamentos.length > 0
          ? agendamentos.sort(
              (a, b) =>
                new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
            )[0].inicio
          : null,
    }

    return {
      success: true,
      data: estatisticas,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// ====================================
// IMPORTAÇÃO CSV
// ====================================

// Processar importação de clientes via CSV
export async function processImportClientesCSV(
  csvData: ImportClientCSVData[],
  unidadeId: string
): Promise<ActionResult> {
  try {
    const resultados = {
      sucessos: 0,
      erros: 0,
      duplicados: 0,
      detalhes: [] as Array<{
        linha: number
        nome: string
        status: 'sucesso' | 'erro' | 'duplicado'
        mensagem: string
      }>,
    }

    for (let i = 0; i < csvData.length; i++) {
      const linha = i + 1
      const dadosLinha = csvData[i]

      try {
        // Validar dados da linha
        const validatedData = ImportClientCSVSchema.parse(dadosLinha)

        // Verificar duplicação por telefone
        const { data: clienteExistente, error: checkError } =
          await supabaseServer
            .from('clientes')
            .select('id, nome')
            .eq('telefone', validatedData.telefone)
            .eq('unidade_id', unidadeId)
            .eq('ativo', true)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Erro ao verificar duplicação: ${checkError.message}`)
        }

        if (clienteExistente) {
          resultados.duplicados++
          resultados.detalhes.push({
            linha,
            nome: validatedData.nome,
            status: 'duplicado',
            mensagem: `Telefone já cadastrado para "${clienteExistente.nome}"`,
          })
          continue
        }

        // Preparar dados para inserção
        const dadosInsercao = {
          nome: validatedData.nome,
          telefone: validatedData.telefone,
          email: validatedData.email || null,
          data_nascimento: validatedData.data_nascimento || null,
          observacoes: validatedData.observacoes || null,
          unidade_id: unidadeId,
          ativo: true,
        }

        // Inserir cliente
        const { error: insertError } = await supabaseServer
          .from('clientes')
          .insert([dadosInsercao])

        if (insertError) {
          throw new Error(`Erro ao inserir: ${insertError.message}`)
        }

        resultados.sucessos++
        resultados.detalhes.push({
          linha,
          nome: validatedData.nome,
          status: 'sucesso',
          mensagem: 'Cliente importado com sucesso',
        })
      } catch (error) {
        resultados.erros++
        resultados.detalhes.push({
          linha,
          nome: dadosLinha.nome || 'Nome inválido',
          status: 'erro',
          mensagem:
            error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    revalidatePath('/clientes')

    return {
      success: true,
      data: resultados,
      message: `Importação concluída: ${resultados.sucessos} sucessos, ${resultados.erros} erros, ${resultados.duplicados} duplicados`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Buscar clientes por telefone (para evitar duplicação em tempo real)
export async function buscarClientePorTelefone(
  telefone: string,
  unidadeId: string
): Promise<ActionResult> {
  try {
    const { data: cliente, error } = await supabaseServer
      .from('clientes')
      .select('id, nome, telefone, email, ativo')
      .eq('telefone', telefone)
      .eq('unidadeId', unidadeId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar cliente: ${error.message}`)
    }

    return {
      success: true,
      data: cliente || null,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
