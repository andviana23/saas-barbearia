# Guia de Migrações - SaaS Barbearia

## Visão Geral

As migrações são gerenciadas pelo Supabase CLI e localizadas em `/supabase/migrations/`. Este guia explica como criar, aplicar e gerenciar migrações.

## Comandos do Supabase CLI

### Iniciar Supabase Local
```bash
supabase start
```

### Parar Supabase Local
```bash
supabase stop
```

### Criar Nova Migração
```bash
supabase migration new nome_da_migracao
```

### Aplicar Migrações
```bash
supabase db reset
```

### Status das Migrações
```bash
supabase migration list
```

## Estrutura de uma Migração

### Exemplo de Migração de Criação de Tabela
```sql
-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_units_is_active" ON "units"("is_active");

-- AddTrigger
CREATE TRIGGER "trg_units_updated_at" BEFORE UPDATE ON "units" FOR EACH ROW EXECUTE FUNCTION "update_updated_at_column"();
```

### Exemplo de Migração com RLS
```sql
-- Enable RLS
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;

-- Create Policy
CREATE POLICY "auth_services_access" ON "services" 
    FOR ALL TO "authenticated" 
    USING ("user_has_unit_access"("unit_id")) 
    WITH CHECK ("user_has_unit_access"("unit_id"));

-- Create Policy for service_role
CREATE POLICY "service_role_all_services" ON "services" 
    FOR ALL TO "service_role" 
    USING (true) 
    WITH CHECK (true);
```

## Boas Práticas

### 1. Nomenclatura
- Use nomes descritivos: `create_services_table`, `add_price_to_services`
- Evite: `migration1`, `alter_table`, `update`

### 2. Ordem de Execução
- Criar tabelas antes de referências (FK)
- Criar índices após tabelas
- Adicionar RLS por último

### 3. Reversibilidade
- Sempre teste migrações em ambiente de desenvolvimento
- Mantenha backup antes de aplicar em produção
- Documente mudanças complexas

### 4. Exemplos por Tipo

#### Adicionar Coluna
```sql
-- AlterTable
ALTER TABLE "services" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 30;
```

#### Criar Relacionamento
```sql
-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_unit_id_fkey" 
    FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Criar Função
```sql
-- CreateFunction
CREATE OR REPLACE FUNCTION "user_has_unit_access"("unit_uuid" uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM unit_members 
        WHERE unit_members.unit_id = unit_uuid 
        AND unit_members.user_id = auth.uid()
        AND unit_members.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Troubleshooting

### Migração Falhou
1. **Verifique logs:**
   ```bash
   supabase services
   ```

2. **Verifique conflitos:**
   ```bash
   supabase migration list
   ```

3. **Reset se necessário:**
   ```bash
   supabase db reset
   ```

### Erros Comuns

1. **"relation does not exist"**
   - Crie tabelas na ordem correta
   - Use IF EXISTS/IF NOT EXISTS

2. **"column does not exist"**
   - Adicione colunas antes de usar em políticas
   - Verifique ordem das migrações

3. **"function does not exist"**
   - Crie funções antes de usá-las
   - Verifique schema (public vs auth)

## Ambiente de Desenvolvimento Local

### Usar com PostgreSQL Docker

Para desenvolvimento com PostgreSQL local (sem Supabase):

1. **Criar container:**
   ```bash
   docker run --name postgres-barbearia -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

2. **Aplicar schema:**
   ```bash
   docker exec -i postgres-barbearia psql -U postgres -d postgres < schema.sql
   ```

3. **Configurar RLS local:**
   ```bash
   docker exec -i postgres-barbearia psql -U postgres -d postgres < fix-rls-local.sql
   ```

### Diferenças entre Supabase e PostgreSQL Local

| Feature | Supabase | PostgreSQL Local |
|---------|----------|------------------|
| auth.uid() | ✅ Nativo | ❌ Não existe |
| RLS automático | ✅ | ⚠️ Manual |
| Políticas prontas | ✅ | ❌ Custom |
| Service Role | ✅ | ✅ |

## Checklist de Migração

- [ ] Migração criada com nome descritivo
- [ ] Testada em ambiente de desenvolvimento
- [ ] RLS configurado (se aplicável)
- [ ] Índices criados
- [ ] Triggers configurados
- [ ] Documentação atualizada
- [ ] Backup criado (produção)
- [ ] Testes de integração passando