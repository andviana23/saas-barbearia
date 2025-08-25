-- =====================================
-- Tabela de Planos de Assinatura
-- =====================================
create table if not exists public.planos (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    nome text not null,
    descricao text,
    preco numeric(10, 2) not null,
    duracao_meses int not null,
    -- 1, 3, 6, 12...
    ativo boolean default true,
    created_at timestamp with time zone default now()
);
-- =====================================
-- Tabela de Assinaturas
-- =====================================
create table if not exists public.assinaturas (
    id uuid primary key default uuid_generate_v4(),
    plano_id uuid not null references public.planos(id),
    cliente_id uuid not null references public.clientes(id) on delete cascade,
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    inicio date not null default current_date,
    fim date not null,
    status text not null default 'ativa',
    -- ativa, cancelada, expirada
    created_at timestamp with time zone default now()
);
-- =====================================
-- Tabela de Pagamentos de Assinaturas
-- =====================================
create table if not exists public.pagamentos_assinaturas (
    id uuid primary key default uuid_generate_v4(),
    assinatura_id uuid not null references public.assinaturas(id) on delete cascade,
    valor numeric(10, 2) not null,
    metodo text not null,
    -- cartão, pix, boleto
    status text not null default 'pendente',
    -- pendente, pago, falhou
    data_pagamento timestamp with time zone default now()
);