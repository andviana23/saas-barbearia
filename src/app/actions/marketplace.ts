'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  CreateMarketplaceServicoSchema,
  UpdateMarketplaceServicoSchema,
  CreateReservaMarketplaceSchema,
  UpdateReservaMarketplaceSchema,
  CreateConfiguracaoMarketplaceSchema,
  UpdateConfiguracaoMarketplaceSchema,
  MarketplaceFiltersSchema,
  MarketplacePaginationSchema,
  type CreateMarketplaceServico,
  type UpdateMarketplaceServico,
  type CreateReservaMarketplace,
  type UpdateReservaMarketplace,
  type CreateConfiguracaoMarketplace,
  type UpdateConfiguracaoMarketplace,
  type MarketplaceFilters,
  type MarketplacePagination,
} from '@/schemas/marketplace';
import type { MarketplaceServico } from '@/types/marketplace';
import type {
  CatalogoPaginado,
  CatalogoPublico,
  ReservaMarketplace,
  ConfiguracaoMarketplace,
} from '@/schemas/marketplace';
type MarketplaceStats = {
  total_servicos: number;
  total_unidades: number;
  servicos_destaque: number;
  categorias_disponiveis: string[];
  faixa_precos: { min: number; max: number; media: number };
  servicos_por_categoria: Record<string, number>;
};
import type { ActionResult } from '@/types';

// =====================================================
// SERVER ACTIONS PARA MARKETPLACE DE SERVIÇOS
// =====================================================

// =====================================================
// 1. GESTÃO DE SERVIÇOS NO MARKETPLACE
// =====================================================

