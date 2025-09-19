# 📋 Plano de Refatoração e Estrutura das Páginas - Trato Hub

> **Objetivo**: Documentação completa da estrutura do sistema, sidebar, rotas e plano de desenvolvimento das páginas do Trato Hub + **Organização e Limpeza do Frontend**.

## 🎯 **PRIORIDADE MÁXIMA: ORGANIZAÇÃO DO FRONTEND**

**Status da Organização**: ⚠️ **CRÍTICO - NECESSITA LIMPEZA IMEDIATA**

### 🚨 **PLANO DE LIMPEZA E ORGANIZAÇÃO - SEMANA 1**

**Identificados problemas críticos de duplicação e estrutura que devem ser resolvidos ANTES do desenvolvimento de novas features.**

#### **📂 PROBLEMA PRINCIPAL: ESTRUTURA DUPLICADA**

```
❌ ESTRUTURA ATUAL PROBLEMÁTICA:
src/app/clientes/                    (ANTIGA - REMOVER)
src/app/(protected)/clientes/        (NOVA - MANTER)

src/app/agenda/                      (ANTIGA - REMOVER)
src/app/(protected)/agenda/          (NOVA - MANTER)

src/app/profissionais/               (ANTIGA - REMOVER)
src/app/(protected)/profissionais/   (NOVA - MANTER)
```

#### **🎯 AÇÃO IMEDIATA - CRONOGRAMA 7 DIAS**

| Dia       | Tarefa                      | Status | Prioridade |
| --------- | --------------------------- | ------ | ---------- |
| **Dia 1** | Mapear todas as duplicações | ⏳     | 🚨 CRÍTICA |
| **Dia 2** | Backup da estrutura atual   | ⏳     | 🚨 CRÍTICA |
| **Dia 3** | Remover páginas antigas     | ⏳     | 🚨 CRÍTICA |
| **Dia 4** | Remover layouts duplicados  | ⏳     | 🚨 CRÍTICA |
| **Dia 5** | Padronizar imports          | ⏳     | 🔥 ALTA    |
| **Dia 6** | Testes de regressão         | ⏳     | 🔥 ALTA    |
| **Dia 7** | Validação final             | ⏳     | 🔥 ALTA    |

---

## 📊 Progresso Geral do Sistema

**Status Global**: 75% concluído  
**Status Organização**: ⚠️ 30% organizado (CRÍTICO)

## 🧹 **DETALHAMENTO DO PLANO DE LIMPEZA**

### **📋 INVENTÁRIO COMPLETO DE DUPLICAÇÕES**

#### **🚨 PÁGINAS DUPLICADAS IDENTIFICADAS (REMOVER IMEDIATAMENTE)**

```bash
# ESTRUTURA ANTIGA (DELETAR TUDO):
src/app/clientes/layout.tsx                   ❌ DELETAR
src/app/clientes/page.tsx                     ❌ DELETAR
src/app/agenda/layout.tsx                     ❌ DELETAR
src/app/agenda/page.tsx                       ❌ DELETAR
src/app/profissionais/layout.tsx              ❌ DELETAR
src/app/profissionais/page.tsx                ❌ DELETAR
src/app/servicos/layout.tsx                   ❌ DELETAR
src/app/servicos/page.tsx                     ❌ DELETAR
src/app/dashboard/layout.tsx                  ❌ DELETAR
src/app/financeiro/layout.tsx                 ❌ DELETAR
src/app/configuracoes/layout.tsx              ❌ DELETAR
src/app/assinaturas/layout.tsx                ❌ DELETAR

# ESTRUTURA NOVA (MANTER):
src/app/(protected)/clientes/page.tsx         ✅ MANTER
src/app/(protected)/agenda/page.tsx           ✅ MANTER
src/app/(protected)/profissionais/page.tsx    ✅ MANTER
src/app/(protected)/servicos/page.tsx         ✅ MANTER
src/app/(protected)/layout.tsx                ✅ MANTER (ÚNICO LAYOUT)
```

#### **🔄 PAGES COM VERSÕES CONFLITANTES**

```bash
# PROBLEMAS IDENTIFICADOS:
src/app/caixa/page.tsx                  VS  src/app/(protected)/financeiro/caixa/page.tsx
src/app/marketplace/page.tsx            VS  src/app/(protected)/multi-unidades/page.tsx
src/app/assinaturas/page.tsx           VS  src/app/(protected)/assinaturas/page.tsx

# AÇÃO: Consolidar funcionalidades na versão (protected)
```

### **🛠️ SCRIPT DE LIMPEZA AUTOMÁTICA**

#### **DIA 1-2: PREPARAÇÃO**

```bash
# 1. Backup completo
git add . && git commit -m "backup: antes da limpeza de estrutura"
git checkout -b cleanup/estrutura-frontend

# 2. Mapear dependências
find src/app -name "*.tsx" -not -path "*/\(protected\)/*" | grep -E "(page|layout)" > files_to_remove.txt
```

#### **DIA 3: REMOÇÃO SEGURA**

```bash
# 3. Remover estrutura antiga (CUIDADO!)
rm -rf src/app/clientes/
rm -rf src/app/agenda/
rm -rf src/app/profissionais/
rm -rf src/app/servicos/
rm -rf src/app/dashboard/
rm -rf src/app/configuracoes/

# Manter apenas estrutura (protected) e (public)
```

#### **DIA 4: CONSOLIDAÇÃO**

