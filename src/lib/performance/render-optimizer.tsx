import React, {
  memo,
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
  ComponentType,
  PropsWithChildren,
} from 'react';
import { logger } from '../logging/centralized-logger';

// Configuração do otimizador de renders
interface RenderOptimizerConfig {
  enableLogging: boolean;
  enableProfiling: boolean;
  slowRenderThreshold: number;
  maxRenderCount: number;
  renderCountWindow: number;
}

const DEFAULT_CONFIG: RenderOptimizerConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  enableProfiling: process.env.NODE_ENV === 'development',
  slowRenderThreshold: 16, // 16ms para 60fps
  maxRenderCount: 10,
  renderCountWindow: 1000, // 1 segundo
};

// Interface para estatísticas de render
interface RenderStats {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
  lastRenderTime: number;
  propsChanges: Array<{
    timestamp: number;
    changedProps: string[];
  }>;
}

// Classe para monitorar renders
class RenderMonitor {
  private static instance: RenderMonitor;
  private config: RenderOptimizerConfig;
  private renderStats = new Map<string, RenderStats>();
  private renderTimes = new Map<string, number[]>();

  constructor(config: Partial<RenderOptimizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(): RenderMonitor {
    if (!RenderMonitor.instance) {
      RenderMonitor.instance = new RenderMonitor();
    }
    return RenderMonitor.instance;
  }

  recordRender(componentName: string, renderTime: number, changedProps?: string[]): void {
    const now = Date.now();

    // Atualizar estatísticas
    let stats = this.renderStats.get(componentName);
    if (!stats) {
      stats = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        slowRenders: 0,
        lastRenderTime: now,
        propsChanges: [],
      };
      this.renderStats.set(componentName, stats);
    }

    stats.renderCount++;
    stats.totalRenderTime += renderTime;
    stats.averageRenderTime = stats.totalRenderTime / stats.renderCount;
    stats.lastRenderTime = now;

    if (renderTime > this.config.slowRenderThreshold) {
      stats.slowRenders++;
    }

    if (changedProps && changedProps.length > 0) {
      stats.propsChanges.push({
        timestamp: now,
        changedProps,
      });

      // Manter apenas últimas 50 mudanças
      if (stats.propsChanges.length > 50) {
        stats.propsChanges = stats.propsChanges.slice(-50);
      }
    }

    // Rastrear renders recentes para detectar renders excessivos
    let recentRenders = this.renderTimes.get(componentName) || [];
    recentRenders.push(now);

    // Filtrar renders dentro da janela de tempo
    recentRenders = recentRenders.filter((time) => now - time < this.config.renderCountWindow);

    this.renderTimes.set(componentName, recentRenders);

    // Alertar sobre renders excessivos
    if (recentRenders.length > this.config.maxRenderCount) {
      logger.warn(`Excessive renders detected in ${componentName}`, {
        operation: 'render-monitoring',
        component: 'RenderMonitor',
        metadata: {
          componentName,
          renderCount: recentRenders.length,
          timeWindow: this.config.renderCountWindow,
          averageRenderTime: stats.averageRenderTime,
          changedProps,
        },
      });
    }

    // Log de render lento
    if (renderTime > this.config.slowRenderThreshold && this.config.enableLogging) {
      logger.warn(`Slow render detected in ${componentName}`, {
        operation: 'slow-render',
        component: 'RenderMonitor',
        metadata: {
          componentName,
          renderTime,
          threshold: this.config.slowRenderThreshold,
          changedProps,
        },
      });
    }
  }

  getStats(componentName?: string): RenderStats | Map<string, RenderStats> {
    if (componentName) {
      return (
        this.renderStats.get(componentName) || {
          componentName,
          renderCount: 0,
          totalRenderTime: 0,
          averageRenderTime: 0,
          slowRenders: 0,
          lastRenderTime: 0,
          propsChanges: [],
        }
      );
    }
    return this.renderStats;
  }

  clearStats(componentName?: string): void {
    if (componentName) {
      this.renderStats.delete(componentName);
      this.renderTimes.delete(componentName);
    } else {
      this.renderStats.clear();
      this.renderTimes.clear();
    }
  }
}

const renderMonitor = RenderMonitor.getInstance();

// Hook para monitorar renders de um componente
export function useRenderMonitor(componentName: string) {
  const renderStartRef = useRef<number>();
  const prevPropsRef = useRef<any>();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      renderMonitor.recordRender(componentName, renderTime);
    }
  });

  const trackPropsChange = useCallback(
    (props: any) => {
      if (prevPropsRef.current) {
        const changedProps = getChangedProps(prevPropsRef.current, props);
        if (changedProps.length > 0 && renderStartRef.current) {
          const renderTime = performance.now() - renderStartRef.current;
          renderMonitor.recordRender(componentName, renderTime, changedProps);
        }
      }
      prevPropsRef.current = props;
    },
    [componentName],
  );

  return {
    trackPropsChange,
    getStats: () => renderMonitor.getStats(componentName),
    clearStats: () => renderMonitor.clearStats(componentName),
  };
}

