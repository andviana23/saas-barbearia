-- =============================================================================
-- SCRIPT DE MONITORAMENTO CONTÍNUO DURANTE MIGRAÇÃO
-- =============================================================================
-- Execute este script periodicamente durante as primeiras 24-48h pós-deploy

\timing on
\pset pager off

SELECT 
    '🔍 MIGRATION MONITORING DASHBOARD' as title,
    NOW() as timestamp;

-- =============================================================================
-- 1. HEALTH CHECK GERAL
-- =============================================================================

SELECT 
    'SYSTEM HEALTH' as category,
    CASE 
        WHEN active_connections < 100 THEN '✅ CONNECTION POOL OK'
        ELSE '⚠️  HIGH CONNECTIONS: ' || active_connections 
    END as status,
    active_connections as value
FROM (
    SELECT COUNT(*) as active_connections 
    FROM pg_stat_activity 
    WHERE state = 'active'
) stats;

-- =============================================================================
-- 2. QUERY PERFORMANCE CHECK
-- =============================================================================

SELECT 
    'QUERY PERFORMANCE' as category,
    query_type,
    avg_duration_ms,
    call_count,
    CASE 
        WHEN avg_duration_ms < 500 THEN '✅ FAST'
        WHEN avg_duration_ms < 2000 THEN '⚠️  SLOW' 
        ELSE '❌ CRITICAL'
    END as performance_status
FROM (
    SELECT 
        CASE 
            WHEN query LIKE '%clientes%' OR query LIKE '%customers%' THEN 'CUSTOMERS'
            WHEN query LIKE '%profissionais%' OR query LIKE '%professionals%' THEN 'PROFESSIONALS'
            WHEN query LIKE '%servicos%' OR query LIKE '%services%' THEN 'SERVICES'
            WHEN query LIKE '%unidades%' OR query LIKE '%units%' THEN 'UNITS'
            ELSE 'OTHER'
        END as query_type,
        ROUND(mean_exec_time::numeric, 2) as avg_duration_ms,
        calls as call_count
    FROM pg_stat_statements 
    WHERE query NOT LIKE '%pg_stat%'
    AND calls > 5
    ORDER BY mean_exec_time DESC
    LIMIT 10
) perf;

-- =============================================================================  
-- 3. ERROR MONITORING
-- =============================================================================

-- Check for recent errors in logs (if log_statement is enabled)
SELECT 
    'ERROR CHECK' as category,
    COUNT(*) as error_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO ERRORS'
        WHEN COUNT(*) < 10 THEN '⚠️  FEW ERRORS'
        ELSE '❌ MANY ERRORS' 
    END as status
FROM pg_stat_database 
WHERE datname = current_database()
AND xact_rollback > 0;

-- =============================================================================
-- 4. VIEW USAGE MONITORING  
-- =============================================================================

SELECT 
    'VIEW USAGE' as category,
    schemaname,
    viewname as view_name,
    COALESCE(n_tup_ins, 0) as inserts,
    COALESCE(n_tup_upd, 0) as updates,
    COALESCE(n_tup_del, 0) as deletes,
    CASE 
        WHEN viewname IN ('clientes', 'profissionais', 'servicos', 'unidades') THEN 'PT-COMPAT'
        ELSE 'OTHER'
    END as view_type
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND relname IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov', 'fila')
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;

-- =============================================================================
-- 5. TABLE SIZE MONITORING
-- =============================================================================

SELECT 
    'STORAGE SIZE' as category,
    table_name,
    ROUND(size_mb::numeric, 2) as size_mb,
    CASE 
        WHEN size_mb > 1000 THEN '⚠️  LARGE TABLE'
        ELSE '✅ NORMAL SIZE'
    END as size_status
FROM (
    SELECT 
        t.table_name,
        pg_total_relation_size(quote_ident(t.table_name)::regclass) / 1024 / 1024 as size_mb
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_name IN ('customers', 'professionals', 'services', 'units', 'financial_transactions', 'queue')
    ORDER BY size_mb DESC
) sizes;

-- =============================================================================
-- 6. CONCURRENT CONNECTIONS BY TABLE
-- =============================================================================

SELECT 
    'ACTIVE QUERIES' as category,
    CASE 
        WHEN query LIKE '%customers%' OR query LIKE '%clientes%' THEN 'CUSTOMERS'  
        WHEN query LIKE '%professionals%' OR query LIKE '%profissionais%' THEN 'PROFESSIONALS'
        WHEN query LIKE '%services%' OR query LIKE '%servicos%' THEN 'SERVICES'
        WHEN query LIKE '%units%' OR query LIKE '%unidades%' THEN 'UNITS'
        ELSE 'OTHER'
    END as table_group,
    COUNT(*) as active_queries,
    CASE 
        WHEN COUNT(*) > 20 THEN '⚠️  HIGH ACTIVITY'
        ELSE '✅ NORMAL'
    END as activity_level
FROM pg_stat_activity 
WHERE state = 'active' 
AND query NOT LIKE '%pg_stat%'
AND query NOT LIKE '%MONITORING%'
GROUP BY table_group
ORDER BY active_queries DESC;

-- =============================================================================
-- 7. MIGRATION PROGRESS INDICATOR
-- =============================================================================

DO $$
DECLARE
    pt_usage INTEGER;
    en_usage INTEGER;
    migration_pct NUMERIC;
BEGIN
    -- Count PT view usage vs EN table usage (simplified)
    SELECT COALESCE(SUM(seq_scan + idx_scan), 0) INTO pt_usage
    FROM pg_stat_user_tables 
    WHERE relname IN ('clientes', 'profissionais', 'servicos', 'unidades');
    
    SELECT COALESCE(SUM(seq_scan + idx_scan), 0) INTO en_usage  
    FROM pg_stat_user_tables
    WHERE relname IN ('customers', 'professionals', 'services', 'units');
    
    IF (pt_usage + en_usage) > 0 THEN
        migration_pct := ROUND((en_usage::numeric / (pt_usage + en_usage)) * 100, 1);
    ELSE
        migration_pct := 0;
    END IF;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'MIGRATION PROGRESS ESTIMATE';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'PT Views Usage: % queries', pt_usage;
    RAISE NOTICE 'EN Tables Usage: % queries', en_usage; 
    RAISE NOTICE 'Migration Progress: %%% (estimated)', migration_pct;
    
    IF migration_pct > 90 THEN
        RAISE NOTICE '🎉 ALMOST COMPLETE: Ready to remove PT views soon!';
    ELSIF migration_pct > 50 THEN
        RAISE NOTICE '⚡ GOOD PROGRESS: Migration is going well';
    ELSIF migration_pct > 10 THEN
        RAISE NOTICE '🔄 IN PROGRESS: Migration started';
    ELSE
        RAISE NOTICE '🚀 STARTING: Most queries still using PT views';
    END IF;
    RAISE NOTICE '===========================================';
END $$;

-- =============================================================================
-- 8. RECOMMENDATIONS
-- =============================================================================

SELECT 
    '📋 RECOMMENDATIONS' as category,
    'Run this script every 2-4 hours during first 24h' as action_1,
    'Monitor for ERROR CHECK showing ❌ status' as action_2,
    'Watch QUERY PERFORMANCE for slowdowns' as action_3,
    'Remove PT views when Migration Progress > 95%' as action_4;

SELECT '✅ Monitoring complete - ' || NOW() as finish_message;