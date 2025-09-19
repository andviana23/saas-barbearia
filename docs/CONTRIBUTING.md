# Contribuindo

Fluxo de trabalho
- Crie branches por feature/fix: feature/<nome>, fix/<nome>, docs/<nome>
- Commits semânticos (Conventional Commits):
  - feat:, fix:, docs:, refactor:, test:, chore:
- Pull Requests
  - Descreva objetivo, mudanças e impactos
  - Inclua checklist de testes e screenshots quando aplicável

Padrões de código
- ESLint + Prettier obrigatórios
- TypeScript estrito; sem any (use interfaces/types/generics/unknown)
- Imports absolutos quando suportado (@/components, @/utils, @/types)
- Funções curtas, responsabilidade única, tratamento explícito de erros

Testes
- Mínimo 80% para módulos críticos
- Testes unitários isolados; integração cobrindo fluxos principais
- Limpeza automática de artefatos temporários (afterEach/afterAll)

Segurança
- Nunca commitar secrets
- Validação de variáveis obrigatórias na inicialização
- Scrub em logs de dados sensíveis
