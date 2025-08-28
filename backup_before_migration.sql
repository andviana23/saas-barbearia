-- =============================================================================
-- BACKUP ANTES DA MIGRAÇÃO PT→EN
-- =============================================================================
-- Este script cria um backup completo antes de aplicar as mudanças

\timing on

-- Mostrar informações do backup
SELECT 
    'BACKUP INICIADO' as status,
    current_database() as database_name,
    current_user as user_name,
    NOW() as backup_timestamp;

-- Backup das tabelas principais (se existirem)
DO $$
DECLARE
    table_name TEXT;
    backup_count INTEGER := 0;
BEGIN
    -- Lista de tabelas para backup
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov', 'planos', 'assinaturas')
        AND t.table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('CREATE TABLE backup_%s AS SELECT * FROM %I', table_name, table_name);
        backup_count := backup_count + 1;
        RAISE NOTICE 'Backup criado: backup_%', table_name;
    END LOOP;
    
    IF backup_count > 0 THEN
        RAISE NOTICE '✅ BACKUP COMPLETO: % tabelas salvas com prefixo "backup_"', backup_count;
    ELSE
        RAISE NOTICE '⚠️  Nenhuma tabela PT encontrada para backup - sistema pode já estar migrado';
    END IF;
END $$;

-- Verificar se as tabelas EN já existem
SELECT 
    'VERIFICAÇÃO TABELAS EN' as check_type,
    COUNT(*) as english_tables_exist,
    CASE 
        WHEN COUNT(*) >= 4 THEN 'Tabelas EN já existem - migração já aplicada'
        ELSE 'Tabelas EN não existem - migração necessária'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'professionals', 'services', 'units');

SELECT '✅ BACKUP CONCLUÍDO' as final_status, NOW() as timestamp;