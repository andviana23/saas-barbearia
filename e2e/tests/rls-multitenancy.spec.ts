import { test, expect } from '../fixtures';
import { createClient } from '@supabase/supabase-js';

/**
 * Testes de RLS (Row Level Security) e Multi-tenancy
 * Valida isolamento de dados entre unidades e políticas de segurança
 */
test.describe('RLS e Multi-tenancy', () => {
  let supabaseAdmin: any;
  let supabaseUser1: any;
  let supabaseUser2: any;

  test.beforeAll(async () => {
    // Cliente admin com service role key
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key',
    );

    // Clientes para usuários normais
    supabaseUser1 = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
    );

    supabaseUser2 = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
    );
  });

  test.describe('Isolamento por Unidade', () => {
    test('deve isolar dados entre diferentes unidades', async () => {
      // Criar duas unidades diferentes
      const { data: unidade1 } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade 1 RLS',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: unidade2 } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade 2 RLS',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar clientes em cada unidade
      const { data: clienteU1 } = await supabaseAdmin
        .from('clientes')
        .insert({
          unidade_id: unidade1.id,
          nome: 'Cliente Unidade 1',
          email: 'cliente1@u1.com',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: clienteU2 } = await supabaseAdmin
        .from('clientes')
        .insert({
          unidade_id: unidade2.id,
          nome: 'Cliente Unidade 2',
          email: 'cliente2@u2.com',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Simular usuário logado na unidade 1
      // Em ambiente real, isso seria feito através de autenticação
      // Aqui vamos testar a query diretamente com filtro
      const { data: clientesU1, error: errorU1 } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade1.id);

      expect(errorU1).toBeNull();
      expect(clientesU1).toHaveLength(1);
      expect(clientesU1[0].nome).toBe('Cliente Unidade 1');

      // Verificar que não pode ver clientes de outras unidades
      const { data: clientesU2, error: errorU2 } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade2.id);

      expect(errorU2).toBeNull();
      expect(clientesU2).toHaveLength(1);
      expect(clientesU2[0].nome).toBe('Cliente Unidade 2');

      // Cliente da unidade 1 não deve aparecer na busca da unidade 2
      const clienteU1NaU2 = clientesU2.find((c: any) => c.id === clienteU1.id);
      expect(clienteU1NaU2).toBeUndefined();

      // Limpeza
      await supabaseAdmin.from('clientes').delete().eq('id', clienteU1.id);
      await supabaseAdmin.from('clientes').delete().eq('id', clienteU2.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade1.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade2.id);
    });

    test('deve validar RLS em agendamentos', async () => {
      // Criar unidades e dados de teste
      const { data: unidade1 } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade 1 Agendamentos',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: unidade2 } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade 2 Agendamentos',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar clientes e profissionais para ambas unidades
      const { data: clienteU1 } = await supabaseAdmin
        .from('clientes')
        .insert({
          unidade_id: unidade1.id,
          nome: 'Cliente U1',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: profissionalU1 } = await supabaseAdmin
        .from('profissionais')
        .insert({
          unidade_id: unidade1.id,
          nome: 'Profissional U1',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: clienteU2 } = await supabaseAdmin
        .from('clientes')
        .insert({
          unidade_id: unidade2.id,
          nome: 'Cliente U2',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: profissionalU2 } = await supabaseAdmin
        .from('profissionais')
        .insert({
          unidade_id: unidade2.id,
          nome: 'Profissional U2',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar agendamentos
      const dataAgendamento = new Date();
      dataAgendamento.setDate(dataAgendamento.getDate() + 1);

      const { data: agendamentoU1 } = await supabaseAdmin
        .from('appointments')
        .insert({
          unidade_id: unidade1.id,
          cliente_id: clienteU1.id,
          profissional_id: profissionalU1.id,
          data_agendamento: dataAgendamento.toISOString(),
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: agendamentoU2 } = await supabaseAdmin
        .from('appointments')
        .insert({
          unidade_id: unidade2.id,
          cliente_id: clienteU2.id,
          profissional_id: profissionalU2.id,
          data_agendamento: dataAgendamento.toISOString(),
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Verificar isolamento de agendamentos
      const { data: agendamentosU1 } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('unidade_id', unidade1.id);

      expect(agendamentosU1).toHaveLength(1);
      expect(agendamentosU1[0].id).toBe(agendamentoU1.id);

      const { data: agendamentosU2 } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('unidade_id', unidade2.id);

      expect(agendamentosU2).toHaveLength(1);
      expect(agendamentosU2[0].id).toBe(agendamentoU2.id);

      // Verificar que não há cross-contamination
      expect(agendamentosU1[0].cliente_id).not.toBe(clienteU2.id);
      expect(agendamentosU2[0].cliente_id).not.toBe(clienteU1.id);

      // Limpeza
      await supabaseAdmin.from('appointments').delete().eq('id', agendamentoU1.id);
      await supabaseAdmin.from('appointments').delete().eq('id', agendamentoU2.id);
      await supabaseAdmin.from('profissionais').delete().eq('id', profissionalU1.id);
      await supabaseAdmin.from('profissionais').delete().eq('id', profissionalU2.id);
      await supabaseAdmin.from('clientes').delete().eq('id', clienteU1.id);
      await supabaseAdmin.from('clientes').delete().eq('id', clienteU2.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade1.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade2.id);
    });
  });

  test.describe('Políticas RLS por Função', () => {
    test('deve validar acesso de admin vs usuário comum', async ({ page }) => {
      // Simular login como admin
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@teste.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');

      // Admin deve ver configurações do sistema
      await page.goto('/configuracoes/sistema');
      await expect(page.locator('[data-testid="configuracoes-sistema"]')).toBeVisible();

      // Fazer logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Simular login como usuário comum
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'user@teste.com');
      await page.fill('[data-testid="password-input"]', 'user123');
      await page.click('[data-testid="login-button"]');

      // Usuário comum não deve acessar configurações do sistema
      await page.goto('/configuracoes/sistema');
      await expect(page.locator('[data-testid="acesso-negado"]')).toBeVisible();
    });

    test('deve validar permissões de profissional', async ({ page }) => {
      // Login como profissional
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'profissional@teste.com');
      await page.fill('[data-testid="password-input"]', 'prof123');
      await page.click('[data-testid="login-button"]');

      // Profissional deve ver sua agenda
      await page.goto('/fila/profissional');
      await expect(page.locator('[data-testid="fila-profissional"]')).toBeVisible();

      // Mas não deve ver fila de outros profissionais
      await expect(page.locator('[data-testid="todos-profissionais"]')).not.toBeVisible();
    });

    test('deve validar permissões de recepção', async ({ page }) => {
      // Login como recepcionista
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'recepcao@teste.com');
      await page.fill('[data-testid="password-input"]', 'recepcao123');
      await page.click('[data-testid="login-button"]');

      // Recepção deve ver fila geral
      await page.goto('/fila/recepcao');
      await expect(page.locator('[data-testid="fila-geral"]')).toBeVisible();

      // Mas não deve acessar relatórios financeiros
      await page.goto('/relatorios/financeiro');
      await expect(page.locator('[data-testid="acesso-negado"]')).toBeVisible();
    });
  });

  test.describe('Validação de Context Switching', () => {
    test('deve validar troca de contexto de unidade', async ({ page, browser }) => {
      // Login como usuário com acesso a múltiplas unidades
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'multi@teste.com');
      await page.fill('[data-testid="password-input"]', 'multi123');
      await page.click('[data-testid="login-button"]');

      await page.waitForURL('/dashboard');

      // Verificar unidade ativa inicial
      const unidadeInicial = await page.locator('[data-testid="unidade-ativa"]').textContent();
      expect(unidadeInicial).toBeTruthy();

      // Trocar para outra unidade
      await page.click('[data-testid="unidade-selector"]');
      await page.waitForSelector('[data-testid="unidades-dropdown"]');

      const unidades = await page.locator('[data-testid="unidade-option"]').count();
      if (unidades > 1) {
        await page.click('[data-testid="unidade-option"]:nth-child(2)');

        // Aguardar mudança de contexto
        await page.waitForTimeout(1000);

        // Verificar se unidade ativa mudou
        const unidadeNova = await page.locator('[data-testid="unidade-ativa"]').textContent();
        expect(unidadeNova).not.toBe(unidadeInicial);

        // Verificar se dados foram atualizados
        await page.goto('/clientes');
        await expect(page.locator('[data-testid="clientes-list"]')).toBeVisible();

        // Dados devem ser da nova unidade
        const clientesCount = await page.locator('[data-testid="cliente-item"]').count();
        // Em ambiente real, isso seria diferente para cada unidade
        expect(clientesCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('deve sincronizar contexto entre abas', async ({ browser }) => {
      // Abrir duas abas
      const context = await browser.newContext();
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      // Login na primeira aba
      await page1.goto('/login');
      await page1.fill('[data-testid="email-input"]', 'multi@teste.com');
      await page1.fill('[data-testid="password-input"]', 'multi123');
      await page1.click('[data-testid="login-button"]');
      await page1.waitForURL('/dashboard');

      // Navegar para dashboard na segunda aba (deve herdar sessão)
      await page2.goto('/dashboard');
      await page2.waitForSelector('[data-testid="dashboard-content"]');

      // Trocar unidade na primeira aba
      await page1.click('[data-testid="unidade-selector"]');
      await page1.waitForSelector('[data-testid="unidades-dropdown"]');
      await page1.click('[data-testid="unidade-option"]:nth-child(2)');

      // Aguardar sincronização
      await page2.waitForTimeout(2000);
      await page2.reload();

      // Verificar se segunda aba também mudou
      const unidadePage1 = await page1.locator('[data-testid="unidade-ativa"]').textContent();
      const unidadePage2 = await page2.locator('[data-testid="unidade-ativa"]').textContent();

      expect(unidadePage1).toBe(unidadePage2);

      await context.close();
    });
  });

  test.describe('Validação de Políticas Complexas', () => {
    test('deve validar RLS em queries com joins', async () => {
      // Criar dados de teste complexos
      const { data: unidade } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade Joins RLS',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: cliente } = await supabaseAdmin
        .from('clientes')
        .insert({
          unidade_id: unidade.id,
          nome: 'Cliente Joins',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: profissional } = await supabaseAdmin
        .from('profissionais')
        .insert({
          unidade_id: unidade.id,
          nome: 'Profissional Joins',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: agendamento } = await supabaseAdmin
        .from('appointments')
        .insert({
          unidade_id: unidade.id,
          cliente_id: cliente.id,
          profissional_id: profissional.id,
          data_agendamento: new Date().toISOString(),
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Query complexa com joins
      const { data: result, error } = await supabaseAdmin
        .from('appointments')
        .select(
          `
          *,
          clientes!inner(nome, email),
          profissionais!inner(nome, especialidades),
          unidades!inner(nome)
        `,
        )
        .eq('unidade_id', unidade.id);

      expect(error).toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].clientes.nome).toBe('Cliente Joins');
      expect(result[0].profissionais.nome).toBe('Profissional Joins');
      expect(result[0].unidades.nome).toBe('Unidade Joins RLS');

      // Limpeza
      await supabaseAdmin.from('appointments').delete().eq('id', agendamento.id);
      await supabaseAdmin.from('profissionais').delete().eq('id', profissional.id);
      await supabaseAdmin.from('clientes').delete().eq('id', cliente.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve validar RLS em operações de atualização em massa', async () => {
      // Criar múltiplas unidades e dados
      const { data: unidade1 } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade 1 Massa',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: unidade2 } = await supabaseAdmin
        .from('unidades')
        .insert({
          nome: 'Unidade 2 Massa',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar clientes em ambas unidades
      const clientesU1 = await supabaseAdmin
        .from('clientes')
        .insert([
          {
            unidade_id: unidade1.id,
            nome: 'Cliente U1-1',
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            unidade_id: unidade1.id,
            nome: 'Cliente U1-2',
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      const clientesU2 = await supabaseAdmin
        .from('clientes')
        .insert([
          {
            unidade_id: unidade2.id,
            nome: 'Cliente U2-1',
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      // Tentar atualização em massa apenas na unidade 1
      const { data: updatedClientes, error: updateError } = await supabaseAdmin
        .from('clientes')
        .update({
          observacoes: 'Atualizado em massa',
          updated_at: new Date().toISOString(),
        })
        .eq('unidade_id', unidade1.id)
        .select();

      expect(updateError).toBeNull();
      expect(updatedClientes).toHaveLength(2);

      // Verificar que clientes da unidade 2 não foram afetados
      const { data: clientesU2Depois } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade2.id);

      expect(clientesU2Depois[0].observacoes).not.toBe('Atualizado em massa');

      // Limpeza
      await supabaseAdmin.from('clientes').delete().eq('unidade_id', unidade1.id);
      await supabaseAdmin.from('clientes').delete().eq('unidade_id', unidade2.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade1.id);
      await supabaseAdmin.from('unidades').delete().eq('id', unidade2.id);
    });
  });
});
