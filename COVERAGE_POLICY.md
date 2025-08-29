# Política de Cobertura de Testes (Incremental)

Esta política estabelece a estratégia incremental adotada para elevar a cobertura de testes sem bloquear o fluxo de entrega contínua.

## Objetivos

- Evitar regressões de cobertura (nunca diminuir métricas globais consolidadas).
- Aumentar cobertura de forma sustentável e priorizada por risco/criticidade.
- Dar transparência ao progresso (baseline versionado + script de verificação).
- Permitir ajuste gradual dos limiares mínimos (coverageThreshold) somente quando estáveis.

## Mecanismo Principal

1. Execução `npm run test:coverage:ci` gera `coverage/coverage-summary.json`.
2. Script `scripts/verify-coverage.js` compara métricas com `scripts/coverage-baseline.json`.
3. Se qualquer métrica (statements, lines, branches, functions) melhorar ≥ 0.01, o baseline é atualizado (commit esperado).
4. Se qualquer métrica cair abaixo do baseline salvo, o processo sai com código de erro, falhando o pipeline.

## Métricas Atuais (Baseline)

- Statements: 5.70%
- Lines: 5.70%
- Branches: 48.32%
- Functions: 26.59%

(Ver arquivo `scripts/coverage-baseline.json` para valores correntes.)

## Evolução de Limiares (thresholds jest)

- Fase 1 (inicial): branches 30, functions 10, lines/statements 3 (já concluída).
- Fase 2 (atual): após estabilizar >5.7%, elevar mínimos para: branches 40, functions 15, lines/statements 5.
- Fase 3 (próximo marco >8% stmts): ajustar para: branches 45, functions 20, lines/statements 8.
- Fase 4 (quando >12% stmts): branches 50, functions 25, lines/statements 12.
- Fases posteriores serão definidas conforme curva de crescimento e hotspots restantes.

Os thresholds são deliberadamente inferiores ao baseline para evitar falsos negativos; baseline continua sendo a proteção anti-regressão verdadeira.

## Priorização de Áreas

Ordem aproximada de foco:

1. Utilitários críticos e infraestrutura (logging, validação, mapeadores, server-actions) – ALTA (feito em grande parte).
2. Fluxos de negócios sensíveis (assinaturas, fila, clientes, financeiro) – Em progresso.
3. Casos de erro e resiliência (retry, fallback, deduplicação) – Expandido parcialmente.
4. Componentes UI com lógica condicional (sistemas de notificação, formulários críticos).
5. Hooks de dados (cobrir estados de sucesso / erro / loading / paginação).
6. Ações não cobertas e rotas API auxiliares.

## Critérios para Subir Thresholds

Elevar somente quando:

- Build principal passou em duas execuções consecutivas sem regressão.
- Δ cobertura da última semana >= +0.3pp em statements.
- Novos testes adicionaram casos de erro (não apenas caminho feliz).

## Boas Práticas Adotadas

- UUIDs estáticos para remover dependência de APIs indisponíveis em ambiente de teste (ex: `crypto.randomUUID`).
- Mocks leves para eliminar flakiness (transitions/portals do MUI).
- Testes de logger isolados usando wrapper para não expor internals diretamente no código de produção.
- Pequenos testes direcionados a ramos críticos ao invés de tentar cobrir arquivos gigantes logo de início.

## Próximos Passos Planejados

- Refino final do logger (expor traceId factory para testes diretos se necessário).
- Cobertura de hooks adicionais (ex: use-\* ainda a 0%).
- Testes de error boundaries / páginas de erro.
- Introduzir testes de rotas API selecionadas (saúde, webhooks) via invocação direta das handlers.

## Política de Pull Requests

- PR que reduz cobertura falha no CI; deve adicionar testes compensatórios.
- Pequenos incrementos são aceitos; não há exigência de grandes saltos.
- Alterações de módulos críticos devem incluir pelo menos 1 teste de caminho de erro.

## FAQ Rápido

**Por que branches já altos versus statements baixos?** Foco inicial em lógica condicional (valor defensivo) antes de massificar cobertura em arquivos grandes.

**Quando abandonar abordagem incremental?** Quando indicadores chave (linhas/statements) passarem ~40% ou se backlog de risco baixo estiver quase todo coberto.

---

Manter este documento atualizado ao subir thresholds ou revisar prioridades.
