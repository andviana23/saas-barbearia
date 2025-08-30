import { http, HttpResponse } from 'msw';

/**
 * Cenários disponíveis para handlers de auth
 */
export type AuthScenario = 'success' | 'invalid-credentials' | 'user-not-found' | 'error-500';

/**
 * Obtém o cenário atual dos headers ou query params
 */
function getScenario(request: Request): AuthScenario {
  const url = new URL(request.url);
  const headerScenario = request.headers.get('x-mock-scenario');
  const queryScenario = url.searchParams.get('scenario');
  
  return (headerScenario || queryScenario || 'success') as AuthScenario;
}

/**
 * Dados mock para usuários
 */
const mockUsers = {
  'admin@test.com': {
    id: 'user-admin',
    email: 'admin@test.com',
    name: 'Admin Test',
    role: 'admin',
    unidade_default_id: 'unit-001',
    profile: {
      id: 'profile-admin',
      nome: 'Admin Test',
      telefone: '(11) 99999-9999',
      cargo: 'Administrador',
    },
  },
  'funcionario@test.com': {
    id: 'user-func',
    email: 'funcionario@test.com',
    name: 'Funcionário Test',
    role: 'funcionario',
    unidade_default_id: 'unit-001',
    profile: {
      id: 'profile-func',
      nome: 'Funcionário Test',
      telefone: '(11) 88888-8888',
      cargo: 'Atendente',
    },
  },
};

/**
 * Handlers para API de autenticação
 */
export const authHandlers = [
  // POST /api/auth/signin - Login
  http.post('/api/auth/signin', async ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'invalid-credentials':
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid credentials',
            details: 'Email ou senha incorretos',
          },
          { status: 401 },
        );
      
      case 'user-not-found':
        return HttpResponse.json(
          {
            success: false,
            error: 'User not found',
            details: 'Usuário não encontrado',
          },
          { status: 404 },
        );
      
      case 'error-500':
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal server error',
            details: 'Erro interno do servidor',
          },
          { status: 500 },
        );
      
      case 'success':
      default:
        const body = (await request.json()) as { email: string; password: string };
        const user = mockUsers[body.email as keyof typeof mockUsers];
        
        if (!user) {
          return HttpResponse.json(
            {
              success: false,
              error: 'User not found',
              details: 'Usuário não encontrado',
            },
            { status: 404 },
          );
        }
        
        return HttpResponse.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              unidade_default_id: user.unidade_default_id,
            },
            session: {
              access_token: `mock-token-${user.id}`,
              refresh_token: `mock-refresh-${user.id}`,
              expires_at: Date.now() + 3600000, // 1 hour
            },
          },
        });
    }
  }),

  // POST /api/auth/signout - Logout
  http.post('/api/auth/signout', ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'error-500':
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal server error',
            details: 'Erro interno do servidor',
          },
          { status: 500 },
        );
      
      case 'success':
      default:
        return HttpResponse.json({
          success: true,
          message: 'Logout realizado com sucesso',
        });
    }
  }),

  // POST /api/auth/reset-password - Redefinir senha
  http.post('/api/auth/reset-password', async ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'user-not-found':
        return HttpResponse.json(
          {
            success: false,
            error: 'User not found',
            details: 'Email não encontrado',
          },
          { status: 404 },
        );
      
      case 'error-500':
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal server error',
            details: 'Erro interno do servidor',
          },
          { status: 500 },
        );
      
      case 'success':
      default:
        return HttpResponse.json({
          success: true,
          message: 'Email de redefinição de senha enviado',
        });
    }
  }),

  // GET /api/auth/me - Perfil do usuário
  http.get('/api/auth/me', ({ request }) => {
    const scenario = getScenario(request);
    const authHeader = request.headers.get('Authorization');
    
    switch (scenario) {
      case 'invalid-credentials':
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            details: 'Token inválido',
          },
          { status: 401 },
        );
      
      case 'error-500':
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal server error',
            details: 'Erro interno do servidor',
          },
          { status: 500 },
        );
      
      case 'success':
      default:
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return HttpResponse.json(
            {
              success: false,
              error: 'Unauthorized',
              details: 'Token de autorização necessário',
            },
            { status: 401 },
          );
        }
        
        // Simula usuário baseado no token
        const isAdminToken = authHeader.includes('user-admin');
        const user = isAdminToken ? mockUsers['admin@test.com'] : mockUsers['funcionario@test.com'];
        
        return HttpResponse.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              unidade_default_id: user.unidade_default_id,
            },
            profile: user.profile,
          },
        });
    }
  }),

  // POST /api/auth/refresh - Renovar token
  http.post('/api/auth/refresh', async ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'invalid-credentials':
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid refresh token',
            details: 'Token de refresh inválido',
          },
          { status: 401 },
        );
      
      case 'error-500':
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal server error',
            details: 'Erro interno do servidor',
          },
          { status: 500 },
        );
      
      case 'success':
      default:
        const body = (await request.json()) as { refresh_token: string };
        const isAdminToken = body.refresh_token.includes('user-admin');
        const userId = isAdminToken ? 'user-admin' : 'user-func';
        
        return HttpResponse.json({
          success: true,
          data: {
            access_token: `mock-token-${userId}-refreshed`,
            refresh_token: `mock-refresh-${userId}-refreshed`,
            expires_at: Date.now() + 3600000,
          },
        });
    }
  }),
];
