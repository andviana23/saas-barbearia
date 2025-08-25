'use server'

import { createClient } from '@/lib/supabase'
import { withValidation } from '@/lib/server-actions'
import type { ActionResult } from '@/types'
import {
  CreateMovimentacaoSchema,
  UpdateMovimentacaoSchema,
  MovimentacaoFilterSchema,
  FechamentoCaixaSchema,
  CalcularComissaoSchema,
  RelatorioFinanceiroSchema,
  LancamentoRapidoSchema,
  EstatisticasFinanceirasSchema,
} from '@/schemas'
import { revalidatePath } from 'next/cache'

// =====================================================
// SERVER ACTIONS PARA GESTÃO FINANCEIRA (EP9)
// =====================================================

/**
 * Criar movimentação financeira
 */
export async function createMovimentacao(
  formData: FormData
): Promise<ActionResult> {
  const data = {
    unidade_id: formData.get('unidade_id'),
    tipo: formData.get('tipo'),
    valor: Number(formData.get('valor')),
    origem: formData.get('origem'),
    referencia_id: formData.get('referencia_id') || undefined,
    data_mov: formData.get('data_mov') || undefined,
    descricao: formData.get('descricao') || undefined,
    profissional_id: formData.get('profissional_id') || undefined,
    cliente_id: formData.get('cliente_id') || undefined,
    categoria: formData.get('categoria') || undefined,
    meio_pagamento: formData.get('meio_pagamento') || undefined,
  }

  return withValidation(
    CreateMovimentacaoSchema,
    data,
    async (validatedData) => {
      const supabase = createClient()

      const { data: movimentacao, error } = await supabase
        .from('financeiro_mov')
        .insert(validatedData)
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar movimentação: ${error.message}`)
      }

      revalidatePath('/financeiro')
      return movimentacao
    }
  )
}

/**
 * Atualizar movimentação financeira
 */
export async function updateMovimentacao(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get('id') as string
  if (!id) {
    return { success: false, error: 'ID da movimentação é obrigatório' }
  }

  const data = {
    tipo: formData.get('tipo') || undefined,
    valor: formData.get('valor') ? Number(formData.get('valor')) : undefined,
    origem: formData.get('origem') || undefined,
    referencia_id: formData.get('referencia_id') || undefined,
    data_mov: formData.get('data_mov') || undefined,
    descricao: formData.get('descricao') || undefined,
    profissional_id: formData.get('profissional_id') || undefined,
    cliente_id: formData.get('cliente_id') || undefined,
    categoria: formData.get('categoria') || undefined,
    meio_pagamento: formData.get('meio_pagamento') || undefined,
  }

  return withValidation(
    UpdateMovimentacaoSchema,
    data,
    async (validatedData) => {
      const supabase = createClient()

      const { data: movimentacao, error } = await supabase
        .from('financeiro_mov')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao atualizar movimentação: ${error.message}`)
      }

      revalidatePath('/financeiro')
      return movimentacao
    }
  )
}

/**
 * Listar movimentações financeiras com filtros
 */
