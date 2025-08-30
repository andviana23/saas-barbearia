# Trato - SaaS para Barbearias

![Build Status](https://img.shields.io/github/actions/workflow/status/andviana23/saas-barbearia/ci.yml?branch=main&label=build)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![E2E Tests](https://img.shields.io/badge/e2e-passing-brightgreen)
![Coverage](https://img.shields.io/codecov/c/github/andviana23/saas-barbearia/main?label=coverage)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

Sistema completo de gestão para barbearias desenvolvido com Next.js 14.2.5 e Supabase.

## 🏆 Status do Projeto

✅ **Pacote Rápido Concluído (100%)**

- ✅ Fase 6: Autorização Granular (RLS + Permissões)
- ✅ Fase 7: MSW Modularização & Cenários
- ✅ Fase 8: Documentação CompletaaaS para Barbearias

Sistema completo de gestão para barbearias desenvolvido com Next.js 14.2.5 e Supabase.

## 🏆 Status do Projeto

✅ **Pacote Rápido Concluído (100%)**

- ✅ Fase 6: Autorização Granular (RLS + Permissões)
- ✅ Fase 7: MSW Modularização & Cenários
- ✅ Fase 8: Documentação Completa

**Base sólida estabelecida para desenvolvimento ágil e testes robustos.**

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14.2.5 (App Router), React 18, TypeScript
- **UI**: Material-UI (MUI) v6.5.0
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Estado**: TanStack React Query v5.85.5
- **Validação**: Zod
- **Testes**: Jest + Playwright + MSW (Mock Service Worker)
- **Monitoramento**: Sentry
- **Deploy**: Vercel

## 📋 Funcionalidades Principais

### 🔐 Sistema de Autenticação

- Login/logout seguro via Supabase Auth
- Gestão de perfis multi-tenant
- Controle de acesso granular (RLS)

### 🗓️ Gestão de Agendamentos

- Agendamento online via marketplace
- Controle de disponibilidade
- Sistema de fila inteligente
- Notificações automatizadas

### 👥 Gestão de Clientes

- Cadastro completo de clientes
- Histórico de atendimentos
- Conformidade LGPD

### 💰 Controle Financeiro

- Gestão de pagamentos
- Integração com ASAAS (PIX/Cartão)
- Relatórios financeiros
- Sistema de assinaturas

### 📊 Relatórios e Analytics

- Dashboard com métricas em tempo real
- Relatórios de performance
- Análise de receita e ocupação

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Sentry (Opcional)
SENTRY_DSN=seu_dsn_sentry
NEXT_PUBLIC_SENTRY_DSN=seu_dsn_publico_sentry
SENTRY_AUTH_TOKEN=seu_token_sentry
```

### 2. Instalação

```bash
npm install
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 🧪 Testes

O projeto possui uma suíte completa de testes com MSW (Mock Service Worker) para simulação avançada de cenários:

```bash
# Testes unitários
npm run test
npm run test:unit
npm run test:coverage

# Testes E2E
npm run test:e2e
npm run test:e2e:ui

# Validação de cenários MSW
npm test scenarios.test.ts
```

### Sistema de Cenários MSW

Configure cenários específicos para testes robustos:

```javascript
// Via header
fetch('/api/agendamentos', {
  headers: { 'x-mock-scenario': 'error-500' },
});

// Via query parameter
fetch('/api/servicos?scenario=empty');
```

Cenários disponíveis: `success`, `empty`, `error-400`, `error-500`, `conflict`, `unauthorized`, `network-error`, `timeout`, `rate-limit`, `maintenance`.

Veja documentação completa em [`docs/TESTING.md`](docs/TESTING.md).

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev
npm run build
npm run start
npm run lint
npm run type-check

# Banco de Dados
npm run db:migrate           # Executar migrações pendentes
npm run db:status            # Status das migrações
npm run db:migrate:baseline  # Registrar baseline (DB já existente)
npm run db:migrate:force     # Reaplicar divergentes (desenvolvimento)
npm run db:migrate:check     # Verificar pendentes/divergentes (CI)
npm run db:seed              # Executar seeds (idempotente)
npm run db:seed:dev          # Seeds em modo development
```

### Guia Completo de Operações de Banco

Veja [`docs/OPERACOES_DB.md`](docs/OPERACOES_DB.md) para naming, baseline, rollback e troubleshooting.

## Arquitetura

### Estrutura de Pastas

```
src/
├── app/              # Rotas (App Router) + Server Actions
├── components/       # Componentes React
│   ├── ui/          # Design System (DSButton, DSTable, etc.)
│   ├── layout/      # Layout components
│   └── features/    # Feature-specific components
├── hooks/           # Custom hooks
├── lib/             # Utilitários e configurações
│   ├── supabase/   # Cliente Supabase
│   ├── theme/      # Tema MUI
│   └── utils/      # Utilitários gerais
├── schemas/         # Esquemas Zod para validação
├── types/           # Tipos TypeScript
└── middleware.ts    # Middleware Next.js
```

### Multi-tenancy

O sistema é multi-tenant baseado em `unidade_id`. Todas as operações respeitam o isolamento por unidade através de políticas RLS (Row Level Security) no Supabase.

### Autenticação

- **Login**: `/login`
- **Middleware**: Protege rotas privadas automaticamente
- **Rotas Públicas**: `/login`, `/signup`, `/forgot-password`, `/api/webhooks`
- **Redirecionamento**: Usuários não autenticados são redirecionados para `/login` com parâmetro `redirectTo`

## Troubleshooting

### Cache Issues (ENOENT)

Se encontrar erros de cache ENOENT:

```bash
# Windows
Remove-Item .next -Recurse -Force
npm run build

# Linux/Mac
rm -rf .next
npm run build
```

### Problemas de Build

1. **Limpar cache completamente**:

   ```bash
   rm -rf .next node_modules/.cache
   npm run build
   ```

2. **Verificar variáveis de ambiente**:
   - Confirme que `.env.local` existe
   - Verifique se todas as variáveis do Supabase estão corretas

3. **Problemas de rede durante build**:
   - Fonts do Google podem falhar ocasionalmente
   - Simplesmente execute `npm run build` novamente

### Middleware e Rotas

O middleware está configurado para:

- **Permitir**: `/login`, `/signup`, `/api/webhooks`, assets estáticos
- **Proteger**: Todas as outras rotas (redireciona para `/login`)
- **Evitar loops**: Não intercepta rotas já públicas

Padrão do matcher:

```typescript
'/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|login|signup|reset-password|forgot-password|api/webhooks).*)';
```

### Supabase

#### Configuração no Cliente

- Usa chave anônima (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Respeita RLS automaticamente
- Gerencia sessão via cookies

#### Configuração no Servidor

- Server Actions usam service role quando necessário
- RLS aplicado por padrão para operações sensíveis

### Problemas Comuns

1. **404 no /login**:
   - Verifique se `src/app/login/page.tsx` existe
   - Confirme que não há conflitos no middleware

2. **Loops de redirecionamento**:
   - Verifique as rotas públicas no middleware
   - Confirme que `/login` está excluído do matcher

3. **Erros de autenticação**:
   - Verifique variáveis do Supabase em `.env.local`
   - Confirme que as URLs estão corretas (sem trailing slash)

4. **TypeScript errors**:
   - Execute `npm run type-check`
   - Verifique se todos os tipos estão importados corretamente

## Desenvolvimento

### Padrões de Código

- **Server Components**: Padrão por padrão
- **Client Components**: Apenas quando necessário (use `"use client"`)
- **Server Actions**: Para todas as mutações
- **React Query**: Para cache e sincronização de estado
- **Zod**: Para validação de dados

### Design System

Utilize os componentes do design system em `src/components/ui/`:

- `DSButton` - Botões padronizados
- `DSTextField` - Campos de texto
- `DSTable` - Tabelas com paginação
- `DSDialog` - Modais consistentes
- `PageHeader` - Cabeçalhos de página

### Exemplo de Componente

```typescript
'use client'

import { DSButton, DSTextField } from '@/components/ui'
import { useCreateCliente } from '@/hooks/use-clientes'
import { CreateClienteSchema } from '@/schemas'

export function ClienteForm() {
  const createMutation = useCreateCliente()

  const handleSubmit = async (formData: FormData) => {
    const result = await createMutation.mutateAsync(formData)
    if (result.success) {
      // Handle success
    }
  }

  return (
    <form action={handleSubmit}>
      <DSTextField name="nome" label="Nome" required />
      <DSButton type="submit" loading={createMutation.isPending}>
        Salvar
      </DSButton>
    </form>
  )
}
```

## Deploy

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente para Produção

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

## Suporte

Para problemas técnicos, consulte:

1. Documentação do Supabase: https://supabase.com/docs
2. Next.js 14: https://nextjs.org/docs
3. Material-UI: https://mui.com/

---

**Versão**: 1.2.0  
**Última Atualização**: Agosto 2025
