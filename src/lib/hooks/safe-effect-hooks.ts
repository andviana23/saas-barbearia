import React, { useEffect, useRef, useCallback, useMemo, DependencyList } from 'react';
import { logger } from '../logging/centralized-logger';

// Configuração para detecção de loops
interface LoopDetectionConfig {
  maxExecutions: number;
  timeWindow: number; // em ms
  enableLogging: boolean;
}

const DEFAULT_LOOP_CONFIG: LoopDetectionConfig = {
  maxExecutions: 10,
  timeWindow: 1000, // 1 segundo
  enableLogging: process.env.NODE_ENV === 'development',
};

// Rastreamento de execuções de effects
interface EffectExecution {
  timestamp: number;
  stackTrace: string;
  dependencies: any[];
}

class EffectLoopDetector {
  private static instance: EffectLoopDetector;
  private executions = new Map<string, EffectExecution[]>();
  private config: LoopDetectionConfig;

  constructor(config: Partial<LoopDetectionConfig> = {}) {
    this.config = { ...DEFAULT_LOOP_CONFIG, ...config };
  }

  static getInstance(): EffectLoopDetector {
    if (!EffectLoopDetector.instance) {
      EffectLoopDetector.instance = new EffectLoopDetector();
    }
    return EffectLoopDetector.instance;
  }

  checkForLoop(effectId: string, dependencies: any[]): boolean {
    const now = Date.now();
    const executions = this.executions.get(effectId) || [];

    // Filtrar execuções dentro da janela de tempo
    const recentExecutions = executions.filter(
      (exec) => now - exec.timestamp < this.config.timeWindow,
    );

    // Adicionar execução atual
    const currentExecution: EffectExecution = {
      timestamp: now,
      stackTrace: new Error().stack || '',
      dependencies: [...dependencies],
    };

    recentExecutions.push(currentExecution);
    this.executions.set(effectId, recentExecutions);

    // Verificar se excedeu o limite
    if (recentExecutions.length > this.config.maxExecutions) {
      if (this.config.enableLogging) {
        logger.error(`Potential infinite loop detected in useEffect`, {
          operation: 'effect-loop-detection',
          component: 'EffectLoopDetector',
          metadata: {
            effectId,
            executionCount: recentExecutions.length,
            timeWindow: this.config.timeWindow,
            recentDependencies: recentExecutions.slice(-3).map((e) => e.dependencies),
          },
        });
      }
      return true;
    }

    return false;
  }

  clearEffectHistory(effectId: string): void {
    this.executions.delete(effectId);
  }

  getStats(): {
    totalEffects: number;
    activeEffects: number;
    suspiciousEffects: string[];
  } {
    const now = Date.now();
    let activeEffects = 0;
    const suspiciousEffects: string[] = [];

    this.executions.forEach((executions, effectId) => {
      const recentExecutions = executions.filter(
        (exec) => now - exec.timestamp < this.config.timeWindow,
      );

      if (recentExecutions.length > 0) {
        activeEffects++;
      }

      if (recentExecutions.length > this.config.maxExecutions / 2) {
        suspiciousEffects.push(effectId);
      }
    });

    return {
      totalEffects: this.executions.size,
      activeEffects,
      suspiciousEffects,
    };
  }
}

const loopDetector = EffectLoopDetector.getInstance();

// Função para criar ID único do effect baseado no stack trace
function createEffectId(componentName?: string): string {
  const stack = new Error().stack || '';
  const stackLines = stack.split('\n').slice(2, 4); // Pegar linhas relevantes
  const stackHash = stackLines.join('').replace(/\s+/g, '').slice(0, 50);
  return `${componentName || 'unknown'}_${stackHash}_${Date.now()}`;
}

// Hook useEffect seguro com detecção de loops
export function useSafeEffect(
  effect: React.EffectCallback,
  deps?: DependencyList,
  componentName?: string,
): void {
  const effectIdRef = useRef<string>();
  const depsRef = useRef<DependencyList | undefined>(deps);
  const executionCountRef = useRef(0);

  // Criar ID único na primeira execução
  if (!effectIdRef.current) {
    effectIdRef.current = createEffectId(componentName);
  }

  // Verificar mudanças nas dependências
  const depsChanged = useMemo(() => {
    if (!deps && !depsRef.current) return false;
    if (!deps || !depsRef.current) return true;
    if (deps.length !== depsRef.current.length) return true;

    return deps.some((dep, index) => dep !== depsRef.current![index]);
  }, [deps]);

  useEffect(() => {
    const effectId = effectIdRef.current!;
    executionCountRef.current++;

    // Verificar loop apenas se as dependências mudaram
    if (depsChanged && deps) {
      const isLoop = loopDetector.checkForLoop(effectId, [...deps]);

      if (isLoop) {
        logger.critical(`Infinite loop prevented in useEffect`, {
          operation: 'effect-loop-prevention',
          component: componentName || 'UnknownComponent',
          metadata: {
            effectId,
            executionCount: executionCountRef.current,
            dependencies: deps,
          },
        });
        return; // Prevenir execução do effect
      }
    }

    // Atualizar referência das dependências
    depsRef.current = deps;

    // Executar effect original
    return effect();
  }, deps);

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      if (effectIdRef.current) {
        loopDetector.clearEffectHistory(effectIdRef.current);
      }
    };
  }, []);
}

