# Automação de RLS

Fluxo implementado para mapear e validar políticas Row Level Security.

## Visão Geral

1. `npm run rls:generate` conecta no Postgres (usa `DATABASE_URL` ou `SUPABASE_DB_URL`) e:
   - Gera introspecção simples (`db/rls-introspect.js`) listando tabelas com RLS.
   - Gera matriz detalhada (`coverage/rls-matrix.json`) lendo `pg_policies` e derivando operações CRUD.
2. `npm run rls:expected:sync` sincroniza `coverage/rls-expected.json` adicionando combinações novas (allowed=null).
3. `npm run rls:expected:auto` aplica heurística inicial (public=false, demais roles=true) para não ficar tudo pendente.
4. Teste `tests/rls.expected.test.ts` em modo estrito (`RLS_EXPECTED_STRICT=1`) garante que não restem combinações com `allowed=null`.
5. Teste `tests/rls.crud.test.ts` (placeholder) consumirá futuramente cada combinação decidida tentando executar operação real ou simulada.

## Roles Extraídas

O gerador analisa `using`/`with_check` das policies e extrai roles semânticos de padrões:

- `has_role(unit_id, ARRAY['admin','manager'])` → admin, manager
- `r.code = 'professional'` → professional
  Esses roles são adicionados ao array de roles para facilitar classificação.

## Scripts

| Script                 | Descrição                                              |
| ---------------------- | ------------------------------------------------------ |
| `rls:generate`         | Introspecção + matriz real via banco                   |
| `rls:generate:offline` | Varre migrations (se contiverem `CREATE POLICY`)       |
| `rls:expected:sync`    | Atualiza/gera expected com novas combinações pendentes |
| `rls:expected:auto`    | Classificação heurística inicial                       |
| `rls:expected:check`   | Valida modo estrito (sem pendências)                   |
| `rls:crud:test`        | Executa sync e roda teste placeholder CRUD             |

## Arquivos Gerados

- `coverage/rls-matrix.json` – Estrutura: `{ generatedAt, tables: [ { table, policies:[...], operations:[{role,operation,sourcePolicy}] } ] }`.
- `coverage/rls-expected.json` – Lista plana: `[ { table, role, operation, allowed } ]`.

## Pipeline Recomendado

Adicionar ao CI (exemplo):

```
"ci": "npm run lint && npm run type-check && npm run test:unit && npm run rls:expected:check"
```

Certifique-se de definir `DATABASE_URL` no ambiente do CI (somente leitura necessária).

## Classificação Manual

Editar `coverage/rls-expected.json`:

- Define `allowed=true` se a role deve conseguir a operação.
- Define `allowed=false` se deve ser negada.
- Mantém histórico – novas combinações serão adicionadas (não sobrescreve decisões). Use controle de versão.

## Evoluções & Status

| #   | Item                                                                 | Status                              |
| --- | -------------------------------------------------------------------- | ----------------------------------- |
| 1   | Implementar impersonação real (SET LOCAL ROLE / JWT)                 | Parcial (SET ROLE opcional via env) |
| 2   | Registrar resultado real (permitido/negado) e comparar com `allowed` | Concluído                           |
| 3   | Gerar relatório dif (`coverage/rls-report.json` / `.md`)             | Concluído                           |
| 4   | Casos negativos adicionais (escalada de privilégio)                  | Pendente                            |
| 5   | Versionar `rls-expected.json` e `rls-matrix.json`                    | Concluído (exceção de ignore)       |
| 6   | Refinar heurística anon (granular por tabela)                        | Pendente                            |
| 7   | Reativar `tests/rls.crud.test.ts` (modo real)                        | Parcial (simulação + real opcional) |
| 8   | Script `rls:report` com Markdown                                     | Concluído                           |
| 9   | Flag `RLS_CRUD_REAL` para execução real                              | Concluído                           |
| 10  | Coluna `allowedReal` e divergências EXPECT\_\*                       | Concluído                           |
| 11  | Fail em CI por divergências críticas                                 | Concluído (flags configuráveis)     |
| 12  | Métricas (latência média, contadores success/fail)                   | Concluído                           |
| 13  | Workflow GitHub Actions auditoria diária                             | Concluído                           |
| 14  | Fail modes configuráveis (ANY / REAL / NONE)                         | Concluído                           |

Itens novos sugeridos: 15. Exportar série temporal de variação de políticas (snapshot diário).  
16. Validar cardinalidade de políticas por tabela (alertar se reduzir sem justificativa).  
17. Adicionar modo "DRY-RUN" para simular merge sem alterar `rls-expected.json`.

### Execução Real Controlada

Por padrão o runner (`executeCrud`) permanece em modo simulado para evitar dependência de banco local. Para habilitar tentativa real (apenas SELECT inicialmente):

