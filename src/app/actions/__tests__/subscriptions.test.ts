// Simplified test aligned com implementação atual (schema atualizado)
import { createSubscription, cancelSubscription } from '../subscriptions';

// Mock supabase server client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/supabase/server', () => {
  let mockChain: {
    select: jest.Mock;
    eq: jest.Mock;
    single: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  } | null;

  const createMockChain = () => {
    if (!mockChain) {
      mockChain = {
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle,
        insert: mockInsert.mockReturnThis(),
        update: mockUpdate.mockReturnThis(),
      };
    }
    return mockChain;
  };

  return {
    createServerSupabase: () => ({
      from: () => createMockChain(),
    }),
  };
});

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Subscription Operations (updated)', () => {
  const mockUnitId = '550e8400-e29b-41d4-a716-446655440000';
  const mockCustomerId = '550e8400-e29b-41d4-a716-446655440001';
  const mockPlanId = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('cria assinatura básica', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'sub-123',
          plan_id: mockPlanId,
          customer_id: mockCustomerId,
          unit_id: mockUnitId,
          status: 'active',
          start_date: '2025-08-27',
          end_date: '2025-09-27',
        },
        error: null,
      });
      const fd = new FormData();
      fd.append('plan_id', mockPlanId);
      fd.append('customer_id', mockCustomerId);
      fd.append('unit_id', mockUnitId);
      fd.append('start_date', '2025-08-27');
      fd.append('end_date', '2025-09-27');
      const result = await createSubscription(fd);
      expect(result.success).toBe(true);
      expect(result.data?.planId).toBe(mockPlanId);
      expect(result.data?.unitId).toBe(mockUnitId);
      expect(result.data?.customerId).toBe(mockCustomerId);
    });

    it('falha em dados inválidos (faltando campos)', async () => {
      const fd = new FormData();
      const result = await createSubscription(fd);
      expect(result.success).toBe(false);
    });
  });

  describe('cancelSubscription', () => {
    it('cancela assinatura existente', async () => {
      // Implementação atual faz apenas update direto, então apenas 1 retorno
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'sub-123',
          plan_id: mockPlanId,
          customer_id: mockCustomerId,
          unit_id: mockUnitId,
          status: 'cancelled',
          start_date: '2025-08-27',
          end_date: '2025-08-28',
        },
        error: null,
      });
      const result = await cancelSubscription('sub-123');
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('cancelled');
    });
  });
});
