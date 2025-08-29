import { AppRole, ROLES, ROLE_GROUPS, isAppRole } from '@/types/roles';

// Checa se role atual pode acessar recurso (lista de roles permitidas)
export function allowRoles(current: string | undefined | null, allowed: AppRole[]): boolean {
  if (!isAppRole(current)) return false;
  return allowed.includes(current);
}

// Políticas de rota: cada rota chave mapeia para lista de roles autorizadas
export const ROUTE_POLICIES: Record<string, AppRole[]> = {
  '/dashboard': ROLES.slice(),
  '/clientes': ROLE_GROUPS.schedulingActors,
  '/profissionais': ROLE_GROUPS.schedulingActors,
  '/servicos': ROLE_GROUPS.canWrite,
  '/financeiro': ['admin', 'manager'],
  '/configuracoes': ['admin', 'manager'],
};

export function canAccessPath(path: string, role: string | undefined | null): boolean {
  const normalized = path.replace(/\/$/, '');
  const policy = ROUTE_POLICIES[normalized];
  if (!policy) return true; // default permissivo: ajustar se quiser 404/403
  return allowRoles(role, policy);
}
