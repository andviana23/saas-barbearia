// @ts-nocheck
/* eslint-disable */
/**
 * Testes adicionais para actions de agendamentos:
 *  - createAppointment (conflito, sucesso, rollback serviços)
 *  - listAppointments (sucesso básico, erro)
 *  - checkDisponibilidade (edge case sem agendamentos)
 */

import { createAppointment, listAppointments, checkDisponibilidade } from '../agendamentos';

jest.mock('@/lib/server-actions', () => ({
  withValidationSchema: (_schema: unknown, fn: (...args: unknown[]) => unknown) => fn,
}));

let supabaseMock: any;
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => supabaseMock,
}));

const ok = <T>(data: T) => Promise.resolve({ data, error: null });
const err = (message: string) => Promise.resolve({ data: null, error: { message } });

describe('agendamentos create/list extra', () => {
  afterEach(() => {
    supabaseMock = undefined;
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    const baseData = () => ({
      cliente_id: 'c1',
      profissional_id: 'p1',
      unidade_id: 'u1',
      inicio: new Date('2025-08-28T09:00:00Z'),
      notas: 'obs',
      servicos: [
        { servico_id: 's1', preco_aplicado: 30, duracao_aplicada: 30 },
        { servico_id: 's2', preco_aplicado: 20, duracao_aplicada: 15 },
      ],
    });

    test('retorna erro em conflito de horário', async () => {
      supabaseMock = {
        rpc: () => Promise.resolve({ data: true, error: null }), // conflito
      };
      const result = await createAppointment(baseData());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Conflito de horário');
    });

    test('cria agendamento com sucesso', async () => {
      let servicesInserted = false;
      const newId = 'apt-ok';
      supabaseMock = {
        rpc: () => Promise.resolve({ data: false, error: null }), // sem conflito
        from: (table: string) => {
          if (table === 'professionals') {
            return { select: () => ({ eq: () => ({ single: () => ok({ ativo: true }) }) }) };
          }
          if (table === 'appointments') {
            return {
              insert: () => ({
                select: () => ({ single: () => ok({ id: newId, status: 'criado' }) }),
              }),
              delete: () => ({ eq: () => ok({}) }),
            };
          }
          if (table === 'appointments_servicos') {
            return {
              insert: () => {
                servicesInserted = true;
                return ok({});
              },
            };
          }
          return {} as any;
        },
      };
      const result = await createAppointment(baseData());
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(newId);
      expect(servicesInserted).toBe(true);
    });

    test('rollback quando insert de serviços falha', async () => {
      let deleted = false;
      const createdId = 'apt-del';
      supabaseMock = {
        rpc: () => Promise.resolve({ data: false, error: null }),
        from: (table: string) => {
          if (table === 'professionals') {
            return { select: () => ({ eq: () => ({ single: () => ok({ ativo: true }) }) }) };
          }
          if (table === 'appointments') {
            return {
              insert: () => ({
                select: () => ({ single: () => ok({ id: createdId, status: 'criado' }) }),
              }),
              delete: () => ({
                eq: () => {
                  deleted = true;
                  return ok({});
                },
              }),
            };
          }
          if (table === 'appointments_servicos') {
            return { insert: () => err('falhou serviços') };
          }
          return {} as any;
        },
      };
      const result = await createAppointment(baseData());
      expect(result.success).toBe(false);
      expect(result.error).toContain('serviços');
      expect(deleted).toBe(true);
    });
  });

  describe('listAppointments', () => {
    const dataset = [
      { id: 'a1', status: 'criado', inicio: '2025-08-28T10:00:00Z' },
      { id: 'a2', status: 'confirmado', inicio: '2025-08-28T11:00:00Z' },
    ];

    function makeQuery(data = dataset, error: any = null, count = data.length) {
      const q: any = {
        data,
        error,
        count,
        select: () => q,
        eq: () => q,
        in: () => q,
        gte: () => q,
        lte: () => q,
        or: () => q,
        order: () => q,
        range: () => q,
        then: (resolve: any) => resolve({ data: q.data, error: q.error, count: q.count }),
      };
      return q;
    }

    test('sucesso básico sem filtros especiais', async () => {
      supabaseMock = {
        from: (table: string) => {
          if (table === 'appointments') {
            return { select: () => makeQuery() };
          }
          return {} as any;
        },
      };
      const result = await listAppointments({
        page: 1,
        limit: 10,
        status: ['criado', 'confirmado'],
      });
      expect(result.success).toBe(true);
      expect(result.data?.appointments.length).toBe(2);
      expect(result.data?.total).toBe(2);
    });

    test('retorna erro do banco', async () => {
      supabaseMock = {
        from: () => ({ select: () => makeQuery([], { message: 'db down' }, 0) }),
      };
      const result = await listAppointments({ page: 1, limit: 5 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('db down');
    });
  });

  describe('checkDisponibilidade edge', () => {
    test('sem agendamentos retorna lista de slots disponíveis', async () => {
      const day = new Date('2025-08-28T00:00:00Z');
      supabaseMock = {
        from: () => ({
          select: () => ({
            eq: () => ({
              gte: () => ({
                lt: () => ({
                  not: () => ({
                    order: () => ({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };
      const result = await checkDisponibilidade({
        profissional_id: 'p1',
        data: day,
        duracao_minutos: 30,
      });
      expect(result.success).toBe(true);
      expect(result.data?.horarios_ocupados.length).toBe(0);
      expect(result.data?.horarios_disponiveis.length).toBeGreaterThan(0);
      // Primeiro slot deve estar disponível
      expect(result.data?.horarios_disponiveis[0].disponivel).toBe(true);
    });
  });
});
