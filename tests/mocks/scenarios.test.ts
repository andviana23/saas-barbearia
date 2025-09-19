/**
 * Testes de validação do sistema de cenários MSW
 * Demonstra como usar diferentes cenários para simular estados da API
 */

import { server } from './server';

// Setup MSW for tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MSW Scenarios System', () => {
  describe('Agendamentos - Cenários', () => {
    test('Cenário: success - retorna agendamentos normalmente', async () => {
      const response = await fetch('/api/agendamentos', {
        headers: { 'x-mock-scenario': 'success' },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('Cenário: empty - retorna lista vazia', async () => {
      const response = await fetch('/api/agendamentos', {
        headers: { 'x-mock-scenario': 'empty' },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    test('Cenário: error-500 - simula erro interno', async () => {
      const response = await fetch('/api/agendamentos', {
        headers: { 'x-mock-scenario': 'error-500' },
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Erro interno do servidor');
    });

    test('Cenário: conflict - simula conflito de horário', async () => {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'x-mock-scenario': 'conflict',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_hora: '2024-01-15T10:00:00Z',
          servico_id: 'serv-1',
          profissional_id: 'prof-1',
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Horário já ocupado');
    });
  });

  describe('Serviços - Cenários', () => {
    test('Cenário: success - retorna serviços', async () => {
      const response = await fetch('/api/servicos?scenario=success');

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('Cenário: empty via query param', async () => {
      const response = await fetch('/api/servicos?scenario=empty');

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });

    test('Cenário: error-400 - dados inválidos', async () => {
      const response = await fetch('/api/servicos', {
        method: 'POST',
        headers: {
          'x-mock-scenario': 'error-400',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: '' }), // Nome vazio
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dados inválidos');
    });
  });

  describe('Auth - Cenários', () => {
    test('Cenário: success - login bem-sucedido', async () => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'x-mock-scenario': 'success',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'password123',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user).toBeDefined();
      expect(data.data.session).toBeDefined();
    });

    test('Cenário: invalid-credentials', async () => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'x-mock-scenario': 'invalid-credentials',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'wrong@test.com',
          password: 'wrongpass',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Credenciais inválidas');
    });

    test('Cenário: user-not-found', async () => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'x-mock-scenario': 'user-not-found',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'notfound@test.com',
          password: 'password',
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Usuário não encontrado');
    });
  });

  describe('Marketplace - Cenários', () => {
    test('Cenário: success - serviços públicos disponíveis', async () => {
      const response = await fetch('/api/marketplace/servicos?scenario=success');

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('Cenário: unauthorized - acesso negado', async () => {
      const response = await fetch('/api/marketplace/admin/stats', {
        headers: { 'x-mock-scenario': 'unauthorized' },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Acesso negado');
    });
  });

  describe('Errors - Cenários Globais', () => {
    test('Cenário: network-error - simula erro de rede', async () => {
      const response = await fetch('/api/agendamentos', {
        headers: { 'x-mock-scenario': 'network-error' },
      });

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toContain('Erro de conectividade');
    });

    test('Cenário: timeout - simula timeout', async () => {
      const response = await fetch('/api/servicos', {
        headers: { 'x-mock-scenario': 'timeout' },
      });

      expect(response.status).toBe(408);
      const data = await response.json();
      expect(data.error).toContain('Timeout');
    });

    test('Cenário: rate-limit - simula rate limiting', async () => {
      const response = await fetch('/api/agendamentos', {
        headers: { 'x-mock-scenario': 'rate-limit' },
      });

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toContain('Muitas tentativas');
    });

    test('Cenário: maintenance - modo manutenção', async () => {
      const response = await fetch('/api/servicos', {
        headers: { 'x-mock-scenario': 'maintenance' },
      });

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toContain('Sistema em manutenção');
    });
  });

  describe('Combinação de Cenários', () => {
    test('Diferentes endpoints com cenários específicos', async () => {
      // Agendamento com sucesso
      const agendResponse = await fetch('/api/agendamentos', {
        headers: { 'x-mock-scenario': 'success' },
      });
      expect(agendResponse.status).toBe(200);

      // Serviços vazios
      const servicosResponse = await fetch('/api/servicos?scenario=empty');
      expect(servicosResponse.status).toBe(200);
      const servicosData = await servicosResponse.json();
      expect(servicosData.data).toEqual([]);

      // Auth com erro
      const authResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'x-mock-scenario': 'error-500',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test', password: 'test' }),
      });
      expect(authResponse.status).toBe(500);
    });
  });
});

describe('MSW Setup Integration', () => {
  test('Server está configurado corretamente', () => {
    expect(server).toBeDefined();
    expect(server.listHandlers().length).toBeGreaterThan(0);
  });

  test('Handlers estão organizados por domínio', () => {
    const handlers = server.listHandlers();

    // Verifica se há handlers para cada domínio
    const urls = handlers
      .filter((h) => 'info' in h && h.info)
      .map((h) => (h as any).info.path);

    expect(urls.some((url) => url.includes('/api/agendamentos'))).toBe(true);
    expect(urls.some((url) => url.includes('/api/servicos'))).toBe(true);
    expect(urls.some((url) => url.includes('/api/marketplace'))).toBe(true);
    expect(urls.some((url) => url.includes('/api/auth'))).toBe(true);
  });

  test('Cenários são aplicados dinamicamente', async () => {
    // Mesmo endpoint, cenários diferentes
    const successResponse = await fetch('/api/agendamentos', {
      headers: { 'x-mock-scenario': 'success' },
    });
    const emptyResponse = await fetch('/api/agendamentos', {
      headers: { 'x-mock-scenario': 'empty' },
    });

    const successData = await successResponse.json();
    const emptyData = await emptyResponse.json();

    expect(successData.data.length).toBeGreaterThan(0);
    expect(emptyData.data.length).toBe(0);
  });
});
