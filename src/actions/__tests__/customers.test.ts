// Mock supabase server client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase/server', () => {
  let mockChain: any;

  const createMockChain = () => {
    if (!mockChain) {
      mockChain = {
        select: mockSelect.mockReturnThis(),
        eq: mockEq.mockReturnThis(),
        single: mockSingle,
        insert: mockInsert.mockReturnThis(),
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

import { createCliente } from '@/actions/clientes';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Customer CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCliente', () => {
    it('deve criar customer com campos em inglês', async () => {
      // Mock: não existe cliente com mesmo telefone
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      // Mock: inserção bem-sucedida
      mockSingle.mockResolvedValueOnce({
        data: { id: '123', name: 'João Silva', phone: '11999999999' },
        error: null,
      });

      const formData = new FormData();
      formData.append('nome', 'João Silva');
      formData.append('telefone', '11999999999');
      formData.append('email', 'joao@example.com');
      formData.append('unit_id', '550e8400-e29b-41d4-a716-446655440000');

      const result = await createCliente(formData);

      expect(result).toEqual({
        success: true,
        message: 'Operação realizada com sucesso',
        data: {
          id: '123',
          name: 'João Silva',
          phone: '11999999999',
        },
      });

      // Verificar se usou campos em inglês na query de verificação
      expect(mockSelect).toHaveBeenCalledWith('id, name');
      expect(mockEq).toHaveBeenCalledWith('phone', '11999999999');
      expect(mockEq).toHaveBeenCalledWith('unit_id', '550e8400-e29b-41d4-a716-446655440000');
      expect(mockEq).toHaveBeenCalledWith('active', true);
    });

    it('deve aceitar tanto unidade_id quanto unit_id', async () => {
      // Mock: não existe cliente
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      // Mock: inserção bem-sucedida
      mockSingle.mockResolvedValueOnce({
        data: { id: '123', name: 'João Silva' },
        error: null,
      });

      const formData = new FormData();
      formData.append('nome', 'João Silva');
      formData.append('telefone', '11999999999');
      formData.append('unidade_id', '550e8400-e29b-41d4-a716-446655440001');

      await createCliente(formData);

      // Deve usar unit_id na query mesmo recebendo unidade_id
      expect(mockEq).toHaveBeenCalledWith('unit_id', '550e8400-e29b-41d4-a716-446655440001');
    });

    it('deve rejeitar cliente duplicado', async () => {
      // Mock: existe cliente com mesmo telefone
      mockSingle.mockResolvedValueOnce({
        data: { id: '456', name: 'Cliente Existente' },
        error: null,
      });

      const formData = new FormData();
      formData.append('nome', 'João Silva');
      formData.append('telefone', '11999999999');
      formData.append('unit_id', '550e8400-e29b-41d4-a716-446655440000');

      const result = await createCliente(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cliente "Cliente Existente" já cadastrado');
    });
  });
});