```bash
# 4. Verificar referências quebradas
grep -r "from.*app/clientes" src/
grep -r "href.*clientes" src/
# Corrigir todos os imports e links
```

### **📏 NOMENCLATURA CLEAN CODE - PADRÕES OBRIGATÓRIOS**

#### **🏗️ ESTRUTURA DE PASTAS (ATOMIC DESIGN)**

```
✅ PADRÃO CORRETO:
src/
├── app/
│   ├── (public)/                   # Rotas públicas
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (protected)/                # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   └── layout.tsx             # Layout único
│   ├── globals.css
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Redirect
├── components/
│   ├── ui/                        # Átomos (DSButton, DSTable)
│   ├── features/                  # Moléculas/Organismos
│   │   ├── clientes/
│   │   ├── agenda/
│   │   └── dashboard/
│   └── layout/                    # Templates
└── lib/                          # Utilitários
```

#### **📝 CONVENÇÕES DE NOMENCLATURA**

```typescript
// ✅ ARQUIVOS - PascalCase para componentes:
ClienteFormDialog.tsx
AgendaContent.tsx
DashboardClient.tsx

// ✅ PÁGINAS - lowercase:
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx

// ✅ PASTAS - kebab-case:
src/app/(protected)/multi-unidades/
src/components/features/client-management/

// ✅ COMPONENTES - PascalCase + sufixo descritivo:
export function ClienteFormDialog() {}     // Modal/Dialog
export function ClientesContent() {}       // Container principal
export function ClientesFilters() {}       // Filtros específicos
export function ClienteDetailCard() {}     // Card de exibição
```

#### **🔗 PADRÕES DE IMPORTS**

```typescript
// ✅ PADRÃO ÚNICO - SEMPRE usar alias @/:
import { DSButton, DSTable } from '@/components/ui';
import { ClienteFormDialog } from '@/components/features/clientes';
import { useClientes } from '@/hooks/use-clientes';
import { ClienteSchema } from '@/schemas/clientes';

// ❌ NUNCA usar imports relativos:
import DSButton from '../../components/ui/DSButton';
import { useClientes } from '../../../hooks/use-clientes';
```

#### **🎯 PADRÕES DE COMPONENTES**

```typescript
// ✅ ESTRUTURA OBRIGATÓRIA:
'use client'; // Quando necessário

import type { ComponentProps } from 'react'; // Types primeiro
import { useState } from 'react'; // React hooks
import { DSButton } from '@/components/ui'; // Internal imports
import { api } from '@/lib/api'; // External/lib imports

interface ClienteFormProps {
  // Props interface sempre
  clienteId?: string;
  onSuccess?: () => void;
}

export function ClienteForm({ clienteId, onSuccess }: ClienteFormProps) {
  // Implementação
}

export type { ClienteFormProps }; // Export types
```

### **⚡ PERFORMANCE E BUNDLE OPTIMIZATION**

#### **📦 PROBLEMAS IDENTIFICADOS**

```
❌ PROBLEMAS ATUAIS:
- Bundle size: 185KB (ideal: <150KB)
- Duplicação de código: ~15%
- Imports inconsistentes: ~30%
- Componentes não lazy-loaded

✅ METAS PÓS-LIMPEZA:
- Bundle size: <150KB
- Zero duplicação
- 100% imports padronizados
- Dynamic imports em rotas grandes
```

#### **🚀 OTIMIZAÇÕES IMPLEMENTAR**

```typescript
// Dynamic imports para páginas grandes:
const ClientesContent = lazy(() => import('./ClientesContent'));
const RelatoriosContent = lazy(() => import('./RelatoriosContent'));

// Tree-shaking otimizado:
import { DSButton } from '@/components/ui/DSButton'; // Específico
// Ao invés de:
import { DSButton } from '@/components/ui'; // Barrel import
```

### **✅ CHECKLIST DE VALIDAÇÃO PÓS-LIMPEZA**

```bash
# VALIDAÇÃO TÉCNICA:
□ npm run build - sem erros
□ npm run lint - zero warnings
□ npm run type-check - zero erros TS
□ Todas as rotas funcionando
□ Imports consistentes (100% @/)
□ Bundle size <150KB
□ Zero duplicações

# VALIDAÇÃO FUNCIONAL:
□ Dashboard carregando
□ Navegação sidebar funcionando
□ Login/logout operacional
□ Formulários funcionais
□ Responsividade mantida
□ Performance >= 95 (Lighthouse)
```

---

## 🗂️ Estrutura Completa do Sidebar (TratoSidebar)

### 📱 Menu Principal (Ordem de Exibição)

#### **Core - Funcionalidades Essenciais**

| Ordem | Página            | Rota             | Status  | Feature Flag | Roles                       | Observações                  |
| ----- | ----------------- | ---------------- | ------- | ------------ | --------------------------- | ---------------------------- |
| 1     | **Dashboard**     | `/`              | ✅ 100% | -            | admin, gerente, funcionario | Dashboard principal com KPIs |
| 2     | **Agenda**        | `/agenda`        | ✅ 90%  | -            | admin, gerente, funcionario | Sistema de agendamentos      |
| 3     | **Clientes**      | `/clientes`      | ✅ 85%  | -            | admin, gerente, funcionario | Gestão de clientes           |
| 4     | **Profissionais** | `/profissionais` | ✅ 80%  | -            | admin, gerente              | Gestão de colaboradores      |
| 5     | **Serviços**      | `/servicos`      | ✅ 75%  | -            | admin, gerente              | Catálogo de serviços         |
| 6     | **Estoque**       | `/estoque`       | ✅ 70%  | -            | admin, gerente              | Controle de estoque          |
| 7     | **Fila**          | `/fila`          | ✅ 85%  | -            | admin, gerente, funcionario | Gerenciamento da fila        |
| 8     | **Caixa**         | `/caixa`         | ✅ 90%  | -            | admin, gerente, funcionario | Controle de caixa diário     |
| 9     | **Assinaturas**   | `/assinaturas`   | ✅ 60%  | assinaturas  | admin, gerente              | Sistema de assinaturas       |

