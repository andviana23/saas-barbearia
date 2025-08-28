# Baseline de Cobertura (CI)

Data inicial: (atualizar conforme commit)

Snapshot (global):

- Statements: 4.40%
- Lines: 4.40%
- Branches: 38.84%
- Functions: 17.02%
- Test Suites: 24
- Tests: 132

Thresholds atuais em `jest.config.ci.js`:

```js
coverageThreshold: {
  global: { branches: 30, functions: 10, lines: 3, statements: 3 }
}
```

Racional:

- Valores configurados ligeiramente abaixo/ao redor do baseline real para permitir pipeline verde imediato.
- Branches já relativamente alto devido a concentração de testes em módulos específicos.
- Linhas/Statements muito baixos porque grande parte do código (UI + actions extensas) ainda não tem testes.

Estratégia de Incremento Gradual:

1. Congelar baseline: não reduzir cobertura em PRs (monitor via relatório de PR / future script).
2. Focar próximos aumentos em módulos críticos:
   - `src/lib/server-actions.ts` (já parcialmente coberto) → levar Lines >80%.
   - `src/lib/logging` (expandir casos de erro / edge) → Lines >70%.
   - `src/services/assinaturas/*` já alto; pode servir de modelo.
3. Após cada bloco subir, ajustar thresholds globais apenas quando forem sustentáveis (ex: elevar statements/lines para 6% depois de +10–15 arquivos cobertos).
4. Introduzir thresholds por pasta (opcional) quando cobertura das áreas críticas estabilizar.
5. Evitar retrocessos: script opcional pode comparar `coverage-summary.json` atual vs último commit na main.

Checklist Próximos Passos (sugestões):

- [ ] Adicionar testes unit para cenários de falha em `actionLogger` (ex: captura de erro Sentry ausente).
- [ ] Cobrir fluxos negativos adicionais em `subscriptions.ts`.
- [ ] Adicionar testes para pelo menos 1 componente UI complexo (ex: `NotificationSystem.tsx`) usando React Testing Library.
- [ ] Criar script de verificação incremental (ex: `scripts/verify-coverage.js`).

Como Atualizar Este Documento:

- Após elevar thresholds, ajustar a seção de thresholds e snapshot.
- Manter histórico resumido (changelog) abaixo.

Histórico:

- v1: Baseline inicial registrado.

---

Gerado automaticamente como apoio ao plano de aumento de cobertura.
