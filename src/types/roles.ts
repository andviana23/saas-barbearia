// Definição centralizada de roles do sistema
// Expandir conforme novas políticas forem surgindo
export const ROLES = ['admin', 'manager', 'staff', 'professional', 'read_only'] as const;

export type AppRole = (typeof ROLES)[number];

export function isAppRole(value: string | undefined | null): value is AppRole {
  return !!value && (ROLES as readonly string[]).includes(value);
}

// Agrupamentos úteis para UI / guards
export const ROLE_GROUPS = {
  elevated: ['admin', 'manager'] as AppRole[],
  canWrite: ['admin', 'manager', 'staff'] as AppRole[],
  schedulingActors: ['admin', 'manager', 'staff', 'professional'] as AppRole[],
};
