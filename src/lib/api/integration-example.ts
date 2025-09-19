/**
 * Exemplo de integração do API Client com redirect de autenticação
 *
 * Este arquivo mostra como configurar o API client para automaticamente
 * redirecionar usuários quando tokens de autenticação expirarem.
 */

import { configureAuthRedirect, ApiError } from '@/lib/api/client';
// import { signOut } from '@/app/actions/auth'; // TODO: Implementar quando auth estiver disponível

/**
 * Configura o redirect automático de autenticação
 * Deve ser chamado uma vez durante a inicialização da aplicação
 */
export function setupApiAuth() {
  configureAuthRedirect(async (error: ApiError) => {
    console.warn('Token de autenticação expirado:', error.message);

    // Limpar estado de autenticação no cliente
    // await signOut(); // TODO: Implementar quando auth estiver disponível

    // Redirecionar para página de login
    window.location.href = '/login';
  });
}

/**
 * Exemplo de uso do API client em componentes
 */
export async function exemploUsoAPIClient() {
  const { fetchJson } = await import('@/lib/api/client');

  try {
    // Requisição com autenticação (padrão)
    const user = await fetchJson('/api/user');
    console.log('Usuário logado:', user);

    // Requisição sem autenticação
    const publicData = await fetchJson('/api/public', { auth: false });
    console.log('Dados públicos:', publicData);

    // Requisição com validação de schema
    const { z } = await import('zod');
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    });

    const validatedUser = await fetchJson('/api/user', { schema: userSchema });
    console.log('Usuário validado:', validatedUser);

    // Requisição com retry automático
    const dataWithRetry = await fetchJson('/api/dados', { retry: 3 });
    console.log('Dados obtidos:', dataWithRetry);

    // Requisição POST com body JSON
    const newUser = await fetchJson('/api/users', {
      jsonBody: {
        name: 'João Silva',
        email: 'joao@example.com',
      },
    });
    console.log('Usuário criado:', newUser);

    // Requisição que desabilita interceptação de auth
    // (útil para telas de login/logout)
    const loginResponse = await fetchJson('/api/login', {
      jsonBody: { email: 'user@example.com', password: 'password' },
      noAuthIntercept: true,
    });
    console.log('Login response:', loginResponse);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Erro da API:', {
        status: error.status,
        message: error.message,
        details: error.details,
        isAuthError: error.isAuthError,
        isClientError: error.isClientError,
        isServerError: error.isServerError,
      });
    } else {
      console.error('Erro de rede:', error);
    }
  }
}

/**
 * Hook React para uso em componentes
 */
export function useApiClient() {
  const { fetchJson } = require('@/lib/api/client');

  return {
    fetchJson,
    // Wrapper para requisições GET
    get: (url: string, options = {}) => fetchJson(url, { ...options, method: 'GET' }),
    // Wrapper para requisições POST
    post: (url: string, data: unknown, options = {}) =>
      fetchJson(url, { ...options, method: 'POST', jsonBody: data }),
    // Wrapper para requisições PUT
    put: (url: string, data: unknown, options = {}) =>
      fetchJson(url, { ...options, method: 'PUT', jsonBody: data }),
    // Wrapper para requisições DELETE
    delete: (url: string, options = {}) => fetchJson(url, { ...options, method: 'DELETE' }),
  };
}
