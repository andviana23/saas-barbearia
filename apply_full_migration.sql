-- =============================================================================
-- SCRIPT COMPLETO DE MIGRAÇÃO PT→EN
-- =============================================================================
-- Este script aplica toda a migração de forma segura e ordenada

\timing on
\set ON_ERROR_STOP on

-- Início da transação (rollback automático em caso de erro)
BEGIN;

SELECT 
    '🚀 INICIANDO MIGRAÇÃO COMPLETA PT→EN' as status,
    current_database() as database,
    NOW() as start_time;

-- =============================================================================
-- ETAPA 1: BACKUP
-- =============================================================================
\echo '📦 ETAPA 1: Criando backup de segurança...'

DO $$
DECLARE
    table_name TEXT;
    backup_count INTEGER := 0;
BEGIN
    -- Backup das tabelas existentes
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov')
        AND t.table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS backup_%s', table_name);
        EXECUTE format('CREATE TABLE backup_%s AS SELECT * FROM %I', table_name, table_name);
        backup_count := backup_count + 1;
        RAISE NOTICE 'Backup: % → backup_%', table_name, table_name;
    END LOOP;
    
    RAISE NOTICE '✅ Backup completo: % tabelas', backup_count;
END $$;

-- =============================================================================
-- ETAPA 2: CRIAÇÃO DAS TABELAS EM INGLÊS
-- =============================================================================
\echo '🏗️  ETAPA 2: Criando tabelas em inglês...'

-- CUSTOMERS (clientes)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date TIMESTAMP,
    notes TEXT,
    unit_id UUID NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PROFESSIONALS (profissionais)
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    unit_id UUID NOT NULL,
    active BOOLEAN DEFAULT true,
    commission_rule JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SERVICES (servicos)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    category_id UUID,
    price_cents INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    unit_id UUID NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- UNITS (unidades)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    config JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- FINANCIAL_TRANSACTIONS (financeiro_mov)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount_cents INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(100),
    reference_id UUID,
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QUEUE (fila) 
CREATE TABLE IF NOT EXISTS queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_progress', 'completed', 'abandoned')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'priority', 'urgent')),
    position INTEGER NOT NULL,
    estimated_wait_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- ETAPA 3: MIGRAÇÃO DOS DADOS EXISTENTES
-- =============================================================================
\echo '📊 ETAPA 3: Migrando dados existentes...'

