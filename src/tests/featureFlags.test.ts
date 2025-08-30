/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  isFeatureFlagEnabled,
  getActiveFeatureFlags,
  areFeatureFlagsEnabled,
  isFeatureFlagAvailableInEnvironment,
  FEATURE_FLAGS_CONFIG,
} from '../featureFlags';

// Mock do process.env
const originalEnv = process.env;

// Helper para mock de NODE_ENV
const mockNodeEnv = (env: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: env,
    writable: true,
    configurable: true,
  });
};

describe('Sistema de Feature Flags', () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('isFeatureFlagEnabled', () => {
    it('deve retornar valor padrão quando não há override de env', () => {
      expect(isFeatureFlagEnabled('marketplace')).toBe(true); // default: true
      expect(isFeatureFlagEnabled('multi_unidades')).toBe(false); // default: false
    });

    it('deve respeitar override de variável de ambiente', () => {
      process.env.FEATURE_MARKETPLACE = 'false';
      expect(isFeatureFlagEnabled('marketplace')).toBe(false);

      process.env.FEATURE_MULTI_UNIDADES = 'true';
      expect(isFeatureFlagEnabled('multi_unidades')).toBe(true);
    });

    it('deve aceitar "1" como true na variável de ambiente', () => {
      process.env.FEATURE_MARKETPLACE = '1';
      expect(isFeatureFlagEnabled('marketplace')).toBe(true);
    });

    it('deve retornar false para flags não disponíveis no ambiente', () => {
      mockNodeEnv('production');
      expect(isFeatureFlagEnabled('multi_unidades')).toBe(false); // não disponível em prod
    });
  });

  describe('isFeatureFlagAvailableInEnvironment', () => {
    it('deve retornar true para flags sem restrição de ambiente', () => {
      expect(isFeatureFlagAvailableInEnvironment('marketplace')).toBe(true);
    });

    it('deve verificar disponibilidade baseada no NODE_ENV', () => {
      mockNodeEnv('production');
      expect(isFeatureFlagAvailableInEnvironment('multi_unidades')).toBe(false);
      expect(isFeatureFlagAvailableInEnvironment('marketplace')).toBe(true);

      mockNodeEnv('development');
      expect(isFeatureFlagAvailableInEnvironment('multi_unidades')).toBe(true);
    });
  });

  describe('getActiveFeatureFlags', () => {
    it('deve retornar apenas flags ativas', () => {
      mockNodeEnv('development');
      const activeFlags = getActiveFeatureFlags();

      expect(activeFlags).toContain('marketplace');
      expect(activeFlags).toContain('relatorios_avancados');
      expect(activeFlags).toContain('auditoria');
      expect(activeFlags).toContain('agenda_avancada');

      // Flags desabilitadas por padrão não devem aparecer
      expect(activeFlags).not.toContain('multi_unidades');
      expect(activeFlags).not.toContain('notificacoes_push');
    });

    it('deve respeitar overrides de ambiente', () => {
      mockNodeEnv('development');
      process.env.FEATURE_MULTI_UNIDADES = 'true';
      process.env.FEATURE_MARKETPLACE = 'false';

      const activeFlags = getActiveFeatureFlags();

      expect(activeFlags).toContain('multi_unidades'); // ativada via env
      expect(activeFlags).not.toContain('marketplace'); // desativada via env
    });
  });

  describe('areFeatureFlagsEnabled', () => {
    it('deve retornar true quando todas as flags estão ativas', () => {
      mockNodeEnv('development');
      expect(areFeatureFlagsEnabled(['marketplace', 'relatorios_avancados'])).toBe(true);
    });

    it('deve retornar false quando pelo menos uma flag não está ativa', () => {
      mockNodeEnv('development');
      expect(areFeatureFlagsEnabled(['marketplace', 'multi_unidades'])).toBe(false);
    });

    it('deve retornar true para array vazio', () => {
      expect(areFeatureFlagsEnabled([])).toBe(true);
    });
  });

  describe('Validação de configuração', () => {
    it('todas as flags devem ter configuração válida', () => {
      Object.values(FEATURE_FLAGS_CONFIG).forEach((config) => {
        expect(config).toHaveProperty('flag');
        expect(config).toHaveProperty('defaultEnabled');
        expect(config).toHaveProperty('description');
        expect(typeof config.defaultEnabled).toBe('boolean');
        expect(typeof config.description).toBe('string');
      });
    });

    it('flags devem ter nomes consistentes', () => {
      Object.entries(FEATURE_FLAGS_CONFIG).forEach(([key, config]) => {
        expect(key).toBe(config.flag);
      });
    });

    it('environments devem ser válidos quando especificados', () => {
      const validEnvs = ['development', 'staging', 'production', 'test'];

      Object.values(FEATURE_FLAGS_CONFIG).forEach((config) => {
        if (config.environments) {
          config.environments.forEach((env) => {
            expect(validEnvs).toContain(env);
          });
        }
      });
    });
  });

  describe('Cenários de produção', () => {
    it('deve ter flags apropriadas para produção', () => {
      mockNodeEnv('production');

      // Flags que devem estar ativas em produção
      expect(isFeatureFlagEnabled('marketplace')).toBe(true);
      expect(isFeatureFlagEnabled('relatorios_avancados')).toBe(true);
      expect(isFeatureFlagEnabled('auditoria')).toBe(true);

      // Flags experimentais não devem estar disponíveis
      expect(isFeatureFlagEnabled('multi_unidades')).toBe(false);
      expect(isFeatureFlagEnabled('assinaturas')).toBe(false);
    });
  });

  describe('Cenários de desenvolvimento', () => {
    it('deve permitir todas as flags em desenvolvimento', () => {
      mockNodeEnv('development');

      // Todas as flags devem estar disponíveis
      const allFlags = Object.keys(FEATURE_FLAGS_CONFIG);
      allFlags.forEach((flag) => {
        expect(isFeatureFlagAvailableInEnvironment(flag as keyof typeof FEATURE_FLAGS_CONFIG)).toBe(
          true,
        );
      });
    });

    it('deve permitir override de qualquer flag', () => {
      mockNodeEnv('development');
      process.env.FEATURE_ASSINATURAS = 'true';
      process.env.FEATURE_API_EXTERNA = 'true';

      expect(isFeatureFlagEnabled('assinaturas')).toBe(true);
      expect(isFeatureFlagEnabled('api_externa')).toBe(true);
    });
  });

  describe('Performance e edge cases', () => {
    it('deve ser performático para múltiplas chamadas', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        isFeatureFlagEnabled('marketplace');
        getActiveFeatureFlags();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Deve ser rápido (< 100ms)
    });

    it('deve lidar com flags inexistentes graciosamente', () => {
      expect(() => {
        // @ts-ignore - testando comportamento com flag inválida
        isFeatureFlagEnabled('flag_inexistente');
      }).not.toThrow();
    });
  });
});
