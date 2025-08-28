// Sistema de Auditoria de Cache - Sistema Trato
// Otimização de performance e gerenciamento de memória

export interface CacheMetrics {
  queryCount: number;
  mutationCount: number;
  cacheSize: number;
  memoryUsage: number;
  hitRate: number;
  staleTime: number;
  gcTime: number;
}

export interface CacheOptimization {
  queryKey: string;
  currentStaleTime: number;
  recommendedStaleTime: number;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
  queryTime: number;
  renderTime: number;
  bundleSize: number;
  ttf: number; // Time to First
  tti: number; // Time to Interactive
}

class CacheAuditor {
  private metrics: CacheMetrics[] = [];
  private queryTimes: Map<string, number[]> = new Map();
  private renderTimes: Map<string, number[]> = new Map();
  private cacheHits: Map<string, number> = new Map();
  private cacheMisses: Map<string, number> = new Map();

  // Configurações recomendadas por tipo de query
  private readonly recommendedStaleTimes = {
    // Dados estáticos (raramente mudam)
    unidades: 300000, // 5 minutos
    servicos: 300000, // 5 minutos
    categorias: 600000, // 10 minutos

    // Dados semi-estáticos (mudam ocasionalmente)
    profissionais: 180000, // 3 minutos
    clientes: 180000, // 3 minutos

    // Dados dinâmicos (mudam frequentemente)
    agendamentos: 60000, // 1 minuto
    fila: 30000, // 30 segundos
    financeiro: 120000, // 2 minutos

    // Dados em tempo real
    notificacoes: 15000, // 15 segundos
    status: 10000, // 10 segundos
  };

  // Registrar métricas de query
  recordQuery(queryKey: string, duration: number, isCacheHit: boolean) {
    if (!this.queryTimes.has(queryKey)) {
      this.queryTimes.set(queryKey, []);
    }
    this.queryTimes.get(queryKey)!.push(duration);

    if (isCacheHit) {
      this.cacheHits.set(queryKey, (this.cacheHits.get(queryKey) || 0) + 1);
    } else {
      this.cacheMisses.set(queryKey, (this.cacheMisses.get(queryKey) || 0) + 1);
    }
  }

  // Registrar métricas de renderização
  recordRender(componentName: string, duration: number) {
    if (!this.renderTimes.has(componentName)) {
      this.renderTimes.set(componentName, []);
    }
    this.renderTimes.get(componentName)!.push(duration);
  }

  // Calcular hit rate para uma query específica
  getHitRate(queryKey: string): number {
    const hits = this.cacheHits.get(queryKey) || 0;
    const misses = this.cacheMisses.get(queryKey) || 0;
    const total = hits + misses;

    return total > 0 ? (hits / total) * 100 : 0;
  }