export async function createMarketplaceServico(
  data: CreateMarketplaceServico,
): Promise<ActionResult<MarketplaceServico>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData: CreateMarketplaceServico = CreateMarketplaceServicoSchema.parse(data);

    // Verificar se usuário tem acesso à unidade
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se serviço já existe no marketplace para esta unidade
    const { data: existingService } = await supabase
      .from('marketplace_servicos')
      .select('id')
      .eq('servico_id', (validatedData as any).servico_id)
      .eq('unidade_id', (validatedData as any).unidade_id)
      .single();

    if (existingService) {
      return {
        success: false,
        error: 'Serviço já existe no marketplace para esta unidade',
      };
    }

    // Inserir serviço no marketplace
    const { data: newService, error } = await supabase
      .from('marketplace_servicos')
      .insert(validatedData as any)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar serviço no marketplace:', error);
      return { success: false, error: 'Erro ao criar serviço no marketplace' };
    }

    revalidatePath('/marketplace');
    revalidatePath('/configuracoes/marketplace');

    return { success: true, data: newService };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updateMarketplaceServico(
  id: string,
  data: UpdateMarketplaceServico,
): Promise<ActionResult<MarketplaceServico>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData: UpdateMarketplaceServico = UpdateMarketplaceServicoSchema.parse(data);

    // Verificar se usuário tem acesso ao serviço
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Atualizar serviço
    const { data: updatedService, error } = await supabase
      .from('marketplace_servicos')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar serviço no marketplace:', error);
      return {
        success: false,
        error: 'Erro ao atualizar serviço no marketplace',
      };
    }

    revalidatePath('/marketplace');
    revalidatePath('/configuracoes/marketplace');

    return { success: true, data: updatedService };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function deleteMarketplaceServico(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerSupabase();

    // Verificar se usuário tem acesso ao serviço
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Excluir serviço
    const { error } = await supabase.from('marketplace_servicos').delete().eq('id', id);

    if (error) {
      console.error('Erro ao excluir serviço do marketplace:', error);
      return { success: false, error: 'Erro ao excluir serviço do marketplace' };
    }

    revalidatePath('/marketplace');
    revalidatePath('/configuracoes/marketplace');

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getMarketplaceServico(id: string): Promise<ActionResult<MarketplaceServico>> {
  try {
    const supabase = createServerSupabase();

    const { data: service, error } = await supabase
      .from('marketplace_servicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar serviço do marketplace:', error);
      return { success: false, error: 'Erro ao buscar serviço do marketplace' };
    }

    return { success: true, data: service };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getMarketplaceServicos(
  unidadeId?: string,
): Promise<ActionResult<MarketplaceServico[]>> {
  try {
    const supabase = createServerSupabase();

    let query = supabase.from('marketplace_servicos').select('*').eq('disponivel', true);

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId);
    }

    const { data: services, error } = await query;

    if (error) {
      console.error('Erro ao buscar serviços do marketplace:', error);
      return { success: false, error: 'Erro ao buscar serviços do marketplace' };
    }

    return { success: true, data: services || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 2. CATÁLOGO PÚBLICO
// =====================================================

export async function getCatalogoPublico(
  filters?: MarketplaceFilters,
  pagination?: MarketplacePagination,
): Promise<ActionResult<CatalogoPaginado>> {
  try {
    const supabase = createServerSupabase();

    // Validar filtros e paginação
    const validatedFilters: MarketplaceFilters = filters
      ? MarketplaceFiltersSchema.parse(filters)
      : ({} as MarketplaceFilters);
    const validatedPagination: MarketplacePagination = pagination
      ? MarketplacePaginationSchema.parse(pagination)
      : ({
          page: 1,
          limit: 20,
          sort_by: 'nome_publico',
          sort_order: 'asc',
        } as MarketplacePagination);

    // Construir query base
    let query = supabase.from('v_marketplace_catalogo').select('*', { count: 'exact' });

    // Aplicar filtros
    if (validatedFilters.categoria) {
      query = query.eq('categoria_publica', validatedFilters.categoria);
    }
    if (validatedFilters.preco_min !== undefined) {
      query = query.gte('preco_publico', validatedFilters.preco_min);
    }
    if (validatedFilters.preco_max !== undefined) {
      query = query.lte('preco_publico', validatedFilters.preco_max);
    }
    if (validatedFilters.duracao_max !== undefined) {
      query = query.lte('duracao_min', validatedFilters.duracao_max);
    }
    if (validatedFilters.unidade_id) {
      query = query.eq('unidade_id', validatedFilters.unidade_id);
    }
    if (validatedFilters.destaque !== undefined) {
      query = query.eq('destaque', validatedFilters.destaque);
    }
    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      query = query.overlaps('tags', validatedFilters.tags);
    }

    // Aplicar ordenação
    const sortField =
      validatedPagination.sort_by === 'created_at' ? 'created_at' : validatedPagination.sort_by;
    query = query.order(sortField, {
      ascending: validatedPagination.sort_order === 'asc',
    });

    // Aplicar paginação
    const offset = (validatedPagination.page - 1) * validatedPagination.limit;
    query = query.range(offset, offset + validatedPagination.limit - 1);

    const { data: services, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar catálogo público:', error);
      return { success: false, error: 'Erro ao buscar catálogo público' };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / validatedPagination.limit);

    const result: CatalogoPaginado = {
      data: services || [],
      pagination: {
        page: validatedPagination.page,
        limit: validatedPagination.limit,
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

export async function getServicoCatalogo(id: string): Promise<ActionResult<CatalogoPublico>> {
  try {
    const supabase = createServerSupabase();

    const { data: service, error } = await supabase
      .from('v_marketplace_catalogo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar serviço no catálogo:', error);
      return { success: false, error: 'Erro ao buscar serviço no catálogo' };
    }

    return { success: true, data: service };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 3. RESERVAS DO MARKETPLACE
// =====================================================

export async function createReservaMarketplace(
  data: CreateReservaMarketplace,
): Promise<ActionResult<ReservaMarketplace>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData: CreateReservaMarketplace = CreateReservaMarketplaceSchema.parse(data);

    // Verificar se usuário tem acesso à unidade de origem
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Verificar se unidade de destino permite reservas cross-unit
    const destinoId = (validatedData as any).unidade_destino_id as string;
    const { data: config } = await supabase
      .from('configuracoes_marketplace')
      .select('permitir_reservas_cross_unit')
      .eq('unidade_id', destinoId)
      .eq('ativo', true)
      .single();

    if (!config?.permitir_reservas_cross_unit) {
      return {
        success: false,
        error: 'Unidade de destino não permite reservas cross-unit',
      };
    }

    // Calcular comissão do marketplace
    const comissao = await getComissaoMarketplace(
      (validatedData as any).unidade_destino_id as string,
    );

    // Criar reserva
    const reservaData: CreateReservaMarketplace & {
      unidade_origem_id: string;
      comissao_marketplace?: number;
    } = {
      ...(validatedData as CreateReservaMarketplace),
      unidade_origem_id: await getCurrentUnidadeId(),
      comissao_marketplace: comissao,
    };

    const { data: newReserva, error } = await supabase
      .from('reservas_marketplace')
      .insert(reservaData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar reserva no marketplace:', error);
      return { success: false, error: 'Erro ao criar reserva no marketplace' };
    }

    revalidatePath('/marketplace');
    revalidatePath('/reservas');

    return { success: true, data: newReserva };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updateReservaMarketplace(
  id: string,
  data: UpdateReservaMarketplace,
): Promise<ActionResult<ReservaMarketplace>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData: UpdateReservaMarketplace = UpdateReservaMarketplaceSchema.parse(data);

    // Atualizar reserva
    const { data: updatedReserva, error } = await supabase
      .from('reservas_marketplace')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar reserva do marketplace:', error);
      return {
        success: false,
        error: 'Erro ao atualizar reserva do marketplace',
      };
    }

    revalidatePath('/marketplace');
    revalidatePath('/reservas');

    return { success: true, data: updatedReserva };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getReservasMarketplace(
  unidadeId?: string,
): Promise<ActionResult<ReservaMarketplace[]>> {
  try {
    const supabase = createServerSupabase();

    let query = supabase.from('reservas_marketplace').select('*');

    if (unidadeId) {
      query = query.or(`unidade_origem_id.eq.${unidadeId},unidade_destino_id.eq.${unidadeId}`);
    }

    const { data: reservas, error } = await query;

    if (error) {
      console.error('Erro ao buscar reservas do marketplace:', error);
      return { success: false, error: 'Erro ao buscar reservas do marketplace' };
    }

    return { success: true, data: reservas || [] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 4. CONFIGURAÇÕES DO MARKETPLACE
// =====================================================

export async function createConfiguracaoMarketplace(
  data: CreateConfiguracaoMarketplace,
): Promise<ActionResult<ConfiguracaoMarketplace>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData = CreateConfiguracaoMarketplaceSchema.parse(data);

    // Verificar se usuário tem acesso à unidade
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Inserir configuração
    const { data: newConfig, error } = await supabase
      .from('configuracoes_marketplace')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar configuração do marketplace:', error);
      return {
        success: false,
        error: 'Erro ao criar configuração do marketplace',
      };
    }

    revalidatePath('/configuracoes/marketplace');

    return { success: true, data: newConfig };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updateConfiguracaoMarketplace(
  id: string,
  data: UpdateConfiguracaoMarketplace,
): Promise<ActionResult<ConfiguracaoMarketplace>> {
  try {
    const supabase = createServerSupabase();

    // Validar dados de entrada
    const validatedData = UpdateConfiguracaoMarketplaceSchema.parse(data);

    // Atualizar configuração
    const { data: updatedConfig, error } = await supabase
      .from('configuracoes_marketplace')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar configuração do marketplace:', error);
      return {
        success: false,
        error: 'Erro ao atualizar configuração do marketplace',
      };
    }

    revalidatePath('/configuracoes/marketplace');

    return { success: true, data: updatedConfig };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getConfiguracaoMarketplace(
  unidadeId: string,
): Promise<ActionResult<ConfiguracaoMarketplace>> {
  try {
    const supabase = createServerSupabase();

    const { data: config, error } = await supabase
      .from('configuracoes_marketplace')
      .select('*')
      .eq('unidade_id', unidadeId)
      .single();

    if (error) {
      console.error('Erro ao buscar configuração do marketplace:', error);
      return {
        success: false,
        error: 'Erro ao buscar configuração do marketplace',
      };
    }

    return { success: true, data: config };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Erro interno do servidor' };
  }
}

// =====================================================
// 5. ESTATÍSTICAS E MÉTRICAS
// =====================================================

export async function getMarketplaceStats(): Promise<ActionResult<MarketplaceStats>> {
  try {
    const supabase = createServerSupabase();

    // Buscar estatísticas do catálogo público
    const { data: catalogo, error: catalogoError } = await supabase
      .from('v_marketplace_catalogo')
      .select('*');

    if (catalogoError) {
      console.error('Erro ao buscar catálogo para estatísticas:', catalogoError);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas do marketplace',
      };
    }

    // Calcular estatísticas
    const total_servicos = catalogo?.length || 0;
    const unidades = new Set(catalogo?.map((s) => s.unidade_id) || []);
    const total_unidades = unidades.size;
    const servicos_destaque = catalogo?.filter((s) => s.destaque).length || 0;

    const categorias = new Set(catalogo?.map((s) => s.categoria_publica).filter(Boolean) || []);
    const categorias_disponiveis = Array.from(categorias);

    const precos = catalogo?.map((s) => s.preco_publico) || [];
    const faixa_precos = {
      min: Math.min(...precos),
      max: Math.max(...precos),
      media: precos.reduce((a, b) => a + b, 0) / precos.length,
    };

    const servicos_por_categoria: Record<string, number> = {};
    catalogo?.forEach((s) => {
      if (s.categoria_publica) {
        servicos_por_categoria[s.categoria_publica] =
          (servicos_por_categoria[s.categoria_publica] || 0) + 1;
      }
    });

    const stats: MarketplaceStats = {
      total_servicos,
      total_unidades,
      servicos_destaque,
      categorias_disponiveis,
      faixa_precos,
      servicos_por_categoria,
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

async function getComissaoMarketplace(unidadeId: string): Promise<number> {
  const supabase = createServerSupabase();

  const { data: config } = await supabase
    .from('configuracoes_marketplace')
    .select('comissao_padrao')
    .eq('unidade_id', unidadeId)
    .eq('ativo', true)
    .single();

  return config?.comissao_padrao || 5.0; // 5% padrão
}
