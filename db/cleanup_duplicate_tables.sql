-- ================================================================================
-- SCRIPT DE LIMPEZA - REMOÇÃO DE TABELAS DUPLICADAS PT
-- Data: 2025-08-27
-- ATENÇÃO: Executar apenas após confirmar migração completa dos dados
-- ================================================================================

-- IMPORTANTE: 
-- 1. Confirmar que aplicação usa tabelas EN
-- 2. Confirmar que dados foram migrados PT → EN  
-- 3. Fazer backup antes da execução

BEGIN;

-- Verificar se tabelas EN existem e têm dados
DO $$
DECLARE
    units_count INTEGER;
    customers_count INTEGER; 
    professionals_count INTEGER;
    services_count INTEGER;
    queue_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO units_count FROM public.units;
    SELECT COUNT(*) INTO customers_count FROM public.customers;
    SELECT COUNT(*) INTO professionals_count FROM public.professionals;
    SELECT COUNT(*) INTO services_count FROM public.services;
    SELECT COUNT(*) INTO queue_count FROM public.queue;
    
    RAISE NOTICE 'CONTAGEM DE DADOS NAS TABELAS EM INGLÊS:';
    RAISE NOTICE 'units: % registros', units_count;
    RAISE NOTICE 'customers: % registros', customers_count;
    RAISE NOTICE 'professionals: % registros', professionals_count;
    RAISE NOTICE 'services: % registros', services_count;
    RAISE NOTICE 'queue: % registros', queue_count;
    
    IF units_count = 0 OR customers_count = 0 THEN
        RAISE EXCEPTION 'ATENÇÃO: Tabelas em inglês estão vazias! Não remover tabelas PT.';
    END IF;
END
$$;

-- Remover tabelas em português (apenas após confirmação)
-- DESCOMENTE APENAS APÓS VALIDAR MIGRAÇÃO COMPLETA

/*
DROP TABLE IF EXISTS public.fila CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.profissionais CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE; 
DROP TABLE IF EXISTS public.unidades CASCADE;

-- Remover outras tabelas PT se existirem
DROP TABLE IF EXISTS public.planos CASCADE;
DROP TABLE IF EXISTS public.assinaturas CASCADE;
DROP TABLE IF EXISTS public.pagamentos_assinaturas CASCADE;
DROP TABLE IF EXISTS public.notificacoes CASCADE;
DROP TABLE IF EXISTS public.financeiro_mov CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.vendas CASCADE;
DROP TABLE IF EXISTS public.vendas_itens CASCADE;

RAISE NOTICE 'Tabelas em português removidas com sucesso!';
*/

COMMIT;

-- ================================================================================
-- FIM DO SCRIPT DE LIMPEZA
-- ================================================================================