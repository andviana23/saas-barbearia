import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Servidor MSW configurado com handlers modularizados
 * Suporta cenários dinâmicos via headers ou query parameters
 *
 * Para usar cenários específicos:
 * - Header: x-mock-scenario: "error-500"
 * - Query: ?scenario=empty
 *
 * Cenários disponíveis por domínio:
 * - Agendamentos: success, empty, error-400, error-500, conflict
 * - Serviços: success, empty, error-400, error-500
 * - Marketplace: success, empty, error-400, error-500, unauthorized
 * - Auth: success, invalid-credentials, user-not-found, error-500
 * - Errors: network-error, timeout, rate-limit, maintenance
 */

// Setup server with modularized handlers
export const server = setupServer(...handlers);

// Export handlers for individual testing
export { handlers } from './handlers';
