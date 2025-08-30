/**
 * Sistema de Feature Flags
 *
 * Controla ativação/desativação de funcionalidades de forma dinâmica
 * através de variáveis de ambiente e configurações remotas.
 *
 * @see docs/FEATURE_FLAGS.md para documentação completa
 */

import type { FeatureFlag } from './routes';

// ====================================
// TIPOS E INTERFACES
// ====================================

export interface FeatureFlagConfig {
  /** Nome da feature flag */
  flag: FeatureFlag;
  /** Se está habilitada por padrão */
  defaultEnabled: boolean;
  /** Descrição da funcionalidade */
  description: string;
  /** Versão em que foi introduzida */
  version?: string;
  /** Se está deprecated (será removida) */
  deprecated?: boolean;
  /** Data de remoção planejada */
  removalDate?: string;
  /** Dependências (outras flags necessárias) */
  dependencies?: FeatureFlag[];
  /** Ambientes onde está disponível */
  environments?: ('development' | 'staging' | 'production' | 'test')[];
}

// ====================================
// CONFIGURAÇÃO DAS FEATURE FLAGS
// ====================================

export const FEATURE_FLAGS_CONFIG: Record<FeatureFlag, FeatureFlagConfig> = {
  marketplace: {
    flag: 'marketplace',
    defaultEnabled: true,
    description: 'Marketplace de serviços externos',
    version: '1.0.0',
    environments: ['development', 'staging', 'production', 'test'],
  },

  multi_unidades: {
    flag: 'multi_unidades',
    defaultEnabled: false,
    description: 'Gestão de múltiplas unidades/filiais',
    version: '1.1.0',
    environments: ['development', 'staging', 'test'],
  },

  relatorios_avancados: {
    flag: 'relatorios_avancados',
    defaultEnabled: true,
    description: 'Relatórios com gráficos e análises detalhadas',
    version: '1.0.0',
    environments: ['development', 'staging', 'production', 'test'],
  },

  notificacoes_push: {
    flag: 'notificacoes_push',
    defaultEnabled: false,
    description: 'Notificações push para clientes e funcionários',
    version: '1.2.0',
    environments: ['development', 'staging'],
  },

  assinaturas: {
    flag: 'assinaturas',
    defaultEnabled: true,
    description: 'Sistema de assinaturas e planos recorrentes',
    version: '1.3.0',
    environments: ['development', 'staging', 'production'],
  },

  api_externa: {
    flag: 'api_externa',
    defaultEnabled: false,
    description: 'API pública para integrações externas',
    version: '1.4.0',
    environments: ['development'],
  },

  auditoria: {
    flag: 'auditoria',
    defaultEnabled: true,
    description: 'Log de auditoria e rastreamento de ações',
    version: '1.0.0',
    environments: ['development', 'staging', 'production'],
  },

  pos_integrado: {
    flag: 'pos_integrado',
    defaultEnabled: false,
    description: 'Integração com sistemas POS/PDV',
    version: '1.5.0',
    environments: ['development'],
  },

  agenda_avancada: {
    flag: 'agenda_avancada',
    defaultEnabled: true,
    description: 'Funcionalidades avançadas da agenda (recorrência, bloqueios)',
    version: '1.1.0',
    environments: ['development', 'staging', 'production'],
  },

  crm_avancado: {
    flag: 'crm_avancado',
    defaultEnabled: false,
    description: 'CRM avançado com campanhas e automações',
    version: '1.6.0',
    environments: ['development'],
  },
};

// ====================================
// FUNÇÕES UTILITÁRIAS
// ====================================

/**
 * Obtém o valor atual do ambiente
 */
function getCurrentEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Verifica se uma feature flag está habilitada via variável de ambiente
 */
