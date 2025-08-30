import { http, HttpResponse } from 'msw';

/**
 * Cenários disponíveis para handlers de marketplace
 */
export type MarketplaceScenario = 'success' | 'empty' | 'error-400' | 'error-500' | 'unauthorized';

/**
 * Obtém o cenário atual dos headers ou query params
 */
function getScenario(request: Request): MarketplaceScenario {
  const url = new URL(request.url);
  const headerScenario = request.headers.get('x-mock-scenario');
  const queryScenario = url.searchParams.get('scenario');
  
  return (headerScenario || queryScenario || 'success') as MarketplaceScenario;
}

/**
 * Dados mock para marketplace
 */
const mockMarketplaceServicos = [
  {
    id: 'mp-001',
    servico_id: 'serv-001',
    unidade_id: 'unit-001',
    nome: 'Corte Premium',
    descricao: 'Corte de cabelo com produtos premium',
    preco_marketplace: 45.0,
    preco_original: 35.0,
    disponivel: true,
    destaque: true,
    imagens: ['https://example.com/img1.jpg'],
    tags: ['premium', 'popular'],
    avaliacao_media: 4.8,
    total_avaliacoes: 127,
    tempo_estimado: 45,
    created_at: '2025-08-29T08:00:00Z',
    updated_at: '2025-08-29T08:00:00Z',
  },
  {
    id: 'mp-002',
    servico_id: 'serv-002',
    unidade_id: 'unit-001',
    nome: 'Barba Tradicional',
    descricao: 'Barba feita com navalha tradicional',
    preco_marketplace: 30.0,
    preco_original: 25.0,
    disponivel: true,
    destaque: false,
    imagens: ['https://example.com/img2.jpg'],
    tags: ['tradicional', 'navalha'],
    avaliacao_media: 4.5,
    total_avaliacoes: 89,
    tempo_estimado: 25,
    created_at: '2025-08-29T08:00:00Z',
    updated_at: '2025-08-29T08:00:00Z',
  },
];

const mockReservas = [
  {
    id: 'res-001',
    marketplace_servico_id: 'mp-001',
    cliente_nome: 'João Silva',
    cliente_email: 'joao@email.com',
    cliente_telefone: '(11) 99999-9999',
    data_hora: '2025-08-30T14:00:00Z',
    status: 'confirmada',
    valor: 45.0,
    observacoes: 'Cliente preferencial',
    created_at: '2025-08-29T10:00:00Z',
  },
];

/**
 * Handlers para API de marketplace
 */
export const marketplaceHandlers = [
  // GET /api/marketplace/servicos - Listar serviços públicos
  http.get('/api/marketplace/servicos', ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'empty':
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
      
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid parameters',
            details: 'Parâmetros de consulta inválidos',
          },
          { status: 400 },
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
        const url = new URL(request.url);
        const destaque = url.searchParams.get('destaque');
        
        let filteredServicos = mockMarketplaceServicos;
        
        if (destaque === 'true') {
          filteredServicos = filteredServicos.filter((s) => s.destaque);
        }
        
        return HttpResponse.json({
          success: true,
          data: filteredServicos,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredServicos.length,
            total_pages: 1,
          },
        });
    }
  }),

  // POST /api/marketplace/reservas - Criar reserva
  http.post('/api/marketplace/reservas', async ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'unauthorized':
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            details: 'Serviço não disponível para reserva',
          },
          { status: 401 },
        );
      
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: 'Dados da reserva inválidos',
          },
          { status: 400 },
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
        const body = (await request.json()) as Record<string, unknown>;
        const newReserva = {
          id: `res-${Date.now()}`,
          ...body,
          status: 'pendente',
          created_at: new Date().toISOString(),
        };
        
        return HttpResponse.json(
          {
            success: true,
            data: newReserva,
            message: 'Reserva criada com sucesso',
          },
          { status: 201 },
        );
    }
  }),

  // GET /api/marketplace/reservas - Listar reservas (admin)
  http.get('/api/marketplace/reservas', ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'unauthorized':
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            details: 'Acesso negado',
          },
          { status: 403 },
        );
      
      case 'empty':
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
          data: mockReservas,
          pagination: {
            page: 1,
            limit: 20,
            total: mockReservas.length,
            total_pages: 1,
          },
        });
    }
  }),

  // PUT /api/marketplace/reservas/:id - Atualizar status da reserva
  http.put('/api/marketplace/reservas/:id', async ({ request, params }) => {
    const scenario = getScenario(request);
    const { id } = params;
    
    switch (scenario) {
      case 'unauthorized':
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            details: 'Acesso negado',
          },
          { status: 403 },
        );
      
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: 'Status inválido',
          },
          { status: 400 },
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
        const body = (await request.json()) as Record<string, unknown>;
        const updatedReserva = {
          ...mockReservas[0],
          ...body,
          id: id as string,
          updated_at: new Date().toISOString(),
        };
        
        return HttpResponse.json({
          success: true,
          data: updatedReserva,
        });
    }
  }),

  // GET /api/marketplace/stats - Estatísticas do marketplace
  http.get('/api/marketplace/stats', ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'unauthorized':
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            details: 'Acesso negado',
          },
          { status: 403 },
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
          data: {
            total_servicos: 2,
            total_reservas: 1,
            reservas_pendentes: 0,
            reservas_confirmadas: 1,
            receita_total: 45.0,
            avaliacao_media: 4.65,
          },
        });
    }
  }),
];
