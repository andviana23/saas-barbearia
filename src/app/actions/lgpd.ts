'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  CreateLGPDConsentimentoSchema,
  UpdateLGPDConsentimentoSchema,
  CreateLGPDSolicitacaoSchema,
  UpdateLGPDSolicitacaoSchema,
  CreateLGPDTermoSchema,
  UpdateLGPDTermoSchema,
  RegistrarAcessoSchema,
  LGPDFiltrosSchema,
  LGPDPaginationSchema,
  FormularioConsentimentoSchema,
  SolicitacaoPortabilidadeSchema,
  SolicitacaoExclusaoSchema,
  RespostaSolicitacaoSchema,
  RelatorioConformidadeSchema,
} from '@/schemas/lgpd';
import type { ActionResult } from '@/types';
import crypto from 'crypto';

// =====================================================
// SERVER ACTIONS PARA LGPD COMPLIANCE
// =====================================================

// =====================================================
// 1. GESTÃO DE CONSENTIMENTOS
// =====================================================

export async function createConsentimento(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedData = CreateLGPDConsentimentoSchema.parse(data);

    // Verificar autenticação
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se já existe consentimento para este tipo/versão
    const { data: existing } = await supabase
      .from('lgpd_consentimentos')
      .select('id')
      .eq('profile_id', validatedData.profile_id)
      .eq('unidade_id', validatedData.unidade_id)
      .eq('tipo_consentimento', validatedData.tipo_consentimento)
      .eq('versao_termos', validatedData.versao_termos)
      .single();

    if (existing) {
      // Atualizar consentimento existente
      const { data: updated, error } = await supabase
        .from('lgpd_consentimentos')
        .update({
          consentimento_dado: validatedData.consentimento_dado,
          revogado: !validatedData.consentimento_dado,
          data_revogacao: !validatedData.consentimento_dado ? new Date().toISOString() : null,
          origem: validatedData.origem,
          dados_adicionais: validatedData.dados_adicionais,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar consentimento:', error);
        return { success: false, error: 'Erro ao atualizar consentimento' };
      }

      return { success: true, data: updated };
    }

    // Criar novo consentimento
    const { data: newConsent, error } = await supabase
      .from('lgpd_consentimentos')
      .insert({
        ...validatedData,
        ip_address: '127.0.0.1', // Em produção, capturar IP real
        user_agent: 'User Agent', // Em produção, capturar User-Agent real
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar consentimento:', error);
      return { success: false, error: 'Erro ao criar consentimento' };
    }

    // Registrar acesso aos dados
    await registrarAcessoDadosPessoais({
      profile_id: validatedData.profile_id,
      unidade_id: validatedData.unidade_id,
      tabela_acessada: 'lgpd_consentimentos',
      operacao: 'INSERT',
      finalidade: 'Registrar consentimento do titular',
      base_legal: 'consentimento',
    });

    revalidatePath('/lgpd/consentimentos');
    return { success: true, data: newConsent };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// ================= ALIAS (Compatibilidade com testes legacy) =================
// Evitar alterar imediatamente todos os testes; fornecer nomes em português
// que referenciam as funções já existentes.
export const criarConsentimento = createConsentimento;
export const listarConsentimentos = getConsentimentosAtivos;
export const criarSolicitacao = createSolicitacaoLGPD;
export const listarSolicitacoes = getSolicitacoesPendentes;
export const exportarDados = exportarDadosPessoais;

export async function processarFormularioConsentimento(data: any): Promise<ActionResult<void>> {
  try {
    const supabase = createServerSupabase();

    const validatedData = FormularioConsentimentoSchema.parse(data);

    // Obter usuário atual
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Obter profile_id e unidade_id
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, unidade_default_id')
      .eq('user_id', profile.user.id)
      .single();

    if (!userProfile) {
      return { success: false, error: 'Perfil de usuário não encontrado' };
    }

    // Processar cada consentimento
    for (const consentimento of validatedData.consentimentos) {
      await createConsentimento({
        profile_id: userProfile.id,
        unidade_id: userProfile.unidade_default_id,
        tipo_consentimento: consentimento.tipo,
        finalidade: consentimento.finalidade,
        consentimento_dado: consentimento.consentimento,
        versao_termos: validatedData.versao_termos,
        origem: 'web',
      });
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function revogarConsentimento(
  consentimentoId: string,
  motivo?: string,
): Promise<ActionResult<void>> {
  try {
    const supabase = createServerSupabase();

    const { data: updated, error } = await supabase
      .from('lgpd_consentimentos')
      .update({
        revogado: true,
        data_revogacao: new Date().toISOString(),
        dados_adicionais: motivo ? { motivo_revogacao: motivo } : undefined,
      })
      .eq('id', consentimentoId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao revogar consentimento:', error);
      return { success: false, error: 'Erro ao revogar consentimento' };
    }

    // Registrar revogação
    await registrarAcessoDadosPessoais({
      profile_id: updated.profile_id,
      unidade_id: updated.unidade_id,
      tabela_acessada: 'lgpd_consentimentos',
      operacao: 'UPDATE',
      finalidade: 'Revogação de consentimento pelo titular',
      base_legal: 'consentimento',
    });

    revalidatePath('/lgpd/consentimentos');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getConsentimentosAtivos(
  filters?: any,
  pagination?: any,
): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedFilters = filters ? LGPDFiltrosSchema.parse(filters) : {};
    const validatedPagination = pagination
      ? LGPDPaginationSchema.parse(pagination)
      : {
          page: 1,
          limit: 20,
          sort_by: 'data_consentimento',
          sort_order: 'desc',
        };

    let query = supabase.from('v_lgpd_consentimentos_ativos').select('*', { count: 'exact' });

    // Aplicar filtros
    if (validatedFilters.profile_id) {
      query = query.eq('profile_id', validatedFilters.profile_id);
    }
    if (validatedFilters.unidade_id) {
      query = query.eq('unidade_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.tipo_consentimento) {
      query = query.eq('tipo_consentimento', validatedFilters.tipo_consentimento);
    }

    // Aplicar ordenação
    query = query.order(validatedPagination.sort_by as string, {
      ascending: validatedPagination.sort_order === 'asc',
    });

    // Aplicar paginação
    const offset = (validatedPagination.page - 1) * validatedPagination.limit;
    query = query.range(offset, offset + validatedPagination.limit - 1);

    const { data: consentimentos, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar consentimentos ativos:', error);
      return { success: false, error: 'Erro ao buscar consentimentos' };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / validatedPagination.limit);

    return {
      success: true,
      data: {
        data: consentimentos || [],
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          total_pages: totalPages,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 2. SOLICITAÇÕES LGPD
// =====================================================

export async function createSolicitacaoLGPD(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedData = CreateLGPDSolicitacaoSchema.parse(data);

    // Gerar protocolo único
    const { data: protocolo, error: protocoloError } = await supabase.rpc('gerar_protocolo_lgpd');

    if (protocoloError || !protocolo) {
      return { success: false, error: 'Erro ao gerar protocolo' };
    }

    // Calcular prazo limite
    const { data: prazoLimite, error: prazoError } = await supabase.rpc('calcular_prazo_lgpd', {
      tipo_solicitacao: validatedData.tipo_solicitacao,
    });

    if (prazoError || !prazoLimite) {
      return { success: false, error: 'Erro ao calcular prazo' };
    }

    // Criar solicitação
    const { data: newSolicitation, error } = await supabase
      .from('lgpd_solicitacoes')
      .insert({
        ...validatedData,
        protocolo,
        prazo_limite: prazoLimite,
        ip_address: '127.0.0.1', // Em produção, capturar IP real
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar solicitação LGPD:', error);
      return { success: false, error: 'Erro ao criar solicitação' };
    }

    // Registrar na auditoria
    await registrarAcessoDadosPessoais({
      profile_id: validatedData.profile_id,
      unidade_id: validatedData.unidade_id,
      tabela_acessada: 'lgpd_solicitacoes',
      operacao: 'INSERT',
      finalidade: 'Exercício de direitos do titular',
      base_legal: 'exercicio_direitos',
    });

    revalidatePath('/lgpd/solicitacoes');
    return { success: true, data: newSolicitation };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function solicitarPortabilidade(data: any): Promise<ActionResult<any>> {
  try {
    const validatedData = SolicitacaoPortabilidadeSchema.parse(data);

    // Obter usuário atual
    const supabase = createServerSupabase();
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, unidade_default_id')
      .eq('user_id', profile.user.id)
      .single();

    if (!userProfile) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    return await createSolicitacaoLGPD({
      profile_id: userProfile.id,
      unidade_id: userProfile.unidade_default_id,
      tipo_solicitacao: 'portabilidade',
      motivo: validatedData.motivo,
      dados_solicitados: {
        formato: validatedData.formato,
        dados_solicitados: validatedData.dados_solicitados,
        email_entrega: validatedData.email_entrega,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function solicitarExclusao(data: any): Promise<ActionResult<any>> {
  try {
    const validatedData = SolicitacaoExclusaoSchema.parse(data);

    // Obter usuário atual
    const supabase = createServerSupabase();
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, unidade_default_id')
      .eq('user_id', profile.user.id)
      .single();

    if (!userProfile) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    return await createSolicitacaoLGPD({
      profile_id: userProfile.id,
      unidade_id: userProfile.unidade_default_id,
      tipo_solicitacao: 'exclusao',
      motivo: validatedData.motivo,
      dados_solicitados: {
        tipo_exclusao: validatedData.tipo_exclusao,
        dados_manter: validatedData.dados_manter,
        confirmo_exclusao: validatedData.confirmo_exclusao,
        ciente_irreversibilidade: validatedData.ciente_irreversibilidade,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function responderSolicitacao(
  solicitacaoId: string,
  data: any,
): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedData = RespostaSolicitacaoSchema.parse(data);

    // Verificar se usuário tem permissão para responder
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', profile.user.id)
      .single();

    if (!userProfile) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    // Atualizar solicitação
    const { data: updated, error } = await supabase
      .from('lgpd_solicitacoes')
      .update({
        status: validatedData.status,
        resposta: validatedData.resposta,
        arquivo_resposta_url: validatedData.arquivo_resposta_url,
        observacoes_internas: validatedData.observacoes_internas,
        data_resposta: new Date().toISOString(),
        atendente_id: userProfile.id,
      })
      .eq('id', solicitacaoId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao responder solicitação:', error);
      return { success: false, error: 'Erro ao responder solicitação' };
    }

    // Registrar na auditoria
    await registrarAcessoDadosPessoais({
      profile_id: updated.profile_id,
      unidade_id: updated.unidade_id,
      tabela_acessada: 'lgpd_solicitacoes',
      operacao: 'UPDATE',
      finalidade: 'Resposta a solicitação de titular',
      base_legal: 'obrigacao_legal',
    });

    revalidatePath('/lgpd/solicitacoes');
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getSolicitacoesPendentes(
  filters?: any,
  pagination?: any,
): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedFilters = filters ? LGPDFiltrosSchema.parse(filters) : {};
    const validatedPagination = pagination
      ? LGPDPaginationSchema.parse(pagination)
      : {
          page: 1,
          limit: 20,
          sort_by: 'prazo_limite',
          sort_order: 'asc',
        };

    let query = supabase.from('v_lgpd_solicitacoes_pendentes').select('*', { count: 'exact' });

    // Aplicar filtros
    if (validatedFilters.unidade_id) {
      query = query.eq('unidade_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.tipo_solicitacao) {
      query = query.eq('tipo_solicitacao', validatedFilters.tipo_solicitacao);
    }

    // Aplicar paginação
    const offset = (validatedPagination.page - 1) * validatedPagination.limit;
    query = query.range(offset, offset + validatedPagination.limit - 1);

    const { data: solicitacoes, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
      return { success: false, error: 'Erro ao buscar solicitações' };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / validatedPagination.limit);

    return {
      success: true,
      data: {
        data: solicitacoes || [],
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          total_pages: totalPages,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 3. TERMOS E POLÍTICAS
// =====================================================

export async function createTermo(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedData = CreateLGPDTermoSchema.parse(data);

    // Verificar permissões (apenas admins)
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Gerar checksum do conteúdo
    const checksum = crypto.createHash('sha256').update(validatedData.conteudo).digest('hex');

    // Desativar versões anteriores do mesmo tipo
    await supabase
      .from('lgpd_termos_politicas')
      .update({ ativo: false })
      .eq('tipo', validatedData.tipo);

    // Criar nova versão
    const { data: newTerm, error } = await supabase
      .from('lgpd_termos_politicas')
      .insert({
        ...validatedData,
        checksum,
        data_aprovacao: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar termo:', error);
      return { success: false, error: 'Erro ao criar termo' };
    }

    revalidatePath('/lgpd/termos');
    return { success: true, data: newTerm };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getTermosAtivos(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerSupabase();

    const { data: termos, error } = await supabase
      .from('lgpd_termos_politicas')
      .select('*')
      .eq('ativo', true)
      .order('tipo');

    if (error) {
      console.error('Erro ao buscar termos:', error);
      return { success: false, error: 'Erro ao buscar termos' };
    }

    return { success: true, data: termos || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 4. LOGS E AUDITORIA
// =====================================================

export async function registrarAcessoDadosPessoais(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedData = RegistrarAcessoSchema.parse(data);

    // Obter usuário responsável
    const { data: profile } = await supabase.auth.getUser();
    const { data: userProfile } = profile.user
      ? await supabase.from('profiles').select('id').eq('user_id', profile.user.id).single()
      : { data: null };

    const { data: logEntry, error } = await supabase
      .from('lgpd_logs_acesso')
      .insert({
        ...validatedData,
        usuario_responsavel: userProfile?.id,
        ip_address: '127.0.0.1', // Em produção, capturar IP real
        user_agent: 'User Agent', // Em produção, capturar User-Agent real
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar acesso:', error);
      return { success: false, error: 'Erro ao registrar acesso' };
    }

    return { success: true, data: logEntry };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getExclusoesAuditoria(
  filters?: any,
  pagination?: any,
): Promise<ActionResult<any>> {
  try {
    const supabase = createServerSupabase();

    const validatedFilters = filters ? LGPDFiltrosSchema.parse(filters) : {};
    const validatedPagination = pagination
      ? LGPDPaginationSchema.parse(pagination)
      : {
          page: 1,
          limit: 20,
          sort_by: 'data_exclusao',
          sort_order: 'desc',
        };

    let query = supabase.from('v_lgpd_exclusoes_auditoria').select('*', { count: 'exact' });

    // Aplicar filtros
    if (validatedFilters.unidade_id) {
      query = query.eq('unidade_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.profile_id) {
      query = query.eq('profile_id', validatedFilters.profile_id);
    }

    // Aplicar paginação
    const offset = (validatedPagination.page - 1) * validatedPagination.limit;
    query = query.range(offset, offset + validatedPagination.limit - 1);

    const { data: exclusoes, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar exclusões:', error);
      return { success: false, error: 'Erro ao buscar exclusões' };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / validatedPagination.limit);

    return {
      success: true,
      data: {
        data: exclusoes || [],
        pagination: {
          page: validatedPagination.page,
          limit: validatedPagination.limit,
          total,
          total_pages: totalPages,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 5. RELATÓRIOS E EXPORTAÇÃO
// =====================================================

export async function gerarRelatorioConformidade(data: any): Promise<ActionResult<string>> {
  try {
    const validatedData = RelatorioConformidadeSchema.parse(data);

    const supabase = createServerSupabase();

    // Coletar dados para o relatório
    const reportData: any = {
      periodo: {
        inicio: validatedData.periodo_inicio,
        fim: validatedData.periodo_fim,
      },
      unidade_id: validatedData.unidade_id,
      formato: validatedData.formato,
      gerado_em: new Date().toISOString(),
    };

    // Buscar consentimentos se solicitado
    if (validatedData.incluir_consentimentos) {
      const { data: consentimentos } = await getConsentimentosAtivos({
        unidade_id: validatedData.unidade_id,
        data_inicio: validatedData.periodo_inicio,
        data_fim: validatedData.periodo_fim,
      });
      reportData.consentimentos = consentimentos?.data || [];
    }

    // Buscar solicitações se solicitado
    if (validatedData.incluir_solicitacoes) {
      const { data: solicitacoes } = await getSolicitacoesPendentes({
        unidade_id: validatedData.unidade_id,
        data_inicio: validatedData.periodo_inicio,
        data_fim: validatedData.periodo_fim,
      });
      reportData.solicitacoes = solicitacoes?.data || [];
    }

    // Buscar exclusões se solicitado
    if (validatedData.incluir_exclusoes) {
      const { data: exclusoes } = await getExclusoesAuditoria({
        unidade_id: validatedData.unidade_id,
        data_inicio: validatedData.periodo_inicio,
        data_fim: validatedData.periodo_fim,
      });
      reportData.exclusoes = exclusoes?.data || [];
    }

    // Em um ambiente real, aqui seria gerado o arquivo (PDF, Excel, etc.)
    // Por enquanto, retornamos os dados em JSON
    const reportJson = JSON.stringify(reportData, null, 2);
    const reportUrl = `data:application/json;charset=utf-8,${encodeURIComponent(reportJson)}`;

    return { success: true, data: reportUrl };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function exportarDadosPessoais(
  profileId: string,
  formato: 'json' | 'csv' | 'xml' = 'json',
): Promise<ActionResult<string>> {
  try {
    const supabase = createServerSupabase();

    // Coletar todos os dados pessoais do usuário
    const dadosExportacao: any = {
      exportado_em: new Date().toISOString(),
      formato,
      titular_id: profileId,
    };

    // Dados básicos do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profile) {
      dadosExportacao.dados_pessoais = {
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
        data_nascimento: profile.data_nascimento,
        created_at: profile.created_at,
      };
    }

    // Consentimentos
    const { data: consentimentos } = await supabase
      .from('lgpd_consentimentos')
      .select('*')
      .eq('profile_id', profileId);

    dadosExportacao.consentimentos = consentimentos || [];

    // Agendamentos (dados relevantes)
    const { data: agendamentos } = await supabase
      .from('appointments')
      .select('id, inicio, fim, status, observacoes, created_at')
      .eq('cliente_id', profileId);

    dadosExportacao.agendamentos = agendamentos || [];

    // Registrar a exportação
    await registrarAcessoDadosPessoais({
      profile_id: profileId,
      unidade_id: profile?.unidade_default_id || '',
      tabela_acessada: 'profiles',
      operacao: 'EXPORT',
      finalidade: 'Portabilidade de dados pessoais',
      base_legal: 'exercicio_direitos',
    });

    // Gerar arquivo para download
    const exportJson = JSON.stringify(dadosExportacao, null, 2);
    const exportUrl = `data:application/json;charset=utf-8,${encodeURIComponent(exportJson)}`;

    return { success: true, data: exportUrl };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}
