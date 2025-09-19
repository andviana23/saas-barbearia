-- Configuração completa do banco PostgreSQL local para testes
-- Este script cria o schema com permissões corretas para service_role

-- Criar roles se não existirem
CREATE ROLE service_role;
CREATE ROLE authenticated;
CREATE ROLE anon;

-- Configurar permissões de bypass RLS para service_role
ALTER ROLE service_role BYPASSRLS;

-- Conceder permissões básicas no schema
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;

-- Criar tabelas com estrutura similar ao Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela units (unidades/barbearias)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela unit_members (relacionamento usuário-unidade)
CREATE TABLE unit_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    user_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID NOT NULL REFERENCES services(id),
    professional_id UUID,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_appointments_unit_id ON appointments(unit_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_customers_unit_id ON customers(unit_id);
CREATE INDEX idx_services_unit_id ON services(unit_id);
CREATE INDEX idx_unit_members_unit_id ON unit_members(unit_id);
CREATE INDEX idx_unit_members_user_id ON unit_members(user_id);

-- Criar função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER trg_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função user_has_unit_access (usada nas políticas RLS)
CREATE OR REPLACE FUNCTION user_has_unit_access(target_unit_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM unit_members um
        WHERE um.unit_id = target_unit_id 
          AND um.user_id = auth.uid()
          AND um.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS nas tabelas
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para service_role (permissão total)
CREATE POLICY service_role_all_units ON units FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all_customers ON customers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all_services ON services FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all_unit_members ON unit_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_role_all_appointments ON appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Criar políticas RLS para authenticated (com restrições)
CREATE POLICY auth_units_access ON units FOR ALL TO authenticated USING (user_has_unit_access(id));
CREATE POLICY auth_customers_access ON customers FOR ALL TO authenticated USING (user_has_unit_access(unit_id)) WITH CHECK (user_has_unit_access(unit_id));
CREATE POLICY auth_services_access ON services FOR ALL TO authenticated USING (user_has_unit_access(unit_id)) WITH CHECK (user_has_unit_access(unit_id));
CREATE POLICY auth_unit_members_access ON unit_members FOR ALL TO authenticated USING (user_has_unit_access(unit_id)) WITH CHECK (user_has_unit_access(unit_id));
CREATE POLICY auth_appointments_access ON appointments FOR ALL TO authenticated USING (user_has_unit_access(unit_id)) WITH CHECK (user_has_unit_access(unit_id));

-- CONCEDER PERMISSÕES GRANT (o que estava faltando!)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Permissões para authenticated (leitura e escrita limitada)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permissões para anon (apenas leitura pública)
GRANT SELECT ON units TO anon;
GRANT SELECT ON services TO anon;

-- Inserir dados de teste
INSERT INTO units (name, email, phone, address) VALUES 
    ('Barbearia Teste 1', 'teste1@barbearia.com', '11999999999', 'Rua Teste, 123'),
    ('Barbearia Teste 2', 'teste2@barbearia.com', '11888888888', 'Rua Exemplo, 456');

INSERT INTO customers (unit_id, name, email, phone) VALUES 
    ((SELECT id FROM units LIMIT 1), 'João Silva', 'joao@teste.com', '11999999999'),
    ((SELECT id FROM units LIMIT 1), 'Maria Santos', 'maria@teste.com', '11888888888');

INSERT INTO services (unit_id, name, description, price, duration) VALUES 
    ((SELECT id FROM units LIMIT 1), 'Corte de Cabelo', 'Corte tradicional', 35.00, 30),
    ((SELECT id FROM units LIMIT 1), 'Barba', 'Barba completa', 25.00, 20);

-- Verificar permissões
SELECT table_name, privilege_type, grantee 
FROM information_schema.role_table_grants 
WHERE grantee = 'service_role' 
ORDER BY table_name, privilege_type;