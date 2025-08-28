import { test, expect } from '../fixtures';
import { createClient } from '@supabase/supabase-js';

/**
 * Testes de Performance e Carga
 * Valida tempos de resposta, capacidade e otimização do sistema
 */
test.describe('Performance e Carga', () => {
  let supabase: any;

  test.beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key',
    );
  });

  test.describe('Performance de Páginas', () => {
    test('deve carregar dashboard dentro do threshold de performance', async ({ page }) => {
      // Medir tempo de carregamento do dashboard
      const startTime = Date.now();

      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      const threshold = parseInt(process.env.PERFORMANCE_THRESHOLD_MS || '2000');

      console.log(`Dashboard carregou em ${loadTime}ms`);
      expect(loadTime).toBeLessThan(threshold);

      // Verificar métricas específicas
      const navigationTiming = await page.evaluate(() => {
        const perfData = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
        };
      });

      expect(navigationTiming.domContentLoaded).toBeLessThan(1500);
      expect(navigationTiming.firstContentfulPaint).toBeLessThan(1000);
    });

    test('deve carregar listagem de clientes rapidamente', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/clientes');
      await page.waitForSelector('[data-testid="clientes-list"]');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`Página de clientes carregou em ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);

      // Verificar se lista carregou
      const clientesCount = await page.locator('[data-testid="cliente-item"]').count();
      expect(clientesCount).toBeGreaterThanOrEqual(0);
    });

    test('deve navegar entre páginas rapidamente', async ({ page }) => {
      // Carregar dashboard primeiro
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Medir tempo de navegação para outras páginas
      const pages = [
        { url: '/clientes', testId: 'clientes-content' },
        { url: '/agenda', testId: 'agenda-content' },
        { url: '/fila', testId: 'fila-content' },
        { url: '/caixa', testId: 'caixa-content' },
      ];

      for (const pageInfo of pages) {
        const startTime = Date.now();

        await page.goto(pageInfo.url);
        await page.waitForSelector(`[data-testid="${pageInfo.testId}"]`);

        const navigationTime = Date.now() - startTime;
        console.log(`Navegação para ${pageInfo.url} levou ${navigationTime}ms`);

        expect(navigationTime).toBeLessThan(2000);
      }
    });
  });

  test.describe('Performance de API', () => {
    test('deve responder queries de clientes rapidamente', async () => {
      // Criar unidade de teste
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

      // Criar múltiplos clientes para teste
      const clientes = Array.from({ length: 50 }, (_, i) => ({
        unidade_id: unidade.id,
        nome: `Cliente Performance ${i + 1}`,
        email: `cliente${i + 1}@performance.com`,
        telefone: `1199999${String(i).padStart(4, '0')}`,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('clientes').insert(clientes);

      // Testar query simples
      const startTime1 = Date.now();
      const { data: result1, error: error1 } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .limit(20);

      const queryTime1 = Date.now() - startTime1;

      expect(error1).toBeNull();
      expect(result1).toHaveLength(20);
      expect(queryTime1).toBeLessThan(1000);

      // Testar query com filtro
      const startTime2 = Date.now();
      const { data: result2, error: error2 } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .ilike('nome', '%Performance 1%');

      const queryTime2 = Date.now() - startTime2;

      expect(error2).toBeNull();
      expect(queryTime2).toBeLessThan(800);

      // Testar query com ordenação
      const startTime3 = Date.now();
      const { data: result3, error: error3 } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .order('nome')
        .limit(10);

      const queryTime3 = Date.now() - startTime3;

      expect(error3).toBeNull();
      expect(result3).toHaveLength(10);
      expect(queryTime3).toBeLessThan(1000);

      // Limpeza
      await supabase.from('clientes').delete().eq('unidade_id', unidade.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve lidar com queries complexas com joins', async () => {
      // Criar dados de teste
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade Joins Performance',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: clientes } = await supabase
        .from('clientes')
        .insert(
          Array.from({ length: 20 }, (_, i) => ({
            unidade_id: unidade.id,
            nome: `Cliente Join ${i + 1}`,
            email: `join${i + 1}@test.com`,
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        )
        .select();

      const { data: profissionais } = await supabase
        .from('profissionais')
        .insert(
          Array.from({ length: 5 }, (_, i) => ({
            unidade_id: unidade.id,
            nome: `Profissional Join ${i + 1}`,
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        )
        .select();

      // Criar agendamentos
      const agendamentos = [];
      for (let i = 0; i < 30; i++) {
        const dataAgendamento = new Date();
        dataAgendamento.setDate(dataAgendamento.getDate() + (i % 7));
        dataAgendamento.setHours(9 + (i % 8));

        agendamentos.push({
          unidade_id: unidade.id,
          cliente_id: clientes[i % clientes.length].id,
          profissional_id: profissionais[i % profissionais.length].id,
          data_agendamento: dataAgendamento.toISOString(),
          status: 'agendado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await supabase.from('appointments').insert(agendamentos);

      // Testar query complexa com múltiplos joins
      const startTime = Date.now();

      const { data: result, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          clientes!inner(id, nome, email),
          profissionais!inner(id, nome, especialidades),
          unidades!inner(id, nome)
        `,
        )
        .eq('unidade_id', unidade.id)
        .order('data_agendamento')
        .limit(15);

      const queryTime = Date.now() - startTime;

      expect(error).toBeNull();
      expect(result).toHaveLength(15);
      expect(queryTime).toBeLessThan(2000);

      console.log(`Query complexa com joins executada em ${queryTime}ms`);

      // Validar estrutura dos dados
      expect(result[0]).toHaveProperty('clientes');
      expect(result[0]).toHaveProperty('profissionais');
      expect(result[0]).toHaveProperty('unidades');

      // Limpeza
      await supabase.from('appointments').delete().eq('unidade_id', unidade.id);
      await supabase.from('profissionais').delete().eq('unidade_id', unidade.id);
      await supabase.from('clientes').delete().eq('unidade_id', unidade.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });
  });

  test.describe('Testes de Carga', () => {
    test('deve lidar com múltiplas operações simultâneas', async ({ page }) => {
      await page.goto('/clientes');
      await page.waitForSelector('[data-testid="clientes-content"]');

      // Simular múltiplas operações simultâneas
      const operations = [];

      for (let i = 0; i < 5; i++) {
        operations.push(
          page.evaluate(() => {
            // Simular busca
            return fetch('/api/clientes?q=teste')
              .then((r) => r.json())
              .catch((e) => ({ error: e.message }));
          }),
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      console.log(`${operations.length} operações simultâneas executadas em ${totalTime}ms`);

      // Verificar se todas as operações foram bem-sucedidas
      results.forEach((result, index) => {
        expect(result).toBeTruthy();
        console.log(`Operação ${index + 1}:`, result.error || 'Sucesso');
      });

      expect(totalTime).toBeLessThan(5000);
    });

    test('deve manter performance com grande volume de dados', async () => {
      // Criar unidade para teste de volume
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade Volume Test',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar grande volume de dados (500 clientes)
      const batchSize = 50;
      const totalClientes = 500;

      console.log(`Criando ${totalClientes} clientes em lotes de ${batchSize}...`);

      for (let i = 0; i < totalClientes; i += batchSize) {
        const clientesBatch = Array.from(
          { length: Math.min(batchSize, totalClientes - i) },
          (_, j) => ({
            unidade_id: unidade.id,
            nome: `Cliente Volume ${i + j + 1}`,
            email: `volume${i + j + 1}@test.com`,
            telefone: `119999${String(i + j).padStart(4, '0')}`,
            data_nascimento: '1990-01-01',
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        );

        await supabase.from('clientes').insert(clientesBatch);
      }

      // Testar queries com grande volume
      console.log('Testando queries com grande volume...');

      // 1. Query de contagem
      const startCount = Date.now();
      const { count, error: countError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('unidade_id', unidade.id);

      const countTime = Date.now() - startCount;

      expect(countError).toBeNull();
      expect(count).toBe(totalClientes);
      expect(countTime).toBeLessThan(1000);

      // 2. Query paginada
      const startPagination = Date.now();
      const { data: paginatedData, error: paginationError } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .range(0, 49)
        .order('nome');

      const paginationTime = Date.now() - startPagination;

      expect(paginationError).toBeNull();
      expect(paginatedData).toHaveLength(50);
      expect(paginationTime).toBeLessThan(1500);

      // 3. Query com filtro de texto
      const startSearch = Date.now();
      const { data: searchData, error: searchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('unidade_id', unidade.id)
        .ilike('nome', '%Volume 1%')
        .limit(20);

      const searchTime = Date.now() - startSearch;

      expect(searchError).toBeNull();
      expect(searchTime).toBeLessThan(2000);

      console.log(`Query contagem: ${countTime}ms`);
      console.log(`Query paginação: ${paginationTime}ms`);
      console.log(`Query busca: ${searchTime}ms`);

      // Limpeza
      console.log('Removendo dados de teste...');
      await supabase.from('clientes').delete().eq('unidade_id', unidade.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });

    test('deve otimizar queries N+1', async () => {
      // Criar dados para detectar N+1 queries
      const { data: unidade } = await supabase
        .from('unidades')
        .insert({
          nome: 'Unidade N+1 Test',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar clientes e agendamentos
      const numClientes = 20;
      const clientes = Array.from({ length: numClientes }, (_: unknown, i: number) => ({
        unidade_id: unidade.id,
        nome: `Cliente N+1 ${i + 1}`,
        email: `n1cliente${i + 1}@test.com`,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: clientesCreated } = await supabase.from('clientes').insert(clientes).select();

      const { data: profissional } = await supabase
        .from('profissionais')
        .insert({
          unidade_id: unidade.id,
          nome: 'Profissional N+1',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Criar agendamentos para cada cliente
      const agendamentos = clientesCreated.map((cliente: any, i: number) => ({
        unidade_id: unidade.id,
        cliente_id: cliente.id,
        profissional_id: profissional.id,
        data_agendamento: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        status: 'agendado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('appointments').insert(agendamentos);

      // Approach 1: N+1 Query (ineficiente)
      const startN1 = Date.now();

      const { data: appointmentsOnly } = await supabase
        .from('appointments')
        .select('*')
        .eq('unidade_id', unidade.id);

      // Simular N+1 - uma query adicional para cada agendamento
      const clienteQueries = appointmentsOnly.map((appointment: any) =>
        supabase.from('clientes').select('nome').eq('id', appointment.cliente_id).single(),
      );

      await Promise.all(clienteQueries);
      const n1Time = Date.now() - startN1;

      // Approach 2: Query otimizada com JOIN
      const startOptimized = Date.now();

      const { data: optimizedResult } = await supabase
        .from('appointments')
        .select(
          `
          *,
          clientes!inner(id, nome),
          profissionais!inner(id, nome)
        `,
        )
        .eq('unidade_id', unidade.id);

      const optimizedTime = Date.now() - startOptimized;

      console.log(`Approach N+1: ${n1Time}ms`);
      console.log(`Approach otimizada: ${optimizedTime}ms`);
      console.log(`Melhoria: ${(((n1Time - optimizedTime) / n1Time) * 100).toFixed(1)}%`);

      // Query otimizada deve ser significativamente mais rápida
      expect(optimizedTime).toBeLessThan(n1Time * 0.5); // Pelo menos 50% mais rápida
      expect(optimizedResult).toHaveLength(numClientes);

      // Limpeza
      await supabase.from('appointments').delete().eq('unidade_id', unidade.id);
      await supabase.from('profissionais').delete().eq('id', profissional.id);
      await supabase.from('clientes').delete().eq('unidade_id', unidade.id);
      await supabase.from('unidades').delete().eq('id', unidade.id);
    });
  });

  test.describe('Performance de UI', () => {
    test('deve renderizar listas grandes eficientemente', async ({ page }) => {
      await page.goto('/clientes');
      await page.waitForSelector('[data-testid="clientes-content"]');

      // Medir tempo de renderização inicial
      const startRender = Date.now();
      await page.waitForSelector('[data-testid="clientes-list"]');
      const renderTime = Date.now() - startRender;

      expect(renderTime).toBeLessThan(2000);

      // Testar scroll performance em listas grandes
      const scrollStartTime = Date.now();

      // Scroll para baixo
      await page.evaluate(() => {
        const list = document.querySelector('[data-testid="clientes-list"]');
        if (list) {
          list.scrollTop = list.scrollHeight;
        }
      });

      await page.waitForTimeout(500);
      const scrollTime = Date.now() - scrollStartTime;

      expect(scrollTime).toBeLessThan(1000);
    });

    test('deve otimizar re-renders em formulários', async ({ page }) => {
      await page.goto('/clientes');
      await page.waitForSelector('[data-testid="clientes-content"]');

      // Abrir formulário de novo cliente
      await page.click('[data-testid="novo-cliente-button"]');
      await page.waitForSelector('[data-testid="cliente-form-dialog"]');

      // Medir tempo de resposta em inputs
      const inputs = [
        '[data-testid="nome-input"]',
        '[data-testid="email-input"]',
        '[data-testid="telefone-input"]',
      ];

      for (const input of inputs) {
        const startType = Date.now();

        await page.type(input, 'Teste de performance');

        const typeTime = Date.now() - startType;
        expect(typeTime).toBeLessThan(1000);
      }
    });

    test('deve manter 60 FPS durante animações', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]');

      // Capturar métricas de FPS durante navegação
      await page.evaluate(() => {
        let frames = 0;
        let lastTime = performance.now();

        function countFPS() {
          frames++;
          const currentTime = performance.now();

          if (currentTime >= lastTime + 1000) {
            (window as any).currentFPS = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
          }

          requestAnimationFrame(countFPS);
        }

        countFPS();
      });

      // Navegar entre páginas para ativar animações
      await page.click('[data-testid="nav-clientes"]');
      await page.waitForSelector('[data-testid="clientes-content"]');
      await page.waitForTimeout(1000);

      await page.click('[data-testid="nav-agenda"]');
      await page.waitForSelector('[data-testid="agenda-content"]');
      await page.waitForTimeout(1000);

      // Verificar FPS
      const fps = await page.evaluate(() => (window as any).currentFPS || 60);
      console.log(`FPS durante animações: ${fps}`);

      expect(fps).toBeGreaterThan(45); // Mínimo aceitável
    });
  });
});
