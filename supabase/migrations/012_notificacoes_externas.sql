-- =====================================
-- EP20: Sistema de Notificações Externas
-- =====================================

-- Tabela de Canais de Notificação
create table if not exists public.canais_notificacao (
    id uuid primary key default uuid_generate_v4(),
    codigo text unique not null, -- 'whatsapp', 'sms', 'email', 'push'
    nome text not null,
    descricao text,
    icone text, -- ícone Material-UI
    ativo boolean default true,
    configuracao jsonb, -- configurações específicas do canal
    ordem int default 0,
    created_at timestamp with time zone default now()
);

-- Inserir canais padrão
insert into public.canais_notificacao (codigo, nome, descricao, icone, ordem) values
('whatsapp', 'WhatsApp', 'Mensagens via WhatsApp Business API', 'WhatsApp', 1),
('sms', 'SMS', 'Mensagens de texto via SMS', 'Sms', 2),
('email', 'E-mail', 'Notificações por e-mail', 'Email', 3),
('push', 'Push', 'Notificações push no navegador', 'Notifications', 4);

-- Tabela de Templates de Notificação
create table if not exists public.templates_notificacao (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid references public.unidades(id) on delete cascade,
    canal_id uuid not null references public.canais_notificacao(id),
    
    -- Identificação do template
    codigo text not null, -- 'agendamento_confirmado', 'lembrete_horario', etc.
    nome text not null,
    descricao text,
    
    -- Conteúdo do template
    titulo text, -- para push e email
    mensagem text not null, -- suporte a variáveis {{nome}}, {{data}}, etc.
    
    -- Configurações
    ativo boolean default true,
    enviar_automatico boolean default false, -- envio automático em eventos
    tempo_antecedencia interval, -- para lembretes (ex: 1 hour)
    
    -- Metadados
    variaveis jsonb, -- lista de variáveis disponíveis
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Garantir que não haja templates duplicados
    unique(unidade_id, canal_id, codigo)
);

-- Tabela de Preferências de Notificação dos Clientes
create table if not exists public.preferencias_notificacao (
    id uuid primary key default uuid_generate_v4(),
    cliente_id uuid not null references public.clientes(id) on delete cascade,
    canal_id uuid not null references public.canais_notificacao(id),
    
    -- Preferências
    aceita_notificacao boolean default true,
    aceita_promocoes boolean default true,
    aceita_lembretes boolean default true,
    
    -- Dados de contato por canal
    whatsapp_numero text,
    sms_numero text,
    email_endereco text,
    push_subscription jsonb, -- dados da subscription para push
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Um cliente só pode ter uma preferência por canal
    unique(cliente_id, canal_id)
);

