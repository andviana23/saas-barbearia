# 🛠️ Guia de Migração Manual para Supabase

## 📋 Como Executar as Migrações

Como o Supabase não permite execução de DDL (CREATE TABLE, ALTER, etc.) através do cliente JavaScript por motivos de segurança, você deve executar as migrações manualmente através do **SQL Editor** do dashboard do Supabase.

## 🚀 Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse o dashboard do seu projeto Supabase
2. Navegue para **SQL Editor** no menu lateral
3. Clique em **New Query** para criar uma nova consulta

### 2. Executar as Migrações em Ordem

Execute os arquivos SQL **na ordem exata**, um por vez:

#### 📁 000_migration_control.sql

```sql
-- Cole TODO o conteúdo do arquivo 000_migration_control.sql aqui
-- Depois clique em "Run" ou use Ctrl+Enter
```

#### 📁 001_initial_setup.sql

```sql
-- Cole TODO o conteúdo do arquivo 001_initial_setup.sql aqui
-- Depois clique em "Run" ou use Ctrl+Enter
```

#### 📁 002_core_tables.sql

```sql
-- Cole TODO o conteúdo do arquivo 002_core_tables.sql aqui
-- Depois clique em "Run" ou use Ctrl+Enter
```

#### 📁 003_appointments_queue.sql

```sql
-- Cole TODO o conteúdo do arquivo 003_appointments_queue.sql aqui
-- Depois clique em "Run" ou use Ctrl+Enter
```

#### 📁 004_financial_rls.sql

```sql
-- Cole TODO o conteúdo do arquivo 004_financial_rls.sql aqui
-- Depois clique em "Run" ou use Ctrl+Enter
```

## ✅ Verificação de Sucesso

Após executar todas as migrações, execute esta query para verificar se tudo foi criado corretamente:

```sql
-- Verificar tabelas criadas
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'migrations', 'unidades', 'profiles', 'profissionais',
  'clientes', 'servicos', 'appointments', 'appointments_servicos',
  'fila', 'financeiro_mov'
)
ORDER BY tablename;

-- Verificar tipos enumerados
SELECT typname FROM pg_type WHERE typname IN (
  'user_role', 'appointment_status', 'queue_status',
  'queue_priority', 'movimento_tipo'
);

-- Verificar funções de segurança
SELECT proname FROM pg_proc WHERE proname IN (
  'current_user_id', 'current_unidade_id', 'has_unit_access', 'is_admin'
);

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('unidades', 'profiles', 'clientes', 'appointments');
```

## 🎯 Resultado Esperado

Após a execução bem-sucedida, você deve ver:

- ✅ 10 tabelas criadas
- ✅ 5 tipos enumerados criados
- ✅ 4+ funções de segurança criadas
- ✅ RLS ativo em todas as tabelas principais

## 🔧 Troubleshooting

### Erro de Permissão

Se receber erro de permissão, certifique-se de estar usando a **Service Role Key** (não a anon key).

### Erro de Sintaxe

Se algum comando der erro de sintaxe:

1. Verifique se copiou o SQL completo
2. Execute comando por comando se necessário
3. Pule comentários que começam com `--`

### Extensões Já Existem

Se receber erro sobre extensões já existirem (uuid-ossp, pgcrypto, citext), isso é normal - continue com os próximos comandos.

## 📱 Após Execução

Depois de executar todas as migrações no Supabase, execute este comando para verificar:

```bash
npm run db:status
```

Se ainda mostrar erros, é normal - o sistema de migração customizado precisa ser ajustado, mas suas tabelas já estarão criadas e funcionais.

---

**💡 Dica:** Mantenha esta ordem sempre. Não pule migrações, pois algumas dependem de estruturas criadas nas anteriores.
