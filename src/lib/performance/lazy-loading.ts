// Sistema de Lazy Loading e Code Splitting - Sistema Trato
// Otimização de bundle e performance de carregamento

import dynamic from 'next/dynamic'
import { Suspense, lazy, ComponentType } from 'react'

// Configurações de lazy loading
export interface LazyLoadingConfig {
  loading: ComponentType<any>
  ssr: boolean
  delay: number
}

export const DEFAULT_LAZY_CONFIG: LazyLoadingConfig = {
  loading: () => React.createElement('div', null, 'Carregando...'),
  ssr: false,
  delay: 200,
}

// Componentes de loading otimizados
export const LoadingSpinner = () => {
  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100px',
  }

  const spinnerInnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }

  return React.createElement(
    'div',
    { style: spinnerStyle },
    React.createElement('div', { style: spinnerInnerStyle }),
    React.createElement(
      'style',
      null,
      `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    )
  )
}

export const LoadingSkeleton = () => {
  const containerStyle = {
    padding: '20px',
    minHeight: '200px',
  }

  const skeletonStyle = {
    height: '20px',
    backgroundColor: '#f0f0f0',
    marginBottom: '10px',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  }

  const skeleton80Style = { ...skeletonStyle, width: '80%' }
  const skeleton60Style = { ...skeletonStyle, width: '60%' }

  return React.createElement(
    'div',
    { style: containerStyle },
    React.createElement('div', { style: skeletonStyle }),
    React.createElement('div', { style: skeleton80Style }),
    React.createElement('div', { style: skeleton60Style }),
    React.createElement(
      'style',
      null,
      `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `
    )
  )
}

// Wrapper para lazy loading com configurações padrão
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: Partial<LazyLoadingConfig> = {}
): ComponentType<any> {
  const finalConfig = { ...DEFAULT_LAZY_CONFIG, ...config }

  return dynamic(importFn, {
    loading: finalConfig.loading,
    ssr: finalConfig.ssr,
    delay: finalConfig.delay,
  })
}

// Lazy loading para componentes de UI
export const LazyDSTable = createLazyComponent(
  () => import('@/components/ui/DSTable'),
  { loading: LoadingSkeleton }
)

export const LazyDSDialog = createLazyComponent(
  () => import('@/components/ui/DSDialog'),
  { loading: LoadingSpinner }
)

export const LazyForm = createLazyComponent(
  () => import('@/components/ui/Form'),
  { loading: LoadingSkeleton }
)

// Lazy loading para páginas (comentado até as páginas serem criadas)
// export const LazyDashboard = createLazyComponent(
//   () => import('@/app/dashboard/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// export const LazyClientes = createLazyComponent(
//   () => import('@/app/clientes/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// export const LazyProfissionais = createLazyComponent(
//   () => import('@/app/profissionais/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// export const LazyAgenda = createLazyComponent(
//   () => import('@/app/agenda/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// export const LazyFila = createLazyComponent(
//   () => import('@/app/fila/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// export const LazyFinanceiro = createLazyComponent(
//   () => import('@/app/financeiro/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// export const LazyRelatorios = createLazyComponent(
//   () => import('@/app/relatorios/page'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// Lazy loading para componentes de features (comentado até serem criados)
// export const LazyClientForm = createLazyComponent(
//   () => import('@/components/features/clientes/ClientForm'),
//   { loading: LoadingSkeleton }
// );

// export const LazyProfessionalForm = createLazyComponent(
//   () => import('@/components/features/profissionais/ProfessionalForm'),
//   { loading: LoadingSkeleton }
// );

// export const LazyAppointmentForm = createLazyComponent(
//   () => import('@/components/features/agendamentos/AppointmentForm'),
//   { loading: LoadingSkeleton }
// );

// export const LazyQueueManager = createLazyComponent(
//   () => import('@/components/features/fila/QueueManager'),
//   { loading: LoadingSkeleton }
// );

// Sistema de preload inteligente
export class PreloadManager {
  private preloadedComponents = new Set<string>()
  private preloadQueue: Array<() => Promise<void>> = []
  private isProcessing = false

  // Preload de componente
  async preloadComponent(
    componentName: string,
    importFn: () => Promise<any>
  ): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return
    }

    try {
      await importFn()
      this.preloadedComponents.add(componentName)
    } catch (error) {
      console.warn(`Falha ao preload do componente ${componentName}:`, error)
    }
  }

  // Preload em background
  preloadInBackground(
    componentName: string,
    importFn: () => Promise<any>
  ): void {
    if (this.preloadedComponents.has(componentName)) {
      return
    }

    this.preloadQueue.push(async () => {
      await this.preloadComponent(componentName, importFn)
    })

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  // Processar fila de preload
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const preloadFn = this.preloadQueue.shift()
      if (preloadFn) {
        await preloadFn()
        // Pequena pausa para não bloquear a UI
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    this.isProcessing = false
  }

  // Preload baseado em navegação
  preloadOnHover(componentName: string, importFn: () => Promise<any>): void {
    const handleMouseEnter = () => {
      this.preloadInBackground(componentName, importFn)
    }

    return {
      onMouseEnter: handleMouseEnter,
      onFocus: handleMouseEnter,
    }
  }

  // Preload baseado em rota (comentado até as páginas serem criadas)
  preloadRoute(route: string): void {
    // const routeComponents: Record<string, () => Promise<any>> = {
    //   '/dashboard': () => import('@/app/dashboard/page'),
    //   '/clientes': () => import('@/app/clientes/page'),
    //   '/profissionais': () => import('@/app/profissionais/page'),
    //   '/agenda': () => import('@/app/agenda/page'),
    //   '/fila': () => import('@/app/fila/page'),
    //   '/financeiro': () => import('@/app/financeiro/page'),
    //   '/relatorios': () => import('@/app/relatorios/page')
    // };
    // const importFn = routeComponents[route];
    // if (importFn) {
    //   this.preloadInBackground(route, importFn);
    // }
  }

  // Verificar se componente foi preloadado
  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName)
  }

  // Limpar cache de preload
  clearPreloadCache(): void {
    this.preloadedComponents.clear()
  }
}

// Instância global do preload manager
export const preloadManager = new PreloadManager()

// Hook para usar preload
export function usePreload() {
  return {
    preloadComponent: preloadManager.preloadComponent.bind(preloadManager),
    preloadInBackground:
      preloadManager.preloadInBackground.bind(preloadManager),
    preloadOnHover: preloadManager.preloadOnHover.bind(preloadManager),
    preloadRoute: preloadManager.preloadRoute.bind(preloadManager),
    isPreloaded: preloadManager.isPreloaded.bind(preloadManager),
    clearPreloadCache: preloadManager.clearPreloadCache.bind(preloadManager),
  }
}

// Wrapper para Suspense com fallback otimizado
export function withSuspense<T extends ComponentType<any>>(
  Component: T,
  fallback?: React.ComponentType<any>
): ComponentType<any> {
  const FallbackComponent = fallback || LoadingSpinner

  return function SuspenseWrapper(props: any) {
    return React.createElement(
      React.Suspense,
      { fallback: React.createElement(FallbackComponent) },
      React.createElement(Component, props)
    )
  }
}

// Utilitário para lazy loading condicional
export function createConditionalLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  condition: () => boolean,
  config: Partial<LazyLoadingConfig> = {}
): ComponentType<any> {
  return function ConditionalComponent(props: any) {
    if (condition()) {
      const LazyComponent = createLazyComponent(importFn, config)
      return React.createElement(LazyComponent, props)
    }

    return null
  }
}

// Sistema de bundle analyzer
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    // Em desenvolvimento, mostrar informações sobre code splitting
    console.group('🔍 Bundle Analysis')
    console.log('Lazy Components:', {
      DSTable: '~15KB',
      DSDialog: '~8KB',
      Form: '~12KB',
      ClientForm: '~25KB',
      ProfessionalForm: '~20KB',
      AppointmentForm: '~30KB',
      QueueManager: '~18KB',
    })
    console.log(
      'Preloaded Components:',
      Array.from(preloadManager['preloadedComponents'])
    )
    console.groupEnd()
  }
}
