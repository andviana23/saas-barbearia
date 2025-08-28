-- ================================================================================
-- MIGRAÇÃO DE COLUNAS PT → EN (SOMENTE ETAPA 4)
-- Execute este script no SQL Editor do Supabase
-- Data: 2025-08-27
-- ================================================================================

BEGIN;

-- 4.1 Tabela units (ex-unidades) 
ALTER TABLE public.units RENAME COLUMN nome TO name;
ALTER TABLE public.units RENAME COLUMN cnpj TO tax_id;
ALTER TABLE public.units RENAME COLUMN endereco TO address;
ALTER TABLE public.units RENAME COLUMN telefone TO phone;
ALTER TABLE public.units RENAME COLUMN ativo TO active;

-- 4.2 Tabela profiles
ALTER TABLE public.profiles RENAME COLUMN nome TO name;
ALTER TABLE public.profiles RENAME COLUMN telefone TO phone;
ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id;
ALTER TABLE public.profiles RENAME COLUMN ativo TO active;

-- 4.3 Tabela professionals (ex-profissionais)
ALTER TABLE public.professionals RENAME COLUMN nome TO name;
ALTER TABLE public.professionals RENAME COLUMN papel TO role;
ALTER TABLE public.professionals RENAME COLUMN comissao_regra TO commission_rule;
ALTER TABLE public.professionals RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.professionals RENAME COLUMN ativo TO active;

-- 4.4 Tabela customers (ex-clientes)
ALTER TABLE public.customers RENAME COLUMN nome TO name;
ALTER TABLE public.customers RENAME COLUMN telefone TO phone;
ALTER TABLE public.customers RENAME COLUMN preferencias TO preferences;
ALTER TABLE public.customers RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.customers RENAME COLUMN ativo TO active;

-- 4.5 Tabela services (ex-servicos)
ALTER TABLE public.services RENAME COLUMN nome TO name;
ALTER TABLE public.services RENAME COLUMN categoria TO category;
ALTER TABLE public.services RENAME COLUMN preco TO price_cents;
ALTER TABLE public.services RENAME COLUMN duracao_min TO duration_minutes;
ALTER TABLE public.services RENAME COLUMN categoria_id TO category_id;
ALTER TABLE public.services RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.services RENAME COLUMN ativo TO active;

-- 4.6 Tabela appointments
ALTER TABLE public.appointments RENAME COLUMN cliente_id TO customer_id;
ALTER TABLE public.appointments RENAME COLUMN profissional_id TO professional_id;
ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.appointments RENAME COLUMN inicio TO start_time;
ALTER TABLE public.appointments RENAME COLUMN fim TO end_time;
ALTER TABLE public.appointments RENAME COLUMN total TO total_cents;
ALTER TABLE public.appointments RENAME COLUMN notas TO notes;

-- 4.7 Tabela queue (ex-fila)
ALTER TABLE public.queue RENAME COLUMN posicao TO position;
ALTER TABLE public.queue RENAME COLUMN estimativa_min TO estimated_wait_minutes;
ALTER TABLE public.queue RENAME COLUMN prioridade TO priority;
ALTER TABLE public.queue RENAME COLUMN unidade_id TO unit_id;
ALTER TABLE public.queue RENAME COLUMN cliente_id TO customer_id;

COMMIT;

-- Verificação final
SELECT 'Migração de colunas concluída com sucesso!' as status;

-- ================================================================================
-- FIM DA MIGRAÇÃO DE COLUNAS
-- ================================================================================