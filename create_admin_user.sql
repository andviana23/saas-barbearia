-- Script para criar usuário administrador no Supabase
-- Email: admin@tratodebarbados.com
-- Senha: Admin123

-- 1. Primeiro criar uma unidade padrão
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
    gen_random_uuid(),
    'Barbearia Principal',
    '12.345.678/0001-90',
    'Rua Principal, 123 - Centro',
    '(11) 99999-9999',
    'contato@tratodebarbados.com',
    '{"theme": "default", "business_hours": {"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "16:00"}, "sunday": {"closed": true}}}',
    true,
    now(),
    now()
) ON CONFLICT DO NOTHING;

-- 2. Criar usuário na tabela auth.users (simulando registro do Supabase)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@tratodebarbados.com',
    crypt('Admin123', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"nome": "Administrador", "role": "admin"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null
) ON CONFLICT (email) DO NOTHING;

-- 3. Criar perfil na tabela profiles
INSERT INTO public.profiles (
    id,
    nome,
    email,
    telefone,
    unidade_default_id,
    papel,
    ativo,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@tratodebarbados.com'),
    'Administrador Trato',
    'admin@tratodebarbados.com',
    '(11) 99999-9999',
    (SELECT id FROM public.unidades WHERE nome = 'Barbearia Principal' LIMIT 1),
    'admin',
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    unidade_default_id = EXCLUDED.unidade_default_id,
    papel = EXCLUDED.papel,
    ativo = EXCLUDED.ativo,
    updated_at = now();

-- 4. Verificar se foi criado corretamente
SELECT 
    u.email,
    p.nome,
    p.papel,
    un.nome as unidade_nome
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.unidades un ON p.unidade_default_id = un.id
WHERE u.email = 'admin@tratodebarbados.com';