/**
 * Sistema de Permissões Granulares
 *
 * Define recursos, ações e políticas de acesso para o sistema SaaS Barbearia.
 * Permite controle fino de permissões baseado em roles e contexto.
 *
 * @author Sistema SaaS Barbearia
 * @version 1.0.0
 */

import { UserRole } from '@/routes';

// ====================================
// ENUMS E TIPOS BASE
// ====================================

/**
 * Recursos disponíveis no sistema
 */
export enum Resource {
  // Recursos Core
  DASHBOARD = 'dashboard',
  AGENDA = 'agenda',
  CLIENTES = 'clientes',
  PROFISSIONAIS = 'profissionais',
  SERVICOS = 'servicos',
  FILA = 'fila',

  // Recursos Financeiros
  FINANCEIRO = 'financeiro',
  CAIXA = 'caixa',
  VENDAS = 'vendas',
  COMISSOES = 'comissoes',

  // Recursos Avançados
  RELATORIOS = 'relatorios',
  MARKETPLACE = 'marketplace',
  NOTIFICACOES = 'notificacoes',

  // Recursos Administrativos
  UNIDADES = 'unidades',
  CONFIGURACOES = 'configuracoes',
  USUARIOS = 'usuarios',
  AUDITORIA = 'auditoria',

  // Recursos Especiais
  ASSINATURAS = 'assinaturas',
  INTEGRACAO = 'integracao',
}

/**
 * Ações disponíveis sobre os recursos
 */
export enum Action {
  // CRUD Básico
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // Ações Especiais de Agenda
  SCHEDULE = 'schedule',
  RESCHEDULE = 'reschedule',
  CANCEL = 'cancel',
  CONFIRM = 'confirm',

  // Ações Financeiras
  PROCESS_PAYMENT = 'process_payment',
  REFUND = 'refund',
  VIEW_REVENUE = 'view_revenue',
  MANAGE_DISCOUNTS = 'manage_discounts',

  // Ações Administrativas
  MANAGE_USERS = 'manage_users',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  BACKUP = 'backup',

  // Ações de Relatórios
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
  SCHEDULE_REPORTS = 'schedule_reports',

  // Ações de Sistema
  CONFIGURE = 'configure',
  AUDIT = 'audit',
  INTEGRATE = 'integrate',
}

/**
 * Contexto para avaliação de permissões
 */
export interface PermissionContext {
  /** ID da unidade atual */
  unitId?: string;
  /** ID do usuário que solicita */
  userId?: string;
  /** ID do recurso específico (ex: cliente específico) */
  resourceId?: string;
  /** Dados adicionais para contexto */
  metadata?: Record<string, unknown>;
  /** Se é o próprio usuário (para autogestão) */
  isSelf?: boolean;
}

/**
 * Definição de uma política de permissão
 */
export interface PermissionPolicy {
  resource: Resource;
  action: Action;
  roles: UserRole[];
  conditions?: (context: PermissionContext) => boolean;
  description?: string;
}

// ====================================
// MATRIZ DE PERMISSÕES
// ====================================

/**
 * Políticas de permissão do sistema
 */
