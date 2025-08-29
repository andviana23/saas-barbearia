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

## Próximas Evoluções

1. Implementar impersonação real no runner CRUD (JWT por role / claims).
2. Registrar resultado real (permitido/negado) e comparar com `allowed`.
3. Gerar relatório dif (`coverage/rls-report.json`) para auditoria.
4. Adicionar cobertura de casos negativos (tentativas de escalada de privilégio).
5. Versionar `coverage/rls-expected.json` e `coverage/rls-matrix.json` (exceção adicionada no `.gitignore`).
6. Refinar heurística anon: hoje assume SELECT permitido — avaliar tabela a tabela (ex: `api_keys` deve continuar totalmente negado).
7. Reativar `tests/rls.crud.test.ts` após implementação de execução real ou simulação consistente; remover `.skip`.
8. Adicionar script `rls:report` para gerar CSV/markdown usando `rls-expected-summary.js` e difs entre commits.
9. Flag de controle `RLS_CRUD_REAL=1` para habilitar execução real gradualmente (já suportada no runner – default é simulado).
10. Expandir `rls:report` para incluir coluna `allowedReal` (resultado observado) e sinalizar divergências: EXPECT_TRUE_BUT_DENIED / EXPECT_FALSE_BUT_ALLOWED.
11. Integrar `rls:report` ao CI (falhar pipeline em divergências críticas).

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

| Tipo                       | Significado                                                   |
| -------------------------- | ------------------------------------------------------------- |
| MISSING_POLICY_FOR_ALLOWED | Esperado acesso mas não há policy/operation derivada          |
| EXPECT_TRUE_BUT_DENIED     | (futuro) Execução real negou acesso esperado                  |
| EXPECT_FALSE_BUT_ALLOWED   | (futuro) Execução real permitiu acesso que deveria ser negado |

Exit code ≠ 0 quando existir pelo menos uma divergência listada para facilitar bloqueio em CI.

### Execuções Reais e allowedReal

Pipeline experimental:

1. Rodar testes CRUD em modo real: `RLS_CRUD_REAL=1 npm run rls:crud:test` (necessário `DATABASE_URL`).
2. Cada tentativa gera linha em `coverage/rls-exec-log.jsonl`.
3. Consolidar resultados no expected: `npm run rls:exec:merge` (preenche/atualiza campo `allowedReal`).
4. Gerar relatório: `npm run rls:report` (produz `coverage/rls-report.json` e `coverage/rls-report.md`).

Heurística de merge: se qualquer execução registrou sucesso para combinação, `allowedReal=true`, caso contrário `false`.

Próximo aprimoramento: armazenar contagens (success/fail) e latência média para cada combinação.

## Troubleshooting

| Sintoma                      | Causa Provável                                  | Ação                                              |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Matriz gerada com 0 tabelas  | Sem conexão DB ou sem policies                  | Verificar `DATABASE_URL` e SSL                    |
| Muitas combinações pendentes | Não rodou auto-classify                         | Executar `npm run rls:expected:auto`              |
| Falha em modo estrito        | Existe `allowed=null`                           | Classificar manualmente ou rodar auto-classify    |
| Roles ausentes               | Policy não usa has_role/role_assignments padrão | Adicionar parsing adicional ou classificar manual |

---

Documentação gerada automaticamente.
