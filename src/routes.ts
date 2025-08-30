/**
 * Sistema de Rotas Centralizadas
 *
 * Define todas as rotas da aplicação com metadata para:
 * - Navegação automática
 * - Controle de acesso por role
 * - Feature flags
 * - Organização hierárquica
 *
 * @see docs/FEATURE_FLAGS.md para documentação completa
 */

import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Clock,
  CreditCard,
  BarChart3,
  Settings,
  Package,
  ShoppingCart,
  Bell,
  Building,
  Shield,
  HelpCircle,
  History,
} from 'lucide-react';

// ====================================
// TIPOS E INTERFACES
// ====================================

export type UserRole = 'admin' | 'gerente' | 'funcionario' | 'cliente';

export type FeatureFlag =
  | 'marketplace'
  | 'multi_unidades'
  | 'relatorios_avancados'
  | 'notificacoes_push'
  | 'assinaturas'
  | 'api_externa'
  | 'auditoria'
  | 'pos_integrado'
  | 'agenda_avancada'
  | 'crm_avancado';

export interface RouteMetadata {
  /** Caminho da rota */
  path: string;
  /** Label para exibição na navegação */
  label: string;
  /** Ícone Lucide para a rota */
  icon?: LucideIcon;
  /** Roles que têm acesso à rota */
  roles?: UserRole[];
  /** Feature flag necessária para acessar */
  featureFlag?: FeatureFlag;
  /** Ordem de exibição na navegação (menor = primeiro) */
  order: number;
  /** Categoria para agrupamento */
  category?: 'core' | 'advanced' | 'admin' | 'marketplace';
  /** Rota pai (para montar hierarquia de navegação) */
  parent?: string;
  /** Se deve aparecer na navegação principal */
  showInNav?: boolean;
  /** Descrição da funcionalidade */
  description?: string;
  /** Se é uma rota externa */
  external?: boolean;
  /** Badge para destacar na navegação */
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
}

// ====================================
// DEFINIÇÃO DAS ROTAS
// ====================================

