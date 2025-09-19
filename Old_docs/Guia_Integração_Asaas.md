Guia_Integração_Asaas — Trato

**Versão:** v1.0.0  
**Data:** 26/08/2025

Objetivo. Padronizar a integração do módulo de assinaturas do Trato com o Asaas, cobrindo modelagem, fluxos, webhooks, segurança, ambientes e testes, respeitando a arquitetura do sistema (Next 14 App Router, Supabase com RLS, DS v2) e o que já está desenhado no Módulo de Assinaturas.

1. Escopo & Visão Geral

No escopo: clientes ⇄ Asaas (customers), assinaturas recorrentes, geração/atualização de cobranças da assinatura, webhooks de cobrança para sincronismo, reconciliação, inadimplência.

Fora do escopo imediato: split, white label, NF, subcontas (podem ser tratados em guias próprios depois).

Por quê webhooks de cobrança? No Asaas, o mecanismo recomendado para manter dados atualizados é Webhook, com entrega “pelo menos uma vez” (precisa de idempotência). Eventos de PAYMENT\_\* cobrem vida toda da cobrança.
docs.asaas.com

docs.asaas.com

2. Alinhamento com a Arquitetura do Trato

Frontend: Next.js 14 (App Router), MUI v6, React Query v5; Backend: Server Actions + Supabase; Banco: Postgres com RLS por unidade_id.

Padrões obrigatórios: Server Actions validadas com Zod; React Query com invalidate pós-mutações; multi-tenant em todas as queries; DS v2 (DSButton, DSTextField, etc.).

3. Ambientes, Autenticação e Variáveis

Base URLs

Produção: https://api.asaas.com/v3

Sandbox: https://api-sandbox.asaas.com/v3
docs.asaas.com

Autenticação: header access_token com sua API Key. Gere a chave em Integrações > API Key. Use a chave do ambiente correto (Sandbox ≠ Produção).
docs.asaas.com
+2
docs.asaas.com
+2

Variáveis sugeridas (.env):
ASAAS_BASE_URL • ASAAS_API_KEY • ASAAS_WEBHOOK_TOKEN (seu segredo para validar o header asaas-access-token) • ASAAS_ENV (sandbox|prod).
docs.asaas.com

4. Modelo de Dados (lado Trato)

A estrutura de assinaturas do Trato já prevê planos, assinaturas, pagamentos e uso por serviço — com migração e políticas RLS. Execute/valide os scripts antes de integrar.

Tabelas-chave (resumo):

subscription_plans (planos)

plan_services (serviços e limites/mês por plano)

subscriptions (associada a cliente/unidade; guarda asaas_subscription_id, status, ciclo, próximo vencimento)

subscription_payments (cada fatura; guarda asaas_payment_id, valor, método, status, datas)

subscription_usages (controle de uso de serviços)

RLS/tenancy: sempre por unidade_id.

Mapeamentos com Asaas (mínimos):

Cliente Trato → Customer Asaas (customers.id)

Assinatura Trato → Subscription Asaas (subscriptions.id)

Pagamento Trato → Payment Asaas (payments.id)

5. Fluxos Oficiais de Integração
   5.1 Sincronizar Cliente

Criar/obter Customer Asaas para cada cliente do Trato.

POST /v3/customers → retorna id (cus\_\*). Salve como asaas_customer_id.
docs.asaas.com
+1

5.2 Criar Assinatura

POST /v3/subscriptions com:
customer, billingType (BOLETO|PIX|CREDIT_CARD), cycle (MONTHLY|…), nextDueDate, value, description. Salve asaas_subscription_id. A primeira parcela usa nextDueDate.
docs.asaas.com
+1

Cartão direto na criação: enviar creditCard + creditCardHolderInfo. Se autorizado → 200; senão 400 e não persiste.
docs.asaas.com

Consulta de cobranças da assinatura: GET /v3/subscriptions/{id}/payments (útil para reconciliação).
docs.asaas.com

5.3 Cobranças & Webhooks (verdade única do financeiro)

Habilite Webhooks (app Asaas ou API) apontando para POST /api/asaas/webhook. Responda 200 rapidamente e processe de forma assíncrona. Use o token no header asaas-access-token para validar. Entrega é “at-least-once” → aplique idempotência.
docs.asaas.com

Eventos a ouvir (mínimo):

PAYMENT*CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED, PAYMENT_CHARGEBACK*\*, etc.
docs.asaas.com

Regras de atualização (sugestão):