// Função para comparar props e identificar mudanças
function getChangedProps(prevProps: any, nextProps: any): string[] {
  const changedProps: string[] = [];

  const allKeys = new Set([...Object.keys(prevProps || {}), ...Object.keys(nextProps || {})]);

  allKeys.forEach((key) => {
    if (prevProps[key] !== nextProps[key]) {
      changedProps.push(key);
    }
  });

  return changedProps;
}

// HOC para memoização inteligente
export function withSmartMemo<P extends object>(
  Component: ComponentType<P>,
  customCompare?: (prevProps: P, nextProps: P) => boolean,
) {
  const componentName = Component.displayName || Component.name || 'UnknownComponent';

  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    const startTime = performance.now();

    // Usar comparação customizada se fornecida
    if (customCompare) {
      const result = customCompare(prevProps, nextProps);
      const compareTime = performance.now() - startTime;

      if (compareTime > 1) {
        // Log se comparação demorar mais que 1ms
        logger.warn(`Slow props comparison in ${componentName}`, {
          operation: 'props-comparison',
          component: 'RenderOptimizer',
          metadata: { componentName, compareTime },
        });
      }

      return result;
    }

    // Comparação padrão otimizada
    const changedProps = getChangedProps(prevProps, nextProps);
    const hasChanges = changedProps.length > 0;

    if (hasChanges) {
      logger.debug(`Props changed in ${componentName}`, {
        operation: 'props-change',
        component: 'RenderOptimizer',
        metadata: { componentName, changedProps },
      });
    }

    return !hasChanges;
  });

  MemoizedComponent.displayName = `SmartMemo(${componentName})`;
  return MemoizedComponent;
}

// Hook para memoização estável de objetos
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  compare?: (prev: T, next: T) => boolean,
): T {
  const prevValueRef = useRef<T>();
  const prevDepsRef = useRef<React.DependencyList>();

  return useMemo(() => {
    // Verificar se dependências mudaram
    const depsChanged =
      !prevDepsRef.current ||
      deps.length !== prevDepsRef.current.length ||
      deps.some((dep, index) => dep !== prevDepsRef.current![index]);

    if (!depsChanged && prevValueRef.current !== undefined) {
      return prevValueRef.current;
    }

    const newValue = factory();

    // Usar comparação customizada se fornecida
    if (compare && prevValueRef.current !== undefined) {
      if (compare(prevValueRef.current, newValue)) {
        return prevValueRef.current;
      }
    }

    prevValueRef.current = newValue;
    prevDepsRef.current = deps;

    return newValue;
  }, deps);
}

// Hook para callbacks estáveis
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  const callbackRef = useRef<T>(callback);

  // Atualizar referência quando dependências mudarem
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  // Retornar callback estável
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// Hook para valores derivados com memoização profunda
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const prevDepsRef = useRef<React.DependencyList>();
  const valueRef = useRef<T>();

  return useMemo(() => {
    // Comparação profunda das dependências
    if (prevDepsRef.current && deepEqual(deps, prevDepsRef.current)) {
      return valueRef.current!;
    }

    const newValue = factory();
    prevDepsRef.current = deps;
    valueRef.current = newValue;

    return newValue;
  }, deps);
}

// Função para comparação profunda
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

// Hook para otimizar listas grandes
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5,
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
}

// Componente para debug de renders
export function RenderDebugger({ children, name }: PropsWithChildren<{ name: string }>) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  renderCount.current++;
  const now = Date.now();
  const timeSinceLastRender = now - lastRenderTime.current;
  lastRenderTime.current = now;

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `🔄 ${name} rendered ${renderCount.current} times (${timeSinceLastRender}ms since last)`,
    );
  }

  return <>{children}</>;
}

// Hook para detectar renders desnecessários
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Hook para obter estatísticas de render
export function useRenderStats() {
  return {
    getAllStats: () => renderMonitor.getStats(),
    getComponentStats: (componentName: string) => renderMonitor.getStats(componentName),
    clearAllStats: () => renderMonitor.clearStats(),
    clearComponentStats: (componentName: string) => renderMonitor.clearStats(componentName),
  };
}

// Componente wrapper para otimização automática
export function OptimizedComponent<P extends object>({
  component: Component,
  props,
  memoize = true,
  debug = false,
}: {
  component: ComponentType<P>;
  props: P;
  memoize?: boolean;
  debug?: boolean;
}) {
  const componentName = Component.displayName || Component.name || 'UnknownComponent';

  const MemoizedComponent = useMemo(() => {
    return memoize ? withSmartMemo(Component) : Component;
  }, [Component, memoize]);

  if (debug) {
    return (
      <RenderDebugger name={componentName}>
        <MemoizedComponent {...(props as any)} />
      </RenderDebugger>
    );
  }

  return <MemoizedComponent {...(props as any)} />;
}

// Exportar instância do monitor para uso direto
export { renderMonitor };