export const routes: Record<string, RouteMetadata> = {
  // Rotas Core (sempre disponíveis)
  dashboard: {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'gerente', 'funcionario'],
    order: 1,
    category: 'core',
    showInNav: true,
    description: 'Visão geral da barbearia',
  },

  agenda: {
    path: '/agenda',
    label: 'Agenda',
    icon: Calendar,
    roles: ['admin', 'gerente', 'funcionario'],
    order: 2,
    category: 'core',
    showInNav: true,
    description: 'Gerenciamento de agendamentos',
  },

  clientes: {
    path: '/clientes',
    label: 'Clientes',
    icon: Users,
    roles: ['admin', 'gerente', 'funcionario'],
    order: 3,
    category: 'core',
    showInNav: true,
    description: 'Cadastro e gestão de clientes',
  },

  profissionais: {
    path: '/profissionais',
    label: 'Profissionais',
    icon: UserCheck,
    roles: ['admin', 'gerente'],
    order: 4,
    category: 'core',
    showInNav: true,
    description: 'Gestão de colaboradores',
  },

  servicos: {
    path: '/servicos',
    label: 'Serviços',
    icon: Package,
    roles: ['admin', 'gerente'],
    order: 5,
    category: 'core',
    showInNav: true,
    description: 'Catálogo de serviços oferecidos',
  },

  caixa: {
    path: '/caixa',
    label: 'Caixa',
    icon: CreditCard,
    roles: ['admin', 'gerente', 'funcionario'],
    order: 8,
    category: 'core',
    showInNav: true,
    description: 'Controle de caixa diário',
  },

  estoque: {
    path: '/estoque',
    label: 'Estoque',
    icon: Package,
    roles: ['admin', 'gerente'],
    order: 6,
    category: 'core',
    showInNav: true,
    description: 'Gestão de estoque e produtos',
  },

  fila: {
    path: '/fila',
    label: 'Fila',
    icon: Clock,
    roles: ['admin', 'gerente', 'funcionario'],
    order: 7,
    category: 'core',
    showInNav: true,
    description: 'Gerenciamento da fila de atendimento',
  },

  cadastros: {
    path: '/cadastros',
    label: 'Cadastros',
    icon: Users,
    roles: ['admin', 'gerente'],
    order: 20,
    category: 'core',
    showInNav: true,
    description: 'Grupo de cadastros gerais',
  },

  produtos: {
    path: '/produtos/produtos',
    label: 'Produtos',
    icon: Package,
    roles: ['admin', 'gerente'],
    order: 21,
    category: 'core',
    showInNav: true,
    description: 'Cadastro de produtos',
    parent: 'cadastros',
  },

  metas: {
    path: '/metas',
    label: 'Metas',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
    order: 22,
    category: 'core',
    showInNav: true,
    description: 'Metas de desempenho',
    parent: 'cadastros',
  },

  tipos: {
    path: '/tipos',
    label: 'Tipos',
    icon: Settings,
    roles: ['admin', 'gerente'],
    order: 23,
    category: 'core',
    showInNav: true,
    description: 'Tipos de entidades para parametrização',
    parent: 'cadastros',
  },

  tipo_pagamento: {
    path: '/tipos/pagamento',
    label: 'Pagamento',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    order: 1,
    category: 'core',
    showInNav: true,
    description: 'Tipos de pagamento',
    parent: 'tipos',
  },
  tipo_bandeira: {
    path: '/tipos/bandeira',
    label: 'Bandeira',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    order: 2,
    category: 'core',
    showInNav: true,
    description: 'Bandeiras de cartão',
    parent: 'tipos',
  },
  tipo_despesas: {
    path: '/tipos/despesas',
    label: 'Despesas',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
    order: 3,
    category: 'core',
    showInNav: true,
    description: 'Categorias de despesas',
    parent: 'tipos',
  },
  tipo_receitas: {
    path: '/tipos/receitas',
    label: 'Receitas',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
    order: 4,
    category: 'core',
    showInNav: true,
    description: 'Categorias de receitas',
    parent: 'tipos',
  },
  tipo_categoria: {
    path: '/tipos/categoria',
    label: 'Categoria',
    icon: Package,
    roles: ['admin', 'gerente'],
    order: 5,
    category: 'core',
    showInNav: true,
    description: 'Categorias gerais',
    parent: 'tipos',
  },
  tipo_conta: {
    path: '/tipos/conta',
    label: 'Conta',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    order: 6,
    category: 'core',
    showInNav: true,
    description: 'Tipos de conta financeira',
    parent: 'tipos',
  },

  financeiro: {
    path: '/financeiro',
    label: 'Financeiro',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    order: 30,
    category: 'core',
    showInNav: true,
    description: 'Controle financeiro e caixa',
  },
  financeiro_caixa: {
    path: '/financeiro/caixa',
    label: 'Caixa',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    order: 31,
    category: 'core',
    showInNav: true,
    description: 'Movimentação de caixa',
    parent: 'financeiro',
  },
  financeiro_historico: {
    path: '/financeiro/historico',
    label: 'Histórico de Caixa',
    icon: History,
    roles: ['admin', 'gerente'],
    order: 32,
    category: 'core',
    showInNav: true,
    description: 'Histórico de operações do caixa',
    parent: 'financeiro',
  },
  financeiro_fluxo: {
    path: '/financeiro/fluxo',
    label: 'Fluxo de Caixa',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
    order: 33,
    category: 'core',
    showInNav: true,
    description: 'Fluxo consolidado',
    parent: 'financeiro',
  },
  financeiro_comissao: {
    path: '/financeiro/comissao',
    label: 'Comissão',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    order: 34,
    category: 'core',
    showInNav: true,
    description: 'Cálculo de comissão',
    parent: 'financeiro',
  },
  financeiro_relatorio: {
    path: '/financeiro/relatorio',
    label: 'Relatório',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
    order: 35,
    category: 'core',
    showInNav: true,
    description: 'Relatórios financeiros',
    parent: 'financeiro',
  },

  // Rotas Avançadas (com feature flags)
  marketplace: {
    path: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingCart,
    roles: ['admin', 'gerente'],
    featureFlag: 'marketplace',
    order: 10,
    category: 'marketplace',
    showInNav: true,
    description: 'Marketplace de serviços',
    badge: {
      text: 'Novo',
      variant: 'success',
    },
  },

  relatorios: {
    path: '/relatorios/relatorios',
    label: 'Relatórios',
    icon: BarChart3,
    roles: ['admin', 'gerente'],
    featureFlag: 'relatorios_avancados',
    order: 11,
    category: 'advanced',
    showInNav: true,
    description: 'Relatórios e análises',
  },

  notificacoes: {
    path: '/notificacoes',
    label: 'Notificações',
    icon: Bell,
    roles: ['admin', 'gerente'],
    featureFlag: 'notificacoes_push',
    order: 12,
    category: 'advanced',
    showInNav: true,
    description: 'Central de notificações',
  },

  // Rotas Multi-Unidades
  unidades: {
    path: '/multi-unidades',
    label: 'Multi-Unidades',
    icon: Building,
    roles: ['admin'],
    featureFlag: 'multi_unidades',
    order: 15,
    category: 'admin',
    showInNav: true,
    description: 'Gestão de múltiplas unidades',
  },

  // Rotas Administrativas
  configuracoes: {
    path: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    roles: ['admin', 'gerente'],
    order: 20,
    category: 'admin',
    showInNav: true,
    description: 'Configurações do sistema',
  },

  auditoria: {
    path: '/auditoria',
    label: 'Auditoria',
    icon: Shield,
    roles: ['admin'],
    featureFlag: 'auditoria',
    order: 21,
    category: 'admin',
    showInNav: true,
    description: 'Log de atividades e auditoria',
  },

  // Rotas de Apoio
  assinaturas: {
    path: '/assinaturas',
    label: 'Assinaturas',
    icon: CreditCard,
    roles: ['admin', 'gerente'],
    // featureFlag: 'assinaturas', // Removido temporariamente para debug
    order: 9, // Colocando depois de Caixa (8) e antes de Marketplace (10)
    category: 'core', // Mudado para core para aparecer sempre
    showInNav: true,
    description: 'Gestão de assinaturas',
  },
  assinatura_dashboard: {
    path: '/assinaturas/dashboard',
    label: 'Dashboard Assinatura',
    icon: LayoutDashboard,
    roles: ['admin', 'gerente'],
    featureFlag: 'assinaturas',
    order: 41,
    category: 'advanced',
    showInNav: true,
    description: 'Visão geral de assinaturas',
    parent: 'assinaturas',
  },
  assinatura_planos: {
    path: '/assinaturas/planos',
    label: 'Planos',
    icon: Package,
    roles: ['admin', 'gerente'],
    featureFlag: 'assinaturas',
    order: 42,
    category: 'advanced',
    showInNav: true,
    description: 'Gestão de planos de assinatura',
    parent: 'assinaturas',
  },
  assinatura_assinantes: {
    path: '/assinaturas/assinantes',
    label: 'Assinantes',
    icon: Users,
    roles: ['admin', 'gerente'],
    featureFlag: 'assinaturas',
    order: 43,
    category: 'advanced',
    showInNav: true,
    description: 'Lista de assinantes',
    parent: 'assinaturas',
  },
  ajuda: {
    path: '/ajuda',
    label: 'Ajuda',
    icon: HelpCircle,
    roles: ['admin', 'gerente', 'funcionario'],
    order: 30,
    category: 'core',
    showInNav: true,
    description: 'Central de ajuda e suporte',
  },

  // Rotas Especiais (não aparecem na nav principal)
  login: {
    path: '/login',
    label: 'Login',
    order: 100,
    showInNav: false,
    description: 'Página de autenticação',
  },

  perfil: {
    path: '/perfil',
    label: 'Perfil',
    roles: ['admin', 'gerente', 'funcionario', 'cliente'],
    order: 101,
    showInNav: false,
    description: 'Perfil do usuário',
  },

  'not-found': {
    path: '/404',
    label: 'Página não encontrada',
    order: 102,
    showInNav: false,
    description: 'Página de erro 404',
  },
};