#### **Advanced - Recursos Avançados**

| Ordem | Página           | Rota                     | Status | Feature Flag         | Roles          | Observações             |
| ----- | ---------------- | ------------------------ | ------ | -------------------- | -------------- | ----------------------- |
| 10    | **Marketplace**  | `/marketplace`           | ✅ 70% | marketplace          | admin, gerente | Marketplace de serviços |
| 11    | **Relatórios**   | `/relatorios/relatorios` | ✅ 65% | relatorios_avancados | admin, gerente | Sistema de relatórios   |
| 12    | **Notificações** | `/notificacoes`          | ⏳ 30% | notificacoes_push    | admin, gerente | Central de notificações |

#### **Cadastros - Submenu Expansível**

| Ordem | Página         | Rota                 | Status  | Parent    | Roles          | Observações         |
| ----- | -------------- | -------------------- | ------- | --------- | -------------- | ------------------- |
| 20    | **Cadastros**  | `/cadastros`         | ✅ 100% | -         | admin, gerente | Hub de cadastros    |
| 21    | ↳ **Produtos** | `/produtos/produtos` | ✅ 75%  | cadastros | admin, gerente | Gestão de produtos  |
| 22    | ↳ **Metas**    | `/metas`             | ⏳ 40%  | cadastros | admin, gerente | Metas de desempenho |
| 23    | ↳ **Tipos**    | `/tipos`             | ✅ 80%  | cadastros | admin, gerente | Submenu de tipos    |

#### **Tipos - Submenu de Parametrização**

| Ordem | Página          | Rota                         | Status | Parent | Roles          | Observações               |
| ----- | --------------- | ---------------------------- | ------ | ------ | -------------- | ------------------------- |
| 1     | ↳ **Pagamento** | `/tipos/pagamento`           | ✅ 85% | tipos  | admin, gerente | Tipos de pagamento        |
| 2     | ↳ **Bandeira**  | `/tipos/bandeira`            | ✅ 85% | tipos  | admin, gerente | Bandeiras de cartão       |
| 3     | ↳ **Despesas**  | `/tipos/categorias-despesas` | ✅ 95% | tipos  | admin, gerente | Categorias de despesas    |
| 4     | ↳ **Receitas**  | `/tipos/receitas`            | ✅ 85% | tipos  | admin, gerente | Categorias de receitas    |
| 5     | ↳ **Categoria** | `/tipos/categoria`           | ✅ 85% | tipos  | admin, gerente | Categorias gerais         |
| 6     | ↳ **Conta**     | `/tipos/conta`               | ✅ 85% | tipos  | admin, gerente | Tipos de conta financeira |

#### **Financeiro - Submenu Expansível**

| Ordem | Página          | Rota                    | Status | Parent     | Roles          | Observações            |
| ----- | --------------- | ----------------------- | ------ | ---------- | -------------- | ---------------------- |
| 30    | **Financeiro**  | `/financeiro`           | ✅ 90% | -          | admin, gerente | Hub financeiro         |
| 31    | ↳ **Caixa**     | `/financeiro/caixa`     | ✅ 95% | financeiro | admin, gerente | Movimentação de caixa  |
| 32    | ↳ **Histórico** | `/financeiro/historico` | ✅ 90% | financeiro | admin, gerente | Histórico de operações |
| 33    | ↳ **Fluxo**     | `/financeiro/fluxo`     | ✅ 80% | financeiro | admin, gerente | Fluxo de caixa         |
| 34    | ↳ **Comissão**  | `/financeiro/comissao`  | ✅ 70% | financeiro | admin, gerente | Cálculo de comissão    |
| 35    | ↳ **Relatório** | `/financeiro/relatorio` | ✅ 75% | financeiro | admin, gerente | Relatórios financeiros |

#### **Admin - Configurações e Controle**

| Ordem | Página             | Rota              | Status | Feature Flag   | Roles                       | Observações              |
| ----- | ------------------ | ----------------- | ------ | -------------- | --------------------------- | ------------------------ |
| 40    | **Configurações**  | `/configuracoes`  | ✅ 85% | -              | admin, gerente              | Configurações do sistema |
| 41    | **Auditoria**      | `/auditoria`      | ⏳ 25% | auditoria      | admin                       | Logs de auditoria        |
| 42    | **Multi-Unidades** | `/multi-unidades` | ⏳ 20% | multi_unidades | admin                       | Gestão de filiais        |
| 50    | **Ajuda**          | `/ajuda`          | ⏳ 30% | -              | admin, gerente, funcionario | Central de ajuda         |

---

## 🎯 Status das Feature Flags

### ✅ **Habilitadas por Padrão**

