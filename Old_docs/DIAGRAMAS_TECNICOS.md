# 🔧 DIAGRAMAS TÉCNICOS - SISTEMA SAAS-BARBEARIA

**Complemento da Documentação Oficial**  
**Versão:** v2.0.0  
**Data:** 26/08/2025

---

## 📊 DIAGRAMA ENTIDADE-RELACIONAMENTO (ER)

### 3.1 Modelo de Dados Principal

```mermaid
erDiagram
    UNIDADES ||--o{ PROFILES : "pertence"
    UNIDADES ||--o{ PROFISSIONAIS : "contrata"
    UNIDADES ||--o{ CLIENTES : "atende"
    UNIDADES ||--o{ SERVICOS : "oferece"
    UNIDADES ||--o{ APPOINTMENTS : "agenda"
    UNIDADES ||--o{ FILA : "controla"
    UNIDADES ||--o{ FINANCEIRO_MOV : "registra"
    UNIDADES ||--o{ PRODUTOS : "estoca"
    UNIDADES ||--o{ ASSINATURAS : "gerencia"

    PROFILES ||--o{ APPOINTMENTS : "cria"
    PROFISSIONAIS ||--o{ APPOINTMENTS : "executa"
    CLIENTES ||--o{ APPOINTMENTS : "solicita"
    SERVICOS ||--o{ APPOINTMENTS_SERVICOS : "incluído"

    APPOINTMENTS ||--o{ APPOINTMENTS_SERVICOS : "contém"
    SERVICOS ||--o{ APPOINTMENTS_SERVICOS : "aplicado"

    PROFISSIONAIS ||--o{ PROFISSIONAL_HORARIOS : "define"
    PROFISSIONAIS ||--o{ FINANCEIRO_MOV : "recebe_comissao"

    PRODUTOS ||--o{ VENDAS_ITENS : "vendido"
    VENDAS ||--o{ VENDAS_ITENS : "contém"

    ASSINATURAS ||--o{ ASSINATURAS_PAGAMENTOS : "processa"

    UNIDADES {
        uuid id PK
        varchar nome
        varchar cnpj
        text endereco
        varchar telefone
        citext email
        jsonb config
        boolean ativo
        timestamp created_at
        timestamp updated_at
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        varchar nome
        citext email
        varchar telefone
        uuid unidade_default_id FK
        enum papel
        boolean ativo
        timestamp created_at
        timestamp updated_at
    }

    PROFISSIONAIS {
        uuid id PK
        varchar nome
        varchar papel
        uuid unidade_id FK
        boolean ativo
        jsonb comissao_regra
        timestamp created_at
        timestamp updated_at
    }

    CLIENTES {
        uuid id PK
        varchar nome
        citext email
        varchar telefone
        jsonb preferencias
        uuid unidade_id FK
        boolean ativo
        timestamp created_at
        timestamp updated_at
    }

    SERVICOS {
        uuid id PK
        varchar nome
        varchar categoria
        decimal preco
        integer duracao_min
        boolean ativo
        uuid unidade_id FK
        timestamp created_at
        timestamp updated_at
    }

    APPOINTMENTS {
        uuid id PK
        uuid cliente_id FK
        uuid profissional_id FK
        uuid unidade_id FK
        timestamp inicio
        timestamp fim
        enum status
        decimal total
        text notas
        timestamp created_at
        timestamp updated_at
    }

    APPOINTMENTS_SERVICOS {
        uuid id PK
        uuid appointment_id FK
        uuid servico_id FK
        decimal preco_aplicado
        integer duracao_aplicada
    }

    FILA {
        uuid id PK
        uuid unidade_id FK
        uuid cliente_id FK
        enum status
        enum prioridade
        integer posicao
        integer estimativa_min
        text observacoes
        timestamp created_at
        timestamp updated_at
    }

    FINANCEIRO_MOV {
        uuid id PK
        uuid unidade_id FK
        enum tipo
        decimal valor
        enum origem
        uuid referencia_id
        date data_mov
        text descricao
        uuid profissional_id FK
        uuid cliente_id FK
        varchar categoria
        enum meio_pagamento
        timestamp created_at
        timestamp updated_at
    }

    PRODUTOS {
        uuid id PK
        uuid unidade_id FK
        varchar nome
        text descricao
        decimal preco
        integer estoque
        boolean ativo
        timestamp created_at
        timestamp updated_at
    }

    VENDAS {
        uuid id PK
        uuid unidade_id FK
        uuid cliente_id FK
        uuid profissional_id FK
        decimal valor_total
        enum status
        timestamp created_at
        timestamp updated_at
    }

    VENDAS_ITENS {
        uuid id PK
        uuid venda_id FK
        uuid produto_id FK
        integer quantidade
        decimal preco_unitario
        decimal subtotal
    }

    ASSINATURAS {
        uuid id PK
        uuid unidade_id FK
        varchar plano_nome
        enum status
        decimal valor_mensal
        date data_inicio
        date data_fim
        jsonb recursos
        timestamp created_at
        timestamp updated_at
    }
```

