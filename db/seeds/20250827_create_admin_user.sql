-- Seed: Criação de usuário administrador padrão
-- Executar somente em ambientes de desenvolvimento ou staging inicial

-- 1. Unidade padrão
INSERT INTO public.unidades (id, nome, cnpj, endereco, telefone, email, config, ativo, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Barbearia Principal',
  '12.345.678/0001-90',
  'Rua Principal, 123 - Centro',
  '(11) 99999-9999',
  'contato@tratodebarbados.com',
  '{"theme": "default"}',
  true,
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- 2. Usuário auth
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tratodebarbados.com',
  crypt('Admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Administrador","role":"admin"}',
  false,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- 3. Profile
INSERT INTO public.profiles (id, nome, email, telefone, unidade_default_id, papel, ativo, created_at, updated_at)
VALUES (
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
