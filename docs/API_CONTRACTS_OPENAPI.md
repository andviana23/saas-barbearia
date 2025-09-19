# Contratos de API (OpenAPI)

Escopo
- Documentar rotas principais de API (ex.: /api/webhooks/asaas, /api/metrics, /api/logs)

Geração/Validação
- [TODO] Definir estratégia de geração (ex.: comentários JSDoc + ferramentas, ou descrição manual)
- Validar openapi.yaml em CI

Seção: Webhook Asaas (atualizado)
- POST /api/webhooks/asaas
  - Segurança: Header asaas-access-token: string (obrigatório)
  - Request Body (application/json):
    - id: string (identificador do evento)
    - event: string (tipo do evento)
    - dateCreated?: string (ISO 8601)
    - subscription?: { id: string }
    - payment?: { id: string }
  - Comportamento:
    - Valida o token via validador interno (asaasClient.validateWebhookToken)
    - Faz o parse do corpo como texto bruto para JSON; 400 em caso de erro de parse
    - Enfileira o processamento idempotente e responde imediatamente
  - Respostas:
    - 200: { message: "Webhook recebido" }
    - 401: { error: "Token inválido" }
    - 400: { error: "Payload inválido" }
    - 500: { error: "Erro interno do servidor" }
  - Idempotência e Processamento Assíncrono:
    - Evento persistido em tabela asaas_webhook_events com colunas (event_id, event_type, external_id, payload, status)
    - Inserção falha com chave duplicada (unique constraint) é tratada como já processado/recebido, evitando duplicidades
    - O resultado do processamento é assíncrono e não afeta a resposta HTTP
  - Exemplo cURL:
    - curl -X POST "https://<host>/api/webhooks/asaas" \
      -H "Content-Type: application/json" \
      -H "asaas-access-token: <TOKEN>" \
      -d '{
            "id": "evt_123",
            "event": "subscription.created",
            "dateCreated": "2024-01-01T12:00:00.000Z",
            "subscription": { "id": "sub_abc" }
          }'

- GET /api/webhooks/asaas
  - Uso: verificação/healthcheck
  - 200: { message: "Webhook ASAAS ativo" }

- Rota legacy (deprecada)
  - POST /api/asaas/webhook
  - Mesmo header de segurança e semântica de resposta; delega ao mesmo processador idempotente
  - Manter apenas para compatibilidade retroativa; planejar sunset

Versionamento
- Versões semânticas do contrato; mudanças compatíveis x incompatíveis
