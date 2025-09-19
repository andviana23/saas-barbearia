/**
 * Barrel export para todos os handlers MSW
 * Organizado por domínio para facilitar manutenção e testes
 */

import { agendamentosHandlers } from './agendamentos';
import { servicosHandlers } from './servicos';
import { marketplaceHandlers } from './marketplace';
import { authHandlers } from './auth';
import { errorHandlers } from './errors';

export { agendamentosHandlers } from './agendamentos';
export { servicosHandlers } from './servicos';
export { marketplaceHandlers } from './marketplace';
export { authHandlers } from './auth';
export { errorHandlers } from './errors';

// Re-export dos tipos de cenários
export type { AgendamentosScenario } from './agendamentos';
export type { ServicosScenario } from './servicos';
export type { MarketplaceScenario } from './marketplace';
export type { AuthScenario } from './auth';
export type { ErrorScenario } from './errors';

/**
 * Todos os handlers agrupados por categoria
 */
export const allHandlers = {
  agendamentos: agendamentosHandlers,
  servicos: servicosHandlers,
  marketplace: marketplaceHandlers,
  auth: authHandlers,
  errors: errorHandlers,
};

/**
 * Lista completa de handlers para usar no server
 */
export const handlers = [
  ...errorHandlers, // Deve ser primeiro para interceptar cenários de erro globais
  ...authHandlers,
  ...agendamentosHandlers,
  ...servicosHandlers,
  ...marketplaceHandlers,
];
