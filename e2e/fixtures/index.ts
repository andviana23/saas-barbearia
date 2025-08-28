import { test as base, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Fixtures principais para testes E2E
 * Combina autenticação, tenant e dados de teste
 */
type TestFixtures = {
  supabase: ReturnType<typeof createClient>;
  testUser: {
    email: string;
    password: string;
    unidadeId: string;
  };
  authenticatedPage: typeof base extends { Page: infer P } ? P : any;
  tenantData: {
    unidadeId: string;
    clienteTeste: any;
    profissionalTeste: any;
    servicoTeste: any;
  };
  createTestData: () => Promise<void>;
  cleanupTestData: () => Promise<void>;
};

// Export functions that were being imported in test files
export const createTestData = async (
  supabase: ReturnType<typeof createClient>,
  tenantData: any,
) => {
  try {
    await supabase.from('clientes').insert({
      ...tenantData.clienteTeste,
      unidade_id: tenantData.unidadeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await supabase.from('profissionais').insert({
      ...tenantData.profissionalTeste,
      unidade_id: tenantData.unidadeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await supabase.from('servicos').insert({
      ...tenantData.servicoTeste,
      unidade_id: tenantData.unidadeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    console.log('✅ Dados de teste criados');
  } catch (err) {
    console.error('❌ Erro ao criar dados de teste:', err);
  }
};

export const cleanupTestData = async (
  supabase: ReturnType<typeof createClient>,
  tenantData: any,
) => {
  try {
    await supabase
      .from('clientes')
      .delete()
      .eq('unidade_id', tenantData.unidadeId)
      .ilike('nome', '%TESTE E2E%');

    await supabase
      .from('profissionais')
      .delete()
      .eq('unidade_id', tenantData.unidadeId)
      .ilike('nome', '%TESTE E2E%');

    await supabase
      .from('servicos')
      .delete()
      .eq('unidade_id', tenantData.unidadeId)
      .ilike('nome', '%TESTE E2E%');

    console.log('✅ Dados de teste limpos');
  } catch (err) {
    console.error('❌ Erro ao limpar dados de teste:', err);
  }
};

export const test = base.extend<TestFixtures>({
  supabase: async ({}, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await use(supabase);
  },

  testUser: async ({}, use) => {
    await use({
      email: process.env.TEST_USER_EMAIL || 'test@trato.com',
      password: process.env.TEST_USER_PASSWORD || 'test123456',
      unidadeId: process.env.TEST_UNIDADE_ID || 'test-unidade-id',
    });
  },

  authenticatedPage: async ({ page, testUser, supabase }, use) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (error || !data.session) {
      throw new Error(`Falha na autenticação: ${error?.message}`);
    }

    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // opcional: validar que o menu do usuário existe
    try {
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({
        timeout: 5000,
      });
    } catch {
      console.warn('⚠️ Aviso: user-menu não encontrado, siga mesmo assim.');
    }

    await use(page);
  },

  tenantData: async ({ testUser }, use) => {
    await use({
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
    });
  },

  createTestData: async ({ supabase, tenantData }, use) => {
    async function createTestData() {
      try {
        await supabase.from('clientes').insert({
          ...tenantData.clienteTeste,
          unidade_id: tenantData.unidadeId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await supabase.from('profissionais').insert({
          ...tenantData.profissionalTeste,
          unidade_id: tenantData.unidadeId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await supabase.from('servicos').insert({
          ...tenantData.servicoTeste,
          unidade_id: tenantData.unidadeId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        console.log('✅ Dados de teste criados');
      } catch (err) {
        console.error('❌ Erro ao criar dados de teste:', err);
      }
    }
    await use(createTestData);
  },

  cleanupTestData: async ({ supabase, tenantData }, use) => {
    async function cleanupTestData() {
      try {
        await supabase
          .from('clientes')
          .delete()
          .eq('unidade_id', tenantData.unidadeId)
          .ilike('nome', '%TESTE E2E%');

        await supabase
          .from('profissionais')
          .delete()
          .eq('unidade_id', tenantData.unidadeId)
          .ilike('nome', '%TESTE E2E%');

        await supabase
          .from('servicos')
          .delete()
          .eq('unidade_id', tenantData.unidadeId)
          .ilike('nome', '%TESTE E2E%');

        console.log('✅ Dados de teste limpos');
      } catch (err) {
        console.error('❌ Erro ao limpar dados de teste:', err);
      }
    }
    await use(cleanupTestData);
  },
});

export { expect };