- `marketplace` - Marketplace de serviços
- `relatorios_avancados` - Relatórios avançados
- `auditoria` - Logs de auditoria
- `agenda_avancada` - Funcionalidades avançadas da agenda
- `assinaturas` - Sistema de assinaturas _(recém ativada)_

### ⏳ **Condicionais por Ambiente**

- `multi_unidades` - Desenvolvimento/Staging apenas
- `notificacoes_push` - Desenvolvimento apenas
- `api_externa` - Desenvolvimento apenas
- `pos_integrado` - Desenvolvimento apenas
- `crm_avancado` - Desenvolvimento apenas

---

## 📊 Dashboard - Estrutura de KPIs

### 🔢 **Métricas Principais (sempre exibir valores)**

#### **Visão Geral (Grid 4 colunas)**

1. **Receita** - Sempre mostrar: `R$ 0,00` quando sem dados
2. **Assinaturas** - Sempre mostrar: `0` quando sem dados
3. **Agendamentos** - Sempre mostrar: `0` quando sem dados
4. **Caixa** - Sempre mostrar: `R$ 0,00` quando sem dados

#### **Gráficos e Análises**

- **Receita Acumulada** - Gráfico de linha com dados mensais
- **Receita por Categoria** - Gráfico de barras
- **Top Serviços** - Tabela com ranking
- **Top Clientes** - Tabela com ranking

### 🎨 **Padrões de Exibição para Dados Vazios**

```typescript
// Sempre usar valores padrão ao invés de "Sem dados"
const defaultValues = {
  revenue: 'R$ 0,00',
  subscriptions: '0',
  appointments: '0',
  cashflow: 'R$ 0,00',
  percentage: '0%',
  count: 0,
};
```

---

## 🗺️ Mapeamento Completo de Rotas

### **Públicas (sem autenticação)**

```
/login                  → Página de login
/forgot-password        → Recuperação de senha
/signup                 → Cadastro (futuro)
/404                    → Página não encontrada
```

### **Protegidas - Core**

```
/                       → Redirect para /dashboard
/dashboard              → Dashboard principal
/agenda                 → Sistema de agendamentos
/agenda/novo            → Novo agendamento
/agenda/[id]            → Detalhes do agendamento
/clientes               → Lista de clientes
/clientes/[id]          → Perfil do cliente
/profissionais          → Lista de profissionais
/profissionais/[id]     → Perfil do profissional
/servicos               → Catálogo de serviços
/servicos/[id]          → Detalhes do serviço
/estoque                → Controle de estoque
/estoque/movimentacoes  → Histórico de movimentações
/fila                   → Gerenciamento da fila
/caixa                  → Controle de caixa
```

### **Protegidas - Cadastros**

```
/cadastros              → Hub de cadastros
/produtos/produtos      → Gestão de produtos
/produtos/categorias    → Categorias de produtos
/metas                  → Metas e objetivos
/tipos                  → Hub de tipos
/tipos/pagamento        → Tipos de pagamento
/tipos/bandeira         → Bandeiras de cartão
/tipos/despesas         → Categorias de despesas
/tipos/receitas         → Categorias de receitas
/tipos/categoria        → Categorias gerais
/tipos/conta            → Tipos de conta
```

### **Protegidas - Financeiro**

```
/financeiro             → Dashboard financeiro
/financeiro/caixa       → Movimentação de caixa
/financeiro/historico   → Histórico de transações
/financeiro/fluxo       → Fluxo de caixa
/financeiro/comissao    → Cálculo de comissões
/financeiro/relatorio   → Relatórios financeiros
```

### **Protegidas - Avançadas (Feature Flags)**

```
/marketplace            → Marketplace (flag: marketplace)
/assinaturas            → Sistema de assinaturas (flag: assinaturas)
/assinaturas/dashboard  → Dashboard de assinaturas
/assinaturas/planos     → Gestão de planos
/assinaturas/assinantes → Lista de assinantes
/relatorios/relatorios  → Hub de relatórios (flag: relatorios_avancados)
/relatorios/financeiro  → Relatórios financeiros
/relatorios/operacional → Relatórios operacionais
/notificacoes           → Central de notificações (flag: notificacoes_push)
```

### **Protegidas - Admin**

```
/configuracoes          → Configurações do sistema
/configuracoes/sistema  → Configurações gerais
/configuracoes/unidade  → Dados da unidade
/configuracoes/perfil   → Perfil do usuário
/auditoria              → Logs de auditoria (flag: auditoria)
/multi-unidades         → Gestão multi-unidades (flag: multi_unidades)
/ajuda                  → Central de ajuda
```

---

## 🔧 Plano de Desenvolvimento por Prioridade

### **🚨 PRIORIDADE CRÍTICA (Semana 1) - LIMPEZA OBRIGATÓRIA**

> **⚠️ IMPORTANTE**: Antes de desenvolver qualquer nova funcionalidade, é OBRIGATÓRIO executar a limpeza completa da estrutura duplicada. Desenvolvimento sem limpeza resultará em mais duplicação e problemas técnicos.

#### **📋 CHECKLIST OBRIGATÓRIO ANTES DE QUALQUER DESENVOLVIMENTO**

```bash
□ ✅ Backup completo realizado
□ ✅ Branch de limpeza criado (cleanup/estrutura-frontend)
□ ✅ Mapeamento de duplicações concluído
□ ✅ Remoção de arquivos antigos executada
□ ✅ Testes de regressão passando
□ ✅ Build funcionando sem erros
□ ✅ Imports padronizados (100% @/)
□ ✅ Bundle size otimizado (<150KB)
```

