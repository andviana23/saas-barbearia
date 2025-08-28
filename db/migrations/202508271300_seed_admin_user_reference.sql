-- Migration 202508271300: Referência seed de admin user
-- Esta migration não insere dados diretamente para evitar execução involuntária em produção.
-- Utilize o script em db/seeds/20250827_create_admin_user.sql quando necessário.

-- Opcionalmente, registrar em uma tabela de controle de seeds executadas:
-- CREATE TABLE IF NOT EXISTS public.seed_history (
--   id serial primary key,
--   seed_name text not null unique,
--   executed_at timestamptz not null default now()
-- );

-- INSERT INTO public.seed_history (seed_name)
--   VALUES ('20250827_create_admin_user')
--   ON CONFLICT DO NOTHING;

-- Nenhuma alteração estrutural aqui; somente documentação.