export const PERMISSION_POLICIES: PermissionPolicy[] = [
  // ========== DASHBOARD ==========
  {
    resource: Resource.DASHBOARD,
    action: Action.READ,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Visualizar dashboard principal',
  },

  // ========== AGENDA ==========
  {
    resource: Resource.AGENDA,
    action: Action.READ,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Visualizar agenda',
  },
  {
    resource: Resource.AGENDA,
    action: Action.SCHEDULE,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Criar agendamentos',
  },
  {
    resource: Resource.AGENDA,
    action: Action.RESCHEDULE,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Reagendar compromissos',
  },
  {
    resource: Resource.AGENDA,
    action: Action.CANCEL,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Cancelar agendamentos',
  },
  {
    resource: Resource.AGENDA,
    action: Action.CONFIRM,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Confirmar agendamentos',
  },

  // ========== CLIENTES ==========
  {
    resource: Resource.CLIENTES,
    action: Action.READ,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Visualizar clientes',
  },
  {
    resource: Resource.CLIENTES,
    action: Action.CREATE,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Cadastrar novos clientes',
  },
  {
    resource: Resource.CLIENTES,
    action: Action.UPDATE,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Atualizar dados de clientes',
  },
  {
    resource: Resource.CLIENTES,
    action: Action.DELETE,
    roles: ['admin', 'gerente'],
    description: 'Excluir clientes',
  },

  // ========== PROFISSIONAIS ==========
  {
    resource: Resource.PROFISSIONAIS,
    action: Action.READ,
    roles: ['admin', 'gerente'],
    description: 'Visualizar profissionais',
  },
  {
    resource: Resource.PROFISSIONAIS,
    action: Action.CREATE,
    roles: ['admin', 'gerente'],
    description: 'Cadastrar profissionais',
  },
  {
    resource: Resource.PROFISSIONAIS,
    action: Action.UPDATE,
    roles: ['admin', 'gerente'],
    description: 'Atualizar dados de profissionais',
  },
  {
    resource: Resource.PROFISSIONAIS,
    action: Action.DELETE,
    roles: ['admin'],
    description: 'Excluir profissionais',
  },

  // ========== SERVIÇOS ==========
  {
    resource: Resource.SERVICOS,
    action: Action.READ,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Visualizar catálogo de serviços',
  },
  {
    resource: Resource.SERVICOS,
    action: Action.CREATE,
    roles: ['admin', 'gerente'],
    description: 'Criar novos serviços',
  },
  {
    resource: Resource.SERVICOS,
    action: Action.UPDATE,
    roles: ['admin', 'gerente'],
    description: 'Atualizar serviços',
  },
  {
    resource: Resource.SERVICOS,
    action: Action.DELETE,
    roles: ['admin'],
    description: 'Excluir serviços',
  },

  // ========== FINANCEIRO ==========
  {
    resource: Resource.FINANCEIRO,
    action: Action.READ,
    roles: ['admin', 'gerente'],
    description: 'Visualizar dados financeiros',
  },
  {
    resource: Resource.FINANCEIRO,
    action: Action.VIEW_REVENUE,
    roles: ['admin', 'gerente'],
    description: 'Visualizar faturamento',
  },
  {
    resource: Resource.FINANCEIRO,
    action: Action.PROCESS_PAYMENT,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Processar pagamentos',
  },
  {
    resource: Resource.FINANCEIRO,
    action: Action.REFUND,
    roles: ['admin', 'gerente'],
    description: 'Processar reembolsos',
  },
  {
    resource: Resource.FINANCEIRO,
    action: Action.MANAGE_DISCOUNTS,
    roles: ['admin', 'gerente'],
    description: 'Gerenciar descontos',
  },

  // ========== RELATÓRIOS ==========
  {
    resource: Resource.RELATORIOS,
    action: Action.VIEW_REPORTS,
    roles: ['admin', 'gerente'],
    description: 'Visualizar relatórios',
  },
  {
    resource: Resource.RELATORIOS,
    action: Action.EXPORT_REPORTS,
    roles: ['admin', 'gerente'],
    description: 'Exportar relatórios',
  },
  {
    resource: Resource.RELATORIOS,
    action: Action.SCHEDULE_REPORTS,
    roles: ['admin'],
    description: 'Agendar relatórios automáticos',
  },

  // ========== CONFIGURAÇÕES ==========
  {
    resource: Resource.CONFIGURACOES,
    action: Action.READ,
    roles: ['admin', 'gerente'],
    description: 'Visualizar configurações',
  },
  {
    resource: Resource.CONFIGURACOES,
    action: Action.CONFIGURE,
    roles: ['admin'],
    description: 'Alterar configurações do sistema',
  },

  // ========== UNIDADES (Multi-tenant) ==========
  {
    resource: Resource.UNIDADES,
    action: Action.READ,
    roles: ['admin'],
    description: 'Visualizar unidades',
  },
  {
    resource: Resource.UNIDADES,
    action: Action.CREATE,
    roles: ['admin'],
    description: 'Criar novas unidades',
  },
  {
    resource: Resource.UNIDADES,
    action: Action.UPDATE,
    roles: ['admin'],
    description: 'Atualizar unidades',
  },
  {
    resource: Resource.UNIDADES,
    action: Action.DELETE,
    roles: ['admin'],
    description: 'Excluir unidades',
  },

  // ========== USUÁRIOS ==========
  {
    resource: Resource.USUARIOS,
    action: Action.READ,
    roles: ['admin', 'gerente'],
    description: 'Visualizar usuários',
  },
  {
    resource: Resource.USUARIOS,
    action: Action.MANAGE_USERS,
    roles: ['admin'],
    description: 'Gerenciar usuários do sistema',
  },

  // ========== AUDITORIA ==========
  {
    resource: Resource.AUDITORIA,
    action: Action.AUDIT,
    roles: ['admin'],
    description: 'Acessar logs de auditoria',
  },
  {
    resource: Resource.AUDITORIA,
    action: Action.EXPORT_DATA,
    roles: ['admin'],
    description: 'Exportar dados de auditoria',
  },

  // ========== MARKETPLACE ==========
  {
    resource: Resource.MARKETPLACE,
    action: Action.READ,
    roles: ['admin', 'gerente'],
    description: 'Acessar marketplace',
  },
  {
    resource: Resource.MARKETPLACE,
    action: Action.CREATE,
    roles: ['admin', 'gerente'],
    description: 'Criar ofertas no marketplace',
  },

  // ========== FILA ==========
  {
    resource: Resource.FILA,
    action: Action.READ,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Visualizar fila de atendimento',
  },
  {
    resource: Resource.FILA,
    action: Action.UPDATE,
    roles: ['admin', 'gerente', 'funcionario'],
    description: 'Gerenciar fila de atendimento',
  },
];

