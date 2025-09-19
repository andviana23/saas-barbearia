import * as Sentry from '@sentry/nextjs';

export interface AsyncErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  unitId?: string;
  metadata?: Record<string, any>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

export interface AsyncErrorResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  retryCount?: number;
  context?: AsyncErrorContext;
}

// Configuração padrão para retry
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: Error) => {
    // Retry apenas para erros de rede ou temporários
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('503') ||
      error.message.includes('502')
    );
  },
};

// Classe para gerenciar erros assíncronos
export class AsyncErrorHandler {
  private static instance: AsyncErrorHandler;
  private errorQueue: Array<{ error: Error; context: AsyncErrorContext; timestamp: number }> = [];
  private maxQueueSize = 100;

  static getInstance(): AsyncErrorHandler {
    if (!AsyncErrorHandler.instance) {
      AsyncErrorHandler.instance = new AsyncErrorHandler();
    }
    return AsyncErrorHandler.instance;
  }

  // Executar operação assíncrona com retry e tratamento de erro
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: AsyncErrorContext,
    retryConfig: Partial<RetryConfig> = {},
  ): Promise<AsyncErrorResult<T>> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: Error = new Error('Unknown error');
    let retryCount = 0;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const data = await operation();

        // Log sucesso após retry
        if (attempt > 0) {
          console.log(`✅ Operation succeeded after ${attempt} retries:`, context.operation);
          this.logSuccess(context, attempt);
        }

        return {
          success: true,
          data,
          retryCount: attempt,
          context,
        };
      } catch (error) {
        lastError = error as Error;
        retryCount = attempt;

        // Log tentativa
        console.warn(`⚠️ Attempt ${attempt + 1}/${config.maxRetries + 1} failed:`, {
          operation: context.operation,
          error: lastError.message,
        });

        // Se não é o último attempt e erro é retryable
        if (attempt < config.maxRetries && config.retryCondition?.(lastError)) {
          const delay = this.calculateDelay(attempt, config);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        // Se chegou aqui, falhou definitivamente
        break;
      }
    }

    // Operação falhou após todas as tentativas
    const errorResult: AsyncErrorResult<T> = {
      success: false,
      error: lastError,
      retryCount,
      context,
    };

    this.handleError(lastError, context, retryCount);
    return errorResult;
  }

  // Wrapper para promises simples
  async safeExecute<T>(
    promise: Promise<T>,
    context: AsyncErrorContext,
  ): Promise<AsyncErrorResult<T>> {
    try {
      const data = await promise;
      return {
        success: true,
        data,
        context,
      };
    } catch (error) {
      const err = error as Error;
      this.handleError(err, context);
      return {
        success: false,
        error: err,
        context,
      };
    }
  }

  // Tratar erro e enviar para logging
  private handleError(error: Error, context: AsyncErrorContext, retryCount = 0): void {
    // Adicionar à fila de erros
    this.addToErrorQueue(error, context);

    // Log detalhado
    console.error('🚨 Async operation failed:', {
      operation: context.operation,
      component: context.component,
      error: error.message,
      stack: error.stack,
      retryCount,
      context: context.metadata,
    });

    // Enviar para Sentry
    Sentry.withScope((scope) => {
      scope.setTag('asyncError', true);
      scope.setTag('operation', context.operation);
      scope.setLevel('error');

      if (context.component) {
        scope.setTag('component', context.component);
      }

      if (context.userId) {
        scope.setUser({ id: context.userId });
      }

      if (context.unitId) {
        scope.setContext('unit', { id: context.unitId });
      }

      scope.setContext('operation', {
        name: context.operation,
        retryCount,
        metadata: context.metadata,
      });

      Sentry.captureException(error);
    });
  }

  // Log de sucesso após retry
  private logSuccess(context: AsyncErrorContext, retryCount: number): void {
    console.log('✅ Operation recovered:', {
      operation: context.operation,
      retryCount,
    });

    // Breadcrumb para Sentry
    Sentry.addBreadcrumb({
      message: 'Async operation recovered after retry',
      level: 'info',
      data: {
        operation: context.operation,
        retryCount,
      },
    });
  }

  // Calcular delay para retry com backoff exponencial
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
    return Math.min(delay, config.maxDelay);
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Adicionar erro à fila
  private addToErrorQueue(error: Error, context: AsyncErrorContext): void {
    this.errorQueue.push({
      error,
      context,
      timestamp: Date.now(),
    });

    // Manter tamanho da fila
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Obter estatísticas de erro
  getErrorStats(): {
    totalErrors: number;
    recentErrors: number;
    topOperations: Array<{ operation: string; count: number }>;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentErrors = this.errorQueue.filter((item) => item.timestamp > oneHourAgo);

    const operationCounts = this.errorQueue.reduce(
      (acc, item) => {
        const op = item.context.operation;
        acc[op] = (acc[op] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topOperations = Object.entries(operationCounts)
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalErrors: this.errorQueue.length,
      recentErrors: recentErrors.length,
      topOperations,
    };
  }

  // Limpar fila de erros
  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Instância singleton
export const asyncErrorHandler = AsyncErrorHandler.getInstance();

// Hooks e utilities para React
export function useAsyncError() {
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    context: Omit<AsyncErrorContext, 'component'>,
    retryConfig?: Partial<RetryConfig>,
  ): Promise<AsyncErrorResult<T>> => {
    return asyncErrorHandler.executeWithRetry(
      operation,
      { ...context, component: 'React Component' },
      retryConfig,
    );
  };

  const safeExecute = async <T>(
    promise: Promise<T>,
    context: Omit<AsyncErrorContext, 'component'>,
  ): Promise<AsyncErrorResult<T>> => {
    return asyncErrorHandler.safeExecute(promise, { ...context, component: 'React Component' });
  };

  return {
    executeWithRetry,
    safeExecute,
    getErrorStats: () => asyncErrorHandler.getErrorStats(),
  };
}

// Decorator para métodos de classe
export function withAsyncErrorHandling(
  context: AsyncErrorContext,
  retryConfig?: Partial<RetryConfig>,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await asyncErrorHandler.executeWithRetry(
        () => originalMethod.apply(this, args),
        context,
        retryConfig,
      );

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    };

    return descriptor;
  };
}

// Utility para fetch com retry
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  context: AsyncErrorContext,
  retryConfig?: Partial<RetryConfig>,
): Promise<AsyncErrorResult<Response>> {
  return asyncErrorHandler.executeWithRetry(
    () => fetch(url, options),
    { ...context, operation: `fetch ${url}` },
    retryConfig,
  );
}

// Utility para operações de banco de dados
export async function dbOperationWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata?: Record<string, any>,
): Promise<AsyncErrorResult<T>> {
  return asyncErrorHandler.executeWithRetry(
    operation,
    {
      operation: `db:${operationName}`,
      component: 'Database',
      metadata,
    },
    {
      maxRetries: 2, // Menos retries para DB
      baseDelay: 500,
      retryCondition: (error) => {
        // Retry apenas para erros de conexão
        return (
          error.message.includes('connection') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET')
        );
      },
    },
  );
}