// ====================================
// FUNÇÕES UTILITÁRIAS
// ====================================

/**
 * Filtra rotas baseado no role do usuário
 */
export function getRoutesByRole(userRole: UserRole): RouteMetadata[] {
  return Object.values(routes).filter((route) => {
    if (!route.roles) return true;
    return route.roles.includes(userRole);
  });
}

/**
 * Filtra rotas baseado nas feature flags ativas
 */
export function getRoutesByFeatureFlags(
  userRole: UserRole,
  activeFlags: FeatureFlag[] = [],
): RouteMetadata[] {
  return getRoutesByRole(userRole).filter((route) => {
    if (!route.featureFlag) return true;
    return activeFlags.includes(route.featureFlag);
  });
}

/**
 * Obtém rotas para navegação ordenadas
 */
export function getNavigationRoutes(
  userRole: UserRole,
  activeFlags: FeatureFlag[] = [],
): RouteMetadata[] {
  return getRoutesByFeatureFlags(userRole, activeFlags)
    .filter((route) => route.showInNav !== false)
    .sort((a, b) => a.order - b.order);
}

/**
 * Agrupa rotas por categoria
 */
export function getRoutesByCategory(
  userRole: UserRole,
  activeFlags: FeatureFlag[] = [],
): Record<string, RouteMetadata[]> {
  // Importante: diferente de getNavigationRoutes, aqui antes não filtrava showInNav,
  // o que fazia rotas como login/404 aparecerem no menu. Agora aplicamos o mesmo
  // critério (showInNav !== false) para evitar poluir a navegação.
  const filteredRoutes = getRoutesByFeatureFlags(userRole, activeFlags).filter(
    (route) => route.showInNav !== false,
  );

  return filteredRoutes.reduce(
    (acc, route) => {
      const category = route.category || 'core';
      if (!acc[category]) acc[category] = [];
      acc[category].push(route);
      return acc;
    },
    {} as Record<string, RouteMetadata[]>,
  );
}