// ====================================
// FUNÇÕES PRINCIPAIS
// ====================================

/**
 * Verifica se um usuário pode executar uma ação em um recurso
 */
export function can(
  resource: Resource,
  action: Action,
  userRole: UserRole,
  context: PermissionContext = {},
): boolean {
  // Encontrar política correspondente
  const policy = PERMISSION_POLICIES.find((p) => p.resource === resource && p.action === action);

  if (!policy) {
    // Se não há política definida, negar acesso por segurança
    return false;
  }

  // Verificar se o role do usuário está autorizado
  if (!policy.roles.includes(userRole)) {
    return false;
  }

  // Aplicar condições contextuais se existirem
  if (policy.conditions && !policy.conditions(context)) {
    return false;
  }

  return true;
}

/**
 * Verifica múltiplas permissões simultaneamente
 */
export function canAll(
  permissions: Array<{ resource: Resource; action: Action }>,
  userRole: UserRole,
  context: PermissionContext = {},
): boolean {
  return permissions.every(({ resource, action }) => can(resource, action, userRole, context));
}

/**
 * Verifica se pelo menos uma permissão é válida
 */
export function canAny(
  permissions: Array<{ resource: Resource; action: Action }>,
  userRole: UserRole,
  context: PermissionContext = {},
): boolean {
  return permissions.some(({ resource, action }) => can(resource, action, userRole, context));
}

/**
 * Obtém todas as permissões de um usuário para um recurso
 */
export function getResourcePermissions(
  resource: Resource,
  userRole: UserRole,
  context: PermissionContext = {},
): Action[] {
  return PERMISSION_POLICIES.filter((policy) => policy.resource === resource)
    .filter((policy) => can(resource, policy.action, userRole, context))
    .map((policy) => policy.action);
}

/**
 * Obtém todos os recursos que um usuário pode acessar
 */
export function getUserResources(userRole: UserRole, context: PermissionContext = {}): Resource[] {
  const resources = new Set<Resource>();

  PERMISSION_POLICIES.forEach((policy) => {
    if (can(policy.resource, policy.action, userRole, context)) {
      resources.add(policy.resource);
    }
  });

  return Array.from(resources);
}

/**
 * Compatibilidade com sistema de rotas existente
 */
export function canAccessRoute(
  routeKey: string,
  userRole: UserRole,
  context: PermissionContext = {},
): boolean {
  // Primeiro, importar e usar função existente de rotas
  const { canAccessRoute: originalCanAccessRoute } = require('@/routes');

  // Mapeamento de rotas para recursos
  const routeResourceMap: Record<string, Resource> = {
    dashboard: Resource.DASHBOARD,
    agenda: Resource.AGENDA,
    clientes: Resource.CLIENTES,
    profissionais: Resource.PROFISSIONAIS,
    servicos: Resource.SERVICOS,
    fila: Resource.FILA,
    financeiro: Resource.FINANCEIRO,
    relatorios: Resource.RELATORIOS,
    marketplace: Resource.MARKETPLACE,
    configuracoes: Resource.CONFIGURACOES,
    unidades: Resource.UNIDADES,
    auditoria: Resource.AUDITORIA,
  };

  const resource = routeResourceMap[routeKey];

  // Se não tem mapeamento de recurso, usar função original
  if (!resource) {
    return originalCanAccessRoute(routeKey, userRole, []);
  }

  // Usar novo sistema de permissões
  return can(resource, Action.READ, userRole, context);
}

// ====================================
// HELPERS PARA DEBUGGING
// ====================================

/**
 * Lista todas as políticas de um usuário (para debugging)
 */
export function debugUserPermissions(
  userRole: UserRole,
  context: PermissionContext = {},
): Array<{ resource: Resource; action: Action; allowed: boolean }> {
  return PERMISSION_POLICIES.map((policy) => ({
    resource: policy.resource,
    action: policy.action,
    allowed: can(policy.resource, policy.action, userRole, context),
  }));
}

/**
 * Explica por que uma permissão foi negada
 */
export function explainPermission(
  resource: Resource,
  action: Action,
  userRole: UserRole,
  context: PermissionContext = {},
): string {
  const policy = PERMISSION_POLICIES.find((p) => p.resource === resource && p.action === action);

  if (!policy) {
    return `Nenhuma política definida para ${resource}:${action}`;
  }

  if (!policy.roles.includes(userRole)) {
    return `Role '${userRole}' não autorizado. Roles permitidos: ${policy.roles.join(', ')}`;
  }

  if (policy.conditions && !policy.conditions(context)) {
    return `Condições contextuais não atendidas para ${resource}:${action}`;
  }

  return `Permissão concedida para ${resource}:${action}`;
}
