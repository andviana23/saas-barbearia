import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logging/centralized-logger';
import { AlertManager } from '@/app/api/alerts/route';

// logger já está importado
const alertManager = AlertManager.getInstance();

/**
 * Endpoint de Métricas do Sistema
 * Fornece dados de performance, negócio e saúde
 * Integrado com sistema de alertas
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verificar autorização
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.METRICS_API_KEY}`) {
      logger.warn('Unauthorized access attempt to metrics endpoint', {
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metricType = searchParams.get('type') || 'all';
    const timeRange = searchParams.get('range') || '1h';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let metrics = {};

    switch (metricType) {
      case 'performance':
        metrics = await getPerformanceMetrics(supabase, timeRange);
        break;
      case 'business':
        metrics = await getBusinessMetrics(supabase, timeRange);
        break;
      case 'system':
        metrics = await getSystemMetrics(supabase, timeRange);
        break;
      case 'health':
        metrics = await getHealthMetrics(supabase);
        break;
      default:
        metrics = {
          performance: await getPerformanceMetrics(supabase, timeRange),
          business: await getBusinessMetrics(supabase, timeRange),
          system: await getSystemMetrics(supabase, timeRange),
          health: await getHealthMetrics(supabase),
          timestamp: new Date().toISOString(),
        };
    }

    const responseTime = Date.now() - startTime;

    // Obter alertas ativos
    const activeAlerts = alertManager.getActiveAlerts();

    // Verificar se alguma métrica crítica excedeu limiar
    await checkCriticalMetrics(metrics);

    const response = {
      status: 'success',
      data: metrics,
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter((a) => a.severity === 'critical').length,
        warning: activeAlerts.filter((a) => a.severity === 'warning').length,
      },
      metadata: {
        responseTimeMs: responseTime,
        metricType,
        timeRange,
        timestamp: new Date().toISOString(),
      },
    };

    logger.info('Metrics retrieved successfully', {
      responseTime,
      metricType,
      timeRange,
      activeAlerts: activeAlerts.length,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    logger.error('Error fetching metrics', {
      error: error.message,
      responseTime,
      metricType: request.nextUrl.searchParams.get('type') || 'all',
      timeRange: request.nextUrl.searchParams.get('range') || '1h',
    });

    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        metadata: {
          responseTimeMs: responseTime,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

async function getPerformanceMetrics(supabase: any, timeRange: string) {
  try {
    // Tentar obter estatísticas do banco de dados
    const { data: dbStats, error: dbError } = await supabase.rpc('get_database_stats').single();

    if (dbError) {
      logger.warn('Database stats RPC failed, using mock data', { error: dbError });
    }

    return {
      database: {
        avgQueryTime: dbStats?.avg_query_time || 0.1,
        slowQueries: dbStats?.slow_queries || 0,
        cacheHitRate: dbStats?.cache_hit_rate || 0.95,
        connectionUsage: dbStats?.connection_usage || 0.2,
      },
      api: {
        avgResponseTime: 150, // Mock - implementar com logs reais
        p95ResponseTime: 300,
        p99ResponseTime: 500,
        requestsPerMinute: 120,
      },
      frontend: {
        avgLoadTime: 2.1,
        bundleSize: 850, // KB
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.5,
      },
    };
  } catch (error) {
    logger.error('Error getting performance metrics', { error });
    return {
      database: {
        avgQueryTime: 0.1,
        slowQueries: 0,
        cacheHitRate: 0.95,
        connectionUsage: 0.2,
      },
      api: {
        avgResponseTime: 150,
        p95ResponseTime: 300,
        p99ResponseTime: 500,
        requestsPerMinute: 120,
      },
      frontend: {
        avgLoadTime: 2.1,
        bundleSize: 850,
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.5,
      },
    };
  }
}

/**
 * Verifica se métricas críticas excederam limiares e dispara alertas
 */
async function checkCriticalMetrics(metrics: any): Promise<void> {
  try {
    // Verificar métricas de performance
    if (metrics.performance) {
      if (metrics.performance.avgResponseTime > 1000) {
        await alertManager.checkMetric('api.responseTime', metrics.performance.avgResponseTime);
      }

      if (metrics.performance.cpuUsage > 80) {
        await alertManager.checkMetric('system.cpuUsage', metrics.performance.cpuUsage);
      }
    }

    // Verificar métricas de erros
    if (metrics.errors) {
      if (metrics.errors.totalToday > 10) {
        await alertManager.checkMetric('errors.dailyTotal', metrics.errors.totalToday);
      }

      if (metrics.errors.errorRate > 0.05) {
        // 5% error rate
        await alertManager.checkMetric('errors.errorRate', metrics.errors.errorRate * 100);
      }
    }

    // Verificar métricas de negócio
    if (metrics.business) {
      if (metrics.business.conversionRate < 0.01) {
        // 1% conversion rate
        await alertManager.checkMetric(
          'business.conversionRate',
          metrics.business.conversionRate * 100,
        );
      }
    }

    // Verificar saúde dos serviços
    if (metrics.health) {
      for (const [service, status] of Object.entries(metrics.health)) {
        if (status === 'unhealthy') {
          await alertManager.checkMetric('service.health', 0);
        } else if (status === 'degraded') {
          await alertManager.checkMetric('service.health', 50);
        }
      }
    }
  } catch (error) {
    logger.error('Error checking critical metrics', { error });
  }
}

async function getBusinessMetrics(supabase: any, timeRange: string) {
  // Métricas de negócio
  const { count: totalAgendamentos } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  const { count: totalUnidades } = await supabase
    .from('unidades')
    .select('*', { count: 'exact', head: true });

  const { count: agendamentosHoje } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('data_hora', new Date().toISOString().split('T')[0])
    .lt('data_hora', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

  return {
    appointments: {
      total: totalAgendamentos || 0,
      today: agendamentosHoje || 0,
      conversionRate: 0.75, // 75% - mock
      noShowRate: 0.08, // 8% - mock
    },
    customers: {
      total: totalClientes || 0,
      newThisWeek: 15, // Mock
      retentionRate: 0.82, // 82% - mock
    },
    business: {
      totalUnits: totalUnidades || 0,
      revenue: 45000, // Mock - R$
      avgTicket: 120, // Mock - R$
    },
  };
}

async function getSystemMetrics(supabase: any, timeRange: string) {
  // Métricas do sistema
  const { data: activeUsers } = await supabase
    .from('auth.users')
    .select('id')
    .gte('last_sign_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  return {
    users: {
      activeToday: activeUsers?.length || 0,
      total: 0, // Implementar contagem total
      newThisWeek: 8, // Mock
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    },
    errors: {
      totalToday: 3, // Mock - implementar com logs reais
      errorRate: 0.02, // 2% - mock
      topErrors: [], // Implementar com logs reais
    },
  };
}

async function getHealthMetrics(supabase: any) {
  // Verificar saúde dos componentes
  const healthChecks = {
    database: false,
    authentication: false,
    api: false,
    external: false,
  };

  try {
    // Testar conexão com banco
    const { error: dbError } = await supabase.from('unidades').select('count').limit(1);

    healthChecks.database = !dbError;

    // Testar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession();
    healthChecks.authentication = !!session;

    // Testar API (mock)
    healthChecks.api = true;

    // Testar serviços externos (mock)
    healthChecks.external = true;
  } catch (error) {
    console.error('Health check error:', error);
  }

  const allHealthy = Object.values(healthChecks).every((check) => check);

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    checks: healthChecks,
    score: allHealthy ? 100 : 75, // Mock scoring
    lastCheck: new Date().toISOString(),
  };
}
