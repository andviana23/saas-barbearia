/**
 * PoC de instrumentação de cobertura para arquivo grande de server action.
 * Objetivo: forçar execução de linhas distintas e verificar se aparecem em lcov/summary.
 */
import * as Mod from '../agendamentos';

describe('PoC cobertura agendamentos', () => {
  it('executa funções dummy para marcar linhas', async () => {
    // Chamar funções de forma controlada com mocks já existentes (supabase será mockado globalmente nos outros testes)
    // Aqui somente garantimos que o módulo foi carregado e exporta as funções esperadas.
    expect(typeof Mod.createAppointment).toBe('function');
    expect(typeof Mod.rescheduleAppointment).toBe('function');
    expect(typeof Mod.updateAppointmentStatus).toBe('function');
    expect(typeof Mod.cancelAppointment).toBe('function');
    expect(typeof Mod.listAppointments).toBe('function');
    expect(typeof Mod.checkDisponibilidade).toBe('function');
    expect(typeof Mod.getAgendamentoStats).toBe('function');
    expect(typeof Mod.getAppointmentById).toBe('function');
  });
});
