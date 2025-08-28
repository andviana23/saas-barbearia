# 🔄 MAPEAMENTO DE RENOMEAÇÃO PT → EN - SISTEMA TRATO

**Versão:** v1.0.0  
**Data:** 27/08/2025  
**Status:** Planejamento concluído

> **⚠️ IMPORTANTE:** Este documento mapeia a migração completa de nomes em português para inglês conforme padrão canônico do sistema.

---

## 📋 ESTRATÉGIA DE MIGRAÇÃO

**Padrão Canônico Adotado:**

- **Idioma:** Inglês
- **Formato:** snake_case minúsculo
- **Datas:** created_at, updated_at, deleted_at, cancelled_at
- **IDs:** Sufixo `_id` sempre
- **Status:** Valores em inglês

---

## 🗃️ MAPEAMENTO COMPLETO DE TABELAS

### 1. **TABELAS CORE**

| **Português (Atual)** | **Inglês (Novo)** | **Justificativa**                     |
| --------------------- | ----------------- | ------------------------------------- |
| `unidades`            | `units`           | Padrão: unidades → units              |
| `profiles`            | `profiles`        | ✅ Já em inglês                       |
| `profissionais`       | `professionals`   | Padrão: profissionais → professionals |
| `clientes`            | `customers`       | Padrão: clientes → customers          |
| `servicos`            | `services`        | Padrão: serviços → services           |

### 2. **SISTEMA DE AGENDAMENTOS**

| **Português (Atual)**   | **Inglês (Novo)**      | **Justificativa**       |
| ----------------------- | ---------------------- | ----------------------- |
| `appointments`          | `appointments`         | ✅ Já em inglês         |
| `appointments_servicos` | `appointment_services` | Tabela de junção        |
| `fila`                  | `queue`                | Sistema de fila → queue |

### 3. **SISTEMA FINANCEIRO**

| **Português (Atual)** | **Inglês (Novo)**        | **Justificativa**         |
| --------------------- | ------------------------ | ------------------------- |
| `financeiro_mov`      | `financial_transactions` | Movimentação financeira   |
| `tipos_pagamento`     | `payment_types`          | Tipos de pagamento        |
| `transacoes`          | `transactions`           | Transações → transactions |
| `itens_transacao`     | `transaction_items`      | Itens de transação        |

### 4. **PRODUTOS E VENDAS**

| **Português (Atual)** | **Inglês (Novo)** | **Justificativa**   |
| --------------------- | ----------------- | ------------------- |
| `produtos`            | `products`        | Produtos → products |
| `vendas`              | `sales`           | Vendas → sales      |
| `vendas_itens`        | `sale_items`      | Itens de venda      |

### 5. **SISTEMA DE ASSINATURAS**

| **Português (Atual)**    | **Inglês (Novo)**       | **Justificativa**           |
| ------------------------ | ----------------------- | --------------------------- |
| `planos`                 | `subscription_plans`    | Mais descritivo             |
| `assinaturas`            | `subscriptions`         | Assinaturas → subscriptions |
| `pagamentos_assinaturas` | `subscription_payments` | Pagamentos de assinatura    |

### 6. **NOTIFICAÇÕES**

| **Português (Atual)**      | **Inglês (Novo)**          | **Justificativa**            |
| -------------------------- | -------------------------- | ---------------------------- |
| `notificacoes`             | `notifications`            | Notificações → notifications |
| `logs`                     | `logs`                     | ✅ Já em inglês              |
| `canais_notificacao`       | `notification_channels`    | Canais de notificação        |
| `templates_notificacao`    | `notification_templates`   | Templates de notificação     |
| `preferencias_notificacao` | `notification_preferences` | Preferências                 |
| `fila_notificacoes`        | `notification_queue`       | Fila de notificação          |
| `logs_notificacao`         | `notification_logs`        | Logs de notificação          |

### 7. **SISTEMA DE HORÁRIOS E CATEGORIAS**

