'use server';

import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/types';
import { CreateUnidadeSchema, UpdateUnidadeSchema } from '@/schemas';
import { withValidation, createActionResult, handleActionError } from '@/lib/server-actions';

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
