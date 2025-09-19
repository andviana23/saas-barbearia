-- Script para corrigir permissões do service_role no PostgreSQL local

-- Permitir login para o service_role
ALTER ROLE service_role LOGIN;

-- Garantir que o service_role tenha senha
ALTER ROLE service_role WITH PASSWORD 'postgres';

-- Conceder todas as permissões no schema public
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Garantir permissões futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- Verificar as permissões
SELECT rolname, rolsuper, rolbypassrls, rolcanlogin
FROM pg_roles 
WHERE rolname IN ('postgres', 'service_role');