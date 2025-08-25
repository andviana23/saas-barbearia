'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types'
import { CreateProfileSchema, UpdateProfileSchema } from '@/schemas'
import {
  withValidation,
  createActionResult,
  handleActionError,
} from '@/lib/server-actions'

export async function createProfile(formData: FormData): Promise<ActionResult> {
  const data = {
    user_id: formData.get('user_id'),
    nome: formData.get('nome'),
    email: formData.get('email'),
    telefone: formData.get('telefone'),
    unidade_default_id: formData.get('unidade_default_id'),
    papel: formData.get('papel'),
    ativo: formData.get('ativo') === 'true',
  }

  return withValidation(CreateProfileSchema, data, async (validatedData) => {
    // Simulação de criação no banco de dados
    // TODO: Implementar integração com Neon/Supabase
    const newProfile = {
      id: crypto.randomUUID(),
      ...validatedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 500))

    revalidatePath('/profiles')

    return newProfile
  })
}

export async function updateProfile(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    if (!id) {
      return createActionResult(false, undefined, 'ID do perfil é obrigatório')
    }

    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      unidade_default_id: formData.get('unidade_default_id'),
      papel: formData.get('papel'),
      ativo: formData.get('ativo') === 'true',
    }

    return await withValidation(
      UpdateProfileSchema,
      data,
      async (validatedData) => {
        // Simulação de atualização no banco de dados
        // TODO: Implementar integração com Neon/Supabase
        const updatedProfile = {
          id,
          ...validatedData,
          updated_at: new Date().toISOString(),
        }

        // Simular delay da API
        await new Promise((resolve) => setTimeout(resolve, 500))

        revalidatePath('/profiles')
        revalidatePath(`/profiles/${id}`)

        return updatedProfile
      }
    )
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteProfile(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return createActionResult(false, undefined, 'ID do perfil é obrigatório')
    }

    // Simulação de soft delete no banco de dados
    // TODO: Implementar integração com Neon/Supabase

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 300))

    revalidatePath('/profiles')

    return createActionResult(
      true,
      { id },
      undefined,
      'Perfil desativado com sucesso'
    )
  } catch (error) {
    return handleActionError(error)
  }
}