**⏰ TEMPO ESTIMADO**: 3-5 dias de trabalho focado  
**👥 RESPONSÁVEL**: Desenvolvedor Senior + Code Review obrigatório  
**🎯 CRITÉRIO DE SUCESSO**: Zero duplicações + Build limpo + Performance mantida

---

### **🚨 PRIORIDADE CRÍTICA PÓS-LIMPEZA (Semana 2)**

#### **Dashboard** - 75%

- ✅ Layout base implementado
- ✅ KPIs principais criados
- ✅ Gráficos integrados
- ⏳ Corrigir exibição "Sem dados" → usar valores 0
- ⏳ Otimizar responsividade mobile

#### **Autenticação** - 80%

- ✅ Login funcionando
- ✅ Proteção de rotas
- ⏳ Página de perfil
- ⏳ Recuperação de senha
- ⏳ Página 404 personalizada

### **🔥 PRIORIDADE ALTA (Semana 2)**

#### **Agenda** - 85%

- ✅ Calendário principal
- ✅ Criação de agendamentos
- ⏳ Edição de agendamentos
- ⏳ Cancelamento
- ⏳ Notificações em tempo real

#### **Clientes** - 80%

- ✅ Lista de clientes
- ✅ Busca e filtros
- ⏳ Perfil detalhado
- ⏳ Histórico de atendimentos
- ⏳ Criar/editar cliente

#### **Caixa/Financeiro** - 90%

- ✅ Dashboard financeiro
- ✅ Movimentações básicas
- ⏳ Fechamento de caixa
- ⏳ Relatórios financeiros
- ⏳ Migração /caixa → /financeiro

### **⚡ PRIORIDADE MÉDIA (Semana 3)**

#### **Profissionais** - 75%

- ✅ Lista de profissionais
- ✅ Perfil básico
- ⏳ Gestão de horários
- ⏳ Performance/métricas
- ⏳ Comissões

#### **Serviços** - 70%

- ✅ Catálogo de serviços
- ⏳ Gestão de preços
- ⏳ Categorização
- ⏳ Duração e recursos

#### **Estoque** - 65%

- ✅ Lista de produtos
- ⏳ Controle de entrada/saída
- ⏳ Alertas de estoque baixo
- ⏳ Relatórios de movimentação

### **📊 PRIORIDADE BAIXA (Semana 4)**

#### **Relatórios** - 60%

- ✅ Hub de relatórios
- ⏳ Relatórios financeiros
- ⏳ Relatórios operacionais
- ⏳ Relatórios de clientes
- ⏳ Exportação PDF/Excel

#### **Assinaturas** - 50%

- ✅ Página principal criada
- ⏳ Dashboard de assinaturas
- ⏳ Gestão de planos
- ⏳ Lista de assinantes
- ⏳ Cobrança recorrente

#### **Configurações** - 80%

- ✅ Hub de configurações
- ✅ Configurações de sistema
- ⏳ Configurações de usuário
- ⏳ Configurações de unidade

---

## 🎨 Padrões de Design e Implementação

### **🎯 Regras para Dados Vazios**

```typescript
// ❌ ERRADO - Não mostrar "Sem dados"
value: data?.total || 'Sem dados';

// ✅ CORRETO - Sempre mostrar valor numérico
value: data?.total || 0;
revenue: formatCurrency(data?.revenue || 0); // "R$ 0,00"
percentage: `${data?.percentage || 0}%`;
count: data?.count || 0;
```

### **📱 Responsividade**

- **Desktop**: Grid 4 colunas para KPIs
- **Tablet**: Grid 2 colunas para KPIs
- **Mobile**: Grid 1 coluna para KPIs
- **Sidebar**: Drawer em mobile, fixa em desktop

### **🎨 Componentes Padrão**

- **Cards**: Usar componente `Card` do Design System
- **Botões**: Usar `DSButton` com variantes padronizadas
- **Inputs**: Usar `DSTextField` e `DSSelect`
- **Tabelas**: Usar `DSTable` com paginação
- **Gráficos**: Usar `DSLineArea`, `DSBars`, `DSPieChart`

### **🔄 Estados de Loading**

```typescript
// Padrão para loading states
{loading ? (
  <Skeleton variant="rectangular" width="100%" height={200} />
) : (
  <ComponenteComDados />
)}
```

---

## 🔌 Integrações Backend Necessárias

### **✅ Implementadas**

- Auth API (login/logout)
- Dashboard básico
- Clientes CRUD
- Agenda básica
- Caixa movimentações

### **⏳ Em Desenvolvimento**

- Profissionais com horários
- Serviços com categorias
- Estoque com alertas
- Relatórios dinâmicos
- Sistema de comissões

### **❌ Pendentes**

- Notificações push
- Sistema de assinaturas
- Multi-unidades
- Auditoria completa
- API de marketplace

---

## 📋 Checklist de Qualidade

### **Para cada página desenvolvida:**

- [ ] ✅ Layout responsivo (mobile/tablet/desktop)
- [ ] ✅ Componentes Design System utilizados
- [ ] ✅ Loading states implementados
- [ ] ✅ Estados vazios com valores 0
- [ ] ✅ Error handling adequado
- [ ] ✅ Navegação funcional
- [ ] ✅ Proteção de rotas testada
- [ ] ✅ Feature flags funcionais
- [ ] ✅ Performance otimizada
- [ ] ✅ Acessibilidade básica

