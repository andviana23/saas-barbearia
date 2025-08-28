-- =============================================================================
-- SCRIPT DE VALIDAÇÃO DAS VIEWS DE COMPATIBILIDADE 
-- =============================================================================
-- Execute este script para validar se as views estão funcionando corretamente

\timing on

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'VALIDAÇÃO DAS VIEWS DE COMPATIBILIDADE';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE '===========================================';
END $$;

-- =============================================================================
-- 1. VERIFICAR SE VIEWS EXISTEM
-- =============================================================================

SELECT 
    'VIEWS COMPATIBILITY CHECK' as test_name,
    COUNT(*) as views_created,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM information_schema.views 
WHERE table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov', 'fila');

-- =============================================================================
-- 2. TESTAR COMPATIBILIDADE DE LEITURA
-- =============================================================================

-- Test if PT views work (should not error)
DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM clientes LIMIT 1;
        PERFORM COUNT(*) FROM profissionais LIMIT 1; 
        PERFORM COUNT(*) FROM servicos LIMIT 1;
        PERFORM COUNT(*) FROM unidades LIMIT 1;
        test_result := '✅ PASS';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ FAIL: ' || SQLERRM;
    END;
    
    RAISE NOTICE 'PT VIEWS READ TEST: %', test_result;
END $$;

-- Test if EN tables work (should not error) 
DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM customers LIMIT 1;
        PERFORM COUNT(*) FROM professionals LIMIT 1;
        PERFORM COUNT(*) FROM services LIMIT 1;
        PERFORM COUNT(*) FROM units LIMIT 1;
        test_result := '✅ PASS';
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ FAIL: ' || SQLERRM;
    END;
    
    RAISE NOTICE 'EN TABLES READ TEST: %', test_result;
END $$;

-- =============================================================================
-- 3. TESTAR CONSISTÊNCIA DE DADOS
-- =============================================================================

-- Check if data is consistent between PT views and EN tables
SELECT 
    'DATA CONSISTENCY CHECK' as test_name,
    pt_count,
    en_count,
    CASE 
        WHEN pt_count = en_count THEN '✅ CONSISTENT' 
        ELSE '❌ INCONSISTENT' 
    END as status
FROM (
    SELECT 
        COALESCE((SELECT COUNT(*) FROM clientes), 0) as pt_count,
        COALESCE((SELECT COUNT(*) FROM customers), 0) as en_count
) counts;

-- =============================================================================
-- 4. TESTAR INSERÇÃO VIA VIEWS
-- =============================================================================

-- Test insert through PT view (should work with compatibility rules)
DO $$
DECLARE
    test_id UUID;
    test_result TEXT;
BEGIN
    -- Generate test ID
    test_id := gen_random_uuid();
    
    BEGIN
        -- Insert via PT view
        INSERT INTO clientes (id, nome, telefone, unidade_id, ativo) 
        VALUES (test_id, 'Test Customer PT', '11999999999', 
                (SELECT id FROM units LIMIT 1), true);
        
        -- Check if it appears in EN table
        IF EXISTS (SELECT 1 FROM customers WHERE id = test_id) THEN
            test_result := '✅ INSERT PASS';
        ELSE
            test_result := '❌ INSERT FAIL: Not found in EN table';
        END IF;
        
        -- Cleanup
        DELETE FROM customers WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        test_result := '❌ INSERT FAIL: ' || SQLERRM;
    END;
    
    RAISE NOTICE 'PT VIEW INSERT TEST: %', test_result;
END $$;

-- =============================================================================
-- 5. TESTAR PERFORMANCE DAS VIEWS  
-- =============================================================================

EXPLAIN (ANALYZE, BUFFERS) 
SELECT c.nome, p.nome as profissional_nome 
FROM clientes c
JOIN profissionais p ON p.unidade_id = c.unidade_id  
LIMIT 10;

-- =============================================================================
-- 6. VALIDAR INDEXES
-- =============================================================================

SELECT 
    'INDEX CHECK' as test_name,
    COUNT(*) as indexes_found,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ INDEXES OK'
        ELSE '⚠️  MISSING INDEXES' 
    END as status
FROM pg_indexes 
WHERE indexname IN (
    'idx_customers_unit_id',
    'idx_professionals_unit_id', 
    'idx_services_unit_id',
    'idx_financial_transactions_unit_id'
);

-- =============================================================================
-- 7. SUMMARY REPORT
-- =============================================================================

DO $$
DECLARE
    views_count INTEGER;
    tables_count INTEGER;
    indexes_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO views_count FROM information_schema.views 
    WHERE table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov', 'fila');
    
    SELECT COUNT(*) INTO tables_count FROM information_schema.tables 
    WHERE table_name IN ('customers', 'professionals', 'services', 'units', 'financial_transactions', 'queue');
    
    SELECT COUNT(*) INTO indexes_count FROM pg_indexes 
    WHERE indexname LIKE 'idx_%_unit_id';
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'VALIDATION SUMMARY REPORT';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Compatibility Views: % created', views_count;
    RAISE NOTICE 'English Tables: % exist', tables_count;
    RAISE NOTICE 'Performance Indexes: % created', indexes_count;
    RAISE NOTICE '';
    
    IF views_count >= 6 AND tables_count >= 6 AND indexes_count >= 4 THEN
        RAISE NOTICE '🎉 SUCCESS: Zero-downtime setup is READY!';
        RAISE NOTICE '✅ You can now deploy with confidence';
        RAISE NOTICE '✅ Both PT and EN code will work simultaneously';
    ELSE
        RAISE NOTICE '❌ SETUP INCOMPLETE:';
        IF views_count < 6 THEN
            RAISE NOTICE '  - Missing compatibility views';
        END IF;
        IF tables_count < 6 THEN
            RAISE NOTICE '  - Missing English tables';
        END IF;
        IF indexes_count < 4 THEN
            RAISE NOTICE '  - Missing performance indexes';
        END IF;
    END IF;
    
    RAISE NOTICE '===========================================';
END $$;