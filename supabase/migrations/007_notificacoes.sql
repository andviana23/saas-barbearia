-- =====================================
-- Tabela de Notificações
-- =====================================
create table if not exists public.notificacoes (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid references public.unidades(id) on delete cascade,
    usuario_id uuid references public.profiles(id) on delete cascade,
    titulo text not null,
    mensagem text not null,
    lida boolean default false,
    tipo text,
    -- sistema, financeiro, agendamento
    created_at timestamp with time zone default now()
);
-- =====================================
-- Tabela de Logs de Sistema
-- =====================================
create table if not exists public.logs (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid references public.unidades(id) on delete cascade,
    usuario_id uuid references public.profiles(id) on delete
    set null,
        acao text not null,
        detalhes jsonb,
        created_at timestamp with time zone default now()
);