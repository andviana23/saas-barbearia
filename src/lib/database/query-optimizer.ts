import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../logging/centralized-logger';

// Configuração do otimizador
interface QueryOptimizerConfig {
  defaultTimeout: number;
  slowQueryThreshold: number;
  maxRetries: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTimeout: number;
  enableQueryLogging: boolean;
}

const DEFAULT_CONFIG: QueryOptimizerConfig = {
  defaultTimeout: 30000, // 30 segundos
  slowQueryThreshold: 5000, // 5 segundos
  maxRetries: 3,
  retryDelay: 1000,
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  enableQueryLogging: process.env.NODE_ENV === 'development',
};

// Interface para cache de queries
interface CachedQuery {
  data: any;
  timestamp: number;
  queryHash: string;
}

// Interface para estatísticas de query
interface QueryStats {
  queryHash: string;
  executionTime: number;
  success: boolean;
  timestamp: number;
  error?: string;
  retryCount?: number;
}

// Interface para query otimizada
interface OptimizedQuery {
  query: string;
  params?: any[];
  timeout?: number;
  retries?: number;
  cacheKey?: string;
  cacheDuration?: number;
}

class QueryOptimizer {
  private static instance: QueryOptimizer;
  private config: QueryOptimizerConfig;
  private queryCache = new Map<string, CachedQuery>();
  private queryStats: QueryStats[] = [];
  private activeQueries = new Map<string, AbortController>();

  constructor(config: Partial<QueryOptimizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCacheCleanup();
  }

