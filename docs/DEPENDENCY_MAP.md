# Mapa de Dependências

Observação: este grafo é derivado de imports absolutos reais (@) em src/app, src/components e src/hooks. Use-o para detectar acoplamentos e ciclos.

```mermaid
flowchart LR
  subgraph Routes (src/app)
    A1[app/(protected)/estoque/page.tsx]
    A2[app/(protected)/profissionais/[id]/desempenho/view.tsx]
    A3[app/tipos/categorias-receitas/page.tsx]
    A4[app/actions/marketplace.ts]
    A5[app/assinaturas/components/SubscriptionsTab.tsx]
    A6[app/sentry-test/page.tsx]
    A7[app/(protected)/perfil/page.tsx]
    A8[app/(protected)/assinaturas/page.tsx]
    A9[app/(public)/login/page.tsx]
    A10[app/(protected)/caixa/page.tsx]
    A11[app/examples/page.tsx]
    A12[app/(protected)/dashboard/DashboardClient.tsx]
    A13[app/(protected)/clientes/components/ClientesContent.tsx]
    A14[app/(protected)/clientes/components/ClienteFormDialog.tsx]
    A15[app/providers.tsx]
  end

  subgraph Components (src/components)
    C1[components/ui/PageHeader]
    C2[components/ui/*]
    C3[components/tipos/TipoCategoriasReceitaModal]
    C4[components/auth/LoginForm]
    C5[components/dashboard/*]
    C6[components/auth/AuthProvider]
    C7[components/layout/AppShell]
  end

  subgraph Hooks (src/hooks)
    H1[hooks/useRetry]
    H2[hooks/use-subscriptions]
    H3[hooks/use-unidades]
    H4[hooks/useMetrics]
    H5[hooks/use-clientes]
    H6[hooks/use-auth]
    H7[hooks/use-current-unit]
    H8[hooks/usePermissions]
    H9[hooks/use-notificacoes]
  end

  subgraph Schemas (src/schemas)
    S1[schemas/index]
    S2[schemas/tipos]
    S3[schemas/lgpd]
    S4[schemas/marketplace]
  end

  %% Routes → Components
  A1 --> C1
  A1 --> C2
  A2 --> C2
  A3 --> C3
  A6 --> C2
  A7 --> C1
  A8 --> C1
  A9 --> C4
  A10 --> C1
  A11 --> C2
  A12 --> C5
  A13 --> C1
  A14 --> C2
  A15 --> C2

  %% Routes → Hooks
  A1 --> H1
  A11 --> H3
  A12 --> H4
  A13 --> H5

  %% Routes → Schemas
  A13 --> S1

  %% Actions (em app) → Schemas
  A4 --> S4

  %% Components → Hooks / Schemas
  C6 --> H6
  C1 --> H3
  C3 --> S2

  %% Hooks → Schemas
  H5 --> S1
  H3 --> S1
  H2 --> S1
  H2 --> S4

  %% Hooks → Components (potenciais ciclos)
  H7 --> C6
  H8 --> C6
```

Arestas Relevantes (amostragem por arquivo)
- Routes → Components
  - app/(protected)/estoque/page.tsx → components/ui/PageHeader, components/ui (SkeletonLoader, RetryButton)
  - app/(public)/login/page.tsx → components/auth/LoginForm
  - app/(protected)/dashboard/DashboardClient.tsx → components/dashboard/* (KpiCard, AreaChartCard, BarChartCard, TopTableCard, ErrorBoundary) e components/ui (PageHeader, Card)
- Routes → Hooks
  - app/examples/page.tsx → hooks/use-unidades
  - app/(protected)/clientes/components/ClientesContent.tsx → hooks/use-clientes
- Routes → Schemas
  - app/(protected)/clientes/components/ClientesContent.tsx → schemas (UpdateClienteSchema)
- Actions (em app) → Schemas
  - app/actions/marketplace.ts → schemas/marketplace
- Components → Hooks
  - components/auth/AuthProvider.tsx → hooks/use-auth
  - components/layout/TratoHeader.tsx, features/layout/ProtectedLayout.tsx → hooks/use-current-unit
- Components → Schemas
  - components/tipos/* → schemas/tipos
- Hooks → Schemas
  - hooks/use-clientes.ts, use-produtos.ts, use-unidades.ts, use-agendamentos.ts → schemas/index
  - hooks/useLGPD.ts → schemas/lgpd
  - hooks/use-marketplace.ts → schemas/marketplace
- Hooks → Components (potencial ciclo)
  - hooks/use-current-unit.ts, hooks/usePermissions.ts → components/auth/AuthProvider

Ciclos e Riscos Identificados
- Dependência cruzada entre hooks e components envolvendo AuthProvider:
  - hooks/use-current-unit.ts → components/auth/AuthProvider.tsx
  - hooks/usePermissions.ts → components/auth/AuthProvider.tsx
  - Ao mesmo tempo, components/auth/AuthProvider.tsx importa hooks/use-auth. Isso cria um grafo com componentes ← hooks e componentes → hooks, propenso a ciclos de inicialização e ordem de import.

Recomendações de Refactor (curto prazo)
- Extrair o contexto/tipos de autenticação para um módulo neutro (por exemplo: src/lib/auth/context.ts) e:
  - components/auth/AuthProvider.tsx passa a importar desse módulo em vez de expor o contexto diretamente pelo componente.
  - hooks/use-current-unit.ts e hooks/usePermissions.ts importam o contexto/tipos diretamente de src/lib/auth/context.ts, eliminando a dependência de components/.
- Revisar todos os hooks para garantir que não importam nada de components/ (regra arquitetural: hooks ↓ não dependem de components ↑).

Recomendações de Qualidade (médio prazo)
- Adicionar verificação de ciclos de import via ESLint (plugin import, regra import/no-cycle) e CI gate.
- Automatizar a geração deste grafo com script Node + ts-morph para manter atualizações contínuas.

Notas
- Este diagrama é uma visão condensada; o conjunto completo de arestas pode ser regenerado pelo script sugerido.
- Alias de import '@' mapeia para src/ conforme tsconfig.json e Next.js config.
