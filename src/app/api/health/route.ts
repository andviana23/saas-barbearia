import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Health Check Endpoint
 * Verifica o status da aplicação e dependências
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Informações básicas da aplicação
    const appInfo = {
      name: 'Sistema Trato - SaaS Barbearia',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    // Status de componentes
    const components = {
      app: { status: 'healthy', message: 'Application running' },
      database: { status: 'unknown', message: 'Not checked' },
      environment: { status: 'unknown', message: 'Not checked' },
    };

    // Verificar conexão com Supabase (sempre nuvem)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Teste simples de conexão
      const { data, error } = await supabase.from('unidades').select('count').limit(1);

      if (error) {
        components.database = {
          status: 'unhealthy',
          message: `Database error: ${error.message}`,
        };
      } else {
        components.database = {
          status: 'healthy',
          message: 'Database connected',
        };
      }
    } catch (dbError: any) {
      components.database = {
        status: 'unhealthy',
        message: `Database connection failed: ${dbError.message}`,
      };
    }

    // Verificar variáveis de ambiente críticas
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      components.environment = {
        status: 'unhealthy',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
      };
    } else {
      components.environment = {
        status: 'healthy',
        message: 'All required environment variables present',
      };
    }

    // Calcular status geral
    const allHealthy = Object.values(components).every(
      (component) => component.status === 'healthy',
    );
    const overallStatus = allHealthy ? 'healthy' : 'degraded';

    // Métricas de performance
    const responseTime = Date.now() - startTime;

    const healthCheck = {
      status: overallStatus,
      ...appInfo,
      components,
      metrics: {
        responseTimeMs: responseTime,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      checks: {
        databaseConnection: components.database.status === 'healthy',
        environmentVariables: components.environment.status === 'healthy',
      },
    };

    // Retornar status HTTP apropriado
    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        metrics: {
          responseTimeMs: responseTime,
        },
      },
      { status: 503 },
    );
  }
}

/**
 * Endpoint adicional para verificação de dependencies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkType } = body;

    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {},
    };

    switch (checkType) {
      case 'database':
        // Verificações mais detalhadas do banco
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        // Verificar tabelas principais
        const tables = ['unidades', 'clientes', 'profissionais', 'appointments'];

        for (const table of tables) {
          try {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true })
              .limit(1);

            results.checks[table] = {
              status: error ? 'error' : 'healthy',
              message: error ? error.message : `Table accessible (${count} records)`,
              count: count || 0,
            };
          } catch (err: any) {
            results.checks[table] = {
              status: 'error',
              message: err.message,
            };
          }
        }
        break;

      case 'external':
        // Verificar APIs externas
        results.checks.asaas = await checkExternalService(
          'https://sandbox.asaas.com/api/v3/customers',
          {
            access_token: process.env.ASAAS_API_KEY || '',
          },
        );
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid checkType. Available: database, external',
          },
          { status: 400 },
        );
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

async function checkExternalService(url: string, headers: Record<string, string>) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      status: response.ok ? 'healthy' : 'degraded',
      message: `HTTP ${response.status} - ${response.statusText}`,
      responseCode: response.status,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      message: error.message,
      error: error.name,
    };
  }
}