function getEnvironmentFlagValue(flag: FeatureFlag): boolean | undefined {
  const envKey = `FEATURE_${flag.replace(/_/g, '_').toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue === undefined) return undefined;
  return envValue === 'true' || envValue === '1';
}

/**
 * Verifica se uma feature flag está disponível no ambiente atual
 */
export function isFeatureFlagAvailableInEnvironment(flag: FeatureFlag): boolean {
  const config = FEATURE_FLAGS_CONFIG[flag];
  if (!config) return false;
  if (!config.environments) return true;

  const currentEnv = getCurrentEnvironment() as 'development' | 'staging' | 'production' | 'test';
  return config.environments.includes(currentEnv);
}

/**
 * Verifica se uma feature flag está habilitada
 */
export function isFeatureFlagEnabled(flag: FeatureFlag): boolean {
  const config = FEATURE_FLAGS_CONFIG[flag];
  if (!config) return false;

  // Se não está disponível no ambiente atual, retorna false
  if (!isFeatureFlagAvailableInEnvironment(flag)) {
    return false;
  }

  // Verifica variável de ambiente primeiro (sobrescreve default)
  const envValue = getEnvironmentFlagValue(flag);
  if (envValue !== undefined) {
    return envValue;
  }

  // Verifica dependências
  if (config.dependencies) {
    const dependenciesMet = config.dependencies.every((dep) => isFeatureFlagEnabled(dep));
    if (!dependenciesMet) {
      return false;
    }
  }

  // Retorna valor padrão
  return config.defaultEnabled;
}

/**
 * Obtém todas as feature flags ativas
 */
export function getActiveFeatureFlags(): FeatureFlag[] {
  return Object.keys(FEATURE_FLAGS_CONFIG).filter((flag) =>
    isFeatureFlagEnabled(flag as FeatureFlag),
  ) as FeatureFlag[];
}

/**
 * Obtém configuração de uma feature flag
 */
export function getFeatureFlagConfig(flag: FeatureFlag): FeatureFlagConfig {
  return FEATURE_FLAGS_CONFIG[flag];
}

/**
 * Verifica se múltiplas feature flags estão habilitadas
 */
export function areFeatureFlagsEnabled(flags: FeatureFlag[]): boolean {
  return flags.every((flag) => isFeatureFlagEnabled(flag));
}

/**
 * Obtém flags habilitadas por categoria/padrão
 */
export function getFeatureFlagsByPattern(pattern: RegExp): FeatureFlag[] {
  return Object.keys(FEATURE_FLAGS_CONFIG).filter(
    (flag) => pattern.test(flag) && isFeatureFlagEnabled(flag as FeatureFlag),
  ) as FeatureFlag[];
}

// ====================================
// HOOKS PARA REACT (CLIENT-SIDE)
// ====================================

/**
 * Hook para verificar se uma feature flag está habilitada
 * Uso: const isMarketplaceEnabled = useFeatureFlag('marketplace');
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  // No servidor, usar a função direta
  if (typeof window === 'undefined') {
    return isFeatureFlagEnabled(flag);
  }

  // No cliente, você pode implementar cache/sincronização
  // Por enquanto, usar a função direta
  return isFeatureFlagEnabled(flag);
}

/**
 * Hook para obter todas as flags ativas
 */
export function useActiveFeatureFlags(): FeatureFlag[] {
  if (typeof window === 'undefined') {
    return getActiveFeatureFlags();
  }

  return getActiveFeatureFlags();
}

// ====================================
// COMPONENTES HELPER
// ====================================

interface FeatureFlagProps {
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para renderizar conteúdo baseado em feature flag
 *
 * @example
 * <FeatureFlag flag="marketplace">
 *   <MarketplaceComponent />
 * </FeatureFlag>
 */
export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? children : fallback;
}

interface MultipleFeatureFlagsProps {
  flags: FeatureFlag[];
  mode?: 'all' | 'any'; // 'all' = todas devem estar ativas, 'any' = pelo menos uma
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para renderizar conteúdo baseado em múltiplas feature flags
 *
 * @example
 * <MultipleFeatureFlags flags={['marketplace', 'api_externa']} mode="all">
 *   <AdvancedMarketplaceComponent />
 * </MultipleFeatureFlags>
 */
export function MultipleFeatureFlags({
  flags,
  mode = 'all',
  children,
  fallback = null,
}: MultipleFeatureFlagsProps) {
  const activeFlags = useActiveFeatureFlags();

  const isEnabled =
    mode === 'all'
      ? flags.every((flag) => activeFlags.includes(flag))
      : flags.some((flag) => activeFlags.includes(flag));

  return isEnabled ? children : fallback;
}

// ====================================
// DESENVOLVIMENTO & DEBUG
// ====================================

/**
 * Função para debug - lista todas as flags e seus status
 * Uso apenas em desenvolvimento
 */
export function debugFeatureFlags(): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🚩 Feature Flags Status');

  Object.entries(FEATURE_FLAGS_CONFIG).forEach(([flag, config]) => {
    const isEnabled = isFeatureFlagEnabled(flag as FeatureFlag);
    const envValue = getEnvironmentFlagValue(flag as FeatureFlag);
    const isAvailable = isFeatureFlagAvailableInEnvironment(flag as FeatureFlag);

    console.log(`${isEnabled ? '✅' : '❌'} ${flag}:`, {
      enabled: isEnabled,
      default: config.defaultEnabled,
      envOverride: envValue,
      available: isAvailable,
      description: config.description,
    });
  });

  console.groupEnd();
}

// Auto-debug em desenvolvimento
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🔧 Feature Flags Debug iniciado');
  debugFeatureFlags();
}
