-- ROLLBACK PARA PRODUÇÃO - BARBearIA
-- Script para reverter as permissões do service_role no banco de produção
-- Execute este script apenas se precisar desfazer as mudanças

-- 1. Remover políticas RLS criadas
DO $$
BEGIN
  -- Remover política para appointments
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'service_role_full_access_appointments'
  ) THEN
    DROP POLICY "service_role_full_access_appointments" ON appointments;
  END IF;

  -- Remover política para customers
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' 
    AND policyname = 'service_role_full_access_customers'
  ) THEN
    DROP POLICY "service_role_full_access_customers" ON customers;
  END IF;

  -- Remover política para services
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' 
    AND policyname = 'service_role_full_access_services'
  ) THEN
    DROP POLICY "service_role_full_access_services" ON services;
  END IF;

  -- Remover política para units
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'units' 
    AND policyname = 'service_role_full_access_units'
  ) THEN
    DROP POLICY "service_role_full_access_units" ON units;
  END IF;

  -- Remover política para unit_members
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'unit_members' 
    AND policyname = 'service_role_full_access_unit_members'
  ) THEN
    DROP POLICY "service_role_full_access_unit_members" ON unit_members;
  END IF;
END
$$;

-- 2. Revogar permissões concedidas
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM service_role;
REVOKE CREATE ON SCHEMA public FROM service_role;
REVOKE USAGE ON SCHEMA public FROM service_role;

-- 3. Remover privilégios padrão
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM service_role;

-- 4. Desabilitar login (opcional - descomente se quiser desabilitar completamente)
-- ALTER ROLE service_role WITH NOLOGIN;

-- 5. Verificar rollback
SELECT 
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreatedb,
  rolcreaterole
FROM pg_roles 
WHERE rolname = 'service_role';

-- Verificar se as políticas foram removidas
SELECT tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE 'service_role_%';