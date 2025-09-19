# Integração: Asaas (Cobranças/Assinaturas)

Endpoints
- Webhook: /api/webhooks/asaas (POST)
- Healthcheck: /api/webhooks/asaas (GET)

Autorização
- Enviar header asaas-access-token com secret configurado na plataforma Asaas
- O token é validado no recebimento; requisições inválidas retornam 401

Eventos suportados (exemplos)
- payment.confirmed → baixa de cobrança e eventuais comissões
- payment.overdue → acionar régua de cobrança
- subscription.canceled → suspender benefícios do assinante

Fluxo de processamento
- Rota delega a processador idempotente (processAsaasWebhook) que orquestra persistência e efeitos colaterais
- Eventos são reduzidos a um formato interno (id, event, dateCreated, subscription)

Erros & Retentativas
- Resposta 200 no recebimento (aceite assíncrono)
- Falhas no processamento devem ser registradas e reprocessadas via DLQ [TODO]

Observabilidade
- Métricas de eventos recebidos, processados e falhos [TODO implementar métricas]
- Logs centralizados com scrub de dados sensíveis

Documentos relacionados
- WEBHOOKS_EVENTS.md
- FEATURES.md (Assinaturas)
