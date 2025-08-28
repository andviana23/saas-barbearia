-- =====================================
-- EP19: Pagamentos Externos (Revisado)
-- =====================================

-- Tabela de Tipos de Pagamento
create table if not exists public.tipos_pagamento (
    id uuid primary key default uuid_generate_v4(),
    codigo text unique not null, -- 'asaas_pix', 'asaas_cartao', 'dinheiro', 'transferencia', 'maquininha'
    nome text not null,
    descricao text,
    icone text, -- nome do ícone Material-UI
    cor text, -- cor hex para UI
    requer_asaas boolean default false,
    ativo boolean default true,
    ordem int default 0,
    created_at timestamp with time zone default now()
);

-- Inserir tipos padrão
insert into public.tipos_pagamento (codigo, nome, descricao, icone, cor, requer_asaas, ordem) values
('asaas_pix', 'PIX (ASAAS)', 'Pagamento via PIX processado pelo ASAAS', 'Pix', '#32BCAD', true, 1),
('asaas_cartao', 'Cartão (ASAAS)', 'Cartão de crédito/débito via ASAAS', 'CreditCard', '#4CAF50', true, 2),
('dinheiro', 'Dinheiro', 'Pagamento em espécie', 'AttachMoney', '#FF9800', false, 3),
('transferencia', 'Transferência', 'Transferência bancária externa', 'AccountBalance', '#2196F3', false, 4),
('maquininha', 'Maquininha', 'Cartão na maquininha própria', 'Payment', '#9C27B0', false, 5);

-- Tabela de Transações Financeiras (Unificada)
create table if not exists public.transacoes (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    cliente_id uuid references public.clientes(id) on delete set null,
    profissional_id uuid references public.profissionais(id) on delete set null,
    
    -- Dados da transação
    tipo text not null, -- 'venda', 'assinatura', 'estorno'
    valor numeric(10, 2) not null,
    descricao text not null,
    
    -- Meio de pagamento
    tipo_pagamento_id uuid not null references public.tipos_pagamento(id),
    
    -- Dados ASAAS (quando aplicável)
    asaas_payment_id text,
    asaas_customer_id text,
    asaas_status text,
    
    -- Dados externos (quando aplicável)
    comprovante_url text,
    observacoes text,
    
    -- Metadados
    data_transacao timestamp with time zone default now(),
    status text not null default 'confirmado', -- 'pendente', 'confirmado', 'cancelado'
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabela de Itens da Transação
create table if not exists public.itens_transacao (
    id uuid primary key default uuid_generate_v4(),
    transacao_id uuid not null references public.transacoes(id) on delete cascade,
    
    -- Referência ao item vendido
    tipo_item text not null, -- 'servico', 'produto'
    servico_id uuid references public.servicos(id) on delete set null,
    produto_id uuid references public.produtos(id) on delete set null,
    
    -- Dados do item
    nome text not null,
    quantidade numeric(10, 2) not null default 1,
    valor_unitario numeric(10, 2) not null,
    valor_total numeric(10, 2) not null,
    
    -- Comissão (se aplicável)
    comissao_percentual numeric(5, 2),
    comissao_valor numeric(10, 2),
    
    created_at timestamp with time zone default now()
);

-- Índices para performance
create index if not exists idx_transacoes_unidade_data on public.transacoes(unidade_id, data_transacao);
create index if not exists idx_transacoes_tipo_pagamento on public.transacoes(tipo_pagamento_id);
create index if not exists idx_transacoes_profissional on public.transacoes(profissional_id);
create index if not exists idx_transacoes_status on public.transacoes(status);
create index if not exists idx_itens_transacao on public.itens_transacao(transacao_id);

-- RLS Policies
alter table public.tipos_pagamento enable row level security;
alter table public.transacoes enable row level security;
alter table public.itens_transacao enable row level security;

-- Tipos de pagamento são visíveis para todos os usuários autenticados
create policy "Tipos de pagamento são públicos" on public.tipos_pagamento
    for select using (auth.role() = 'authenticated');

-- Transações por unidade
create policy "Usuários veem transações da sua unidade" on public.transacoes
    for select using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários inserem transações na sua unidade" on public.transacoes
    for insert with check (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários atualizam transações da sua unidade" on public.transacoes
    for update using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

-- Itens de transação seguem a mesma regra da transação pai
create policy "Usuários veem itens das transações da sua unidade" on public.itens_transacao
    for select using (
        transacao_id in (
            select id from public.transacoes t
            where t.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

create policy "Usuários inserem itens nas transações da sua unidade" on public.itens_transacao
    for insert with check (
        transacao_id in (
            select id from public.transacoes t
            where t.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

-- Trigger para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$ language 'plpgsql';

create trigger update_transacoes_updated_at before update
    on public.transacoes for each row execute procedure update_updated_at_column();

-- View para relatórios consolidados
create or replace view public.view_transacoes_completas as
select 
    t.*,
    tp.nome as tipo_pagamento_nome,
    tp.icone as tipo_pagamento_icone,
    tp.cor as tipo_pagamento_cor,
    tp.requer_asaas,
    c.nome as cliente_nome,
    p.nome as profissional_nome,
    u.nome as unidade_nome,
    -- Totais agregados
    (
        select coalesce(sum(valor_total), 0)
        from public.itens_transacao it
        where it.transacao_id = t.id
    ) as total_itens,
    (
        select coalesce(sum(comissao_valor), 0) 
        from public.itens_transacao it
        where it.transacao_id = t.id
    ) as total_comissoes
from public.transacoes t
    join public.tipos_pagamento tp on t.tipo_pagamento_id = tp.id
    left join public.clientes c on t.cliente_id = c.id
    left join public.profissionais p on t.profissional_id = p.id
    left join public.unidades u on t.unidade_id = u.id;

-- Grant permissions na view
grant select on public.view_transacoes_completas to authenticated;