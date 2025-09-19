/**
 * Script de teste para verificar funcionamento de links e botões principais
 * Este arquivo será removido após os testes
 */

import { routes } from '@/routes';

interface LinkTestResult {
  component: string;
  linkType: 'internal' | 'external' | 'action';
  path?: string;
  isValid: boolean;
  error?: string;
}

interface ButtonTestResult {
  component: string;
  buttonType: 'submit' | 'button' | 'link';
  action: string;
  isValid: boolean;
  error?: string;
}

/**
 * Valida se uma rota interna existe
 */
function validateInternalRoute(path: string): boolean {
  // Remove query params e fragments
  const cleanPath = path.split('?')[0].split('#')[0];

  // Verifica rotas estáticas
  const staticRoutes = Object.values(routes).map((route) => route.path);
  if (staticRoutes.includes(cleanPath)) {
    return true;
  }

  // Verifica padrões de rotas dinâmicas comuns
  const dynamicPatterns = [
    /^\/clientes\/[^\/]+$/, // /clientes/:id
    /^\/agenda\/[^\/]+$/, // /agenda/:id
    /^\/servicos\/[^\/]+$/, // /servicos/:id
    /^\/servicos\/categorias\/[^\/]+$/, // /servicos/categorias/:id
    /^\/profissionais\/[^\/]+$/, // /profissionais/:id
    /^\/produtos\/[^\/]+$/, // /produtos/:id
  ];

  return dynamicPatterns.some((pattern) => pattern.test(cleanPath));
}

/**
 * Testa links comuns encontrados na aplicação
 */