/**
 * Verifica se usuário tem acesso a uma rota específica
 */
export function canAccessRoute(
  routeKey: string,
  userRole: UserRole,
  activeFlags: FeatureFlag[] = [],
): boolean {
  const route = routes[routeKey];
  if (!route) return false;

  // Verificar role
  if (route.roles && !route.roles.includes(userRole)) {
    return false;
  }

  // Verificar feature flag
  if (route.featureFlag && !activeFlags.includes(route.featureFlag)) {
    return false;
  }

  return true;
}

/**
 * Obtém metadata de uma rota específica
 */
export function getRoute(routeKey: string): RouteMetadata | undefined {
  return routes[routeKey];
}

/**
 * Encontra rota pelo path
 */
export function findRouteByPath(path: string): RouteMetadata | undefined {
  return Object.values(routes).find((route) => route.path === path);
}

// ====================================
// CONSTANTS PARA EXPORT
// ====================================

export const ROUTE_PATHS = Object.fromEntries(
  Object.entries(routes).map(([key, route]) => [key.toUpperCase(), route.path]),
) as Record<string, string>;

export const CATEGORIES = {
  CORE: 'core' as const,
  ADVANCED: 'advanced' as const,
  ADMIN: 'admin' as const,
  MARKETPLACE: 'marketplace' as const,
};

export const USER_ROLES = {
  ADMIN: 'admin' as const,
  GERENTE: 'gerente' as const,
  FUNCIONARIO: 'funcionario' as const,
  CLIENTE: 'cliente' as const,
} as const;
