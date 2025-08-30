'use server';

import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/types';
import { CreateUnidadeSchema, UpdateUnidadeSchema } from '@/schemas';
import { withValidation, createActionResult, handleActionError } from '@/lib/server-actions';

// Importações dos novos tipos centralizados
import { Unidade, CreateUnidadeDTO, UpdateUnidadeDTO, UnidadeFilters } from '@/types/api';

import {
  CreateUnidadeSchema as CreateUnidadeSchemaNew,
  UpdateUnidadeSchema as UpdateUnidadeSchemaNew,
  UnidadeFiltersSchema,
} from '@/schemas/api';

// ====================================
// CRUD UNIDADES - VERSÃO NOVA COM TIPOS CENTRALIZADOS
// ====================================

// Função exemplo usando tipos centralizados
export async function createUnidadeV2(data: CreateUnidadeDTO): Promise<ActionResult<Unidade>> {
  return withValidation(CreateUnidadeSchemaNew, data, async (validatedData) => {
    // TODO: Implementar integração com Neon/Supabase
    const newUnidade: Unidade = {
      id: crypto.randomUUID(),
      nome: validatedData.nome,
      cnpj: validatedData.cnpj,
      endereco: validatedData.endereco,
      telefone: validatedData.telefone,
      email: validatedData.email,
      ativo: validatedData.ativo ?? true,
      config: (validatedData.config as Record<string, string | number | boolean | null>) || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 500));

    revalidatePath('/unidades');

    return newUnidade;
  });
}

// Função para filtrar unidades usando novos tipos
export async function getUnidadesV2(
  filters: UnidadeFilters = {},
): Promise<ActionResult<Unidade[]>> {
  try {
    const validatedFilters = UnidadeFiltersSchema.parse(filters);

    // TODO: Implementar query real no banco
    const mockUnidades: Unidade[] = [
      {
        id: '1',
        nome: 'Unidade Centro',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua Principal, 123',
        telefone: '(11) 99999-9999',
        email: 'centro@barbearia.com',
        ativo: true,
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    let filteredUnidades = mockUnidades;

    if (validatedFilters.nome) {
      filteredUnidades = filteredUnidades.filter((u) =>
        u.nome.toLowerCase().includes(validatedFilters.nome!.toLowerCase()),
      );
    }

    if (validatedFilters.ativo !== undefined) {
      filteredUnidades = filteredUnidades.filter((u) => u.ativo === validatedFilters.ativo);
    }

    return {
      success: true,
      data: filteredUnidades,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ====================================
// CRUD UNIDADES - VERSÃO ATUAL (LEGADO)
// ====================================

export async function createUnidade(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    cnpj: formData.get('cnpj'),
    endereco: formData.get('endereco'),
    telefone: formData.get('telefone'),
    email: formData.get('email'),
    ativo: formData.get('ativo') === 'true',
  };

  return withValidation(CreateUnidadeSchema, data, async (validatedData) => {
    // Simulação de criação no banco de dados
    // TODO: Implementar integração com Neon/Supabase
    const newUnidade = {
      id: crypto.randomUUID(),
      ...validatedData,
      config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 500));

    revalidatePath('/unidades');

    return newUnidade;
  });
}

export async function updateUnidade(id: string, formData: FormData): Promise<ActionResult> {
  try {
    if (!id) {
      return createActionResult(false, undefined, 'ID da unidade é obrigatório');
    }

    const data = {
      nome: formData.get('nome'),
      cnpj: formData.get('cnpj'),
      endereco: formData.get('endereco'),
      telefone: formData.get('telefone'),
      email: formData.get('email'),
      ativo: formData.get('ativo') === 'true',
    };

    return await withValidation(UpdateUnidadeSchema, data, async (validatedData) => {
      // Simulação de atualização no banco de dados
      // TODO: Implementar integração com Neon/Supabase
      const updatedUnidade = {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      };

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));

      revalidatePath('/unidades');
      revalidatePath(`/unidades/${id}`);

      return updatedUnidade;
    });
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteUnidade(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return createActionResult(false, undefined, 'ID da unidade é obrigatório');
    }

    // Simulação de soft delete no banco de dados
    // TODO: Implementar integração com Neon/Supabase

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 300));

    revalidatePath('/unidades');

    return createActionResult(true, { id }, undefined, 'Unidade desativada com sucesso');
  } catch (error) {
    return handleActionError(error);
  }
}
