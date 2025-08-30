'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { withValidation } from '@/lib/server-actions';
import {
  CreateProfissionalSchema,
  UpdateProfissionalSchema,
  CreateHorarioProfissionalSchema,
  UpdateHorarioProfissionalSchema,
  type ProfissionalFilterData,
  type HorarioProfissionalFilterData,
} from '@/schemas';
import type { ActionResult } from '@/types';

// Importações dos novos tipos centralizados
import { Profissional, CreateProfissionalDTO, ProfissionalFilters } from '@/types/api';
import {
  CreateProfissionalSchema as CreateProfissionalSchemaNew,
  ProfissionalFiltersSchema,
} from '@/schemas/api';

// ====================================
// CRUD PROFISSIONAIS - VERSÃO NOVA COM TIPOS CENTRALIZADOS
// ====================================

// Função exemplo usando tipos centralizados
export async function createProfissionalV2(
  data: CreateProfissionalDTO,
): Promise<ActionResult<Profissional>> {
  return withValidation(CreateProfissionalSchemaNew, data, async (validatedData) => {
    const { data: profissional, error } = await createServerSupabase()
      .from('professionals')
      .insert([
        {
          nome: validatedData.nome,
          email: validatedData.email,
          telefone: validatedData.telefone,
          unit_id: validatedData.unidade_id,
          ativo: validatedData.ativo,
          especialidades: validatedData.especialidades,
          comissao_padrao: validatedData.comissao_padrao,
          user_id: validatedData.user_id,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar profissional: ${error.message}`);
    }

    revalidatePath('/profissionais');
    return profissional;
  });
}

// Função para filtrar profissionais usando novos tipos
export async function getProfissionaisV2(
  filters: ProfissionalFilters = {},
): Promise<ActionResult<Profissional[]>> {
  try {
    const validatedFilters = ProfissionalFiltersSchema.parse(filters);

    let query = createServerSupabase().from('professionals').select('*');

    if (validatedFilters.nome) {
      query = query.ilike('nome', `%${validatedFilters.nome}%`);
    }

    if (validatedFilters.especialidade) {
      query = query.contains('especialidades', [validatedFilters.especialidade]);
    }

    if (validatedFilters.ativo !== undefined) {
      query = query.eq('ativo', validatedFilters.ativo);
    }

    if (validatedFilters.unidade_id) {
      query = query.eq('unit_id', validatedFilters.unidade_id);
    }

    const { data: profissionais, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar profissionais: ${error.message}`);
    }

    return {
      success: true,
      data: profissionais || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ====================================
// CRUD PROFISSIONAIS - VERSÃO ATUAL (LEGADO)
// ====================================

// Criar profissional
export async function createProfissional(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    papel: formData.get('papel'),
    unit_id: formData.get('unidade_id'),
    ativo: formData.get('ativo') === 'true',
    comissao_regra: formData.get('comissao_regra')
      ? JSON.parse(formData.get('comissao_regra') as string)
      : undefined,
  };

  return withValidation(CreateProfissionalSchema, data, async (validatedData) => {
    const { data: profissional, error } = await createServerSupabase()
      .from('professionals')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar profissional: ${error.message}`);
    }

    revalidatePath('/profissionais');
    return profissional;
  });
}

// Atualizar profissional
export async function updateProfissional(id: string, formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    papel: formData.get('papel'),
    ativo: formData.get('ativo') === 'true',
    comissao_regra: formData.get('comissao_regra')
      ? JSON.parse(formData.get('comissao_regra') as string)
      : undefined,
  };

  return withValidation(UpdateProfissionalSchema, data, async (validatedData) => {
    const { data: profissional, error } = await createServerSupabase()
      .from('professionals')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar profissional: ${error.message}`);
    }

    revalidatePath('/profissionais');
    revalidatePath(`/profissionais/${id}`);
    return profissional;
  });
}

// Deletar/Desativar profissional
export async function deleteProfissional(id: string): Promise<ActionResult> {
  try {
    // Verificar se profissional existe
    const { data: profissional, error: fetchError } = await createServerSupabase()
      .from('professionals')
      .select('id, nome')
      .eq('id', id)
      .single();

    if (fetchError || !profissional) {
      throw new Error('Profissional não encontrado');
    }

    // Verificar se há agendamentos futuros associados
    const { data: agendamentosFuturos, error: agendamentosError } = await createServerSupabase()
      .from('appointments')
      .select('id')
      .eq('profissional_id', id)
      .gte('inicio', new Date().toISOString())
      .limit(1);

    if (agendamentosError) {
      throw new Error(`Erro ao verificar agendamentos: ${agendamentosError.message}`);
    }

    if (agendamentosFuturos && agendamentosFuturos.length > 0) {
      // Desativar em vez de deletar se houver agendamentos futuros
      const { error: updateError } = await createServerSupabase()
        .from('professionals')
        .update({ ativo: false })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Erro ao desativar profissional: ${updateError.message}`);
      }

      revalidatePath('/profissionais');
      return {
        success: true,
        message: 'Profissional desativado (possui agendamentos futuros)',
        data: { id, desativado: true },
      };
    }

    // Deletar profissional se não houver agendamentos futuros
    const { error: deleteError } = await createServerSupabase()
      .from('professionals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Erro ao deletar profissional: ${deleteError.message}`);
    }

    revalidatePath('/profissionais');
    return {
      success: true,
      message: 'Profissional deletado com sucesso',
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Listar profissionais
export async function listProfissionais(
  filters: ProfissionalFilterData = {
    page: 0,
    limit: 10,
    order: 'desc',
  },
): Promise<ActionResult> {
  try {
    let query = createServerSupabase()
      .from('professionals')
      .select(
        `
        *,
        unidade:unidades(id, nome)
      `,
      )
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
      query = query.eq('unit_id', filters.unidade_id);
    }

    if (filters.papel) {
      query = query.ilike('papel', `%${filters.papel}%`);
    }

    // Paginação
    const offset = filters.page * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: profissionais, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao listar profissionais: ${error.message}`);
    }

    return {
      success: true,
      data: {
        profissionais: profissionais || [],
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

// Buscar profissional por ID
export async function getProfissional(id: string): Promise<ActionResult> {
  try {
    const { data: profissional, error } = await createServerSupabase()
      .from('professionals')
      .select(
        `
        *,
        unidade:unidades(id, nome),
        horarios:profissional_horarios(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar profissional: ${error.message}`);
    }

    if (!profissional) {
      throw new Error('Profissional não encontrado');
    }

    return {
      success: true,
      data: profissional,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ====================================
// HORÁRIOS DOS PROFISSIONAIS
// ====================================

// Criar horário para profissional
export async function createHorarioProfissional(formData: FormData): Promise<ActionResult> {
  const data = {
    profissional_id: formData.get('profissional_id'),
    dia_semana: Number(formData.get('dia_semana')),
    hora_inicio: formData.get('hora_inicio'),
    hora_fim: formData.get('hora_fim'),
    intervalo_inicio: formData.get('intervalo_inicio') || undefined,
    intervalo_fim: formData.get('intervalo_fim') || undefined,
    ativo: formData.get('ativo') === 'true',
  };

  return withValidation(CreateHorarioProfissionalSchema, data, async (validatedData) => {
    // Verificar sobreposições de horário para o mesmo profissional no mesmo dia
    const { data: horariosExistentes, error: checkError } = await createServerSupabase()
      .from('profissional_horarios')
      .select('*')
      .eq('profissional_id', validatedData.profissional_id)
      .eq('dia_semana', validatedData.dia_semana)
      .eq('ativo', true);

    if (checkError) {
      throw new Error(`Erro ao verificar horários: ${checkError.message}`);
    }

    // Validar sobreposições
    if (horariosExistentes && horariosExistentes.length > 0) {
      const novoInicio = validatedData.hora_inicio;
      const novoFim = validatedData.hora_fim;

      for (const horario of horariosExistentes) {
        const existenteInicio = horario.hora_inicio;
        const existenteFim = horario.hora_fim;

        // Verificar sobreposição
        if (
          (novoInicio >= existenteInicio && novoInicio < existenteFim) ||
          (novoFim > existenteInicio && novoFim <= existenteFim) ||
          (novoInicio <= existenteInicio && novoFim >= existenteFim)
        ) {
          throw new Error(
            `Horário conflita com horário existente: ${existenteInicio} às ${existenteFim}`,
          );
        }
      }
    }

    const { data: horario, error } = await createServerSupabase()
      .from('profissional_horarios')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar horário: ${error.message}`);
    }

    revalidatePath('/profissionais');
    revalidatePath(`/profissionais/${validatedData.profissional_id}`);
    return horario;
  });
}

// Atualizar horário do profissional
export async function updateHorarioProfissional(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const data = {
    dia_semana: Number(formData.get('dia_semana')),
    hora_inicio: formData.get('hora_inicio'),
    hora_fim: formData.get('hora_fim'),
    intervalo_inicio: formData.get('intervalo_inicio') || undefined,
    intervalo_fim: formData.get('intervalo_fim') || undefined,
    ativo: formData.get('ativo') === 'true',
  };

  return withValidation(UpdateHorarioProfissionalSchema, data, async (validatedData) => {
    const { data: horario, error } = await createServerSupabase()
      .from('profissional_horarios')
      .update(validatedData)
      .eq('id', id)
      .select('*, profissional_id')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar horário: ${error.message}`);
    }

    revalidatePath('/profissionais');
    revalidatePath(`/profissionais/${horario.profissional_id}`);
    return horario;
  });
}

// Deletar horário do profissional
export async function deleteHorarioProfissional(id: string): Promise<ActionResult> {
  try {
    // Buscar horário para obter profissional_id
    const { data: horario, error: fetchError } = await createServerSupabase()
      .from('profissional_horarios')
      .select('profissional_id')
      .eq('id', id)
      .single();

    if (fetchError || !horario) {
      throw new Error('Horário não encontrado');
    }

    const { error: deleteError } = await createServerSupabase()
      .from('profissional_horarios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Erro ao deletar horário: ${deleteError.message}`);
    }

    revalidatePath('/profissionais');
    revalidatePath(`/profissionais/${horario.profissional_id}`);
    return {
      success: true,
      message: 'Horário deletado com sucesso',
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Listar horários de um profissional
export async function listHorariosProfissional(
  profissionalId: string,
  filters: HorarioProfissionalFilterData = {
    page: 0,
    limit: 10,
    order: 'desc',
  },
): Promise<ActionResult> {
  try {
    let query = createServerSupabase()
      .from('profissional_horarios')
      .select('*')
      .eq('profissional_id', profissionalId)
      .order('dia_semana', { ascending: true });

    // Aplicar filtros
    if (filters.dia_semana !== undefined) {
      query = query.eq('dia_semana', filters.dia_semana);
    }

    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    const { data: horarios, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar horários: ${error.message}`);
    }

    return {
      success: true,
      data: horarios || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Obter disponibilidade do profissional (para agendamentos)
export async function getDisponibilidadeProfissional(
  profissionalId: string,
  data: string,
): Promise<ActionResult> {
  try {
    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay();

    // Buscar horários do profissional para o dia da semana
    const { data: horarios, error: horariosError } = await createServerSupabase()
      .from('profissional_horarios')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('dia_semana', diaSemana)
      .eq('ativo', true);

    if (horariosError) {
      throw new Error(`Erro ao buscar horários: ${horariosError.message}`);
    }

    // Buscar agendamentos do profissional na data
    const inicioData = new Date(data);
    inicioData.setHours(0, 0, 0, 0);
    const fimData = new Date(data);
    fimData.setHours(23, 59, 59, 999);

    const { data: agendamentos, error: agendamentosError } = await createServerSupabase()
      .from('appointments')
      .select('inicio, fim')
      .eq('profissional_id', profissionalId)
      .gte('inicio', inicioData.toISOString())
      .lte('inicio', fimData.toISOString())
      .neq('status', 'cancelado');

    if (agendamentosError) {
      throw new Error(`Erro ao buscar agendamentos: ${agendamentosError.message}`);
    }

    return {
      success: true,
      data: {
        horarios: horarios || [],
        agendamentos: agendamentos || [],
        data: data,
        dia_semana: diaSemana,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
