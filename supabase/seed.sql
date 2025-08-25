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