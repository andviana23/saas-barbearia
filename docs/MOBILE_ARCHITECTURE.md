# Arquitetura Mobile (Diretrizes)

Plataformas
- iOS (Swift/Kotlin Multiplatform [TODO avaliar])
- Android (Kotlin)

Diretrizes
- Autenticação por tokens do Supabase; armazenar com segurança (Keychain/Keystore)
- Cache e sincronização offline [TODO]
- Navegação coerente com web (rotas análogas)
- Observabilidade: logs e métricas leves, sem dados sensíveis

Integrações
- Webhooks continuam no backend; app recebe notificações push

Entrega
- CI/CD mobile com testes instrumentados e distribuição interna