export async function listMovimentacoes(
  params: Record<string, unknown> = {}
): Promise<ActionResult> {
  return withValidation(MovimentacaoFilterSchema, params, async (filters) => {
    const supabase = createClient()

    let query = supabase.from('financeiro_mov').select(`
        *,
        profissionais:profissional_id(id, nome),
        clientes:cliente_id(id, nome)
      `)

    // Aplicar filtros
    if (filters.unidade_id) {
      query = query.eq('unidade_id', filters.unidade_id)
    }

    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo)
    }

    if (filters.origem) {
      query = query.eq('origem', filters.origem)
    }

    if (filters.data_inicio) {
      query = query.gte('data_mov', filters.data_inicio)
    }

    if (filters.data_fim) {
      query = query.lte('data_mov', filters.data_fim)
    }

    if (filters.profissional_id) {
      query = query.eq('profissional_id', filters.profissional_id)
    }

    if (filters.cliente_id) {
      query = query.eq('cliente_id', filters.cliente_id)
    }

    if (filters.referencia_id) {
      query = query.eq('referencia_id', filters.referencia_id)
    }

    if (filters.categoria) {
      query = query.ilike('categoria', `%${filters.categoria}%`)
    }

    if (filters.meio_pagamento) {
      query = query.eq('meio_pagamento', filters.meio_pagamento)
    }

    if (filters.valor_min) {
      query = query.gte('valor', filters.valor_min)
    }

    if (filters.valor_max) {
      query = query.lte('valor', filters.valor_max)
    }

    if (filters.busca) {
      query = query.or(
        `descricao.ilike.%${filters.busca}%,categoria.ilike.%${filters.busca}%`
      )
    }

    // Ordenação
    const ordenacao = filters.ordenacao || 'data_desc'
    const [campo, direcao] = ordenacao.split('_')
    if (campo === 'data') {
      query = query.order('data_mov', { ascending: direcao === 'asc' })
    } else if (campo === 'valor') {
      query = query.order('valor', { ascending: direcao === 'asc' })
    } else {
      query = query.order('created_at', { ascending: direcao === 'asc' })
    }

    // Paginação
    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erro ao listar movimentações: ${error.message}`)
    }

    return {
      movimentacoes: data || [],
      total: count || 0,
      page: page,
      limit: limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  })
}

/**
 * Buscar movimentação por ID
 */
export async function getMovimentacao(id: string): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'ID é obrigatório' }
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('financeiro_mov')
      .select(
        `
        *,
        profissionais:profissional_id(id, nome),
        clientes:cliente_id(id, nome)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar movimentação: ${error.message}`)
    }

    return { success: true, data }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Deletar movimentação financeira
 */
export async function deleteMovimentacao(id: string): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'ID é obrigatório' }
  }

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('financeiro_mov')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar movimentação: ${error.message}`)
    }

    revalidatePath('/financeiro')
    return { success: true, message: 'Movimentação deletada com sucesso' }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Lançamento rápido
 */
