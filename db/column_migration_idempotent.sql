-- ================================================================================
-- MIGRAÇÃO DE COLUNAS PT → EN (IDEMPOTENTE / SEGURA)
-- Usa verificações antes de cada RENAME para evitar erros de "column does not exist"
-- Pode ser executada várias vezes sem falhar.
-- Data: 2025-08-27
-- ================================================================================

BEGIN;

-- Função helper temporária para renomear coluna somente se existir
DO $$
DECLARE
  v_table text;
  v_from  text;
  v_to    text;
BEGIN
  -- Tabela temporária em memória (não física) via loop manual de execuções abaixo
  -- (Não usamos tabela real para evitar dependências.)
END $$;

-- Macro em comentário para referência (não executa):
-- IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='<table>' AND column_name='<from>') THEN
--   EXECUTE 'ALTER TABLE public.<table> RENAME COLUMN <from> TO <to>';
-- END IF;

-- Helper inline pattern:
-- DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TABLE' AND column_name='OLD') THEN EXECUTE 'ALTER TABLE public.TABLE RENAME COLUMN OLD TO NEW'; END IF; END $$;

-- 4.1 units
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='units' AND column_name='nome') THEN EXECUTE 'ALTER TABLE public.units RENAME COLUMN nome TO name'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='units' AND column_name='cnpj') THEN EXECUTE 'ALTER TABLE public.units RENAME COLUMN cnpj TO tax_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='units' AND column_name='endereco') THEN EXECUTE 'ALTER TABLE public.units RENAME COLUMN endereco TO address'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='units' AND column_name='telefone') THEN EXECUTE 'ALTER TABLE public.units RENAME COLUMN telefone TO phone'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='units' AND column_name='ativo') THEN EXECUTE 'ALTER TABLE public.units RENAME COLUMN ativo TO active'; END IF; END $$;

-- 4.2 profiles
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='nome') THEN EXECUTE 'ALTER TABLE public.profiles RENAME COLUMN nome TO name'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='telefone') THEN EXECUTE 'ALTER TABLE public.profiles RENAME COLUMN telefone TO phone'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='unidade_default_id') THEN EXECUTE 'ALTER TABLE public.profiles RENAME COLUMN unidade_default_id TO unit_default_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ativo') THEN EXECUTE 'ALTER TABLE public.profiles RENAME COLUMN ativo TO active'; END IF; END $$;

-- 4.3 professionals
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professionals' AND column_name='nome') THEN EXECUTE 'ALTER TABLE public.professionals RENAME COLUMN nome TO name'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professionals' AND column_name='papel') THEN EXECUTE 'ALTER TABLE public.professionals RENAME COLUMN papel TO role'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professionals' AND column_name='comissao_regra') THEN EXECUTE 'ALTER TABLE public.professionals RENAME COLUMN comissao_regra TO commission_rule'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professionals' AND column_name='unidade_id') THEN EXECUTE 'ALTER TABLE public.professionals RENAME COLUMN unidade_id TO unit_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professionals' AND column_name='ativo') THEN EXECUTE 'ALTER TABLE public.professionals RENAME COLUMN ativo TO active'; END IF; END $$;

-- 4.4 customers
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='nome') THEN EXECUTE 'ALTER TABLE public.customers RENAME COLUMN nome TO name'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='telefone') THEN EXECUTE 'ALTER TABLE public.customers RENAME COLUMN telefone TO phone'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='preferencias') THEN EXECUTE 'ALTER TABLE public.customers RENAME COLUMN preferencias TO preferences'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='unidade_id') THEN EXECUTE 'ALTER TABLE public.customers RENAME COLUMN unidade_id TO unit_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='ativo') THEN EXECUTE 'ALTER TABLE public.customers RENAME COLUMN ativo TO active'; END IF; END $$;

-- 4.5 services
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='nome') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN nome TO name'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='categoria') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN categoria TO category'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='preco') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN preco TO price_cents'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='duracao_min') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN duracao_min TO duration_minutes'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='categoria_id') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN categoria_id TO category_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='unidade_id') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN unidade_id TO unit_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='ativo') THEN EXECUTE 'ALTER TABLE public.services RENAME COLUMN ativo TO active'; END IF; END $$;

-- 4.6 appointments
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='cliente_id') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN cliente_id TO customer_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='profissional_id') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN profissional_id TO professional_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='unidade_id') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN unidade_id TO unit_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='inicio') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN inicio TO start_time'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='fim') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN fim TO end_time'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='total') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN total TO total_cents'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='notas') THEN EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN notas TO notes'; END IF; END $$;

-- 4.7 queue
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='queue' AND column_name='posicao') THEN EXECUTE 'ALTER TABLE public.queue RENAME COLUMN posicao TO position'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='queue' AND column_name='estimativa_min') THEN EXECUTE 'ALTER TABLE public.queue RENAME COLUMN estimativa_min TO estimated_wait_minutes'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='queue' AND column_name='prioridade') THEN EXECUTE 'ALTER TABLE public.queue RENAME COLUMN prioridade TO priority'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='queue' AND column_name='unidade_id') THEN EXECUTE 'ALTER TABLE public.queue RENAME COLUMN unidade_id TO unit_id'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='queue' AND column_name='cliente_id') THEN EXECUTE 'ALTER TABLE public.queue RENAME COLUMN cliente_id TO customer_id'; END IF; END $$;

COMMIT;

-- Verificação: listar ainda colunas PT remanescentes
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND column_name IN ('nome','cnpj','endereco','telefone','ativo','papel','comissao_regra','unidade_id','unidade_default_id','preferencias','categoria','preco','duracao_min','categoria_id','cliente_id','profissional_id','inicio','fim','total','notas','posicao','estimativa_min','prioridade')
ORDER BY table_name, column_name;

-- Se zero linhas forem retornadas acima, migração de colunas concluída.

-- =============================================================================
-- FIM
-- =============================================================================
