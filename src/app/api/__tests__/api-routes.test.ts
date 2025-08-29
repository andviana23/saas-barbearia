/**
 * Testes básicos para rotas API (health, metrics, asaas webhook)
 * Foco: cobrir branches de sucesso e erro sem depender de rede real.
 */
import { GET as healthGET, POST as healthPOST } from '@/app/api/health/route';
import { GET as metricsGET } from '@/app/api/asaas/metrics/route';
import { POST as asaasWebhookPOST } from '@/app/api/asaas/webhook/route';
import { NextRequest } from 'next/server';

// Shim simples para NextResponse.json em ambiente de teste
jest.mock('next/server', () => {
  const original = jest.requireActual('next/server');
  return {
    ...original,
    NextResponse: {
      json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
        status: (init && init.status) || 200,
        json: async () => data,
        headers: (init && init.headers) || {},
      }),
    },
  };
});

// Mocks externos
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ limit: () => ({ data: [], error: null }) }) }),
  }),
}));

jest.mock('@/app/actions/asaas-webhook-metrics', () => ({
  getAsaasWebhookMetrics: jest.fn().mockResolvedValue({ success: true, data: { total: 3 } }),
}));

jest.mock('@/services/assinaturas/webhook', () => ({
  processAsaasWebhook: jest.fn().mockResolvedValue({ success: true }),
}));

interface JsonBody {
  [k: string]: unknown;
}
function makeRequest(method: string, body?: JsonBody, headers?: Record<string, string>) {
  const init: RequestInit & { headers: Record<string, string> } = {
    method,
    headers: headers || {},
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  const { headers: hdrs, method: m, body: b } = init;
  return new NextRequest('http://localhost/test', { method: m, headers: hdrs, body: b });
}

describe('API Routes', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('health GET retorna 200 healthy', async () => {
    const res = await healthGET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBeDefined();
    expect(json.components.database.status).toBe('healthy');
  });

  test('health GET degraded se falta env', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const res = await healthGET(makeRequest('GET'));
  expect([200, 503]).toContain(res.status); // overall pode marcar degraded -> 503
    const json = await res.json();
    expect(json.components.environment.status).toBe('unhealthy');
  });

  test('health POST invalid checkType retorna 400', async () => {
    const res = await healthPOST(makeRequest('POST', { checkType: 'x' }));
    expect(res.status).toBe(400);
  });

  test('metrics GET sucesso', async () => {
    const res = await metricsGET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.metrics.total).toBe(3);
  });

  test('webhook ASAAS sem token retorna 401', async () => {
    const res = await asaasWebhookPOST(makeRequest('POST', { any: true }));
    expect(res.status).toBe(401);
  });

  test('webhook ASAAS token válido retorna ok', async () => {
    process.env.ASAAS_WEBHOOK_TOKEN = 'secret';
    const req = makeRequest('POST', { evt: 'X' }, { 'x-asaas-token': 'secret' });
    const res = await asaasWebhookPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