| **Português (Atual)**          | **Inglês (Novo)**              | **Justificativa**        |
| ------------------------------ | ------------------------------ | ------------------------ |
| `profissional_horarios`        | `professional_schedules`       | Horários de profissional |
| `servicos_precos_profissional` | `service_professional_pricing` | Preços customizados      |
| `servicos_categorias`          | `service_categories`           | Categorias de serviço    |

### 8. **SISTEMA ASAAS**

| **Português (Atual)**  | **Inglês (Novo)**      | **Justificativa** |
| ---------------------- | ---------------------- | ----------------- |
| `asaas_webhook_events` | `asaas_webhook_events` | ✅ Já em inglês   |

---

## 🔧 MAPEAMENTO DE COLUNAS

### **Colunas Padrão (Aplicar em TODAS as tabelas)**

| **Português**     | **Inglês**        | **Comentário**             |
| ----------------- | ----------------- | -------------------------- |
| `unidade_id`      | `unit_id`         | FK para units              |
| `cliente_id`      | `customer_id`     | FK para customers          |
| `profissional_id` | `professional_id` | FK para professionals      |
| `servico_id`      | `service_id`      | FK para services           |
| `plano_id`        | `plan_id`         | FK para subscription_plans |
| `assinatura_id`   | `subscription_id` | FK para subscriptions      |
| `created_at`      | `created_at`      | ✅ Já em inglês            |
| `updated_at`      | `updated_at`      | ✅ Já em inglês            |
| `ativo`           | `active`          | Status ativo/inativo       |

### **Colunas Específicas por Tabela**

#### **`units` (unidades)**

| **Português** | **Inglês** | **Tipo**     |
| ------------- | ---------- | ------------ |
| `nome`        | `name`     | varchar(100) |
| `cnpj`        | `tax_id`   | varchar(14)  |
| `endereco`    | `address`  | text         |
| `telefone`    | `phone`    | varchar(11)  |
| `email`       | `email`    | citext       |
| `config`      | `config`   | jsonb        |
| `ativo`       | `active`   | boolean      |

#### **`customers` (clientes)**

| **Português**  | **Inglês**    | **Tipo**     |
| -------------- | ------------- | ------------ |
| `nome`         | `name`        | varchar(100) |
| `email`        | `email`       | citext       |
| `telefone`     | `phone`       | varchar(11)  |
| `preferencias` | `preferences` | jsonb        |

#### **`professionals` (profissionais)**

| **Português**    | **Inglês**        | **Tipo**     |
| ---------------- | ----------------- | ------------ |
| `nome`           | `name`            | varchar(100) |
| `papel`          | `role`            | varchar(50)  |
| `comissao_regra` | `commission_rule` | jsonb        |

#### **`services` (servicos)**

| **Português**  | **Inglês**         | **Tipo**     |
| -------------- | ------------------ | ------------ |
| `nome`         | `name`             | varchar(100) |
| `categoria`    | `category`         | varchar(50)  |
| `preco`        | `price_cents`      | integer      |
| `duracao_min`  | `duration_minutes` | integer      |
| `categoria_id` | `category_id`      | uuid         |

#### **`appointments`**

| **Português** | **Inglês**    | **Tipo**           |
| ------------- | ------------- | ------------------ |
| `inicio`      | `start_time`  | timestamptz        |
| `fim`         | `end_time`    | timestamptz        |
| `status`      | `status`      | appointment_status |
| `total`       | `total_cents` | integer            |
| `notas`       | `notes`       | text               |

#### **`appointment_services` (appointments_servicos)**

| **Português**      | **Inglês**                 | **Tipo** |
| ------------------ | -------------------------- | -------- |
| `preco_aplicado`   | `applied_price_cents`      | integer  |
| `duracao_aplicada` | `applied_duration_minutes` | integer  |

#### **`queue` (fila)**