```powershell
$env:RLS_CRUD_REAL="1"; $env:DATABASE_URL="postgres://user:pass@host:5432/db"; npm run rls:crud:test
```

Próximas fases da execução real:

1. SELECT: verificação de acesso base.
2. INSERT: dentro de transação + ROLLBACK usando `DEFAULT VALUES` ou colunas mínimas.
3. UPDATE/DELETE: consultas noop (`WHERE 1=0`) apenas para testar policy sem afetar dados.
4. Impersonação: `SET LOCAL ROLE <role>` ou conexão distinta / JWT Supabase (avaliar viabilidade conforme ambiente).

### Relatório de Divergências (`rls:report`)

Script inicial (`npm run rls:report`) compara somente expectativas `allowed=true` contra presença de operação na matriz. Futuro: incluir execução real e gerar status:

| Tipo                       | Significado                                          |
| -------------------------- | ---------------------------------------------------- |
| MISSING_POLICY_FOR_ALLOWED | Esperado acesso mas não há policy/operation derivada |
| EXPECT_TRUE_BUT_DENIED     | Execução real negou acesso esperado                  |
| EXPECT_FALSE_BUT_ALLOWED   | Execução real permitiu acesso que deveria ser negado |

Fail Modes (ordem de severidade):

- `ANY` (default) – falha se existir qualquer divergência (inclui heurística / ausência de policy).
- `REAL` – falha somente se houver divergência baseada em execução real (`EXPECT_*`).
- `NONE` – nunca falha (modo somente observação / auditoria passiva).

Configuração:

```
npm run rls:report -- --fail-on=REAL
# ou
RLS_REPORT_FAIL_ON=real npm run rls:report
```

Exit code ≠ 0 quando existir pelo menos uma divergência listada para facilitar bloqueio em CI.

### Execuções Reais, Métricas e `allowedReal`

Pipeline:

1. Rodar testes CRUD em modo real: `RLS_CRUD_REAL=1 npm run rls:crud:test` (necessário `DATABASE_URL`).
2. Cada tentativa gera linha JSONL em `coverage/rls-exec-log.jsonl` com campos:

- `success`, `error`, `durationMs`, `impersonated`, `impersonationError`.

3. Consolidar resultados: `npm run rls:exec:merge` – atualiza `allowedReal` e adiciona bloco `realStats`:

```json
{
  "successCount": 3,
  "failureCount": 1,
  "avgDurationMs": 12.5,
  "lastMergedAt": "2025-08-28T03:00:00.000Z"
}
```

4. Gerar relatório: `npm run rls:report` (gera JSON + Markdown) com contagem de divergências reais.
5. (Opcional) Ciclo encadeado: `npm run rls:real:cycle` ou `npm run rls:real:cycle:imp` (com impersonação).

Heurística de merge: se qualquer execução registrou `success=true` para a combinação, `allowedReal=true`, senão `false`. Estatísticas agregadas são mantidas em `realStats` (não resetar manualmente para preservar histórico incremental — o merge sobrescreve sempre com agregados recalculados do log atual).

Impersonação opcional: defina `RLS_CRUD_IMPERSONATE=1` para tentar `SET LOCAL ROLE <role>`. Falhas são registradas em `impersonationError` sem abortar a tentativa.

Fail após ciclo real (considerando apenas divergência real):

```
npm run rls:real:cycle               # fail-on REAL aplicado no script
RLS_REPORT_FAIL_ON=none npm run rls:real:cycle  # apenas coleta sem falhar
```

Workflow GitHub Actions (`.github/workflows/rls-real-audit.yml`) executa diariamente:

1. Instala dependências.
2. Executa ciclo real com impersonação.
3. Publica artefatos `rls-exec-log.jsonl`, `rls-expected.json`, `rls-report.(json|md)`.
4. Commita mudanças em `allowedReal` se houver.

Segredo necessário: `RLS_AUDIT_DATABASE_URL` (apenas leitura recomendada / ambiente isolado).

### Modo Dry-Run do Merge

Para inspecionar o impacto de novas execuções sem alterar `rls-expected.json`:

```
npm run rls:exec:merge -- --dry-run
RLS_EXEC_MERGE_DRY=1 npm run rls:exec:merge
```

Mostra contagem de atualizações e até 10 diferenças de `allowedReal` previstas.

## Troubleshooting

| Sintoma                      | Causa Provável                                  | Ação                                              |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Matriz gerada com 0 tabelas  | Sem conexão DB ou sem policies                  | Verificar `DATABASE_URL` e SSL                    |
| Muitas combinações pendentes | Não rodou auto-classify                         | Executar `npm run rls:expected:auto`              |
| Falha em modo estrito        | Existe `allowed=null`                           | Classificar manualmente ou rodar auto-classify    |
| Roles ausentes               | Policy não usa has_role/role_assignments padrão | Adicionar parsing adicional ou classificar manual |

---

Documentação gerada automaticamente.