export function testCommonLinks(): LinkTestResult[] {
  const commonLinks = [
    // Links de navegação principal
    { component: 'Sidebar', path: '/dashboard', type: 'internal' as const },
    { component: 'Sidebar', path: '/agenda', type: 'internal' as const },
    { component: 'Sidebar', path: '/clientes', type: 'internal' as const },
    { component: 'Sidebar', path: '/profissionais', type: 'internal' as const },
    { component: 'Sidebar', path: '/servicos', type: 'internal' as const },
    { component: 'Sidebar', path: '/caixa', type: 'internal' as const },
    { component: 'Sidebar', path: '/estoque', type: 'internal' as const },
    { component: 'Sidebar', path: '/fila', type: 'internal' as const },

    // Links de breadcrumbs
    { component: 'Breadcrumbs', path: '/dashboard', type: 'internal' as const },
    { component: 'Breadcrumbs', path: '/cadastros', type: 'internal' as const },

    // Links de ações
    { component: 'PageHeader', path: '/clientes/novo', type: 'internal' as const },
    { component: 'PageHeader', path: '/agenda/novo', type: 'internal' as const },
    { component: 'PageHeader', path: '/servicos/novo', type: 'internal' as const },

    // Links dinâmicos (exemplos)
    { component: 'ClienteCard', path: '/clientes/123', type: 'internal' as const },
    { component: 'AgendaCard', path: '/agenda/456', type: 'internal' as const },

    // Links externos (se houver)
    { component: 'Footer', path: 'https://tratohub.com', type: 'external' as const },
  ];

  return commonLinks.map((link) => {
    const result: LinkTestResult = {
      component: link.component,
      linkType: link.type,
      path: link.path,
      isValid: false,
    };

    try {
      if (link.type === 'internal') {
        result.isValid = validateInternalRoute(link.path);
        if (!result.isValid) {
          result.error = `Rota interna não encontrada: ${link.path}`;
        }
      } else if (link.type === 'external') {
        // Para links externos, verifica se é uma URL válida
        try {
          new URL(link.path);
          result.isValid = true;
        } catch {
          result.error = `URL externa inválida: ${link.path}`;
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erro desconhecido';
    }

    return result;
  });
}

/**
 * Testa botões comuns encontrados na aplicação
 */
export function testCommonButtons(): ButtonTestResult[] {
  const commonButtons = [
    // Botões de ação principal
    { component: 'PageHeader', action: 'Novo Cliente', type: 'link' as const },
    { component: 'PageHeader', action: 'Novo Agendamento', type: 'link' as const },
    { component: 'PageHeader', action: 'Novo Produto', type: 'link' as const },
    { component: 'PageHeader', action: 'Exportar', type: 'button' as const },
    { component: 'PageHeader', action: 'Filtros', type: 'button' as const },
    { component: 'PageHeader', action: 'Refresh', type: 'button' as const },

    // Botões de formulário
    { component: 'LoginForm', action: 'Entrar', type: 'submit' as const },
    { component: 'ClienteForm', action: 'Salvar', type: 'submit' as const },
    { component: 'AgendaForm', action: 'Agendar', type: 'submit' as const },
    { component: 'ServicoForm', action: 'Criar Serviço', type: 'submit' as const },

    // Botões de ação em cards/tabelas
    { component: 'ClienteCard', action: 'Editar', type: 'button' as const },
    { component: 'ClienteCard', action: 'Visualizar', type: 'button' as const },
    { component: 'AgendaCard', action: 'Confirmar', type: 'button' as const },
    { component: 'AgendaCard', action: 'Cancelar', type: 'button' as const },

    // Botões de retry (novo sistema)
    { component: 'RetryButton', action: 'Tentar novamente', type: 'button' as const },
    { component: 'RetryButton', action: 'Cancelar', type: 'button' as const },
  ];

  return commonButtons.map((button) => {
    const result: ButtonTestResult = {
      component: button.component,
      buttonType: button.type,
      action: button.action,
      isValid: true, // Assumimos que botões são válidos por padrão
    };

    // Validações específicas por tipo
    if (button.type === 'submit') {
      // Botões de submit devem estar em formulários
      if (
        !button.action.toLowerCase().includes('salvar') &&
        !button.action.toLowerCase().includes('entrar') &&
        !button.action.toLowerCase().includes('criar') &&
        !button.action.toLowerCase().includes('agendar')
      ) {
        result.isValid = false;
        result.error = `Botão de submit com ação suspeita: ${button.action}`;
      }
    }

    return result;
  });
}

/**
 * Gera relatório dos testes de links e botões
 */
export function generateLinksButtonsReport(
  linkResults: LinkTestResult[],
  buttonResults: ButtonTestResult[],
): string {
  const validLinks = linkResults.filter((r) => r.isValid);
  const invalidLinks = linkResults.filter((r) => !r.isValid);
  const validButtons = buttonResults.filter((r) => r.isValid);
  const invalidButtons = buttonResults.filter((r) => !r.isValid);

  let report = `
=== RELATÓRIO DE TESTES DE LINKS E BOTÕES ===

LINKS:
Total testados: ${linkResults.length}
✅ Válidos: ${validLinks.length}
❌ Inválidos: ${invalidLinks.length}

BOTÕES:
Total testados: ${buttonResults.length}
✅ Válidos: ${validButtons.length}
❌ Inválidos: ${invalidButtons.length}

`;

  if (invalidLinks.length > 0) {
    report += `\n--- LINKS INVÁLIDOS ---\n`;
    invalidLinks.forEach((result) => {
      report += `❌ ${result.component} -> ${result.path}\n`;
      if (result.error) {
        report += `   Erro: ${result.error}\n`;
      }
      report += `\n`;
    });
  }

  if (invalidButtons.length > 0) {
    report += `\n--- BOTÕES INVÁLIDOS ---\n`;
    invalidButtons.forEach((result) => {
      report += `❌ ${result.component} -> ${result.action}\n`;
      if (result.error) {
        report += `   Erro: ${result.error}\n`;
      }
      report += `\n`;
    });
  }

  if (validLinks.length > 0) {
    report += `\n--- LINKS VÁLIDOS ---\n`;
    validLinks.forEach((result) => {
      report += `✅ ${result.component} -> ${result.path} (${result.linkType})\n`;
    });
  }

  if (validButtons.length > 0) {
    report += `\n--- BOTÕES VÁLIDOS ---\n`;
    validButtons.forEach((result) => {
      report += `✅ ${result.component} -> ${result.action} (${result.buttonType})\n`;
    });
  }

  return report;
}

// Executa os testes se executado diretamente
if (typeof window === 'undefined' && require.main === module) {
  const linkResults = testCommonLinks();
  const buttonResults = testCommonButtons();
  const report = generateLinksButtonsReport(linkResults, buttonResults);
  console.log(report);
}
