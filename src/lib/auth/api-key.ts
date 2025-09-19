import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Para desenvolvimento, aceitar chave de teste
    if (process.env.NODE_ENV === 'development' && apiKey === 'test-key') {
      return true;
    }

    // Verificar se é uma chave válida no banco de dados
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key, is_active, expires_at')
      .eq('key', apiKey)
      .single();

    if (error || !data) {
      return false;
    }

    // Verificar se a chave está ativa
    if (!data.is_active) {
      return false;
    }

    // Verificar se não expirou
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar API key:', error);
    return false;
  }
}

export async function createApiKey(name: string, expiresAt?: Date): Promise<string> {
  try {
    // Gerar chave aleatória
    const apiKey = 'key_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          name,
          key: apiKey,
          is_active: true,
          expires_at: expiresAt?.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return apiKey;
  } catch (error) {
    console.error('Erro ao criar API key:', error);
    throw error;
  }
}

export async function revokeApiKey(apiKey: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('key', apiKey);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao revogar API key:', error);
    throw error;
  }
}
