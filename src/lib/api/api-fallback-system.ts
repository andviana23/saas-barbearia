import { useState, useCallback, useEffect } from 'react';
import { logger } from '../logging/centralized-logger';

// Tipos de fallback disponíveis
export type FallbackType = 'cache' | 'mock' | 'alternative' | 'offline' | 'retry';

// Interface para configuração de fallback
export interface FallbackConfig {
  type: FallbackType;
  priority: number;
  enabled: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cacheKey?: string;
  mockData?: any;
  alternativeEndpoint?: string;
  offlineMessage?: string;
}

// Interface para resposta da API
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  source: 'api' | 'cache' | 'mock' | 'alternative' | 'offline';
  timestamp: number;
  error?: Error;
}

// Interface para configuração da API
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableFallbacks: boolean;
  fallbacks: FallbackConfig[];
  headers?: Record<string, string>;
}

// Cache para respostas da API
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiFallbackSystem {
  private static instance: ApiFallbackSystem;
  private cache = new Map<string, CacheEntry<any>>();
  private config: ApiConfig;
  private isOnline = true;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      enableFallbacks: true,
      fallbacks: [
        {
          type: 'cache',
          priority: 1,
          enabled: true,
          cacheKey: 'default',
        },
        {
          type: 'retry',
          priority: 2,
          enabled: true,
          retryAttempts: 3,
          retryDelay: 1000,
        },
        {
          type: 'alternative',
          priority: 3,
          enabled: false,
        },
        {
          type: 'mock',
          priority: 4,
          enabled: process.env.NODE_ENV === 'development',
        },
        {
          type: 'offline',
          priority: 5,
          enabled: true,
          offlineMessage:
            'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
        },
      ],
      ...config,
    };

    this.initializeNetworkMonitoring();
  }

  static getInstance(config?: Partial<ApiConfig>): ApiFallbackSystem {
    if (!ApiFallbackSystem.instance) {
      ApiFallbackSystem.instance = new ApiFallbackSystem(config);
    }
    return ApiFallbackSystem.instance;
  }

  // Monitorar status da rede
  private initializeNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;

      window.addEventListener('online', () => {
        this.isOnline = true;
        logger.info('Network connection restored', {
          operation: 'network-monitoring',
          component: 'ApiFallbackSystem',
        });
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        logger.warn('Network connection lost', {
          operation: 'network-monitoring',
          component: 'ApiFallbackSystem',
        });
      });
    }
  }

  // Executar requisição com fallbacks
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    fallbackConfigs?: FallbackConfig[],
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info(`API request started: ${endpoint}`, {
      operation: 'api-request',
      component: 'ApiFallbackSystem',
      metadata: { requestId, endpoint, method: options.method || 'GET' },
    });

    // Usar fallbacks configurados ou padrão
    const fallbacks = fallbackConfigs || this.config.fallbacks;
    const enabledFallbacks = fallbacks
      .filter((f) => f.enabled)
      .sort((a, b) => a.priority - b.priority);

    // Tentar requisição principal primeiro
    try {
      const response = await this.executeRequest<T>(endpoint, options);

      // Salvar no cache se bem-sucedida
      this.setCacheEntry(endpoint, response.data);

      const duration = Date.now() - startTime;
      logger.info(`API request successful: ${endpoint}`, {
        operation: 'api-request',
        component: 'ApiFallbackSystem',
        metadata: { requestId, endpoint, duration, source: 'api' },
      });

      return {
        ...response,
        source: 'api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.warn(
        `Primary API request failed: ${endpoint}`,
        {
          operation: 'api-request',
          component: 'ApiFallbackSystem',
          metadata: { requestId, endpoint, error: (error as Error).message },
        },
        error as Error,
      );

      // Tentar fallbacks em ordem de prioridade
      for (const fallback of enabledFallbacks) {
        try {
          const fallbackResponse = await this.executeFallback<T>(
            endpoint,
            options,
            fallback,
            error as Error,
          );

          if (fallbackResponse) {
            const duration = Date.now() - startTime;
            logger.info(`Fallback successful: ${fallback.type}`, {
              operation: 'api-fallback',
              component: 'ApiFallbackSystem',
              metadata: {
                requestId,
                endpoint,
                fallbackType: fallback.type,
                duration,
                source: fallbackResponse.source,
              },
            });

            return fallbackResponse;
          }
        } catch (fallbackError) {
          logger.warn(
            `Fallback failed: ${fallback.type}`,
            {
              operation: 'api-fallback',
              component: 'ApiFallbackSystem',
              metadata: {
                requestId,
                endpoint,
                fallbackType: fallback.type,
                error: (fallbackError as Error).message,
              },
            },
            fallbackError as Error,
          );
        }
      }

      // Todos os fallbacks falharam
      const duration = Date.now() - startTime;
      logger.error(
        `All fallbacks exhausted for: ${endpoint}`,
        {
          operation: 'api-request',
          component: 'ApiFallbackSystem',
          metadata: { requestId, endpoint, duration },
        },
        error as Error,
      );

      throw error;
    }
  }

  // Executar requisição HTTP
  private async executeRequest<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        success: true,
        source: 'api',
        timestamp: Date.now(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Executar fallback específico
  private async executeFallback<T>(
    endpoint: string,
    options: RequestInit,
    fallback: FallbackConfig,
    originalError: Error,
  ): Promise<ApiResponse<T> | null> {
    switch (fallback.type) {
      case 'cache':
        return this.executeCacheFallback<T>(endpoint, fallback);

      case 'retry':
        return this.executeRetryFallback<T>(endpoint, options, fallback);

      case 'alternative':
        return this.executeAlternativeFallback<T>(endpoint, options, fallback);

      case 'mock':
        return this.executeMockFallback<T>(endpoint, fallback);

      case 'offline':
        return this.executeOfflineFallback<T>(fallback);

      default:
        return null;
    }
  }

  // Fallback de cache
  private async executeCacheFallback<T>(
    endpoint: string,
    fallback: FallbackConfig,
  ): Promise<ApiResponse<T> | null> {
    const cacheKey = fallback.cacheKey || endpoint;
    const cached = this.getCacheEntry<T>(cacheKey);

    if (cached) {
      return {
        data: cached,
        success: true,
        source: 'cache',
        timestamp: Date.now(),
      };
    }

    return null;
  }

  // Fallback de retry
  private async executeRetryFallback<T>(
    endpoint: string,
    options: RequestInit,
    fallback: FallbackConfig,
  ): Promise<ApiResponse<T> | null> {
    const maxAttempts = fallback.retryAttempts || this.config.retries;
    const delay = fallback.retryDelay || this.config.retryDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.delay(delay * attempt); // Backoff exponencial
        return await this.executeRequest<T>(endpoint, options);
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed`, {
          operation: 'api-retry',
          component: 'ApiFallbackSystem',
          metadata: { endpoint, attempt, maxAttempts },
        });
      }
    }

    return null;
  }

  // Fallback de endpoint alternativo
  private async executeAlternativeFallback<T>(
    endpoint: string,
    options: RequestInit,
    fallback: FallbackConfig,
  ): Promise<ApiResponse<T> | null> {
    if (!fallback.alternativeEndpoint) {
      return null;
    }

    const response = await this.executeRequest<T>(fallback.alternativeEndpoint, options);
    return {
      ...response,
      source: 'alternative',
    };
  }

  // Fallback de dados mock
  private async executeMockFallback<T>(
    endpoint: string,
    fallback: FallbackConfig,
  ): Promise<ApiResponse<T> | null> {
    if (!fallback.mockData) {
      // Gerar dados mock básicos baseados no endpoint
      const mockData = this.generateMockData(endpoint);

      return {
        data: mockData as T,
        success: true,
        source: 'mock',
        timestamp: Date.now(),
      };
    }

    return {
      data: fallback.mockData as T,
      success: true,
      source: 'mock',
      timestamp: Date.now(),
    };
  }

  // Fallback offline
  private async executeOfflineFallback<T>(
    fallback: FallbackConfig,
  ): Promise<ApiResponse<T> | null> {
    const message = fallback.offlineMessage || 'Serviço indisponível';

    return {
      data: { message, offline: true } as T,
      success: false,
      source: 'offline',
      timestamp: Date.now(),
      error: new Error(message),
    };
  }

  // Gerar dados mock básicos
  private generateMockData(endpoint: string): any {
    // Dados mock baseados no tipo de endpoint
    if (endpoint.includes('/users') || endpoint.includes('/user')) {
      return {
        id: 'mock-user-1',
        name: 'Usuário Mock',
        email: 'mock@example.com',
        createdAt: new Date().toISOString(),
      };
    }

    if (endpoint.includes('/appointments') || endpoint.includes('/agendamentos')) {
      return [
        {
          id: 'mock-appointment-1',
          clientName: 'Cliente Mock',
          service: 'Corte de Cabelo',
          date: new Date().toISOString(),
          status: 'scheduled',
        },
      ];
    }

    if (endpoint.includes('/services') || endpoint.includes('/servicos')) {
      return [
        {
          id: 'mock-service-1',
          name: 'Corte de Cabelo',
          duration: 30,
          price: 25.0,
        },
        {
          id: 'mock-service-2',
          name: 'Barba',
          duration: 20,
          price: 15.0,
        },
      ];
    }

    // Dados genéricos
    return {
      message: 'Dados mock gerados automaticamente',
      timestamp: new Date().toISOString(),
      mock: true,
    };
  }

  // Gerenciar cache
  private setCacheEntry<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  private getCacheEntry<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Utilitários
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Métodos públicos para gerenciamento
  clearCache(): void {
    this.cache.clear();
    logger.info('API cache cleared', {
      operation: 'cache-management',
      component: 'ApiFallbackSystem',
    });
  }

  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; timestamp: number; expiresAt: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('API fallback config updated', {
      operation: 'config-update',
      component: 'ApiFallbackSystem',
    });
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }
}

// Instância singleton
export const apiFallbackSystem = ApiFallbackSystem.getInstance();

// Hook para usar API com fallbacks
export function useApiWithFallback<T = any>(
  endpoint: string,
  options: RequestInit = {},
  fallbacks?: FallbackConfig[],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<ApiResponse['source'] | null>(null);

  const executeRequest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFallbackSystem.request<T>(endpoint, options, fallbacks);
      setData(response.data);
      setSource(response.source);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(options), JSON.stringify(fallbacks)]);

  useEffect(() => {
    executeRequest();
  }, [executeRequest]);

  return {
    data,
    loading,
    error,
    source,
    refetch: executeRequest,
  };
}

// Função helper para criar configurações de fallback
export function createFallbackConfig(
  type: FallbackType,
  options: Partial<FallbackConfig> = {},
): FallbackConfig {
  const defaults: Record<FallbackType, Partial<FallbackConfig>> = {
    cache: { priority: 1, enabled: true },
    retry: { priority: 2, enabled: true, retryAttempts: 3, retryDelay: 1000 },
    alternative: { priority: 3, enabled: false },
    mock: { priority: 4, enabled: process.env.NODE_ENV === 'development' },
    offline: { priority: 5, enabled: true },
  };

  return {
    type,
    ...defaults[type],
    ...options,
  } as FallbackConfig;
}

// Função para configurar fallbacks padrão para diferentes tipos de endpoint
export function getDefaultFallbacks(endpointType: 'read' | 'write' | 'critical'): FallbackConfig[] {
  switch (endpointType) {
    case 'read':
      return [
        createFallbackConfig('cache', { priority: 1 }),
        createFallbackConfig('retry', { priority: 2, retryAttempts: 2 }),
        createFallbackConfig('mock', { priority: 3 }),
        createFallbackConfig('offline', { priority: 4 }),
      ];

    case 'write':
      return [
        createFallbackConfig('retry', { priority: 1, retryAttempts: 5, retryDelay: 2000 }),
        createFallbackConfig('offline', { priority: 2 }),
      ];

    case 'critical':
      return [
        createFallbackConfig('retry', { priority: 1, retryAttempts: 10, retryDelay: 500 }),
        createFallbackConfig('alternative', { priority: 2 }),
        createFallbackConfig('cache', { priority: 3 }),
        createFallbackConfig('offline', { priority: 4 }),
      ];

    default:
      return [];
  }
}
