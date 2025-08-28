# Endpoint de Métricas ASAAS Webhooks

## GET /api/asaas/metrics

Retorna métricas agregadas sobre processamento de eventos de webhook ASAAS.

### Resposta (200)

```json
{
  "success": true,
  "metrics": {
    "total": 42,
    "processed": 30,
    "failed": 3,
    "pending": 9,
    "avg_processing_ms": 123,
    "p50_processing_ms": 98,
    "p95_processing_ms": 240,
    "last24h": { "processed": 18, "failed": 1 },
    "generated_at": "2025-08-28T16:45:12.123Z"
  }
}
```

### Campos

- `total`: quantidade total de registros em `asaas_webhook_events`.
- `processed` / `failed` / `pending`: contagens por status atual.
- `avg_processing_ms`: média arredondada do tempo de processamento (ms) para eventos que possuem `processing_time_ms` > 0.
- `p50_processing_ms`: mediana (percentil 50) dos tempos de processamento.
- `p95_processing_ms`: percentil 95 dos tempos de processamento.
- `last24h.processed` / `last24h.failed`: eventos finalizados (processed/failed) cujo `processed_at` está dentro das últimas 24 horas.
- `generated_at`: timestamp ISO do momento de geração das métricas (útil para caching ou diff).

### Considerações de Cache

O endpoint define `Cache-Control: no-store` para refletir estado quase em tempo real.

### Erros (500)

```json
{ "success": false, "error": "mensagem" }
```

### Evoluções Futuras (Planejado)

- Amostragem temporal (janela configurável via query string ex: `?window=3600`).
- Percentis adicionais (p75) e histogramas.
- Filtro por status na consulta (`?status=failed`).
- Export em formato Prometheus se necessário.

### Referências Internas

Implementação em `src/app/actions/asaas-webhook-metrics.ts`.
Rota Next.js em `src/app/api/asaas/metrics/route.ts`.
Teste unitário em `src/app/actions/__tests__/asaasWebhookMetrics.test.ts`.