| **Português**    | **Inglês**               | **Tipo**       |
| ---------------- | ------------------------ | -------------- |
| `posicao`        | `position`               | integer        |
| `estimativa_min` | `estimated_wait_minutes` | integer        |
| `status`         | `status`                 | queue_status   |
| `prioridade`     | `priority`               | queue_priority |

#### **`financial_transactions` (financeiro_mov)**

| **Português**   | **Inglês**         | **Tipo**         |
| --------------- | ------------------ | ---------------- |
| `tipo`          | `type`             | transaction_type |
| `valor`         | `amount_cents`     | integer          |
| `origem`        | `source`           | varchar(50)      |
| `referencia_id` | `reference_id`     | uuid             |
| `data_mov`      | `transaction_date` | date             |
| `descricao`     | `description`      | text             |

#### **`products` (produtos)**

| **Português** | **Inglês**       | **Tipo**     |
| ------------- | ---------------- | ------------ |
| `nome`        | `name`           | varchar(100) |
| `descricao`   | `description`    | text         |
| `preco`       | `price_cents`    | integer      |
| `estoque`     | `stock_quantity` | integer      |

#### **`sales` (vendas)**

| **Português** | **Inglês**           | **Tipo**    |
| ------------- | -------------------- | ----------- |
| `valor_total` | `total_amount_cents` | integer     |
| `status`      | `status`             | sale_status |

#### **`sale_items` (vendas_itens)**

| **Português**    | **Inglês**         | **Tipo** |
| ---------------- | ------------------ | -------- |
| `quantidade`     | `quantity`         | integer  |
| `preco_unitario` | `unit_price_cents` | integer  |
| `subtotal`       | `subtotal_cents`   | integer  |

#### **`subscription_plans` (planos)**

| **Português**   | **Inglês**        | **Tipo** |
| --------------- | ----------------- | -------- |
| `nome`          | `name`            | text     |
| `descricao`     | `description`     | text     |
| `preco`         | `price_cents`     | integer  |
| `duracao_meses` | `duration_months` | integer  |

#### **`subscriptions` (assinaturas)**

| **Português** | **Inglês**   | **Tipo**            |
| ------------- | ------------ | ------------------- |
| `inicio`      | `start_date` | date                |
| `fim`         | `end_date`   | date                |
| `status`      | `status`     | subscription_status |

#### **`subscription_payments` (pagamentos_assinaturas)**

| **Português**    | **Inglês**       | **Tipo**       |
| ---------------- | ---------------- | -------------- |
| `valor`          | `amount_cents`   | integer        |
| `metodo`         | `payment_method` | text           |
| `status`         | `status`         | payment_status |
| `data_pagamento` | `payment_date`   | timestamptz    |

#### **`notifications` (notificacoes)**

| **Português** | **Inglês** | **Tipo**     |
| ------------- | ---------- | ------------ |
| `titulo`      | `title`    | varchar(200) |
| `mensagem`    | `message`  | text         |
| `lida`        | `read`     | boolean      |
| `tipo`        | `type`     | varchar(50)  |

#### **`professional_schedules` (profissional_horarios)**

| **Português**      | **Inglês**         | **Tipo** |
| ------------------ | ------------------ | -------- |
| `dia_semana`       | `day_of_week`      | integer  |
| `hora_inicio`      | `start_time`       | time     |
| `hora_fim`         | `end_time`         | time     |
| `intervalo_inicio` | `break_start_time` | time     |
| `intervalo_fim`    | `break_end_time`   | time     |

---

## 🏷️ MAPEAMENTO DE TIPOS ENUM

### **`user_role`**

| **Português**    | **Inglês**       |
| ---------------- | ---------------- |
| `'admin'`        | `'admin'` ✅     |
| `'gestor'`       | `'manager'`      |
| `'profissional'` | `'professional'` |
| `'recepcao'`     | `'receptionist'` |

### **`appointment_status`**

