import { http, HttpResponse } from 'msw';

/**
 * Cenários disponíveis para handlers de agendamentos
 */
export type AgendamentosScenario = 'success' | 'empty' | 'error-400' | 'error-500' | 'conflict';

/**
 * Obtém o cenário atual dos headers ou query params
 */
function getScenario(request: Request): AgendamentosScenario {
  const url = new URL(request.url);
  const headerScenario = request.headers.get('x-mock-scenario');
  const queryScenario = url.searchParams.get('scenario');
  
  return (headerScenario || queryScenario || 'success') as AgendamentosScenario;
}

/**
 * Dados mock para agendamentos
 */
const mockAgendamentos = [
  {
    id: 'agend-001',
    cliente_id: 'cliente-001',
    profissional_id: 'prof-001',
    servico_id: 'serv-001',
    data_hora: '2025-08-30T10:00:00Z',
    status: 'confirmado',
    observacoes: 'Cliente preferencial',
    created_at: '2025-08-29T08:00:00Z',
    updated_at: '2025-08-29T08:00:00Z',
  },
  {
    id: 'agend-002',
    cliente_id: 'cliente-002',
    profissional_id: 'prof-002',
    servico_id: 'serv-002',
    data_hora: '2025-08-30T14:30:00Z',
    status: 'agendado',
    observacoes: null,
    created_at: '2025-08-29T09:15:00Z',
    updated_at: '2025-08-29T09:15:00Z',
  },
];

/**
 * Handlers para API de agendamentos
 */
export const agendamentosHandlers = [
  // GET /api/agendamentos - Listar agendamentos
  http.get('/api/agendamentos', ({ request }) => {
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
            error: 'Invalid query parameters',
            details: 'Data inicial deve ser anterior à data final',
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
          data: mockAgendamentos,
          pagination: {
            page: 1,
            limit: 20,
            total: mockAgendamentos.length,
            total_pages: 1,
          },
        });
    }
  }),

  // POST /api/agendamentos - Criar agendamento
  http.post('/api/agendamentos', async ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'conflict':
        return HttpResponse.json(
          {
            success: false,
            error: 'Scheduling conflict',
            details: 'Profissional já possui agendamento neste horário',
          },
          { status: 409 },
        );
      
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: 'Dados de agendamento inválidos',
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
        const newAgendamento = {
          id: `agend-${Date.now()}`,
          ...body,
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        return HttpResponse.json(
          {
            success: true,
            data: newAgendamento,
          },
          { status: 201 },
        );
    }
  }),

  // PUT /api/agendamentos/:id - Atualizar agendamento
  http.put('/api/agendamentos/:id', async ({ request, params }) => {
    const scenario = getScenario(request);
    const { id } = params;
    
    switch (scenario) {
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Validation error',
            details: 'Status de agendamento inválido',
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
        const updatedAgendamento = {
          ...mockAgendamentos[0],
          ...body,
          id: id as string,
          updated_at: new Date().toISOString(),
        };
        
        return HttpResponse.json({
          success: true,
          data: updatedAgendamento,
        });
    }
  }),

  // DELETE /api/agendamentos/:id - Cancelar agendamento
  http.delete('/api/agendamentos/:id', ({ request, params }) => {
    const scenario = getScenario(request);
    const { id } = params;
    
    switch (scenario) {
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Cannot cancel',
            details: 'Não é possível cancelar agendamento já realizado',
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
            status: 'cancelado',
            cancelled_at: new Date().toISOString(),
          },
        });
    }
  }),

  // GET /api/agendamentos/disponibilidade - Verificar disponibilidade
  http.get('/api/agendamentos/disponibilidade', ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'empty':
        return HttpResponse.json({
          success: true,
          data: {
            slots_disponiveis: [],
            ocupacao_dia: 100,
          },
        });
      
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid parameters',
            details: 'Data e profissional são obrigatórios',
          },
          { status: 400 },
        );
      
      case 'success':
      default:
        return HttpResponse.json({
          success: true,
          data: {
            slots_disponiveis: [
              { inicio: '09:00', fim: '09:30' },
              { inicio: '10:30', fim: '11:00' },
              { inicio: '15:00', fim: '15:30' },
              { inicio: '16:00', fim: '16:30' },
            ],
            ocupacao_dia: 65,
          },
        });
    }
  }),
];