---

## 🔄 FLUXOS DE PROCESSO

### 4.1 Fluxo de Agendamento

```mermaid
flowchart TD
    A[Cliente solicita agendamento] --> B{Verificar disponibilidade}
    B -->|Disponível| C[Criar agendamento]
    B -->|Indisponível| D[Sugerir horários alternativos]
    D --> E[Cliente escolhe novo horário]
    E --> B
    C --> F[Enviar confirmação]
    F --> G[Adicionar à agenda]
    G --> H[Notificar profissional]
    H --> I[Agendamento confirmado]

    B -->|Conflito detectado| J[Bloquear criação]
    J --> K[Notificar cliente]
    K --> L[Fim]

    C -->|Erro na criação| M[Rollback]
    M --> N[Notificar erro]
    N --> L
```

### 4.2 Fluxo de Atendimento (Fila)

```mermaid
flowchart TD
    A[Cliente chega] --> B[Adicionar à fila]
    B --> C[Calcular posição]
    C --> D[Estimar tempo de espera]
    D --> E[Cliente aguarda]
    E --> F{Próximo da vez?}
    F -->|Sim| G[Chamar cliente]
    F -->|Não| H[Atualizar estimativa]
    H --> E
    G --> I[Iniciar atendimento]
    I --> J[Executar serviços]
    J --> K[Finalizar atendimento]
    K --> L[Processar pagamento]
    L --> M[Remover da fila]
    M --> N[Atualizar histórico]
```

### 4.3 Fluxo Financeiro

```mermaid
flowchart TD
    A[Serviço executado] --> B[Registrar entrada]
    B --> C[Calcular comissão]
    C --> D[Registrar saída comissão]
    D --> E[Atualizar caixa]
    E --> F{É fechamento?}
    F -->|Sim| G[Fechar caixa]
    F -->|Não| H[Continuar operação]
    G --> I[Gerar relatório]
    I --> J[Reconciliar valores]
    J --> K[Fechamento concluído]
    H --> L[Próxima operação]
```

---

## 🏗️ ARQUITETURA DETALHADA

### 5.1 Camadas do Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React Components]
        C[MUI v6 Components]
        D[Custom Hooks]
    end

    subgraph "State Management"
        E[React Query v5]
        F[Zustand Store]
        G[Context Providers]
    end

    subgraph "API Layer"
        H[Server Actions]
        I[Supabase Client]
        J[Zod Validation]
    end

    subgraph "Database Layer"
        K[PostgreSQL]
        L[RLS Policies]
        M[Functions]
        N[Views]
    end

    subgraph "External Services"
        O[ASAAS API]
        P[WhatsApp API]
        Q[Sentry]
    end

    A --> B
    B --> C
    B --> D
    D --> E
    E --> F
    E --> G
    B --> H
    H --> I
    H --> J
    I --> K
    K --> L
    K --> M
    K --> N
    H --> O
    H --> P
    H --> Q
```

### 5.2 Estrutura de Componentes

```mermaid
graph TD
    subgraph "Atomic Design"
        A1[DSButton]
        A2[DSTextField]
        A3[DSTable]
        A4[DSDialog]
    end

    subgraph "Molecules"
        M1[FormRow]
        M2[PageHeader]
        M3[ThemeToggle]
        M4[SearchBar]
    end

    subgraph "Organisms"
        O1[Dashboard]
        O2[Agenda]
        O3[Fila]
        O4[Financeiro]
    end

    subgraph "Templates"
        T1[AppShell]
        T2[ProtectedLayout]
        T3[PageLayout]
    end

    subgraph "Pages"
        P1[Dashboard Page]
        P2[Clientes Page]
        P3[Agenda Page]
        P4[Configurações Page]
    end

    A1 --> M1
    A2 --> M1
    A3 --> M2
    A4 --> M3

    M1 --> O1
    M2 --> O1
    M3 --> O1
    M4 --> O1

    O1 --> T1
    O2 --> T1
    O3 --> T1
    O4 --> T1

    T1 --> P1
    T2 --> P2
    T3 --> P3
    T1 --> P4
```

---

## 🔐 SEGURANÇA E RLS

### 6.1 Políticas RLS

```sql
-- Exemplo de política para tabela clientes
CREATE POLICY "Usuários podem ver clientes da sua unidade" ON clientes
    FOR SELECT USING (
        unidade_id = current_unidade_id()
    );

CREATE POLICY "Usuários podem criar clientes na sua unidade" ON clientes
    FOR INSERT WITH CHECK (
        unidade_id = current_unidade_id()
    );

CREATE POLICY "Usuários podem atualizar clientes da sua unidade" ON clientes
    FOR UPDATE USING (
        unidade_id = current_unidade_id()
    );

CREATE POLICY "Usuários podem deletar clientes da sua unidade" ON clientes
    FOR DELETE USING (
        unidade_id = current_unidade_id()
    );
