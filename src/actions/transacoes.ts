'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { asaasClient } from '@/lib/asaas/client';

// ===== SCHEMAS =====

const CreateTransacaoSchema = z.object({
  unidadeId: z.string().uuid(),
  clienteId: z.string().uuid().optional(),
  profissionalId: z.string().uuid().optional(),
  tipo: z.enum(['venda', 'assinatura', 'estorno']),
  valor: z.number().positive(),
  descricao: z.string().min(1),
  tipoPagamentoId: z.string().uuid(),
  observacoes: z.string().optional(),
  itens: z
    .array(
      z.object({
        tipoItem: z.enum(['servico', 'produto']),
        servicoId: z.string().uuid().optional(),
        produtoId: z.string().uuid().optional(),
        nome: z.string().min(1),
        quantidade: z.number().positive().default(1),
        valorUnitario: z.number().positive(),
        comissaoPercentual: z.number().min(0).max(100).optional(),
      }),
    )
    .min(1),
});

const UpdateTransacaoSchema = z.object({
  status: z.enum(['pendente', 'confirmado', 'cancelado']),
  observacoes: z.string().optional(),
  comprovanteUrl: z.string().url().optional(),
});

// ===== TYPES =====

export type CreateTransacaoData = z.infer<typeof CreateTransacaoSchema>;
export type UpdateTransacaoData = z.infer<typeof UpdateTransacaoSchema>;

export interface TransacaoActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface TransacaoFilters {
  status?: string;
  tipoPagamentoId?: string;
  profissionalId?: string;
  clienteId?: string;
  tipo?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}

// ===== TRANSAÇÕES =====

export async function createTransacao(data: CreateTransacaoData): Promise<TransacaoActionResult> {
  try {
    const validatedData = CreateTransacaoSchema.parse(data);

    // Verificar se o tipo de pagamento existe
    const { data: tipoPagamento, error: tipoError } = await createServerSupabase()
      .from('tipos_pagamento')
      .select('*')
      .eq('id', validatedData.tipoPagamentoId)
      .eq('ativo', true)
      .single();

    if (tipoError || !tipoPagamento) {
      throw new Error('Tipo de pagamento inválido');
    }

    // Calcular totais dos itens
    const totalItens = validatedData.itens.reduce((sum, item) => {
      return sum + item.valorUnitario * item.quantidade;
    }, 0);

    // Validar se o valor total confere
    if (Math.abs(validatedData.valor - totalItens) > 0.01) {
      throw new Error('Valor da transação não confere com os itens');
    }

    let transacaoData: any = {
      unit_id: validatedData.unidadeId,
      cliente_id: validatedData.clienteId,
      profissional_id: validatedData.profissionalId,
      tipo: validatedData.tipo,
      valor: validatedData.valor,
      descricao: validatedData.descricao,
      tipo_pagamento_id: validatedData.tipoPagamentoId,
      observacoes: validatedData.observacoes,
      status: 'confirmado', // Pagamentos externos são confirmados imediatamente
    };

    // Se for pagamento ASAAS, processar via API
    if (tipoPagamento.requer_asaas) {
      try {
        // Buscar ou criar cliente no ASAAS
        let asaasCustomerId: string;

        if (validatedData.clienteId) {
          const { data: cliente } = await createServerSupabase()
            .from('clientes')
            .select('*')
            .eq('id', validatedData.clienteId)
            .single();

          if (cliente && cliente.asaas_customer_id) {
            asaasCustomerId = cliente.asaas_customer_id;
          } else if (cliente) {
            // Criar cliente no ASAAS
            const asaasCustomer = await asaasClient.createCustomer({
              name: cliente.nome,
              email: cliente.email,
              phone: cliente.telefone,
              cpfCnpj: cliente.cpf,
            });
            asaasCustomerId = asaasCustomer.id;

            // Salvar ID do ASAAS no cliente
            await createServerSupabase()
              .from('clientes')
              .update({ asaas_customer_id: asaasCustomerId })
              .eq('id', cliente.id);
          } else {
            throw new Error('Cliente não encontrado');
          }
        } else {
          throw new Error('Cliente é obrigatório para pagamentos ASAAS');
        }

        // Determinar tipo de cobrança ASAAS
        let billingType = 'PIX';
        if (tipoPagamento.codigo.includes('cartao')) {
          billingType = 'CREDIT_CARD';
        }

        // Criar pagamento no ASAAS
        const asaasPayment = await asaasClient.createPayment({
          customer: asaasCustomerId,
          billingType,
          value: Math.round(validatedData.valor * 100), // Converter para centavos
          dueDate: new Date().toISOString().split('T')[0],
          description: validatedData.descricao,
          externalReference: `transacao-${Date.now()}`,
        });

        transacaoData = {
          ...transacaoData,
          asaas_payment_id: asaasPayment.id,
          asaas_customer_id: asaasCustomerId,
          asaas_status: asaasPayment.status,
          status: 'pendente', // ASAAS payments start as pending
        };
      } catch (asaasError: any) {
        console.error('Erro ao processar pagamento ASAAS:', asaasError);
        throw new Error(`Erro no processamento: ${asaasError.message}`);
      }
    }

    // Inserir transação no banco
    const { data: transacao, error: transacaoError } = await createServerSupabase()
      .from('transacoes')
      .insert(transacaoData)
      .select('*')
      .single();

    if (transacaoError) throw transacaoError;

    // Inserir itens da transação
    const itensData = validatedData.itens.map((item) => {
      const comissaoValor = item.comissaoPercentual
        ? (item.valorUnitario * item.quantidade * item.comissaoPercentual) / 100
        : 0;

      return {
        transacao_id: transacao.id,
        tipo_item: item.tipoItem,
        servico_id: item.servicoId,
        produto_id: item.produtoId,
        nome: item.nome,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario,
        valor_total: item.valorUnitario * item.quantidade,
        comissao_percentual: item.comissaoPercentual,
        comissao_valor: comissaoValor,
      };
    });

    const { error: itensError } = await createServerSupabase()
      .from('itens_transacao')
      .insert(itensData);

    if (itensError) throw itensError;

    // Buscar transação completa
    const { data: transacaoCompleta } = await createServerSupabase()
      .from('view_transacoes_completas')
      .select('*')
      .eq('id', transacao.id)
      .single();

    revalidatePath('/financeiro');
    revalidatePath('/caixa');

    return {
      success: true,
      data: transacaoCompleta,
      message: 'Transação criada com sucesso',
    };
  } catch (error: any) {
    console.error('Erro ao criar transação:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
      };
    }

    return {
      success: false,
      error: error.message || 'Erro interno do servidor',
    };
  }
}

