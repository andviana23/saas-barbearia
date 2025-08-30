import { http, HttpResponse } from 'msw';

/**
 * Cenários de erro disponíveis
 */
export type ErrorScenario = 'network-error' | 'timeout' | 'rate-limit' | 'maintenance';

/**
 * Obtém o cenário atual dos headers ou query params
 */
function getScenario(request: Request): ErrorScenario | null {
  const url = new URL(request.url);
  const headerScenario = request.headers.get('x-mock-scenario');
  const queryScenario = url.searchParams.get('scenario');
  
  const scenario = headerScenario || queryScenario;
  return ['network-error', 'timeout', 'rate-limit', 'maintenance'].includes(scenario || '')
    ? (scenario as ErrorScenario)
    : null;
}

/**
 * Simula delay para timeout
 */
function simulateTimeout(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 30000);
  });
}

/**
 * Handlers para cenários de erro globais
 */
export const errorHandlers = [
  // Intercepta todas as requisições para simular erros globais
  http.all('*', ({ request }) => {
    const scenario = getScenario(request);
    
    switch (scenario) {
      case 'network-error':
        // Simula erro de rede
        return HttpResponse.error();
      
      case 'timeout':
        // Simula timeout
        return simulateTimeout();
      
      case 'rate-limit':
        return HttpResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            details: 'Muitas requisições. Tente novamente em alguns minutos.',
            retry_after: 60,
          },
          { status: 429 },
        );
      
      case 'maintenance':
        return HttpResponse.json(
          {
            success: false,
            error: 'Service unavailable',
            details: 'Sistema em manutenção. Tente novamente mais tarde.',
            maintenance_until: new Date(Date.now() + 3600000).toISOString(),
          },
          { status: 503 },
        );
      
      default:
        // Passa para os próximos handlers
        return;
    }
  }),

  // Handler específico para testar conectividade
  http.get('/api/health', ({ request }) => {
    const scenario = getScenario(request);
    
    if (scenario) {
      // Se há cenário de erro, aplicar
      switch (scenario) {
        case 'network-error':
          return HttpResponse.error();
        case 'timeout':
          return simulateTimeout();
        case 'rate-limit':
          return HttpResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        case 'maintenance':
          return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 });
      }
    }
    
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      redis: 'connected',
    });
  }),

  // Handler para testar diferentes códigos de status HTTP
  http.get('/api/test/status/:code', ({ params }) => {
    const { code } = params;
    const statusCode = parseInt(code as string, 10);
    
    const messages: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    
    return HttpResponse.json(
      {
        status: statusCode,
        message: messages[statusCode] || 'Unknown Status',
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    );
  }),

  // Handler para testar diferentes tipos de resposta
  http.get('/api/test/response/:type', ({ params }) => {
    const { type } = params;
    
    switch (type) {
      case 'empty':
        return HttpResponse.json(null);
      
      case 'large':
        // Simula resposta grande (10MB de dados)
        const largeData = Array(1000000).fill('x').join('');
        return HttpResponse.json({ data: largeData });
      
      case 'invalid-json':
        return new HttpResponse('{ invalid json }', {
          headers: { 'Content-Type': 'application/json' },
        });
      
      case 'no-content':
        return new HttpResponse(null, { status: 204 });
      
      case 'binary':
        const buffer = new ArrayBuffer(8);
        return new HttpResponse(buffer, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      
      default:
        return HttpResponse.json({
          type,
          message: 'Test response',
          timestamp: new Date().toISOString(),
        });
    }
  }),
];
