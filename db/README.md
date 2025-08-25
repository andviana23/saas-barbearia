# 🗃️ Sistema de Banco de Dados - Supabase PostgreSQL

Este diretório contém toda a estrutura de banco de dados do sistema Trato, incluindo migrações, esquemas e documentação.

## 📁 Estrutura de Arquivos

```
db/
├── migrations/                    # Arquivos SQL de migração
│   ├── 000_migration_control.sql  # Sistema de controle de migrações
│   ├── 001_initial_setup.sql     # Extensões, esquemas, tipos, funções
│   ├── 002_core_tables.sql       # Tabelas principais (unidades, profiles, etc)
│   ├── 003_appointments_queue.sql # Agendamentos e sistema de fila
│   └── 004_financial_rls.sql     # Sistema financeiro e RLS
├── migrate.js                    # Script de execução de migrações
└── README.md                     # Esta documentação
```

## 🚀 Como Usar o Sistema de Migrações

### Pré-requisitos

1. **Variáveis de ambiente configuradas** no `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL="sua-url-supabase"
   SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
   ```

2. **Node.js** instalado no sistema

### Comandos Disponíveis

```bash
# Executar todas as migrações pendentes
node db/migrate.js

# Ver status de todas as migrações
node db/migrate.js --status

# Ver ajuda
node db/migrate.js --help
```

### Exemplo de Execução

```bash
$ node db/migrate.js --status
📊 Status das Migrações

┌─────────┬──────────────────────────────────┬──────────┬─────────────────────┐
│ Versão  │ Nome                             │ Status   │ Executado em        │
├─────────┼──────────────────────────────────┼──────────┼─────────────────────┤
│ 000     │ Sistema de Controle de Migrações │ ✅ OK    │ 21/08/2025 14:30:15 │
│ 001     │ Configuração Inicial do Banco    │ ✅ OK    │ 21/08/2025 14:30:16 │
│ 002     │ Tabelas Core do Sistema          │ ⏳ Pendente │ -                   │
│ 003     │ Agendamentos e Sistema de Fila   │ ⏳ Pendente │ -                   │
│ 004     │ Sistema Financeiro e RLS         │ ⏳ Pendente │ -                   │
└─────────┴──────────────────────────────────┴──────────┴─────────────────────┘

⏳ 3 migração(ões) pendente(s)
```

## 📊 Estrutura do Banco de Dados

### Esquemas

- **`public`**: Tabelas principais do negócio
- **`auth`**: Tabelas de autenticação (Supabase nativo)
- **`audit`**: Tabelas de auditoria e logs (futuro)

### Extensões PostgreSQL

- **`uuid-ossp`**: Geração de UUIDs v4
- **`pgcrypto`**: Funções criptográficas
- **`citext`**: Texto case-insensitive (emails)

### Tipos Enumerados

```sql
-- Papéis de usuário
user_role: 'admin' | 'gestor' | 'profissional' | 'recepcao'

-- Status de agendamentos
appointment_status: 'criado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'faltou'

-- Status da fila
queue_status: 'aguardando' | 'chamado' | 'em_atendimento' | 'concluido' | 'desistiu'

-- Prioridade da fila
queue_priority: 'normal' | 'prioritaria' | 'urgente'

-- Tipo de movimento financeiro
movimento_tipo: 'entrada' | 'saida'
```

## 🔐 Row Level Security (RLS)

Todas as tabelas possuem **RLS ativo** com políticas específicas:

### Funções de Segurança

```sql
-- Obter ID do usuário autenticado
current_user_id() → uuid

-- Obter unidade padrão do usuário
current_unidade_id() → uuid

-- Verificar se usuário tem acesso à unidade
has_unit_access(unidade_id) → boolean

-- Verificar se usuário é admin
is_admin() → boolean
```

### Políticas Principais

1. **Multi-tenancy**: Usuários só veem dados de suas unidades
2. **Baseada em papéis**: Diferentes permissões por papel
3. **Admins**: Acesso total a todas as unidades
4. **Isolamento**: Dados entre unidades completamente isolados

## 🏗️ Tabelas Principais

