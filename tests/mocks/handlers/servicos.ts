import { http, HttpResponse } from 'msw';

/**
 * Cenários disponíveis para handlers de serviços
 */
export type ServicosScenario = 'success' | 'empty' | 'error-400' | 'error-500';

/**
 * Obtém o cenário atual dos headers ou query params
 */
function getScenario(request: Request): ServicosScenario {
  const url = new URL(request.url);
  const headerScenario = request.headers.get('x-mock-scenario');
  const queryScenario = url.searchParams.get('scenario');

  return (headerScenario || queryScenario || 'success') as ServicosScenario;
}

/**
 * Dados mock para serviços
 */
const mockServicos = [
  {
    id: 'serv-001',
    nome: 'Corte de Cabelo',
    descricao: 'Corte tradicional masculino',
    preco: 35.0,
    price_cents: 3500,
    duracao: 30,
    duration_minutes: 30,
    ativo: true,
    categoria: 'cabelo',
    unidade_id: 'unit-001',
    created_at: '2025-08-29T08:00:00Z',
    updated_at: '2025-08-29T08:00:00Z',
  },
  {
    id: 'serv-002',
    nome: 'Barba',
    descricao: 'Barba com navalha',
    preco: 25.0,
    price_cents: 2500,
    duracao: 20,
    duration_minutes: 20,
    ativo: true,
    categoria: 'barba',
    unidade_id: 'unit-001',
    created_at: '2025-08-29T08:00:00Z',
    updated_at: '2025-08-29T08:00:00Z',
  },
  {
    id: 'serv-003',
    nome: 'Sobrancelha',
    descricao: 'Design de sobrancelha',
    preco: 15.0,
    price_cents: 1500,
    duracao: 15,
    duration_minutes: 15,
    ativo: true,
    categoria: 'estética',
    unidade_id: 'unit-001',
    created_at: '2025-08-29T08:00:00Z',
    updated_at: '2025-08-29T08:00:00Z',
  },
];

/**
 * Handlers para API de serviços
 */
export const servicosHandlers = [
  // GET /api/servicos - Listar serviços
  http.get('/api/servicos', ({ request }) => {
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
        const categoria = url.searchParams.get('categoria');
        const ativo = url.searchParams.get('ativo');

        let filteredServicos = mockServicos;

        if (categoria) {
          filteredServicos = filteredServicos.filter((s) => s.categoria === categoria);
        }

        if (ativo !== null) {
          const isAtivo = ativo === 'true';
          filteredServicos = filteredServicos.filter((s) => s.ativo === isAtivo);
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

  // POST /api/servicos - Criar serviço
  http.post('/api/servicos', async ({ request }) => {
    const scenario = getScenario(request);

    switch (scenario) {
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Dados inválidos',
            details: 'Dados de serviço inválidos',
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
        const newServico = {
          id: `serv-${Date.now()}`,
          ...body,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return HttpResponse.json(
          {
            success: true,
            data: newServico,
          },
          { status: 201 },
        );
    }
  }),

  // PUT /api/servicos/:id - Atualizar serviço
  http.put('/api/servicos/:id', async ({ request, params }) => {
    const scenario = getScenario(request);
    const { id } = params;

    switch (scenario) {
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: 'Dados de serviço inválidos',
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
        const updatedServico = {
          ...mockServicos[0],
          ...body,
          id: id as string,
          updated_at: new Date().toISOString(),
        };

        return HttpResponse.json({
          success: true,
          data: updatedServico,
        });
    }
  }),

  // DELETE /api/servicos/:id - Remover serviço
  http.delete('/api/servicos/:id', ({ request, params }) => {
    const scenario = getScenario(request);
    const { id } = params;

    switch (scenario) {
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Cannot delete',
            details: 'Serviço possui agendamentos ativos',
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
        return HttpResponse.json({
          success: true,
          data: {
            id: id as string,
            deleted: true,
            deleted_at: new Date().toISOString(),
          },
        });
    }
  }),

  // GET /api/servicos/categorias - Listar categorias
  http.get('/api/servicos/categorias', ({ request }) => {
    const scenario = getScenario(request);

    switch (scenario) {
      case 'empty':
        return HttpResponse.json({
          success: true,
          data: [],
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
          data: [
            { id: 'cabelo', nome: 'Cabelo', count: 1 },
            { id: 'barba', nome: 'Barba', count: 1 },
            { id: 'estética', nome: 'Estética', count: 1 },
          ],
        });
    }
  }),
];
