/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from '@jest/globals';
import {
  getRoutesByRole,
  getRoutesByFeatureFlags,
  getNavigationRoutes,
  canAccessRoute,
  routes,
  type FeatureFlag,
} from '../routes';

describe('Sistema de Rotas', () => {
  describe('getRoutesByRole', () => {
    it('deve retornar rotas para admin', () => {
      const adminRoutes = getRoutesByRole('admin');
      const adminPaths = adminRoutes.map((r) => r.path);

      expect(adminPaths).toContain('/');
      expect(adminPaths).toContain('/agenda');
      expect(adminPaths).toContain('/clientes');
      expect(adminPaths).toContain('/unidades'); // Apenas admin
      expect(adminPaths).toContain('/auditoria'); // Apenas admin
    });

    it('deve retornar rotas para funcionario', () => {
      const funcionarioRoutes = getRoutesByRole('funcionario');
      const funcionarioPaths = funcionarioRoutes.map((r) => r.path);

      expect(funcionarioPaths).toContain('/');
      expect(funcionarioPaths).toContain('/agenda');
      expect(funcionarioPaths).toContain('/clientes');
      expect(funcionarioPaths).not.toContain('/unidades'); // Não tem acesso
      expect(funcionarioPaths).not.toContain('/auditoria'); // Não tem acesso
    });

    it('deve retornar rotas para gerente', () => {
      const gerenteRoutes = getRoutesByRole('gerente');
      const gerentePaths = gerenteRoutes.map((r) => r.path);

      expect(gerentePaths).toContain('/');
      expect(gerentePaths).toContain('/agenda');
      expect(gerentePaths).toContain('/profissionais');
      expect(gerentePaths).toContain('/financeiro');
      expect(gerentePaths).not.toContain('/unidades'); // Apenas admin
    });
  });

  describe('getRoutesByFeatureFlags', () => {
    it('deve filtrar rotas baseado em feature flags ativas', () => {
      const activeFlags: FeatureFlag[] = ['marketplace', 'relatorios_avancados'];
      const filteredRoutes = getRoutesByFeatureFlags('admin', activeFlags);
      const paths = filteredRoutes.map((r) => r.path);

      expect(paths).toContain('/marketplace');
      expect(paths).toContain('/relatorios');
      expect(paths).not.toContain('/notificacoes'); // Flag não ativa
    });

    it('deve incluir rotas sem feature flags', () => {
      const activeFlags: FeatureFlag[] = [];
      const filteredRoutes = getRoutesByFeatureFlags('admin', activeFlags);
      const paths = filteredRoutes.map((r) => r.path);

      expect(paths).toContain('/');
      expect(paths).toContain('/agenda');
      expect(paths).toContain('/clientes');
      expect(paths).not.toContain('/marketplace'); // Precisa de flag
    });
  });

  describe('getNavigationRoutes', () => {
    it('deve retornar rotas ordenadas para navegação', () => {
      const navRoutes = getNavigationRoutes('admin', ['marketplace']);
      const orders = navRoutes.map((r) => r.order);

      // Deve estar ordenado
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBeGreaterThanOrEqual(orders[i - 1]);
      }
    });

    it('deve excluir rotas que não aparecem na navegação', () => {
      const navRoutes = getNavigationRoutes('admin', []);
      const paths = navRoutes.map((r) => r.path);

      expect(paths).not.toContain('/login'); // showInNav = false
      expect(paths).not.toContain('/404'); // showInNav = false
    });
  });

  describe('canAccessRoute', () => {
    it('deve permitir acesso para role correto', () => {
      expect(canAccessRoute('dashboard', 'admin', [])).toBe(true);
      expect(canAccessRoute('clientes', 'funcionario', [])).toBe(true);
      expect(canAccessRoute('profissionais', 'gerente', [])).toBe(true);
    });

    it('deve negar acesso para role incorreto', () => {
      expect(canAccessRoute('unidades', 'funcionario', [])).toBe(false);
      expect(canAccessRoute('auditoria', 'gerente', [])).toBe(false);
      expect(canAccessRoute('profissionais', 'funcionario', [])).toBe(false);
    });

    it('deve permitir acesso com feature flag ativa', () => {
      expect(canAccessRoute('marketplace', 'admin', ['marketplace'])).toBe(true);
      expect(canAccessRoute('relatorios', 'gerente', ['relatorios_avancados'])).toBe(true);
    });

    it('deve negar acesso com feature flag inativa', () => {
      expect(canAccessRoute('marketplace', 'admin', [])).toBe(false);
      expect(canAccessRoute('notificacoes', 'admin', [])).toBe(false);
    });

    it('deve retornar false para rota inexistente', () => {
      expect(canAccessRoute('rota-inexistente', 'admin', [])).toBe(false);
    });
  });

  describe('Validação de estrutura das rotas', () => {
    it('todas as rotas devem ter campos obrigatórios', () => {
      Object.values(routes).forEach((route) => {
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('label');
        expect(route).toHaveProperty('order');
        expect(typeof route.path).toBe('string');
        expect(typeof route.label).toBe('string');
        expect(typeof route.order).toBe('number');
      });
    });

    it('ordens devem ser únicas', () => {
      const orders = Object.values(routes).map((r) => r.order);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });

    it('paths devem ser únicos', () => {
      const paths = Object.values(routes).map((r) => r.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });

    it('rotas com feature flags devem ter flags válidas', () => {
      const validFlags: FeatureFlag[] = [
        'marketplace',
        'multi_unidades',
        'relatorios_avancados',
        'notificacoes_push',
        'assinaturas',
        'api_externa',
        'auditoria',
        'pos_integrado',
        'agenda_avancada',
        'crm_avancado',
      ];

      Object.values(routes).forEach((route) => {
        if (route.featureFlag) {
          expect(validFlags).toContain(route.featureFlag);
        }
      });
    });
  });

  describe('Integração role + feature flags', () => {
    it('deve respeitar tanto role quanto feature flags', () => {
      // Admin com marketplace ativo
      expect(canAccessRoute('marketplace', 'admin', ['marketplace'])).toBe(true);

      // Funcionário sem acesso ao marketplace, mesmo com flag
      expect(canAccessRoute('marketplace', 'funcionario', ['marketplace'])).toBe(false);

      // Admin sem flag do marketplace
      expect(canAccessRoute('marketplace', 'admin', [])).toBe(false);
    });
  });
});