| **Português**      | **Inglês**      |
| ------------------ | --------------- |
| `'criado'`         | `'created'`     |
| `'confirmado'`     | `'confirmed'`   |
| `'em_atendimento'` | `'in_progress'` |
| `'concluido'`      | `'completed'`   |
| `'cancelado'`      | `'cancelled'`   |
| `'faltou'`         | `'no_show'`     |

### **`queue_status`**

| **Português**      | **Inglês**      |
| ------------------ | --------------- |
| `'aguardando'`     | `'waiting'`     |
| `'chamado'`        | `'called'`      |
| `'em_atendimento'` | `'in_progress'` |
| `'concluido'`      | `'completed'`   |
| `'desistiu'`       | `'abandoned'`   |

### **`queue_priority`**

| **Português**   | **Inglês**    |
| --------------- | ------------- |
| `'normal'`      | `'normal'` ✅ |
| `'prioritaria'` | `'priority'`  |
| `'urgente'`     | `'urgent'`    |

### **`transaction_type` (movimento_tipo)**

| **Português** | **Inglês**  |
| ------------- | ----------- |
| `'entrada'`   | `'income'`  |
| `'saida'`     | `'expense'` |

---

## 🗂️ MAPEAMENTO DE ÍNDICES

### **Padrão de Renomeação de Índices**

- **Formato:** `idx_{table_name}_{column_name(s)}`
- **Únicos:** `unique_{table_name}_{column_name(s)}`

| **Índice Atual (PT)**          | **Índice Novo (EN)**                |
| ------------------------------ | ----------------------------------- |
| `idx_unidades_ativo`           | `idx_units_active`                  |
| `idx_unidades_nome`            | `idx_units_name`                    |
| `idx_clientes_nome`            | `idx_customers_name`                |
| `idx_clientes_telefone`        | `idx_customers_phone`               |
| `idx_profissionais_papel`      | `idx_professionals_role`            |
| `idx_profissionais_ativo`      | `idx_professionals_active`          |
| `idx_servicos_categoria`       | `idx_services_category`             |
| `idx_servicos_preco`           | `idx_services_price_cents`          |
| `idx_appointments_unique_slot` | `idx_appointments_unique_slot` ✅   |
| `idx_financeiro_mov_relatorio` | `idx_financial_transactions_report` |
| `idx_fila_posicao_unidade`     | `idx_queue_position_unit`           |
| `idx_assinaturas_status`       | `idx_subscriptions_status`          |

---

## 🔄 MAPEAMENTO DE TRIGGERS

| **Trigger Atual (PT)**            | **Trigger Novo (EN)**               |
| --------------------------------- | ----------------------------------- |
| `update_unidades_updated_at`      | `update_units_updated_at`           |
| `update_profiles_updated_at`      | `update_profiles_updated_at` ✅     |
| `update_profissionais_updated_at` | `update_professionals_updated_at`   |
| `update_clientes_updated_at`      | `update_customers_updated_at`       |
| `update_servicos_updated_at`      | `update_services_updated_at`        |
| `update_appointments_updated_at`  | `update_appointments_updated_at` ✅ |
| `update_fila_updated_at`          | `update_queue_updated_at`           |
| `update_assinaturas_updated_at`   | `update_subscriptions_updated_at`   |

---

## 📊 MAPEAMENTO DE VIEWS/RELATÓRIOS

| **View/Relatório Atual (PT)**  | **View/Relatório Novo (EN)**  |
| ------------------------------ | ----------------------------- |
| `relatorio_faturamento_diario` | `daily_revenue_report`        |
| `relatorio_top_profissionais`  | `top_professionals_report`    |
| `relatorio_assinaturas_ativas` | `active_subscriptions_report` |
| `view_transacoes_completas`    | `complete_transactions_view`  |
| `view_relatorio_notificacoes`  | `notifications_report_view`   |

---

## 🔐 MAPEAMENTO DE FUNÇÕES RLS

