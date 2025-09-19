# Runbook de Operações

Procedimentos comuns
- Reiniciar serviço: pm2 restart saas-barbearia
- Verificar saúde: /api/health, /api/webhooks/asaas (GET)
- Rotacionar secrets: atualizar .env e reiniciar serviço

Troubleshooting
- Webhook 401: conferir ASAAS_WEBHOOK_TOKEN, cabeçalhos e logs
- Erros de RLS: checar unit_id e roles do usuário
- Lentidão: revisar consultas e índices por unit_id

Pós-incidente
- Coletar timeline, causas, impacto e ações corretivas
- Abrir post-mortem