  // Calcular tempo médio de query
  getAverageQueryTime(queryKey: string): number {
    const times = this.queryTimes.get(queryKey);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Calcular tempo médio de renderização
  getAverageRenderTime(componentName: string): number {
    const times = this.renderTimes.get(componentName);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Analisar otimizações de cache
  analyzeCacheOptimizations(): CacheOptimization[] {
    const optimizations: CacheOptimization[] = [];

    for (const [queryKey, times] of Array.from(this.queryTimes.entries())) {
      const hitRate = this.getHitRate(queryKey);
      const avgTime = this.getAverageQueryTime(queryKey);
      const currentStaleTime = this.getCurrentStaleTime(queryKey);
      const recommendedStaleTime = this.getRecommendedStaleTime(queryKey);

      // Identificar queries com baixo hit rate
      if (hitRate < 50 && avgTime > 100) {
        optimizations.push({
          queryKey,
          currentStaleTime,
          recommendedStaleTime,
          reason: 'Baixo hit rate e tempo de resposta alto',
          impact: 'high',
        });
      }

      // Identificar staleTime inadequado
      if (Math.abs(currentStaleTime - recommendedStaleTime) > recommendedStaleTime * 0.5) {
        optimizations.push({
          queryKey,
          currentStaleTime,
          recommendedStaleTime,
          reason: 'StaleTime muito diferente do recomendado',
          impact: 'medium',
        });
      }

      // Identificar queries muito frequentes
      if (times.length > 100 && avgTime < 50) {
        optimizations.push({
          queryKey,
          currentStaleTime,
          recommendedStaleTime,
          reason: 'Query executada muito frequentemente',
          impact: 'low',
        });
      }
    }

    return optimizations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  // Gerar relatório de performance
  generatePerformanceReport(): {
    cacheMetrics: CacheMetrics;
    optimizations: CacheOptimization[];
    recommendations: string[];
  } {
    const totalQueries = Array.from(this.queryTimes.values()).reduce(
      (sum, times) => sum + times.length,
      0,
    );

    const totalMutations = 0; // Implementar tracking de mutations

    const totalCacheHits = Array.from(this.cacheHits.values()).reduce((sum, hits) => sum + hits, 0);

    const totalCacheMisses = Array.from(this.cacheMisses.values()).reduce(
      (sum, misses) => sum + misses,
      0,
    );

    const overallHitRate =
      totalQueries > 0 ? (totalCacheHits / (totalCacheHits + totalCacheMisses)) * 100 : 0;

    const cacheMetrics: CacheMetrics = {
      queryCount: totalQueries,
      mutationCount: totalMutations,
      cacheSize: this.queryTimes.size,
      memoryUsage: this.estimateMemoryUsage(),
      hitRate: overallHitRate,
      staleTime: 0, // Implementar cálculo
      gcTime: 0, // Implementar cálculo
    };

    const optimizations = this.analyzeCacheOptimizations();
    const recommendations = this.generateRecommendations(optimizations);

    return {
      cacheMetrics,
      optimizations,
      recommendations,
    };
  }

  // Gerar recomendações baseadas nas otimizações
  private generateRecommendations(optimizations: CacheOptimization[]): string[] {
    const recommendations: string[] = [];

    const highImpactCount = optimizations.filter((o) => o.impact === 'high').length;
    if (highImpactCount > 0) {
      recommendations.push(
        `Identificamos ${highImpactCount} otimizações de alto impacto que podem melhorar significativamente a performance.`,
      );
    }

    const lowHitRateQueries = optimizations.filter((o) => o.reason.includes('Baixo hit rate'));
    if (lowHitRateQueries.length > 0) {
      recommendations.push('Considere aumentar o staleTime para queries com baixo hit rate.');
    }

    const frequentQueries = optimizations.filter((o) => o.reason.includes('muito frequentemente'));
    if (frequentQueries.length > 0) {
      recommendations.push('Implemente debouncing para queries executadas muito frequentemente.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Cache está otimizado. Continue monitorando para manter a performance.');
    }

    return recommendations;
  }

  // Obter staleTime atual (placeholder)
  private getCurrentStaleTime(queryKey: string): number {
    // Em produção, isso viria do React Query
    return 300000; // 5 minutos padrão
  }

  // Obter staleTime recomendado
  private getRecommendedStaleTime(queryKey: string): number {
    // Extrair categoria da query key
    const category = this.extractCategoryFromQueryKey(queryKey);
    return (this.recommendedStaleTimes as any)[category] || 300000;
  }

  // Extrair categoria da query key
  private extractCategoryFromQueryKey(queryKey: string): string {
    if (Array.isArray(queryKey)) {
      return queryKey[0] || 'default';
    }
    return queryKey.split('/')[0] || 'default';
  }

  // Estimar uso de memória
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    // Estimar tamanho dos dados em cache
    for (const [queryKey, times] of Array.from(this.queryTimes.entries())) {
      totalSize += queryKey.length + times.length * 8; // 8 bytes por timestamp
    }

    return totalSize;
  }

  // Limpar métricas antigas
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [queryKey, times] of Array.from(this.queryTimes.entries())) {
      const filteredTimes = times.filter((time) => now - time < maxAge);
      if (filteredTimes.length === 0) {
        this.queryTimes.delete(queryKey);
        this.cacheHits.delete(queryKey);
        this.cacheMisses.delete(queryKey);
      } else {
        this.queryTimes.set(queryKey, filteredTimes);
      }
    }

    for (const [componentName, times] of Array.from(this.renderTimes.entries())) {
      const filteredTimes = times.filter((time) => now - time < maxAge);
      if (filteredTimes.length === 0) {
        this.renderTimes.delete(componentName);
      } else {
        this.renderTimes.set(componentName, filteredTimes);
      }
    }
  }

  // Reset completo
  reset() {
    this.metrics = [];
    this.queryTimes.clear();
    this.renderTimes.clear();
    this.cacheHits.clear();
    this.cacheMisses.clear();
  }
}

// Instância global
export const cacheAuditor = new CacheAuditor();

// Hook para usar o auditor
export function useCacheAuditor() {
  return {
    recordQuery: cacheAuditor.recordQuery.bind(cacheAuditor),
    recordRender: cacheAuditor.recordRender.bind(cacheAuditor),
    getHitRate: cacheAuditor.getHitRate.bind(cacheAuditor),
    getAverageQueryTime: cacheAuditor.getAverageQueryTime.bind(cacheAuditor),
    getAverageRenderTime: cacheAuditor.getAverageRenderTime.bind(cacheAuditor),
    analyzeCacheOptimizations: cacheAuditor.analyzeCacheOptimizations.bind(cacheAuditor),
    generatePerformanceReport: cacheAuditor.generatePerformanceReport.bind(cacheAuditor),
    cleanup: cacheAuditor.cleanup.bind(cacheAuditor),
    reset: cacheAuditor.reset.bind(cacheAuditor),
  };
}

// Utilitários para performance
export function measureQueryTime<T>(queryFn: () => Promise<T>, queryKey: string): Promise<T> {
  const startTime = performance.now();

  return queryFn().finally(() => {
    const duration = performance.now() - startTime;
    cacheAuditor.recordQuery(queryKey, duration, false); // Assumir cache miss
  });
}

export function measureRenderTime(componentName: string, renderFn: () => void) {
  const startTime = performance.now();

  renderFn();

  const duration = performance.now() - startTime;
  cacheAuditor.recordRender(componentName, duration);
}