| **Função Atual (PT)**  | **Função Nova (EN)** | **Comentário**      |
| ---------------------- | -------------------- | ------------------- |
| `current_unidade_id()` | `current_unit_id()`  | Função de segurança |
| `has_unit_access()`    | `has_unit_access()`  | ✅ Já em inglês     |

---

## 📈 MAPEAMENTO DE CONSTRAINTS

### **Constraints UNIQUE**

| **Constraint Atual**              | **Constraint Novo**                   |
| --------------------------------- | ------------------------------------- |
| `unidades_cnpj_unique`            | `units_tax_id_unique`                 |
| `profiles_user_id_unique`         | `profiles_user_id_unique` ✅          |
| `servicos_categoria_nome_unidade` | `service_categories_name_unit_unique` |
| `profissional_servico_unique`     | `professional_service_unique`         |

### **Constraints CHECK**

| **Constraint Atual**        | **Constraint Novo**         |
| --------------------------- | --------------------------- |
| `unidades_nome_length`      | `units_name_length`         |
| `unidades_cnpj_length`      | `units_tax_id_length`       |
| `clientes_nome_length`      | `customers_name_length`     |
| `profissionais_nome_length` | `professionals_name_length` |
| `servicos_preco_positive`   | `services_price_positive`   |
| `fila_posicao_positive`     | `queue_position_positive`   |

---

## 🚨 PONTOS DE ATENÇÃO ESPECIAIS

### **1. Campos de Preço**

- **Mudança crítica:** `preco` (decimal) → `price_cents` (integer)
- **Conversão:** multiplicar por 100
- **Exemplo:** R$ 25,50 → 2550 cents

### **2. Campos de Data**

- `data_criacao` → `created_at` (já migrado)
- `data_pagamento` → `payment_date`
- `data_mov` → `transaction_date`

### **3. Status e Estados**

- Todos os ENUMs precisam ser recriados com valores em inglês
- Atualizar dados existentes conforme mapeamento

### **4. Relacionamentos**

- Todas as FKs precisam ser atualizadas
- Views e funções que referenciam tabelas antigas

### **5. Aplicação (Frontend/Backend)**

- Atualizar todos os queries SQL
- Atualizar schemas Zod
- Atualizar tipos TypeScript
- Atualizar hooks React Query

---

## 📋 SEQUÊNCIA DE EXECUÇÃO RECOMENDADA

### **Ordem de Migração (Dependencies First)**

1. **Tipos ENUM** (base para tudo)
2. **Funções de segurança** (RLS)
3. **Tabelas base** (units, profiles)
4. **Tabelas dependentes nível 1** (customers, professionals, services)
5. **Tabelas dependentes nível 2** (appointments, queue, subscriptions)
6. **Tabelas de relacionamento N:N** (appointment_services, etc.)
7. **Índices e constraints**
8. **Views e relatórios**
9. **Triggers**
10. **Dados e aplicação**

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Banco de Dados**

- [ ] Todas as tabelas renomeadas
- [ ] Todas as colunas renomeadas
- [ ] Todos os índices renomeados
- [ ] Todos os triggers renomeados
- [ ] Todas as constraints renomeadas
- [ ] Todos os ENUMs atualizados
- [ ] Todas as views atualizadas
- [ ] Todas as funções atualizadas
- [ ] RLS policies funcionando

### **Aplicação**

- [ ] Schemas Zod atualizados
- [ ] Tipos TypeScript atualizados
- [ ] Server Actions atualizadas
- [ ] Hooks React Query atualizados
- [ ] Queries SQL atualizadas
- [ ] Formulários funcionando
- [ ] Relatórios funcionando

### **Testes**

- [ ] Build sem erros
- [ ] Testes unitários passando
- [ ] Testes E2E passando
- [ ] Fluxos críticos validados

---

**📋 Este documento serve como guia completo para a migração PT → EN do sistema. Deve ser seguido rigorosamente para manter a consistência e integridade dos dados.**

**Responsável:** Equipe de Desenvolvimento Trato  
**Próxima Atualização:** Conforme progresso da migração