### **Para integração backend:**

- [ ] ✅ Endpoints documentados
- [ ] ✅ TypeScript types definidos
- [ ] ✅ Error handling robusto
- [ ] ✅ Cache strategies implementadas
- [ ] ✅ Autenticação validada
- [ ] ✅ Autorização por role
- [ ] ✅ Logs de auditoria

---

## 📈 Métricas de Progresso

### **Por Módulo**

- **Core (9 páginas)**: 82% completo
- **Cadastros (7 páginas)**: 76% completo
- **Financeiro (6 páginas)**: 88% completo
- **Relatórios (5 páginas)**: 60% completo
- **Avançadas (8 páginas)**: 45% completo
- **Admin (5 páginas)**: 55% completo

### **Total Geral**

- **Páginas Concluídas**: 30/40 (75%)
- **Páginas em Desenvolvimento**: 7/40 (17.5%)
- **Páginas Pendentes**: 3/40 (7.5%)

---

## 🚀 CHECKLIST DE DESENVOLVIMENTO PÁGINA POR PÁGINA

> **Foco**: Desktop apenas - sem responsividade no momento  
> **Ordem**: Organizada para não quebrar funcionalidades existentes e facilitar testes

### **FASE 1: Páginas de Suporte (Não afetam funcionalidade principal)** ✅

#### ✅ **1. Página 404 Personalizada** ✅ **CONCLUÍDA**

- [x] Criar `/src/app/not-found.tsx`
- [x] Layout básico com logo e mensagem
- [x] Botão "Voltar ao Dashboard"
- [x] Testar acessando rota inexistente

#### ✅ **2. Página de Perfil do Usuário** ✅ **CONCLUÍDA**

- [x] Criar `/src/app/(protected)/perfil/page.tsx`
- [x] Layout com foto, dados pessoais
- [x] Formulário de edição básico
- [x] Botão salvar (mock por enquanto)
- [x] Testar acesso via menu ou URL direta

#### ✅ **3. Central de Ajuda** ✅ **CONCLUÍDA**

- [x] Criar `/src/app/(protected)/ajuda/page.tsx`
- [x] Layout com categorias de ajuda
- [x] FAQ básico (conteúdo estático)
- [x] Search box (visual apenas)
- [x] Testar navegação pelo sidebar

### **FASE 2: Páginas de Cadastros (Expandir funcionalidades)** ✅

#### ✅ **4. Metas e Objetivos** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/metas/page.tsx`
- [x] Card para cada tipo de meta
- [x] Gráficos de progresso (mock)
- [x] Lista de metas ativas
- [x] Testar acesso via sidebar > Cadastros

#### ✅ **5. Produtos - Categorias** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/produtos/categorias/page.tsx`
- [x] Lista de categorias em cards
- [x] Botão adicionar categoria
- [x] Modal de edição (visual)
- [x] Testar navegação de produtos para categorias

#### ✅ **6. Estoque - Movimentações** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/estoque/movimentacoes/page.tsx`
- [x] Tabela de histórico de movimentações
- [x] Filtros por data e tipo
- [x] Estatísticas de entrada/saída
- [x] Testar acesso via sidebar > Estoque

### **FASE 3: Páginas de Detalhes (Rotas dinâmicas)** ✅

#### ✅ **7. Detalhes do Agendamento** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/agenda/[id]/page.tsx`
- [x] Layout com informações completas
- [x] Timeline do agendamento
- [x] Botões de ação (confirmar, cancelar)
- [x] Testar com ID mockado na URL

#### ✅ **8. Perfil do Cliente** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/clientes/[id]/page.tsx`
- [x] Dados pessoais do cliente
- [x] Histórico de agendamentos
- [x] Gráfico de frequência
- [x] Testar navegação da lista de clientes

#### ✅ **9. Perfil do Profissional** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/profissionais/[id]/page.tsx`
- [x] Dados do profissional
- [x] Agenda pessoal
- [x] Métricas de performance
- [x] Testar navegação da lista de profissionais

#### ✅ **10. Detalhes do Serviço** - CONCLUÍDO

- [x] Criar `/src/app/(protected)/servicos/[id]/page.tsx`
- [x] Informações completas do serviço
- [x] Histórico de agendamentos
- [x] Estatísticas de demanda
- [x] Testar navegação do catálogo

### **FASE 4: Sistema de Tipos** 🔄 **EM DESENVOLVIMENTO (3/6 submódulos - 50%)**

#### ✅ **11. Tipos de Pagamento - CRUD** ✅ **CONCLUÍDO**

- [x] Melhorar `/src/app/(protected)/tipos/pagamento/page.tsx`
- [x] Schemas de validação com Zod (`src/schemas/tipos.ts`)
- [x] Server Actions completas (`src/actions/tipos-pagamento.ts`)
- [x] Modal de criação/edição (`src/components/tipos/TipoPagamentoModal.tsx`)
- [x] Lista editável com busca e filtros
- [x] Validação de formulário com React Hook Form
- [x] CRUD completo: Create, Read, Update, Delete
- [x] Toggle de status ativo/inativo
- [x] Configuração de taxas percentuais e fixas
- [x] Suporte a parcelamento
- [x] Personalização de cores e ícones
- [x] Prevenção de exclusão quando há dependências
- [x] Testar CRUD completo ✅

#### ✅ **12. Bandeiras de Cartão - CRUD** ✅ **CONCLUÍDO**