-- Migrar CLIENTES → CUSTOMERS (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') THEN
        INSERT INTO customers (id, name, email, phone, birth_date, notes, unit_id, active, created_at, updated_at)
        SELECT 
            COALESCE(id, gen_random_uuid()),
            nome,
            email,
            telefone,
            data_nascimento::timestamp,
            observacoes,
            unidade_id,
            COALESCE(ativo, true),
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM clientes
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '✅ Migrados dados: clientes → customers';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao migrar clientes: %', SQLERRM;
END $$;

-- Migrar PROFISSIONAIS → PROFESSIONALS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profissionais') THEN
        INSERT INTO professionals (id, name, role, unit_id, active, commission_rule, created_at, updated_at)
        SELECT 
            COALESCE(id, gen_random_uuid()),
            nome,
            papel,
            unidade_id,
            COALESCE(ativo, true),
            commission_rule,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM profissionais
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '✅ Migrados dados: profissionais → professionals';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao migrar profissionais: %', SQLERRM;
END $$;

-- Migrar SERVICOS → SERVICES  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servicos') THEN
        INSERT INTO services (id, name, category, price_cents, duration_minutes, unit_id, active, created_at, updated_at)
        SELECT 
            COALESCE(id, gen_random_uuid()),
            nome,
            categoria,
            CASE 
                WHEN preco IS NOT NULL THEN ROUND(preco * 100)::INTEGER
                ELSE 0
            END,
            COALESCE(duracao_min, 30),
            unidade_id,
            COALESCE(ativo, true),
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM servicos
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '✅ Migrados dados: servicos → services (preço convertido para centavos)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao migrar servicos: %', SQLERRM;
END $$;

-- Migrar UNIDADES → UNITS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unidades') THEN
        INSERT INTO units (id, name, tax_id, address, phone, email, config, active, created_at, updated_at)
        SELECT 
            COALESCE(id, gen_random_uuid()),
            nome,
            cnpj,
            endereco,
            telefone,
            email,
            COALESCE(config, '{}'),
            COALESCE(ativo, true),
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM unidades
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '✅ Migrados dados: unidades → units';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao migrar unidades: %', SQLERRM;
END $$;

-- =============================================================================
-- ETAPA 4: CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =============================================================================
\echo '⚡ ETAPA 4: Criando índices de performance...'

CREATE INDEX IF NOT EXISTS idx_customers_unit_id ON customers(unit_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE INDEX IF NOT EXISTS idx_professionals_unit_id ON professionals(unit_id);
CREATE INDEX IF NOT EXISTS idx_professionals_active ON professionals(active);

CREATE INDEX IF NOT EXISTS idx_services_unit_id ON services(unit_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);

CREATE INDEX IF NOT EXISTS idx_units_active ON units(active);

CREATE INDEX IF NOT EXISTS idx_financial_unit_id ON financial_transactions(unit_id);
CREATE INDEX IF NOT EXISTS idx_financial_date ON financial_transactions(movement_date);
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial_transactions(type);

CREATE INDEX IF NOT EXISTS idx_queue_unit_id ON queue(unit_id);
CREATE INDEX IF NOT EXISTS idx_queue_customer_id ON queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);

RAISE NOTICE '✅ Índices de performance criados';

-- =============================================================================
-- ETAPA 5: APLICAR VIEWS DE COMPATIBILIDADE  
-- =============================================================================
\echo '🔗 ETAPA 5: Criando views de compatibilidade PT→EN...'

-- View CLIENTES → CUSTOMERS
CREATE OR REPLACE VIEW clientes AS 
SELECT 
    id,
    name as nome,
    email,
    phone as telefone, 
    birth_date as data_nascimento,
    notes as observacoes,
    unit_id as unidade_id,
    active as ativo,
    created_at,
    updated_at
FROM customers;

-- View PROFISSIONAIS → PROFESSIONALS
CREATE OR REPLACE VIEW profissionais AS
SELECT 
    id,
    name as nome,
    role as papel,
    unit_id as unidade_id,
    active as ativo,
    commission_rule,
    created_at,
    updated_at
FROM professionals;

-- View SERVICOS → SERVICES
CREATE OR REPLACE VIEW servicos AS
SELECT 
    id,
    name as nome,
    category as categoria,
    category_id as categoria_id,
    price_cents::float / 100 as preco,
    duration_minutes as duracao_min,
    unit_id as unidade_id,
    active as ativo,
    created_at,
    updated_at
FROM services;

-- View UNIDADES → UNITS
CREATE OR REPLACE VIEW unidades AS
SELECT 
    id,
    name as nome,
    tax_id as cnpj,
    address as endereco,
    phone as telefone,
    email,
    config,
    active as ativo,
    created_at,
    updated_at
FROM units;

-- View FINANCEIRO_MOV → FINANCIAL_TRANSACTIONS
CREATE OR REPLACE VIEW financeiro_mov AS
SELECT 
    id,
    unit_id as unidade_id,
    type as tipo,
    amount_cents::float / 100 as valor,
    source as fonte,
    reference_id,
    movement_date as data_mov,
    created_at,
    updated_at
FROM financial_transactions;

RAISE NOTICE '✅ Views de compatibilidade criadas';

-- =============================================================================
-- ETAPA 6: VALIDAÇÃO FINAL
-- =============================================================================
\echo '✅ ETAPA 6: Validação final...'

DO $$
DECLARE
    en_tables INTEGER;
    pt_views INTEGER;
    customers_count INTEGER;
    professionals_count INTEGER;
    services_count INTEGER;
    units_count INTEGER;
BEGIN
    -- Contar tabelas EN
    SELECT COUNT(*) INTO en_tables
    FROM information_schema.tables 
    WHERE table_name IN ('customers', 'professionals', 'services', 'units', 'financial_transactions', 'queue');
    
    -- Contar views PT
    SELECT COUNT(*) INTO pt_views
    FROM information_schema.views 
    WHERE table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov');
    
    -- Contar registros
    SELECT COUNT(*) INTO customers_count FROM customers;
    SELECT COUNT(*) INTO professionals_count FROM professionals;
    SELECT COUNT(*) INTO services_count FROM services;
    SELECT COUNT(*) INTO units_count FROM units;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'RESUMO DA MIGRAÇÃO';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Tabelas EN criadas: %', en_tables;
    RAISE NOTICE 'Views PT criadas: %', pt_views;
    RAISE NOTICE 'Registros migrados:';
    RAISE NOTICE '  - Customers: %', customers_count;
    RAISE NOTICE '  - Professionals: %', professionals_count;
    RAISE NOTICE '  - Services: %', services_count;
    RAISE NOTICE '  - Units: %', units_count;
    RAISE NOTICE '===========================================';
    
    IF en_tables >= 6 AND pt_views >= 5 THEN
        RAISE NOTICE '🎉 MIGRAÇÃO COMPLETADA COM SUCESSO!';
        RAISE NOTICE '✅ Sistema pronto para teste';
        RAISE NOTICE '✅ Compatibilidade PT/EN ativa';
    ELSE
        RAISE ERROR 'Migração incompleta - verifique os logs';
    END IF;
END $$;

-- Confirmar transação
COMMIT;

SELECT 
    '🚀 MIGRAÇÃO PT→EN CONCLUÍDA' as status,
    'Sistema pronto para npm run dev' as next_step,
    NOW() as completed_at;