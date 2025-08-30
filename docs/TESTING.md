# MSW (Mock Service Worker) - Guia Avançado

## 📋 Visão Geral

O Mock Service Worker (MSW) está configurado de forma modular e organizada por domínio, permitindo simulação avançada de cenários de API para testes robustos.

## 🏗️ Arquitetura

```
tests/mocks/
├── handlers/              # Handlers organizados por domínio
│   ├── agendamentos.ts    # APIs de agendamento
│   ├── servicos.ts        # APIs de serviços
│   ├── marketplace.ts     # APIs públicas/marketplace
│   ├── auth.ts            # APIs de autenticação
│   ├── errors.ts          # Cenários de erro globais
│   └── index.ts           # Barrel exports
├── server.ts              # Configuração do servidor MSW
├── scenarios.test.ts      # Testes de validação de cenários
└── index.ts               # Setup para testes
```

## 🎭 Sistema de Cenários

### Ativação de Cenários

Os cenários podem ser ativados de duas formas:

#### 1. Via Header HTTP

```javascript
fetch('/api/agendamentos', {
  headers: { 'x-mock-scenario': 'error-500' },
});
```

#### 2. Via Query Parameter

```javascript
fetch('/api/servicos?scenario=empty');
```

### Cenários Disponíveis por Domínio

#### 🗓️ Agendamentos

- `success` - Retorna agendamentos normalmente
- `empty` - Lista vazia de agendamentos
- `error-400` - Dados de entrada inválidos
- `error-500` - Erro interno do servidor
- `conflict` - Conflito de horário

#### 🔧 Serviços

- `success` - Lista de serviços disponíveis
- `empty` - Nenhum serviço cadastrado
- `error-400` - Dados inválidos
- `error-500` - Erro interno

#### 🏪 Marketplace

- `success` - Catálogo público disponível
- `empty` - Nenhum serviço público
- `error-400` - Parâmetros inválidos
- `error-500` - Erro interno
- `unauthorized` - Acesso negado (admin)

#### 🔐 Auth

- `success` - Login bem-sucedido
- `invalid-credentials` - Credenciais incorretas
- `user-not-found` - Usuário não existe
- `error-500` - Erro no servidor de auth

#### ⚠️ Errors (Globais)

- `network-error` - Problemas de conectividade
- `timeout` - Timeout de requisição
- `rate-limit` - Limite de requisições excedido
- `maintenance` - Sistema em manutenção

## 🧪 Exemplos de Uso

### Testando Estados de Sucesso

```javascript
describe('Fluxo Happy Path', () => {
  test('Criar agendamento com sucesso', async () => {
    const response = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: {
        'x-mock-scenario': 'success',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_hora: '2024-01-15T10:00:00Z',
        servico_id: 'serv-1',
        profissional_id: 'prof-1',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### Testando Estados de Erro

```javascript
describe('Tratamento de Erros', () => {
  test('Conflito de horário', async () => {
    const response = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'x-mock-scenario': 'conflict' },
      body: JSON.stringify({
        /* dados */
      }),
    });

    expect(response.status).toBe(409);
  });

  test('Erro de rede', async () => {
    const response = await fetch('/api/servicos', {
      headers: { 'x-mock-scenario': 'network-error' },
    });

    expect(response.status).toBe(503);
  });
});
```

### Testando Estados Vazios

```javascript
describe('Estados de Loading/Vazio', () => {
  test('Lista vazia de agendamentos', async () => {
    const response = await fetch('/api/agendamentos?scenario=empty');

    const data = await response.json();
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });
});
```

## 🎯 Cenários Avançados

### Combinação de Cenários

```javascript
describe('Fluxos Complexos', () => {
  test('Booking completo com diferentes estados', async () => {
    // 1. Buscar serviços (sucesso)
    const servicosResponse = await fetch('/api/marketplace/servicos', {
      headers: { 'x-mock-scenario': 'success' },
    });
    expect(servicosResponse.status).toBe(200);

    // 2. Verificar disponibilidade (conflito)
    const dispResponse = await fetch('/api/agendamentos/disponibilidade', {
      headers: { 'x-mock-scenario': 'conflict' },
    });
    expect(dispResponse.status).toBe(409);

    // 3. Tentar novamente (sucesso)
    const agendResponse = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'x-mock-scenario': 'success' },
    });
    expect(agendResponse.status).toBe(201);
  });
});
```

### Rate Limiting e Retry

```javascript
describe('Rate Limiting', () => {
  test('Simular rate limit e retry', async () => {
    // Primeira tentativa - rate limit
    const firstTry = await fetch('/api/agendamentos', {
      headers: { 'x-mock-scenario': 'rate-limit' },
    });
    expect(firstTry.status).toBe(429);

    // Simular espera e retry com sucesso
    await new Promise((resolve) => setTimeout(resolve, 100));

    const retryResponse = await fetch('/api/agendamentos', {
      headers: { 'x-mock-scenario': 'success' },
    });
    expect(retryResponse.status).toBe(200);
  });
});
```

### Timeouts e Network Errors

```javascript
describe('Resiliência de Rede', () => {
  test('Timeout handling', async () => {
    const response = await fetch('/api/agendamentos', {
      headers: { 'x-mock-scenario': 'timeout' },
    });

    expect(response.status).toBe(408);
    const data = await response.json();
    expect(data.error).toContain('Timeout');
  });

  test('Network error recovery', async () => {
    // Simular falha de rede
    const failResponse = await fetch('/api/servicos', {
      headers: { 'x-mock-scenario': 'network-error' },
    });
    expect(failResponse.status).toBe(503);

    // Simular recuperação
    const successResponse = await fetch('/api/servicos', {
      headers: { 'x-mock-scenario': 'success' },
    });
    expect(successResponse.status).toBe(200);
  });
});
```

## 🔧 Configuração Personalizada

### Adicionando Novos Cenários

```javascript
// Em handlers/servicos.ts
export const servicosHandlers = [
  // Novo cenário personalizado
  http.get('/api/servicos', ({ request }) => {
    const scenario = getScenario(request);

    if (scenario === 'custom-scenario') {
      return HttpResponse.json({
        success: true,
        data: customMockData,
        metadata: { scenario: 'custom' },
      });
    }

    // ... outros cenários
  }),
];
```

### Middleware de Logging

```javascript
// Em server.ts - adicionar logging de cenários
export const server = setupServer(...handlers);

