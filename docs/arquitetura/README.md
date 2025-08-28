# Arquitetura do Sistema

## Estrutura de Pastas

```
src/
├── app/              # Rotas (App Router) + Server Actions
├── components/       # Componentes React
│   ├── ui/           # Design System (DSButton, DSTable, etc.)
│   ├── layout/       # Componentes de layout
│   └── features/     # Componentes específicos de funcionalidades
├── hooks/            # Custom hooks
├── lib/              # Utilitários e configurações
│   ├── supabase/     # Cliente Supabase
│   ├── theme/        # Tema MUI
│   └── utils/        # Utilitários gerais
├── schemas/          # Esquemas Zod para validação
├── types/            # Tipos TypeScript
└── middleware.ts     # Middleware Next.js
```

## Multi-tenancy

O sistema é multi-tenant baseado em `unit_id`. Todas as operações respeitam o isolamento por unidade através de políticas RLS (Row Level Security) no Supabase.

## Autenticação

- **Login**: `/login`
- **Middleware**: Protege rotas privadas automaticamente
- **Rotas Públicas**: `/login`, `/signup`, `/forgot-password`, `/api/webhooks`
- **Redirecionamento**: Usuários não autenticados são redirecionados para `/login` com parâmetro `redirectTo`.
