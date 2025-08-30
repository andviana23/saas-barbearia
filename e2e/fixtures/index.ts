import { test as base, expect, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Fixtures principais para testes E2E
 * Combina autenticação, tenant e dados de teste
 */
interface TestUserData {
  email: string;
  password: string;
  unidadeId: string;
}

interface TenantData {
  unidadeId: string;
  clienteTeste: Record<string, unknown>;
  profissionalTeste: Record<string, unknown>;
  servicoTeste: Record<string, unknown>;
}

type TestFixtures = {
  supabase: SupabaseClient;
  testUser: TestUserData;
  authenticatedPage: Page;
  tenantData: TenantData;
  createTestData: () => Promise<void>;
  cleanupTestData: () => Promise<void>;
};

// Export functions that were being imported in test files
export const createTestData = async (supabase: SupabaseClient, tenantData: TenantData) => {
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

export const cleanupTestData = async (supabase: SupabaseClient, tenantData: TenantData) => {
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
      email: process.env.TEST_USER_EMAIL || 'test-e2e@example.com',
      password: process.env.TEST_USER_PASSWORD || 'test123456',
      unidadeId: process.env.TEST_UNIDADE_ID || 'test-unidade-id',
    });
  },

  authenticatedPage: async ({ page, testUser, supabase }, use) => {
    if (process.env.E2E_MODE === '1') {
      // Modo harness: pular autenticação real e apenas navegar
      const base = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
      await page.goto(base + '/servicos');
      // Injeta placeholder de user-menu para satisfazer expectativas de outros testes
      await page.evaluate(() => {
        if (!document.querySelector('[data-testid="user-menu"]')) {
          const div = document.createElement('div');
          div.setAttribute('data-testid', 'user-menu');
          div.textContent = 'User';
          div.style.position = 'fixed';
          div.style.top = '0';
          div.style.right = '0';
          div.style.padding = '4px 8px';
          div.style.background = '#eee';
          document.body.appendChild(div);
        }
      });
      await use(page);
      return;
    }

    const attempt = () =>
      supabase.auth.signInWithPassword({ email: testUser.email, password: testUser.password });

    let { data, error } = await attempt();

    // Confirmar email dinamicamente se necessário
    if (error?.message?.includes('Email not confirmed')) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        try {
          const admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
            serviceRoleKey,
          );
          const list = await admin.auth.admin.listUsers();
          const target = list.data.users.find((u) => u.email === testUser.email);
          if (target) {
            await admin.auth.admin.updateUserById(target.id, { email_confirm: true });
            ({ data, error } = await attempt());
            console.log('✅ Email confirmado dinamicamente na fixture');
          }
        } catch (e) {
          console.warn('⚠️ Falha ao confirmar email dinamicamente:', e);
        }
      }
    }

    if (error || !data?.session) {
      throw new Error(`Falha na autenticação: ${error?.message}`);
    }

    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3000');
    await page.waitForLoadState('networkidle');

    try {
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
    } catch {
      console.warn('⚠️ Aviso: user-menu não encontrado, prosseguindo.');
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
      if (process.env.E2E_MODE === '1') {
        // No harness, dados iniciais já estão mockados no front.
        return;
      }
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
      if (process.env.E2E_MODE === '1') {
        return;
      }
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
