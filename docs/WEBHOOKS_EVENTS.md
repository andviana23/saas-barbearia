# Webhooks – Eventos & Consumidores

Fonte
- Asaas → POST /api/webhooks/asaas
- GET /api/webhooks/asaas disponível para verificação/healthcheck

Segurança
- Header: asaas-access-token deve ser válido (validação via asaasClient.validateWebhookToken)
- Rejeição com 401 quando ausente/inválido
- Idempotência: processamento centralizado por processAsaasWebhook com enfileiramento (queueMicrotask)
- Sanitização de logs: tokens não devem ser logados em claro

Fila & Processamento
- Producer: rota de webhook delega para serviço de assinaturas (processAsaasWebhook)
- Consumidores (exemplos):
  - billing.payment_confirmed → registrar recebimento + comissão
  - billing.payment_overdue → régua de cobrança
  - subscription.canceled → suspender benefícios

Contratos de Evento (payload mínimo sugerido)
- payment.confirmed: { id, event, dateCreated, payment: { id }, subscription: { id }, amount [TODO] }
- subscription.canceled: { id, event, dateCreated, subscription: { id }, reason [TODO] }

Observabilidade
- DLQ: [TODO] definir mecanismo (tabela ou fila externa)
- Métricas: contagem por tipo/status, tempo de processamento, taxa de erro

Ver também
- INTEGRATIONS_ASAAS.md