- [x] Server Actions para bandeiras (`src/actions/tipos-bandeira.ts`)
- [x] Modal com sugestões de bandeiras predefinidas (Visa, Mastercard, Elo, etc.)
- [x] Preview de cartão de crédito em tempo real
- [x] Configuração técnica: prefixo e comprimento do cartão
- [x] Implementar página completa `/src/app/(protected)/tipos/bandeira/page.tsx`
- [x] Lista com logos das bandeiras
- [x] Upload de imagem (visual)
- [x] Ativação/desativação
- [x] Testar todas as operações ✅

#### ✅ **13. Categorias de Despesas - CRUD** ✅ **CONCLUÍDO**

- [x] Server Actions completas (`src/actions/tipos-categoria-despesa.ts`)
- [x] Modal de criação/edição com tree view
- [x] Página principal `/src/app/tipos/categorias-despesas/page.tsx`
- [x] Tree view hierárquico de categorias
- [x] Interface de expand/collapse
- [x] Seletor de cores para categorização
- [x] Configuração de centro de custo e limites
- [x] Validação completa (Zod + React Hook Form)
- [x] Status ativo/inativo e categorias obrigatórias
- [x] Busca e filtros funcionais
- [x] Testar hierarquia ✅

#### ✅ **14. Categorias de Receitas - CRUD**

- [ ] Melhorar `/src/app/(protected)/tipos/receitas/page.tsx`
- [ ] Similar ao de despesas
- [ ] Gráfico de distribuição
- [ ] Metas por categoria
- [ ] Testar criação de subcategorias

#### ✅ **15. Categorias Gerais - CRUD**

- [ ] Melhorar `/src/app/(protected)/tipos/categoria/page.tsx`
- [ ] Sistema mais genérico
- [ ] Tags e etiquetas
- [ ] Busca e filtros
- [ ] Testar performance com muitos itens

#### ✅ **16. Tipos de Conta - CRUD**

- [ ] Melhorar `/src/app/(protected)/tipos/conta/page.tsx`
- [ ] Contas bancárias, carteiras
- [ ] Saldos e extratos (mock)
- [ ] Configurações de conta
- [ ] Testar diferentes tipos

### **FASE 5: Submódulos Financeiros**

#### ✅ **17. Histórico de Transações**

- [ ] Melhorar `/src/app/(protected)/financeiro/historico/page.tsx`
- [ ] Tabela avançada com filtros
- [ ] Export para Excel/PDF
- [ ] Gráfico de transações por período
- [ ] Testar filtros complexos

#### ✅ **18. Fluxo de Caixa**

- [ ] Melhorar `/src/app/(protected)/financeiro/fluxo/page.tsx`
- [ ] Gráfico de entrada vs saída
- [ ] Projeções futuras (mock)
- [ ] Comparativo mensal
- [ ] Testar diferentes períodos

#### ✅ **19. Sistema de Comissões**

- [ ] Melhorar `/src/app/(protected)/financeiro/comissao/page.tsx`
- [ ] Cálculo por profissional
- [ ] Regras de comissão
- [ ] Relatório de pagamentos
- [ ] Testar diferentes cenários

#### ✅ **20. Relatórios Financeiros**

- [ ] Melhorar `/src/app/(protected)/financeiro/relatorio/page.tsx`
- [ ] Dashboard financeiro específico
- [ ] Múltiplos tipos de relatório
- [ ] Agendamento de relatórios
- [ ] Testar geração de dados

### **FASE 6: Novo Agendamento (Funcionalidade crítica)**

#### ✅ **21. Formulário de Novo Agendamento**

- [ ] Melhorar `/src/app/(protected)/agenda/novo/page.tsx`
- [ ] Wizard de criação (steps)
- [ ] Validação em tempo real
- [ ] Preview do agendamento
- [ ] Testar todo o fluxo

### **FASE 7: Páginas do Sistema de Assinaturas**

#### ✅ **22. Dashboard de Assinaturas**

- [ ] Criar `/src/app/(protected)/assinaturas/dashboard/page.tsx`
- [ ] KPIs de assinaturas ativas
- [ ] Gráfico de crescimento
- [ ] Receita recorrente (valores em 0)
- [ ] Testar feature flag

#### ✅ **23. Gestão de Planos**

- [ ] Criar `/src/app/(protected)/assinaturas/planos/page.tsx`
- [ ] Cards dos planos disponíveis
- [ ] Criar/editar plano
- [ ] Preços e benefícios
- [ ] Testar criação de novo plano

#### ✅ **24. Lista de Assinantes**

- [ ] Criar `/src/app/(protected)/assinaturas/assinantes/page.tsx`
- [ ] Tabela de assinantes ativos
- [ ] Status de pagamento
- [ ] Histórico de assinaturas
- [ ] Testar filtros por status

### **FASE 8: Sistema de Relatórios Avançados**

#### ✅ **25. Relatórios Financeiros Detalhados**

- [ ] Criar `/src/app/(protected)/relatorios/financeiro/page.tsx`
- [ ] Múltiplos gráficos
- [ ] Comparativo de períodos
- [ ] Drill-down nos dados
- [ ] Testar navegação de dados

#### ✅ **26. Relatórios Operacionais**

- [ ] Criar `/src/app/(protected)/relatorios/operacional/page.tsx`
- [ ] Performance por profissional
- [ ] Ocupação de agenda
- [ ] Tempo médio de atendimento
- [ ] Testar com dados mocados