// Log cenários em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  server.events.on('request:start', ({ request }) => {
    const scenario =
      request.headers.get('x-mock-scenario') || new URL(request.url).searchParams.get('scenario');

    if (scenario) {
      console.log(`🎭 MSW Scenario: ${scenario} - ${request.method} ${request.url}`);
    }
  });
}
```

## 📊 Dados Mock Realistas

### Agendamentos

- Estados: agendado, confirmado, em_andamento, concluido, cancelado
- Horários: Intervalos de 30min das 8h às 18h
- Conflitos: Mesmo profissional, mesmo horário

### Serviços

- Categorias: corte, barba, tratamentos, combos
- Preços: R$ 25,00 a R$ 150,00
- Durações: 15min a 120min

### Marketplace

- Serviços públicos com agendamento online
- Disponibilidade em tempo real
- Sistema de reserva temporária

### Auth

- Diferentes níveis de usuário: admin, barbeiro, cliente
- Tokens JWT simulados
- Refresh token flow

## 🚀 Performance e Otimização

### Lazy Loading de Cenários

```javascript
// Handlers podem ser carregados sob demanda
const loadScenarioHandlers = async (domain: string) => {
  const module = await import(`./handlers/${domain}.ts`);
  return module.handlers;
};
```

### Cache de Responses

```javascript
// Cache responses para cenários frequentes
const responseCache = new Map();

const getCachedResponse = (key: string, generator: () => any) => {
  if (!responseCache.has(key)) {
    responseCache.set(key, generator());
  }
  return responseCache.get(key);
};
```

## 🧩 Integração com Testes E2E

### Playwright + MSW

```javascript
// Em playwright.config.ts
export default defineConfig({
  use: {
    // Ativar MSW em testes E2E
    extraHTTPHeaders: {
      'x-msw-bypass': 'false',
    },
  },
});

// Em testes E2E
test('Fluxo completo de agendamento', async ({ page }) => {
  // Configurar cenário específico
  await page.setExtraHTTPHeaders({
    'x-mock-scenario': 'success',
  });

  await page.goto('/agendamentos');
  // ... resto do teste
});
```

### Cypress + MSW

```javascript
// Em cypress/support/commands.js
Cypress.Commands.add('setMockScenario', (scenario) => {
  cy.intercept('**', (req) => {
    req.headers['x-mock-scenario'] = scenario;
  });
});

// Em teste
cy.setMockScenario('empty');
cy.visit('/agendamentos');
cy.get('[data-testid="no-appointments"]').should('be.visible');
```

## 📈 Monitoramento e Debug

### Logging Avançado

```javascript
// Wrapper para debug de cenários
const debugHandler = (originalHandler) => {
  return async (request) => {
    const scenario = getScenario(request);
    console.group(`🎭 MSW Handler: ${request.method} ${request.url}`);
    console.log('Scenario:', scenario);

    const response = await originalHandler(request);

    console.log('Response Status:', response.status);
    console.groupEnd();

    return response;
  };
};
```

### Métricas de Uso

```javascript
// Coletar estatísticas de cenários
const scenarioStats = new Map();

const trackScenarioUsage = (scenario: string, endpoint: string) => {
  const key = `${endpoint}:${scenario}`;
  scenarioStats.set(key, (scenarioStats.get(key) || 0) + 1);
};

// Relatório de uso
const getScenarioReport = () => {
  return Array.from(scenarioStats.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
};
```

## 🎯 Melhores Práticas

### ✅ DO

- Use cenários específicos para cada tipo de teste
- Mantenha dados mock realistas e consistentes
- Documente novos cenários adicionados
- Use nomes de cenários descritivos
- Teste tanto sucesso quanto falhas

### ❌ DON'T

- Não misture lógica de cenários em handlers
- Não use dados hardcoded sem cenários
- Não ignore testes de edge cases
- Não deixe handlers sem documentação
- Não use cenários em produção

## 📚 Recursos Adicionais

- [Documentação Oficial MSW](https://mswjs.io/)
- [MSW Storybook Addon](https://storybook.js.org/addons/msw-storybook-addon)
- [Testing Library + MSW](https://testing-library.com/docs/react-testing-library/example-intro/#full-example)

---

**Próximos Passos:**

1. Execute os testes de cenários: `npm test scenarios.test.ts`
2. Explore combinações de cenários para fluxos complexos
3. Adicione cenários específicos conforme necessário
4. Configure logging para debug em desenvolvimento
