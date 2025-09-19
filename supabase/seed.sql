-- Seed simples para criar dados básicos

-- 1. Inserir unidade padrão
INSERT INTO public.units (
    id,
    name,
    timezone,
    status,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Barbearia Trato Demo',
    'America/Sao_Paulo',
    'active',
    now(),
    now()
);

-- 2. Profiles demo
-- NOTA: Comentado porque profiles.user_id referencia auth.users(id)
-- Para criar profiles, primeiro é necessário criar usuários via auth.users
-- DO $$ BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
--         INSERT INTO public.profiles (id, user_id, name, role, unit_default_id, is_active, created_at, updated_at)
--         VALUES
--             (gen_random_uuid(), gen_random_uuid(), 'Admin Demo', 'admin', '550e8400-e29b-41d4-a716-446655440000'::uuid, true, now(), now()),
--             (gen_random_uuid(), gen_random_uuid(), 'Manager Demo', 'manager', '550e8400-e29b-41d4-a716-446655440000'::uuid, true, now(), now())
--         ON CONFLICT DO NOTHING;
--     END IF;
-- END $$;

-- 3. Serviços demo
-- Ajustar nomes/colunas conforme schema real de services
-- Se existir tabela services
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='services') THEN
        INSERT INTO public.services (id, unit_id, name, description, duration_minutes, base_price, is_active, created_at, updated_at)
        VALUES
            (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Corte Masculino', 'Corte básico', 30, 25.00, true, now(), now()),
            (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Barba Completa', 'Barba e acabamento', 20, 15.00, true, now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 4. Clientes demo
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customers') THEN
        INSERT INTO public.customers (id, unit_id, name, email, phone, created_at, updated_at)
        VALUES
            (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'João Cliente', 'joao@example.com', '11988887777', now(), now()),
            (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Maria Cliente', 'maria@example.com', '11977776666', now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 5. Profissionais demo (via profiles com role 'professional')
-- NOTA: Comentado porque profiles.user_id referencia auth.users(id)
-- DO $$ BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
--         INSERT INTO public.profiles (id, user_id, name, role, unit_default_id, is_active, created_at, updated_at)
--         VALUES
--             (gen_random_uuid(), gen_random_uuid(), 'Carlos Profissional', 'professional', '550e8400-e29b-41d4-a716-446655440000'::uuid, true, now(), now()),
--             (gen_random_uuid(), gen_random_uuid(), 'Ana Profissional', 'professional', '550e8400-e29b-41d4-a716-446655440000'::uuid, true, now(), now())
--         ON CONFLICT DO NOTHING;
--     END IF;
-- END $$;

-- 6. Planos / subscription_plans demo
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscription_plans') THEN
        INSERT INTO public.subscription_plans (id, unit_id, name, description, interval_type, interval_count, price, currency, status, created_at, updated_at)
        VALUES
            (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Plano Bronze', 'Base de entrada', 'month', 1, 99.90, 'BRL', 'active', now(), now()),
            (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Plano Prata', 'Intermediário', 'month', 1, 199.90, 'BRL', 'active', now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;