import { test, expect } from '../fixtures';
import { createClient } from '@supabase/supabase-js';

/**
 * Testes de Validação dos Endpoints do Supabase
 * Valida todos os endpoints implementados, contratos de API e RLS
 */
test.describe('Validação Supabase', () => {
  let supabase: any;

  test.beforeAll(async () => {
    // Criar cliente Supabase para testes diretos
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key',
    );
  });

  test.describe('Validação de Endpoints CRUD', () => {
    test('deve validar endpoints de unidades', async () => {
      // Teste de criação
      const { data: createData, error: createError } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade Teste E2E',
          cnpj: '12.345.678/0001-90',
          endereco: 'Rua Teste, 123',
          telefone: '11999999999',
          email: 'teste@unidade.com',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(createData).toBeTruthy();
      expect(createData.nome).toBe('Unidade Teste E2E');

      const unidadeId = createData.id;

      // Teste de leitura
      const { data: readData, error: readError } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', unidadeId)
        .single();

      expect(readError).toBeNull();
      expect(readData).toBeTruthy();
      expect(readData.id).toBe(unidadeId);

      // Teste de atualização
      const { data: updateData, error: updateError } = await supabase
        .from('unidades')
        .update({
          nome: 'Unidade Teste E2E Atualizada',
          updated_at: new Date().toISOString(),
        })
        .eq('id', unidadeId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updateData.nome).toBe('Unidade Teste E2E Atualizada');

      // Teste de exclusão
      const { error: deleteError } = await supabase.from('unidades').delete().eq('id', unidadeId);

      expect(deleteError).toBeNull();

      // Verificar se foi excluído
      const { data: checkData, error: checkError } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', unidadeId);

      expect(checkError).toBeNull();
      expect(checkData).toHaveLength(0);
    });

    test('deve validar endpoints de clientes', async () => {
      // Primeiro criar uma unidade para o cliente
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade para Cliente',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Teste CRUD de clientes
      const { data: createData, error: createError } = await supabase
        .from('clientes')
        .insert({
          unidade_id: unidade.id,
          nome: 'Cliente Teste E2E',
          email: 'cliente@teste.com',
          telefone: '11999999999',
          data_nascimento: '1990-01-01',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(createData).toBeTruthy();
      expect(createData.unidade_id).toBe(unidade.id);

      const clienteId = createData.id;

      // Teste de busca
      const { data: searchData, error: searchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .ilike('nome', '%Cliente Teste%');

      expect(searchError).toBeNull();
      expect(searchData).toHaveLength(1);
      expect(searchData[0].id).toBe(clienteId);

      // Limpeza
      await supabase.from('clientes').delete().eq('id', clienteId);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve validar endpoints de profissionais', async () => {
      // Criar unidade
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade para Profissional',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Teste CRUD de profissionais
      const { data: createData, error: createError } = await supabase
        .from('profissionais')
        .insert({
          unidade_id: unidade.id,
          nome: 'Profissional Teste E2E',
          email: 'prof@teste.com',
          telefone: '11888888888',
          especialidades: ['Corte', 'Barba'],
          comissao_percentual: 30,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(createData).toBeTruthy();
      expect(createData.especialidades).toContain('Corte');

      // Limpeza
      await supabase.from('profissionais').delete().eq('id', createData.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve validar endpoints de agendamentos', async () => {
      // Criar dados necessários
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade para Agendamento',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: cliente } = await supabase
        .from('clientes')
        .insert({
          unidade_id: unidade.id,
          nome: 'Cliente Agendamento',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: profissional } = await supabase
        .from('profissionais')
        .insert({
          unidade_id: unidade.id,
          nome: 'Profissional Agendamento',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar agendamento
      const dataAgendamento = new Date();
      dataAgendamento.setDate(dataAgendamento.getDate() + 1); // Amanhã

      const { data: agendamento, error: agendamentoError } = await supabase
        .from('appointments')
        .insert({
          unidade_id: unidade.id,
          cliente_id: cliente.id,
          profissional_id: profissional.id,
          data_agendamento: dataAgendamento.toISOString(),
          status: 'agendado',
          observacoes: 'Agendamento teste E2E',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(agendamentoError).toBeNull();
      expect(agendamento).toBeTruthy();
      expect(agendamento.cliente_id).toBe(cliente.id);

      // Limpeza
      await supabase.from('appointments').delete().eq('id', agendamento.id);
      await supabase.from('profissionais').delete().eq('id', profissional.id);
      await supabase.from('clientes').delete().eq('id', cliente.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });
  });

  test.describe('Validação de Schemas Zod', () => {
    test('deve validar schema de unidade', async ({ page }) => {
      // Navegar para página que usa validação de unidade
      await page.goto('/configuracoes/unidade');

      // Tentar enviar formulário inválido
      await page.click('[data-testid="salvar-unidade-button"]');

      // Verificar se validações Zod estão funcionando
      await expect(page.locator('[data-testid="nome-error"]')).toContainText('obrigatório');
    });

    test('deve validar schema de cliente', async ({ page }) => {
      await page.goto('/clientes');

      await page.click('[data-testid="novo-cliente-button"]');
      await page.waitForSelector('[data-testid="cliente-form-dialog"]');

      // Enviar formulário vazio
      await page.click('[data-testid="salvar-cliente-button"]');

      // Verificar validações
      await expect(page.locator('[data-testid="nome-error"]')).toBeVisible();
    });

    test('deve validar formato de telefone brasileiro', async ({ page }) => {
      await page.goto('/clientes');

      await page.click('[data-testid="novo-cliente-button"]');
      await page.waitForSelector('[data-testid="cliente-form-dialog"]');

      // Preencher com telefone inválido
      await page.fill('[data-testid="nome-input"]', 'Teste');
      await page.fill('[data-testid="telefone-input"]', '123');
      await page.click('[data-testid="salvar-cliente-button"]');

      // Verificar se validação de telefone funciona
      await expect(page.locator('[data-testid="telefone-error"]')).toContainText(
        'formato brasileiro',
      );
    });
  });

  test.describe('Validação de Constraints SQL', () => {
    test('deve validar constraint de email único', async () => {
      // Criar unidade
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade Constraint',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar primeiro cliente
      const { data: cliente1 } = await supabase
        .from('clientes')
        .insert({
          unidade_id: unidade.id,
          nome: 'Cliente 1',
          email: 'email@unico.com',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(cliente1).toBeTruthy();

      // Tentar criar segundo cliente com mesmo email
      const { data: cliente2, error: constraintError } = await supabase
        .from('clientes')
        .insert({
          unidade_id: unidade.id,
          nome: 'Cliente 2',
          email: 'email@unico.com', // Email duplicado
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(constraintError).toBeTruthy();
      expect(constraintError.code).toBe('23505'); // Unique violation

      // Limpeza
      await supabase.from('clientes').delete().eq('id', cliente1.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve validar constraint de conflito de agendamentos', async () => {
      // Criar dados base
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade Conflito',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: cliente } = await supabase
        .from('clientes')
        .insert({
          unidade_id: unidade.id,
          nome: 'Cliente Conflito',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: profissional } = await supabase
        .from('profissionais')
        .insert({
          unidade_id: unidade.id,
          nome: 'Profissional Conflito',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 1);
      dataHora.setHours(14, 0, 0, 0);

      // Criar primeiro agendamento
      const { data: agendamento1 } = await supabase
        .from('appointments')
        .insert({
          unidade_id: unidade.id,
          cliente_id: cliente.id,
          profissional_id: profissional.id,
          data_agendamento: dataHora.toISOString(),
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(agendamento1).toBeTruthy();

      // Tentar criar agendamento conflitante
      const { data: agendamento2, error: conflictError } = await supabase
        .from('appointments')
        .insert({
          unidade_id: unidade.id,
          cliente_id: cliente.id,
          profissional_id: profissional.id,
          data_agendamento: dataHora.toISOString(), // Mesmo horário
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Deve falhar por conflito de horário (se constraint estiver implementada)
      expect(conflictError).toBeTruthy();

      // Limpeza
      await supabase.from('appointments').delete().eq('id', agendamento1.id);
      await supabase.from('profissionais').delete().eq('id', profissional.id);
      await supabase.from('clientes').delete().eq('id', cliente.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });
  });

  test.describe('Validação de Performance', () => {
    test('deve validar tempo de resposta das queries', async () => {
      // Criar dados para teste de performance
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade Performance',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar múltiplos clientes
      const clientes = [];
      for (let i = 0; i < 100; i++) {
        clientes.push({
          unidade_id: unidade.id,
          nome: `Cliente ${i}`,
          email: `cliente${i}@performance.com`,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await supabase.from('clientes').insert(clientes);

      // Testar query de busca
      const startTime = Date.now();

      const { data: searchResults, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .order('nome');

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(searchResults).toHaveLength(100);
      expect(queryTime).toBeLessThan(2000); // Menos de 2 segundos

      // Limpeza
      await supabase.from('clientes').delete().eq('unidade_id', unidade.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve validar queries complexas com joins', async () => {
      // Teste de query com múltiplos joins
      const startTime = Date.now();

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          clientes(nome, email),
          profissionais(nome, especialidades),
          unidades(nome)
        `,
        )
        .limit(10);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(queryTime).toBeLessThan(3000); // Menos de 3 segundos para joins
    });
  });

  test.describe('Validação de Error Handling', () => {
    test('deve tratar erro de timeout graciosamente', async ({ page }) => {
      // Simular request que demora muito
      await page.route('**/supabase.co/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10s delay
        await route.continue();
      });

      await page.goto('/clientes');

      // Verificar se loading state é mostrado
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

      // Verificar se erro de timeout é tratado
      await expect(page.locator('[data-testid="error-timeout"]')).toBeVisible({
        timeout: 15000,
      });
    });

    test('deve tratar erro de rede graciosamente', async ({ page }) => {
      // Simular falha de rede
      await page.route('**/supabase.co/**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/clientes');

      // Verificar se erro de rede é tratado
      await expect(page.locator('[data-testid="error-network"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });
  });
});
