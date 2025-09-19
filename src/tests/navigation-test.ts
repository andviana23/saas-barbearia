/**
 * Script de teste para verificar breadcrumbs e navegação hierárquica
 * Este arquivo será removido após os testes
 */

import { routes, findRouteByPath, ROUTE_PATHS } from '@/routes';

interface NavigationTestResult {
  route: string;
  breadcrumbsGenerated: boolean;
  routeFound: boolean;
  hasValidPath: boolean;
  hasValidLabel: boolean;
  error?: string;
}

/**
 * Simula a função generateBreadcrumbs do TratoHeader
 */
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  // Adiciona sempre o Dashboard como primeiro item
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
  });

  // Constrói breadcrumbs para cada segmento
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Pula o dashboard já adicionado
    if (currentPath === '/dashboard') continue;

    const route = findRouteByPath(currentPath);

    if (route) {
      breadcrumbs.push({
        label: route.label,
        href: currentPath,
      });
    } else {
      // Para rotas dinâmicas ou não encontradas, usa o segmento como label
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Testa uma rota específica
 */
function testRoute(routePath: string): NavigationTestResult {
  const result: NavigationTestResult = {
    route: routePath,
    breadcrumbsGenerated: false,
    routeFound: false,
    hasValidPath: false,
    hasValidLabel: false,
  };

  try {
    // Verifica se a rota existe
    const route = findRouteByPath(routePath);
    result.routeFound = !!route;

    if (route) {
      result.hasValidPath = !!route.path;
      result.hasValidLabel = !!route.label;
    }

    // Testa geração de breadcrumbs
    const breadcrumbs = generateBreadcrumbs(routePath);
    result.breadcrumbsGenerated = breadcrumbs.length > 0;

    // Verifica se o breadcrumb final corresponde à rota
    if (breadcrumbs.length > 1) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      if (route && lastBreadcrumb.label !== route.label) {
        result.error = `Breadcrumb label mismatch: expected "${route.label}", got "${lastBreadcrumb.label}"`;
      }
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

/**
 * Executa todos os testes de navegação
 */
export function runNavigationTests(): NavigationTestResult[] {
  const testRoutes = [
    '/dashboard',
    '/agenda',
    '/clientes',
    '/profissionais',
    '/servicos',
    '/servicos/categorias',
    '/caixa',
    '/estoque',
    '/fila',
    '/cadastros',
    '/cadastros/produtos',
    '/cadastros/tipos',
    '/financeiro',
    '/marketplace',
    '/relatorios',
    '/notificacoes',
    '/unidades',
    '/metas',
    '/assinaturas',
    '/ajuda',
    // Rotas dinâmicas para teste
    '/clientes/123',
    '/agenda/456',
    '/servicos/categorias/789',
  ];

  return testRoutes.map(testRoute);
}

/**
 * Gera relatório dos testes
 */
export function generateTestReport(results: NavigationTestResult[]): string {
  const passed = results.filter((r) => !r.error && r.breadcrumbsGenerated);
  const failed = results.filter((r) => r.error || !r.breadcrumbsGenerated);

  let report = `
=== RELATÓRIO DE TESTES DE NAVEGAÇÃO ===

Total de rotas testadas: ${results.length}
✅ Passou: ${passed.length}
❌ Falhou: ${failed.length}

`;

  if (failed.length > 0) {
    report += `\n--- FALHAS ---\n`;
    failed.forEach((result) => {
      report += `❌ ${result.route}\n`;
      if (result.error) {
        report += `   Erro: ${result.error}\n`;
      }
      if (!result.breadcrumbsGenerated) {
        report += `   Breadcrumbs não foram gerados\n`;
      }
      if (!result.routeFound) {
        report += `   Rota não encontrada no sistema\n`;
      }
      report += `\n`;
    });
  }

  if (passed.length > 0) {
    report += `\n--- SUCESSOS ---\n`;
    passed.forEach((result) => {
      report += `✅ ${result.route} - Breadcrumbs: OK, Rota: ${result.routeFound ? 'OK' : 'Não encontrada'}\n`;
    });
  }

  return report;
}

// Executa os testes se executado diretamente
if (typeof window === 'undefined' && require.main === module) {
  const results = runNavigationTests();
  const report = generateTestReport(results);
  console.log(report);
}
