# Regras de Implementação - SaaS Barbearia

## Fluxo Oficial de Desenvolvimento de Banco de Dados com Supabase

### 1. Criação de Migrations

**Regra Fundamental:** Todas as alterações de schema (tabelas, colunas, índices, RLS etc.) devem ser feitas via arquivos `.sql` dentro de `supabase/migrations/`.

- ✅ **PERMITIDO**: Criar arquivos de migration em `supabase/migrations/`
- ❌ **PROIBIDO**: Alterar diretamente o banco de produção
- ❌ **PROIBIDO**: Executar comandos SQL manuais na nuvem sem estar em migration

### 2. Ambiente Local com Docker

**Comando obrigatório:** Sempre rodar o Supabase local com:

```bash
npx supabase start
```

**Para aplicar e testar todas as migrations do zero:**

```bash
npx supabase db reset
```

**Verificação obrigatória:** Conferir as tabelas e regras no Studio local antes de prosseguir.

### 3. Validação Obrigatória

Toda migration deve ser:

- ✅ Testada localmente
- ✅ Validada quanto à integridade
- ✅ Validada quanto às constraints
- ✅ Validada quanto ao RLS (Row Level Security)
- ✅ Testada com inserts de exemplo

**Regra:** Só após aprovação local, a alteração pode ser considerada estável.

### 4. Deploy na Nuvem

**Comando para produção:** Apenas após validação local completa:

```bash
npx supabase db push
```

**Regras de segurança:**

- ❌ Nunca executar comandos SQL manuais na nuvem
- ❌ Nunca fazer push sem validação local prévia

### 5. Política de Rollback

**Em caso de erro em produção:**

1. Criar imediatamente uma nova migration de rollback
2. Exemplo: `006_rollback_nome_tabela.sql`
3. ❌ **NUNCA** apagar migrations antigas
4. ❌ **NUNCA** editar migrations existentes

### 6. Checklist Obrigatório Antes do Push

Antes de executar `npx supabase db push`, verificar:

- [ ] 1. Criar migration no repositório
- [ ] 2. Rodar `npx supabase db reset` e validar no ambiente local
- [ ] 3. Revisar e confirmar integridade dos dados de teste
- [ ] 4. Validar RLS e permissões
- [ ] 5. **SOMENTE ENTÃO** rodar `npx supabase db push`

### 7. Convenções de Nomenclatura

**Migrations:**

- Formato: `XXX_descricao_da_alteracao.sql`
- Exemplo: `005_produtos_vendas.sql`
- Sempre usar numeração sequencial

**Rollbacks:**

- Formato: `XXX_rollback_nome_tabela.sql`
- Exemplo: `006_rollback_produtos_vendas.sql`

### 8. Estrutura de Arquivos

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_auth_setup.sql
│   ├── 003_unidades_profiles.sql
│   ├── 004_servicos_agendamentos.sql
│   └── 005_produtos_vendas.sql
└── config.toml
```

### 9. Padrões de Validação (conforme PADROES_VALIDACAO.md)

**Integração com Schemas Zod:**

- Validações de frontend devem estar alinhadas com constraints do banco
- Usar schemas TypeScript gerados a partir das migrations
- Manter consistência entre validação client-side e server-side

**ActionResult Pattern:**

```typescript
interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  errors?: ValidationError[]
}
```

### 10. Fluxo de Desenvolvimento Completo

1. **Análise:** Identificar necessidade de alteração no banco
2. **Migration:** Criar arquivo `.sql` em `supabase/migrations/`
3. **Reset Local:** `npx supabase db reset`
4. **Validação:** Testar no Studio local
5. **Schemas:** Atualizar schemas Zod se necessário
6. **Actions:** Criar/atualizar Server Actions
7. **Hooks:** Criar/atualizar React Query hooks
8. **Deploy:** `npx supabase db push` após todas as validações

### 11. Tratamento de Erros

**Em desenvolvimento:**

- Sempre verificar logs do Supabase local
- Validar RLS policies com diferentes tipos de usuário
- Testar constraints e foreign keys

**Em produção:**

- Monitorar logs após deploy
- Ter migration de rollback pronta
- Documentar problemas encontrados

---

**⚠️ IMPORTANTE:** Este fluxo é obrigatório para manter a consistência e segurança do banco de dados. Qualquer desvio deve ser documentado e aprovado pela equipe.
