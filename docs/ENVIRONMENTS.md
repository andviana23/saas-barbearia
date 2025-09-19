# Ambientes

Ambientes
- Desenvolvimento (dev)
- Homologação (staging)
- Produção (prod)

Políticas
- Promoção somente com testes verdes e checklist de release
- Rotação periódica de chaves/secrets

Variáveis de ambiente (exemplos)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- ASAAS_WEBHOOK_TOKEN [TODO]
- LOG_LEVEL [opcional]

Configurações específicas
- dev: E2E_MODE=1 pode desabilitar middleware para E2E
- staging/prod: métricas e logs enriquecidos
