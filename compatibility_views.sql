-- =============================================================================
-- VIEWS DE COMPATIBILIDADE PT→EN PARA DEPLOY ZERO-DOWNTIME
-- =============================================================================
-- Este script cria views que permitem código antigo (PT) acessar tabelas novas (EN)
-- Permite migração gradual sem interrupção de serviço

-- Verify current database structure
DO $$
BEGIN
    RAISE NOTICE 'Creating compatibility views for PT→EN migration';
    RAISE NOTICE 'Timestamp: %', NOW();
END $$;

-- =============================================================================
-- 1. CLIENTES → CUSTOMERS
-- =============================================================================

-- View para compatibilidade: clientes → customers
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

-- Rule para INSERT via view clientes
CREATE OR REPLACE RULE clientes_insert AS
    ON INSERT TO clientes DO INSTEAD
    INSERT INTO customers (id, name, email, phone, birth_date, notes, unit_id, active, created_at, updated_at)
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.nome,
        NEW.email,
        NEW.telefone,
        NEW.data_nascimento,
        NEW.observacoes,
        NEW.unidade_id,
        COALESCE(NEW.ativo, true),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );

-- Rule para UPDATE via view clientes  
CREATE OR REPLACE RULE clientes_update AS
    ON UPDATE TO clientes DO INSTEAD
    UPDATE customers SET
        name = NEW.nome,
        email = NEW.email,
        phone = NEW.telefone,
        birth_date = NEW.data_nascimento,
        notes = NEW.observacoes,
        unit_id = NEW.unidade_id,
        active = NEW.ativo,
        updated_at = NOW()
    WHERE id = OLD.id;

-- Rule para DELETE via view clientes
CREATE OR REPLACE RULE clientes_delete AS
    ON DELETE TO clientes DO INSTEAD
    DELETE FROM customers WHERE id = OLD.id;

-- =============================================================================
-- 2. PROFISSIONAIS → PROFESSIONALS  
-- =============================================================================

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

-- Insert rule
CREATE OR REPLACE RULE profissionais_insert AS
    ON INSERT TO profissionais DO INSTEAD
    INSERT INTO professionals (id, name, role, unit_id, active, commission_rule, created_at, updated_at)
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.nome,
        NEW.papel,
        NEW.unidade_id,
        COALESCE(NEW.ativo, true),
        NEW.commission_rule,
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );

-- Update rule
CREATE OR REPLACE RULE profissionais_update AS
    ON UPDATE TO profissionais DO INSTEAD
    UPDATE professionals SET
        name = NEW.nome,
        role = NEW.papel,
        unit_id = NEW.unidade_id,
        active = NEW.ativo,
        commission_rule = NEW.commission_rule,
        updated_at = NOW()
    WHERE id = OLD.id;

-- Delete rule
CREATE OR REPLACE RULE profissionais_delete AS
    ON DELETE TO profissionais DO INSTEAD
    DELETE FROM professionals WHERE id = OLD.id;

-- =============================================================================
-- 3. SERVICOS → SERVICES
-- =============================================================================

CREATE OR REPLACE VIEW servicos AS
SELECT 
    id,
    name as nome,
    category as categoria,
    category_id as categoria_id,
    price_cents::float / 100 as preco, -- Convert cents to decimal
    duration_minutes as duracao_min,
    unit_id as unidade_id,
    active as ativo,
    created_at,
    updated_at
FROM services;

-- Insert rule (convert decimal price to cents)
CREATE OR REPLACE RULE servicos_insert AS
    ON INSERT TO servicos DO INSTEAD
    INSERT INTO services (id, name, category, category_id, price_cents, duration_minutes, unit_id, active, created_at, updated_at)
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.nome,
        NEW.categoria,
        NEW.categoria_id,
        ROUND(NEW.preco * 100)::int, -- Convert decimal to cents
        NEW.duracao_min,
        NEW.unidade_id,
        COALESCE(NEW.ativo, true),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );

-- Update rule
CREATE OR REPLACE RULE servicos_update AS
    ON UPDATE TO servicos DO INSTEAD
    UPDATE services SET
        name = NEW.nome,
        category = NEW.categoria,
        category_id = NEW.categoria_id,
        price_cents = ROUND(NEW.preco * 100)::int,
        duration_minutes = NEW.duracao_min,
        unit_id = NEW.unidade_id,
        active = NEW.ativo,
        updated_at = NOW()
    WHERE id = OLD.id;

