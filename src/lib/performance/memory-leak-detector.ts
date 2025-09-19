import { useEffect, useRef, useCallback, useState } from 'react';
import { logger } from '../logging/centralized-logger';

// Interface para rastreamento de recursos
interface ResourceTracker {
  id: string;
  type: 'listener' | 'interval' | 'timeout' | 'subscription' | 'observer' | 'websocket';
  cleanup: () => void;
  createdAt: number;
  component?: string;
}

// Classe para gerenciar recursos e detectar vazamentos
class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private resources = new Map<string, ResourceTracker>();
  private componentResources = new Map<string, Set<string>>();
  private memoryCheckInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Verificar memória a cada 30 segundos
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
      this.checkStaleResources();
    }, 30000);

    logger.info('Memory leak detector started', {
      operation: 'memory-monitoring',
      component: 'MemoryLeakDetector',
    });
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = undefined;
    }

    logger.info('Memory leak detector stopped', {
      operation: 'memory-monitoring',
      component: 'MemoryLeakDetector',
    });
  }

  // Registrar um recurso para rastreamento
  registerResource(
    id: string,
    type: ResourceTracker['type'],
    cleanup: () => void,
    component?: string,
  ): void {
    const resource: ResourceTracker = {
      id,
      type,
      cleanup,
      createdAt: Date.now(),
      component,
    };

    this.resources.set(id, resource);

    if (component) {
      if (!this.componentResources.has(component)) {
        this.componentResources.set(component, new Set());
      }
      this.componentResources.get(component)!.add(id);
    }

    logger.debug(`Resource registered: ${type}`, {
      operation: 'resource-registration',
      component: 'MemoryLeakDetector',
      metadata: { resourceId: id, resourceType: type, componentName: component },
    });
  }

  // Limpar um recurso específico
  cleanupResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (!resource) return false;

    try {
      resource.cleanup();
      this.resources.delete(id);

      // Remover da lista do componente
      if (resource.component) {
        const componentSet = this.componentResources.get(resource.component);
        if (componentSet) {
          componentSet.delete(id);
          if (componentSet.size === 0) {
            this.componentResources.delete(resource.component);
          }
        }
      }

      logger.debug(`Resource cleaned up: ${resource.type}`, {
        operation: 'resource-cleanup',
        component: 'MemoryLeakDetector',
        metadata: { resourceId: id, resourceType: resource.type },
      });

      return true;
    } catch (error) {
      logger.error(
        `Failed to cleanup resource: ${id}`,
        {
          operation: 'resource-cleanup',
          component: 'MemoryLeakDetector',
          metadata: { resourceId: id, resourceType: resource.type },
        },
        error as Error,
      );

      return false;
    }
  }

  // Limpar todos os recursos de um componente
  cleanupComponentResources(component: string): void {
    const resourceIds = this.componentResources.get(component);
    if (!resourceIds) return;

    const cleanedCount = Array.from(resourceIds).reduce((count, id) => {
      return this.cleanupResource(id) ? count + 1 : count;
    }, 0);

    logger.info(`Cleaned up component resources: ${component}`, {
      operation: 'component-cleanup',
      component: 'MemoryLeakDetector',
      metadata: { componentName: component, cleanedCount, totalCount: resourceIds.size },
    });
  }

  // Verificar uso de memória
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    try {
      // @ts-ignore - performance.memory pode não estar disponível em todos os browsers
      const memory = (performance as any).memory;

      if (memory) {
        const memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        };

        // Alertar se uso de memória estiver alto
        if (memoryInfo.usagePercentage > 80) {
          logger.warn('High memory usage detected', {
            operation: 'memory-check',
            component: 'MemoryLeakDetector',
            metadata: memoryInfo,
          });
        }

        // Log periódico do uso de memória
        logger.debug('Memory usage check', {
          operation: 'memory-check',
          component: 'MemoryLeakDetector',
          metadata: memoryInfo,
        });
      }
    } catch (error) {
      logger.error(
        'Failed to check memory usage',
        {
          operation: 'memory-check',
          component: 'MemoryLeakDetector',
        },
        error as Error,
      );
    }
  }

  // Verificar recursos antigos que podem ter vazado
  private checkStaleResources(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutos
    const staleResources: ResourceTracker[] = [];

    this.resources.forEach((resource) => {
      if (now - resource.createdAt > staleThreshold) {
        staleResources.push(resource);
      }
    });

    if (staleResources.length > 0) {
      logger.warn(`Found ${staleResources.length} stale resources`, {
        operation: 'stale-resource-check',
        component: 'MemoryLeakDetector',
        metadata: {
          staleCount: staleResources.length,
          totalResources: this.resources.size,
          staleResources: staleResources.map((r) => ({
            id: r.id,
            type: r.type,
            component: r.component,
            age: now - r.createdAt,
          })),
        },
      });
    }
  }

  // Obter estatísticas dos recursos
  getResourceStats(): {
    totalResources: number;
    resourcesByType: Record<string, number>;
    resourcesByComponent: Record<string, number>;
    oldestResource?: { id: string; age: number };
  } {
    const resourcesByType: Record<string, number> = {};
    const resourcesByComponent: Record<string, number> = {};
    let oldestResource: { id: string; age: number } | undefined;
    const now = Date.now();

    this.resources.forEach((resource) => {
      // Por tipo
      resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;

      // Por componente
      if (resource.component) {
        resourcesByComponent[resource.component] =
          (resourcesByComponent[resource.component] || 0) + 1;
      }

      // Mais antigo
      const age = now - resource.createdAt;
      if (!oldestResource || age > oldestResource.age) {
        oldestResource = { id: resource.id, age };
      }
    });

    return {
      totalResources: this.resources.size,
      resourcesByType,
      resourcesByComponent,
      oldestResource,
    };
  }

  // Forçar limpeza de todos os recursos
  forceCleanupAll(): void {
    const resourceIds = Array.from(this.resources.keys());
    let cleanedCount = 0;

    resourceIds.forEach((id) => {
      if (this.cleanupResource(id)) {
        cleanedCount++;
      }
    });

    logger.warn(`Force cleanup completed`, {
      operation: 'force-cleanup',
      component: 'MemoryLeakDetector',
      metadata: { cleanedCount, totalCount: resourceIds.length },
    });
  }
}

