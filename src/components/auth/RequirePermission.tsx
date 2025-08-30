'use client';

import { ReactNode } from 'react';
import { usePermission, useMultiplePermissions } from '@/hooks/usePermissions';
import { Resource, Action, PermissionContext } from '@/types/permissions';
import { ForbiddenView } from '@/components/ui';

// ====================================
// COMPONENTE REQUIRE SIMPLES
// ====================================

interface RequireProps {
  /** Recurso requerido */
  resource: Resource;
  /** Ação requerida */
  action: Action;
  /** Contexto adicional para avaliação */
  context?: PermissionContext;
  /** Conteúdo a ser renderizado se permissão for concedida */
  children: ReactNode;
  /** Componente a ser renderizado se permissão for negada */
  fallback?: ReactNode;
  /** Renderizar apenas se permissão for negada (útil para avisos) */
  onlyIfDenied?: boolean;
}

/**
 * Componente para proteção de UI baseada em permissões
 */
export function Require({
  resource,
  action,
  context = {},
  children,
  fallback,
  onlyIfDenied = false,
}: RequireProps) {
  const { allowed } = usePermission(resource, action, context);

  if (onlyIfDenied) {
    return allowed ? null : <>{children}</>;
  }

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ForbiddenView
        variant="card"
        title="Acesso Restrito"
        message="Você não tem permissão para acessar este recurso."
      />
    );
  }

  return <>{children}</>;
}

// ====================================
// COMPONENTE REQUIRE MÚLTIPLO
// ====================================

interface MultipleRequireProps {
  /** Lista de permissões requeridas */
  permissions: Array<{ resource: Resource; action: Action }>;
  /** Contexto adicional para avaliação */
  context?: PermissionContext;
  /** Se deve verificar TODAS as permissões (default) ou QUALQUER UMA */
  mode?: 'all' | 'any';
  /** Conteúdo a ser renderizado se permissão for concedida */
  children: ReactNode;
  /** Componente a ser renderizado se permissão for negada */
  fallback?: ReactNode;
}

/**
 * Componente para proteção de UI baseada em múltiplas permissões
 */
export function MultipleRequire({
  permissions,
  context = {},
  mode = 'all',
  children,
  fallback,
}: MultipleRequireProps) {
  const { allAllowed, anyAllowed } = useMultiplePermissions(permissions, context);

  const allowed = mode === 'all' ? allAllowed : anyAllowed;

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ForbiddenView
        variant="card"
        title="Acesso Restrito"
        message={`Você não tem ${
          mode === 'all' ? 'todas as permissões necessárias' : 'nenhuma das permissões necessárias'
        } para acessar este recurso.`}
      />
    );
  }

  return <>{children}</>;
}

// ====================================
// COMPONENTE PARA AÇÕES CRUD
// ====================================

interface RequireCrudProps {
  /** Recurso para verificar permissões CRUD */
  resource: Resource;
  /** Ações CRUD requeridas */
  actions: Array<'create' | 'read' | 'update' | 'delete'>;
  /** Contexto adicional para avaliação */
  context?: PermissionContext;
  /** Se deve verificar TODAS as ações (default) ou QUALQUER UMA */
  mode?: 'all' | 'any';
  /** Conteúdo a ser renderizado se permissão for concedida */
  children: ReactNode;
  /** Componente a ser renderizado se permissão for negada */
  fallback?: ReactNode;
}

/**
 * Componente especializado para verificar permissões CRUD
 */
export function RequireCrud({
  resource,
  actions,
  context = {},
  mode = 'all',
  children,
  fallback,
}: RequireCrudProps) {
  const permissions = actions.map((action) => ({
    resource,
    action: action.toUpperCase() as Action,
  }));

  return (
    <MultipleRequire permissions={permissions} context={context} mode={mode} fallback={fallback}>
      {children}
    </MultipleRequire>
  );
}

// ====================================
// COMPONENTE CONDICIONAL
// ====================================

interface ConditionalPermissionProps {
  /** Recurso requerido */
  resource: Resource;
  /** Ação requerida */
  action: Action;
  /** Contexto adicional para avaliação */
  context?: PermissionContext;
  /** Conteúdo quando permissão é concedida */
  children: (props: { allowed: boolean; userRole: string }) => ReactNode;
}

/**
 * Componente para renderização condicional baseada em permissões
 */
export function ConditionalPermission({
  resource,
  action,
  context = {},
  children,
}: ConditionalPermissionProps) {
  const { allowed, userRole } = usePermission(resource, action, context);

  return <>{children({ allowed, userRole })}</>;
}

// ====================================
// COMPONENTE PARA ROLES
// ====================================

interface RequireRoleProps {
  /** Roles permitidos */
  roles: string[];
  /** Conteúdo a ser renderizado se role for permitido */
  children: ReactNode;
  /** Componente a ser renderizado se role for negado */
  fallback?: ReactNode;
}

/**
 * Componente para proteção baseada apenas em roles
 */
export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { userRole } = usePermission(Resource.DASHBOARD, Action.READ);

  const allowed = roles.includes(userRole);

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ForbiddenView
        variant="card"
        title="Acesso Restrito"
        message={`Este recurso é restrito aos roles: ${roles.join(', ')}`}
      />
    );
  }

  return <>{children}</>;
}

// ====================================
// EXPORTS
// ====================================

export default Require;
