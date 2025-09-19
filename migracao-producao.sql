-- MIGRAÇÃO PARA PRODUÇÃO - BARBearIA
-- Script para configurar permissões do service_role no banco de produção
-- Execute este script com um usuário administrador (postgres)

-- 1. Garantir que o service_role existe e pode fazer login
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role WITH LOGIN PASSWORD 'postgres';
  ELSE
    -- Garantir que pode fazer login
    ALTER ROLE service_role WITH LOGIN;
    -- Definir senha (altere para uma senha segura em produção)
    ALTER ROLE service_role PASSWORD 'postgres';
  END IF;
END
$$;

-- 2. Conceder permissões no schema public
GRANT USAGE ON SCHEMA public TO service_role;
GRANT CREATE ON SCHEMA public TO service_role;

-- 3. Conceder permissões em todas as tabelas existentes
-- Tabelas principais do sistema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Garantir permissões para tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- 5. Criar políticas RLS para service_role (se ainda não existirem)
-- Verificar se as tabelas existem antes de criar políticas
DO $$
BEGIN
  -- Política para appointments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    CREATE POLICY "service_role_full_access_appointments" ON appointments
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Política para customers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    CREATE POLICY "service_role_full_access_customers" ON customers
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Política para services
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
    CREATE POLICY "service_role_full_access_services" ON services
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Política para units
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units') THEN
    CREATE POLICY "service_role_full_access_units" ON units
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Política para unit_members
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unit_members') THEN
    CREATE POLICY "service_role_full_access_unit_members" ON unit_members
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- 6. Verificar configuração final
SELECT 
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreatedb,
  rolcreaterole
FROM pg_roles 
WHERE rolname = 'service_role';

-- 7. Verificar permissões concedidas
SELECT 
  table_schema,
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges 
WHERE grantee = 'service_role'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 8. Teste de conexão (opcional - remova o comentário para testar)
-- \c postgres service_role
-- SELECT current_user, current_database();