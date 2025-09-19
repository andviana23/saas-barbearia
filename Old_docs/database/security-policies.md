# Políticas de Segurança (RLS) - SaaS Barbearia

## Visão Geral

O sistema implementa Row Level Security (RLS) para garantir que usuários acessem apenas os dados da unidade à qual pertencem.

## Funções de Segurança

### Função Original (Supabase)
```sql
CREATE OR REPLACE FUNCTION user_has_unit_access(unit_uuid uuid)
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

### Função Alternativa (PostgreSQL Local)
```sql
CREATE OR REPLACE FUNCTION user_has_unit_access_local(unit_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM unit_members 
        WHERE unit_members.unit_id = unit_uuid 
        AND unit_members.user_id = current_setting('app.current_user_id')::uuid
        AND unit_members.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Políticas por Tabela

### 1. Tabela `appointments`

**Política para usuários autenticados:**
```sql
CREATE POLICY auth_appointments_access_local ON appointments
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));
```

**Política para service_role:**
```sql
CREATE POLICY service_role_all_appointments ON appointments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

### 2. Tabela `services`

**Política para usuários autenticados:**
```sql
CREATE POLICY auth_services_access_local ON services
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));
```

**Política para service_role:**
```sql
CREATE POLICY service_role_all_services ON services
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

### 3. Tabela `customers`

**Política para usuários autenticados:**
```sql
CREATE POLICY auth_customers_access_local ON customers
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));
```

**Política para service_role:**
```sql
CREATE POLICY service_role_all_customers ON customers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

### 4. Tabela `units`

**Política para usuários autenticados:**
```sql
CREATE POLICY auth_units_access_local ON units
    FOR ALL TO authenticated
    USING (id IN (SELECT unit_id FROM unit_members WHERE user_id = current_setting('app.current_user_id')::uuid AND is_active = true))
    WITH CHECK (user_has_unit_access_local(id));
```

**Política para service_role:**
```sql
CREATE POLICY service_role_all_units ON units
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

## Configuração de Usuário para Ambiente Local

Para usar RLS em ambiente PostgreSQL local:

1. **Definir o usuário atual:**
```sql
SELECT set_current_user_id('seu-user-id-aqui');
```

2. **Verificar acesso:**
```sql
SELECT user_has_unit_access_local('unit-id-aqui');
```

3. **Testar acesso a dados:**
```sql
SELECT * FROM services; -- Respeitará RLS local
```

## Roles (Papéis) do Sistema

### `authenticated`
- Usuários autenticados do sistema
- Acesso limitado aos dados da unidade
- Respeita todas as políticas RLS

### `service_role`
- Role administrativo do sistema
- Acesso completo a todos os dados
- Bypass de políticas RLS
- Usado para operações administrativas

## Melhores Práticas

1. **Sempre teste RLS** antes de implantar
2. **Use índices** nas colunas usadas em políticas
3. **Documente mudanças** em políticas de segurança
4. **Teste com diferentes roles** (authenticated vs service_role)
5. **Monitore performance** de queries com RLS habilitado

## Troubleshooting

### Problemas Comuns

1. **"permission denied" ao acessar tabelas:**
   - Verifique se RLS está habilitado
   - Confirme que o usuário tem política adequada
   - Teste com `service_role` para isolar problema

2. **Função `auth.uid()` não existe:**
   - Use `user_has_unit_access_local()` para PostgreSQL local
   - Configure `current_setting('app.current_user_id')`

3. **Nenhum dado retornado:**
   - Verifique se o usuário é membro da unidade
   - Confirme `is_active = true` em `unit_members`
   - Teste a função de segurança diretamente