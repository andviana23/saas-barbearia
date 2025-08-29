-- Seed simples para criar dados básicos

-- 1. Inserir unidade padrão
INSERT INTO public.unidades (
    id,
    nome,
    cnpj,
    endereco,
    telefone,
    email,
    config,
    ativo,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Barbearia Trato Demo',
    '12345678000190',
    'Rua Principal, 123 - Centro',
    '11999999999',
    'contato@tratodebarbados.com',
    '{"theme": "default", "timezone": "America/Sao_Paulo"}'::jsonb,
    true,
    now(),
    now()
);

-- 2. Roles / perfis básicos (profiles)
-- Assumindo tabela profiles com colunas (id, user_id, nome, email, papel, ativo, created_at, updated_at)
INSERT INTO public.profiles (id, user_id, nome, email, papel, ativo, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'user-admin-demo', 'Admin Demo', 'admin@demo.local', 'admin', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Serviços demo
-- Ajustar nomes/colunas conforme schema real de services/servicos
-- Se existir tabela services
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='services') THEN
        INSERT INTO public.services (id, nome, descricao, ativo, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'Corte Masculino', 'Corte básico', true, now(), now()),
            (gen_random_uuid(), 'Barba Completa', 'Barba e acabamento', true, now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 4. Clientes demo
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customers') THEN
        INSERT INTO public.customers (id, nome, email, telefone, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'João Cliente', 'joao@example.com', '11988887777', now(), now()),
            (gen_random_uuid(), 'Maria Cliente', 'maria@example.com', '11977776666', now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 5. Profissionais demo
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='professionals') THEN
        INSERT INTO public.professionals (id, nome, email, ativo, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'Carlos Profissional', 'carlos@demo.local', true, now(), now()),
            (gen_random_uuid(), 'Ana Profissional', 'ana@demo.local', true, now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 6. Planos / subscription_plans demo
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscription_plans') THEN
        INSERT INTO public.subscription_plans (id, nome, descricao, ativo, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'Plano Bronze', 'Base de entrada', true, now(), now()),
            (gen_random_uuid(), 'Plano Prata', 'Intermediário', true, now(), now())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;