import {
  Resource,
  Action,
  can,
  canAll,
  canAny,
  getResourcePermissions,
  getUserResources,
  explainPermission,
} from '../permissions';
import { UserRole } from '@/routes';

describe('Sistema de Permissões', () => {
  describe('Função can()', () => {
    it('deve permitir acesso para admin em todos os recursos', () => {
      expect(can(Resource.DASHBOARD, Action.READ, 'admin')).toBe(true);
      expect(can(Resource.CONFIGURACOES, Action.CONFIGURE, 'admin')).toBe(true);
      expect(can(Resource.USUARIOS, Action.MANAGE_USERS, 'admin')).toBe(true);
    });

    it('deve restringir acesso para funcionario em recursos administrativos', () => {
      expect(can(Resource.USUARIOS, Action.MANAGE_USERS, 'funcionario')).toBe(false);
      expect(can(Resource.CONFIGURACOES, Action.CONFIGURE, 'funcionario')).toBe(false);
      expect(can(Resource.PROFISSIONAIS, Action.DELETE, 'funcionario')).toBe(false);
    });

    it('deve permitir acesso básico para funcionario', () => {
      expect(can(Resource.DASHBOARD, Action.READ, 'funcionario')).toBe(true);
      expect(can(Resource.AGENDA, Action.SCHEDULE, 'funcionario')).toBe(true);
      expect(can(Resource.CLIENTES, Action.CREATE, 'funcionario')).toBe(true);
    });

    it('deve negar acesso quando política não existe', () => {
      // Ação que não existe nas políticas
      expect(can(Resource.DASHBOARD, 'INVALID_ACTION' as Action, 'admin')).toBe(false);
    });

    it('deve respeitar hierarquia de roles', () => {
      // Gerente pode ver profissionais, funcionario não pode
      expect(can(Resource.PROFISSIONAIS, Action.READ, 'gerente')).toBe(true);
      expect(can(Resource.PROFISSIONAIS, Action.READ, 'funcionario')).toBe(false);

      // Admin pode deletar profissionais, gerente não pode
      expect(can(Resource.PROFISSIONAIS, Action.DELETE, 'admin')).toBe(true);
      expect(can(Resource.PROFISSIONAIS, Action.DELETE, 'gerente')).toBe(false);
    });
  });

  describe('Função canAll()', () => {
    it('deve retornar true quando usuário tem todas as permissões', () => {
      const permissions = [
        { resource: Resource.DASHBOARD, action: Action.READ },
        { resource: Resource.AGENDA, action: Action.READ },
        { resource: Resource.CLIENTES, action: Action.READ },
      ];

      expect(canAll(permissions, 'funcionario')).toBe(true);
    });

    it('deve retornar false quando usuário não tem uma das permissões', () => {
      const permissions = [
        { resource: Resource.DASHBOARD, action: Action.READ },
        { resource: Resource.USUARIOS, action: Action.MANAGE_USERS }, // Funcionario não tem essa permissão
      ];

      expect(canAll(permissions, 'funcionario')).toBe(false);
    });
  });

  describe('Função canAny()', () => {
    it('deve retornar true quando usuário tem pelo menos uma permissão', () => {
      const permissions = [
        { resource: Resource.USUARIOS, action: Action.MANAGE_USERS }, // Funcionario não tem
        { resource: Resource.DASHBOARD, action: Action.READ }, // Funcionario tem
      ];

      expect(canAny(permissions, 'funcionario')).toBe(true);
    });

    it('deve retornar false quando usuário não tem nenhuma permissão', () => {
      const permissions = [
        { resource: Resource.USUARIOS, action: Action.MANAGE_USERS },
        { resource: Resource.CONFIGURACOES, action: Action.CONFIGURE },
      ];

      expect(canAny(permissions, 'funcionario')).toBe(false);
    });
  });

  describe('Função getResourcePermissions()', () => {
    it('deve retornar todas as ações que admin pode fazer em clientes', () => {
      const actions = getResourcePermissions(Resource.CLIENTES, 'admin');

      expect(actions).toContain(Action.READ);
      expect(actions).toContain(Action.CREATE);
      expect(actions).toContain(Action.UPDATE);
      expect(actions).toContain(Action.DELETE);
    });

    it('deve retornar ações limitadas para funcionario em clientes', () => {
      const actions = getResourcePermissions(Resource.CLIENTES, 'funcionario');

      expect(actions).toContain(Action.READ);
      expect(actions).toContain(Action.CREATE);
      expect(actions).toContain(Action.UPDATE);
      expect(actions).not.toContain(Action.DELETE); // Funcionario não pode deletar
    });
  });

  describe('Função getUserResources()', () => {
    it('deve retornar todos os recursos que admin pode acessar', () => {
      const resources = getUserResources('admin');

      expect(resources).toContain(Resource.DASHBOARD);
      expect(resources).toContain(Resource.USUARIOS);
      expect(resources).toContain(Resource.CONFIGURACOES);
      expect(resources).toContain(Resource.AUDITORIA);
    });

    it('deve retornar recursos limitados para funcionario', () => {
      const resources = getUserResources('funcionario');

      expect(resources).toContain(Resource.DASHBOARD);
      expect(resources).toContain(Resource.AGENDA);
      expect(resources).toContain(Resource.CLIENTES);
      expect(resources).not.toContain(Resource.USUARIOS); // Funcionario não pode gerenciar usuários
      expect(resources).not.toContain(Resource.CONFIGURACOES); // Funcionario não pode configurar
    });
  });

  describe('Recursos e Ações específicas', () => {
    describe('Agenda', () => {
      it('deve permitir todas as ações de agenda para roles apropriados', () => {
        const roles: UserRole[] = ['admin', 'gerente', 'funcionario'];

        roles.forEach((role) => {
          expect(can(Resource.AGENDA, Action.READ, role)).toBe(true);
          expect(can(Resource.AGENDA, Action.SCHEDULE, role)).toBe(true);
          expect(can(Resource.AGENDA, Action.RESCHEDULE, role)).toBe(true);
          expect(can(Resource.AGENDA, Action.CANCEL, role)).toBe(true);
          expect(can(Resource.AGENDA, Action.CONFIRM, role)).toBe(true);
        });
      });
    });

    describe('Financeiro', () => {
      it('deve restringir acesso financeiro a admin e gerente', () => {
        expect(can(Resource.FINANCEIRO, Action.READ, 'admin')).toBe(true);
        expect(can(Resource.FINANCEIRO, Action.READ, 'gerente')).toBe(true);
        expect(can(Resource.FINANCEIRO, Action.READ, 'funcionario')).toBe(false);

        expect(can(Resource.FINANCEIRO, Action.VIEW_REVENUE, 'admin')).toBe(true);
        expect(can(Resource.FINANCEIRO, Action.VIEW_REVENUE, 'gerente')).toBe(true);
        expect(can(Resource.FINANCEIRO, Action.VIEW_REVENUE, 'funcionario')).toBe(false);
      });

      it('deve permitir processamento de pagamento para todos os roles operacionais', () => {
        expect(can(Resource.FINANCEIRO, Action.PROCESS_PAYMENT, 'admin')).toBe(true);
        expect(can(Resource.FINANCEIRO, Action.PROCESS_PAYMENT, 'gerente')).toBe(true);
        expect(can(Resource.FINANCEIRO, Action.PROCESS_PAYMENT, 'funcionario')).toBe(true);
      });
    });

    describe('Relatórios', () => {
      it('deve restringir relatórios a admin e gerente', () => {
        expect(can(Resource.RELATORIOS, Action.VIEW_REPORTS, 'admin')).toBe(true);
        expect(can(Resource.RELATORIOS, Action.VIEW_REPORTS, 'gerente')).toBe(true);
        expect(can(Resource.RELATORIOS, Action.VIEW_REPORTS, 'funcionario')).toBe(false);
      });

      it('deve restringir agendamento de relatórios apenas a admin', () => {
        expect(can(Resource.RELATORIOS, Action.SCHEDULE_REPORTS, 'admin')).toBe(true);
        expect(can(Resource.RELATORIOS, Action.SCHEDULE_REPORTS, 'gerente')).toBe(false);
        expect(can(Resource.RELATORIOS, Action.SCHEDULE_REPORTS, 'funcionario')).toBe(false);
      });
    });
  });

  describe('Função explainPermission()', () => {
    it('deve explicar quando permissão é concedida', () => {
      const explanation = explainPermission(Resource.DASHBOARD, Action.READ, 'admin');
      expect(explanation).toContain('Permissão concedida');
    });

    it('deve explicar quando role não é autorizado', () => {
      const explanation = explainPermission(Resource.USUARIOS, Action.MANAGE_USERS, 'funcionario');
      expect(explanation).toContain('não autorizado');
      expect(explanation).toContain('admin');
    });

    it('deve explicar quando política não existe', () => {
      const explanation = explainPermission(
        Resource.DASHBOARD,
        'INVALID_ACTION' as Action,
        'admin',
      );
      expect(explanation).toContain('Nenhuma política definida');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com roles inválidos', () => {
      expect(can(Resource.DASHBOARD, Action.READ, 'invalid_role' as UserRole)).toBe(false);
    });

    it('deve lidar com contextos customizados', () => {
      const context = {
        unitId: 'unit-123',
        userId: 'user-456',
        isSelf: true,
      };

      // Mesmo sem condições contextuais definidas, deve funcionar normalmente
      expect(can(Resource.DASHBOARD, Action.READ, 'admin', context)).toBe(true);
    });
  });

  describe('Integração com Rotas', () => {
    it('deve validar acesso a rotas baseado em permissões', () => {
      // Mock da função de rotas para evitar import circular
      jest.doMock('@/routes', () => ({
        canAccessRoute: jest.fn(() => true),
      }));

      const { canAccessRoute } = require('../permissions');

      expect(canAccessRoute('dashboard', 'admin')).toBe(true);
      expect(canAccessRoute('configuracoes', 'funcionario')).toBe(false);
    });
  });
});