### Tabelas Core

- **`unidades`**: Unidades/filiais do sistema
- **`profiles`**: Perfis de usuários
- **`profissionais`**: Profissionais que prestam serviços
- **`clientes`**: Clientes do sistema
- **`servicos`**: Catálogo de serviços

### Tabelas Operacionais

- **`appointments`**: Agendamentos
- **`appointments_servicos`**: Serviços de cada agendamento
- **`fila`**: Sistema de fila de atendimento
- **`financeiro_mov`**: Movimentações financeiras

### Tabela de Controle

- **`migrations`**: Controle de execução de migrações

## 🛡️ Segurança e Integridade

### Constraints Implementadas

- **Chaves estrangeiras**: Integridade referencial
- **Checks**: Validação de dados (valores positivos, comprimentos mínimos)
- **Unique**: Prevenção de duplicatas
- **Exclusion**: Prevenção de conflitos de agendamento

### Triggers Automáticos

- **`updated_at`**: Atualização automática em todas as tabelas
- **Cálculo de totais**: Agendamentos calculados automaticamente
- **Auditoria**: Logs de alterações (futuro)

### Índices Otimizados

- **Performance**: Índices para queries frequentes
- **Multi-tenancy**: Índices compostos com `unidade_id`
- **Busca**: Índices para campos de pesquisa
- **Relatórios**: Índices para agregações

## 🔧 Manutenção e Desenvolvimento

### Adicionando Nova Migração

1. **Criar arquivo** com numeração sequencial:

   ```
   005_nova_funcionalidade.sql
   ```

2. **Seguir padrão**:

   ```sql
   -- =================================================================
   -- MIGRAÇÃO 005: Descrição da Nova Funcionalidade
   -- Data: YYYY-MM-DD
   -- Descrição: Detalhes do que está sendo implementado
   -- =================================================================
   ```

3. **Atualizar função** `get_pending_migrations()` em `000_migration_control.sql`

4. **Testar em desenvolvimento** antes de produção

### Rollback de Migrações

⚠️ **Importante**: Este sistema não suporta rollback automático.

- Para reverter mudanças, criar nova migração com comandos inversos
- Sempre fazer backup antes de executar em produção
- Testar rollbacks em ambiente de desenvolvimento

### Backup e Recovery

```bash
# Backup completo
pg_dump -h seu-host -U seu-usuario -d sua-database > backup.sql

# Restore
psql -h seu-host -U seu-usuario -d sua-database < backup.sql
```

## 📝 Convenções

### Nomenclatura

- **Tabelas**: Plural, snake_case (`unidades`, `appointments_servicos`)
- **Colunas**: snake_case (`created_at`, `unidade_id`)
- **Índices**: Prefixo `idx_` (`idx_appointments_unidade_id`)
- **Constraints**: Descritivo (`appointments_fim_depois_inicio`)

### Padrões de Dados

- **IDs**: UUID v4 como chave primária
- **Timestamps**: `timestamp with time zone`
- **Moeda**: `decimal(10,2)` para valores monetários
- **Texto**: `varchar` com limite ou `text` para textos longos
- **JSON**: `jsonb` para configurações e metadados

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de permissão**:

   ```
   Verificar se SUPABASE_SERVICE_ROLE_KEY está configurada
   ```

2. **Migração travada**:

   ```sql
   -- Verificar status
   SELECT * FROM migrations WHERE success = false;

   -- Limpar tentativa falha
   DELETE FROM migrations WHERE version = 'XXX' AND success = false;
   ```

3. **RLS bloqueando queries**:
   ```sql
   -- Temporariamente desabilitar para debug
   ALTER TABLE tabela DISABLE ROW LEVEL SECURITY;
   ```

### Logs e Debug

```sql
-- Ver últimas migrações
SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 10;

-- Verificar integridade
SELECT * FROM check_migration_integrity();

-- Listar pendentes
SELECT * FROM get_pending_migrations();
```

---

**Última atualização**: 21/08/2025  
**Versão**: 1.0.0  
**Responsável**: Sistema de Migração Automatizado
