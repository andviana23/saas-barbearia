'use client';

import { useAuthContext } from '@/lib/auth/AuthContext';
import { can, canAll, canAny, Resource, Action, PermissionContext } from '@/types/permissions';
import { UserRole } from '@/routes';

/**
 * Hook para verificação de permissões
 */
export function usePermission(resource: Resource, action: Action, context: PermissionContext = {}) {
  const { user } = useAuthContext();

  // Extrair role do usuário
  const userRole = (user?.role || 'funcionario') as UserRole;

  const isAllowed = can(resource, action, userRole, {
    ...context,
    userId: user?.id,
  });

  return {
    /** Se a permissão é permitida */
    allowed: isAllowed,
    /** Role atual do usuário */
    userRole,
    /** ID do usuário */
    userId: user?.id,
    /** Função para verificar outras permissões */
    can: (r: Resource, a: Action, ctx: PermissionContext = {}) =>
      can(r, a, userRole, { ...ctx, userId: user?.id }),
    /** Função para verificar múltiplas permissões (todas) */
    canAll: (
      permissions: Array<{ resource: Resource; action: Action }>,
      ctx: PermissionContext = {},
    ) => canAll(permissions, userRole, { ...ctx, userId: user?.id }),
    /** Função para verificar múltiplas permissões (qualquer uma) */
    canAny: (
      permissions: Array<{ resource: Resource; action: Action }>,
      ctx: PermissionContext = {},
    ) => canAny(permissions, userRole, { ...ctx, userId: user?.id }),
  };
}

/**
 * Hook para verificação de múltiplas permissões
 */
export function useMultiplePermissions(
  permissions: Array<{ resource: Resource; action: Action }>,
  context: PermissionContext = {},
) {
  const { user } = useAuthContext();
  const userRole = (user?.role || 'funcionario') as UserRole;

  const results = permissions.map(({ resource, action }) => ({
    resource,
    action,
    allowed: can(resource, action, userRole, {
      ...context,
      userId: user?.id,
    }),
  }));

  return {
    /** Resultados individuais das permissões */
    results,
    /** Se todas as permissões são permitidas */
    allAllowed: results.every((r) => r.allowed),
    /** Se pelo menos uma permissão é permitida */
    anyAllowed: results.some((r) => r.allowed),
    /** Role atual do usuário */
    userRole,
    /** ID do usuário */
    userId: user?.id,
  };
}

/**
 * Hook simplificado para verificar acesso a recursos
 */
export function useResourceAccess(resource: Resource, context: PermissionContext = {}) {
  const { user } = useAuthContext();
  const userRole = (user?.role || 'funcionario') as UserRole;

  const ctx = { ...context, userId: user?.id };

  return {
    /** Se pode ler o recurso */
    canRead: can(resource, Action.READ, userRole, ctx),
    /** Se pode criar no recurso */
    canCreate: can(resource, Action.CREATE, userRole, ctx),
    /** Se pode atualizar o recurso */
    canUpdate: can(resource, Action.UPDATE, userRole, ctx),
    /** Se pode deletar o recurso */
    canDelete: can(resource, Action.DELETE, userRole, ctx),
    /** Role atual do usuário */
    userRole,
    /** ID do usuário */
    userId: user?.id,
    /** Função para verificar ação específica */
    can: (action: Action, customCtx: PermissionContext = {}) =>
      can(resource, action, userRole, { ...ctx, ...customCtx }),
  };
}