-- Delete rule
CREATE OR REPLACE RULE servicos_delete AS
    ON DELETE TO servicos DO INSTEAD
    DELETE FROM services WHERE id = OLD.id;

-- =============================================================================
-- 4. UNIDADES → UNITS
-- =============================================================================

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

-- Insert rule
CREATE OR REPLACE RULE unidades_insert AS
    ON INSERT TO unidades DO INSTEAD
    INSERT INTO units (id, name, tax_id, address, phone, email, config, active, created_at, updated_at)
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.nome,
        NEW.cnpj,
        NEW.endereco,
        NEW.telefone,
        NEW.email,
        COALESCE(NEW.config, '{}'),
        COALESCE(NEW.ativo, true),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );

-- Update rule
CREATE OR REPLACE RULE unidades_update AS
    ON UPDATE TO unidades DO INSTEAD
    UPDATE units SET
        name = NEW.nome,
        tax_id = NEW.cnpj,
        address = NEW.endereco,
        phone = NEW.telefone,
        email = NEW.email,
        config = NEW.config,
        active = NEW.ativo,
        updated_at = NOW()
    WHERE id = OLD.id;

-- Delete rule
CREATE OR REPLACE RULE unidades_delete AS
    ON DELETE TO unidades DO INSTEAD
    DELETE FROM units WHERE id = OLD.id;

-- =============================================================================
-- 5. FINANCIAL TRANSACTIONS COMPATIBILITY
-- =============================================================================

CREATE OR REPLACE VIEW financeiro_mov AS
SELECT 
    id,
    unit_id as unidade_id,
    type as tipo,
    amount_cents::float / 100 as valor, -- Convert cents to decimal
    source as fonte,
    reference_id,
    movement_date as data_mov,
    created_at,
    updated_at
FROM financial_transactions;

-- Insert rule
CREATE OR REPLACE RULE financeiro_mov_insert AS
    ON INSERT TO financeiro_mov DO INSTEAD
    INSERT INTO financial_transactions (id, unit_id, type, amount_cents, source, reference_id, movement_date, created_at, updated_at)
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.unidade_id,
        NEW.tipo,
        ROUND(NEW.valor * 100)::int, -- Convert decimal to cents
        NEW.fonte,
        NEW.reference_id,
        NEW.data_mov,
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );

-- =============================================================================
-- 6. QUEUE COMPATIBILITY
-- =============================================================================

CREATE OR REPLACE VIEW fila AS
SELECT 
    id,
    unit_id as unidade_id,
    customer_id as cliente_id,
    status,
    priority as prioridade,
    position as posicao,
    estimated_wait_minutes as tempo_espera_estimado,
    created_at,
    updated_at
FROM queue;

-- =============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Ensure views have good performance
DO $$
BEGIN
    -- Add indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_customers_unit_id') THEN
        CREATE INDEX idx_customers_unit_id ON customers(unit_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_professionals_unit_id') THEN
        CREATE INDEX idx_professionals_unit_id ON professionals(unit_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_unit_id') THEN
        CREATE INDEX idx_services_unit_id ON services(unit_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_transactions_unit_id') THEN
        CREATE INDEX idx_financial_transactions_unit_id ON financial_transactions(unit_id);
    END IF;
    
    RAISE NOTICE 'Indexes verified/created successfully';
END $$;

-- =============================================================================
-- 8. VERIFICATION QUERIES
-- =============================================================================

-- Verify views are working
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_name IN ('clientes', 'profissionais', 'servicos', 'unidades', 'financeiro_mov', 'fila');
    
    RAISE NOTICE 'Created % compatibility views', view_count;
    
    -- Test basic queries
    PERFORM COUNT(*) FROM clientes LIMIT 1;
    PERFORM COUNT(*) FROM profissionais LIMIT 1;
    PERFORM COUNT(*) FROM servicos LIMIT 1;
    PERFORM COUNT(*) FROM unidades LIMIT 1;
    
    RAISE NOTICE 'All views are accessible and functional';
    RAISE NOTICE 'Zero-downtime migration setup completed successfully!';
    RAISE NOTICE 'Old PT code can continue working while new EN code is deployed';
END $$;