// Hook para debounce de effects
export function useDebouncedEffect(
  effect: React.EffectCallback,
  deps: DependencyList,
  delay: number,
  componentName?: string,
): void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useSafeEffect(
    () => {
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Criar novo timeout
      timeoutRef.current = setTimeout(() => {
        const cleanup = effect();

        // Se effect retornar cleanup, executar quando componente desmontar
        if (cleanup) {
          return cleanup;
        }
      }, delay);

      // Cleanup do timeout
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    },
    deps,
    componentName,
  );
}

// Hook para throttle de effects
export function useThrottledEffect(
  effect: React.EffectCallback,
  deps: DependencyList,
  delay: number,
  componentName?: string,
): void {
  const lastExecutionRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useSafeEffect(
    () => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecutionRef.current;

      if (timeSinceLastExecution >= delay) {
        // Executar imediatamente
        lastExecutionRef.current = now;
        return effect();
      } else {
        // Agendar execução
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastExecutionRef.current = Date.now();
          const cleanup = effect();

          if (cleanup) {
            return cleanup;
          }
        }, delay - timeSinceLastExecution);

        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }
    },
    deps,
    componentName,
  );
}

// Hook para effects condicionais seguros
export function useConditionalEffect(
  effect: React.EffectCallback,
  deps: DependencyList,
  condition: boolean,
  componentName?: string,
): void {
  useSafeEffect(
    () => {
      if (condition) {
        return effect();
      }
    },
    [...deps, condition],
    componentName,
  );
}

// Hook para effects com retry automático
export function useRetryEffect(
  effect: () => Promise<void> | void,
  deps: DependencyList,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  componentName?: string,
): void {
  const retryCountRef = useRef(0);

  useSafeEffect(
    () => {
      const executeWithRetry = async () => {
        try {
          await effect();
          retryCountRef.current = 0; // Reset contador em caso de sucesso
        } catch (error) {
          retryCountRef.current++;

          logger.warn(
            `Effect execution failed, attempt ${retryCountRef.current}/${maxRetries}`,
            {
              operation: 'effect-retry',
              component: componentName || 'UnknownComponent',
              metadata: {
                attempt: retryCountRef.current,
                maxRetries,
                error: (error as Error).message,
              },
            },
            error as Error,
          );

          if (retryCountRef.current < maxRetries) {
            // Retry com delay
            setTimeout(() => {
              executeWithRetry();
            }, retryDelay * retryCountRef.current); // Backoff exponencial
          } else {
            logger.error(
              `Effect failed after ${maxRetries} attempts`,
              {
                operation: 'effect-retry-exhausted',
                component: componentName || 'UnknownComponent',
                metadata: { maxRetries },
              },
              error as Error,
            );
          }
        }
      };

      executeWithRetry();
    },
    deps,
    componentName,
  );
}

// Hook para monitorar performance de effects
export function usePerformanceEffect(
  effect: React.EffectCallback,
  deps: DependencyList,
  componentName?: string,
  warningThreshold: number = 100, // ms
): void {
  useSafeEffect(
    () => {
      const startTime = performance.now();

      const cleanup = effect();

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > warningThreshold) {
        logger.warn(`Slow effect detected`, {
          operation: 'effect-performance',
          component: componentName || 'UnknownComponent',
          metadata: {
            duration,
            threshold: warningThreshold,
            dependencies: deps,
          },
        });
      }

      return cleanup;
    },
    deps,
    componentName,
  );
}

// Hook para effects que dependem de refs
export function useRefEffect<T>(
  effect: (element: T) => void | (() => void),
  ref: React.RefObject<T>,
  componentName?: string,
): void {
  useSafeEffect(
    () => {
      if (ref.current) {
        return effect(ref.current);
      }
    },
    [ref.current],
    componentName,
  );
}

// Hook para effects com dependências deep comparison
export function useDeepEffect(
  effect: React.EffectCallback,
  deps: DependencyList,
  componentName?: string,
): void {
  const prevDepsRef = useRef<DependencyList>();

  const depsChanged = useMemo(() => {
    if (!prevDepsRef.current) return true;

    return !deepEqual(deps, prevDepsRef.current);
  }, [deps]);

  useSafeEffect(
    () => {
      if (depsChanged) {
        prevDepsRef.current = deps;
        return effect();
      }
    },
    [depsChanged],
    componentName,
  );
}

// Função auxiliar para comparação profunda
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

// Hook para obter estatísticas dos effects
export function useEffectStats() {
  return useCallback(() => {
    return loopDetector.getStats();
  }, []);
}

// HOC para adicionar proteção automática contra loops
export function withSafeEffects<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) {
  return function SafeEffectComponent(props: P) {
    const stats = useEffectStats();

    useEffect(() => {
      const currentStats = stats();

      if (currentStats.suspiciousEffects.length > 0) {
        logger.warn(`Component has suspicious effects`, {
          operation: 'component-effect-monitoring',
          component: componentName || WrappedComponent.displayName || WrappedComponent.name,
          metadata: currentStats,
        });
      }
    }, [stats]);

    return React.createElement(WrappedComponent, props);
  };
}
