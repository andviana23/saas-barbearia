# OPERACOÇÕES DE BANCO DE DADOS

Guia prático para migrações, seeds, rollback lógico e boas práticas de naming no projeto.

## Visão Geral

| Componente | Local                       | Responsável                         | Tracking                           |
| ---------- | --------------------------- | ----------------------------------- | ---------------------------------- |
| Migrações  | `supabase/migrations/*.sql` | Runner Node (`db/migrate-fixed.js`) | Tabela `public.migrations_history` |
| Seeds      | `db/seeds/*.sql`            | Runner Node (`db/run-seeds.js`)     | Tabela `public.seed_history`       |

## 1. Migrações

Script principal: `npm run db:migrate`

### Comandos

| Ação                        | Comando                       | Descrição                                                                               |
| --------------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| Aplicar pendentes           | `npm run db:migrate`          | Executa apenas arquivos ainda não registrados (por `filename`)                          |
| Status                      | `npm run db:status`           | Lista APLICADA / PENDENTE + checksum curto                                              |
| Baseline                    | `npm run db:migrate:baseline` | Registra todos os arquivos como aplicados sem executar SQL (usar em DB já provisionado) |
| Forçar reaplicar divergente | `npm run db:migrate:force`    | Re-executa arquivos cujo checksum mudou                                                 |
| Checar em CI                | `npm run db:migrate:check`    | Falha se existir pendente ou divergente                                                 |

### Naming Convention

`YYYYMMDDHHMM_descricao_curta.sql`

Regras:

1. Data/hora UTC (evita colisão local)
2. Verbos no infinitivo curto: `add`, `create`, `alter`, `drop` (quando inevitável)
3. Evitar acentos e espaços; usar underscore
4. Uma unidade lógica por arquivo (não misturar criação de tabela e índices não relacionados)

### Fluxo de Criação

1. Criar arquivo em `supabase/migrations/`
2. Rodar localmente: `npm run db:migrate` (ou `--status` antes)
3. Commit + PR
4. Pipeline executa `db:migrate:check` garantindo que a migração foi aplicada manualmente (ou baseline) antes de merge em ambientes já existentes.

### Divergência

Se um arquivo já aplicado for alterado, o checksum mudará e o runner exigirá `--force`.

Boas práticas:

- Preferir nova migração para alterações pós-merge
- Usar `--force` apenas em desenvolvimento ou antes de a migração chegar a ambientes compartilhados

### Rollback (Estratégia)

Não há rollback automático. Para desfazer:

1. Criar nova migração reversa (ex: remover coluna recém-adicionada)
2. Evitar `DROP` destrutivo sem backup lógico (`scripts/backup/*`)
3. Para hotfix crítico: gerar backup → aplicar migração corretiva → validar → documentar no relatório de status

## 2. Seeds

Script: `npm run db:seed`

Características:

- Ordem alfanumérica
- Checksum md5 por arquivo
- Reaplicação automática se conteúdo mudar
- Transação por arquivo (atomicidade isolada)

### Comandos

| Ação       | Comando               | Descrição                                |
| ---------- | --------------------- | ---------------------------------------- |
| Aplicar    | `npm run db:seed`     | Executa pendentes e reaplica modificados |
| Dev rápido | `npm run db:seed:dev` | Alias com `NODE_ENV=development`         |

### Naming & Escopo

`YYYYMMDD_<descricao>.sql` para conjuntos novos. Arquivos sem prefixo de data (`base-seed.sql`) devem conter apenas dados essenciais idempotentes e raramente mudar.

Separar por camadas:

- Base (roles, feature flags, unidade inicial)
- Demo (clientes, serviços, profissionais, planos)
- Amostras analíticas / métricas sintéticas

### Boas Práticas

1. Sempre usar `ON CONFLICT DO NOTHING` ou `WHERE NOT EXISTS` em inserts base
2. Não depender de IDs estáticos gerados se a tabela usa `uuid_generate_v4()` – prefira buscar por chaves naturais (ex: `code`)
3. Dados de demonstração devem ser claramente marcados (ex: unidades nome `DEMO`)

## 3. Verificação em CI

Script `scripts/db/check-migrations.js` verifica:

- Arquivos pendentes (existem no FS mas não na tabela)
- Divergência de checksum

Uso em pipeline: executar após export de `DATABASE_URL` apontando para ambiente de staging / shadow.

Exit codes:

- 0: OK
- 1: Pendentes
- 2: Divergentes
- 3: Erro inesperado

## 4. Troubleshooting

| Sintoma                                        | Causa Provável                | Ação                                                                     |
| ---------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `Diretório supabase/migrations não encontrado` | Path incorreto                | Confirmar execução na raiz do repo                                       |
| `Defina DATABASE_URL`                          | Variável ausente              | Exportar `DATABASE_URL` ou usar `.env`                                   |
| Divergente sem reaplicar                       | Arquivo editado pós-aplicação | Criar nova migração ou usar `--force` (dev)                              |
| Seed falha no meio                             | Constraint / FK               | Ajustar ordem ou adicionar `DEFERRABLE INITIALLY DEFERRED` se apropriado |
| Tabela histórica vazia                         | Nunca rodou runner            | Executar `db:migrate:baseline` primeiro em DB pré-existente              |

## 5. Padrões SQL Recomendados

1. Sempre incluir `created_at timestamptz DEFAULT now() NOT NULL`
2. Usar trigger de `updated_at` central para colunas mutáveis
3. Prefixar índices multi-coluna significativos: `idx_<tabela>_<coluna>[_coluna]`
4. Policies RLS: START com SELECT restrito por `unit_id`, depois INSERT/UPDATE/DELETE
5. Evitar funções plpgsql anônimas em migrações (difícil versionar); usar `CREATE OR REPLACE FUNCTION`

## 6. Checklist Antes de Merge

[] `npm run db:status` sem pendentes
[] Nenhum arquivo alterado historicamente (ou nova migração criada)
[] Seeds críticas aplicam sem erro (`npm run db:seed`)
[] Nenhum `DROP` irreversível sem backup lógico recente
[] Policies RLS para nova tabela criadas (se multi-tenant)

---

Manter este documento atualizado ao introduzir novos scripts ou políticas.
