# Registro de Funcionalidades

Agendamento (Agenda)
- Objetivo: criar, visualizar, remanejar e cancelar compromissos
- Rotas: /(protected)/agenda, /(protected)/agenda/[id]
- Entidades: appointments, appointment_services, working_hours, customers, professionals, services
- Fluxos: criar agendamento, remarcar, cancelar, check-in, notificar cliente [TODO detalhar SLA de notificações]

Fila de Atendimento
- Rotas: /(protected)/fila
- Entidades: waiting_list, customers, professionals
- Fluxos: entrar na fila, chamar próximo, abandonar fila

Assinaturas (Billing)
- Rotas: /(protected)/assinaturas
- Entidades: subscriptions, invoices, customers
- Integrações: Webhook Asaas (pagamentos, eventos de assinatura)
- Fluxos: criar plano [TODO], assinar cliente [TODO], cobrança recorrente, cancelamento

Comissões
- Rotas: /(protected)/financeiro/comissao
- Entidades: financial_transactions, services/professionals [TODO modelagem exata]
- Fluxos: cálculo por serviço/atendimento, fechamento de período

Financeiro
- Rotas: /(protected)/financeiro/(caixa|fluxo|historico)
- Entidades: financial_transactions, cashbox_sessions, invoices, sales
- Fluxos: abertura/fechamento de caixa, baixa de títulos, relatórios

Produtos e Serviços
- Rotas: /(protected)/produtos, /(protected)/servicos
- Entidades: products, product_categories, services, service_pricings
- Fluxos: cadastro, precificação, associação a profissionais

Multi-unidades
- Rotas: /(protected)/multi-unidades, /(protected)/configuracoes
- Entidades: units, unit_members
- Fluxos: adicionar/gerenciar unidades, permissões por role e unidade
