/**
 * Barrel export para componentes de autenticação e autorização
 * Fase 6 - Sistema de Autorização Granular
 */

// Componentes de proteção por permissão
export { Require, MultipleRequire, RequireCrud, RequireRole } from './RequirePermission';

// Re-export de hooks relacionados (para conveniência)
export {
  usePermission,
  useMultiplePermissions,
  useResourceAccess,
} from '../../hooks/usePermissions';
