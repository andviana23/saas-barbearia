# Push Notifications

## Provedores

- iOS: APNs (via FCM ou direto?)
- Android: FCM

## Casos de Uso

- Lembrete de agendamento
- Confirmação/alteração/cancelamento
- Pagamento confirmado/atrasado (se fizer sentido)
- Mensagens transacionais

## Design de Mensagem

- Título curto, ação clara
- Deep link para tela específica

## Inscrição & Consentimento

- Opt-in, revogação
- Token device por usuário e por unidade (multi-tenant)

## Backoff e Retry

- Retentativa em falha temporária
- Remoção de tokens inválidos

## Observabilidade

- Taxa de envio e de abertura (open rate)
- Correlação com eventos (ex.: comparecimento)
