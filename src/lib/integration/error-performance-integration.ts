/**
 * Integração completa dos sistemas de tratamento de erro e otimização de performance
 * Este arquivo demonstra como usar todos os sistemas criados de forma coordenada
 */

import React, { useCallback } from 'react';
import { ErrorBoundary, withErrorBoundary } from '../../components/error/ErrorBoundary';
import {
  AsyncErrorHandler,
  useAsyncError,
  withAsyncErrorHandling,
} from '../error-handling/async-error-handler';
import { logger } from '../logging/centralized-logger';
import { memoryLeakDetector } from '../performance/memory-leak-detector';
import { useSafeEffect, useDebouncedEffect } from '../hooks/safe-effect-hooks';
import { queryOptimizer } from '../database/query-optimizer';
import { renderMonitor, useStableMemo, withSmartMemo } from '../performance/render-optimizer';
import { apiFallbackSystem } from '../api/api-fallback-system';

// Configuração global dos sistemas
export class ErrorPerformanceManager {
  private static instance: ErrorPerformanceManager;
  private logger: typeof logger;
  private memoryDetector: typeof memoryLeakDetector;
  private queryOptimizer: typeof queryOptimizer;
  private renderMonitor: typeof renderMonitor;
  private apiSystem: typeof apiFallbackSystem;
  private asyncHandler: AsyncErrorHandler;

  private constructor() {
    this.logger = logger;
    this.memoryDetector = memoryLeakDetector;
    this.queryOptimizer = queryOptimizer;
    this.renderMonitor = renderMonitor;
    this.apiSystem = apiFallbackSystem;
    this.asyncHandler = AsyncErrorHandler.getInstance();
  }

  public static getInstance(): ErrorPerformanceManager {
    if (!ErrorPerformanceManager.instance) {
      ErrorPerformanceManager.instance = new ErrorPerformanceManager();
    }
    return ErrorPerformanceManager.instance;
  }

  /**
   * Inicializa todos os sistemas de monitoramento
   */
  public async initialize(): Promise<void> {
    try {
      // Logger já é inicializado automaticamente no construtor

      // Configurar detecção de memory leaks
      this.memoryDetector.startMonitoring();

      // RenderMonitor é inicializado automaticamente e não precisa de startMonitoring

      // Configurar sistema de API fallbacks
      this.apiSystem.updateConfig({
        enableFallbacks: true,
        fallbacks: [
          {
            type: 'cache',
            priority: 1,
            enabled: true,
            cacheKey: 'default',
          },
          {
            type: 'mock',
            priority: 2,
            enabled: process.env.NODE_ENV === 'development',
          },
          {
            type: 'offline',
            priority: 3,
            enabled: true,
            offlineMessage: 'Serviço temporariamente indisponível.',
          },
        ],
      });

      this.logger.info('ErrorPerformanceManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ErrorPerformanceManager:', error);
      throw error;
    }
  }

  /**
   * Cleanup de todos os sistemas
   */
  public cleanup(): void {
    this.memoryDetector.stopMonitoring();
    this.renderMonitor.clearStats();
    this.queryOptimizer.clearCache();
    this.apiSystem.clearCache();
    this.logger.info('ErrorPerformanceManager cleanup completed');
  }

  /**
   * Relatório de status de todos os sistemas
   */
  public getSystemStatus(): {
    memory: any;
    renders: any;
    queries: any;
    errors: any;
  } {
    return {
      memory: this.memoryDetector.getResourceStats(),
      renders: this.renderMonitor.getStats(),
      queries: this.queryOptimizer.getStats(),
      errors: this.asyncHandler.getErrorStats(),
    };
  }
}

// Hook personalizado que combina todos os sistemas
export function useIntegratedErrorHandling() {
  const asyncError = useAsyncError();

  const handleError = useCallback((error: Error, context?: string) => {
    logger.error('Integrated error handling', { operation: context }, error);
  }, []);

  const executeWithFallback = useCallback(
    async (operation: () => Promise<any>, fallbackData?: any) => {
      try {
        return await operation();
      } catch (error) {
        handleError(error as Error, 'executeWithFallback');
        return fallbackData;
      }
    },
    [handleError],
  );

  return {
    handleError,
    executeWithFallback,
    logger,
  };
}

// HOC que combina Error Boundary com otimizações de performance
export function withIntegratedOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    enableErrorBoundary?: boolean;
    enableRenderOptimization?: boolean;
    enableAsyncErrorHandling?: boolean;
  },
): React.ComponentType<P> {
  // Por enquanto, retorna o componente original
  // TODO: Implementar Error Boundary quando os tipos estiverem corretos
  return Component;
}

// TODO: Adicionar exemplo de uso após corrigir os tipos

// Configuração para inicialização da aplicação
export async function initializeErrorPerformanceSystems(): Promise<void> {
  const manager = ErrorPerformanceManager.getInstance();
  await manager.initialize();

  // Configurar cleanup automático
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      manager.cleanup();
    });
  }

  // Em desenvolvimento, expor manager no console para debug
  if (process.env.NODE_ENV === 'development') {
    (window as any).__errorPerformanceManager = manager;
  }
}

export default ErrorPerformanceManager;
