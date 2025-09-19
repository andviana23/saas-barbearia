# Documentação do Banco de Dados - SaaS Barbearia

## Visão Geral

Este documento descreve a estrutura do banco de dados PostgreSQL para o sistema SaaS de gerenciamento de barbearias.

## Tabelas Principais

### 1. **units** - Unidades de Negócio
Armazena informações sobre cada barbearia/unidade do sistema.

**Colunas:**
- `id` (UUID) - Identificador único da unidade
- `name` (VARCHAR 255) - Nome da barbearia
- `address` (TEXT) - Endereço completo
- `phone` (VARCHAR 20) - Telefone de contato
- `email` (VARCHAR 255) - Email de contato
- `is_active` (BOOLEAN) - Status da unidade
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data da última atualização

**Relacionamentos:**
- Tem muitos: `services`, `customers`, `appointments`
- Tem muitos membros: `unit_members`

### 2. **services** - Serviços Oferecidos
Define os serviços que cada barbearia oferece.

**Colunas:**
- `id` (UUID) - Identificador único do serviço
- `unit_id` (UUID) - ID da unidade (FK para units)
- `name` (VARCHAR 255) - Nome do serviço
- `description` (TEXT) - Descrição detalhada
- `price` (NUMERIC 10,2) - Preço do serviço
- `duration` (INTEGER) - Duração em minutos
- `is_active` (BOOLEAN) - Status do serviço
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data da última atualização

**Relacionamentos:**
- Pertence a: `units`
- Tem muitos: `appointments`

### 3. **customers** - Clientes
Registra os clientes de cada barbearia.

**Colunas:**
- `id` (UUID) - Identificador único do cliente
- `unit_id` (UUID) - ID da unidade (FK para units)
- `name` (VARCHAR 255) - Nome completo
- `email` (VARCHAR 255) - Email do cliente
- `phone` (VARCHAR 20) - Telefone de contato
- `notes` (TEXT) - Observações sobre o cliente
- `is_active` (BOOLEAN) - Status do cliente
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data da última atualização

**Relacionamentos:**
- Pertence a: `units`
- Tem muitos: `appointments`

### 4. **appointments** - Agendamentos
Gerencia os agendamentos de serviços.

**Colunas:**
- `id` (UUID) - Identificador único do agendamento
- `unit_id` (UUID) - ID da unidade (FK para units)
- `customer_id` (UUID) - ID do cliente (FK para customers)
- `service_id` (UUID) - ID do serviço (FK para services)
- `start_time` (TIMESTAMP) - Início do agendamento
- `end_time` (TIMESTAMP) - Término do agendamento
- `status` (VARCHAR 50) - Status do agendamento
- `notes` (TEXT) - Observações do agendamento
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data da última atualização

**Relacionamentos:**
- Pertence a: `units`, `customers`, `services`

### 5. **unit_members** - Membros da Unidade
Define quais usuários têm acesso a cada unidade.

**Colunas:**
- `id` (UUID) - Identificador único da associação
- `unit_id` (UUID) - ID da unidade (FK para units)
- `user_id` (UUID) - ID do usuário
- `role` (VARCHAR 50) - Função do membro
- `is_active` (BOOLEAN) - Status do membro
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data da última atualização

**Relacionamentos:**
- Pertence a: `units`

## Segurança e RLS (Row Level Security)

### Políticas de Segurança

Todas as tabelas principais têm RLS habilitado com as seguintes políticas:

#### Para usuários autenticados (`authenticated`):
- **appointments**: Acesso apenas aos registros da unidade que o usuário pertence
- **services**: Acesso apenas aos serviços da unidade que o usuário pertence
- **customers**: Acesso apenas aos clientes da unidade que o usuário pertence
- **units**: Acesso apenas às unidades que o usuário é membro

#### Para service_role:
- Acesso completo a todas as tabelas (bypass RLS)

### Funções de Segurança

#### `user_has_unit_access_local(unit_uuid uuid)`
Função alternativa para ambiente local que verifica se o usuário atual tem acesso à unidade especificada.

#### `set_current_user_id(user_uuid uuid)`
Define o ID do usuário atual para uso com RLS local.

## Índices

Os seguintes índices foram criados para otimização:
- `idx_appointments_unit_id` em appointments.unit_id
- `idx_appointments_customer_id` em appointments.customer_id
- `idx_appointments_service_id` em appointments.service_id
- `idx_services_unit_id` em services.unit_id
- `idx_customers_unit_id` em customers.unit_id
- `idx_unit_members_unit_id` em unit_members.unit_id

## Triggers

### `update_updated_at_column()`
Trigger automático que atualiza a coluna `updated_at` em todas as tabelas quando o registro é modificado.

## Configuração para Ambiente Local

Para uso com PostgreSQL local (sem Supabase), foram criadas funções alternativas:

1. **Função RLS Local**: `user_has_unit_access_local()` substitui `user_has_unit_access()`
2. **Configuração de Usuário**: Use `set_current_user_id()` para definir o usuário atual

Exemplo de uso:
```sql
SELECT set_current_user_id('seu-user-id-aqui');
SELECT * FROM services; -- Agora respeitará RLS local
```

## Migrações

As migrações estão localizadas em `/supabase/migrations/` e devem ser executadas em ordem para manter a consistência do banco de dados.