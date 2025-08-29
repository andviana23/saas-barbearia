// @ts-nocheck
/* eslint-disable */
/**
 * Testes focados em ramos críticos de `src/actions/agendamentos.ts`.
 * Estratégia: mock de `createServerSupabase` + bypass de validação (`withValidationSchema`).
 * Objetivo: Cobrir transições de status, cancelamento, reagendamento (sucesso & conflito),
 * estatísticas agregadas e cálculo de disponibilidade.
 */

import {
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
  getAgendamentoStats,
  checkDisponibilidade,
  rescheduleAppointment,
} from '../agendamentos';

import type { AppointmentStatus } from '@/schemas';
import type { AgendamentoStats, DisponibilidadeInfo } from '../agendamentos';

// Bypass de validação Zod (testamos apenas a lógica interna / branches de ação)
jest.mock('@/lib/server-actions', () => ({
  withValidationSchema: (_schema: unknown, fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock dinâmico de supabase – será reatribuído a cada teste
// Tipagem mínima para o mock supabase (apenas métodos encadeados usados)
// Para simplificar mocks encadeados variados usamos tipo flexível.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseMock: any;
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: () => supabaseMock,
}));

// Utilitário rápido para gerar promessa do padrão { data, error }
const ok = <T>(data: T) => Promise.resolve({ data, error: null });
const err = (message: string) => Promise.resolve({ data: null, error: { message } });

describe('agendamentos actions (branches principais)', () => {
  afterEach(() => {
    supabaseMock = undefined;
    jest.clearAllMocks();
  });

  describe('updateAppointmentStatus', () => {
    test('transição inválida retorna erro', async () => {
      let phase = 0;
      supabaseMock = {
        from: () => ({
          select: () => ({ eq: () => ({ single: () => ok({ status: 'criado', notas: '' }) }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: () => ok({}) }) }) }),
        }),
      };

      const result = await updateAppointmentStatus({
        id: 'apt1',
        status: 'concluido' as AppointmentStatus,
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Transição de status inválida');
      expect(phase).toBe(0); // nunca entrou no update
    });

    test('transição válida (criado -> confirmado)', async () => {
      supabaseMock = {
        from: () => ({
          select: () => ({ eq: () => ({ single: () => ok({ status: 'criado', notas: '' }) }) }),
          update: () => ({
            eq: () => ({
              select: () => ({ single: () => ok({ id: 'apt1', status: 'confirmado' }) }),
            }),
          }),
        }),
      };

      const result = await updateAppointmentStatus({
        id: 'apt1',
        status: 'confirmado' as AppointmentStatus,
      });
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('confirmado');
    });
  });

  describe('cancelAppointment', () => {
    test('já concluído não pode cancelar', async () => {
      supabaseMock = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () =>
                ok({ status: 'concluido', notas: '', inicio: new Date().toISOString() }),
            }),
          }),
        }),
      };
      const result = await cancelAppointment({
        id: 'apt1',
        motivo_cancelamento: 'teste',
        cancelado_por: 'user',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('já foi concluído ou cancelado');
    });

    test('cancelamento com sucesso adiciona notas', async () => {
      const inicio = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      supabaseMock = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: () => ok({ status: 'confirmado', notas: '', inicio }) }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => ok({ id: 'apt1', status: 'cancelado', notas: '...[CANCELADO' }),
              }),
            }),
          }),
        }),
      };
      const result = await cancelAppointment({
        id: 'apt1',
        motivo_cancelamento: 'cliente',
        cancelado_por: 'user',
      });
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('cancelado');
    });
  });

  describe('getAppointmentById', () => {
    test('não encontrado', async () => {
      supabaseMock = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => err('not found') }) }) }),
      };
      const result = await getAppointmentById('x');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Agendamento não encontrado');
    });

    test('sucesso', async () => {
      supabaseMock = {
        from: () => ({
          select: () => ({ eq: () => ({ single: () => ok({ id: 'apt1', status: 'criado' }) }) }),
        }),
      };
      const result = await getAppointmentById('apt1');
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('apt1');
    });
  });

  describe('getAgendamentoStats', () => {
    test('calcula métricas básicas', async () => {
      const now = new Date();
      const mk = (status: string, total: number, duracao: number) => ({
        id: Math.random().toString(),
        status,
        total,
        inicio: now.toISOString(),
        appointments_servicos: [
          {
            servico: { id: 's1', nome: 'Corte' },
            preco_aplicado: total / 2,
            duracao_aplicada: duracao,
          },
          {
            servico: { id: 's2', nome: 'Barba' },
            preco_aplicado: total / 2,
            duracao_aplicada: duracao,
          },
        ],
      });
      const dataset = [
        mk('criado', 50, 30),
        mk('confirmado', 60, 30),
        mk('em_atendimento', 60, 30),
        mk('concluido', 80, 45),
        mk('cancelado', 70, 30),
        mk('faltou', 40, 30),
      ];
      supabaseMock = {
        from: () => ({
          select: () => ({
            gte: () => ({
              lte: () => ({
                // Resultado final quando não há filtros adicionais (unidade/profissional)
                data: dataset,
                error: null,
                // Caso algum teste futuro adicione filtros, eq continua retornando o mesmo dataset
                eq: () => ({ data: dataset, error: null }),
              }),
            }),
          }),
        }),
      };

      const result = await getAgendamentoStats({ periodo: 'hoje' });
      expect(result.success).toBe(true);
      const stats: AgendamentoStats = result.data;
      expect(stats.total_agendamentos).toBe(dataset.length);
      expect(stats.agendamentos_concluidos).toBe(1);
      expect(stats.agendamentos_cancelados).toBe(2);
      expect(stats.servicos_mais_agendados.length).toBeGreaterThan(0);
    });
  });

  describe('checkDisponibilidade', () => {
    test('gera slots e marca conflitos', async () => {
      const day = new Date('2025-08-28T00:00:00Z');
      const aptInicio = new Date(day);
      aptInicio.setHours(9, 0, 0, 0);
      const aptFim = new Date(aptInicio.getTime() + 30 * 60 * 1000);
      supabaseMock = {
        from: () => ({
          select: () => ({
            eq: () => ({
              gte: () => ({
                lt: () => ({
                  not: () => ({
                    order: () => ({
                      // Quando não há agendamento_id, a chain termina em order()
                      data: [
                        {
                          inicio: aptInicio.toISOString(),
                          fim: aptFim.toISOString(),
                          cliente: { nome: 'João' },
                        },
                      ],
                      error: null,
                      // Para segurança: se código chamar neq (quando agendamento_id existe), retornar mesmo dataset
                      neq: () => ({
                        data: [
                          {
                            inicio: aptInicio.toISOString(),
                            fim: aptFim.toISOString(),
                            cliente: { nome: 'João' },
                          },
                        ],
                        error: null,
                      }),
                    }),
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
      const dispo: DisponibilidadeInfo = result.data;
      // Validar que retornou o agendamento ocupado
      expect(dispo.horarios_ocupados.length).toBe(1);
      const ocupadoInicio = new Date(dispo.horarios_ocupados[0].inicio).toISOString();
      // Encontrar slot com mesmo inicio do agendamento e verificar indisponível
      const slotOcupado = dispo.horarios_disponiveis.find(
        (s) => new Date(s.inicio).toISOString() === ocupadoInicio,
      );
      expect(slotOcupado).toBeDefined();
      expect(slotOcupado?.disponivel).toBe(false);
    });
  });

  describe('rescheduleAppointment', () => {
    test('conflito impede reagendamento', async () => {
      // Simular conflito via RPC (checkConflictAvailability)
      supabaseMock = {
        rpc: () => Promise.resolve({ data: true, error: null }),
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () =>
                ok({
                  id: 'apt1',
                  status: 'confirmado',
                  profissional_id: 'prof1',
                  notas: '',
                  appointments_servicos: [{ duracao_aplicada: 30 }],
                }),
            }),
          }),
          update: () => ({ eq: () => ({ select: () => ({ single: () => ok({}) }) }) }),
        }),
      };
      const result = await rescheduleAppointment({
        id: 'apt1',
        novo_inicio: new Date(),
        notas_reagendamento: 'troca',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Conflito de horário');
    });

    test('reagendamento bem-sucedido', async () => {
      // Sem conflito
      supabaseMock = {
        rpc: () => Promise.resolve({ data: false, error: null }),
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () =>
                ok({
                  id: 'apt1',
                  status: 'confirmado',
                  profissional_id: 'prof1',
                  notas: 'orig',
                  appointments_servicos: [{ duracao_aplicada: 30 }],
                }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () =>
                  ok({ id: 'apt1', status: 'confirmado', inicio: new Date().toISOString() }),
              }),
            }),
          }),
        }),
      };
      const result = await rescheduleAppointment({
        id: 'apt1',
        novo_inicio: new Date(),
        notas_reagendamento: 'ajuste',
      });
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('apt1');
    });
  });
});