export async function lancamentoRapido(
  formData: FormData
): Promise<ActionResult> {
  const data = {
    unidade_id: formData.get('unidade_id'),
    tipo: formData.get('tipo'),
    valor: Number(formData.get('valor')),
    origem: formData.get('origem'),
    descricao: formData.get('descricao'),
    meio_pagamento: formData.get('meio_pagamento'),
    categoria: formData.get('categoria') || undefined,
  }

  return withValidation(LancamentoRapidoSchema, data, async (validatedData) => {
    const supabase = createClient()

    // Criar movimentação com dados do lançamento rápido
    const movimentacaoData = {
      ...validatedData,
      data_mov: new Date().toISOString().split('T')[0],
    }

    const { data: movimentacao, error } = await supabase
      .from('financeiro_mov')
      .insert(movimentacaoData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar lançamento: ${error.message}`)
    }

    revalidatePath('/financeiro')
    return movimentacao
  })
}

/**
 * Calcular comissão
 */
export async function calcularComissao(
  formData: FormData
): Promise<ActionResult> {
  const data = {
    profissional_id: formData.get('profissional_id'),
    unidade_id: formData.get('unidade_id'),
    valor_base: Number(formData.get('valor_base')),
    servico_id: formData.get('servico_id') || undefined,
    agendamento_id: formData.get('agendamento_id') || undefined,
    venda_id: formData.get('venda_id') || undefined,
  }

  return withValidation(CalcularComissaoSchema, data, async (validatedData) => {
    const supabase = createClient()

    // Buscar regras de comissão do profissional
    const { data: regras, error: regraError } = await supabase
      .from('profissionais')
      .select('comissao_regra')
      .eq('id', validatedData.profissional_id)
      .eq('unidade_id', validatedData.unidade_id)
      .single()

    if (regraError || !regras?.comissao_regra) {
      return {
        success: true,
        data: {
          valor_comissao: 0,
          percentual_aplicado: 0,
          regra_aplicada: 'nenhuma',
        },
      }
    }

    const regra = regras.comissao_regra as {
      tipo: string
      percentual?: number
      valor?: number
      valor_minimo?: number
    }
    let valorComissao = 0
    let percentualAplicado = 0
    let regraAplicada = regra.tipo

    switch (regra.tipo) {
      case 'percentual':
        percentualAplicado = regra.percentual || 0
        valorComissao = (validatedData.valor_base * percentualAplicado) / 100
        break
      case 'fixo':
        valorComissao = regra.valor || 0
        percentualAplicado = (valorComissao / validatedData.valor_base) * 100
        break
      case 'hibrido':
        const percentual = regra.percentual || 0
        const valorFixo = regra.valor || 0
        const comissaoPercentual = (validatedData.valor_base * percentual) / 100
        valorComissao = Math.max(comissaoPercentual, valorFixo)
        percentualAplicado = (valorComissao / validatedData.valor_base) * 100
        break
    }

    // Aplicar valor mínimo se configurado
    if (regra.valor_minimo && valorComissao < regra.valor_minimo) {
      valorComissao = regra.valor_minimo
      percentualAplicado = (valorComissao / validatedData.valor_base) * 100
    }

    return {
      success: true,
      data: {
        valor_comissao: Number(valorComissao.toFixed(2)),
        percentual_aplicado: Number(percentualAplicado.toFixed(2)),
        regra_aplicada: regraAplicada,
        detalhes_regra: regra,
      },
    }
  })
}

/**
 * Fechamento de caixa
 */
export async function fechamentoCaixa(
  formData: FormData
): Promise<ActionResult> {
  const data = {
    unidade_id: formData.get('unidade_id'),
    data_fechamento: formData.get('data_fechamento'),
    total_dinheiro: Number(formData.get('total_dinheiro') || 0),
    total_pix: Number(formData.get('total_pix') || 0),
    total_cartao_credito: Number(formData.get('total_cartao_credito') || 0),
    total_cartao_debito: Number(formData.get('total_cartao_debito') || 0),
    total_transferencia: Number(formData.get('total_transferencia') || 0),
    observacoes: formData.get('observacoes') || undefined,
    responsavel_id: formData.get('responsavel_id'),
  }

  return withValidation(FechamentoCaixaSchema, data, async (validatedData) => {
    const supabase = createClient()

    // Calcular totais do sistema para comparar
    const { data: movimentacoes, error: movError } = await supabase
      .from('financeiro_mov')
      .select('tipo, valor, meio_pagamento')
      .eq('unidade_id', validatedData.unidade_id)
      .eq('data_mov', validatedData.data_fechamento)

    if (movError) {
      throw new Error(`Erro ao buscar movimentações: ${movError.message}`)
    }

    const totaisSistema = {
      dinheiro: 0,
      pix: 0,
      cartao_credito: 0,
      cartao_debito: 0,
      transferencia: 0,
    }

    movimentacoes?.forEach(
      (mov: { tipo: string; valor: number; meio_pagamento?: string }) => {
        const valor = mov.tipo === 'entrada' ? mov.valor : -mov.valor
        if (
          mov.meio_pagamento &&
          totaisSistema.hasOwnProperty(mov.meio_pagamento)
        ) {
          totaisSistema[mov.meio_pagamento as keyof typeof totaisSistema] +=
            valor
        }
      }
    )

    const totalInformado =
      (validatedData.total_dinheiro || 0) +
      (validatedData.total_pix || 0) +
      (validatedData.total_cartao_credito || 0) +
      (validatedData.total_cartao_debito || 0) +
      (validatedData.total_transferencia || 0)

    const totalSistema = Object.values(totaisSistema).reduce(
      (sum, val) => sum + val,
      0
    )

    const divergencia = totalInformado - totalSistema

    // Salvar fechamento (aqui você pode criar uma tabela específica para fechamentos)
    const fechamento = {
      ...validatedData,
      totais_sistema: totaisSistema,
      total_informado: totalInformado,
      total_sistema: totalSistema,
      divergencia: divergencia,
      created_at: new Date().toISOString(),
    }

    return {
      success: true,
      data: fechamento,
      message:
        divergencia === 0
          ? 'Fechamento realizado com sucesso - valores conferem!'
          : `Fechamento realizado com divergência de R$ ${Math.abs(divergencia).toFixed(2)}`,
    }
  })
}

/**
 * Gerar relatório financeiro
 */
export async function gerarRelatorioFinanceiro(
  params: Record<string, unknown> = {}
): Promise<ActionResult> {
  return withValidation(RelatorioFinanceiroSchema, params, async (filtros) => {
    const supabase = createClient()

    let query = supabase
      .from('financeiro_mov')
      .select(
        `
        *,
        profissionais:profissional_id(id, nome),
        clientes:cliente_id(id, nome)
      `
      )
      .gte('data_mov', filtros.data_inicio)
      .lte('data_mov', filtros.data_fim)

    if (filtros.unidade_id) {
      query = query.eq('unidade_id', filtros.unidade_id)
    }

    if (filtros.profissional_id) {
      query = query.eq('profissional_id', filtros.profissional_id)
    }

    const { data: movimentacoes, error } = await query.order('data_mov', {
      ascending: true,
    })

    if (error) {
      throw new Error(`Erro ao gerar relatório: ${error.message}`)
    }

    // Processar dados conforme tipo de relatório
    let dadosProcessados: Record<string, unknown> = {}

    switch (filtros.tipo_relatorio) {
      case 'resumo_diario':
        dadosProcessados = processarResumoIiario(movimentacoes || [])
        break
      case 'resumo_mensal':
        dadosProcessados = processarResumoMensal(movimentacoes || [])
        break
      case 'por_profissional':
        dadosProcessados = processarPorProfissional(movimentacoes || [])
        break
      case 'fluxo_caixa':
        dadosProcessados = processarFluxoCaixa(movimentacoes || [])
        break
      default:
        dadosProcessados = { movimentacoes: movimentacoes || [] }
    }

    return {
      success: true,
      data: {
        ...dadosProcessados,
        filtros,
        total_registros: movimentacoes?.length || 0,
        gerado_em: new Date().toISOString(),
      },
    }
  })
}

/**
 * Obter estatísticas financeiras
 */
export async function getEstatisticasFinanceiras(
  params: Record<string, unknown> = {}
): Promise<ActionResult> {
  return withValidation(
    EstatisticasFinanceirasSchema,
    params,
    async (filtros) => {
      const supabase = createClient()

      // Calcular período
      const hoje = new Date()
      let dataInicio: Date
      let dataFim = hoje

      switch (filtros.periodo) {
        case 'hoje':
          dataInicio = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate()
          )
          break
        case 'semana':
          dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'mes':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          break
        case 'trimestre':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)
          break
        case 'ano':
          dataInicio = new Date(hoje.getFullYear(), 0, 1)
          break
        default:
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      }

      let query = supabase
        .from('financeiro_mov')
        .select('tipo, valor, origem, data_mov')
        .gte('data_mov', dataInicio.toISOString().split('T')[0])
        .lte('data_mov', dataFim.toISOString().split('T')[0])

      if (filtros.unidade_id) {
        query = query.eq('unidade_id', filtros.unidade_id)
      }

      const { data: movimentacoes, error } = await query

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
      }

      // Calcular estatísticas
      const estatisticas = calcularEstatisticas(movimentacoes || [], {
        periodo: filtros.periodo || 'mes',
        incluir_comparativo: filtros.incluir_comparativo,
      })

      return {
        success: true,
        data: estatisticas,
      }
    }
  )
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function processarResumoIiario(
  movimentacoes: Array<{
    data_mov: string
    tipo: string
    valor: number
  }>
) {
  const resumoPorDia: Record<
    string,
    {
      entradas: number
      saidas: number
      saldo: number
    }
  > = {}

  movimentacoes.forEach((mov) => {
    const data = mov.data_mov
    if (!resumoPorDia[data]) {
      resumoPorDia[data] = { entradas: 0, saidas: 0, saldo: 0 }
    }

    if (mov.tipo === 'entrada') {
      resumoPorDia[data].entradas += mov.valor
    } else {
      resumoPorDia[data].saidas += mov.valor
    }

    resumoPorDia[data].saldo =
      resumoPorDia[data].entradas - resumoPorDia[data].saidas
  })

  return { resumo_diario: resumoPorDia }
}

function processarResumoMensal(
  movimentacoes: Array<{
    data_mov: string
    tipo: string
    valor: number
  }>
) {
  const resumoPorMes: Record<
    string,
    {
      entradas: number
      saidas: number
      saldo: number
    }
  > = {}

  movimentacoes.forEach((mov) => {
    const mes = mov.data_mov.substring(0, 7) // YYYY-MM
    if (!resumoPorMes[mes]) {
      resumoPorMes[mes] = { entradas: 0, saidas: 0, saldo: 0 }
    }

    if (mov.tipo === 'entrada') {
      resumoPorMes[mes].entradas += mov.valor
    } else {
      resumoPorMes[mes].saidas += mov.valor
    }

    resumoPorMes[mes].saldo =
      resumoPorMes[mes].entradas - resumoPorMes[mes].saidas
  })

  return { resumo_mensal: resumoPorMes }
}

function processarPorProfissional(
  movimentacoes: Array<{
    profissional_id?: string
    profissionais?: { nome: string }
    tipo: string
    valor: number
  }>
) {
  const resumoPorProfissional: Record<
    string,
    {
      nome: string
      entradas: number
      saidas: number
      saldo: number
    }
  > = {}

  movimentacoes.forEach((mov) => {
    if (!mov.profissional_id) return

    const profId = mov.profissional_id
    if (!resumoPorProfissional[profId]) {
      resumoPorProfissional[profId] = {
        nome: mov.profissionais?.nome || 'N/A',
        entradas: 0,
        saidas: 0,
        saldo: 0,
      }
    }

    if (mov.tipo === 'entrada') {
      resumoPorProfissional[profId].entradas += mov.valor
    } else {
      resumoPorProfissional[profId].saidas += mov.valor
    }

    resumoPorProfissional[profId].saldo =
      resumoPorProfissional[profId].entradas -
      resumoPorProfissional[profId].saidas
  })

  return { por_profissional: resumoPorProfissional }
}

function processarFluxoCaixa(
  movimentacoes: Array<{
    data_mov: string
    descricao?: string
    origem: string
    tipo: string
    valor: number
  }>
) {
  const fluxo = movimentacoes.map((mov) => ({
    data: mov.data_mov,
    descricao: mov.descricao || mov.origem,
    entrada: mov.tipo === 'entrada' ? mov.valor : 0,
    saida: mov.tipo === 'saida' ? mov.valor : 0,
    saldo_acumulado: 0, // Será calculado após o map
  }))

  // Calcular saldo acumulado
  let saldoAcumulado = 0
  fluxo.forEach((item) => {
    saldoAcumulado += item.entrada - item.saida
    item.saldo_acumulado = saldoAcumulado
  })

  return { fluxo_caixa: fluxo }
}

function calcularEstatisticas(
  movimentacoes: Array<{
    tipo: string
    valor: number
    origem: string
  }>,
  filtros: {
    periodo: string
    incluir_comparativo?: boolean
  }
) {
  let totalEntradas = 0
  let totalSaidas = 0
  const origens: Record<string, number> = {}

  movimentacoes.forEach((mov) => {
    if (mov.tipo === 'entrada') {
      totalEntradas += mov.valor
    } else {
      totalSaidas += mov.valor
    }

    origens[mov.origem] = (origens[mov.origem] || 0) + mov.valor
  })

  const saldoLiquido = totalEntradas - totalSaidas

  return {
    periodo: filtros.periodo,
    total_entradas: totalEntradas,
    total_saidas: totalSaidas,
    saldo_liquido: saldoLiquido,
    total_movimentacoes: movimentacoes.length,
    ticket_medio:
      movimentacoes.length > 0 ? totalEntradas / movimentacoes.length : 0,
    origens_receita: origens,
    crescimento_periodo: filtros.incluir_comparativo ? 0 : undefined, // Implementar comparativo se necessário
  }
}