export async function updateTransacao(
  transacaoId: string,
  data: UpdateTransacaoData,
): Promise<TransacaoActionResult> {
  try {
    const validatedData = UpdateTransacaoSchema.parse(data);

    const { data: transacao, error } = await createServerSupabase()
      .from('transacoes')
      .update(validatedData)
      .eq('id', transacaoId)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/financeiro');

    return {
      success: true,
      data: transacao,
      message: 'Transação atualizada com sucesso',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao atualizar transação',
    };
  }
}

export async function getTransacoes(unidadeId: string, filters: TransacaoFilters = {}) {
  try {
    let query = createServerSupabase()
      .from('view_transacoes_completas')
      .select('*')
      .eq('unit_id', unidadeId);

    // Aplicar filtros
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.tipoPagamentoId) {
      query = query.eq('tipo_pagamento_id', filters.tipoPagamentoId);
    }
    if (filters.profissionalId) {
      query = query.eq('profissional_id', filters.profissionalId);
    }
    if (filters.clienteId) {
      query = query.eq('cliente_id', filters.clienteId);
    }
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters.dataInicio) {
      query = query.gte('data_transacao', filters.dataInicio);
    }
    if (filters.dataFim) {
      query = query.lte('data_transacao', filters.dataFim);
    }
    if (filters.search) {
      query = query.or(
        `descricao.ilike.%${filters.search}%,cliente_nome.ilike.%${filters.search}%`,
      );
    }

    query = query.order('data_transacao', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar transações',
    };
  }
}

export async function getTiposPagamento() {
  try {
    const { data, error } = await createServerSupabase()
      .from('tipos_pagamento')
      .select('*')
      .eq('ativo', true)
      .order('ordem');

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar tipos de pagamento',
    };
  }
}

// ===== RELATÓRIOS FINANCEIROS =====

export async function getResumoFinanceiro(unidadeId: string, dataInicio: string, dataFim: string) {
  try {
    // Buscar transações do período
    const { data: transacoes, error } = await createServerSupabase()
      .from('view_transacoes_completas')
      .select('*')
      .eq('unit_id', unidadeId)
      .gte('data_transacao', dataInicio)
      .lte('data_transacao', dataFim)
      .eq('status', 'confirmado');

    if (error) throw error;

    // Calcular métricas
    const totalFaturamento = transacoes?.reduce((sum, t) => sum + Number(t.valor), 0) || 0;
    const totalTransacoes = transacoes?.length || 0;
    const ticketMedio = totalTransacoes > 0 ? totalFaturamento / totalTransacoes : 0;

    // Agrupar por tipo de pagamento
    const porTipoPagamento =
      transacoes?.reduce((acc, t) => {
        const tipo = t.tipo_pagamento_nome;
        if (!acc[tipo]) {
          acc[tipo] = {
            nome: tipo,
            quantidade: 0,
            valor: 0,
            cor: t.tipo_pagamento_cor,
            icone: t.tipo_pagamento_icone,
          };
        }
        acc[tipo].quantidade++;
        acc[tipo].valor += Number(t.valor);
        return acc;
      }, {} as any) || {};

    // Agrupar por profissional
    const porProfissional =
      transacoes?.reduce((acc, t) => {
        if (t.profissional_nome) {
          const prof = t.profissional_nome;
          if (!acc[prof]) {
            acc[prof] = {
              nome: prof,
              quantidade: 0,
              valor: 0,
              comissao: 0,
            };
          }
          acc[prof].quantidade++;
          acc[prof].valor += Number(t.valor);
          acc[prof].comissao += Number(t.total_comissoes || 0);
        }
        return acc;
      }, {} as any) || {};

    return {
      success: true,
      data: {
        totalFaturamento,
        totalTransacoes,
        ticketMedio,
        porTipoPagamento: Object.values(porTipoPagamento),
        porProfissional: Object.values(porProfissional),
        transacoes: transacoes || [],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao gerar resumo financeiro',
    };
  }
}

export async function getDashboardFinanceiro(unidadeId: string) {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Dados do dia
    const resumoHoje = await getResumoFinanceiro(unidadeId, hoje, hoje);

    // Dados do mês
    const resumoMes = await getResumoFinanceiro(unidadeId, inicioMes, hoje);

    if (!resumoHoje.success || !resumoMes.success) {
      throw new Error('Erro ao calcular métricas');
    }

    return {
      success: true,
      data: {
        hoje: resumoHoje.data,
        mes: resumoMes.data,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao gerar dashboard financeiro',
    };
  }
}
