# Débito Técnico

Hotspots identificados
- Duplicidade histórica de rotas entre src/app e src/app/(protected) [plano de consolidação em (protected)]
- Diversos TODO/FIXME espalhados em ações, serviços e componentes (assinaturas, agenda, financeiro)
- Componentes de agenda dependem de tipos definidos em pages → extrair para src/types

Plano de refatoração (ondas)
- Onda 1 (curto prazo)
  - Consolidar tipos de domínio em src/types/*
  - Remover imports de tipos vindos de pages
  - Resolver TODOs críticos (segurança, fluxo financeiro)
- Onda 2 (médio prazo)
  - Padronizar validações Zod por módulo
  - Reduzir acoplamento entre hooks e serviços (interfaces claras)
  - Revisar performance em listas (virtualização quando necessário)
- Onda 3 (longo prazo)
  - Modularizar integrações externas com contratos estáveis
  - Observabilidade completa (métricas, tracing)

Métricas de qualidade
- Cobertura mínima 80% em funções críticas
- ESLint + Prettier aplicados em CI
- Proibição de any; generics/unknown quando necessário