// Instância singleton
export const memoryLeakDetector = MemoryLeakDetector.getInstance();

// Hook para gerenciar recursos automaticamente
export function useResourceCleanup(componentName?: string) {
  const resourcesRef = useRef<Set<string>>(new Set());
  const componentNameRef = useRef(componentName || 'UnknownComponent');

  const registerResource = useCallback(
    (id: string, type: ResourceTracker['type'], cleanup: () => void) => {
      resourcesRef.current.add(id);
      memoryLeakDetector.registerResource(id, type, cleanup, componentNameRef.current);
    },
    [],
  );

  const cleanupResource = useCallback((id: string) => {
    resourcesRef.current.delete(id);
    return memoryLeakDetector.cleanupResource(id);
  }, []);

  // Cleanup automático quando componente desmonta
  useEffect(() => {
    return () => {
      resourcesRef.current.forEach((id) => {
        memoryLeakDetector.cleanupResource(id);
      });
      resourcesRef.current.clear();
    };
  }, []);

  return { registerResource, cleanupResource };
}

// Hook para event listeners seguros
export function useSafeEventListener(
  target: EventTarget | null,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
) {
  const { registerResource, cleanupResource } = useResourceCleanup();
  const handlerRef = useRef(handler);
  const resourceIdRef = useRef<string>();

  // Atualizar handler
  handlerRef.current = handler;

  useEffect(() => {
    if (!target) return;

    const wrappedHandler = (e: Event) => handlerRef.current(e);
    const resourceId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    target.addEventListener(event, wrappedHandler, options);

    registerResource(resourceId, 'listener', () => {
      target.removeEventListener(event, wrappedHandler, options);
    });

    resourceIdRef.current = resourceId;

    return () => {
      if (resourceIdRef.current) {
        cleanupResource(resourceIdRef.current);
      }
    };
  }, [target, event, options, registerResource, cleanupResource]);
}

// Hook para intervals seguros
export function useSafeInterval(callback: () => void, delay: number | null) {
  const { registerResource, cleanupResource } = useResourceCleanup();
  const callbackRef = useRef(callback);
  const resourceIdRef = useRef<string>();

  // Atualizar callback
  callbackRef.current = callback;

  useEffect(() => {
    if (delay === null) return;

    const resourceId = `interval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const intervalId = setInterval(() => callbackRef.current(), delay);

    registerResource(resourceId, 'interval', () => {
      clearInterval(intervalId);
    });

    resourceIdRef.current = resourceId;

    return () => {
      if (resourceIdRef.current) {
        cleanupResource(resourceIdRef.current);
      }
    };
  }, [delay, registerResource, cleanupResource]);
}

// Hook para timeouts seguros
export function useSafeTimeout(callback: () => void, delay: number | null) {
  const { registerResource, cleanupResource } = useResourceCleanup();
  const callbackRef = useRef(callback);
  const resourceIdRef = useRef<string>();

  // Atualizar callback
  callbackRef.current = callback;

  useEffect(() => {
    if (delay === null) return;

    const resourceId = `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const timeoutId = setTimeout(() => callbackRef.current(), delay);

    registerResource(resourceId, 'timeout', () => {
      clearTimeout(timeoutId);
    });

    resourceIdRef.current = resourceId;

    return () => {
      if (resourceIdRef.current) {
        cleanupResource(resourceIdRef.current);
      }
    };
  }, [delay, registerResource, cleanupResource]);
}

// Hook para WebSocket seguro
export function useSafeWebSocket(url: string | null) {
  const { registerResource, cleanupResource } = useResourceCleanup();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const resourceIdRef = useRef<string>();

  useEffect(() => {
    if (!url) return;

    const resourceId = `websocket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ws = new WebSocket(url);

    setSocket(ws);

    registerResource(resourceId, 'websocket', () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    });

    resourceIdRef.current = resourceId;

    return () => {
      if (resourceIdRef.current) {
        cleanupResource(resourceIdRef.current);
      }
      setSocket(null);
    };
  }, [url, registerResource, cleanupResource]);

  return socket;
}

// Inicializar detector automaticamente em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  memoryLeakDetector.startMonitoring();
}
