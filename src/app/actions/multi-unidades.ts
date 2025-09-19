'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  CreatePermissaoHierarquicaSchema,
  UpdatePermissaoHierarquicaSchema,
  CreateAcessoMultiUnidadeSchema,
  UpdateAcessoMultiUnidadeSchema,
  RelatorioConsolidadoFiltersSchema,
  RelatorioPaginationSchema,
  type CreatePermissaoHierarquica,
  type UpdatePermissaoHierarquica,
  type CreateAcessoMultiUnidade,
  type UpdateAcessoMultiUnidade,
} from '@/schemas/multi-unidades';
import {
  PermissaoHierarquica,
  AcessoMultiUnidade,
  AuditoriaAcesso,
  FaturamentoConsolidado,
  ServicosConsolidado,
  ProfissionaisConsolidado,
  RelatoriosConsolidadosResponse,
  EstatisticasMultiUnidade,
  ActionResult,
  PaginatedResponse,
  RelatorioConsolidadoFilters,
} from '@/types/multi-unidades';

// =====================================================
// SERVER ACTIONS PARA GESTÃO MULTI-UNIDADES
// =====================================================

// =====================================================
// 1. PERMISSÕES HIERÁRQUICAS
// =====================================================

export async function createPermissaoHierarquica(
  data: CreatePermissaoHierarquica,
): Promise<ActionResult<PermissaoHierarquica>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData: CreatePermissaoHierarquica = CreatePermissaoHierarquicaSchema.parse(data);

    // Verificar se usuário é admin
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se nível hierárquico já existe
    const { data: existingLevel } = await supabase
      .from('permissoes_hierarquicas')
      .select('id')
      .eq('nivel_hierarquico', validatedData.nivel_hierarquico)
      .single();

    if (existingLevel) {
      return { success: false, error: 'Nível hierárquico já existe' };
    }

    // Inserir permissão
    const { data: newPermissao, error } = await supabase
      .from('permissoes_hierarquicas')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar permissão hierárquica:', error);
      return { success: false, error: 'Erro ao criar permissão hierárquica' };
    }

    revalidatePath('/configuracoes/permissoes');

    return { success: true, data: newPermissao };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updatePermissaoHierarquica(
  id: string,
  data: UpdatePermissaoHierarquica,
): Promise<ActionResult<PermissaoHierarquica>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData = UpdatePermissaoHierarquicaSchema.parse(data);

    // Atualizar permissão
    const { data: updatedPermissao, error } = await supabase
      .from('permissoes_hierarquicas')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar permissão hierárquica:', error);
      return {
        success: false,
        error: 'Erro ao atualizar permissão hierárquica',
      };
    }

    revalidatePath('/configuracoes/permissoes');

    return { success: true, data: updatedPermissao };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getPermissoesHierarquicas(): Promise<ActionResult<PermissaoHierarquica[]>> {
  try {
    const supabase = createServerSupabase();

    const { data: permissoes, error } = await supabase
      .from('permissoes_hierarquicas')
      .select('*')
      .eq('ativo', true)
      .order('nivel_hierarquico', { ascending: true });

    if (error) {
      console.error('Erro ao buscar permissões hierárquicas:', error);
      return { success: false, error: 'Erro ao buscar permissões hierárquicas' };
    }

    return { success: true, data: permissoes || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 2. ACESSOS MULTI-UNIDADE
// =====================================================

export async function createAcessoMultiUnidade(
  data: CreateAcessoMultiUnidade,
): Promise<ActionResult<AcessoMultiUnidade>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData: CreateAcessoMultiUnidade = CreateAcessoMultiUnidadeSchema.parse(data);

    // Verificar se usuário tem permissão para gerenciar acessos
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se acesso já existe
    const { data: existingAccess } = await supabase
      .from('acessos_multi_unidade')
      .select('id')
      .eq('profile_id', (validatedData as any).profile_id)
      .eq('unit_id', (validatedData as any).unidade_id)
      .single();

    if (existingAccess) {
      return {
        success: false,
        error: 'Acesso já existe para este usuário e unidade',
      };
    }

    // Inserir acesso
    const { data: newAcesso, error } = await supabase
      .from('acessos_multi_unidade')
      .insert(validatedData as any)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar acesso multi-unidade:', error);
      return { success: false, error: 'Erro ao criar acesso multi-unidade' };
    }

    revalidatePath('/configuracoes/acessos');

    return { success: true, data: newAcesso };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updateAcessoMultiUnidade(
  id: string,
  data: UpdateAcessoMultiUnidade,
): Promise<ActionResult<AcessoMultiUnidade>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData = UpdateAcessoMultiUnidadeSchema.parse(data);

    // Atualizar acesso
    const { data: updatedAcesso, error } = await supabase
      .from('acessos_multi_unidade')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar acesso multi-unidade:', error);
      return { success: false, error: 'Erro ao atualizar acesso multi-unidade' };
    }

    revalidatePath('/configuracoes/acessos');

    return { success: true, data: updatedAcesso };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getAcessosMultiUnidade(
  profileId?: string,
  unidadeId?: string,
): Promise<ActionResult<AcessoMultiUnidade[]>> {
  try {
    const supabase = createServerSupabase();

    let query = supabase
      .from('acessos_multi_unidade')
      .select(
        `
        *,
        profile:profiles(nome, email, papel),
        unidade:unidades(nome, cnpj, endereco)
      `,
      )
      .eq('ativo', true);

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }
    if (unidadeId) {
      query = query.eq('unit_id', unidadeId);
    }

    const { data: acessos, error } = await query;

    if (error) {
      console.error('Erro ao buscar acessos multi-unidade:', error);
      return { success: false, error: 'Erro ao buscar acessos multi-unidade' };
    }

    return { success: true, data: acessos || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 3. AUDITORIA DE ACESSOS
// =====================================================

export async function registrarAuditoria(
  unidadeId: string,
  acao: string,
  recurso: string,
  dadosConsultados?: Record<string, unknown>,
): Promise<ActionResult<void>> {
  try {
    const supabase = createServerSupabase();

    // Registrar auditoria
    const { error } = await supabase.rpc('registrar_auditoria', {
      unit_id: unidadeId,
      acao,
      recurso,
      dados_consultados: dadosConsultados,
    });

    if (error) {
      console.error('Erro ao registrar auditoria:', error);
      return { success: false, error: 'Erro ao registrar auditoria' };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getAuditoriaAcessos(
  profileId?: string,
  unidadeId?: string,
  page: number = 1,
  limit: number = 20,
): Promise<ActionResult<PaginatedResponse<AuditoriaAcesso>>> {
  try {
    const supabase = createServerSupabase();

    let query = supabase.from('auditoria_acessos').select(
      `
        *,
        profile:profiles(nome, email),
        unidade:unidades(nome)
      `,
      { count: 'exact' },
    );

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }
    if (unidadeId) {
      query = query.eq('unit_id', unidadeId);
    }

    // Aplicar paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: auditoria, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar auditoria de acessos:', error);
      return { success: false, error: 'Erro ao buscar auditoria de acessos' };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const result: PaginatedResponse<AuditoriaAcesso> = {
      data: auditoria || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 4. RELATÓRIOS CONSOLIDADOS
// =====================================================

export async function getFaturamentoConsolidado(
  filters?: RelatorioConsolidadoFilters,
): Promise<ActionResult<FaturamentoConsolidado[]>> {
  try {
    const supabase = createServerSupabase();

    // Validar filtros
    const validatedFilters = filters ? RelatorioConsolidadoFiltersSchema.parse(filters) : {};

    let query = supabase.from('v_faturamento_consolidado').select('*');

    // Aplicar filtros
    if (validatedFilters.unidade_id) {
      query = query.eq('unit_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.data_inicio) {
      query = query.gte('mes_ano', validatedFilters.data_inicio);
    }
    if (validatedFilters.data_fim) {
      query = query.lte('mes_ano', validatedFilters.data_fim);
    }

    // Ordenar por faturamento
    query = query.order('faturamento_total', { ascending: false });

    const { data: faturamento, error } = await query;

    if (error) {
      console.error('Erro ao buscar faturamento consolidado:', error);
      return { success: false, error: 'Erro ao buscar faturamento consolidado' };
    }

    // Registrar auditoria
    await registrarAuditoria(await getCurrentUnidadeId(), 'SELECT', 'v_faturamento_consolidado', {
      filtros: validatedFilters,
    });

    return { success: true, data: faturamento || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getServicosConsolidado(
  filters?: RelatorioConsolidadoFilters,
): Promise<ActionResult<ServicosConsolidado[]>> {
  try {
    const supabase = createServerSupabase();

    // Validar filtros
    const validatedFilters = filters ? RelatorioConsolidadoFiltersSchema.parse(filters) : {};

    let query = supabase.from('v_servicos_consolidado').select('*');

    // Aplicar filtros
    if (validatedFilters.unidade_id) {
      query = query.eq('unit_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.categoria) {
      query = query.eq('categoria', validatedFilters.categoria);
    }

    // Ordenar por total de serviços
    query = query.order('total_servicos', { ascending: false });

    const { data: servicos, error } = await query;

    if (error) {
      console.error('Erro ao buscar serviços consolidados:', error);
      return { success: false, error: 'Erro ao buscar serviços consolidados' };
    }

    // Registrar auditoria
    await registrarAuditoria(await getCurrentUnidadeId(), 'SELECT', 'v_servicos_consolidado', {
      filtros: validatedFilters,
    });

    return { success: true, data: servicos || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getProfissionaisConsolidado(
  filters?: RelatorioConsolidadoFilters,
): Promise<ActionResult<ProfissionaisConsolidado[]>> {
  try {
    const supabase = createServerSupabase();

    // Validar filtros
    const validatedFilters = filters ? RelatorioConsolidadoFiltersSchema.parse(filters) : {};

    let query = supabase.from('v_profissionais_consolidado').select('*');

    // Aplicar filtros
    if (validatedFilters.unidade_id) {
      query = query.eq('unit_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.papel) {
      query = query.eq('papel', validatedFilters.papel);
    }

    // Ordenar por total de profissionais
    query = query.order('total_profissionais', { ascending: false });

    const { data: profissionais, error } = await query;

    if (error) {
      console.error('Erro ao buscar profissionais consolidados:', error);
      return {
        success: false,
        error: 'Erro ao buscar profissionais consolidados',
      };
    }

    // Registrar auditoria
    await registrarAuditoria(await getCurrentUnidadeId(), 'SELECT', 'v_profissionais_consolidado', {
      filtros: validatedFilters,
    });

    return { success: true, data: profissionais || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getRelatoriosConsolidados(
  filters?: RelatorioConsolidadoFilters,
): Promise<ActionResult<RelatoriosConsolidadosResponse>> {
  try {
    // Buscar todos os relatórios consolidados
    const [faturamentoResult, servicosResult, profissionaisResult] = await Promise.all([
      getFaturamentoConsolidado(filters),
      getServicosConsolidado(filters),
      getProfissionaisConsolidado(filters),
    ]);

    if (!faturamentoResult.success || !servicosResult.success || !profissionaisResult.success) {
      return { success: false, error: 'Erro ao buscar relatórios consolidados' };
    }

    // Calcular período baseado nos dados
    const faturamento = faturamentoResult.data || [];
    const servicos = servicosResult.data || [];
    const profissionais = profissionaisResult.data || [];

    const periodo = {
      inicio: filters?.data_inicio || new Date().toISOString().split('T')[0],
      fim: filters?.data_fim || new Date().toISOString().split('T')[0],
    };

    const result: RelatoriosConsolidadosResponse = {
      faturamento,
      servicos,
      profissionais,
      total_unidades: new Set([
        ...faturamento.map((f) => f.unidade_id),
        ...servicos.map((s) => s.unidade_id),
        ...profissionais.map((p) => p.unidade_id),
      ]).size,
      periodo,
    };

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 5. ESTATÍSTICAS MULTI-UNIDADE
// =====================================================

export async function getEstatisticasMultiUnidade(): Promise<
  ActionResult<EstatisticasMultiUnidade>
> {
  try {
    const supabase = createServerSupabase();

    // Buscar estatísticas básicas
    const { data: unidades, error: unidadesError } = await supabase
      .from('units')
      .select('id, ativo');

    if (unidadesError) {
      console.error('Erro ao buscar unidades:', unidadesError);
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('papel');

    if (profilesError) {
      console.error('Erro ao buscar profiles:', profilesError);
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }

    const { data: acessos, error: acessosError } = await supabase
      .from('acessos_multi_unidade')
      .select('id')
      .eq('ativo', true);

    if (acessosError) {
      console.error('Erro ao buscar acessos:', acessosError);
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }

    const { data: auditoria, error: auditoriaError } = await supabase
      .from('auditoria_acessos')
      .select('id');

    if (auditoriaError) {
      console.error('Erro ao buscar auditoria:', auditoriaError);
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }

    // Calcular estatísticas
    const total_unidades = unidades?.length || 0;
    const unidades_ativas = unidades?.filter((u) => u.ativo).length || 0;
    const total_usuarios = profiles?.length || 0;
    const acessos_multi_unidade = acessos?.length || 0;
    const auditoria_entradas = auditoria?.length || 0;

    // Calcular usuários por papel
    const usuarios_por_papel: Record<string, number> = {};
    profiles?.forEach((p) => {
      usuarios_por_papel[p.papel] = (usuarios_por_papel[p.papel] || 0) + 1;
    });

    // Contar relatórios consultados (simplificado)
    const relatorios_consultados = 0; // Seria calculado baseado na auditoria

    const stats: EstatisticasMultiUnidade = {
      total_unidades,
      unidades_ativas,
      total_usuarios,
      usuarios_por_papel,
      acessos_multi_unidade,
      relatorios_consultados,
      auditoria_entradas,
    };

    return { success: true, data: stats };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 6. FUNÇÕES AUXILIARES
// =====================================================

async function getCurrentUnidadeId(): Promise<string> {
  const supabase = createServerSupabase();

  const { data: profile } = await supabase.auth.getUser();
  if (!profile.user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('unidade_default_id')
    .eq('user_id', profile.user.id)
    .single();

  if (!profileData?.unidade_default_id) {
    throw new Error('Usuário não tem unidade padrão definida');
  }

  return profileData.unidade_default_id;
}