PAYMENT_CONFIRMED → subscription_payments.status = 'CONFIRMED' (saldo ainda não disponível)

PAYMENT_RECEIVED → subscription_payments.status = 'RECEIVED'; virar ciclo e atualizar subscriptions.next_due_date +30d (ou conforme plano)

PAYMENT_OVERDUE → marca atraso; se passar janela definida, move subscriptions.status para PAST_DUE/SUSPENDED

PAYMENT*REFUNDED/CHARGEBACK*\* → refletir no pagamento e na assinatura (política de suspensão)
(A timeline de eventos por meio de pagamento está documentada nos webhooks do Asaas.)
docs.asaas.com

5.4 Edição/Cancelamento

Editar assinatura (valor, método) com POST /v3/subscriptions/{id}; para aplicar nas parcelas futuras e também nas pendentes, envie updatePendingPayments: true.
docs.asaas.com

6. Contratos de API internos (Next 14 + Server Actions)

Padrões obrigatórios: Server Actions com Zod; React Query com invalidate; Supabase RLS enforcement; DS v2 nos componentes.

Server Action — criar assinatura:

Entrada validada (customerId, planId, billingType, nextDueDate)

Garante asaas_customer_id

Cria subscription no Asaas, persiste asaas_subscription_id

Cria registro em subscriptions + pagamento inicial em subscription_payments (status PENDING)

invalidate queries de /assinaturas, KPIs e painéis

API Route — webhook POST /api/asaas/webhook

Valida header asaas-access-token

Idempotência: dedup por (payment.id, event) em uma tabela asaas_webhook_events

Enfileira processamento (ex.: job/table) e responde 200 imediato

Atualiza subscription_payments e subscriptions conforme regras da §5.3

7. Segurança & Compliance

RLS por unidade_id em todas as tabelas do módulo; políticas de INSERT/SELECT afinadas por papel (admin/receptionist/professional).

Segredo de Webhook: valide asaas-access-token recebido; mantenha token em ASAAS_WEBHOOK_TOKEN.
docs.asaas.com

API Key: trate access_token como credencial sensível; jamais em código-fonte.
docs.asaas.com

8. Estados & Mapeamentos sugeridos

Assinatura (subscriptions.status): ACTIVE | PAST_DUE | SUSPENDED | CANCELED
Pagamento (subscription_payments.status): PENDING | CONFIRMED | RECEIVED | OVERDUE | REFUNDED | CHARGEBACK

Regras principais:

PAYMENT_RECEIVED ativa/renova assinatura e seta próximo vencimento (de acordo com plano/ciclo).

OVERDUE mantém assinatura ativa por carência opcional; após X dias → PAST_DUE/SUSPENDED.

REFUNDED/CHARGEBACK rebaixa assinatura e registra ocorrência financeira.

(Use os testes do módulo para garantir comportamento end-to-end.)

9. Testes & Homologação

Roteiro E2E já descrito no Módulo (criar plano, assinatura externa, registrar usos, simular webhook PAYMENT_RECEIVED etc.). Execute também os testes SQL de integridade.

Ambiente Sandbox do Asaas é independente (chaves e saldos próprios). Use API Key do Sandbox em ASAAS_ENV=sandbox.
docs.asaas.com
+1

10. Operação & Observabilidade

Sentry para rastrear erros nas Server Actions e no Webhook; inclua contexto (subscription_id, payment_id, event). (Padrões do projeto)

Reprocessamento: mantenha uma “fila” (tabela) de eventos com status PENDING|PROCESSED|FAILED e retry exponencial para falhas temporárias.

Reconciliação periódica: GET /v3/payments?status=RECEIVED&dateCreated[ge]=... para conferir divergências.
docs.asaas.com

11. Erros comuns (e como evitar)

401 ao testar no console da docs: geralmente é chave errada/ambiente trocado ou header access_token ausente.
docs.asaas.com

Fila de Webhook pausada (não retornar 200): reative na área Minha Conta > Integrações depois de corrigir; eventos são retidos por 14 dias.
docs.asaas.com

Duplicidade de eventos: implemente idempotência (vide §5.3).
docs.asaas.com

12. Roadmap imediato (prático)

Rodar migração do módulo de assinaturas e validar dados.

Client Asaas (fetch com access_token e base URL + helpers).

Webhook com validação do token e fila/idempotência.
docs.asaas.com

Server Actions (criar/editar/cancelar assinatura; conciliar pagamento).

KPIs/UX do módulo (usar DS v2 e invalidar caches).
