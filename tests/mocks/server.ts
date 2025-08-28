import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API handlers
export const handlers = [
  // Auth handlers
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      session: {
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
      },
    });
  }),

  http.post('/api/auth/signout', () => {
    return HttpResponse.json({ success: true });
  }),

  // LGPD handlers
  http.post('/api/lgpd/consentimentos', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-consent-id',
        profile_id: 'test-profile-id',
        tipo_consentimento: 'marketing',
        consentimento_dado: true,
        data_consentimento: new Date().toISOString(),
      },
    });
  }),

  http.get('/api/lgpd/consentimentos', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      },
    });
  }),

  http.post('/api/lgpd/solicitacoes', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-request-id',
        protocolo: 'LGPD-2024-001',
        tipo_solicitacao: 'portabilidade',
        status: 'pendente',
      },
    });
  }),

  // Unidades handlers
  http.get('/api/unidades', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'test-unidade-id',
          nome: 'Unidade Test',
          endereco: 'Rua Test, 123',
          telefone: '(11) 99999-9999',
        },
      ],
    });
  }),

  // Agendamentos handlers
  http.get('/api/agendamentos', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post('/api/agendamentos', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-appointment-id',
        data_hora: new Date().toISOString(),
        status: 'agendado',
      },
    });
  }),

  // Profissionais handlers
  http.get('/api/profissionais', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'test-professional-id',
          nome: 'João Silva',
          especialidades: ['Corte', 'Barba'],
          disponivel: true,
        },
      ],
    });
  }),

  // Serviços handlers
  http.get('/api/servicos', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'test-service-id',
          nome: 'Corte de Cabelo',
          preco: 35.0,
          duracao: 30,
        },
      ],
    });
  }),

  // Clientes handlers
  http.get('/api/clientes', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post('/api/clientes', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-client-id',
        nome: 'Cliente Test',
        email: 'cliente@test.com',
      },
    });
  }),

  // Pagamentos handlers
  http.get('/api/pagamentos', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post('/api/asaas/webhook', () => {
    return HttpResponse.json({ received: true });
  }),

  // Dashboard handlers
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_agendamentos: 150,
        receita_mensal: 5000.0,
        clientes_ativos: 85,
        taxa_ocupacao: 75,
      },
    });
  }),

  // Analytics handlers
  http.get('/api/analytics/*', () => {
    return HttpResponse.json({
      success: true,
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr'],
        datasets: [
          {
            label: 'Agendamentos',
            data: [10, 15, 12, 18],
          },
        ],
      },
    });
  }),
];

// Setup server
export const server = setupServer(...handlers);
