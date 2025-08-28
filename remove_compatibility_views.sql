-- =============================================================================
-- SCRIPT DE REMOÇÃO DAS VIEWS DE COMPATIBILIDADE PT→EN
-- =============================================================================
-- Execute este script APENAS depois que todo o código PT foi migrado para EN
-- Este é o passo final da migração zero-downtime

DO $$
BEGIN
    RAISE NOTICE 'Starting removal of PT→EN compatibility views';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE 'WARNING: This will break any remaining PT code!';
END $$;

-- Remove views and rules in reverse order
DROP VIEW IF EXISTS financeiro_mov CASCADE;
DROP VIEW IF EXISTS fila CASCADE;
DROP VIEW IF EXISTS unidades CASCADE;
DROP VIEW IF EXISTS servicos CASCADE;
DROP VIEW IF EXISTS profissionais CASCADE;
DROP VIEW IF EXISTS clientes CASCADE;

-- Verify removal
DO $$
DECLARE
    remaining_views INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_views 
    FROM information_schema.views 
    WHERE table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov', 'fila');
    
    IF remaining_views = 0 THEN
        RAISE NOTICE 'SUCCESS: All compatibility views removed';
        RAISE NOTICE 'PT→EN migration completed successfully!';
        RAISE NOTICE 'Database is now 100%% English-only';
    ELSE
        RAISE WARNING 'Some views still exist: %', remaining_views;
    END IF;
END $$;