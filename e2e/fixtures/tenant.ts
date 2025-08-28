import { test as base } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Fixtures para gerenciamento de tenant e isolamento de dados
 */
interface TenantData {
  unidadeId: string;
  clienteTeste: any;
  profissionalTeste: any;
  servicoTeste: any;
}

interface TestUser {
  email: string;
  password: string;
  unidadeId: string;
}

interface TenantFixtures {
  tenantData: TenantData;
  createTestData: () => Promise<void>;
  cleanupTestData: () => Promise<void>;
  testUser: TestUser;
  supabase: SupabaseClient;
}

export const test = base.extend<TenantFixtures>({
  // Dados do tenant para testes
  tenantData: async ({ testUser }, use) => {
    const tenantData = {
      unidadeId: testUser.unidadeId,
      clienteTeste: {
        nome: 'Cliente TESTE E2E',
        email: 'cliente.teste@e2e.com',
        telefone: '11999999999',
        data_nascimento: '1990-01-01',
        observacoes: 'Cliente criado para testes E2E',
      },
      profissionalTeste: {
        nome: 'Profissional TESTE E2E',
        email: 'prof.teste@e2e.com',
        telefone: '11888888888',
        papel: 'profissional',
        especialidades: ['Corte', 'Barba'],
        comissao_percentual: 30,
      },
      servicoTeste: {
        nome: 'Serviço TESTE E2E',
        descricao: 'Serviço criado para testes E2E',
        preco: 50.0,
        duracao_minutos: 60,
        categoria: 'Corte',
        ativo: true,
      },
    };

    await use(tenantData);
  },

  // Criar dados de teste
  createTestData: async ({ supabase, tenantData }, use) => {
    const createTestData = async () => {
      try {
        // Criar cliente de teste
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .insert({
            ...tenantData.clienteTeste,
            unidade_id: tenantData.unidadeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (clienteError) {
          console.warn('Erro ao criar cliente de teste:', clienteError);
        }

        // Criar profissional de teste
        const { data: profissional, error: profError } = await supabase
          .from('profissionais')
          .insert({
            ...tenantData.profissionalTeste,
            unidade_id: tenantData.unidadeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (profError) {
          console.warn('Erro ao criar profissional de teste:', profError);
        }

        // Criar serviço de teste
        const { data: servico, error: servicoError } = await supabase
          .from('servicos')
          .insert({
            ...tenantData.servicoTeste,
            unidade_id: tenantData.unidadeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (servicoError) {
          console.warn('Erro ao criar serviço de teste:', servicoError);
        }

        console.log('✅ Dados de teste criados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao criar dados de teste:', error);
      }
    };

    await use(createTestData);
  },

  // Limpar dados de teste
  cleanupTestData: async ({ supabase, tenantData }, use) => {
    const cleanupTestData = async () => {
      try {
        // Limpar dados de teste por unidade
        await supabase
          .from('clientes')
          .delete()
          .eq('unidade_id', tenantData.unidadeId)
          .like('nome', '%TESTE E2E%');

        await supabase
          .from('profissionais')
          .delete()
          .eq('unidade_id', tenantData.unidadeId)
          .like('nome', '%TESTE E2E%');

        await supabase
          .from('servicos')
          .delete()
          .eq('unidade_id', tenantData.unidadeId)
          .like('nome', '%TESTE E2E%');

        console.log('✅ Dados de teste limpos com sucesso');
      } catch (error) {
        console.error('❌ Erro ao limpar dados de teste:', error);
      }
    };

    await use(cleanupTestData);
  },
});

export { expect } from '@playwright/test';