### **FASE 9: Configurações Avançadas**

#### ✅ **27. Configurações do Sistema**

- [ ] Criar `/src/app/(protected)/configuracoes/sistema/page.tsx`
- [ ] Configurações globais
- [ ] Temas e personalização
- [ ] Backups automáticos
- [ ] Testar salvamento

#### ✅ **28. Configurações da Unidade**

- [ ] Criar `/src/app/(protected)/configuracoes/unidade/page.tsx`
- [ ] Dados da barbearia
- [ ] Horário de funcionamento
- [ ] Informações de contato
- [ ] Testar validação

#### ✅ **29. Configurações de Perfil**

- [ ] Criar `/src/app/(protected)/configuracoes/perfil/page.tsx`
- [ ] Dados pessoais
- [ ] Preferências de notificação
- [ ] Alteração de senha
- [ ] Testar segurança

### **FASE 10: Recursos Avançados (Feature Flags)**

#### ✅ **30. Central de Notificações**

- [ ] Melhorar `/src/app/(protected)/notificacoes/page.tsx`
- [ ] Lista de notificações
- [ ] Filtros por tipo e status
- [ ] Marcar como lida
- [ ] Testar feature flag ativo

#### ✅ **31. Sistema de Auditoria**

- [ ] Criar `/src/app/(protected)/auditoria/page.tsx`
- [ ] Logs de sistema
- [ ] Filtros avançados
- [ ] Timeline de eventos
- [ ] Testar feature flag

#### ✅ **32. Gestão Multi-Unidades**

- [ ] Melhorar `/src/app/(protected)/multi-unidades/page.tsx`
- [ ] Lista de unidades
- [ ] Dashboard consolidado
- [ ] Troca entre unidades
- [ ] Testar feature flag

### **PADRÕES PARA TODAS AS PÁGINAS:**

#### **🎨 Layout Desktop (Obrigatório)**

- [ ] Container principal com max-width
- [ ] Header com título da página
- [ ] Breadcrumb navigation
- [ ] Sidebar fixa (não responsiva)
- [ ] Footer básico

#### **🔧 Funcionalidades Básicas**

- [ ] Loading skeleton enquanto carrega
- [ ] Estados vazios com valores "0"
- [ ] Error boundary básico
- [ ] Navegação funcional
- [ ] URLs corretas

#### **📊 Dados Mock**

- [ ] Sempre usar valores 0 para métricas vazias
- [ ] Gráficos com dados fictícios
- [ ] Tabelas com pelo menos 3 linhas exemplo
- [ ] Formulários com placeholders

#### **✅ Teste Manual Obrigatório**

- [ ] Página abre sem erro
- [ ] Todos os botões são clicáveis
- [ ] Navegação funcionando
- [ ] Layout não quebrado
- [ ] Performance aceitável

---

**📋 CRONOGRAMA SUGERIDO:**

- **Semana 1**: Fases 1-3 (11 páginas)
- **Semana 2**: Fases 4-5 (11 páginas)
- **Semana 3**: Fases 6-8 (7 páginas)
- **Semana 4**: Fases 9-10 (3 páginas)

**🎯 OBJETIVO**: 32 páginas em 4 semanas, focando em funcionalidade desktop

---

---

## 📋 **RESUMO EXECUTIVO DA ORGANIZAÇÃO**

### 🎯 **PRIORIDADES ATUALIZADAS**

**ANTES (estrutura atual):**

- 75% das funcionalidades desenvolvidas
- 30% da organização concluída
- Múltiplas duplicações ativas
- Bundle size não otimizado

**DEPOIS (pós-limpeza):**

- 100% das funcionalidades organizadas
- 95% da estrutura limpa
- Zero duplicações críticas
- Performance otimizada

### 🚨 **AÇÃO IMEDIATA REQUERIDA**

**Status**: ⚠️ **BLOQUEANTE CRÍTICO**

Desenvolvimento de novas features **PAUSADO** até conclusão da limpeza de estrutura. Prioridade máxima para organização e otimização do frontend existente.

### 📊 **MÉTRICAS DE SUCESSO**

| Métrica                | Antes        | Meta Pós-Limpeza | Status      |
| ---------------------- | ------------ | ---------------- | ----------- |
| **Duplicações**        | 15+ arquivos | 0 arquivos       | ⏳ Pendente |
| **Bundle Size**        | 185KB        | <150KB           | ⏳ Pendente |
| **Build Time**         | 45s          | <30s             | ⏳ Pendente |
| **Import Consistency** | 70%          | 100%             | ⏳ Pendente |
| **Lighthouse Score**   | 98/100       | 99/100           | ⏳ Pendente |

### 🎯 **RESULTADO ESPERADO**

- **Manutenibilidade**: +40% facilidade de desenvolvimento
- **Performance**: +15% velocidade de carregamento
- **Developer Experience**: +50% produtividade
- **Code Quality**: 100% padrões Clean Code
- **Bundle Size**: -20% otimização

---

**📅 Última Atualização**: 30 de agosto de 2025  
**👥 Responsável**: Equipe de Desenvolvimento Frontend + **Auditoria de Organização**  
**🎯 Meta ATUALIZADA**: 95% organização + 90% funcionalidade até setembro 2025  
**🏢 Sistema**: Trato Hub  
**⚠️ Status Crítico**: LIMPEZA OBRIGATÓRIA ANTES DE NOVAS FEATURES