```

### 6.2 Funções de Segurança

```sql
-- Função para obter unidade atual
CREATE OR REPLACE FUNCTION current_unidade_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT unidade_default_id
    FROM profiles
    WHERE user_id = current_user_id()
    LIMIT 1;
$$;

-- Função para verificar acesso à unidade
CREATE OR REPLACE FUNCTION has_unit_access(unidade_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.user_id = current_user_id()
        AND (
            p.papel = 'admin'::user_role OR
            p.unidade_default_id = unidade_id
        )
    );
$$;
```

---

## 📱 RESPONSIVIDADE

### 7.1 Breakpoints MUI

```typescript
// Breakpoints do sistema
const breakpoints = {
  xs: 0, // Extra small: 0px
  sm: 600, // Small: 600px
  md: 900, // Medium: 900px
  lg: 1200, // Large: 1200px
  xl: 1536, // Extra large: 1536px
};

// Uso responsivo
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
```

### 7.2 Grid Responsivo

```typescript
// Grid responsivo para dashboard
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <KpiCard />
  </Grid>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <KpiCard />
  </Grid>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <KpiCard />
  </Grid>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <KpiCard />
  </Grid>
</Grid>
```

---

## 🧪 TESTES

### 8.1 Estrutura de Testes

```typescript
// Exemplo de teste unitário
describe('KpiCard Component', () => {
  it('should render with correct props', () => {
    const props = {
      title: 'Test Title',
      value: '100',
      trend: '+10%',
      trendUp: true,
    };

    render(<KpiCard {...props} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });
});

// Exemplo de teste de integração
describe('Appointment Creation', () => {
  it('should create appointment with valid data', async () => {
    const appointmentData = {
      cliente_id: 'valid-uuid',
      profissional_id: 'valid-uuid',
      unidade_id: 'valid-uuid',
      inicio: new Date(),
      servicos: [{ servico_id: 'valid-uuid', preco_aplicado: 50, duracao_aplicada: 30 }],
    };

    const result = await createAppointment(appointmentData);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

---

## 🚀 DEPLOYMENT

### 9.1 Pipeline CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 9.2 Variáveis de Ambiente

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production

ASAAS_API_KEY=your-asaas-key
ASAAS_ENVIRONMENT=production

WHATSAPP_API_KEY=your-whatsapp-key
SMS_API_KEY=your-sms-key
EMAIL_API_KEY=your-email-key
```

---

## 📊 MONITORAMENTO

### 10.1 Métricas de Performance

```typescript
// Exemplo de métricas do sistema
interface SystemMetrics {
  // Performance
  firstPaint: number; // ms
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  timeToInteractive: number; // ms

  // Business
  activeUsers: number;
  appointmentsCreated: number;
  revenueGenerated: number;
  conversionRate: number;

  // Technical
  errorRate: number;
  responseTime: number;
  databaseQueries: number;
  cacheHitRate: number;
}
```

### 10.2 Alertas e Notificações

```typescript
// Exemplo de sistema de alertas
const alertThresholds = {
  errorRate: 0.05, // 5% de erros
  responseTime: 2000, // 2 segundos
  databaseQueries: 100, // 100 queries por minuto
  memoryUsage: 0.8, // 80% de uso de memória
};

// Função para verificar alertas
function checkAlerts(metrics: SystemMetrics): Alert[] {
  const alerts: Alert[] = [];

  if (metrics.errorRate > alertThresholds.errorRate) {
    alerts.push({
      type: 'error',
      message: 'Taxa de erro acima do limite',
      value: metrics.errorRate,
      threshold: alertThresholds.errorRate,
    });
  }

  return alerts;
}
```

---

## 🔄 MIGRAÇÕES

### 11.1 Estrutura de Migrações

```sql
-- Exemplo de migration
-- Migration: 013_nova_funcionalidade.sql

-- Adicionar nova coluna
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS data_ultima_visita timestamp with time zone;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_clientes_ultima_visita
ON clientes(data_ultima_visita)
WHERE data_ultima_visita IS NOT NULL;

-- Atualizar controle de migrações
INSERT INTO migrations (version, name, executed_at)
VALUES ('013', 'nova_funcionalidade', NOW())
ON CONFLICT (version) DO NOTHING;
```

### 11.2 Rollback Strategy

```sql
-- Script de rollback para migration 013
-- Rollback: 013_nova_funcionalidade_rollback.sql

-- Remover índice
DROP INDEX IF EXISTS idx_clientes_ultima_visita;

-- Remover coluna
ALTER TABLE clientes
DROP COLUMN IF EXISTS data_ultima_visita;

-- Atualizar controle de migrações
DELETE FROM migrations WHERE version = '013';
```

---

**📋 Este documento complementa a Documentação Oficial do Sistema, fornecendo detalhes técnicos, diagramas e exemplos práticos para desenvolvedores e arquitetos.**

**Última Atualização:** 26/08/2025  
**Responsável:** Equipe de Desenvolvimento Trato