  static getInstance(config?: Partial<QueryOptimizerConfig>): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer(config);
    }
    return QueryOptimizer.instance;
  }

  // Executar query otimizada
  async executeQuery<T = any>(supabaseClient: any, optimizedQuery: OptimizedQuery): Promise<T> {
    const queryHash = this.generateQueryHash(optimizedQuery);
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = optimizedQuery.retries ?? this.config.maxRetries;

    // Verificar cache primeiro
    if (this.config.enableCaching && optimizedQuery.cacheKey) {
      const cachedResult = this.getCachedResult<T>(optimizedQuery.cacheKey);
      if (cachedResult) {
        this.logQueryExecution(queryHash, Date.now() - startTime, true, retryCount);
        return cachedResult;
      }
    }

    while (retryCount <= maxRetries) {
      const abortController = new AbortController();
      this.activeQueries.set(queryHash, abortController);

      try {
        const result = await this.executeWithTimeout(
          supabaseClient,
          optimizedQuery,
          abortController,
          optimizedQuery.timeout ?? this.config.defaultTimeout,
        );

        // Salvar no cache se configurado
        if (this.config.enableCaching && optimizedQuery.cacheKey) {
          this.setCachedResult(
            optimizedQuery.cacheKey,
            result,
            optimizedQuery.cacheDuration ?? this.config.cacheTimeout,
          );
        }

        const executionTime = Date.now() - startTime;
        this.logQueryExecution(queryHash, executionTime, true, retryCount);

        // Log de query lenta
        if (executionTime > this.config.slowQueryThreshold) {
          logger.warn('Slow query detected', {
            operation: 'query-execution',
            component: 'QueryOptimizer',
            metadata: {
              queryHash,
              executionTime,
              threshold: this.config.slowQueryThreshold,
              retryCount,
            },
          });
        }

        this.activeQueries.delete(queryHash);
        return result;
      } catch (error) {
        retryCount++;
        const executionTime = Date.now() - startTime;

        this.logQueryExecution(
          queryHash,
          executionTime,
          false,
          retryCount - 1,
          (error as Error).message,
        );

        if (retryCount > maxRetries) {
          this.activeQueries.delete(queryHash);

          logger.error(
            'Query failed after all retries',
            {
              operation: 'query-execution',
              component: 'QueryOptimizer',
              metadata: {
                queryHash,
                executionTime,
                retryCount: retryCount - 1,
                maxRetries,
              },
            },
            error as Error,
          );

          throw error;
        }

        // Aguardar antes do próximo retry
        await this.delay(this.config.retryDelay * retryCount);

        logger.warn(`Query retry ${retryCount}/${maxRetries}`, {
          operation: 'query-retry',
          component: 'QueryOptimizer',
          metadata: {
            queryHash,
            retryCount,
            maxRetries,
            error: (error as Error).message,
          },
        });
      }
    }

    throw new Error('Query execution failed after all retries');
  }

  // Executar query com timeout
  private async executeWithTimeout(
    supabaseClient: any,
    optimizedQuery: OptimizedQuery,
    abortController: AbortController,
    timeout: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error(`Query timeout after ${timeout}ms`));
      }, timeout);

      // Executar query baseada no tipo
      let queryPromise: Promise<any>;

      if (optimizedQuery.query.toLowerCase().startsWith('select')) {
        queryPromise = this.executeSelectQuery(supabaseClient, optimizedQuery);
      } else if (optimizedQuery.query.toLowerCase().startsWith('insert')) {
        queryPromise = this.executeInsertQuery(supabaseClient, optimizedQuery);
      } else if (optimizedQuery.query.toLowerCase().startsWith('update')) {
        queryPromise = this.executeUpdateQuery(supabaseClient, optimizedQuery);
      } else if (optimizedQuery.query.toLowerCase().startsWith('delete')) {
        queryPromise = this.executeDeleteQuery(supabaseClient, optimizedQuery);
      } else {
        queryPromise = this.executeRawQuery(supabaseClient, optimizedQuery);
      }

      queryPromise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });

      // Cancelar query se abortado
      abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Query aborted'));
      });
    });
  }

  // Executar SELECT otimizado
  private async executeSelectQuery(supabaseClient: any, query: OptimizedQuery): Promise<any> {
    // Implementar otimizações específicas para SELECT
    const { data, error } = await supabaseClient.rpc('execute_optimized_select', {
      query_text: query.query,
      query_params: query.params || [],
    });

    if (error) throw error;
    return data;
  }

  // Executar INSERT otimizado
  private async executeInsertQuery(supabaseClient: any, query: OptimizedQuery): Promise<any> {
    const { data, error } = await supabaseClient.rpc('execute_optimized_insert', {
      query_text: query.query,
      query_params: query.params || [],
    });

    if (error) throw error;
    return data;
  }

  // Executar UPDATE otimizado
  private async executeUpdateQuery(supabaseClient: any, query: OptimizedQuery): Promise<any> {
    const { data, error } = await supabaseClient.rpc('execute_optimized_update', {
      query_text: query.query,
      query_params: query.params || [],
    });

    if (error) throw error;
    return data;
  }

  // Executar DELETE otimizado
  private async executeDeleteQuery(supabaseClient: any, query: OptimizedQuery): Promise<any> {
    const { data, error } = await supabaseClient.rpc('execute_optimized_delete', {
      query_text: query.query,
      query_params: query.params || [],
    });

    if (error) throw error;
    return data;
  }

  // Executar query raw
  private async executeRawQuery(supabaseClient: any, query: OptimizedQuery): Promise<any> {
    const { data, error } = await supabaseClient.rpc('execute_raw_query', {
      query_text: query.query,
      query_params: query.params || [],
    });

    if (error) throw error;
    return data;
  }

  // Gerar hash da query para identificação
  private generateQueryHash(query: OptimizedQuery): string {
    const queryString = JSON.stringify({
      query: query.query,
      params: query.params,
    });

    // Hash simples para identificação
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `query_${Math.abs(hash).toString(36)}`;
  }

  // Gerenciar cache
  private getCachedResult<T>(cacheKey: string): T | null {
    const cached = this.queryCache.get(cacheKey);

    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.queryCache.delete(cacheKey);
      return null;
    }

    return cached.data as T;
  }

  private setCachedResult(cacheKey: string, data: any, duration?: number): void {
    this.queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      queryHash: cacheKey,
    });
  }

  // Limpeza automática do cache
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      this.queryCache.forEach((cached, key) => {
        if (now - cached.timestamp > this.config.cacheTimeout) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach((key) => this.queryCache.delete(key));

      if (expiredKeys.length > 0) {
        logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`, {
          operation: 'cache-cleanup',
          component: 'QueryOptimizer',
        });
      }
    }, 60000); // Executar a cada minuto
  }

  // Log de execução de query
  private logQueryExecution(
    queryHash: string,
    executionTime: number,
    success: boolean,
    retryCount: number,
    error?: string,
  ): void {
    const stats: QueryStats = {
      queryHash,
      executionTime,
      success,
      timestamp: Date.now(),
      retryCount,
      ...(error && { error }),
    };

    this.queryStats.push(stats);

    // Manter apenas últimas 1000 estatísticas
    if (this.queryStats.length > 1000) {
      this.queryStats = this.queryStats.slice(-1000);
    }

    if (this.config.enableQueryLogging) {
      const logLevel = success ? 'info' : 'error';
      const message = success ? 'Query executed successfully' : 'Query execution failed';

      logger[logLevel](message, {
        operation: 'query-execution',
        component: 'QueryOptimizer',
        metadata: stats,
      });
    }
  }

  // Delay helper
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cancelar query ativa
  cancelQuery(queryHash: string): boolean {
    const controller = this.activeQueries.get(queryHash);
    if (controller) {
      controller.abort();
      this.activeQueries.delete(queryHash);
      return true;
    }
    return false;
  }

  // Cancelar todas as queries ativas
  cancelAllQueries(): number {
    let canceledCount = 0;

    this.activeQueries.forEach((controller, queryHash) => {
      controller.abort();
      canceledCount++;
    });

    this.activeQueries.clear();

    logger.info(`Canceled ${canceledCount} active queries`, {
      operation: 'query-cancellation',
      component: 'QueryOptimizer',
    });

    return canceledCount;
  }

  // Obter estatísticas
  getStats(): {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    activeQueries: number;
    cacheHitRate: number;
    cacheSize: number;
  } {
    const totalQueries = this.queryStats.length;
    const successfulQueries = this.queryStats.filter((s) => s.success).length;
    const failedQueries = totalQueries - successfulQueries;

    const totalExecutionTime = this.queryStats.reduce((sum, s) => sum + s.executionTime, 0);
    const averageExecutionTime = totalQueries > 0 ? totalExecutionTime / totalQueries : 0;

    const slowQueries = this.queryStats.filter(
      (s) => s.executionTime > this.config.slowQueryThreshold,
    ).length;

    // Calcular cache hit rate (aproximado)
    const recentQueries = this.queryStats.slice(-100);
    const cacheableQueries = recentQueries.filter((s) => s.executionTime < 100).length; // Queries rápidas provavelmente vieram do cache
    const cacheHitRate =
      recentQueries.length > 0 ? (cacheableQueries / recentQueries.length) * 100 : 0;

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      averageExecutionTime,
      slowQueries,
      activeQueries: this.activeQueries.size,
      cacheHitRate,
      cacheSize: this.queryCache.size,
    };
  }

  // Limpar cache manualmente
  clearCache(): void {
    this.queryCache.clear();
    logger.info('Query cache cleared', {
      operation: 'cache-clear',
      component: 'QueryOptimizer',
    });
  }

  // Obter queries lentas recentes
  getSlowQueries(limit: number = 10): QueryStats[] {
    return this.queryStats
      .filter((s) => s.executionTime > this.config.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }
}

// Instância singleton
export const queryOptimizer = QueryOptimizer.getInstance();

// Hook para usar query otimizada
export function useOptimizedQuery<T = any>(query: OptimizedQuery, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    let isCancelled = false;

    const executeQuery = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await queryOptimizer.executeQuery<T>(supabaseClient, query);

        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    executeQuery();

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}

// Função helper para criar queries otimizadas
export function createOptimizedQuery(
  query: string,
  options: Partial<OptimizedQuery> = {},
): OptimizedQuery {
  return {
    query,
    ...options,
  };
}

// Função para otimizar query automaticamente
export function optimizeQuery(query: string): OptimizedQuery {
  const optimized: OptimizedQuery = { query };

  // Adicionar otimizações baseadas no tipo de query
  if (query.toLowerCase().includes('select')) {
    // Otimizações para SELECT
    if (query.toLowerCase().includes('join')) {
      optimized.timeout = 45000; // Mais tempo para JOINs
    }

    if (query.toLowerCase().includes('order by') || query.toLowerCase().includes('group by')) {
      optimized.timeout = 60000; // Mais tempo para ordenação/agrupamento
    }

    // Habilitar cache para SELECTs
    optimized.cacheKey = `select_${Date.now()}`;
    optimized.cacheDuration = 5 * 60 * 1000; // 5 minutos
  }

  // Otimizações para operações de escrita
  if (
    query.toLowerCase().includes('insert') ||
    query.toLowerCase().includes('update') ||
    query.toLowerCase().includes('delete')
  ) {
    optimized.retries = 5; // Mais tentativas para operações críticas
    optimized.timeout = 30000;
  }

  return optimized;
}
