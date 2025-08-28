-- ================================================================================
-- ETAPA 2: RENOMEAR TABELAS
-- Execute após a Etapa 1
-- ================================================================================

BEGIN;

-- financeiro_mov -> financial_transactions
ALTER TABLE public.financeiro_mov RENAME TO financial_transactions;

-- notificacoes -> notifications
ALTER TABLE public.notificacoes RENAME TO notifications;

-- Remover assinaturas (subscriptions já existe)
DROP TABLE IF EXISTS public.assinaturas CASCADE;

COMMIT;

-- Validação Etapa 2
SELECT 'Etapa 2 concluída' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('financial_transactions', 'notifications');