-- Tabela de Fila de Notificações
create table if not exists public.fila_notificacoes (
    id uuid primary key default uuid_generate_v4(),
    unidade_id uuid not null references public.unidades(id) on delete cascade,
    
    -- Destinatário
    cliente_id uuid references public.clientes(id) on delete cascade,
    destinatario jsonb not null, -- {tipo: 'cliente'|'profissional', id: uuid, contato: string}
    
    -- Template e canal
    template_id uuid not null references public.templates_notificacao(id),
    canal_id uuid not null references public.canais_notificacao(id),
    
    -- Conteúdo processado
    titulo text,
    mensagem text not null,
    dados_contexto jsonb, -- dados para substituir variáveis
    
    -- Status do envio
    status text not null default 'pendente', -- 'pendente', 'enviando', 'enviado', 'erro', 'cancelado'
    tentativas int default 0,
    max_tentativas int default 3,
    proximo_envio timestamp with time zone default now(),
    
    -- Resultado do envio
    enviado_em timestamp with time zone,
    erro_mensagem text,
    provider_id text, -- ID retornado pelo provedor (WhatsApp, SMS, etc.)
    provider_response jsonb, -- resposta completa do provedor
    
    -- Prioridade
    prioridade int default 5, -- 1 (alta) a 10 (baixa)
    
    -- Agendamento
    agendar_para timestamp with time zone,
    
    -- Metadados
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Tabela de Logs de Entrega
create table if not exists public.logs_notificacao (
    id uuid primary key default uuid_generate_v4(),
    fila_id uuid not null references public.fila_notificacoes(id) on delete cascade,
    
    -- Dados do log
    evento text not null, -- 'enviado', 'entregue', 'lido', 'falhou'
    detalhes jsonb,
    provider_webhook jsonb, -- dados do webhook do provedor
    
    -- Timestamp
    timestamp timestamp with time zone default now()
);

-- Índices para performance
create index if not exists idx_templates_unidade_canal on public.templates_notificacao(unidade_id, canal_id);
create index if not exists idx_templates_codigo on public.templates_notificacao(codigo);
create index if not exists idx_preferencias_cliente on public.preferencias_notificacao(cliente_id);
create index if not exists idx_fila_status_proximo on public.fila_notificacoes(status, proximo_envio);
create index if not exists idx_fila_unidade_status on public.fila_notificacoes(unidade_id, status);
create index if not exists idx_logs_fila on public.logs_notificacao(fila_id);

-- RLS Policies
alter table public.canais_notificacao enable row level security;
alter table public.templates_notificacao enable row level security;
alter table public.preferencias_notificacao enable row level security;
alter table public.fila_notificacoes enable row level security;
alter table public.logs_notificacao enable row level security;

-- Canais são públicos para usuários autenticados
create policy "Canais de notificação são públicos" on public.canais_notificacao
    for select using (auth.role() = 'authenticated');

-- Templates por unidade
create policy "Usuários veem templates da sua unidade" on public.templates_notificacao
    for select using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários gerenciam templates da sua unidade" on public.templates_notificacao
    for all using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

-- Preferências dos clientes da unidade
create policy "Usuários veem preferências dos clientes da unidade" on public.preferencias_notificacao
    for select using (
        cliente_id in (
            select c.id from public.clientes c
            where c.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

create policy "Usuários gerenciam preferências dos clientes da unidade" on public.preferencias_notificacao
    for all using (
        cliente_id in (
            select c.id from public.clientes c
            where c.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

-- Fila por unidade
create policy "Usuários veem fila da sua unidade" on public.fila_notificacoes
    for select using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

create policy "Usuários gerenciam fila da sua unidade" on public.fila_notificacoes
    for all using (
        unidade_id in (
            select unidade_id from public.profiles 
            where id = auth.uid()
        )
    );

-- Logs seguem as permissões da fila
create policy "Usuários veem logs das notificações da unidade" on public.logs_notificacao
    for select using (
        fila_id in (
            select fn.id from public.fila_notificacoes fn
            where fn.unidade_id in (
                select unidade_id from public.profiles 
                where id = auth.uid()
            )
        )
    );

-- Trigger para updated_at
create trigger update_templates_updated_at before update
    on public.templates_notificacao for each row execute procedure update_updated_at_column();

create trigger update_preferencias_updated_at before update
    on public.preferencias_notificacao for each row execute procedure update_updated_at_column();

create trigger update_fila_updated_at before update
    on public.fila_notificacoes for each row execute procedure update_updated_at_column();

-- Inserir templates padrão (serão criados via seed ou interface)
-- Função para inserir templates por unidade será criada nas actions

-- View para relatórios de notificação
create or replace view public.view_relatorio_notificacoes as
select 
    fn.*,
    c.nome as canal_nome,
    c.icone as canal_icone,
    t.nome as template_nome,
    t.codigo as template_codigo,
    cl.nome as cliente_nome,
    u.nome as unidade_nome,
    -- Contagem de logs
    (select count(*) from public.logs_notificacao ln where ln.fila_id = fn.id) as total_logs
from public.fila_notificacoes fn
    join public.canais_notificacao c on fn.canal_id = c.id
    join public.templates_notificacao t on fn.template_id = t.id
    left join public.clientes cl on fn.cliente_id = cl.id
    join public.unidades u on fn.unidade_id = u.id;

-- Grant permissions
grant select on public.view_relatorio_notificacoes to authenticated;
grant select on public.canais_notificacao to authenticated;

-- Função para processar variáveis no template
create or replace function processar_template(
    template_mensagem text,
    dados jsonb
) returns text as $$
declare
    resultado text;
    variavel text;
    valor text;
begin
    resultado := template_mensagem;
    
    -- Substituir variáveis no formato {{variavel}}
    for variavel, valor in select key, value::text from jsonb_each_text(dados) loop
        resultado := replace(resultado, '{{' || variavel || '}}', valor);
    end loop;
    
    return resultado;
end;
$$ language plpgsql;