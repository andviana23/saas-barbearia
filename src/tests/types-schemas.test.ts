// =====================================================
// TESTES DE VALIDAÇÃO - TIPOS E SCHEMAS CENTRALIZADOS
// =====================================================

import { describe, test, expect } from '@jest/globals';
import {
  // Tipos principais
  Unidade,
  Cliente,
  
  // Schemas de validação
  CreateUnidadeSchema,
  CreateClienteSchema,
  CreateProfissionalSchema,
  CreateServicoSchema,
  CreateAppointmentSchema,
  
  // Schemas de filtros
  UnidadeFiltersSchema,
  ClienteFiltersSchema,
  
  // Tipos utilitários
  PaginationParams,
  ApiResponse,
} from '@/types';

describe('🧪 Tipos e Schemas Centralizados', () => {
  
  describe('📋 Validação de Schemas Zod', () => {
    
    test('✅ CreateUnidadeSchema - dados válidos', () => {
      const validData = {
        nome: 'Barbearia Central',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua das Flores, 123',
        telefone: '(11) 99999-9999',
        email: 'contato@barbearia.com',
        ativo: true,
        config: { horario_funcionamento: '08:00-18:00' }
      };
      
      const result = CreateUnidadeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    test('❌ CreateUnidadeSchema - nome muito curto', () => {
      const invalidData = {
        nome: 'A', // Muito curto (mín 2 caracteres)
        ativo: true,
        config: {}
      };
      
      const result = CreateUnidadeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    
    test('✅ CreateClienteSchema - dados válidos', () => {
      const validData = {
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        data_nascimento: '1990-01-01',
        cpf: '123.456.789-00',
        endereco: 'Rua A, 123',
        observacoes: 'Cliente preferencial',
        ativo: true,
        unidade_id: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = CreateClienteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    test('❌ CreateClienteSchema - email inválido', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'email-invalido', // Email malformado
        unidade_id: '123e4567-e89b-12d3-a456-426614174000',
        ativo: true
      };
      
      const result = CreateClienteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    
    test('✅ CreateProfissionalSchema - dados válidos', () => {
      const validData = {
        nome: 'Carlos Barbeiro',
        email: 'carlos@barbearia.com',
        telefone: '(11) 88888-8888',
        especialidades: ['Corte', 'Barba', 'Bigode'],
        comissao_padrao: 30,
        ativo: true,
        unidade_id: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = CreateProfissionalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    test('❌ CreateProfissionalSchema - comissão inválida', () => {
      const invalidData = {
        nome: 'Carlos Barbeiro',
        comissao_padrao: 150, // Acima de 100%
        unidade_id: '123e4567-e89b-12d3-a456-426614174000',
        ativo: true
      };
      
      const result = CreateProfissionalSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    
    test('✅ CreateServicoSchema - dados válidos', () => {
      const validData = {
        nome: 'Corte Masculino',
        descricao: 'Corte tradicional masculino',
        preco: 25.50,
        duracao: 30, // minutos
        categoria: 'Cortes',
        ativo: true,
        unidade_id: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = CreateServicoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    test('❌ CreateServicoSchema - duração muito baixa', () => {
      const invalidData = {
        nome: 'Corte Rápido',
        preco: 20,
        duracao: 2, // Menos de 5 minutos
        unidade_id: '123e4567-e89b-12d3-a456-426614174000',
        ativo: true
      };
      
      const result = CreateServicoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    
  });
  
  describe('📊 Validação de Filtros', () => {
    
    test('✅ UnidadeFiltersSchema - filtros válidos', () => {
      const validFilters = {
        nome: 'Barbearia',
        ativo: true,
        cnpj: '12.345.678',
        cidade: 'São Paulo'
      };
      
      const result = UnidadeFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });
    
    test('✅ ClienteFiltersSchema - filtros com datas', () => {
      const validFilters = {
        nome: 'João',
        ativo: true,
        unidade_id: '123e4567-e89b-12d3-a456-426614174000',
        data_nascimento_inicio: '1980-01-01',
        data_nascimento_fim: '2000-12-31'
      };
      
      const result = ClienteFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });
    
  });
  
  describe('🔧 Tipos TypeScript', () => {
    
    test('✅ Tipo Unidade - estrutura correta', () => {
      // Teste de type checking em tempo de compilação
      const unidade: Unidade = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'Barbearia Test',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua Test, 123',
        telefone: '(11) 99999-9999',
        email: 'test@barbearia.com',
        ativo: true,
        config: { test: 'value' },
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      };
      
      expect(unidade.id).toBeDefined();
      expect(unidade.nome).toBe('Barbearia Test');
      expect(unidade.ativo).toBe(true);
    });
    
    test('✅ Tipo Cliente - estrutura correta', () => {
      const cliente: Cliente = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        data_nascimento: '1990-01-01',
        cpf: '123.456.789-00',
        endereco: 'Rua A, 123',
        observacoes: 'Cliente VIP',
        ativo: true,
        unidade_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      };
      
      expect(cliente.nome).toBe('João Silva');
      expect(cliente.ativo).toBe(true);
      expect(cliente.unidade_id).toBeDefined();
    });
    
  });
  
  describe('📋 Tipos Utilitários', () => {
    
    test('✅ PaginationParams - estrutura correta', () => {
      const pagination: PaginationParams = {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };
      
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
      expect(pagination.sortOrder).toBe('desc');
    });
    
    test('✅ ApiResponse - estrutura correta', () => {
      const response: ApiResponse<Cliente[]> = {
        success: true,
        data: [],
        message: 'Dados carregados com sucesso',
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.meta?.total).toBe(0);
    });
    
  });
  
  describe('📝 Schemas de Enums', () => {
    
    test('✅ StatusAgendamento - valores válidos', () => {
      const validStatuses = [
        'agendado',
        'confirmado', 
        'em_andamento',
        'concluido',
        'cancelado',
        'nao_compareceu'
      ];
      
      validStatuses.forEach(status => {
        const appointment = {
          cliente_id: '123e4567-e89b-12d3-a456-426614174000',
          profissional_id: '123e4567-e89b-12d3-a456-426614174000',
          servico_id: '123e4567-e89b-12d3-a456-426614174000',
          unidade_id: '123e4567-e89b-12d3-a456-426614174000',
          data_hora: '2024-12-01T10:00:00Z',
          valor_servico: 30,
          status
        };
        
        const result = CreateAppointmentSchema.safeParse(appointment);
        expect(result.success).toBe(true);
      });
    });
    
  });
  
});

// =====================================================
// TESTES DE INTEGRAÇÃO COM IMPORTS
// =====================================================

describe('🔄 Testes de Import/Export', () => {
  
  test('✅ Imports dos tipos principais funcionam', () => {
    // Se chegou até aqui, os imports estão funcionando
    expect(typeof CreateUnidadeSchema).toBe('object');
    expect(typeof CreateClienteSchema).toBe('object');
    expect(typeof CreateProfissionalSchema).toBe('object');
    expect(typeof CreateServicoSchema).toBe('object');
  });
  
  test('✅ Barrel exports funcionando', () => {
    // Teste indireto dos barrel exports
    expect(CreateUnidadeSchema.parse).toBeDefined();
    expect(CreateClienteSchema.safeParse).toBeDefined();
  });
  
});
